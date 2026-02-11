# Quick Start Guide - Payment System for Virtual Cards

## What Was Implemented

A complete Razorpay payment system that:
- ✅ Makes new cards appear **blurred** until payment is made
- ✅ Shows a payment button on pending cards
- ✅ Redirects to payment page with Razorpay checkout
- ✅ Verifies payment and unlocks card visibility
- ✅ Displays payment status badges

## Installation Instructions

### Step 1: Install Razorpay SDK
```bash
composer require razorpay/razorpay
```

### Step 2: Run Database Migrations
```bash
php artisan migrate
```

This creates:
- New columns in `v_cards` table for payment tracking
- New `payments` table for payment history

### Step 3: Add Razorpay Credentials
Edit your `.env` file and add:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

Get these from: https://dashboard.razorpay.com → Settings → API Keys

### Step 4: Clear Cache
```bash
php artisan config:cache
php artisan cache:clear
```

## How It Works

### User Journey:

1. **Create Card** 
   - User clicks "Add Card" and fills the form
   - Card is created with `payment_status = 'pending'`

2. **See Blurred Card**
   - On MyCards page, card shows with blur effect
   - Lock icon appears with "Proceed to Payment" button
   - View/Edit buttons are disabled
   - Delete button is still available

3. **Make Payment**
   - Click "Proceed to Payment" button
   - Enter desired amount (default: ₹99)
   - Click "Pay ₹XX.XX"
   - Razorpay checkout modal opens

4. **Card Becomes Visible**
   - After payment succeeds
   - Card blur is removed
   - Payment status changes to "Paid"
   - Green badge shows "✓ Paid"
   - All buttons (View, Edit, Delete) are now enabled

## File Structure Created

```
Backend:
├── app/Http/Controllers/PaymentController.php
├── app/Models/Payment.php
├── config/services.php (updated)
├── routes/api.php (updated)
└── database/migrations/
    ├── 2026_02_11_120000_add_payment_fields_to_v_cards_table.php
    └── 2026_02_11_121000_create_payments_table.php

Frontend:
├── resources/js/components/Payment/PaymentPage.jsx
├── resources/js/components/User/MyCard.jsx (updated)
└── resources/js/components/App.jsx (updated)
```

## Test the System

### Using Razorpay Test Credentials:
- **Card Number**: 4111111111111111
- **Expiry**: 12/25 (any future date)
- **CVV**: 123 (any 3 digits)
- These won't charge your account

### Test Flow:
1. Create a new card
2. See it blurred on MyCards page
3. Click "Proceed to Payment"
4. Pay using test card above
5. Card should become visible immediately

## API Endpoints

### Create Order
```
POST /api/payments/create-order
Body: { vcard_id: 1, amount: 99 }
```

### Verify Payment
```
POST /api/payments/verify
Body: { 
    razorpay_order_id: "...",
    razorpay_payment_id: "...",
    razorpay_signature: "...",
    vcard_id: 1
}
```

### Get Payment History
```
GET /api/payments/history/{vcardId}
```

## Troubleshooting

### Issue: "Razorpay SDK not loaded"
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+Shift+R)
- Check if CDN is accessible in your region

### Issue: "Payment verification failed"  
- Verify RAZORPAY_KEY_SECRET in .env is correct
- Check your credentials at dashboard.razorpay.com
- Ensure order_id and payment_id match

### Issue: Cards still showing pending after payment
- Check database: `SELECT * FROM v_cards WHERE id = 1;`
- Check payment status in `payments` table
- Review logs: `storage/logs/laravel.log`

### Issue: Button redirects to wrong page
- Change `/my-cards` to `/my-card` if needed in PaymentPage.jsx
- Check your routing setup in App.jsx

## What Each File Does

| File | Purpose |
|------|---------|
| **PaymentController.php** | Handles order creation, payment verification, and payment history |
| **Payment.php** | Database model for storing payment records |
| **PaymentPage.jsx** | React component showing payment form and Razorpay checkout |
| **MyCard.jsx** | Updated to show blur, lock icon, and payment button |
| **services.php** | Stores Razorpay credentials |
| **Migrations** | Create `payments` table and add columns to `v_cards` |

## Security Notes

✅ All payments verified server-side using Razorpay signature
✅ User can only pay for their own cards (checked via auth)
✅ Token-based authentication with Laravel Sanctum
✅ Secure HTTPS required in production

## Next: Production Setup

When ready to go live:

1. Get live Razorpay credentials (not test)
2. Update `.env` with live keys
3. Enable HTTPS on your server
4. Test payment flow with real transaction
5. Set up payment notifications (optional)
6. Monitor: `storage/logs/laravel.log`

## Support & Debugging

Enable detailed logging in `config/logging.php`:
```php
'slack' => [
    'url' => env('LOG_SLACK_WEBHOOK_URL'),
]
```

Monitor payment status:
```php
// In Tinker
php artisan tinker
> App\Models\VCard::where('payment_status', 'pending')->get();
> App\Models\Payment::latest()->get();
```

## Questions?

- Razorpay Docs: https://razorpay.com/docs/
- Laravel Docs: https://laravel.com/docs
- Check PAYMENT_SETUP.md for detailed documentation
- Check IMPLEMENTATION_SUMMARY.md for technical details
