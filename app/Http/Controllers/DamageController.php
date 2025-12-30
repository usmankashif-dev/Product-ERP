<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Http\Request;

class DamageController extends Controller
{
    public function markProductDamaged(Request $request, Product $product)
    {
        $validated = $request->validate([
            'damaged_amount' => 'required|integer|min:1',
        ]);

        $damagedAmount = $validated['damaged_amount'];

        // Check if damage amount exceeds available quantity
        if ($damagedAmount > $product->quantity) {
            return redirect()->back()->withErrors(['error' => 'Damaged amount cannot exceed current quantity. Available: ' . $product->quantity]);
        }

        // Deduct from quantity
        $product->decrement('quantity', $damagedAmount);
        
        // Increment damaged_amount tracking
        $product->increment('damaged_amount', $damagedAmount);

        return redirect()->back()->with('success', 'Marked ' . $damagedAmount . ' units as damaged');
    }

    public function markReservationDamaged(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'damaged_amount' => 'required|integer|min:1',
        ]);

        $damagedAmount = $validated['damaged_amount'];

        // Check if damage amount exceeds reservation quantity
        if ($damagedAmount > $reservation->quantity) {
            return redirect()->back()->withErrors(['error' => 'Damaged amount cannot exceed reservation quantity. Available: ' . $reservation->quantity]);
        }

        // Deduct from quantity
        $reservation->decrement('quantity', $damagedAmount);
        
        // Increment damaged_amount tracking
        $reservation->increment('damaged_amount', $damagedAmount);

        return redirect()->back()->with('success', 'Marked ' . $damagedAmount . ' units as damaged in reservation');
    }
}
