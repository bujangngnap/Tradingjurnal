<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trade;
use App\Models\TradeUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TradeUpdateController extends Controller
{
    /**
     * Store new milestone update for a running trade
     */
    public function store(Request $request, int $tradeId): JsonResponse
    {
        $trade = Trade::findOrFail($tradeId);

        $validated = $request->validate([
            'update_type' => 'required|in:ENTRY,PROGRESS,SL_TO_BE,PARTIAL_TP,EXIT,NOTE',
            'message' => 'required|string',
            'current_price' => 'nullable|numeric',
            'floating_points' => 'nullable|numeric',
            'floating_money' => 'nullable|numeric',
            'screenshot_url' => 'nullable|string',
        ]);

        $update = TradeUpdate::create([
            'trade_id' => $trade->id,
            'update_type' => $validated['update_type'],
            'message' => $validated['message'],
            'current_price' => $validated['current_price'] ?? null,
            'floating_points' => $validated['floating_points'] ?? null,
            'floating_money' => $validated['floating_money'] ?? null,
            'screenshot_url' => $validated['screenshot_url'] ?? null,
            'created_at' => now(),
        ]);

        // If floating values supplied, sync to parent trade
        if (isset($validated['floating_points'])) {
            $trade->profit_point = (float) $validated['floating_points'];
        }
        if (isset($validated['floating_money'])) {
            $trade->profit_money = (float) $validated['floating_money'];
        }
        $trade->save();

        return response()->json([
            'success' => true,
            'message' => 'Update live feed berhasil ditambahkan.',
            'data' => $update,
        ], 201);
    }
}
