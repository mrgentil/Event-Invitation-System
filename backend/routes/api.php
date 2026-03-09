<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\RsvpController;
use App\Http\Controllers\Api\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

// Public RSVP (no auth)
Route::get('/rsvp/{token}', [RsvpController::class, 'show']);
Route::post('/rsvp/{token}', [RsvpController::class, 'respond']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/user', [UserController::class, 'update']);
    Route::delete('/user', [UserController::class, 'destroy']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::post('events', [EventController::class, 'store'])->middleware('throttle:10,1');
    Route::get('events', [EventController::class, 'index']);
    Route::get('events/{event}', [EventController::class, 'show']);
    Route::put('events/{event}', [EventController::class, 'update']);
    Route::delete('events/{event}', [EventController::class, 'destroy']);
    Route::post('events/{event}/duplicate', [EventController::class, 'duplicate']);
    Route::post('events/{event}/guests', [GuestController::class, 'store']);
    Route::put('events/{event}/guests/{guest}', [GuestController::class, 'update']);
    Route::delete('events/{event}/guests/{guest}', [GuestController::class, 'destroy']);
    Route::post('events/{event}/guests/import', [GuestController::class, 'import']);
    Route::get('events/{event}/guests/export', [GuestController::class, 'export']);
    Route::post('events/{event}/guests/resend', [GuestController::class, 'resend']);
});
