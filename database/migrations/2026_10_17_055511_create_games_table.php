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
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('season_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('region_id')->nullable()->constrained('competition_regions')->restrictOnDelete();
            $table->foreignId('white_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('black_user_id')->constrained('users')->restrictOnDelete();
            $table->unsignedSmallInteger('time_control_seconds')->default(600);
            $table->unsignedSmallInteger('increment_seconds')->default(0);
            $table->string('game_mode', 20)->default('rated');
            $table->string('status', 20)->default('waiting');
            $table->string('result', 20)->nullable();
            $table->string('termination_reason', 40)->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('ended_at')->nullable();
            $table->timestamps();

            $table->index(['white_user_id', 'started_at']);
            $table->index(['black_user_id', 'started_at']);
            $table->index(['tier_id', 'status', 'started_at']);
            $table->index(['region_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
