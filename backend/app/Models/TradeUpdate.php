<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TradeUpdate extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'trade_id',
        'update_type',
        'message',
        'current_price',
        'floating_points',
        'floating_money',
        'screenshot_url',
        'created_at',
    ];

    protected $casts = [
        'current_price' => 'float',
        'floating_points' => 'float',
        'floating_money' => 'float',
        'created_at' => 'datetime',
    ];

    public function trade(): BelongsTo
    {
        return $this->belongsTo(Trade::class);
    }
}
