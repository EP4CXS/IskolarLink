<?php

return [
    'groq_api_key' => env('GROQ_API_KEY'),
    'groq_model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    'mail_enabled' => filter_var(env('MAIL_ENABLED', true), FILTER_VALIDATE_BOOLEAN),

    'admin_id' => env('ISKOLARLINK_ADMIN_ID', 'admin-1'),
    'admin_name' => env('ISKOLARLINK_ADMIN_NAME', 'Administrator'),
    'admin_email' => env('ISKOLARLINK_ADMIN_EMAIL'),
    'admin_password' => env('ISKOLARLINK_ADMIN_PASSWORD'),
    'admin_password_hash' => env('ISKOLARLINK_ADMIN_PASSWORD_HASH'),
];
