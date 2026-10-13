<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Scholarship;
use App\Models\ScholarshipApplication;
use App\Models\User;
use Illuminate\Support\Carbon;

final class DashboardStatsService
{
    /**
     * @return array<string, mixed>
     */
    public function forAdmin(): array
    {
        $applications = ScholarshipApplication::query()->get();

        $pending = $applications->whereIn('status', ['Pending', 'Under Review'])->count();
        $approved = $applications->where('status', 'Approved')->count();
        $rejected = $applications->where('status', 'Rejected')->count();

        $now = Carbon::now();
        $sevenDays = $now->copy()->addDays(7);

        $expiringScholarships = Scholarship::query()
            ->where('status', 'Active')
            ->whereBetween('deadline', [$now, $sevenDays])
            ->count();

        return [
            'role' => 'admin',
            'applications' => [
                'total' => $applications->count(),
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
                'screened' => $applications->where('status', 'Screened')->count(),
            ],
            'scholarships' => [
                'total' => Scholarship::query()->count(),
                'active' => Scholarship::query()->where('status', 'Active')->count(),
                'closed' => Scholarship::query()->where('status', 'Closed')->count(),
                'expiringWithin7Days' => $expiringScholarships,
            ],
            'users' => [
                'total' => User::query()->count(),
                'students' => User::query()->where('role', 'student')->count(),
                'admins' => User::query()->where('role', 'admin')->count(),
            ],
            'announcements' => [
                'total' => Announcement::query()->count(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function forStudent(string $studentId): array
    {
        $applications = ScholarshipApplication::query()
            ->where('student_id', $studentId)
            ->get();

        $approvedIds = $applications
            ->where('status', 'Approved')
            ->pluck('scholarship_id')
            ->all();

        return [
            'role' => 'student',
            'applications' => [
                'total' => $applications->count(),
                'pending' => $applications->whereIn('status', ['Pending', 'Under Review'])->count(),
                'approved' => $applications->where('status', 'Approved')->count(),
                'rejected' => $applications->where('status', 'Rejected')->count(),
            ],
            'scholarships' => [
                'activePrograms' => Scholarship::query()->where('status', 'Active')->count(),
                'beneficiaryPrograms' => count(array_unique($approvedIds)),
            ],
        ];
    }
}
