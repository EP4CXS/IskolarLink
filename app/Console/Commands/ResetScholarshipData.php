<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ResetScholarshipData extends Command
{
    protected $signature = 'iskolarlink:reset-scholarships
                            {--force : Skip confirmation}';

    protected $description = 'Clear scholarship programs, applications, and related history for a fresh start';

    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm(
            'This deletes ALL scholarships, applications, and related history. Users are kept. Continue?'
        )) {
            $this->info('Cancelled.');

            return self::SUCCESS;
        }

        Schema::disableForeignKeyConstraints();

        $tables = [
            'scholarship_history_applicants',
            'scholarship_history',
            'student_application_history',
            'approved_applicants',
            'rejected_applicants',
            'scholarship_applications',
            'scholarships',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
                $this->line("Truncated: {$table}");
            }
        }

        Schema::enableForeignKeyConstraints();

        $this->newLine();
        $this->info('Scholarship data cleared. Log in as admin and create new programs from Manage Scholarships.');

        return self::SUCCESS;
    }
}
