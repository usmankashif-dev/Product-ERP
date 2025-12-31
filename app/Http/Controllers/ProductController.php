<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('name') && $request->name) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        if ($request->has('size') && $request->size) {
            $query->where('size', $request->size);
        }

        if ($request->has('color') && $request->color) {
            $query->where('color', $request->color);
        }

        if ($request->has('location') && $request->location) {
            $query->where('location', $request->location);
        }

        // Only show products with quantity greater than 0
        $query->where('quantity', '>', 0);

        $products = $query->get();
        $locations = Product::distinct()->pluck('location')->filter()->values()->toArray();
        // Reservations are just for information, not for reducing product quantity
        $reservations = Reservation::where('status', 'pending')->orWhere('status', 'confirmed')->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['name', 'size', 'color', 'location']),
            'locations' => $locations,
            'reservations' => $reservations
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $locations = Product::distinct()->pluck('location')->filter()->values()->toArray();
        if (empty($locations)) {
            $locations = ['warehouse', 'shop', 'other'];
        }
        return Inertia::render('Products/Create', [
            'locations' => $locations
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'size' => 'required|string|max:255',
            'color' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'date' => 'nullable|date',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($data);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return Inertia::render('Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $locations = Product::distinct()->pluck('location')->filter()->values()->toArray();
        if (empty($locations)) {
            $locations = ['warehouse', 'shop', 'other'];
        }
        return Inertia::render('Products/Edit', [
            'product' => $product,
            'locations' => $locations
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'size' => 'required|string|max:255',
            'color' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'date' => 'nullable|date',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image && \Storage::disk('public')->exists($product->image)) {
                \Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    /**
     * Update product location.
     */
    public function updateLocation(Request $request, Product $product)
    {
        $request->validate([
            'location' => 'required|string|max:255',
        ]);

        $product->update(['location' => $request->location]);

        return back()->with('success', 'Location updated successfully.');
    }
}
