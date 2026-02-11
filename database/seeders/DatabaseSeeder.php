<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Ashish Kumar',
            'mobile' => '9198552556',
            'email' => 'ashishkumar9394@gmail.com',
            'password' => Hash::make('Admin@123'),
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Ashish Kumar',
            'mobile' => '9198552556',
            'email' => 'user@gmail.com',
            'password' => Hash::make('user@123'),
            'role' => 'user',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Ashish Agent',
            'mobile' => '9198552556',
            'email' => 'agent@gmail.com',
            'password' => Hash::make('agent@123'),
            'role' => 'agent',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
    }
}
