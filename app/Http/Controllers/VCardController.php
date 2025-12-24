<?php

namespace App\Http\Controllers;

use App\Models\VCard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class VCardController extends Controller
{
    // List all visiting cards
    public function index(Request $request)
    {
        $cards = VCard::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($cards);
    }

    // Show single card
    public function show($id)
    {   
        // dd($request->all());
        $card = VCard::findOrFail($id);
        return response()->json($card);
    }

    // Create new card
    public function store(Request $request){
        $data = $this->validateData($request);

        // Handle file uploads
        $data = $this->handleFiles($request, $data);

        // Generate QR
        $qrCode = Str::uuid()->toString();
        $qrFileName = "v_cards/qrs/{$qrCode}.svg";
        $qrDirectory = storage_path('app/public/v_cards/qrs');
        if (!file_exists($qrDirectory)) mkdir($qrDirectory, 0755, true);

        $card = VCard::create([
            'user_id' => $request->user()->id,
            ...$data,
            'qr_code' => $qrCode,
            'qr_image' => $qrFileName,
        ]);

        QrCode::size(300)
            ->format('svg')
            ->generate(url("/v-cards/{$card->id}"), storage_path("app/public/{$qrFileName}"));

        return response()->json($card, 201);
    }

    // Update card
    public function update(Request $request, $id){

        $card = VCard::where('user_id', $request->user()->id)->findOrFail($id);
        $data = $this->validateData($request);

        // Handle logo file
        if ($request->hasFile('logo')) {
            if ($card->logo) {
                Storage::disk('public')->delete($card->logo);
            }
            $data['logo'] = $request->file('logo')->store('v_cards/logos', 'public');
        } else {
            $data['logo'] = $card->logo;
        }

        // Handle photo file
        if ($request->hasFile('photo')) {
            if ($card->photo) {
                Storage::disk('public')->delete($card->photo);
            }
            $data['photo'] = $request->file('photo')->store('v_cards/photos', 'public');
        } else {
            $data['photo'] = $card->photo;
        }

        // Generate new QR code
        $qrCode = Str::uuid()->toString();
        $qrFileName = "v_cards/qrs/{$qrCode}.svg";
        $qrDirectory = storage_path('app/public/v_cards/qrs');
        if (!file_exists($qrDirectory)) mkdir($qrDirectory, 0755, true);

        QrCode::size(300)
            ->format('svg')
            ->generate(url("/v-cards/{$card->id}"), storage_path("app/public/{$qrFileName}"));

        // Delete old QR file if exists
        if ($card->qr_image && Storage::disk('public')->exists($card->qr_image)) {
            Storage::disk('public')->delete($card->qr_image);
        }

        // Save new QR data
        $data['qr_code'] = $qrCode;
        $data['qr_image'] = $qrFileName;

        $card->update($data);
        return response()->json($card, 201);
    }



    /**
     * Validate card data
     */
    private function validateData(Request $request)
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'mobile' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'website' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);
    }

    /**
     * Handle file uploads (logo/photo)
     */
    private function handleFiles(Request $request, array $data, VCard $card = null)
    {
        if ($request->hasFile('logo')) {
            if ($card && $card->logo) Storage::disk('public')->delete($card->logo);
            $data['logo'] = $request->file('logo')->store('v_cards/logos', 'public');
        }

        if ($request->hasFile('photo')) {
            if ($card && $card->photo) Storage::disk('public')->delete($card->photo);
            $data['photo'] = $request->file('photo')->store('v_cards/photos', 'public');
        }

        return $data;
    }


    public function destroy(Request $request, $id){
        $card = VCard::where('user_id', $request->user()->id)->findOrFail($id);
        if ($card->logo) Storage::disk('public')->delete($card->logo);
        if ($card->photo) Storage::disk('public')->delete($card->photo);
        if ($card->qr_image) Storage::disk('public')->delete($card->qr_image);

        $card->delete();

        return response()->json(['message' => 'Card deleted successfully']);
    }
}
