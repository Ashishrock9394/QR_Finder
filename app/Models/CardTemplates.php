<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CardTemplates extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'template_key',
        'description',
        'thumbnail',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array', // JSON automatically cast to array
    ];

    public function cards()
    {
        return $this->hasMany(VCard::class, 'template_id');
    }
}
