<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trade;
use App\Models\TradeUpdate;
use App\Services\TradeCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TradeController extends Controller
{
    public function __construct(
        protected TradeCalculationService $calcService
    ) {}

    /**
     * Get list of trades with optional status and pair filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Trade::with('updates')->orderBy('opened_at', 'desc');

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->has('pair') && $request->pair !== 'ALL') {
            $query->where('pair', strtoupper($request->pair));
        }

        $trades = $query->get();

        return response()->json([
            'success' => true,
            'data' => $trades,
        ]);
    }

    /**
     * Store new trade entry
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pair' => 'required|string|max:20',
            'side' => 'required|in:BUY,SELL',
            'entry_price' => 'required|numeric|gt:0',
            'sl_price' => 'required|numeric|gt:0',
            'tp_price' => 'required|numeric|gt:0',
            'lot' => 'required|numeric|gt:0',
            'timeframe' => 'required|string|max:10',
            'session' => 'nullable|string|max:30',
            'reason' => 'required|string',
            'screenshot_before' => 'nullable|string',
        ]);

        // Auto calculate Risk:Reward
        $rr = $this->calcService->calculateRR(
            (float) $validated['entry_price'],
            (float) $validated['sl_price'],
            (float) $validated['tp_price']
        );

        $trade = Trade::create([
            'pair' => strtoupper($validated['pair']),
            'side' => $validated['side'],
            'entry_price' => $validated['entry_price'],
            'sl_price' => $validated['sl_price'],
            'tp_price' => $validated['tp_price'],
            'lot' => $validated['lot'],
            'timeframe' => $validated['timeframe'],
            'session' => $validated['session'] ?? null,
            'reason' => $validated['reason'],
            'status' => 'OPEN',
            'rr_ratio' => $rr,
            'profit_point' => 0.0,
            'profit_money' => 0.0,
            'screenshot_before' => $validated['screenshot_before'] ?? null,
            'opened_at' => now(),
        ]);

        // Auto create initial ENTRY update log
        TradeUpdate::create([
            'trade_id' => $trade->id,
            'update_type' => 'ENTRY',
            'message' => "Posisi {$trade->side} dieksekusi di {$trade->entry_price}. SL: {$trade->sl_price} | TP: {$trade->tp_price}",
            'current_price' => $trade->entry_price,
            'floating_points' => 0.0,
            'floating_money' => 0.0,
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trade berhasil dibuka dan dicatat ke feed.',
            'data' => $trade->load('updates'),
        ], 201);
    }

    /**
     * Show single trade details with full timeline
     */
    public function show(int $id): JsonResponse
    {
        $trade = Trade::with('updates')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $trade,
        ]);
    }

    /**
     * Close a trade and calculate final PnL
     */
    public function close(Request $request, int $id): JsonResponse
    {
        $trade = Trade::findOrFail($id);

        $validated = $request->validate([
            'exit_price' => 'required|numeric|gt:0',
            'status' => 'required|in:CLOSED_TP,CLOSED_SL,CLOSED_BE,CLOSED_MANUAL',
            'notes' => 'nullable|string',
        ]);

        $exitPrice = (float) $validated['exit_price'];
        $status = $validated['status'];

        $pnl = $this->calcService->calculatePnL(
            $trade->pair,
            $trade->side,
            (float) $trade->entry_price,
            $exitPrice,
            (float) $trade->lot
        );

        $trade->update([
            'status' => $status,
            'exit_price' => $exitPrice,
            'profit_point' => $pnl['profit_point'],
            'profit_money' => $pnl['profit_money'],
            'closed_at' => now(),
        ]);

        // Create closing EXIT timeline update
        $icon = ($status === 'CLOSED_TP') ? '🎯 TP HIT' : (($status === 'CLOSED_SL') ? '🛑 SL HIT' : '🔒 Trade Ditutup');
        $sign = ($pnl['profit_money'] >= 0) ? '+$' : '-$';
        $absMoney = abs($pnl['profit_money']);

        TradeUpdate::create([
            'trade_id' => $trade->id,
            'update_type' => 'EXIT',
            'message' => "{$icon}: Exit di {$exitPrice} ({$pnl['profit_point']} pts | {$sign}{$absMoney}). " . ($validated['notes'] ?? ''),
            'current_price' => $exitPrice,
            'floating_points' => $pnl['profit_point'],
            'floating_money' => $pnl['profit_money'],
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trade berhasil ditutup dan metrik dihitung.',
            'data' => $trade->load('updates'),
        ]);
    }

    /**
     * Delete trade
     */
    public function destroy(int $id): JsonResponse
    {
        $trade = Trade::findOrFail($id);
        $trade->delete();

        return response()->json([
            'success' => true,
            'message' => 'Trade berhasil dihapus.',
        ]);
    }
}
