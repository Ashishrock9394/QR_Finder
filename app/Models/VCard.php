<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'template_id',
        'name',
        'designation',
        'company_name',
        'mobile',
        'email',
        'website',
        'address',
        'logo',
        'photo',
        'qr_code',
        'qr_image',
        'payment_status',
        'razorpay_order_id',
        'razorpay_payment_id',
        'amount',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function template()
    {
        return $this->belongsTo(CardTemplate::class, 'template_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isPaid()
    {
        return $this->payment_status === 'paid';
    }

    public function isPending()
    {
        return $this->payment_status === 'pending';
    }
}
