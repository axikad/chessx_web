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
        Schema::create('mobile_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('access_token_id')->nullable()->unique()->constrained('personal_access_tokens')->nullOnDelete();
            $table->string('device_name', 100);
            $table->string('platform', 20);
            $table->char('device_identifier_hash', 64);
            $table->char('refresh_token_hash', 64)->unique();
            $table->timestamp('refresh_token_expires_at');
            $table->timestamp('last_refreshed_at')->nullable();
            $table->string('last_ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'device_identifier_hash']);
            $table->index(['user_id', 'revoked_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_sessions');
    }
};
