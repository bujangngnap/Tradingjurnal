<?php

namespace Database\Seeders;

use App\Models\Trade;
use App\Models\TradeUpdate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'raihan@trader.pro'],
            [
                'name' => 'Raihan Trader',
                'password' => Hash::make('password123'),
            ]
        );

        // Trade 1: Running XAUUSD
        $t1 = Trade::create([
            'user_id' => $user->id,
            'pair' => 'XAUUSD',
            'side' => 'BUY',
            'entry_price' => 3765.20,
            'sl_price' => 3760.00,
            'tp_price' => 3780.00,
            'lot' => 0.50,
            'timeframe' => 'M5',
            'session' => 'London',
            'reason' => 'Liquidity sweep below Asian Low + Bullish CHoCH on M5 + FVG tap. Clean RR setup.',
            'status' => 'OPEN',
            'profit_point' => 100.0,
            'profit_money' => 50.0,
            'rr_ratio' => 2.85,
            'screenshot_before' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
            'opened_at' => now()->subHours(2),
        ]);

        TradeUpdate::create([
            'trade_id' => $t1->id,
            'update_type' => 'ENTRY',
            'message' => 'Order Buy limit executed at 3765.20 following M5 confirmation candle.',
            'current_price' => 3765.20,
            'floating_points' => 0.0,
            'floating_money' => 0.0,
            'created_at' => now()->subHours(2),
        ]);

        TradeUpdate::create([
            'trade_id' => $t1->id,
            'update_type' => 'PROGRESS',
            'message' => '🚀 Running update: Price reached 3766.20 (+100 point). Strong bullish momentum.',
            'current_price' => 3766.20,
            'floating_points' => 100.0,
            'floating_money' => 50.0,
            'created_at' => now()->subMinutes(90),
        ]);

        TradeUpdate::create([
            'trade_id' => $t1->id,
            'update_type' => 'SL_TO_BE',
            'message' => '🛡️ Stop Loss moved to Break Even (3765.20). Trade is now completely risk-free.',
            'current_price' => 3768.50,
            'floating_points' => 330.0,
            'floating_money' => 165.0,
            'created_at' => now()->subMinutes(60),
        ]);

        // Trade 2: Closed Win XAUUSD
        $t2 = Trade::create([
            'user_id' => $user->id,
            'pair' => 'XAUUSD',
            'side' => 'SELL',
            'entry_price' => 3778.40,
            'sl_price' => 3783.00,
            'tp_price' => 3762.00,
            'exit_price' => 3762.00,
            'lot' => 0.80,
            'timeframe' => 'M15',
            'session' => 'New York',
            'reason' => 'NY Session High sweep + Bearish Engulfing reject key daily resistance zone.',
            'status' => 'CLOSED_TP',
            'profit_point' => 164.0,
            'profit_money' => 1312.0,
            'rr_ratio' => 3.56,
            'screenshot_before' => 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
            'opened_at' => now()->subDay(),
            'closed_at' => now()->subDay()->addHours(2),
        ]);

        TradeUpdate::create([
            'trade_id' => $t2->id,
            'update_type' => 'ENTRY',
            'message' => 'Sell market order filled at 3778.40 right after NY open volatility push.',
            'current_price' => 3778.40,
            'floating_points' => 0.0,
            'floating_money' => 0.0,
            'created_at' => now()->subDay(),
        ]);

        TradeUpdate::create([
            'trade_id' => $t2->id,
            'update_type' => 'EXIT',
            'message' => '🎯 TAKE PROFIT HIT! Exit price 3762.00 (+164 points). Target liquidity captured cleanly.',
            'current_price' => 3762.00,
            'floating_points' => 164.0,
            'floating_money' => 1312.0,
            'created_at' => now()->subDay()->addHours(2),
        ]);

        // Trade 3: Closed Loss EURUSD
        $t3 = Trade::create([
            'user_id' => $user->id,
            'pair' => 'EURUSD',
            'side' => 'BUY',
            'entry_price' => 1.08450,
            'sl_price' => 1.08320,
            'tp_price' => 1.08850,
            'exit_price' => 1.08320,
            'lot' => 1.00,
            'timeframe' => 'M5',
            'session' => 'London',
            'reason' => 'London expansion retest of M5 demand block. Early invalidation.',
            'status' => 'CLOSED_SL',
            'profit_point' => -13.0,
            'profit_money' => -130.0,
            'rr_ratio' => 3.08,
            'opened_at' => now()->subDays(2),
            'closed_at' => now()->subDays(2)->addMinutes(30),
        ]);

        TradeUpdate::create([
            'trade_id' => $t3->id,
            'update_type' => 'ENTRY',
            'message' => 'Buy limit triggered at 1.08450.',
            'created_at' => now()->subDays(2),
        ]);

        TradeUpdate::create([
            'trade_id' => $t3->id,
            'update_type' => 'EXIT',
            'message' => '🛑 STOP LOSS HIT (-13 pips). Plan respected, no revenge trade.',
            'current_price' => 1.08320,
            'floating_points' => -13.0,
            'floating_money' => -130.0,
            'created_at' => now()->subDays(2)->addMinutes(30),
        ]);
    }
}
