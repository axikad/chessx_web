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
        Schema::create('competition_regions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tier_id')->constrained('competition_tiers')->restrictOnDelete();
            $table->foreignId('country_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('state_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('scope_key', 100);
            $table->string('name', 200);
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();

            $table->unique(['tier_id', 'scope_key']);
            $table->index(['tier_id', 'country_id', 'state_id', 'city_id'], 'competition_regions_scope_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('competition_regions');
    }
};
