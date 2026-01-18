<?php
// app/Http/Controllers/DashboardController.php
namespace App\Http\Controllers;

use App\Models\QRCode;
use App\Models\VCard;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            $stats = [
                'total_qr_codes' => QRCode::count(),
                'total_v_cards' => VCard::count(),
                'total_agents' => User::where('role', 'agent')->count(),
                'active_agents' => User::where('role', 'agent')->where('status', 'active')->count(),
                'total_users' => User::where('role', 'user')->count(),
                'active_items' => QRCode::where('status', 'active')->count(),
                'found_items' => QRCode::where('status', 'found')->count(),
                'happy_customers' => Review::where('is_approved', true)->count(),
                'recovery_rate' => QRCode::count() > 0 ? 
                    round((QRCode::where('status', 'found')->count() / QRCode::count()) * 100, 2) : 0,
            ];
        } elseif ($user->isAgent()) {
            $stats = [
                'total_qr_codes' => QRCode::where('agent_id', $user->id)->count(),
                'active_items' => QRCode::where('agent_id', $user->id)->where('status', 'active')->count(),
                'found_items' => QRCode::where('agent_id', $user->id)->where('status', 'found')->count(),
                'happy_customers' => Review::whereHas('user', function($query) use ($user) {
                    $query->whereHas('ownedQRCodes', function($q) use ($user) {
                        $q->where('agent_id', $user->id);
                    });
                })->where('is_approved', true)->count(),
            ];
        } else {
            $stats = [
                'my_items' => QRCode::where('user_id', $user->id)->count(),
                'active_items' => QRCode::where('user_id', $user->id)->where('status', 'active')->count(),
                'found_items' => QRCode::where('user_id', $user->id)->where('status', 'found')->count(),
            ];
        }

        return response()->json($stats);
    }
}