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
        Schema::table('matchmaking_queue', function (Blueprint $table) {
            $table->index('tier_id', 'matchmaking_queue_tier_id_migration_index');
        });

        Schema::table('matchmaking_queue', function (Blueprint $table) {
            $table->dropIndex('matchmaking_search_index');
            $table->dropUnique('matchmaking_queue_queued_user_key_unique');
        });

        Schema::table('matchmaking_queue', function (Blueprint $table) {
            $table->renameColumn('rating_range', 'rating_tolerance');
            $table->dropColumn('queued_user_key');
        });

        Schema::table('matchmaking_queue', function (Blueprint $table) {
            $table->string('game_mode', 20)->default('rated')->after('region_id');
            $table->unsignedSmallInteger('time_control_seconds')->default(600)->after('game_mode');
            $table->unsignedSmallInteger('increment_seconds')->default(0)->after('time_control_seconds');
            $table->unsignedBigInteger('active_queue_user_id')->nullable()->storedAs("case when status = 'queued' then user_id else null end");

            $table->unique('active_queue_user_id');
            $table->index(
                ['tier_id', 'region_id', 'game_mode', 'time_control_seconds', 'increment_seconds', 'status', 'rating', 'queued_at'],
                'matchmaking_search_index',
            );
            $table->dropIndex('matchmaking_queue_tier_id_migration_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matchmaking_queue', function (Blueprint $table) {
            $table->index('tier_id', 'matchmaking_queue_tier_id_migration_index');
        });

        Schema::table('matchmaking_queue', function (Blueprint $table) {
            $table->dropIndex('matchmaking_search_index');
            $table->dropUnique('matchmaking_queue_active_queue_user_id_unique');
            $table->dropColumn(['game_mode', 'time_control_seconds', 'increment_seconds', 'active_queue_user_id']);
        });

        Schema::table('matchmaking_queue', function (Blueprint $table) {
            $table->renameColumn('rating_tolerance', 'rating_range');
            $table->unsignedBigInteger('queued_user_key')->nullable()->storedAs("case when status = 'queued' then user_id else null end");
        });

        Schema::table('matchmaking_queue', function (Blueprint $table) {
            $table->unique('queued_user_key');
            $table->index(['tier_id', 'region_id', 'status', 'rating', 'queued_at'], 'matchmaking_search_index');
            $table->dropIndex('matchmaking_queue_tier_id_migration_index');
        });
    }
};
