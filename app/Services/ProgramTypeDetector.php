<?php

namespace App\Services;

final class ProgramTypeDetector
{
    public function detect(?string $title): ?string
    {
        if ($title === null || trim($title) === '') {
            return null;
        }

        $upper = strtoupper($title);

        if (str_contains($upper, 'CHED-CUSCHO') || str_contains($upper, 'CUSCHO')) {
            return 'CHED-CUSCHO';
        }

        if (
            str_contains($upper, 'CHED - TES') ||
            str_contains($upper, 'CHED-TES') ||
            str_contains($upper, 'TERTIARY EDUCATION SUBSIDY') ||
            str_contains($upper, 'TES')
        ) {
            return 'CHED - TES';
        }

        if (
            str_contains($upper, 'CHED-TDP') ||
            str_contains($upper, 'TULONG DUNONG') ||
            str_contains($upper, 'TDP')
        ) {
            return 'CHED-TDP';
        }

        return null;
    }
}
