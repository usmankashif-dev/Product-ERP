<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'size', 'color', 'location', 'quantity', 'price', 'date', 'description', 'image'];

    protected $casts = [];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
