<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReturn extends Model
{
    protected $table = 'returns';
    
    protected $fillable = [
        'product_id',
        'product_name',
        'quantity',
        'damaged',
        'refund_money',
        'client_id',
        'client_name',
        'client_phone',
        'client_address',
        'reason',
        'status',
        'image',
    ];

    protected $casts = [
        'damaged' => 'boolean',
        'refund_money' => 'boolean',
        'created_at' => 'datetime',
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
