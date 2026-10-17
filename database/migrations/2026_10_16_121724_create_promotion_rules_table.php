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
        Schema::create('promotion_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('to_tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->unsignedInteger('min_rating');
            $table->unsignedInteger('min_games');
            $table->boolean('qualification_required')->default(true);
            // The tournaments table is introduced later; its foreign key will be added with that module.
            $table->foreignId('qualification_tournament_id')->nullable()->index();
            $table->json('rules_json')->nullable();
            $table->timestamp('effective_from');
            $table->timestamp('effective_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['from_tier_id', 'to_tier_id', 'is_active'], 'idx_promotion_rules_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_rules');
    }
};
