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
        Schema::create('promotion_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('to_tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('season_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('promotion_rule_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('rating_at_qualification');
            $table->unsignedInteger('games_at_qualification');
            // The tournaments table is introduced later; its foreign key will be added with that module.
            $table->foreignId('tournament_id')->nullable()->index();
            $table->enum('status', ['pending', 'qualified', 'approved', 'rejected'])->default('pending');
            $table->timestamp('qualified_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_records');
    }
};
