<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\VCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api;

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
                'amount' => (int) ($request->amount * 100), // Convert to paise
                'currency' => 'INR',
                'receipt' => 'vcard_'.$vcard->id.'_'.time(),
                'description' => 'Payment for Virtual Card - '.$vcard->name,
                'notes' => [
                    'vcard_id' => $vcard->id,
                    'user_id' => $request->user()->id,
                ],
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
            Log::error('Error creating Razorpay order: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment order',
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
                'signature' => $request->razorpay_signature,
            ];

            // Verify the payment signature
            try {
                $this->api->utility->verifyPaymentSignature($attributes);
            } catch (\Exception $e) {
                Log::error('Payment signature verification failed: '.$e->getMessage());

                return response()->json([
                    'success' => false,
                    'message' => 'Payment verification failed',
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
            Log::error('Payment verification error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error verifying payment',
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
            Log::error('Payment failure handling error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error processing failed payment',
            ], 500);
        }
    }

    /**
     * Handle Razorpay webhooks (public endpoint)
     */
    public function handleWebhook(Request $request)
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('X-Razorpay-Signature') ?? $request->header('x-razorpay-signature');
            $secret = config('services.razorpay.webhook_secret');

            if (empty($secret)) {
                Log::warning('Razorpay webhook received but webhook secret not configured.');

                return response()->json(['success' => false, 'message' => 'Webhook secret not configured'], 400);
            }

            $computed = hash_hmac('sha256', $payload, $secret);
            if (! hash_equals($computed, (string) $signature)) {
                Log::warning('Invalid Razorpay webhook signature.');

                return response('Invalid signature', 400);
            }

            $data = json_decode($payload, true);
            $event = $data['event'] ?? null;

            // Try to locate payment entity for multiple webhook shapes
            $paymentEntity = $data['payload']['payment']['entity'] ?? null;
            $linkEntity = $data['payload']['payment_link']['entity'] ?? null;
            $linkPaymentEntity = $data['payload']['payment_link_payment']['entity'] ?? null;
            $entity = $paymentEntity ?? $linkPaymentEntity ?? $linkEntity;

            // Helper to extract notes safely
            $extractNotes = function ($ent) {
                if (empty($ent)) {
                    return [];
                }

                return $ent['notes'] ?? ($ent['entity']['notes'] ?? []);
            };

            $notes = $extractNotes($entity);

            $paymentId = $paymentEntity['id'] ?? $linkPaymentEntity['id'] ?? $linkEntity['id'] ?? null;
            $orderId = $paymentEntity['order_id'] ?? $linkPaymentEntity['order_id'] ?? null;
            $linkId = $linkEntity['id'] ?? ($paymentEntity['link_id'] ?? $linkPaymentEntity['link_id'] ?? null);

            // Try to find vcard_id from notes
            $vcardIdFromNotes = null;
            if (! empty($notes) && isset($notes['vcard_id'])) {
                $vcardIdFromNotes = intval($notes['vcard_id']);
            }

            // Find associated Payment record
            $payment = null;
            if (! empty($orderId)) {
                $payment = Payment::where('razorpay_order_id', $orderId)->first();
            }
            if (! $payment && ! empty($paymentId)) {
                $payment = Payment::where('razorpay_payment_id', $paymentId)->first();
            }
            if (! $payment && ! empty($linkId)) {
                $payment = Payment::where('metadata', 'like', '%'.$linkId.'%')->first();
            }

            // For diagnostics: if we cannot identify record yet, log metadata
            if (! $payment && ! $vcardIdFromNotes) {
                Log::warning('Razorpay webhook received but no payment/vcard mapping found.', [
                    'event' => $event,
                    'order_id' => $orderId,
                    'payment_id' => $paymentId,
                    'link_id' => $linkId,
                    'notes' => $notes,
                    'payload' => $data,
                ]);
            }

            // If we have vcard_id from notes but no payment, create a pending payment record
            if (! $payment && $vcardIdFromNotes) {
                $vcard = VCard::find($vcardIdFromNotes);
                if ($vcard) {
                    $payment = Payment::create([
                        'user_id' => $vcard->user_id,
                        'vcard_id' => $vcard->id,
                        'razorpay_order_id' => $orderId,
                        'razorpay_payment_id' => $paymentId,
                        'amount' => ($entity['amount'] ?? ($entity['amount_paid'] ?? 0)) / 100,
                        'currency' => $entity['currency'] ?? 'INR',
                        'status' => 'pending',
                        'description' => 'Payment via payment webhook',
                        'metadata' => ['raw' => $entity],
                    ]);
                } else {
                    Log::warning('Unable to find VCard for webhook vcard_id note.', ['vcard_id' => $vcardIdFromNotes, 'event' => $event]);
                }
            }

            // Handle successful capture / payment
            $isCaptured = ($paymentEntity && ($paymentEntity['status'] ?? '') === 'captured')
                || ($linkPaymentEntity && ($linkPaymentEntity['status'] ?? '') === 'paid')
                || in_array($event, ['payment.captured', 'payment_link.paid', 'payment.link.paid', 'payment_link.payment.captured', 'payment.authorized']);

            if ($isCaptured) {
                if ($payment) {
                    $payment->update([
                        'razorpay_payment_id' => $paymentId ?: $payment->razorpay_payment_id,
                        'status' => 'paid',
                    ]);

                    $vcard = VCard::find($payment->vcard_id);
                    if ($vcard) {
                        $vcard->update([
                            'payment_status' => 'paid',
                            'razorpay_payment_id' => $paymentId ?: $vcard->razorpay_payment_id,
                            'paid_at' => now(),
                        ]);
                    } else {
                        Log::warning('Payment record found but referenced VCard is missing for capture webhook.', ['vcard_id' => $payment->vcard_id]);
                    }
                } elseif ($vcardIdFromNotes) {
                    $vcard = VCard::find($vcardIdFromNotes);
                    if ($vcard) {
                        Payment::create([
                            'user_id' => $vcard->user_id,
                            'vcard_id' => $vcard->id,
                            'razorpay_order_id' => $orderId,
                            'razorpay_payment_id' => $paymentId,
                            'amount' => ($entity['amount'] ?? ($entity['amount_paid'] ?? 0)) / 100,
                            'currency' => $entity['currency'] ?? 'INR',
                            'status' => 'paid',
                            'description' => 'Payment via payment link',
                            'metadata' => ['raw' => $entity],
                        ]);

                        $vcard->update([
                            'payment_status' => 'paid',
                            'razorpay_payment_id' => $paymentId,
                            'paid_at' => now(),
                        ]);
                    }
                }
            }

            // Handle failures
            $isFailed = ($paymentEntity && ($paymentEntity['status'] ?? '') === 'failed')
                || ($linkPaymentEntity && ($linkPaymentEntity['status'] ?? '') === 'failed')
                || in_array($event, ['payment.failed', 'payment_link.failed', 'payment.link.failed', 'payment_link.payment.failed']);

            if ($isFailed) {
                if ($payment) {
                    $payment->update(['status' => 'failed']);

                    $vcard = VCard::find($payment->vcard_id);
                    if ($vcard) {
                        $vcard->update(['payment_status' => 'failed']);
                    }
                } elseif ($vcardIdFromNotes) {
                    $vcard = VCard::find($vcardIdFromNotes);
                    if ($vcard) {
                        Payment::create([
                            'user_id' => $vcard->user_id,
                            'vcard_id' => $vcard->id,
                            'razorpay_order_id' => $orderId,
                            'razorpay_payment_id' => $paymentId,
                            'amount' => ($entity['amount'] ?? 0) / 100,
                            'currency' => $entity['currency'] ?? 'INR',
                            'status' => 'failed',
                            'description' => 'Failed payment via webhook',
                            'metadata' => ['raw' => $entity],
                        ]);

                        $vcard->update(['payment_status' => 'failed']);
                    }
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Webhook processing error: '.$e->getMessage());

            return response()->json(['success' => false], 500);
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
            Log::error('Error fetching payment history: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching payment history',
            ], 500);
        }
    }
}
