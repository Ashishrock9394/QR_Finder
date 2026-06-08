<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterQRCodeRequest;
use App\Models\QRCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use SimpleSoftwareIO\QrCode\Facades\QrCode as QrCodeGenerator;

class QRCodeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            $qrCodes = QRCode::with(['agent', 'user'])->latest()->get();
        } elseif ($user->isAgent()) {
            $qrCodes = QRCode::with('user')->where('agent_id', $user->id)->latest()->get();
        } else {
            $qrCodes = QRCode::where('user_id', $user->id)->latest()->get();
        }

        return response()->json($qrCodes);
    }

    public function store(RegisterQRCodeRequest $request)
    {
        $validated = $request->validated();

        $userImagePath = null;
        if ($request->hasFile('user_image')) {
            $userImagePath = $request->file('user_image')->store('qr-codes/users', 'public');
        }

        $itemImagePath = null;
        if ($request->hasFile('item_image')) {
            $itemImagePath = $request->file('item_image')->store('qr-codes/items', 'public');
        }

        $qrCodeData = [
            'user' => $validated['contact_name'],
            'email' => $validated['contact_email'],
            'phone' => $validated['contact_phone'],
            'item' => $validated['item_name'],
            'qr_code' => $validated['qr_code'],
        ];

        $qrCodeImagePath = null;
        try {
            $qrCodeImageName = 'qr-codes/'.\Illuminate\Support\Str::slug($validated['qr_code']).'.svg';
            $qrCodeContent = QrCodeGenerator::format('svg')->size(300)->generate(json_encode($qrCodeData));
            Storage::disk('public')->put($qrCodeImageName, $qrCodeContent);
            $qrCodeImagePath = $qrCodeImageName;
        } catch (\Exception $e) {
            \Log::error('QR Code generation error: '.$e->getMessage());
        }

        $qrCode = QRCode::create([
            'qr_code' => $validated['qr_code'],
            'agent_id' => Auth::id(),
            'item_name' => $validated['item_name'],
            'item_description' => $validated['item_description'] ?? null,
            'contact_name' => $validated['contact_name'],
            'contact_email' => $validated['contact_email'],
            'contact_phone' => $validated['contact_phone'],
            'address' => $validated['address'] ?? null,
            'user_image_path' => $userImagePath,
            'item_image_path' => $itemImagePath,
            'qr_code_image_path' => $qrCodeImagePath,
            'registration_timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'QR Code registered successfully',
            'data' => $qrCode->load(['agent', 'user']),
        ], 201);
    }

    public function show($id)
    {
        $qrCode = QRCode::with(['agent', 'user'])->findOrFail($id);

        $user = Auth::user();
        if ($user && $user->isUser() && $qrCode->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($qrCode);
    }

    public function update(Request $request, $id)
    {
        $qrCode = QRCode::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'item_name' => 'sometimes|required|string|max:255',
            'contact_name' => 'sometimes|required|string|max:255',
            'contact_email' => 'sometimes|required|email',
            'contact_phone' => 'sometimes|required|string',
            'status' => 'sometimes|in:active,inactive,found',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $qrCode->update($request->all());

        return response()->json($qrCode);
    }

    public function destroy($id)
    {
        $qrCode = QRCode::findOrFail($id);

        if ($qrCode->user_image_path) {
            Storage::disk('public')->delete($qrCode->user_image_path);
        }
        if ($qrCode->item_image_path) {
            Storage::disk('public')->delete($qrCode->item_image_path);
        }
        if ($qrCode->qr_code_image_path) {
            Storage::disk('public')->delete($qrCode->qr_code_image_path);
        }

        $qrCode->delete();

        return response()->json(['message' => 'QR Code deleted successfully']);
    }

    public function getByQRCode($qrCode)
    {
        $qrCode = QRCode::with(['agent', 'user'])
            ->where('qr_code', $qrCode)
            ->firstOrFail();

        return response()->json($qrCode);
    }

    public function showPublic($qrCodeId)
    {
        $qrCode = QRCode::findOrFail($qrCodeId);

        return response()->json($qrCode->load(['agent', 'user']));
    }

    public function myQRCodes()
    {
        $user = Auth::user();
        $qrCodes = QRCode::where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json($qrCodes);
    }
}
