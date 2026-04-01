<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Chatbot Keywords Configuration
    |--------------------------------------------------------------------------
    |
    | Define keywords that trigger storage of chat messages.
    | If user message contains any of these keywords, the message will be stored.
    |
    */

    'storage_keywords' => [
        'register',
        'qr code',
        'qr',
        'create',
        'vcard',
        'card',
        'payment',
        'plan',
        'pricing',
        'delete',
        'edit',
        'update',
        'help',
        'support',
        'issue',
        'problem',
        'error',
        'share',
        'template',
        'download',
    ],

    /*
    |--------------------------------------------------------------------------
    | OpenAI Configuration
    |--------------------------------------------------------------------------
    |
    | API key should be set in .env file as OPENAI_API_KEY
    |
    */

    'openai' => [
        'model' => env('OPENAI_MODEL', 'gpt-3.5-turbo'),
        'max_tokens' => 500,
        'temperature' => 0.7,
    ],

    /*
    |--------------------------------------------------------------------------
    | Chatbot System Message
    |--------------------------------------------------------------------------
    |
    | This is the system prompt that guides the chatbot's behavior
    |
    */

    'system_message' => 'You are a helpful assistant for QR Finder - a QR code management application. 
Help users with questions about:
- Creating and managing QR codes
- vCard (visiting card) features
- Payment and pricing plans
- Account management
- General support and help

Be friendly, concise, and helpful. If the user asks about features you don\'t know about, offer to connect them with support.',
];
