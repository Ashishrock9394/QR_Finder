<?php

namespace App\Http\Controllers;

use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected $chatbot;

    public function __construct(ChatbotService $chatbot)
    {
        $this->chatbot = $chatbot;
    }

    /**
     * Send a message to the chatbot
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $result = $this->chatbot->sendMessage(
            $request->user(),
            $validated['message']
        );

        return response()->json($result);
    }

    /**
     * Get chat history (stored messages only)
     */
    public function getHistory(Request $request): JsonResponse
    {
        $history = $this->chatbot->getChatHistory($request->user());

        return response()->json([
            'success' => true,
            'messages' => $history,
        ]);
    }

    /**
     * Clear chat history
     */
    public function clearHistory(Request $request): JsonResponse
    {
        $cleared = $this->chatbot->clearChatHistory($request->user());

        return response()->json([
            'success' => $cleared,
            'message' => $cleared ? 'Chat history cleared successfully' : 'No messages to clear',
        ]);
    }
}
