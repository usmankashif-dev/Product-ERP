<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo 'Before update:' . PHP_EOL;
$reservation = App\Models\Reservation::first();
$product = App\Models\Product::find($reservation->product_id);
echo 'Reservation quantity: ' . $reservation->quantity . PHP_EOL;
echo 'Product quantity: ' . $product->quantity . PHP_EOL;

// Simulate decreasing reservation quantity from 40 to 30
$oldQuantity = $reservation->quantity;
$newQuantity = 30;
$quantityDifference = $newQuantity - $oldQuantity; // -10

echo PHP_EOL . 'Simulating decrease from ' . $oldQuantity . ' to ' . $newQuantity . PHP_EOL;
echo 'Quantity difference: ' . $quantityDifference . PHP_EOL;

if ($quantityDifference < 0) {
    // Quantity decreased, add back to stock
    $product->increment('quantity', abs($quantityDifference));
    $reservation->update(['quantity' => $newQuantity]);
    echo 'Product quantity should increase by ' . abs($quantityDifference) . PHP_EOL;
}

echo PHP_EOL . 'After update:' . PHP_EOL;
$reservation->refresh();
$product->refresh();
echo 'Reservation quantity: ' . $reservation->quantity . PHP_EOL;
echo 'Product quantity: ' . $product->quantity . PHP_EOL;