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
            $query->where(function ($q) use ($request) {
                $q->where('product_name', 'like', '%' . $request->product . '%')
                  ->orWhereHas('product', function ($subQ) use ($request) {
                      $subQ->where('name', 'like', '%' . $request->product . '%');
                  });
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

        $reservations = $query->get()->map(function ($reservation) {
            // Fill in product_name from product if not set (for old reservations)
            if (!$reservation->product_name && $reservation->product) {
                $reservation->product_name = $reservation->product->name;
            }
            return $reservation;
        });
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
            'sales_date' => 'nullable|date_format:Y-m-d',
            'paid_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:amount,percentage',
            'discount_value' => 'nullable|numeric|min:0',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'nullable|string|max:255',
            'client_address' => 'nullable|string',
            'payment_method' => 'nullable|in:cash,bank,credit_card,debit_card,check,online_transfer,mobile_wallet,other',
            'bank_name' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $product = Product::find($request->product_id);
        
        // Handle date - keep it as a string to avoid timezone conversion issues
        $reservationDate = $request->date ? $request->date : null;
        
        // Check if a similar reservation already exists
        $query = Reservation::where('product_id', $request->product_id)
            ->where('client_name', $request->client_name)
            ->where('size', $request->size)
            ->where('status', 'pending'); // Only merge pending reservations
        
        if ($reservationDate) {
            $query->whereDate('date', $reservationDate);
        } else {
            $query->whereNull('date');
        }
        
        $existingReservation = $query->first();

        try {
            DB::transaction(function () use ($request, $product, $existingReservation, $reservationDate) {
                $imagePath = null;
                if ($request->hasFile('image')) {
                    $imagePath = $request->file('image')->store('reservations', 'public');
                }

                if ($existingReservation) {
                    // Update existing reservation
                    $oldQuantity = $existingReservation->quantity;
                    $newQuantity = $oldQuantity + (int) $request->quantity;
                    $updateData = [
                        'quantity' => $newQuantity,
                        'reserved_at' => now(), // Update timestamp
                        'client_name' => $request->client_name,
                        'client_phone' => $request->client_phone,
                        'client_address' => $request->client_address,
                        'payment_method' => $request->filled('payment_method') ? $request->payment_method : 'cash',
                        'bank_name' => $request->filled('bank_name') ? $request->bank_name : null,
                    ];
                    if ($request->filled('paid_amount')) {
                        $updateData['paid_amount'] = $request->paid_amount;
                    }
                    if ($request->filled('total_amount')) {
                        $updateData['total_amount'] = $request->total_amount;
                    }
                    if ($request->filled('sales_date')) {
                        $updateData['sales_date'] = $request->sales_date;
                    }
                    if ($imagePath) {
                        $updateData['image'] = $imagePath;
                    }
                    $existingReservation->update($updateData);
                } else {
                    // Create new reservation
                    $createData = [
                        'product_id' => $request->product_id,
                        'product_name' => $product->name,
                        'quantity' => (int) $request->quantity,
                        'size' => $request->size,
                        'location' => $request->location,
                        'date' => $reservationDate,
                        'paid_amount' => $request->filled('paid_amount') ? $request->paid_amount : 0,
                        'total_amount' => $request->filled('total_amount') ? $request->total_amount : 0,
                        'sales_date' => $request->filled('sales_date') ? $request->sales_date : null,
                        'reserved_at' => now(),
                        'client_name' => $request->client_name,
                        'client_phone' => $request->client_phone,
                        'client_address' => $request->client_address,
                        'payment_method' => $request->filled('payment_method') ? $request->payment_method : 'cash',
                        'bank_name' => $request->filled('bank_name') ? $request->bank_name : null,
                    ];

                    // Calculate discount if provided
                    if ($request->filled('discount_type') && $request->filled('discount_value')) {
                        $createData['discount_type'] = $request->discount_type;
                        $createData['discount_value'] = $request->discount_value;

                        $totalAmount = $request->filled('total_amount') ? $request->total_amount : 0;
                        $discountAmount = 0;

                        if ($request->discount_type === 'amount') {
                            $discountAmount = min($request->discount_value, $totalAmount);
                        } elseif ($request->discount_type === 'percentage') {
                            $discountAmount = ($totalAmount * $request->discount_value) / 100;
                        }

                        $createData['discount_amount'] = $discountAmount;
                        $createData['final_amount'] = $totalAmount - $discountAmount;
                    }

                    if ($imagePath) {
                        $createData['image'] = $imagePath;
                    }
                    Reservation::create($createData);
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
        $reservation->load('product');
        $products = Product::all();
        $locations = Product::distinct()->pluck('location')->filter()->values()->toArray();
        if (empty($locations)) {
            $locations = ['warehouse', 'shop', 'other'];
        }

        return Inertia::render('Reservations/Edit', [
            'reservation' => $reservation,
            'products' => $products,
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
            'quantity' => 'required|integer|min:0',
            'size' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'date' => 'nullable|date_format:Y-m-d',
            'sales_date' => 'nullable|date_format:Y-m-d',
            'paid_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:amount,percentage',
            'discount_value' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,confirmed,cancelled',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'nullable|string|max:255',
            'client_address' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $newQuantity = intval($request->quantity);
        $newProductId = intval($request->product_id);

        try {
            DB::transaction(function () use ($newQuantity, $newProductId, $request, $reservation) {
                $imagePath = null;
                if ($request->hasFile('image')) {
                    $imagePath = $request->file('image')->store('reservations', 'public');
                }

                $updateData = [
                    'product_id' => $newProductId,
                    'product_name' => Product::find($newProductId)->name ?? 'Unknown',
                    'quantity' => $newQuantity,
                    'size' => $request->size,
                    'location' => $request->location,
                    'date' => $request->date,
                    'sales_date' => $request->filled('sales_date') ? $request->sales_date : null,
                    'paid_amount' => $request->filled('paid_amount') ? $request->paid_amount : $reservation->paid_amount,
                    'total_amount' => $request->filled('total_amount') ? $request->total_amount : $reservation->total_amount,
                    'status' => $request->status,
                    'client_name' => $request->client_name,
                    'client_phone' => $request->client_phone,
                    'client_address' => $request->client_address,
                ];

                // Calculate discount if provided
                if ($request->filled('discount_type') && $request->filled('discount_value')) {
                    $updateData['discount_type'] = $request->discount_type;
                    $updateData['discount_value'] = $request->discount_value;

                    $totalAmount = $request->filled('total_amount') ? $request->total_amount : $reservation->total_amount;
                    $discountAmount = 0;

                    if ($request->discount_type === 'amount') {
                        $discountAmount = min($request->discount_value, $totalAmount);
                    } elseif ($request->discount_type === 'percentage') {
                        $discountAmount = ($totalAmount * $request->discount_value) / 100;
                    }

                    $updateData['discount_amount'] = $discountAmount;
                    $updateData['final_amount'] = $totalAmount - $discountAmount;
                } else {
                    $updateData['discount_type'] = null;
                    $updateData['discount_value'] = null;
                    $updateData['discount_amount'] = null;
                    $updateData['final_amount'] = null;
                }

                if ($imagePath) {
                    $updateData['image'] = $imagePath;
                }

                $reservation->update($updateData);
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
                // Simply delete the reservation
                // No need to adjust product quantity since we don't decrement on create
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
            DB::transaction(function () use ($newQuantity, $reservation) {
                // Simply update reservation quantity
                // No product quantity adjustment needed
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
