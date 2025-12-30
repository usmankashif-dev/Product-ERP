<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Models\Reservation;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Reservation::with('product', 'client');

        // Filter by product name
        if ($request->filled('product')) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->product . '%');
            });
        }

        // Filter by client name
        if ($request->filled('client')) {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->client . '%');
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by size
        if ($request->filled('size')) {
            $query->where('size', 'like', '%' . $request->size . '%');
        }

        $reservations = $query->get();
        $locations = Product::distinct()->pluck('location')->filter()->values()->toArray();

        return Inertia::render('Reservations/Index', [
            'reservations' => $reservations,
            'filters' => $request->only(['product', 'client', 'status', 'size']),
            'locations' => $locations
        ]);
    }

    public function create(Request $request)
    {
        $products = Product::all();
        $clients = Client::all();
        $locations = Product::distinct()->pluck('location')->filter()->values()->toArray();
        if (empty($locations)) {
            $locations = ['warehouse', 'shop', 'other'];
        }
        $selectedProduct = null;

        if ($request->has('product_id')) {
            $selectedProduct = Product::find($request->product_id);
        }

        return Inertia::render('Reservations/Create', [
            'products' => $products,
            'clients' => $clients,
            'selectedProduct' => $selectedProduct,
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'size' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $clientId = $request->client_id;

        if ($request->filled('newClientName')) {
            $request->validate([
                'newClientName' => 'required|string|max:255',
                'newClientEmail' => 'nullable|email|unique:clients,email',
                'newClientPhone' => 'nullable|string|max:255',
            ]);

            $client = Client::create([
                'name' => $request->newClientName,
                'email' => $request->newClientEmail ?: null,
                'phone' => $request->newClientPhone ?: null,
            ]);
            $clientId = $client->id;
        } else {
            $request->validate([
                'client_id' => 'required|exists:clients,id',
            ]);
        }

        $product = Product::find($request->product_id);
        
        // Handle date - keep it as a string to avoid timezone conversion issues
        $reservationDate = $request->date ? $request->date : null;
        
        // Check if a similar reservation already exists
        $existingReservation = Reservation::where('product_id', $request->product_id)
            ->where('client_id', $clientId)
            ->where('size', $request->size)
            ->whereDate('date', $reservationDate)
            ->where('status', 'pending') // Only merge pending reservations
            ->first();

        // Check stock availability
        $quantityNeeded = (int) $request->quantity; // Always check for the requested quantity
        if ($product->quantity < $quantityNeeded) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        try {
            DB::transaction(function () use ($request, $clientId, $product, $existingReservation, $reservationDate) {
                if ($existingReservation) {
                    // Update existing reservation
                    $oldQuantity = $existingReservation->quantity;
                    $newQuantity = $oldQuantity + (int) $request->quantity;
                    $existingReservation->update([
                        'quantity' => $newQuantity,
                        'reserved_at' => now(), // Update timestamp
                    ]);
                    
                    // Only decrement by the additional quantity
                    $product->decrement('quantity', (int) $request->quantity);
                } else {
                    // Create new reservation
                    Reservation::create([
                        'product_id' => $request->product_id,
                        'client_id' => $clientId,
                        'quantity' => (int) $request->quantity,
                        'size' => $request->size,
                        'location' => $request->location,
                        'date' => $reservationDate,
                        'reserved_at' => now(),
                    ]);

                    // Decrease product quantity
                    $product->decrement('quantity', (int) $request->quantity);
                }
            });

            $message = $existingReservation ? 'Reservation quantity added to existing reservation.' : 'Reservation created successfully.';
            return redirect()->route('reservations.index')->with('success', $message);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create reservation: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Reservation $reservation)
    {
        $reservation->load('product', 'client');

        return Inertia::render('Reservations/Show', [
            'reservation' => $reservation
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation)
    {
        $reservation->load('product', 'client');
        $products = Product::all();
        $clients = Client::all();
        $locations = Product::distinct()->pluck('location')->filter()->values()->toArray();
        if (empty($locations)) {
            $locations = ['warehouse', 'shop', 'other'];
        }

        return Inertia::render('Reservations/Edit', [
            'reservation' => $reservation,
            'products' => $products,
            'clients' => $clients,
            'locations' => $locations
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Reservation $reservation)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'client_id' => 'required|exists:clients,id',
            'quantity' => 'required|integer|min:1',
            'size' => 'nullable|string|max:255',
            'date' => 'nullable|date_format:Y-m-d',
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $oldQuantity = intval($reservation->quantity);
        $oldProductId = intval($reservation->product_id);
        $newQuantity = intval($request->quantity);
        $newProductId = intval($request->product_id);

        try {
            DB::transaction(function () use ($oldQuantity, $oldProductId, $newQuantity, $newProductId, $request, $reservation) {
                // Handle product quantity adjustments
                if ($oldProductId === $newProductId) {
                    // Same product, adjust quantity difference
                    $quantityDifference = intval($newQuantity - $oldQuantity);
                    
                    if ($quantityDifference > 0) {
                        // Quantity increased, check if enough stock
                        $product = Product::findOrFail($newProductId);
                        $product->refresh(); // Refresh to get latest quantity
                        if ($product->quantity < $quantityDifference) {
                            throw new \Exception('Not enough stock available. Need ' . $quantityDifference . ' but only ' . $product->quantity . ' available.');
                        }
                        $product->decrement('quantity', $quantityDifference);
                    } elseif ($quantityDifference < 0) {
                        // Quantity decreased, add back to stock
                        $product = Product::findOrFail($newProductId);
                        $product->refresh(); // Refresh to get latest quantity
                        $amountToAdd = intval(abs($quantityDifference));
                        $product->increment('quantity', $amountToAdd);
                    }
                    // If quantityDifference == 0, no change needed
                } else {
                    // Different product
                    // Add quantity back to old product
                    $oldProduct = Product::findOrFail($oldProductId);
                    $oldProduct->increment('quantity', $oldQuantity);

                    // Check if new product has enough stock
                    $newProduct = Product::findOrFail($newProductId);
                    if ($newProduct->quantity < $newQuantity) {
                        throw new \Exception('Not enough stock available.');
                    }
                    $newProduct->decrement('quantity', $newQuantity);
                }

                // Update the reservation - use explicit values to avoid any issues
                $reservation->update([
                    'product_id' => $newProductId,
                    'client_id' => intval($request->client_id),
                    'quantity' => $newQuantity,
                    'size' => $request->size,
                    'location' => $request->location,
                    'date' => $request->date,
                    'status' => $request->status,
                ]);
            });

            return redirect()->route('reservations.index')->with('success', 'Reservation updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['quantity' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reservation $reservation)
    {
        try {
            DB::transaction(function () use ($reservation) {
                // Add quantity back to product when reservation is deleted
                $product = Product::find($reservation->product_id);
                $product->increment('quantity', (int) $reservation->quantity);

                $reservation->delete();
            });

            return redirect()->route('reservations.index')->with('success', 'Reservation deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete reservation: ' . $e->getMessage()]);
        }
    }

    public function updateLocation(Request $request, Reservation $reservation)
    {
        $request->validate([
            'location' => 'nullable|string|max:255',
        ]);

        $reservation->update(['location' => $request->location]);

        return back()->with('success', 'Location updated successfully.');
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $reservation->update(['status' => $request->status]);

        return back()->with('success', 'Status updated successfully.');
    }

    public function updateQuantity(Request $request, Reservation $reservation)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $oldQuantity = (int) $reservation->quantity;
        $newQuantity = (int) $request->quantity;
        $quantityDifference = $newQuantity - $oldQuantity;

        try {
            DB::transaction(function () use ($oldQuantity, $newQuantity, $quantityDifference, $reservation) {
                // Adjust product stock based on the quantity change
                if ($quantityDifference != 0) {
                    $product = Product::find($reservation->product_id);
                    
                    if ($quantityDifference < 0) {
                        // Quantity decreased, add back to stock
                        $product->increment('quantity', abs($quantityDifference));
                    } elseif ($quantityDifference > 0) {
                        // Quantity increased, check if enough stock
                        if ($product->quantity < $quantityDifference) {
                            throw new \Exception('Not enough stock available.');
                        }
                        $product->decrement('quantity', $quantityDifference);
                    }
                }

                // Update reservation quantity
                $reservation->update(['quantity' => $newQuantity]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Reservation quantity updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
