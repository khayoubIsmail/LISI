<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

   
        'paths' => [
            'api/*', 
            'sanctum/csrf-cookie',
            'partenaires',
            'partenaires/*',
            'admin/partenaires',
            'admin/partenaires/*',
            'axes',
            'axes/*',
            'admin/axes',
            'admin/axes/*',
            'prix-distinctions',
            'prix-distinctions/*',
            'admin/prix-distinctions',
            'admin/prix-distinctions/*'
        ],
    
        'allowed_methods' => ['*'],
    
        'allowed_origins' => [
            env('FRONTEND_URL', 'http://localhost:5173'),
            'http://127.0.0.1:5173',
            'http://localhost:5173'
        ],
    
        'allowed_origins_patterns' => [],
    
        'allowed_headers' => [
            'X-Requested-With',
            'Content-Type',
            'X-Token-Auth',
            'Authorization',
            'X-CSRF-TOKEN',
            'X-XSRF-TOKEN',
        ],
    
        'exposed_headers' => ['Authorization'],
    
        'max_age' => 60 * 60, // 1 hour
    
        'supports_credentials' => true
    
];
