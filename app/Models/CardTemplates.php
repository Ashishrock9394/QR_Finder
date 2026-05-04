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
