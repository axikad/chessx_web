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
        Schema::create('game_moves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('ply');
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('uci_move', 10);
            $table->string('san_move', 20);
            $table->text('fen_after');
            $table->unsignedBigInteger('clock_remaining_ms');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['game_id', 'ply']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_moves');
    }
};
