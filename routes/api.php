<?php
// routes/api.php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OTPController;
use App\Http\Controllers\QRCodeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-otp', [OTPController::class, 'sendOTP']);
Route::post('/verify-otp', [OTPController::class, 'verifyOTP']);

Route::get('/qr-codes/public/{qrCode}', [QRCodeController::class, 'getByQRCode']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('qr-codes', QRCodeController::class);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // User profile routes
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard/stats', [AdminController::class, 'stats']);
        Route::get('/agents', [AdminController::class, 'agents']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/user/{id}/status', [AdminController::class, 'updateStatus']);
    });
});