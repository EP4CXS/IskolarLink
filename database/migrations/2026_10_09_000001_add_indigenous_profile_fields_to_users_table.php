<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'ip_status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('ip_status')->nullable();
            });
        }

        if (! Schema::hasColumn('users', 'indigenous_group')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('indigenous_group')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ip_status', 'indigenous_group']);
        });
    }
};
