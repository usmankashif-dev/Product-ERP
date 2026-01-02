<?php

namespace App\Http\Controllers;

use App\Models\ProductReturn;
use App\Models\Product;
use App\Models\Client;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReturnController extends Controller
{
    /**
     * Display a listing of returns.
     */
    public function index()
    {
        $returns = ProductReturn::with('product', 'client')->get();
        $damagedProducts = Product::where('damaged_amount', '>', 0)->get();
        $damagedReservations = Reservation::where('damaged_amount', '>', 0)->with('product', 'client')->get();
        
        return Inertia::render('Returns/Index', [
            'returns' => $returns,
            'damagedProducts' => $damagedProducts,
            'damagedReservations' => $damagedReservations,
        ]);
    }

    /**
     * Display the specified return.
     */
    public function show(ProductReturn $productReturn)
    {
        $productReturn->load('product', 'client');

        return Inertia::render('Returns/Show', [
            'productReturn' => $productReturn,
        ]);
    }

    /**
     * Show the form for creating a new return.
     */
    public function create()
    {
        $products = Product::all();
        $clients = Client::all();
        
        return Inertia::render('Returns/Create', [
            'products' => $products,
            'clients' => $clients,
        ]);
    }

    /**
     * Store a newly created return in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'damaged' => 'boolean',
            'refund_money' => 'boolean',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:255',
            'client_address' => 'required|string',
            'reason' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $product = Product::find($validated['product_id']);
        
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('returns', 'public');
        }

        ProductReturn::create([
            'product_id' => $validated['product_id'],
            'product_name' => $product->name,
            'quantity' => $validated['quantity'],
            'damaged' => $request->boolean('damaged'),
            'refund_money' => $request->boolean('refund_money'),
            'client_id' => $request->client_id,
            'client_name' => $validated['client_name'],
            'client_phone' => $validated['client_phone'],
            'client_address' => $validated['client_address'],
            'reason' => $validated['reason'],
            'image' => $imagePath,
            'status' => 'pending',
        ]);

        return redirect()->route('returns.index')->with('success', 'Return created successfully.');
    }

    /**
     * Show the form for editing the specified return.
     */
    public function edit(ProductReturn $productReturn)
    {
        $products = Product::all();
        $clients = Client::all();

        return Inertia::render('Returns/Edit', [
            'productReturn' => $productReturn,
            'products' => $products,
            'clients' => $clients,
        ]);
    }

    /**
     * Update the specified return in storage.
     */
    public function update(Request $request, ProductReturn $productReturn)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'damaged' => 'boolean',
            'refund_money' => 'boolean',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:255',
            'client_address' => 'required|string',
            'reason' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $product = Product::find($validated['product_id']);
        
        $imagePath = $productReturn->image;
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($productReturn->image && \Storage::disk('public')->exists($productReturn->image)) {
                \Storage::disk('public')->delete($productReturn->image);
            }
            $imagePath = $request->file('image')->store('returns', 'public');
        }

        $productReturn->update([
            'product_id' => $validated['product_id'],
            'product_name' => $product->name,
            'quantity' => $validated['quantity'],
            'damaged' => $request->boolean('damaged'),
            'refund_money' => $request->boolean('refund_money'),
            'client_name' => $validated['client_name'],
            'client_phone' => $validated['client_phone'],
            'client_address' => $validated['client_address'],
            'reason' => $validated['reason'],
            'image' => $imagePath,
        ]);

        return redirect()->route('returns.index')->with('success', 'Return updated successfully.');
    }

    /**
     * Delete the specified return.
     */
    public function destroy(ProductReturn $productReturn)
    {
        // Delete image if it exists
        if ($productReturn->image && \Storage::disk('public')->exists($productReturn->image)) {
            \Storage::disk('public')->delete($productReturn->image);
        }

        $productReturn->delete();

        return redirect()->route('returns.index')->with('success', 'Return deleted successfully.');
    }
}
