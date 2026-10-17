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
        Schema::table('countries', function (Blueprint $table) {
            $table->unsignedBigInteger('geonames_id')->nullable()->unique()->after('id');
        });

        Schema::table('states', function (Blueprint $table) {
            $table->unsignedBigInteger('geonames_id')->nullable()->unique()->after('id');
            $table->string('geonames_code', 20)->nullable()->after('code');
            $table->index(['country_id', 'geonames_code']);
        });

        Schema::table('cities', function (Blueprint $table) {
            $table->index('state_id');
            $table->dropUnique(['state_id', 'normalized_name']);
            $table->string('name', 200)->change();
            $table->string('normalized_name', 200)->change();
            $table->unsignedBigInteger('geonames_id')->nullable()->unique()->after('id');
            $table->string('district', 200)->nullable()->after('normalized_name');
            $table->index(['state_id', 'normalized_name']);
            $table->index(['status', 'latitude', 'longitude'], 'cities_location_lookup_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cities', function (Blueprint $table) {
            $table->dropIndex('cities_location_lookup_index');
            $table->dropIndex(['state_id', 'normalized_name']);
            $table->dropUnique(['geonames_id']);
            $table->dropColumn(['geonames_id', 'district']);
            $table->string('name', 150)->change();
            $table->string('normalized_name', 150)->change();
            $table->unique(['state_id', 'normalized_name']);
            $table->dropIndex(['state_id']);
        });

        Schema::table('states', function (Blueprint $table) {
            $table->dropIndex(['country_id', 'geonames_code']);
            $table->dropUnique(['geonames_id']);
            $table->dropColumn(['geonames_id', 'geonames_code']);
        });

        Schema::table('countries', function (Blueprint $table) {
            $table->dropUnique(['geonames_id']);
            $table->dropColumn('geonames_id');
        });
    }
};
