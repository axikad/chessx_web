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
        Schema::create('ad_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('placement', 100);
            $table->string('event_type', 30);
            $table->string('provider', 100)->nullable();
            $table->string('session_id', 100)->nullable();
            $table->string('provider_event_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['provider', 'provider_event_id']);
            $table->index(['user_id', 'created_at']);
            $table->index(['placement', 'event_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_events');
    }
};
