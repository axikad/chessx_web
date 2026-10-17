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
        Schema::create('matchmaking_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('region_id')->nullable()->constrained('competition_regions')->restrictOnDelete();
            $table->unsignedInteger('rating');
            $table->unsignedInteger('rating_range')->default(100);
            $table->string('status', 20)->default('queued');
            $table->dateTime('queued_at');
            $table->dateTime('expires_at')->nullable();
            $table->foreignId('matched_game_id')->nullable()->constrained('games')->nullOnDelete();
            $table->unsignedBigInteger('queued_user_key')->nullable()->storedAs("case when status = 'queued' then user_id else null end");
            $table->timestamps();

            $table->unique('queued_user_key');
            $table->index(['tier_id', 'region_id', 'status', 'rating', 'queued_at'], 'matchmaking_search_index');
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matchmaking_queue');
    }
};
