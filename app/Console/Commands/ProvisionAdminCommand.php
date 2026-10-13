<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ProvisionAdminCommand extends Command
{
    protected $signature = 'iskolarlink:provision-admin
                            {--email= : Admin email (overrides ISKOLARLINK_ADMIN_EMAIL)}
                            {--password= : Admin password (overrides ISKOLARLINK_ADMIN_PASSWORD)}
                            {--password-hash= : Bcrypt hash (overrides ISKOLARLINK_ADMIN_PASSWORD_HASH)}
                            {--name= : Admin name (overrides ISKOLARLINK_ADMIN_NAME)}
                            {--id= : Admin user id (overrides ISKOLARLINK_ADMIN_ID, default admin-1)}
                            {--force : Run in production without confirmation}';

    protected $description = 'Create or update the production admin user from CLI options or environment variables';

    public function handle(): int
    {
        $email = (string) ($this->option('email') ?: $this->adminSetting('admin_email'));
        $name = (string) ($this->option('name') ?: $this->adminSetting('admin_name') ?: 'Administrator');
        $id = (string) ($this->option('id') ?: $this->adminSetting('admin_id') ?: 'admin-1');
        $password = $this->option('password') ?: $this->adminSetting('admin_password');
        $passwordHash = $this->option('password-hash') ?: $this->adminSetting('admin_password_hash');

        if ($email === '') {
            $this->error('Missing admin email.');
            $this->line('Use --email=admin@nemsu.edu.ph or set ISKOLARLINK_ADMIN_EMAIL in Laravel Cloud custom variables.');
            $this->line('Example (works even when env vars are not loaded):');
            $this->line('  php artisan iskolarlink:provision-admin --force --email=admin@nemsu.edu.ph --password=\'#nemsu_2026!\' --name="Admin Director"');

            return self::FAILURE;
        }

        if (! $password && ! $passwordHash) {
            $this->error('Missing admin password.');
            $this->line('Use --password=... or --password-hash=... or ISKOLARLINK_ADMIN_PASSWORD in Cloud env.');

            return self::FAILURE;
        }

        if (! $this->option('force') && ! $this->confirm("Provision admin account {$email}?", true)) {
            return self::SUCCESS;
        }

        $user = User::query()->firstOrNew(['email' => $email]);

        $user->fill([
            'id' => $user->exists ? $user->id : $id,
            'name' => $name,
            'role' => 'admin',
            'avatar' => $user->avatar,
            'profile_json' => $user->profile_json,
            'created_at' => $user->created_at ?? now(),
        ]);

        $user->password = $passwordHash ? (string) $passwordHash : (string) $password;
        $user->save();

        $this->info("Admin ready: {$email} (id: {$user->id})");

        return self::SUCCESS;
    }

    private function adminSetting(string $key): string
    {
        $envKeys = [
            'admin_id' => 'ISKOLARLINK_ADMIN_ID',
            'admin_name' => 'ISKOLARLINK_ADMIN_NAME',
            'admin_email' => 'ISKOLARLINK_ADMIN_EMAIL',
            'admin_password' => 'ISKOLARLINK_ADMIN_PASSWORD',
            'admin_password_hash' => 'ISKOLARLINK_ADMIN_PASSWORD_HASH',
        ];

        $envKey = $envKeys[$key] ?? strtoupper($key);

        foreach ([getenv($envKey), $_ENV[$envKey] ?? null, $_SERVER[$envKey] ?? null] as $value) {
            if (is_string($value) && $value !== '') {
                return $this->stripEnvQuotes($value);
            }
        }

        $value = config("iskolarlink.{$key}");

        return is_string($value) ? $this->stripEnvQuotes($value) : '';
    }

    private function stripEnvQuotes(string $value): string
    {
        $value = trim($value);

        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"'))
            || (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            return substr($value, 1, -1);
        }

        return $value;
    }
}
