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
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('season_id')->constrained()->restrictOnDelete();
            $table->foreignId('tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('region_id')->nullable()->constrained('competition_regions')->restrictOnDelete();
            $table->string('name', 200);
            $table->string('format', 20);
            $table->unsignedInteger('min_rating')->nullable();
            $table->unsignedInteger('min_games')->default(0);
            $table->unsignedInteger('max_players')->nullable();
            $table->dateTime('registration_starts_at')->nullable();
            $table->dateTime('registration_ends_at')->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->string('status', 20)->default('draft');
            $table->json('rules_json')->nullable();
            $table->timestamps();

            $table->index(['season_id', 'tier_id', 'region_id', 'status'], 'tournaments_scope_status_index');
            $table->index(['status', 'starts_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournaments');
    }
};
