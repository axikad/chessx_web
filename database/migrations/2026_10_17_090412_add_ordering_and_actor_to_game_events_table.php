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
        Schema::table('game_events', function (Blueprint $table) {
            $table->foreignId('actor_user_id')->nullable()->after('game_id')->constrained('users')->nullOnDelete();
            $table->unsignedInteger('sequence_number')->nullable()->after('actor_user_id');
            $table->dateTime('created_at', precision: 3)->useCurrent()->change();

            $table->unique(['game_id', 'sequence_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('game_events', function (Blueprint $table) {
            $table->dropUnique(['game_id', 'sequence_number']);
            $table->dropConstrainedForeignId('actor_user_id');
            $table->dropColumn('sequence_number');
            $table->timestamp('created_at')->useCurrent()->change();
        });
    }
};
