<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * IskolarLink domain schema (scholarships, applications, announcements, etc.).
     *
     * This migration previously ran on local MySQL but was missing from the repo,
     * so production Postgres never received these tables.
     */
    public function up(): void
    {
        $this->ensureIskolarlinkUsersTable();
        $this->ensureSessionsTable();

        if (! Schema::hasTable('scholarships')) {
            Schema::create('scholarships', function (Blueprint $table) {
                $table->string('id', 36)->primary();
                $table->string('title');
                $table->text('description');
                $table->dateTime('deadline');
                $table->unsignedInteger('slots')->default(0);
                $table->json('benefits_json')->nullable();
                $table->json('criteria_json')->nullable();
                $table->enum('status', ['Active', 'Closed', 'Draft'])->default('Draft');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('scholarship_applications')) {
            Schema::create('scholarship_applications', function (Blueprint $table) {
                $table->string('id', 36)->primary();
                $table->string('student_id', 36);
                $table->string('scholarship_id', 36);
                $table->enum('status', ['Pending', 'Under Review', 'Screened', 'Approved', 'Rejected'])->default('Pending');
                $table->dateTime('submission_date');
                $table->json('timeline_json')->nullable();
                $table->json('documents_json')->nullable();
                $table->json('answers_json')->nullable();
                $table->json('rubric_json')->nullable();
                $table->json('grant_disbursement_json')->nullable();
                $table->json('grant_transactions_json')->nullable();
                $table->dateTime('reviewed_at')->nullable();
                $table->string('reviewed_by', 36)->nullable();
                $table->text('review_note')->nullable();
                $table->timestamps();

                $table->unique(['student_id', 'scholarship_id'], 'uq_application_student_scholarship');
                $table->foreign('student_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('scholarship_id')->references('id')->on('scholarships')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('announcements')) {
            Schema::create('announcements', function (Blueprint $table) {
                $table->string('id', 36)->primary();
                $table->string('title');
                $table->text('content');
                $table->string('author_id', 36);
                $table->string('target_audience', 100)->default('all');
                $table->enum('category', ['general', 'grant-release'])->default('general');
                $table->dateTime('grant_release_date')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('author_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->string('id', 36)->primary();
                $table->string('user_id', 36);
                $table->string('title');
                $table->text('message');
                $table->string('link')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('approved_applicants')) {
            Schema::create('approved_applicants', function (Blueprint $table) {
                $table->id();
                $table->string('application_id', 36)->unique();
                $table->string('student_id', 36);
                $table->string('scholarship_id', 36);
                $table->dateTime('approved_at');
                $table->text('notes')->nullable();
                $table->string('approved_by', 36)->nullable();

                $table->foreign('application_id')->references('id')->on('scholarship_applications')->cascadeOnDelete();
                $table->foreign('student_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('scholarship_id')->references('id')->on('scholarships')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('rejected_applicants')) {
            Schema::create('rejected_applicants', function (Blueprint $table) {
                $table->id();
                $table->string('application_id', 36)->unique();
                $table->string('student_id', 36);
                $table->string('scholarship_id', 36);
                $table->dateTime('rejected_at');
                $table->text('reason')->nullable();
                $table->string('rejected_by', 36)->nullable();

                $table->foreign('application_id')->references('id')->on('scholarship_applications')->cascadeOnDelete();
                $table->foreign('student_id')->references('id')->on('users')->cascadeOnDelete();
                $table->foreign('scholarship_id')->references('id')->on('scholarships')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('scholarship_history')) {
            Schema::create('scholarship_history', function (Blueprint $table) {
                $table->id();
                $table->string('scholarship_id', 36)->unique('uq_history_scholarship');
                $table->string('title');
                $table->string('program_type', 50)->nullable();
                $table->dateTime('ended_at');
                $table->string('ended_by', 36)->nullable();
                $table->unsignedInteger('total_applicants')->default(0);
                $table->unsignedInteger('granted_applicants')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('scholarship_history_applicants')) {
            Schema::create('scholarship_history_applicants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('history_id')->constrained('scholarship_history')->cascadeOnDelete();
                $table->string('application_id', 36);
                $table->string('student_id', 36)->nullable();
                $table->string('applicant_name', 150)->nullable();
                $table->string('applicant_email', 190)->nullable();
                $table->string('status', 30);
                $table->dateTime('submission_date')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->unique(['history_id', 'application_id'], 'uq_history_application');
            });
        }

        if (! Schema::hasTable('student_application_history')) {
            Schema::create('student_application_history', function (Blueprint $table) {
                $table->id();
                $table->string('application_id', 36)->unique();
                $table->string('student_id', 36);
                $table->string('scholarship_id', 36);
                $table->string('scholarship_title');
                $table->string('program_type', 50)->nullable();
                $table->string('status', 30);
                $table->dateTime('submission_date')->nullable();
                $table->dateTime('archived_at');
                $table->string('archived_reason', 60);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('student_application_history');
        Schema::dropIfExists('scholarship_history_applicants');
        Schema::dropIfExists('scholarship_history');
        Schema::dropIfExists('rejected_applicants');
        Schema::dropIfExists('approved_applicants');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('scholarship_applications');
        Schema::dropIfExists('scholarships');
    }

    private function ensureIskolarlinkUsersTable(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role')) {
            return;
        }

        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::enableForeignKeyConstraints();

        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('name', 150);
            $table->string('email', 190)->unique();
            $table->string('password');
            $table->enum('role', ['student', 'admin'])->default('student');
            $table->longText('avatar')->nullable();
            $table->json('profile_json')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    private function ensureSessionsTable(): void
    {
        if (Schema::hasTable('sessions')) {
            return;
        }

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('user_id', 36)->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }
};
