<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('competition_tiers', function (Blueprint $table) {
            $table->string('artwork_path')->nullable()->after('name');
        });

        $artwork = [
            'city' => 'leagues/Lcity.png',
            'state' => 'leagues/Lstate.png',
            'national' => 'leagues/Lnational.png',
            'world' => 'leagues/Lworld.png',
        ];

        foreach ($artwork as $code => $path) {
            DB::table('competition_tiers')->where('code', $code)->update(['artwork_path' => $path]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('competition_tiers', function (Blueprint $table) {
            $table->dropColumn('artwork_path');
        });
    }
};
