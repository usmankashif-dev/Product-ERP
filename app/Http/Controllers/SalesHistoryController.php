<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Inertia\Inertia;

class SalesHistoryController extends Controller
{
    public function index()
    {
        // Fetch all sales with their related product data, ordered by most recent first
        $sales = Sale::with('product')
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'product_id' => $sale->product_id,
                    'product' => [
                        'name' => $sale->product?->name,
                        'size' => $sale->product?->size,
                        'color' => $sale->product?->color,
                        'location' => $sale->product?->location,
                        'price' => $sale->product?->price,
                    ],
                    'client_id' => $sale->client_id,
                    'quantity' => $sale->quantity,
                    'price_per_unit' => $sale->price_per_unit,
                    'total_amount' => $sale->total_amount,
                    'date' => $sale->date,
                    'payment_method' => $sale->payment_method,
                    'platform' => $sale->platform,
                    'created_at' => $sale->created_at,
                ];
            });

        return Inertia::render('SalesHistory', [
            'sales' => $sales,
        ]);
    }
}
