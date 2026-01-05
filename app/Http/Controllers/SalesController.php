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
            'discount_type' => 'nullable|in:amount,percentage',
            'discount_value' => 'nullable|numeric|min:0',
            'shipping_charges' => 'nullable|numeric|min:0',
            'order_date' => 'required|date_format:Y-m-d',
            'dispatch_date' => 'nullable|date_format:Y-m-d',
            'delivered_date' => 'nullable|date_format:Y-m-d',
            'payment_method' => 'required|in:cash,credit_card,debit_card,bank_transfer,check,online_transfer,mobile_wallet,other',
            'bank_name' => 'nullable|string|max:255',
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
                    'shipping_charges' => $validated['shipping_charges'] ?? 0,
                    'order_date' => $validated['order_date'],
                    'dispatch_date' => $validated['dispatch_date'] ?? null,
                    'delivered_date' => $validated['delivered_date'] ?? null,
                    'payment_method' => $validated['payment_method'] ?? null,
                    'bank_name' => $validated['bank_name'] ?? null,
                    'platform' => $validated['platform'] ?? null,
                    'customer_name' => $validated['customer_name'] ?? null,
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'customer_address' => $validated['customer_address'] ?? null,
                ];

                // Calculate discount
                $discountAmount = 0;
                $finalAmount = $validated['total_amount'];
                $shippingCharges = $validated['shipping_charges'] ?? 0;

                if (!empty($validated['discount_type']) && !empty($validated['discount_value'])) {
                    $saleData['discount_type'] = $validated['discount_type'];
                    $saleData['discount_value'] = $validated['discount_value'];

                    if ($validated['discount_type'] === 'amount') {
                        $discountAmount = $validated['discount_value'];
                    } elseif ($validated['discount_type'] === 'percentage') {
                        $discountAmount = ($validated['total_amount'] * $validated['discount_value']) / 100;
                    }

                    $saleData['discount_amount'] = $discountAmount;
                    $finalAmount = $validated['total_amount'] - $discountAmount + $shippingCharges;
                    $saleData['final_amount'] = $finalAmount;
                } else {
                    // No discount, but include shipping charges in final amount
                    $finalAmount = $validated['total_amount'] + $shippingCharges;
                    $saleData['final_amount'] = $finalAmount;
                }

                Sale::create($saleData);

                // If selling from a reservation, deduct from product quantity
                // (product stock was not deducted when reservation was created)
                if (!empty($validated['reservation_id'])) {
                    $reservation = Reservation::findOrFail($validated['reservation_id']);
                    
                    // Deduct the sold quantity from the product
                    $product->decrement('quantity', $validated['quantity']);
                    
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
            'order_date' => 'required|date',
            'dispatch_date' => 'nullable|date',
            'delivered_date' => 'nullable|date',
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

