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
        Schema::create('location_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('old_city_id')->constrained('cities')->restrictOnDelete();
            $table->foreignId('new_city_id')->constrained('cities')->restrictOnDelete();
            $table->string('verification_method', 20);
            $table->string('status', 20)->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason', 500)->nullable();
            $table->unsignedBigInteger('pending_user_key')->nullable()->storedAs("case when status = 'pending' then user_id else null end");
            $table->timestamps();

            $table->unique('pending_user_key', 'location_requests_one_pending_unique');
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('location_change_requests');
    }
};
