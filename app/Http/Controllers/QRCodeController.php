<?php
// app/Http/Controllers/QRCodeController.php
namespace App\Http\Controllers;

use App\Models\QRCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class QRCodeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            $qrCodes = QRCode::with(['agent', 'user'])->get();
        } elseif ($user->isAgent()) {
            $qrCodes = QRCode::with('user')->where('agent_id', $user->id)->get();
        } else {
            $qrCodes = QRCode::where('user_id', $user->id)->get();
        }

        return response()->json($qrCodes);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'qr_code' => 'required|unique:qr_codes',
            'item_name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'contact_phone' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $qrCode = QRCode::create([
            'qr_code' => $request->qr_code,
            'agent_id' => Auth::id(),
            'item_name' => $request->item_name,
            'item_description' => $request->item_description,
            'contact_name' => $request->contact_name,
            'contact_email' => $request->contact_email,
            'contact_phone' => $request->contact_phone,
            'address' => $request->address,
        ]);

        return response()->json($qrCode, 201);
    }

    public function show($id)
    {
        $qrCode = QRCode::with(['agent', 'user'])->findOrFail($id);
        
        $user = Auth::user();
        if ($user->isUser() && $qrCode->user_id !== $user->id) {
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
            'status' => 'sometimes|in:active,inactive,found'
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
}