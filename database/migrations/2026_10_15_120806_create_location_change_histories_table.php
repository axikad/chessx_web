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
        Schema::create('location_change_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('old_city_id')->nullable()->constrained('cities')->nullOnDelete();
            $table->foreignId('new_city_id')->constrained('cities')->restrictOnDelete();
            $table->foreignId('change_request_id')->nullable()->constrained('location_change_requests')->nullOnDelete();
            $table->timestamp('changed_at')->useCurrent();
            $table->timestamp('created_at')->nullable();

            $table->index(['user_id', 'changed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('location_change_histories');
    }
};
