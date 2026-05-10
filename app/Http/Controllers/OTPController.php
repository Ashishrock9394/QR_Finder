<?php

namespace App\Http\Controllers;

use App\Jobs\SendOTPJob;
use App\Models\OTP;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OTPController extends Controller
{
    public function sendOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $email = $request->email;
        $user = User::where('email', $email)->first();
        $latestOtp = OTP::getLatestForEmail($email);

        if ($latestOtp && ! $latestOtp->isExpired() && $latestOtp->resend_count >= 1) {
            return response()->json([
                'error' => 'You can only resend OTP once. Please try again after the existing code expires.',
                'remaining_resends' => 0,
            ], 429);
        }

        // Check rate limiting
        $rateLimitCheck = OTP::checkRateLimit($email);

        if (! $rateLimitCheck['canSend']) {
            $message = 'Too many OTP requests. ';

            if ($rateLimitCheck['reason'] === 'too_many_attempts') {
                $remainingHours = ceil($rateLimitCheck['remainingSeconds'] / 3600);
                $message .= "Please try again in {$remainingHours} hour(s).";
            } else {
                $message .= 'Please try again later.';
            }

            return response()->json([
                'error' => $message,
                'blocked_until' => $rateLimitCheck['blockedUntil'] ?? null,
            ], 429);
        }

        // Generate 6-digit OTP code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $resendCount = 0;

        if ($latestOtp && ! $latestOtp->isExpired()) {
            $resendCount = $latestOtp->resend_count + 1;
        }

        // Create OTP record
        $otp = OTP::create([
            'user_id' => $user->id,
            'email' => $email,
            'code' => $code,
            'attempts' => 0,
            'resend_count' => $resendCount,
        ]);

        // Dispatch job to send OTP via email queue
        SendOTPJob::dispatch($otp);

        return response()->json([
            'message' => 'OTP sent successfully to your email',
            'expires_in_minutes' => 10,
            'remaining_resends' => $resendCount >= 1 ? 0 : 1,
        ]);
    }

    public function verifyOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Get latest OTP for email
        $otpRecord = OTP::where('email', $request->email)
            ->orderBy('id', 'desc')
            ->first();

        if (! $otpRecord) {
            return response()->json(['error' => 'No OTP found. Please request a new one.'], 401);
        }

        // Check if blocked
        if ($otpRecord->isBlocked()) {
            $remainingHours = ceil($otpRecord->blocked_until->diffInSeconds(now()) / 3600);

            return response()->json([
                'error' => "Too many failed attempts. Please try again in {$remainingHours} hour(s).",
                'blocked_until' => $otpRecord->blocked_until,
            ], 429);
        }

        // Check if expired
        if ($otpRecord->isExpired()) {
            return response()->json([
                'error' => 'OTP has expired. Please request a new one.',
            ], 401);
        }

        // Verify OTP code
        if ($otpRecord->code !== $request->otp) {
            $otpRecord->incrementAttempt();

            $attemptsLeft = 3 - $otpRecord->attempts;

            return response()->json([
                'error' => 'Invalid OTP.',
                'attempts_left' => max(0, $attemptsLeft),
            ], 401);
        }

        // OTP verified successfully
        $user = $otpRecord->user;

        if (! $user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        $tokenResult = $user->createToken('auth-token');
        $token = $tokenResult->plainTextToken;

        // Update last activity timestamp
        $user->tokens()->latest()->first()->update([
            'last_activity' => now(),
        ]);

        // Delete the used OTP
        $otpRecord->delete();

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }
}
