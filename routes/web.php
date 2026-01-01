<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\SalesHistoryController;
use App\Http\Controllers\DamageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboard');
    }
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/sales-history', [SalesHistoryController::class, 'index'])->name('sales-history.index');
    Route::resource('products', ProductController::class);
    Route::patch('/products/{product}/location', [ProductController::class, 'updateLocation'])->name('products.updateLocation');
    Route::post('/products/{product}/mark-damaged', [DamageController::class, 'markProductDamaged'])->name('products.markDamaged');
    Route::post('/sales', [SalesController::class, 'store'])->name('sales.store');
    Route::resource('reservations', ReservationController::class);
    Route::patch('/reservations/{reservation}/location', [ReservationController::class, 'updateLocation'])->name('reservations.updateLocation');
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->name('reservations.updateStatus');
    Route::post('/reservations/{reservation}/mark-damaged', [DamageController::class, 'markReservationDamaged'])->name('reservations.markDamaged');
    Route::patch('/api/reservations/{reservation}/quantity', [ReservationController::class, 'updateQuantity'])->name('reservations.updateQuantity');
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
    Route::patch('/invoices/{invoice}/status', [InvoiceController::class, 'updateStatus'])->name('invoices.updateStatus');
    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::get('/sales/create', [SalesController::class, 'create'])->name('sales.create');
    Route::post('/sales', [SalesController::class, 'store'])->name('sales.store');
});

require __DIR__.'/auth.php';
