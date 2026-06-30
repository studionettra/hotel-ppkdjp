<?php

use App\Models\User;
use App\Models\LaundryItem;
use Database\Seeders\FloorSeeder;
use Database\Seeders\GuestSeeder;
use Database\Seeders\LaundryItemSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\RoomSeeder;
use Database\Seeders\RoomTypeSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('housekeeping can update laundry item and set estimated_ready_at', function () {
    // Run seeders to set up database
    $this->seed([
        PermissionSeeder::class,
        RoleSeeder::class,
        FloorSeeder::class,
        RoomTypeSeeder::class,
        RoomSeeder::class,
        GuestSeeder::class,
        UserSeeder::class,
        LaundryItemSeeder::class,
    ]);

    // Retrieve housekeeping user hk1
    $hkUser = User::where('username', 'hk1')->first();
    expect($hkUser)->not->toBeNull();

    // Retrieve an existing laundry item
    $laundryItem = LaundryItem::first();
    expect($laundryItem)->not->toBeNull();

    // Authenticate as hk1
    $this->actingAs($hkUser);

    // Perform status and estimated_ready_at update
    $newEstimatedReadyAt = '2026-07-01 15:30:00';
    $response = $this->put(route('laundry.update', $laundryItem->id), [
        'status' => 'processing',
        'notes' => 'Sedang diproses dengan hati-hati',
        'estimated_ready_at' => $newEstimatedReadyAt,
    ]);

    // Expect redirection back/success
    $response->assertStatus(302);

    // Refresh model from database and assert new values
    $laundryItem->refresh();
    expect($laundryItem->status)->toBe('processing');
    expect($laundryItem->notes)->toBe('Sedang diproses dengan hati-hati');
    expect($laundryItem->estimated_ready_at->toDateTimeString())->toBe($newEstimatedReadyAt);
});
