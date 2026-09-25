<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('pair', 20)->default('XAUUSD');
            $table->enum('side', ['BUY', 'SELL'])->default('BUY');
            $table->decimal('entry_price', 15, 5);
            $table->decimal('sl_price', 15, 5);
            $table->decimal('tp_price', 15, 5);
            $table->decimal('exit_price', 15, 5)->nullable();
            $table->decimal('lot', 8, 2)->default(0.50);
            $table->string('timeframe', 10)->default('M5');
            $table->string('session', 30)->nullable();
            $table->text('reason')->nullable();
            $table->enum('status', ['OPEN', 'CLOSED_TP', 'CLOSED_SL', 'CLOSED_BE', 'CLOSED_MANUAL'])->default('OPEN');
            $table->decimal('profit_point', 12, 2)->default(0.00);
            $table->decimal('profit_money', 15, 2)->default(0.00);
            $table->decimal('rr_ratio', 6, 2)->default(0.00);
            $table->longText('screenshot_before')->nullable();
            $table->longText('screenshot_after')->nullable();
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            // Indexing for rapid queries
            $table->index(['pair', 'status']);
            $table->index('opened_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trades');
    }
};
