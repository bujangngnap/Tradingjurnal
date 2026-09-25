<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trade;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    /**
     * Get overview dashboard stats
     */
    public function overview(): JsonResponse
    {
        $allTrades = Trade::all();
        $closedTrades = Trade::where('status', '!=', 'OPEN')->get();

        $totalTrades = $allTrades->count();
        $wins = $closedTrades->where('profit_money', '>', 0);
        $losses = $closedTrades->where('profit_money', '<', 0);

        $winCount = $wins->count();
        $lossCount = $losses->count();
        $winRate = ($closedTrades->count() > 0) 
            ? round(($winCount / $closedTrades->count()) * 100, 1) 
            : 0.0;

        $netProfitMoney = round((float) $closedTrades->sum('profit_money'), 2);
        $netProfitPoints = round((float) $closedTrades->sum('profit_point'), 1);
        $avgRR = ($totalTrades > 0) 
            ? round((float) $allTrades->avg('rr_ratio'), 2) 
            : 0.0;

        // Today's realized profit
        $todayStr = now()->toDateString();
        $todayProfit = round((float) Trade::whereDate('closed_at', $todayStr)->sum('profit_money'), 2);

        return response()->json([
            'success' => true,
            'data' => [
                'totalTrades' => $totalTrades,
                'winRate' => $winRate,
                'winCount' => $winCount,
                'lossCount' => $lossCount,
                'netProfitMoney' => $netProfitMoney,
                'netProfitPoints' => $netProfitPoints,
                'avgRR' => $avgRR,
                'profitToday' => $todayProfit,
                'bestPair' => 'XAUUSD',
                'bestTimeframe' => 'M5',
                'bestSession' => 'London',
            ],
        ]);
    }

    /**
     * Get monthly calendar aggregation
     */
    public function calendar(): JsonResponse
    {
        $trades = Trade::where('status', '!=', 'OPEN')->get();

        $grouped = $trades->groupBy(function ($trade) {
            return $trade->closed_at ? $trade->closed_at->format('Y-m-d') : $trade->opened_at->format('Y-m-d');
        });

        $calendarData = [];
        foreach ($grouped as $date => $items) {
            $netProfit = round((float) $items->sum('profit_money'), 2);
            $calendarData[] = [
                'date' => $date,
                'tradesCount' => $items->count(),
                'netProfit' => $netProfit,
                'isWin' => $netProfit > 0,
                'pairs' => $items->pluck('pair')->unique()->values()->all(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $calendarData,
        ]);
    }
}
