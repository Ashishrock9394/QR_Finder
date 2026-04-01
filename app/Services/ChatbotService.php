<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatbotService
{
    protected $apiKey;

    protected $model;

    protected $maxTokens;

    protected $temperature;

    protected $systemMessage;

    protected $keywords;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
        $this->model = config('chatbot.openai.model');
        $this->maxTokens = config('chatbot.openai.max_tokens');
        $this->temperature = config('chatbot.openai.temperature');
        $this->systemMessage = config('chatbot.system_message');
        $this->keywords = config('chatbot.storage_keywords');
    }

    /**
     * Send a message to the chatbot and get a response
     */
    public function sendMessage(User $user, string $message): array
    {
        $aiResponse = $this->getAIResponse($message);

        // Check if message contains any storage keywords
        $matchedKeywords = $this->getMatchedKeywords($message);
        $shouldStore = count($matchedKeywords) > 0;

        // Store the message if keywords match
        if ($shouldStore) {
            $chatMessage = ChatMessage::create([
                'user_id' => $user->id,
                'user_message' => $message,
                'ai_response' => $aiResponse,
                'keywords_matched' => $matchedKeywords,
                'is_stored' => true,
            ]);

            return [
                'success' => true,
                'response' => $aiResponse,
                'stored' => true,
                'matched_keywords' => $matchedKeywords,
                'chat_message_id' => $chatMessage->id,
            ];
        }

        return [
            'success' => true,
            'response' => $aiResponse,
            'stored' => false,
            'matched_keywords' => [],
        ];
    }

    /**
     * Get AI response from OpenAI API or fallback to mock responses
     */
    protected function getAIResponse(string $userMessage): string
    {
        // If API key is not configured, use smart fallback responses
        if (!$this->apiKey) {
            return $this->getFallbackResponse($userMessage);
        }

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $this->systemMessage,
                        ],
                        [
                            'role' => 'user',
                            'content' => $userMessage,
                        ],
                    ],
                    'max_tokens' => $this->maxTokens,
                    'temperature' => $this->temperature,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content', 'I apologize, I could not process your request.');
            }

            // If API fails, fall back to mock responses
            return $this->getFallbackResponse($userMessage);
        } catch (\Exception $e) {
            \Log::error('Chatbot API Error: '.$e->getMessage());

            return $this->getFallbackResponse($userMessage);
        }
    }

    /**
     * Generate smart fallback responses for development/testing
     */
    protected function getFallbackResponse(string $userMessage): string
    {
        $message = Str::lower($userMessage);

        // Greeting responses
        if (Str::contains($message, ['hello', 'hi', 'hey', 'namaste', 'hola'])) {
            return 'Hello! 👋 Welcome to QR Finder. I\'m here to help you with QR codes, vCards, payments, and more. What can I assist you with?';
        }

        // QR Code related
        if (Str::contains($message, ['qr code', 'qr', 'create'])) {
            return 'I can help you create and manage QR codes! You can:
• Create custom QR codes with your branding
• Generate QR codes for your vCard/contact information
• Track QR code scans and analytics
• Download codes in various formats

Would you like to create a new QR code?';
        }

        // vCard related
        if (Str::contains($message, ['vcard', 'card', 'contact'])) {
            return 'Great! vCard (visiting cards) are digital contact cards. With QR Finder, you can:
• Create professional digital vCards
• Customize them with your photos and colors
• Share via QR code
• Track when someone scans your card

Would you like to create a vCard?';
        }

        // Payment/Pricing related
        if (Str::contains($message, ['payment', 'price', 'plan', 'cost', 'premium', 'subscription'])) {
            return 'Our pricing plans offer great value! 💰

📱 **Basic** - Free (up to 10 QR codes)
💎 **Pro** - $9.99/month (unlimited codes, analytics)
🚀 **Business** - $29.99/month (team access, advanced features)

Which plan interests you?';
        }

        // Help/Support
        if (Str::contains($message, ['help', 'support', 'problem', 'issue', 'error'])) {
            return 'I\'m here to help! 🤝 What issue are you experiencing?
• Problems creating QR codes?
• Need help with vCard setup?
• Questions about your account?
• Technical difficulties?

Please describe your issue and I\'ll do my best to assist!';
        }

        // Update/Edit/Delete
        if (Str::contains($message, ['update', 'edit', 'delete', 'remove', 'change'])) {
            return 'Great! I can help you modify your content:
• Edit existing QR codes and vCards
• Update your profile information
• Delete unwanted codes or cards
• Manage your account settings

What would you like to update?';
        }

        // Download/Share
        if (Str::contains($message, ['download', 'share', 'export'])) {
            return 'You can easily download and share your QR codes! 📥
• Download as PNG, SVG, or PDF
• Share via link, email, or social media
• Export vCard data
• Create printable versions

Which format would you like?';
        }

        // Template related
        if (Str::contains($message, ['template', 'design', 'style'])) {
            return 'We offer beautiful templates! 🎨
• Professional business templates
• Social media templates
• Event QR codes
• Custom branding options

Choose from our templates or create your own!';
        }

        // Default helpful response
        return 'Thanks for your message! 😊 I\'m here to help with:
✓ Creating and managing QR codes
✓ Setting up vCard digital business cards
✓ Payment and subscription plans
✓ Account management and settings

Feel free to ask about any of these topics!';
    }

    /**
     * Check which keywords match in the message (case-insensitive)
     */
    protected function getMatchedKeywords(string $message): array
    {
        $message = Str::lower($message);
        $matched = [];

        foreach ($this->keywords as $keyword) {
            if (Str::contains($message, Str::lower($keyword))) {
                $matched[] = $keyword;
            }
        }

        return $matched;
    }

    /**
     * Get user's chat history (only stored messages)
     */
    public function getChatHistory(User $user, int $limit = 20): array
    {
        $messages = ChatMessage::where('user_id', $user->id)
            ->where('is_stored', true)
            ->latest()
            ->take($limit)
            ->get()
            ->reverse()
            ->values();

        return $messages->map(fn ($msg) => [
            'id' => $msg->id,
            'user_message' => $msg->user_message,
            'ai_response' => $msg->ai_response,
            'keywords_matched' => $msg->keywords_matched,
            'created_at' => $msg->created_at->format('Y-m-d H:i:s'),
        ])->toArray();
    }

    /**
     * Clear user's chat history
     */
    public function clearChatHistory(User $user): bool
    {
        return ChatMessage::where('user_id', $user->id)->delete() > 0;
    }
}
