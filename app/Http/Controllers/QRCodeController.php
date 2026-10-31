<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterQRCodeRequest;
use App\Models\QRCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode as QrCodeGenerator;

class QRCodeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            $qrCodes = QRCode::with(['agent', 'user'])->latest()->get();
        } elseif ($user->isAgent()) {
            $qrCodes = QRCode::with('user')->where('agent_id', $user->id)->latest()->get();
        } else {
            $qrCodes = QRCode::where('user_id', $user->id)->latest()->get();
        }

        return response()->json($qrCodes);
    }

    public function store(RegisterQRCodeRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $userImagePath = null;
        if ($request->hasFile('user_image')) {
            $userImagePath = $request->file('user_image')->store('qr-codes/users', 'public');
        }

        $itemImagePath = null;
        if ($request->hasFile('item_image')) {
            $itemImagePath = $request->file('item_image')->store('qr-codes/items', 'public');
        }

        $qrCode = QRCode::create([
            'qr_code' => $validated['qr_code'] ?? (string) Str::uuid(),
            'agent_id' => $user->isAgent() ? $user->id : null,
            'user_id' => $user->isUser() ? $user->id : null,
            'item_name' => $validated['item_name'],
            'category' => $validated['category'] ?? null,
            'item_description' => $validated['item_description'] ?? null,
            'emergency_message' => $validated['emergency_message'] ?? null,
            'contact_name' => $validated['contact_name'],
            'contact_email' => $validated['contact_email'],
            'contact_phone' => $validated['contact_phone'],
            'address' => $validated['address'] ?? null,
            'user_image_path' => $userImagePath,
            'item_image_path' => $itemImagePath,
            'registration_timestamp' => now(),
        ]);

        $qrCodeImagePath = 'qr-codes/'.Str::uuid().'.svg';
        try {
            $qrCodeContent = QrCodeGenerator::format('svg')
                ->size(400)
                ->generate(url('/qr-view/'.rawurlencode($qrCode->qr_code)));

            if (! Storage::disk('public')->put($qrCodeImagePath, $qrCodeContent)) {
                throw new \RuntimeException('Unable to save the generated QR code image.');
            }
        } catch (\Throwable $exception) {
            $qrCode->delete();
            Storage::disk('public')->delete(array_filter([$userImagePath, $itemImagePath, $qrCodeImagePath]));

            throw $exception;
        }

        $qrCode->update(['qr_code_image_path' => $qrCodeImagePath]);

        return response()->json([
            'message' => 'QR Code registered successfully',
            'data' => $qrCode->load(['agent', 'user']),
        ], 201);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'qr_code' => 'required|string|max:255',
        ]);

        $available = ! QRCode::where('qr_code', $validated['qr_code'])->exists();

        return response()->json([
            'available' => $available,
            'message' => $available
                ? 'QR code is available to register.'
                : 'This QR code is already registered.',
        ], $available ? 200 : 409);
    }

    public function show($id)
    {
        $qrCode = QRCode::with(['agent', 'user'])->findOrFail($id);

        $user = Auth::user();
        if ($user && $user->isUser() && $qrCode->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($qrCode);
    }

    public function update(Request $request, $id)
    {
        $qrCode = QRCode::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'item_name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|nullable|string|max:100',
            'contact_name' => 'sometimes|required|string|max:255',
            'contact_email' => 'sometimes|required|email',
            'contact_phone' => 'sometimes|required|string',
            'status' => 'sometimes|in:active,inactive,found',
            'emergency_message' => 'sometimes|nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $qrCode->update($request->all());

        return response()->json($qrCode);
    }

    public function destroy($id)
    {
        $qrCode = QRCode::findOrFail($id);

        if ($qrCode->user_image_path) {
            Storage::disk('public')->delete($qrCode->user_image_path);
        }
        if ($qrCode->item_image_path) {
            Storage::disk('public')->delete($qrCode->item_image_path);
        }
        if ($qrCode->qr_code_image_path) {
            Storage::disk('public')->delete($qrCode->qr_code_image_path);
        }

        $qrCode->delete();

        return response()->json(['message' => 'QR Code deleted successfully']);
    }

    public function getByQRCode($qrCode)
    {
        $qrCode = QRCode::with(['agent', 'user'])
            ->where('qr_code', $qrCode)
            ->firstOrFail();

        return response()->json($qrCode);
    }

    public function showPublic($identifier)
    {
        $qrCode = QRCode::where('qr_code', $identifier)->first();

        if (! $qrCode && ctype_digit((string) $identifier)) {
            $qrCode = QRCode::find($identifier);
        }

        abort_unless($qrCode, 404);

        $viewer = Auth::guard('sanctum')->user();

        return response()->json([
            ...$qrCode->load(['agent', 'user'])->toArray(),
            'is_owner' => $viewer && $qrCode->user_id === $viewer->id,
        ]);
    }

    public function myQRCodes()
    {
        $user = Auth::user();
        $qrCodes = QRCode::where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json($qrCodes);
    }
}
