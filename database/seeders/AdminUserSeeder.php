<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        Artisan::call('iskolarlink:provision-admin', ['--force' => true]);

        $this->command?->info(trim(Artisan::output()));
    }
}
