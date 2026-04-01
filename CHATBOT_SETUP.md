# Chatbot Setup Guide

## Overview
Your QR Finder application now includes an intelligent chatbot that:
- Helps users with questions about QR codes, vCards, payments, and account management
- Stores conversations **only** when they contain specific keywords
- Uses OpenAI's GPT-3.5/GPT-4 API for intelligent responses

## Files Created

### Backend Files
1. **App/Models/ChatMessage.php** - Model for storing chat messages
2. **App/Http/Controllers/ChatController.php** - API endpoints for chat
3. **App/Services/ChatbotService.php** - Core chatbot logic with keyword filtering
4. **config/chatbot.php** - Chatbot configuration and keywords
5. **config/services.php** - Updated with OpenAI API configuration
6. **database/migrations/2026_04_01_000000_create_chat_messages_table.php** - Database table

### Frontend Files
1. **resources/js/components/Chatbot.jsx** - React chatbot component
2. **resources/js/components/Layout/MainLayout.jsx** - Updated to include chatbot

### Configuration
1. **routes/api.php** - Added chat API routes

## Setup Instructions

### Step 1: Get OpenAI API Key
1. Go to [OpenAI API Dashboard](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key

### Step 2: Add Environment Variable
Add this to your `.env` file:
```
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4 if you have access
```

### Step 3: Run Migration
```bash
php artisan migrate
```

### Step 4: Build Frontend
```bash
npm run build
# or for development with watch mode:
npm run dev
```

### Step 5: Test the Chatbot
1. Log in to your application
2. Look for the blue chat button in the bottom-right corner
3. Click it to open the chatbot
4. Try messages with keywords like: "register qr code", "payment plans", "create vcard"

## Storage Keywords
The chatbot will **only store** conversations containing these keywords:

- register
- qr code / qr
- create
- vcard / card
- payment
- plan / pricing
- delete
- edit / update
- help
- support
- issue
- problem
- error
- share
- template
- download

## API Endpoints

### Send Message
```
POST /api/chat/send
Content-Type: application/json
Authorization: Bearer {token}

{
    "message": "How do I create a QR code?"
}

Response:
{
    "success": true,
    "response": "To create a QR code in QR Finder...",
    "stored": true,
    "matched_keywords": ["create", "qr code"],
    "chat_message_id": 1
}
```

### Get Chat History
```
GET /api/chat/history
Authorization: Bearer {token}

Response:
{
    "success": true,
    "messages": [
        {
            "id": 1,
            "user_message": "Help with QR code",
            "ai_response": "...",
            "keywords_matched": ["help", "qr code"],
            "created_at": "2026-04-01 10:30:00"
        }
    ]
}
```

### Clear History
```
POST /api/chat/clear-history
Authorization: Bearer {token}

Response:
{
    "success": true,
    "message": "Chat history cleared successfully"
}
```

## Customization

### Add More Keywords
Edit `config/chatbot.php`:
```php
'storage_keywords' => [
    'register',
    'your-new-keyword',
    // ...
]
```

### Change System Message
Edit the system message in `config/chatbot.php` to customize chatbot behavior:
```php
'system_message' => 'You are a helpful assistant for QR Finder...'
```

### Styling
The chatbot UI is built with Tailwind CSS. Customize colors and appearance in `resources/js/components/Chatbot.jsx`

## Troubleshooting

### Chatbot button not showing
- Ensure you're logged in
- Build frontend: `npm run build`
- Clear browser cache

### "API key not found" error
- Check `.env` file has `OPENAI_API_KEY`
- Restart Laravel server
- Check API key validity on OpenAI website

### Messages not being stored
- Check that your message contains one of the configured keywords
- Verify database migration ran: `php artisan migrate:status`

### Slow responses
- OpenAI API calls take 2-5 seconds
- Use `gpt-3.5-turbo` instead of `gpt-4` for faster responses
- Reduce `max_tokens` in `config/chatbot.php`

## Database Schema

```sql
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    user_message LONGTEXT,
    ai_response LONGTEXT,
    keywords_matched JSON,
    is_stored BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(user_id),
    INDEX(is_stored),
    INDEX(created_at)
);
```

## Features

✅ **AI-Powered** - Uses OpenAI's GPT models
✅ **Smart Storage** - Only stores conversations with relevant keywords
✅ **History** - Users can view their saved conversations
✅ **Clean UI** - Modern, responsive chat interface
✅ **Dark Mode** - Supports light and dark themes
✅ **Real-time** - Instant message sending and receiving
✅ **Privacy** - Messages only stored when needed

## Cost Estimation

- OpenAI API: ~$0.002 per 1K tokens
- Average message: ~100 tokens = ~$0.0002
- 1000 stored conversations = ~$0.20

## Security

- All endpoints require authentication (Sanctum)
- Messages stored only for logged-in users
- API key stored in environment variables
- User can clear their history anytime
