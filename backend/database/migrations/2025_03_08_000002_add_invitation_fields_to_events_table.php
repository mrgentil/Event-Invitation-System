<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('invitation_subject')->nullable()->after('time');
            $table->text('invitation_body')->nullable()->after('invitation_subject');
            $table->unsignedTinyInteger('reminder_days')->nullable()->after('invitation_body');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['invitation_subject', 'invitation_body', 'reminder_days']);
        });
    }
};
