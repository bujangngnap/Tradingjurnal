<?php

namespace App\Services;

class TradeCalculationService
{
    /**
     * Calculate Risk to Reward ratio
     */
    public function calculateRR(float $entry, float $sl, float $tp): float
    {
        $risk = abs($entry - $sl);
        $reward = abs($tp - $entry);

        if ($risk <= 0.0) {
            return 0.0;
        }

        return round($reward / $risk, 2);
    }

    /**
     * Calculate Profit Points and Profit Money
     *
     * @return array{profit_point: float, profit_money: float}
     */
    public function calculatePnL(string $pair, string $side, float $entry, float $exit, float $lot): array
    {
        $isGold = str_contains(strtoupper($pair), 'XAU') || str_contains(strtoupper($pair), 'GOLD');
        $multiplier = $isGold ? 10.0 : 10000.0;

        $priceDiff = ($side === 'BUY') ? ($exit - $entry) : ($entry - $exit);
        $profitPoint = round($priceDiff * $multiplier, 1);

        // Standard lot contract sizes: Gold 100 oz, FX 100,000 units
        $profitMoney = $isGold 
            ? round($priceDiff * 100.0 * $lot, 2)
            : round($priceDiff * 100000.0 * $lot, 2);

        return [
            'profit_point' => $profitPoint,
            'profit_money' => $profitMoney,
        ];
    }
}
