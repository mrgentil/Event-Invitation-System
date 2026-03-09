<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->string('status', 20)->default('pending')->after('email');
            $table->string('rsvp_token', 64)->nullable()->unique()->after('status');
        });

        // Backfill rsvp_token for existing guests
        foreach (DB::table('guests')->whereNull('rsvp_token')->get() as $guest) {
            DB::table('guests')->where('id', $guest->id)->update(['rsvp_token' => Str::random(48)]);
        }
    }

    public function down(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn(['status', 'rsvp_token']);
        });
    }
};
