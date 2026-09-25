<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trade extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pair',
        'side',
        'entry_price',
        'sl_price',
        'tp_price',
        'exit_price',
        'lot',
        'timeframe',
        'session',
        'reason',
        'status',
        'profit_point',
        'profit_money',
        'rr_ratio',
        'screenshot_before',
        'screenshot_after',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'entry_price' => 'float',
        'sl_price' => 'float',
        'tp_price' => 'float',
        'exit_price' => 'float',
        'lot' => 'float',
        'profit_point' => 'float',
        'profit_money' => 'float',
        'rr_ratio' => 'float',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(TradeUpdate::class)->orderBy('created_at', 'asc');
    }
}
