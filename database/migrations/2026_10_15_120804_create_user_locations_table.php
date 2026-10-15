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
        Schema::create('user_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->string('verification_method', 20);
            $table->timestamp('verified_at')->nullable();
            $table->string('policy_version', 30)->nullable();
            $table->boolean('is_current')->default(true);
            $table->unsignedBigInteger('current_user_key')->nullable()->storedAs('case when is_current = 1 then user_id else null end');
            $table->timestamps();

            $table->unique('current_user_key', 'user_locations_one_current_unique');
            $table->index(['user_id', 'is_current']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_locations');
    }
};
