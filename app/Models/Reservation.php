<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = ['product_id', 'product_name', 'client_id', 'client_name', 'client_phone', 'client_address', 'quantity', 'paid_amount', 'total_amount', 'size', 'location', 'date', 'status', 'reserved_at', 'payment_method', 'image'];

    protected $casts = [
        'reserved_at' => 'datetime',
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
