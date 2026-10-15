<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->string('username', 30)->nullable()->after('name');
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
        });

        DB::table('users')
            ->select(['id', 'name'])
            ->orderBy('id')
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    $base = Str::of($user->name)
                        ->lower()
                        ->ascii()
                        ->replaceMatches('/[^a-z0-9]+/', '_')
                        ->trim('_')
                        ->limit(20, '')
                        ->value();

                    DB::table('users')->where('id', $user->id)->update([
                        'uuid' => (string) Str::uuid(),
                        'username' => ($base !== '' ? $base : 'user').'_'.$user->id,
                    ]);
                }
            });

        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
            $table->string('username', 30)->nullable(false)->change();
            $table->unique('uuid');
            $table->unique('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropUnique(['username']);
            $table->dropColumn(['uuid', 'username', 'phone_verified_at']);
        });
    }
};
