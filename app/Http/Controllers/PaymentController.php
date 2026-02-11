<?php

namespace App\Http\Controllers;

use App\Models\VCard;
use App\Models\Payment;
use Illuminate\Http\Request;
use Razorpay\Api\Api;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $api;

    public function __construct()
    {
        $this->api = new Api(
            config('services.razorpay.key_id'),
            config('services.razorpay.key_secret')
        );
    }

    /**
     * Create Razorpay order for vcard payment
     */
    public function createOrder(Request $request)
    {
        try {
            $request->validate([
                'vcard_id' => 'required|exists:v_cards,id',
                'amount' => 'required|numeric|min:1',
            ]);

            $vcard = VCard::where('user_id', $request->user()->id)
                ->findOrFail($request->vcard_id);

            // Create Razorpay order
            $orderData = [
                'amount' => (int)($request->amount * 100), // Convert to paise
                'currency' => 'INR',
                'receipt' => 'vcard_' . $vcard->id . '_' . time(),
                'description' => 'Payment for Virtual Card - ' . $vcard->name,
                'customer_notify' => 1,
                'notes' => [
                    'vcard_id' => $vcard->id,
                    'user_id' => $request->user()->id,
                ]
            ];

            $order = $this->api->order->create($orderData);

            // Create payment record
            $payment = Payment::create([
                'user_id' => $request->user()->id,
                'vcard_id' => $vcard->id,
                'razorpay_order_id' => $order['id'],
                'amount' => $request->amount,
                'currency' => 'INR',
                'status' => 'pending',
                'description' => 'Virtual Card Payment',
                'metadata' => ['order_data' => $orderData],
            ]);

            // Update vcard with order id
            $vcard->update([
                'razorpay_order_id' => $order['id'],
                'amount' => $request->amount,
            ]);

            return response()->json([
                'success' => true,
                'order_id' => $order['id'],
                'amount' => $request->amount,
                'currency' => 'INR',
                'key_id' => config('services.razorpay.key_id'),
                'payment_id' => $payment->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating Razorpay order: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment order'
            ], 500);
        }
    }

    /**
     * Verify payment after successful razorpay payment
     */
    public function verifyPayment(Request $request)
    {
        try {
            $request->validate([
                'razorpay_order_id' => 'required',
                'razorpay_payment_id' => 'required',
                'razorpay_signature' => 'required',
                'vcard_id' => 'required|exists:v_cards,id',
            ]);

            $vcard = VCard::where('user_id', $request->user()->id)
                ->findOrFail($request->vcard_id);

            // Verify signature
            $attributes = [
                'order_id' => $request->razorpay_order_id,
                'payment_id' => $request->razorpay_payment_id,
                'signature' => $request->razorpay_signature
            ];

            // Verify the payment signature
            try {
                $this->api->utility->verifyPaymentSignature($attributes);
            } catch (\Exception $e) {
                Log::error('Payment signature verification failed: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Payment verification failed'
                ], 400);
            }

            // Get payment details from Razorpay
            $paymentDetails = $this->api->payment->fetch($request->razorpay_payment_id);

            // Update payment record
            $payment = Payment::where('razorpay_order_id', $request->razorpay_order_id)->first();
            
            if ($payment) {
                $payment->update([
                    'razorpay_payment_id' => $request->razorpay_payment_id,
                    'status' => 'paid',
                ]);
            }

            // Update vcard status
            $vcard->update([
                'payment_status' => 'paid',
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'paid_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully',
                'vcard_id' => $vcard->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Payment verification error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error verifying payment'
            ], 500);
        }
    }

    /**
     * Handle failed payment
     */
    public function paymentFailed(Request $request)
    {
        try {
            $request->validate([
                'razorpay_order_id' => 'required',
                'vcard_id' => 'required',
            ]);

            $vcard = VCard::where('user_id', $request->user()->id)
                ->findOrFail($request->vcard_id);

            // Update payment record
            $payment = Payment::where('razorpay_order_id', $request->razorpay_order_id)->first();
            
            if ($payment) {
                $payment->update([
                    'status' => 'failed',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment failure recorded',
            ]);

        } catch (\Exception $e) {
            Log::error('Payment failure handling error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error processing failed payment'
            ], 500);
        }
    }

    /**
     * Get payment history for a vcard
     */
    public function getPaymentHistory(Request $request, $vcardId)
    {
        try {
            $vcard = VCard::where('user_id', $request->user()->id)
                ->findOrFail($vcardId);

            $payments = Payment::where('vcard_id', $vcard->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'payments' => $payments,
                'current_status' => $vcard->payment_status,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching payment history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching payment history'
            ], 500);
        }
    }
}
