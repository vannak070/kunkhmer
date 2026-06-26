<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Clubs Table
        Schema::create('clubs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('name_khmer')->nullable();
            $table->string('location')->nullable();
            $table->string('head_coach')->nullable();
            $table->string('status')->default('active');
            $table->decimal('rating', 3, 2)->default(4.0);
            $table->text('image')->nullable();
            $table->timestamps();
        });

        // 2. Users Table
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('username')->unique();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->string('role')->default('Viewer/Fan');
            $table->string('status')->default('Active');
            $table->uuid('club_id')->nullable();
            $table->timestamp('last_login')->nullable();
            $table->timestamps();

            $table->foreign('club_id')->references('id')->on('clubs')->onDelete('set null');
        });

        // 3. Fighters Table
        Schema::create('fighters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('name_khmer');
            $table->string('alias')->nullable();
            $table->date('date_of_birth');
            $table->string('nationality')->default('Cambodian');
            $table->string('province')->nullable();
            $table->string('gender', 10);
            $table->decimal('current_weight', 5, 2);
            $table->decimal('height', 5, 2);
            $table->uuid('club_id')->nullable();
            $table->text('image')->nullable();
            $table->string('style')->nullable();
            $table->string('record', 50)->nullable();
            $table->string('grade', 5)->default('D');
            $table->string('status', 50)->default('Draft');
            $table->string('professional_status', 50)->default('Professional');
            $table->uuid('verified_by')->nullable();
            $table->timestamp('verified_date')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('club_id')->references('id')->on('clubs')->onDelete('set null');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });

        // 4. Broadcast Stations Table
        Schema::create('broadcast_stations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('stream_url')->nullable();
            $table->string('type')->default('Cable TV');
            $table->string('reach')->default('National');
            $table->boolean('active')->default(true);
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('website_url')->nullable();
            $table->text('logo_url')->nullable();
            $table->timestamps();
        });

        // 5. Sponsors Table
        Schema::create('sponsors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('logo_url')->nullable();
            $table->string('industry')->nullable();
            $table->string('tier')->default('Gold');
            $table->boolean('active')->default(true);
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('website_url')->nullable();
            $table->timestamps();
        });

        // 6. Events Table
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->date('date');
            $table->date('end_date')->nullable();
            $table->string('location');
            $table->string('status')->default('Draft');
            $table->uuid('organizer_id');
            $table->uuid('broadcast_station_id')->nullable();
            $table->uuid('main_sponsor_id')->nullable();
            $table->text('description')->nullable();
            $table->text('image')->nullable();
            $table->timestamp('kkf_approval_date')->nullable();
            $table->uuid('kkf_approved_by')->nullable();
            $table->timestamps();

            $table->foreign('organizer_id')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('broadcast_station_id')->references('id')->on('broadcast_stations')->onDelete('set null');
            $table->foreign('main_sponsor_id')->references('id')->on('sponsors')->onDelete('set null');
            $table->foreign('kkf_approved_by')->references('id')->on('users')->onDelete('set null');
        });

        // 7. Event Sponsors Table
        Schema::create('event_sponsors', function (Blueprint $table) {
            $table->uuid('event_id');
            $table->uuid('sponsor_id');
            $table->primary(['event_id', 'sponsor_id']);

            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('sponsor_id')->references('id')->on('sponsors')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_sponsors');
        Schema::dropIfExists('events');
        Schema::dropIfExists('sponsors');
        Schema::dropIfExists('broadcast_stations');
        Schema::dropIfExists('fighters');
        Schema::dropIfExists('users');
        Schema::dropIfExists('clubs');
    }
};
