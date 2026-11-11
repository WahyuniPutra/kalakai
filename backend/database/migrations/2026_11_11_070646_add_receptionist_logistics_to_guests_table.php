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
        Schema::table('guests', function (Blueprint $table) {
            $table->string('table_number')->nullable()->after('category');
            $table->integer('souvenir_count')->default(1)->after('pax');
            $table->timestamp('souvenir_claimed_at')->nullable()->after('souvenir_count');
            $table->string('envelope_number')->nullable()->after('souvenir_claimed_at');
            $table->boolean('is_vip')->default(false)->after('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn([
                'table_number',
                'souvenir_count',
                'souvenir_claimed_at',
                'envelope_number',
                'is_vip',
            ]);
        });
    }
};
