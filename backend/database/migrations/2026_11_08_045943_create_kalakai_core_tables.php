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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('event_type')->default('wedding'); // wedding, birthday, engagement, etc.
            $table->string('groom_name')->nullable();
            $table->string('bride_name')->nullable();
            $table->dateTime('event_date')->nullable();
            $table->string('location_name')->nullable();
            $table->text('location_address')->nullable();
            $table->text('map_url')->nullable();
            $table->string('spotify_track_id')->nullable(); // Spotify Track or URI
            $table->json('theme_config')->nullable(); // colors, fonts, hero image, love story, quotes, blocks
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('phone')->nullable();
            $table->string('category')->default('Reguler'); // VIP, Keluarga, Teman, Kolega
            $table->integer('pax')->default(2);
            $table->string('qr_code')->unique();
            $table->enum('status', ['pending', 'hadir', 'tidak_hadir', 'ragu'])->default('pending');
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'slug']);
        });

        Schema::create('wishes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_name');
            $table->string('attendance')->default('hadir'); // hadir, tidak_hadir, ragu
            $table->text('message');
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
        });

        Schema::create('gift_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('bank_name'); // BCA, Mandiri, BRI, BNI, Dana, QRIS
            $table->string('account_number');
            $table->string('account_holder');
            $table->string('qris_image_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gift_accounts');
        Schema::dropIfExists('wishes');
        Schema::dropIfExists('guests');
        Schema::dropIfExists('events');
    }
};
