# Payment System Setup Guide

This guide explains how to set up and use the Razorpay payment system for virtual cards.

## Overview
The payment system allows users to:
1. Create virtual cards (initially in "pending" status)
2. View blurred cards with a payment button
3. Complete Razorpay payment to make cards visible
4. Cards become visible only after successful payment

## Installation Steps

### 1. Install PHP Dependencies
Run the following command to install Razorpay SDK:

```bash
composer require razorpay/razorpay
```

### 2. Run Database Migrations
Execute the migrations to add payment fields to the database:

```bash
php artisan migrate
```

This will:
- Add payment fields to `v_cards` table (payment_status, razorpay_order_id, razorpay_payment_id, amount, paid_at)
- Create `payments` table for tracking payment history

### 3. Configure Environment Variables
Add these to your `.env` file:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

You can get these credentials from your Razorpay Dashboard:
1. Go to https://dashboard.razorpay.com
2. Navigate to Settings → API Keys
3. Copy the Key ID and Key Secret

### 4. Frontend Setup
The React components are automatically included:
- [PaymentPage.jsx](../resources/js/components/Payment/PaymentPage.jsx) - Payment processing page
- Updated [MyCard.jsx](../resources/js/components/User/MyCard.jsx) - Shows blur effect and payment button

## How It Works

### Card Creation Flow
1. User creates a new card using the "Add Card" button
2. Card is created with `payment_status = 'pending'`
3. On MyCards page, the card appears **blurred**
4. A lock icon and "Proceed to Payment" button is displayed

### Payment Flow
1. User clicks "Proceed to Payment" button
2. User is redirected to `/payment/{cardId}`
3. User enters the amount and clicks "Pay"
4. Razorpay checkout modal opens
5. After successful payment:
   - Payment is verified server-side
   - Card's `payment_status` is set to 'paid'
   - Card becomes visible (no blur)
   - Badge shows "Paid" status

### Database Schema

#### v_cards table (new fields added)
```sql
- payment_status ENUM('pending', 'paid', 'cancelled')
- razorpay_order_id VARCHAR
- razorpay_payment_id VARCHAR
- amount DECIMAL(8,2)
- paid_at TIMESTAMP
```

#### payments table (new)
```sql
- id
- user_id (FK)
- vcard_id (FK)
- razorpay_order_id
- razorpay_payment_id
- amount
- currency
- status
- description
- metadata (JSON)
- created_at, updated_at
```

## API Endpoints

### Create Payment Order
**POST** `/api/payments/create-order`

Request:
```json
{
    "vcard_id": 1,
    "amount": 99.99
}
```

Response:
```json
{
    "success": true,
    "order_id": "order_xyz",
    "amount": 99.99,
    "currency": "INR",
    "key_id": "rzp_live_xxx"
}
```

### Verify Payment
**POST** `/api/payments/verify`

Request:
```json
{
    "razorpay_order_id": "order_xyz",
    "razorpay_payment_id": "pay_xyz",
    "razorpay_signature": "signature",
    "vcard_id": 1
}
```

Response:
```json
{
    "success": true,
    "message": "Payment verified successfully",
    "vcard_id": 1
}
```

### Handle Failed Payment
**POST** `/api/payments/failed`

Request:
```json
{
    "razorpay_order_id": "order_xyz",
    "vcard_id": 1
}
```

### Get Payment History
**GET** `/api/payments/history/{vcardId}`

Response:
```json
{
    "success": true,
    "payments": [...],
    "current_status": "paid"
}
```

## Frontend Components

### MyCard Component Updates
- Shows blur overlay for cards with `payment_status = 'pending'`
- Displays lock icon and payment button
- Shows payment status badge
- Disables View/Edit buttons for pending cards
- Allows Delete for any card

### PaymentPage Component
- Fetches card details
- Allows user to set payment amount
- Integrates Razorpay checkout
- Verifies payment signature
- Redirects to MyCards on success

## Testing Payment System

### Test Credentials (Razorpay)
For testing, use these credentials:
- **Card Number**: 4111111111111111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Name**: Any name

### Test Cards
- Success: 4111111111111111
- Decline: 4000000000003220

## Troubleshooting

### "Razorpay SDK not loaded"
- Clear browser cache
- Ensure CDN is accessible
- Check browser console for errors

### "Payment verification failed"
- Verify RAZORPAY_KEY_SECRET is correct
- Check that order_id matches
- Ensure payment signature is correct

### "Card not found"
- Verify card ID in URL
- Card may have been deleted
- Ensure user owns the card

## Production Checklist

- [ ] Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in production .env
- [ ] Test with live payment credentials
- [ ] Set up webhook for asynchronous notifications (optional)
- [ ] Enable SSL/HTTPS (required by Razorpay)
- [ ] Test payment flow end-to-end
- [ ] Set up email notifications for successful payments
- [ ] Monitor payment logs and errors

## Additional Features (Optional)

### Email Notification
Add to PaymentController after successful payment:
```php
Mail::send(new PaymentSuccessful($payment));
```

### Webhook Verification
Implement webhook endpoint to handle asynchronous payment updates:
```php
Route::post('/webhook/razorpay', [PaymentController::class, 'handleWebhook']);
```

### Refund Functionality
```php
public function refundPayment($paymentId) {
    $this->api->payment->fetch($paymentId)->refund();
}
```

## Support
For issues or questions:
1. Check Razorpay documentation: https://razorpay.com/docs/
2. Review logs in `storage/logs/`
3. Test with different payment methods
