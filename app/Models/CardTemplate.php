<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'template_key',
        'description',
        'thumbnail',
        'settings',
        'html',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function cards()
    {
        return $this->hasMany(VCard::class, 'template_id');
    }
}
