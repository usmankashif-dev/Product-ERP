<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo 'Products:' . PHP_EOL;
$products = App\Models\Product::all();
foreach($products as $p) {
    echo $p->name . ': ' . $p->quantity . PHP_EOL;
}

echo 'Reservations:' . PHP_EOL;
$reservations = App\Models\Reservation::with('product')->get();
foreach($reservations as $r) {
    echo 'ID: ' . $r->id . ', Product: ' . $r->product->name . ', Quantity: ' . $r->quantity . PHP_EOL;
}