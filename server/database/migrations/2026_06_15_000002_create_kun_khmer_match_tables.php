<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Sub Events Table
        Schema::create('sub_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id');
            $table->string('name');
            $table->integer('week_number');
            $table->date('date');
            $table->string('location');
            $table->string('phase')->default('Qualifier');
            $table->string('status')->default('Scheduled');
            $table->string('batch_number')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        // 2. Matches Table
        Schema::create('matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_id');
            $table->uuid('sub_event_id');
            $table->uuid('fighter_a_id');
            $table->uuid('fighter_b_id');
            $table->integer('rounds');
            $table->integer('round_time');
            $table->integer('knockdown_limit');
            $table->decimal('agreed_weight', 5, 2);
            $table->string('glove_size', 10);
            $table->string('glove_brand');
            $table->boolean('fighter_a_confirmed')->default(false);
            $table->boolean('fighter_b_confirmed')->default(false);
            $table->boolean('referee_confirmed')->default(false);
            $table->timestamp('glove_confirmed_date')->nullable();
            $table->string('status')->default('Draft');
            $table->string('proposal_status')->default('draft');
            $table->string('club_a_response')->default('pending');
            $table->string('club_b_response')->default('pending');
            $table->uuid('referee_id')->nullable();
            $table->json('judge_ids')->nullable(); // Mapped to JSON array
            $table->uuid('winner_id')->nullable();
            $table->timestamps();

            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('sub_event_id')->references('id')->on('sub_events')->onDelete('cascade');
            $table->foreign('fighter_a_id')->references('id')->on('fighters')->onDelete('restrict');
            $table->foreign('fighter_b_id')->references('id')->on('fighters')->onDelete('restrict');
            $table->foreign('referee_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('winner_id')->references('id')->on('fighters')->onDelete('set null');
        });

        // 3. Bout Results Table
        Schema::create('bout_results', function (Blueprint $table) {
            $table->uuid('match_id')->primary();
            $table->uuid('winner_id')->nullable();
            $table->string('method');
            $table->integer('round');
            $table->string('duration')->nullable();
            $table->timestamp('recorded_at')->useCurrent();

            $table->foreign('match_id')->references('id')->on('matches')->onDelete('cascade');
            $table->foreign('winner_id')->references('id')->on('fighters')->onDelete('set null');
        });

        // 4. Champions Table
        Schema::create('champions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title_name');
            $table->string('champion_type');
            $table->decimal('weight_class', 5, 2);
            $table->string('organization')->default('KKF');
            $table->string('batch_id')->nullable();
            $table->string('event_name')->nullable();
            $table->uuid('current_holder_id')->nullable();
            $table->string('current_holder_name')->nullable();
            $table->string('nationality')->nullable();
            $table->timestamp('date_created')->useCurrent();
            $table->timestamp('date_awarded')->nullable();
            $table->uuid('winning_match_id')->nullable();
            $table->string('status')->default('Vacant');
            $table->integer('defense_count')->default(0);
            $table->date('last_defense_date')->nullable();
            $table->date('next_defense_deadline')->nullable();
            $table->string('belt_image_url', 1024)->nullable();
            $table->string('trophy_image_url', 1024)->nullable();
            $table->string('certificate_url', 1024)->nullable();
            $table->text('notes')->nullable();
            $table->string('approval_status')->default('approved');
            $table->timestamps();

            $table->foreign('current_holder_id')->references('id')->on('fighters')->onDelete('set null');
            $table->foreign('winning_match_id')->references('id')->on('matches')->onDelete('set null');
        });

        // 5. Champion Defenses Table
        Schema::create('champion_defenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('champion_id');
            $table->uuid('event_id')->nullable();
            $table->string('event_name');
            $table->uuid('match_id')->nullable();
            $table->date('date');
            $table->string('opponent');
            $table->uuid('opponent_id')->nullable();
            $table->string('result');
            $table->string('method')->nullable();
            $table->integer('round')->nullable();

            $table->foreign('champion_id')->references('id')->on('champions')->onDelete('cascade');
            $table->foreign('event_id')->references('id')->on('events')->onDelete('set null');
            $table->foreign('match_id')->references('id')->on('matches')->onDelete('set null');
            $table->foreign('opponent_id')->references('id')->on('fighters')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('champion_defenses');
        Schema::dropIfExists('champions');
        Schema::dropIfExists('bout_results');
        Schema::dropIfExists('matches');
        Schema::dropIfExists('sub_events');
    }
};
