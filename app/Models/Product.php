<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'color', 'location', 'quantity', 'price', 'date', 'description', 'image', 'parent_product_id'];

    protected $casts = [
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function parentProduct()
    {
        return $this->belongsTo(Product::class, 'parent_product_id');
    }

    public function variations()
    {
        return $this->hasMany(Product::class, 'parent_product_id');
    }

    // Get total quantity including all variations
    public function getTotalQuantity()
    {
        if ($this->parent_product_id) {
            return $this->quantity;
        }
        // If it's a parent product, sum its quantity and all variations
        return $this->quantity + $this->variations()->sum('quantity');
    }
}
