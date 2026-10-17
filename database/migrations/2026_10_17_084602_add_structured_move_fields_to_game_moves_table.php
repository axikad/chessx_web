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
        Schema::table('game_moves', function (Blueprint $table) {
            $table->string('piece_color', 5)->nullable()->after('user_id');
            $table->string('piece_type', 10)->nullable()->after('piece_color');
            $table->char('from_square', 2)->nullable()->after('piece_type');
            $table->char('to_square', 2)->nullable()->after('from_square');
            $table->string('captured_piece_type', 10)->nullable()->after('to_square');
            $table->string('promotion_piece', 10)->nullable()->after('captured_piece_type');
            $table->boolean('is_capture')->default(false)->after('promotion_piece');
            $table->boolean('is_castling')->default(false)->after('is_capture');
            $table->boolean('is_en_passant')->default(false)->after('is_castling');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('game_moves', function (Blueprint $table) {
            $table->dropColumn([
                'piece_color',
                'piece_type',
                'from_square',
                'to_square',
                'captured_piece_type',
                'promotion_piece',
                'is_capture',
                'is_castling',
                'is_en_passant',
            ]);
        });
    }
};
