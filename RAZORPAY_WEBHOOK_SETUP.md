# Razorpay Webhook Setup Guide

## Overview
The QR Finder application has a complete webhook system for handling Razorpay payment events. When payments succeed or fail, Razorpay automatically updates your vCard payment status.

## Webhook Endpoint
```
POST https://your-domain.com/api/payments/webhook
```

**Example:**
```
https://morbidly-printerlike-booker.ngrok-free.dev/api/payments/webhook
```

## Environment Configuration

Ensure these variables are set in your `.env` file:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### How to Get These Values:

1. **RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET:**
   - Go to https://dashboard.razorpay.com → Settings → API Keys
   - Copy the "Key ID" and "Key Secret"

2. **RAZORPAY_WEBHOOK_SECRET:**
   - Go to https://dashboard.razorpay.com → Settings → Webhooks
   - Create a new webhook pointing to your URL
   - Click "Show Secret" to get the webhook secret
   - Copy it to your `.env` file

## Setting Up Webhooks in Razorpay Dashboard

### Step 1: Go to Webhooks Settings
1. Log in to https://dashboard.razorpay.com
2. Navigate to **Settings** → **Webhooks**

### Step 2: Create New Webhook
Click **+ Add New Webhook**

### Step 3: Configure Webhook URL
- **Webhook URL:** `https://your-domain.com/api/payments/webhook`
- **Webhook Event Versions:** Select latest version
- **Active:** Toggle ON

### Step 4: Select Events to Listen
Enable these events:
- ✅ `charge.notification.resolved`
- ✅ `payment.authorized`
- ✅ `payment.captured`
- ✅ `payment.failed`
- ✅ `payment.link.paid`
- ✅ `payment.link.failed`
- ✅ `payment_link.failed`
- ✅ `payment_link.paid`

### Step 5: Copy Webhook Secret
- Click "Show Secret" button
- Copy the secret string
- Add to `.env`: `RAZORPAY_WEBHOOK_SECRET=your_secret_here`

### Step 6: Save Configuration
Click **Create Webhook**

## How the Webhook Works

### Payment Flow:
1. **User initiates payment** → App creates Razorpay order
2. **User completes payment** → Razorpay processes transaction
3. **Razorpay sends webhook** → Updates vCard payment status automatically
4. **vCard marked as paid** → User can access premium features

### Events Handled:

| Event | Action |
|-------|--------|
| `payment.captured` | vCard marked as PAID ✅ |
| `payment_link.paid` | vCard marked as PAID ✅ |
| `payment.failed` | Payment marked as FAILED ❌ |
| `payment_link.failed` | Payment marked as FAILED ❌ |

### Database Updates:

When webhook is received, these fields are updated:

**vCards Table:**
```
- payment_status = 'paid'
- razorpay_payment_id = id from webhook
- paid_at = current timestamp
```

**Payments Table:**
```
- status = 'paid' or 'failed'
- razorpay_payment_id = id from webhook
```

## Testing Webhook Locally

### Using ngrok:
```bash
# Terminal 1: Start ngrok
ngrok http 8000

# Terminal 2: Start Laravel server
php artisan serve
```

Your webhook URL becomes:
```
https://your-ngrok-id.ngrok-free.dev/api/payments/webhook
```

### Manual Testing:
Use Razorpay Dashboard → Webhooks → Test Webhook button to send test events

## Code Overview

### Payment Controller (`app/Http/Controllers/PaymentController.php`)

- **createOrder()** - Creates Razorpay order for vCard
- **verifyPayment()** - Manual verification after payment completes
- **handleWebhook()** - Processes Razorpay webhook events ⭐ Main handler

### Webhook Handler Features:
- ✅ Signature verification (security)
- ✅ Multiple event type support
- ✅ Automatic vCard status update
- ✅ Payment record creation
- ✅ Error logging
- ✅ Note extraction for metadata

## Security

The webhook uses **SHA256 HMAC signature verification**:
- Razorpay signs each webhook with your secret
- App verifies signature before processing
- Prevents fraudulent webhooks

```php
$computed = hash_hmac('sha256', $payload, $secret);
hash_equals($computed, $signature); // Must match
```

## Troubleshooting

### Webhook Not Triggering?
1. Verify webhook URL is publicly accessible
2. Check webhook secret in `.env` file
3. Check firewall/security group allows POST requests
4. Look at Razorpay Dashboard → Webhooks → Recent Deliveries

### Payment Status Not Updating?
1. Check database logs: `storage/logs/laravel.log`
2. Verify vCard ID is correct
3. Ensure `payment_status` column exists in `v_cards` table

### Signature Verification Failed?
1. Verify `RAZORPAY_WEBHOOK_SECRET` matches dashboard
2. Copy entire secret string (no extra spaces)
3. Test webhook from dashboard directly

## API Endpoints

### Create Order (Authenticated)
```bash
POST /api/payments/create-order
{
  "vcard_id": 1,
  "amount": 99
}
```

### Verify Payment (Authenticated)
```bash
POST /api/payments/verify
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx",
  "vcard_id": 1
}
```

### Webhook (Public)
```bash
POST /api/payments/webhook
Headers: X-Razorpay-Signature: <signature>
Body: <raw JSON from Razorpay>
```

## Logs & Monitoring

Check webhook processing logs:
```bash
tail -f storage/logs/laravel.log | grep "Webhook\|Payment"
```

## Next Steps

1. ✅ Set up webhook in Razorpay Dashboard
2. ✅ Add secret to `.env` file
3. ✅ Clear cache: `php artisan config:cache`
4. ✅ Test with Razorpay's test webhook
5. ✅ Deploy to production
6. ✅ Monitor logs for successful webhooks

## Support

For Razorpay API issues:
- https://razorpay.com/docs/webhooks/
- https://razorpay.com/docs/api/

For application issues:
- Check `storage/logs/laravel.log`
- Review webhook signatures in Razorpay Dashboard
