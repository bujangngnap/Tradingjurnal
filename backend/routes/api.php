<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\TradeController;
use App\Http\Controllers\Api\TradeUpdateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// API Version 1
Route::prefix('v1')->group(function () {
    // Trades CRUD
    Route::get('/trades', [TradeController::class, 'index']);
    Route::post('/trades', [TradeController::class, 'store']);
    Route::get('/trades/{id}', [TradeController::class, 'show']);
    Route::patch('/trades/{id}/close', [TradeController::class, 'close']);
    Route::delete('/trades/{id}', [TradeController::class, 'destroy']);

    // Trade Timeline Updates
    Route::post('/trades/{id}/updates', [TradeUpdateController::class, 'store']);

    // Analytics & Calendar
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/calendar', [AnalyticsController::class, 'calendar']);
});
