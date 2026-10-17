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
        Schema::create('tournament_pairings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('round_id')->constrained('tournament_rounds')->cascadeOnDelete();
            $table->foreignId('white_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('black_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('game_id')->nullable()->unique()->constrained('games')->nullOnDelete();
            $table->string('result', 20)->nullable();
            $table->decimal('white_points', 4, 2)->default(0);
            $table->decimal('black_points', 4, 2)->default(0);
            $table->timestamps();

            $table->unique(['round_id', 'white_user_id']);
            $table->unique(['round_id', 'black_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_pairings');
    }
};
