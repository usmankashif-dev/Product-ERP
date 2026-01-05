<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'product_id',
        'client_id',
        'quantity',
        'price_per_unit',
        'total_amount',
        'discount_type',
        'discount_value',
        'discount_amount',
        'final_amount',
        'order_date',
        'dispatch_date',
        'delivered_date',
        'payment_method',
        'bank_name',
        'shipping_charges',
        'platform',
        'customer_name',
        'customer_phone',
        'customer_address',
    ];

    protected $casts = [
        'order_date' => 'date',
        'dispatch_date' => 'date',
        'delivered_date' => 'date',
        'total_amount' => 'decimal:2',
        'price_per_unit' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_charges' => 'decimal:2',
        'final_amount' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
