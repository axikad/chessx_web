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
        Schema::create('rating_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('game_id')->constrained()->restrictOnDelete();
            $table->integer('rating_before');
            $table->integer('rating_after');
            $table->integer('rating_change');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['game_id', 'user_id']);
            $table->index(['user_id', 'tier_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rating_histories');
    }
};
