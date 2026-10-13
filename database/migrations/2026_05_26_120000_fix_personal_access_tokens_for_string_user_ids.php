<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Users use string primary keys (e.g. admin-1). Sanctum's default morphs()
     * creates a bigint tokenable_id, which breaks createToken() on PostgreSQL.
     */
    public function up(): void
    {
        if (! Schema::hasTable('personal_access_tokens')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE personal_access_tokens ALTER COLUMN tokenable_id TYPE VARCHAR(36) USING tokenable_id::text');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE personal_access_tokens MODIFY tokenable_id VARCHAR(36) NOT NULL');
        } else {
            Schema::table('personal_access_tokens', function (Blueprint $table) {
                $table->string('tokenable_id', 36)->change();
            });
        }
    }

    public function down(): void
    {
        // No safe rollback once string user ids are in use.
    }
};
