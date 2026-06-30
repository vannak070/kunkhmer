<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('duration')->nullable();
            $table->string('category')->default('General');
            $table->string('status')->default('Draft');
            $table->json('tags')->nullable();
            $table->uuid('fighter_id')->nullable();
            $table->uuid('club_id')->nullable();
            $table->uuid('match_id')->nullable();
            $table->text('thumbnail')->nullable();
            $table->integer('views')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('fighter_id')->references('id')->on('fighters')->onDelete('set null');
            $table->foreign('club_id')->references('id')->on('clubs')->onDelete('set null');
            $table->foreign('match_id')->references('id')->on('matches')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
