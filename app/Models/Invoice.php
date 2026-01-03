<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'product_id',
        'reservation_id',
        'client_id',
        'invoice_number',
        'quantity',
        'unit_price',
        'total_amount',
        'invoice_date',
        'due_date',
        'status',
        'notes',
        'customer_name',
        'customer_address',
        'customer_phone',
        'location',
        'image',
        'discount',
        'tax',
        'payment_method',
        'received_amount',
        'subtotal',
        'total_invoice',
        'balance',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'received_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'total_invoice' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
