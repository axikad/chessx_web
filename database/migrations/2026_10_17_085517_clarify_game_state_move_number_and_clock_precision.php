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
        Schema::table('game_states', function (Blueprint $table) {
            $table->renameColumn('move_number', 'fullmove_number');
        });

        Schema::table('game_states', function (Blueprint $table) {
            $table->dateTime('active_clock_started_at', precision: 3)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('game_states', function (Blueprint $table) {
            $table->dateTime('active_clock_started_at')->nullable()->change();
        });

        Schema::table('game_states', function (Blueprint $table) {
            $table->renameColumn('fullmove_number', 'move_number');
        });
    }
};
