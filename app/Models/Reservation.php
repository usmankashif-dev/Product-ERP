<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = ['product_id', 'client_id', 'quantity', 'size', 'location', 'date', 'status', 'reserved_at', 'payment_method'];

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
