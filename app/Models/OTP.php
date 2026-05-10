<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OTP extends Model
{
    use HasFactory;

    protected $table = 'otps';

    protected $fillable = [
        'user_id',
        'email',
        'code',
        'attempts',
        'blocked_until',
        'resend_count',
    ];

    protected function casts(): array
    {
        return [
            'blocked_until' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'resend_count' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->created_at->addMinutes(10) < now();
    }

    public function isBlocked(): bool
    {
        return $this->blocked_until && $this->blocked_until > now();
    }

    public function canAttempt(): bool
    {
        return ! $this->isBlocked() && ! $this->isExpired() && $this->attempts < 3;
    }

    public function incrementAttempt(): void
    {
        $this->increment('attempts');

        if ($this->attempts >= 3) {
            $this->update(['blocked_until' => now()->addHours(24)]);
        }
    }

    public static function getLatestForEmail(string $email)
    {
        return static::where('email', $email)
            ->orderBy('id', 'desc')
            ->first();
    }

    public static function checkRateLimit(string $email): array
    {
        $otpRecord = static::getLatestForEmail($email);

        if (! $otpRecord) {
            return ['canSend' => true];
        }

        if ($otpRecord->isBlocked()) {
            $remainingTime = $otpRecord->blocked_until->diffInSeconds(now());

            return [
                'canSend' => false,
                'reason' => 'too_many_attempts',
                'blockedUntil' => $otpRecord->blocked_until,
                'remainingSeconds' => max(0, $remainingTime),
            ];
        }

        if ($otpRecord->isExpired()) {
            return ['canSend' => true];
        }

        if ($otpRecord->attempts >= 3) {
            return [
                'canSend' => false,
                'reason' => 'max_attempts_reached',
                'blockedUntil' => $otpRecord->blocked_until,
            ];
        }

        return ['canSend' => true, 'attempts' => $otpRecord->attempts];
    }
}
