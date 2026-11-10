<?php

use App\Http\Controllers\Api\EventApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminEventPackageController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PartnerVerificationController;
use App\Http\Controllers\Api\UserEventController;
use App\Models\PartnerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Kalakai Laravel 13 API is running smoothly!',
        'timestamp' => now()->toIso8601String(),
        'framework' => 'Laravel ' . app()->version(),
    ]);
});

// Kalakai Event & Guestbook Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:8,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:8,1');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::prefix('events')->group(function () {
    Route::get('/{slug}', [EventApiController::class, 'show']);
    Route::get('/{eventSlug}/guest/{guestSlug}', [EventApiController::class, 'showWithGuest']);
    Route::post('/{slug}/rsvp', [EventApiController::class, 'storeRsvp']);
    Route::post('/{slug}/checkin', [EventApiController::class, 'checkin']);
    Route::get('/{slug}/guestbook', [EventApiController::class, 'guestbook']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/dashboard/summary', [DashboardController::class, 'summary'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->prefix('user/events')->group(function () {
    Route::get('/', [UserEventController::class, 'index']);
    Route::post('/', [UserEventController::class, 'store']);
    Route::post('/{eventId}/assets', [UserEventController::class, 'uploadAsset']);
    Route::match(['get', 'post'], '/{eventId}/fonts', [UserEventController::class, 'fonts']);
    Route::get('/{eventId}', [UserEventController::class, 'show']);
    Route::patch('/{eventId}', [UserEventController::class, 'update']);
});
Route::get('/public-assets/{path}', [UserEventController::class, 'publicAsset'])->where('path', '.*');
Route::patch('/admin/partners/{partnerProfile}/status', [PartnerVerificationController::class, 'update'])->middleware('auth:sanctum');
Route::patch('/admin/events/{eventId}/package', [AdminEventPackageController::class, 'update'])->middleware('auth:sanctum');

Route::get('/partners', function () {
    return PartnerProfile::query()
        ->where('status', 'active')
        ->orderBy('business_name')
        ->get(['id', 'business_name', 'logo_url', 'category', 'city', 'description', 'catalog']);
});

Route::get('/partners/{partnerProfile}', function (int $partnerProfile) {
    return PartnerProfile::query()
        ->where('status', 'active')
        ->whereKey($partnerProfile)
        ->firstOrFail(['id', 'business_name', 'logo_url', 'category', 'city', 'description', 'catalog']);
});
