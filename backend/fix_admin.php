<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'admin@lisi.com')->first();
if ($user) {
    $user->is_approved = true;
    $user->is_blocked = false;
    $user->save();
    echo "✅ Admin user updated!\n";
} else {
    echo "❌ Admin user not found\n";
}
