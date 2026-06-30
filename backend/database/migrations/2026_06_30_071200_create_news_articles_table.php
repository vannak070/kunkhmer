<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('news_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('subtitle')->nullable(); // mapped to excerpt
            $table->text('content')->nullable();
            $table->string('author')->nullable();
            $table->date('publish_date')->nullable();
            $table->string('status')->default('Draft'); // Draft, Published, Archived
            $table->string('category')->default('General');
            $table->text('featured_image')->nullable();
            $table->integer('views')->default(0);
            $table->json('tags')->nullable();
            $table->boolean('featured')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_articles');
    }
};
