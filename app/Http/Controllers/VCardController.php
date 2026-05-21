<?php

namespace App\Http\Controllers;

use App\Models\CardTemplate;
use App\Models\VCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class VCardController extends Controller
{
    // List all visiting cards
    public function index(Request $request)
    {
        $cards = VCard::with('template')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($cards);
    }

    // Show single card
    public function show($qr_code)
    {
        $card = VCard::with('template')->where('qr_code', $qr_code)->firstOrFail();

        return response()->json($card);
    }

    // Create new card
    public function store(Request $request)
    {
        $data = $this->validateData($request);

        // Handle file uploads
        $data = $this->handleFiles($request, $data);

        // Generate QR
        $qrCode = Str::uuid()->toString();
        $qrFileName = "v_cards/qrs/{$qrCode}.svg";
        $qrDirectory = storage_path('app/public/v_cards/qrs');
        if (! file_exists($qrDirectory)) {
            mkdir($qrDirectory, 0755, true);
        }

        $card = VCard::create([
            'user_id' => $request->user()->id,
            ...$data,
            'template_id' => $data['template_id'] ?? null,
            'qr_code' => $qrCode,
            'qr_image' => $qrFileName,
        ]);

        QrCode::size(300)
            ->format('svg')
            ->generate(url("/v-cards/{$qrCode}"), storage_path("app/public/{$qrFileName}"));

        return response()->json($card->load('template'), 201);
    }

    // Update card
    public function update(Request $request, $id)
    {

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
        if (! file_exists($qrDirectory)) {
            mkdir($qrDirectory, 0755, true);
        }

        QrCode::size(300)
            ->format('svg')
            ->generate(url("/v-cards/{$qrCode}"), storage_path("app/public/{$qrFileName}"));

        // Delete old QR file if exists
        if ($card->qr_image && Storage::disk('public')->exists($card->qr_image)) {
            Storage::disk('public')->delete($card->qr_image);
        }

        // Save new QR data
        $data['qr_code'] = $qrCode;
        $data['qr_image'] = $qrFileName;
        $data['template_id'] = $data['template_id'] ?? $card->template_id;

        $card->update($data);

        return response()->json($card->load('template'), 201);
    }

    /**
     * Validate card data
     */
    private function validateData(Request $request)
    {
        return $request->validate([
            'template_id' => 'nullable|exists:card_templates,id',
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
    private function handleFiles(Request $request, array $data, ?VCard $card = null)
    {
        if ($request->hasFile('logo')) {
            if ($card && $card->logo) {
                Storage::disk('public')->delete($card->logo);
            }
            $data['logo'] = $request->file('logo')->store('v_cards/logos', 'public');
        }

        if ($request->hasFile('photo')) {
            if ($card && $card->photo) {
                Storage::disk('public')->delete($card->photo);
            }
            $data['photo'] = $request->file('photo')->store('v_cards/photos', 'public');
        }

        return $data;
    }

    public function destroy(Request $request, $id)
    {
        $card = VCard::where('user_id', $request->user()->id)->findOrFail($id);
        if ($card->logo) {
            Storage::disk('public')->delete($card->logo);
        }
        if ($card->photo) {
            Storage::disk('public')->delete($card->photo);
        }
        if ($card->qr_image) {
            Storage::disk('public')->delete($card->qr_image);
        }

        $card->delete();

        return response()->json(['message' => 'Card deleted successfully']);
    }

    /**
     * Get the current user's vCards
     */
    public function myVCards(Request $request)
    {
        $vCards = VCard::with('template')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($vCards);
    }

    /**
     * Preview a vCard before generating
     */
    public function preview(Request $request)
    {
        $data = $this->validateData($request);

        // Get template
        $template = null;
        if (! empty($data['template_id'])) {
            $template = CardTemplate::find($data['template_id']);
        }

        if (! $template) {
            $template = CardTemplate::first();
        }

        if (! $template) {
            return response()->json(['error' => 'No template available'], 404);
        }

        // Generate preview QR code temporarily
        $qrCode = Str::uuid()->toString();
        $qrFileName = "v_cards/qrs/{$qrCode}.svg";
        $qrDirectory = storage_path('app/public/v_cards/qrs');
        if (! file_exists($qrDirectory)) {
            mkdir($qrDirectory, 0755, true);
        }

        // Generate QR with vCard data
        $vCardUrl = url("/v-cards/{$qrCode}");
        QrCode::size(300)
            ->format('svg')
            ->generate($vCardUrl, storage_path("app/public/{$qrFileName}"));

        // Prepare preview data
        $previewData = [
            'template' => $template,
            'form_data' => $data,
            'qr_image' => asset("storage/{$qrFileName}"),
            'preview_html' => $this->renderPreviewHtml($template, $data, asset("storage/{$qrFileName}")),
        ];

        return response()->json($previewData);
    }

    /**
     * Render preview HTML for vCard
     */
    private function renderPreviewHtml($template, $data, $qrImageUrl)
    {
        $values = [
            'name' => $data['name'] ?? 'Your Name',
            'designation' => $data['designation'] ?? 'Your Designation',
            'company_name' => $data['company_name'] ?? 'Company Name',
            'mobile' => $data['mobile'] ?? '+1 555 123 4567',
            'email' => $data['email'] ?? 'email@example.com',
            'website' => $data['website'] ?? 'https://example.com',
            'address' => $data['address'] ?? '123 Main Street, Cityville',
            'qr_image' => '<img src="'.$qrImageUrl.'" style="width:140px;height:140px;object-fit:contain;border-radius:12px;" alt="QR Code" />',
        ];

        if (! $template->html) {
            return '';
        }

        $html = $template->html;
        foreach ($values as $key => $value) {
            $html = str_replace('{{'.$key.'}}', $value, $html);
        }

        return $html;
    }
}
