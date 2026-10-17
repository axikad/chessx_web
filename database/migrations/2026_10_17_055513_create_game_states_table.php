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
        Schema::create('game_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('fen');
            $table->string('active_color', 5);
            $table->unsignedBigInteger('white_time_ms');
            $table->unsignedBigInteger('black_time_ms');
            $table->dateTime('active_clock_started_at')->nullable();
            $table->unsignedInteger('move_number')->default(1);
            $table->unsignedBigInteger('state_version')->default(0);
            $table->foreignId('draw_offer_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_states');
    }
};
