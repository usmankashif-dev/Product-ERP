<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'size', 'color', 'location', 'quantity', 'price', 'date', 'description', 'image', 'client_name', 'client_phone', 'client_address'];

    protected $casts = [];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
