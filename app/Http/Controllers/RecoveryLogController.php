<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRecoveryLogRequest;
use App\Models\QRCode;
use App\Models\RecoveryLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecoveryLogController extends Controller
{
    public function store(StoreRecoveryLogRequest $request, string $identifier): JsonResponse
    {
        $qrCode = QRCode::where('qr_code', $identifier)->firstOrFail();
        $visitor = Auth::guard('sanctum')->user();

        if ($visitor && $qrCode->user_id === $visitor->id) {
            return response()->json(['message' => 'Item owners do not need to submit a recovery report.'], 403);
        }

        $recoveryLog = RecoveryLog::create([
            'qr_code_id' => $qrCode->id,
            'visitor_user_id' => $visitor?->id,
            'visitor_name' => $request->validated('name'),
            'visitor_phone' => $request->validated('contact_phone'),
            'details' => $request->validated('details'),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Thank you. The owner has been notified of your recovery information.',
            'data' => $recoveryLog,
        ], 201);
    }

    public function index(Request $request, QRCode $qrCode): JsonResponse
    {
        abort_unless($qrCode->user_id === $request->user()->id, 403);

        return response()->json(
            $qrCode->recoveryLogs()->latest()->get()
        );
    }
}
