<?php

namespace App\Support;

final class ApplicationFormValidator
{
    /** @var list<string> */
    private const PH_PHONE_PATTERNS = [
        '/^09\d{9}$/',
        '/^\+639\d{9}$/',
        '/^639\d{9}$/',
    ];

    public static function normalizePhone(string $phone): string
    {
        return preg_replace('/[\s-]/', '', trim($phone)) ?? '';
    }

    public static function isValidPhilippinePhone(string $phone): bool
    {
        $normalized = self::normalizePhone($phone);
        if ($normalized === '') {
            return false;
        }

        foreach (self::PH_PHONE_PATTERNS as $pattern) {
            if (preg_match($pattern, $normalized) === 1) {
                return true;
            }
        }

        return false;
    }

    public static function isValidGpa(mixed $gpa): bool
    {
        if (! is_numeric($gpa)) {
            return false;
        }

        $value = (float) $gpa;

        return $value >= 0 && $value <= 5;
    }
}
