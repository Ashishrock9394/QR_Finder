<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VCard extends Model
{
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
    ];

    public function template()
    {
        return $this->belongsTo(CardTemplate::class, 'template_id');
    }
}
