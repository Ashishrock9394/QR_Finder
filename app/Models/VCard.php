<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VCard extends Model
{
    protected $fillable = [
        'user_id',
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
}
