<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->uuid('request_key')->nullable();
            $table->unique(['user_id', 'request_key']);
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'request_key']);
            $table->dropColumn('request_key');
        });
    }
};
