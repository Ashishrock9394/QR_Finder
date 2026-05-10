<?php

// app/Http/Controllers/AdminController.php

namespace App\Http\Controllers;

use App\Models\CardTemplate;
use App\Models\QRCode;
use App\Models\User;
use App\Models\VCard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function stats()
    {
        $total_qr_codes = QRCode::count();
        $total_vCards = VCard::count();
        $total_agents = User::where('role', 'agent')->count();
        $active_agents = User::where('role', 'agent')->where('status', 'active')->count();
        $total_users = User::where('role', 'user')->count();

        $found_items = QRCode::where('status', 'found')->count();
        $recovery_rate = $total_qr_codes > 0 ? round(($found_items / $total_qr_codes) * 100, 2) : 0;

        return response()->json([
            'total_qr_codes' => $total_qr_codes,
            'total_v_cards' => $total_vCards,
            'total_agents' => $total_agents,
            'active_agents' => $active_agents,
            'total_users' => $total_users,
            'found_items' => $found_items,
            'recovery_rate' => $recovery_rate,
        ]);
    }

    public function agents()
    {
        $agents = User::where('role', 'agent')
            ->select('id', 'name', 'email', 'status', 'created_at')
            ->get();

        $agents = $agents->map(function ($agent) {
            $agent->qr_issued = $agent->qr_codes()->count();
            $agent->items_found = $agent->qr_codes()->where('status', 'found')->count();
            $agent->success_rate = $agent->qr_issued > 0
                ? round(($agent->items_found / $agent->qr_issued) * 100, 2)
                : 0;

            return $agent;
        });

        return response()->json($agents);
    }

    public function users()
    {
        $users = User::where('role', 'user')
            ->select('id', 'name', 'email', 'role', 'status', 'created_at')
            ->get();

        $users = $users->map(function ($user) {
            $user->registered_items = $user->qr_codes()->count();

            return $user;
        });

        return response()->json($users);
    }

    public function cardTemplates()
    {
        $templates = CardTemplate::orderBy('name')->get();

        return response()->json($templates);
    }

    public function storeCardTemplate(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'template_key' => 'nullable|string|max:255|unique:card_templates,template_key',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string|max:255',
            'html' => 'nullable|string',
        ]);

        if (empty($data['template_key'])) {
            $data['template_key'] = Str::slug($data['name']);
        }

        $template = CardTemplate::create($data);

        return response()->json($template, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->status = $request->status;
        $user->save();

        return response()->json(['message' => 'Status updated successfully']);
    }
}
