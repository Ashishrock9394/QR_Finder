<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecoveryLog extends Model
{
    protected $fillable = [
        'qr_code_id',
        'visitor_user_id',
        'visitor_name',
        'visitor_phone',
        'details',
        'ip_address',
    ];

    public function qrCode(): BelongsTo
    {
        return $this->belongsTo(QRCode::class);
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'visitor_user_id');
    }
}
