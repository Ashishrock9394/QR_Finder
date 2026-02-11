<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

class SanctumTimeout
{
    protected $timeout = 300; // minutes

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $request->bearerToken()) {
            $token = $user->currentAccessToken();

            if ($token) {
                
                $lastActivity = Carbon::parse($token->last_activity ?? $token->created_at);

                if ($lastActivity->diffInMinutes(now()) > $this->timeout) {
                    $token->delete();

                    return response()->json([
                        'message' => 'Logged out due to inactivity.'
                    ], 401);
                }
                $token->last_activity = now();
                $token->save();
            }
        }

        return $next($request);
    }
}
