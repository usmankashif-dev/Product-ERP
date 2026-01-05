<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = ['product_id', 'product_name', 'client_id', 'client_name', 'client_phone', 'client_address', 'quantity', 'paid_amount', 'total_amount', 'discount_type', 'discount_value', 'discount_amount', 'final_amount', 'size', 'location', 'date', 'sales_date', 'status', 'reserved_at', 'payment_method', 'bank_name', 'image'];

    protected $casts = [
        'reserved_at' => 'datetime',
        'sales_date' => 'date',
        'discount_value' => 'decimal:2',
        'discount_amount' => 'decimal:2',
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
