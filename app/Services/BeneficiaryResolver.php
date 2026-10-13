<?php

namespace App\Services;

use App\Models\ScholarshipApplication;
use App\Models\User;
use Illuminate\Support\Collection;

final class BeneficiaryResolver
{
    public function __construct(
        private readonly ProgramTypeDetector $programTypeDetector,
    ) {}

    /**
     * @return Collection<int, array{id: string, name: string, email: string}>
     */
    public function forAudience(string $targetAudience): Collection
    {
        $target = trim($targetAudience);

        if (strtolower($target) === 'all-students') {
            return $this->allStudentsWithEmail();
        }

        $rows = ScholarshipApplication::query()
            ->where('status', 'Approved')
            ->with(['student', 'scholarship'])
            ->get()
            ->filter(fn (ScholarshipApplication $app) => $app->student && trim((string) $app->student->email) !== '')
            ->map(fn (ScholarshipApplication $app) => [
                'id' => $app->student->id,
                'name' => $app->student->name,
                'email' => trim($app->student->email),
                'scholarship_title' => $app->scholarship?->title ?? '',
            ]);

        if ($target === '' || strtolower($target) === 'all') {
            return $this->dedupeById($rows);
        }

        $filtered = $rows->filter(function (array $row) use ($target) {
            return $this->programTypeDetector->detect($row['scholarship_title']) === $target;
        });

        return $this->dedupeById($filtered);
    }

    /**
     * @return array{id: string, name: string, email: string}|null
     */
    public function studentById(string $studentId): ?array
    {
        $user = User::query()
            ->where('id', $studentId)
            ->where('role', 'student')
            ->first();

        if (! $user || trim($user->email) === '') {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => trim($user->email),
        ];
    }

    /**
     * @return Collection<int, array{id: string, name: string, email: string}>
     */
    private function allStudentsWithEmail(): Collection
    {
        return User::query()
            ->where('role', 'student')
            ->whereRaw("TRIM(email) <> ''")
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => trim($user->email),
            ])
            ->pipe(fn ($rows) => $this->dedupeById($rows));
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @return Collection<int, array{id: string, name: string, email: string}>
     */
    private function dedupeById(Collection $rows): Collection
    {
        $seen = [];

        return $rows->reduce(function (Collection $carry, array $row) use (&$seen) {
            $id = (string) ($row['id'] ?? '');
            if ($id === '' || isset($seen[$id])) {
                return $carry;
            }
            $seen[$id] = true;

            return $carry->push([
                'id' => $id,
                'name' => (string) ($row['name'] ?? 'Student'),
                'email' => trim((string) ($row['email'] ?? '')),
            ]);
        }, collect());
    }
}
