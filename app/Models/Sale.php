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
        'date',
        'payment_method',
        'platform',
    ];

    protected $casts = [
        'date' => 'date',
        'total_amount' => 'decimal:2',
        'price_per_unit' => 'decimal:2',
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
