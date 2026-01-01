<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesController extends Controller
{
    /**
     * Store a newly created sale (from modal)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'reservation_id' => 'nullable|exists:reservations,id',
            'quantity' => 'required|integer|min:1',
            'price_per_unit' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'date' => 'required|date_format:Y-m-d',
            'payment_method' => 'required|in:cash,credit_card,debit_card,bank_transfer,check',
            'platform' => 'nullable|string|max:255',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'customer_address' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Get the product
                $product = Product::findOrFail($validated['product_id']);

                // Check if enough stock available
                // If selling from a reservation, check reservation quantity instead
                if (!empty($validated['reservation_id'])) {
                    $reservation = Reservation::findOrFail($validated['reservation_id']);
                    if ($reservation->quantity < $validated['quantity']) {
                        throw new \Exception('Insufficient reservation amount. Available: ' . $reservation->quantity);
                    }
                } else {
                    // Selling from products page - check product quantity
                    if ($product->quantity < $validated['quantity']) {
                        throw new \Exception('Insufficient stock. Available: ' . $product->quantity);
                    }
                }

                // Create the sale record
                $saleData = [
                    'product_id' => $validated['product_id'],
                    'quantity' => $validated['quantity'],
                    'price_per_unit' => $validated['price_per_unit'] ?? null,
                    'total_amount' => $validated['total_amount'],
                    'date' => $validated['date'],
                    'payment_method' => $validated['payment_method'] ?? null,
                    'platform' => $validated['platform'] ?? null,
                    'customer_name' => $validated['customer_name'] ?? null,
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'customer_address' => $validated['customer_address'] ?? null,
                ];
                Sale::create($saleData);

                // If selling from a reservation, only deduct from reservation quantity
                // (product stock was already deducted when reservation was created)
                if (!empty($validated['reservation_id'])) {
                    $reservation = Reservation::findOrFail($validated['reservation_id']);
                    
                    // Deduct the sold quantity from the reservation
                    $newQuantity = $reservation->quantity - $validated['quantity'];
                    if ($newQuantity <= 0) {
                        $reservation->quantity = 0;
                    } else {
                        $reservation->quantity = $newQuantity;
                    }
                    $reservation->save();
                } else {
                    // Selling directly from products page - deduct from product quantity
                    $product->decrement('quantity', $validated['quantity']);
                }
            });

            return redirect()->route('sales.index')->with('success', 'Product sold successfully. Stock and reservations updated.');
        } catch (\Exception $e) {
            return redirect()->route('sales.index')->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sales = Sale::with('product', 'client')->get();
        
        return Inertia::render('Sales/Index', [
            'sales' => $sales,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Sales/Create', [
            'products' => Product::all(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        return Inertia::render('Sales/Show', [
            'sale' => $sale->load('product', 'client'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sale $sale)
    {
        return Inertia::render('Sales/Edit', [
            'sale' => $sale,
            'products' => Product::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'price_per_unit' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        // Update the sale
        $sale->update($validated);

        return redirect('/sales-history')->with('success', 'Sale updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        $product = $sale->product;
        $quantity = $sale->quantity;

        $sale->delete();

        // Restore product quantity
        $product->increment('quantity', $quantity);

        return redirect('/sales-history')->with('success', 'Sale deleted successfully');
    }
}

