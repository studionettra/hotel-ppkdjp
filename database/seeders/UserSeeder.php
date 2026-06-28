<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Administrator',
                'username' => 'admin',
                'email'    => 'admin@ppkdhotel.com',
                'password' => Hash::make('admin12345'),
                'is_active' => true,
                'role'     => 'Administrator',
            ],
            [
                'name'     => 'Front Office 1',
                'username' => 'fo1',
                'email'    => 'fo1@ppkdhotel.com',
                'password' => Hash::make('fo12345'),
                'is_active' => true,
                'role'     => 'Front Office',
            ],
            [
                'name'     => 'Housekeeping 1',
                'username' => 'hk1',
                'email'    => 'hk1@ppkdhotel.com',
                'password' => Hash::make('hk12345'),
                'is_active' => true,
                'role'     => 'Housekeeping',
            ],
            [
                'name'     => 'F&B Service 1',
                'username' => 'fnb1',
                'email'    => 'fnb1@ppkdhotel.com',
                'password' => Hash::make('fnb12345'),
                'is_active' => true,
                'role'     => 'F&B Service',
            ],
        ];

        foreach ($users as $data) {
            $role = $data['role'];
            unset($data['role']);

            $user = User::updateOrCreate(
                ['username' => $data['username']],
                $data
            );

            $user->syncRoles([$role]);
        }
    }
}
