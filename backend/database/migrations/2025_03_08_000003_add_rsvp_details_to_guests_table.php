<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->unsignedInteger('attendees_count')->nullable()->after('rsvp_token');
            $table->text('rsvp_message')->nullable()->after('attendees_count');
        });
    }

    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn(['attendees_count', 'rsvp_message']);
        });
    }
};

