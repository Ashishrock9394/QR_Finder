# Razorpay Integration Checklist

## ✅ Backend Setup Complete

- ✅ **PaymentController** - Full webhook handling with signature verification
- ✅ **Payment Model** - Stores all payment transactions
- ✅ **VCard Model** - Tracks payment status and Razorpay references
- ✅ **API Routes** - All payment endpoints configured
- ✅ **Webhook Handler** - Processes multiple event types securely

## 📋 Your Setup Checklist

### 1. Environment Variables (.env)
```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Get Credentials from Razorpay
- [ ] Log in to https://dashboard.razorpay.com
- [ ] Go to Settings → API Keys
- [ ] Copy **Key ID** → set as `RAZORPAY_KEY_ID`
- [ ] Copy **Key Secret** → set as `RAZORPAY_KEY_SECRET`

### 3. Setup Webhook in Razorpay
- [ ] Go to Settings → Webhooks
- [ ] Click "+ Add New Webhook"
- [ ] Enter Webhook URL: `https://your-domain.com/api/payments/webhook`
- [ ] Select events (payment.captured, payment.failed, etc.)
- [ ] Click "Show Secret" → Copy → set as `RAZORPAY_WEBHOOK_SECRET`

### 4. Verify Setup
```bash
# Clear Laravel config cache
php artisan config:cache

# Check webhook secret is loaded
php artisan tinker
> config('services.razorpay.webhook_secret')
# Should print your secret (not null)
```

### 5. Test Payment Flow
1. Create a vCard as a user
2. Click "Checkout" button
3. Complete test payment using:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
4. Check vCard payment status updates automatically

## 🔄 Payment Flow Diagram

```
User Creates vCard
        ↓
User Clicks "Pay" Button
        ↓
App Calls: POST /api/payments/create-order
        ↓
Server Creates Razorpay Order
        ↓
App Opens Razorpay Payment Modal
        ↓
User Enters Payment Details
        ↓
Razorpay Processes Payment
        ↓
Two Possible Outcomes:
    └─ SUCCESS:
        ├─ Razorpay sends webhook: payment.captured
        ├─ Webhook Handler updates vCard: payment_status = 'paid'
        ├─ Webhook Handler creates/updates Payment record
        └─ User sees: "Payment Successful ✅"
    
    └─ FAILURE:
        ├─ Razorpay sends webhook: payment.failed
        ├─ Webhook Handler updates Payment record: status = 'failed'
        └─ User sees: "Payment Failed ❌"
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `app/Http/Controllers/PaymentController.php` | All payment logic |
| `app/Models/Payment.php` | Payment transaction storage |
| `app/Models/VCard.php` | vCard model with payment fields |
| `routes/api.php` | API endpoints configuration |
| `RAZORPAY_WEBHOOK_SETUP.md` | Detailed setup guide |

## 🧪 Testing Webhook Locally

For ngrok users (development):

```bash
# Terminal 1: Start ngrok
ngrok http 8000

# Note the forwarding URL: https://xxxx-xxxx.ngrok.com

# Terminal 2: Set webhook URL in Razorpay:
# https://xxxx-xxxx.ngrok.com/api/payments/webhook

# Terminal 3: Start Laravel
php artisan serve
```

Then use Razorpay Dashboard to manually trigger test webhooks.

## 🔐 Security Features

- ✅ **Signature Verification** - Every webhook is verified using HMAC-SHA256
- ✅ **Rate Limiting** - Protected by Sanctum timeout middleware
- ✅ **Public Endpoint** - Webhook route doesn't require authentication (secure via signature)
- ✅ **Error Logging** - All operations logged to `storage/logs/laravel.log`

## 📊 Database Fields

### vCards Table
```sql
- payment_status (enum: 'pending', 'paid', 'failed')
- razorpay_order_id (Razorpay's order ID)
- razorpay_payment_id (Razorpay's payment ID)
- amount (payment amount in INR)
- paid_at (timestamp when paid)
```

### Payments Table
```sql
- user_id (which user)
- vcard_id (which vCard)
- razorpay_order_id (Razorpay order reference)
- razorpay_payment_id (Razorpay payment reference)
- status (pending, paid, failed)
- amount (in INR)
- currency (INR)
- metadata (JSON: raw webhook data)
```

## 🚀 Going Live

1. Switch Razorpay from Test to Live mode
2. Update `.env` with Live Key ID and Secret
3. Run: `php artisan config:cache`
4. Update webhook URL to production domain
5. Deploy to production server
6. Monitor logs for any issues

## Webhook Events Handled

```
✅ payment.captured      → vCard marked PAID
✅ payment_link.paid     → vCard marked PAID
✅ payment.failed        → Payment marked FAILED
✅ payment_link.failed   → Payment marked FAILED
✅ charge.notification   → Additional charge handling
✅ payment.authorized    → Authorization handling
```

## Troubleshooting

### Webhook Not Received?
1. Check ngrok/domain is publicly accessible
2. Verify webhook secret in `.env` matches Razorpay
3. Check Razorpay Dashboard → Webhooks → Recent Deliveries
4. Inspect Laravel logs: `tail -f storage/logs/laravel.log`

### Payment Status Not Updating?
1. Verify `RAZORPAY_WEBHOOK_SECRET` is set correctly
2. Check vCard's `payment_status` field gets updated
3. Run: `php artisan config:cache` to refresh config

### Test Mode vs Live Mode?
- **Test**: Use test card numbers, secret stays development
- **Live**: Use real cards, update to live credentials

## 📚 Resources

- [Razorpay Webhooks Docs](https://razorpay.com/docs/webhooks/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Laravel Configuration](https://laravel.com/docs/configuration)

---

**Status**: ✅ **PRODUCTION READY**

All webhook infrastructure is implemented and tested. Just add your credentials and test!
