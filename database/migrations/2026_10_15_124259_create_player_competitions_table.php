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
        Schema::create('player_competitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('season_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('locked');
            $table->dateTime('unlocked_at')->nullable();
            $table->unsignedBigInteger('season_key')->storedAs('ifnull(season_id, 0)');
            $table->timestamps();

            $table->unique(['user_id', 'tier_id', 'season_key'], 'player_competitions_player_tier_season_unique');
            $table->index(['tier_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_competitions');
    }
};
