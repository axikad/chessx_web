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
        Schema::table('promotion_rules', function (Blueprint $table) {
            $table->foreign('qualification_tournament_id')
                ->references('id')
                ->on('tournaments')
                ->nullOnDelete();
        });

        Schema::table('promotion_records', function (Blueprint $table) {
            $table->foreign('tournament_id')
                ->references('id')
                ->on('tournaments')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotion_records', function (Blueprint $table) {
            $table->dropForeign(['tournament_id']);
        });

        Schema::table('promotion_rules', function (Blueprint $table) {
            $table->dropForeign(['qualification_tournament_id']);
        });
    }
};
