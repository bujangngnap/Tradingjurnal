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
        Schema::create('trade_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trade_id')->constrained('trades')->cascadeOnDelete();
            $table->enum('update_type', ['ENTRY', 'PROGRESS', 'SL_TO_BE', 'PARTIAL_TP', 'EXIT', 'NOTE'])->default('PROGRESS');
            $table->text('message');
            $table->decimal('current_price', 15, 5)->nullable();
            $table->decimal('floating_points', 12, 2)->nullable();
            $table->decimal('floating_money', 15, 2)->nullable();
            $table->longText('screenshot_url')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trade_updates');
    }
};
