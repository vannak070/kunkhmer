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
        // 1. Matches Table Updates
        Schema::table('matches', function (Blueprint $table) {
            $table->boolean('is_title_match')->default(false);
            $table->uuid('championship_id')->nullable();
            
            $table->foreign('championship_id')->references('id')->on('champions')->onDelete('set null');
        });

        // 2. Events Table Updates
        Schema::table('events', function (Blueprint $table) {
            $table->string('event_type')->default('single-day'); // 'single-day' or 'multi-week'
            $table->boolean('is_tournament')->default(false);
            $table->string('tournament_format')->nullable();
            $table->string('tournament_weight_class')->nullable();
            $table->integer('expected_participants')->default(8);
        });

        // 3. Fighters Table Updates
        Schema::table('fighters', function (Blueprint $table) {
            $table->string('medical_status')->default('Cleared'); // 'Cleared' or 'Suspended'
            $table->date('suspension_end_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fighters', function (Blueprint $table) {
            $table->dropColumn(['medical_status', 'suspension_end_date']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['event_type', 'is_tournament', 'tournament_format', 'tournament_weight_class', 'expected_participants']);
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->dropForeign(['championship_id']);
            $table->dropColumn(['is_title_match', 'championship_id']);
        });
    }
};
