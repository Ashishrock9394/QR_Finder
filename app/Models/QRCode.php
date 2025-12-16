<?php
// app/Models/QRCode.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QRCode extends Model
{
    use HasFactory;
    protected $table = 'qr_codes';

    protected $fillable = [
        'qr_code',
        'agent_id',
        'user_id',
        'item_name',
        'item_description',
        'contact_name',
        'contact_email',
        'contact_phone',
        'address',
        'status'
    ];

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}