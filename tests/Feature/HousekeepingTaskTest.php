<?php

use App\Models\User;
use App\Models\HousekeepingTask;
use Database\Seeders\FloorSeeder;
use Database\Seeders\HousekeepingTaskSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\RoomSeeder;
use Database\Seeders\RoomTypeSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('housekeeping can update task status and trigger notifications for admin and fo users', function () {
    $this->seed([
        PermissionSeeder::class,
        RoleSeeder::class,
        FloorSeeder::class,
        RoomTypeSeeder::class,
        RoomSeeder::class,
        UserSeeder::class,
        HousekeepingTaskSeeder::class,
    ]);

    $hkUser = User::where('username', 'hk1')->first();
    $adminUser = User::where('username', 'admin')->first();
    $foUser = User::where('username', 'fo1')->first();

    expect($hkUser)->not->toBeNull();
    expect($adminUser)->not->toBeNull();
    expect($foUser)->not->toBeNull();

    $task = HousekeepingTask::first();
    expect($task)->not->toBeNull();

    // Set status to pending first to ensure transitions
    $task->update(['status' => 'pending']);

    $this->actingAs($hkUser);

    // 1. Simulasikan tugas dimulai (in_progress)
    $response = $this->put(route('housekeeping.tasks.update', $task->id), [
        'status' => 'in_progress',
        'priority' => 'high',
        'assigned_to' => $hkUser->id,
        'due_at' => '2026-07-02 12:00:00',
        'notes' => 'Mulai dikerjakan',
    ]);

    $response->assertStatus(302);
    $task->refresh();
    expect($task->status)->toBe('in_progress');

    // Verifikasi notifikasi task_started terbuat di database untuk admin dan fo
    $adminNotification = $adminUser->notifications()->where('type', \App\Notifications\HousekeepingTaskStarted::class)->first();
    $foNotification = $foUser->notifications()->where('type', \App\Notifications\HousekeepingTaskStarted::class)->first();
    
    expect($adminNotification)->not->toBeNull();
    expect($adminNotification->data['type'])->toBe('housekeeping_task_started');
    expect($foNotification)->not->toBeNull();
    expect($foNotification->data['type'])->toBe('housekeeping_task_started');

    // 2. Simulasikan tugas selesai (completed)
    $response = $this->put(route('housekeeping.tasks.update', $task->id), [
        'status' => 'completed',
        'priority' => 'high',
        'assigned_to' => $hkUser->id,
        'due_at' => '2026-07-02 12:00:00',
        'completed_at' => '2026-07-01 10:00:00',
        'notes' => 'Selesai dikerjakan',
    ]);

    $response->assertStatus(302);
    $task->refresh();
    expect($task->status)->toBe('completed');

    // Verifikasi notifikasi task_completed terbuat di database untuk admin dan fo
    $adminCompNotification = $adminUser->notifications()->where('type', \App\Notifications\HousekeepingTaskCompleted::class)->first();
    $foCompNotification = $foUser->notifications()->where('type', \App\Notifications\HousekeepingTaskCompleted::class)->first();

    expect($adminCompNotification)->not->toBeNull();
    expect($adminCompNotification->data['type'])->toBe('housekeeping_task_completed');
    expect($foCompNotification)->not->toBeNull();
    expect($foCompNotification->data['type'])->toBe('housekeeping_task_completed');
});
