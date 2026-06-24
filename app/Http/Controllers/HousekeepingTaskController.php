<?php

namespace App\Http\Controllers;

use App\Models\HousekeepingTask;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HousekeepingTaskController extends Controller
{
    public function index(Request $request)
    {
        $query = HousekeepingTask::with(['room.floor', 'assignedTo'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->priority, fn ($q) => $q->where('priority', $request->priority))
            ->when($request->task_type, fn ($q) => $q->where('task_type', $request->task_type))
            ->when($request->room_id, fn ($q) => $q->where('room_id', $request->room_id))
            ->latest();

        return Inertia::render('Housekeeping/Tasks/Index', [
            'tasks'    => $query->paginate(20)->withQueryString(),
            'rooms'    => Room::with('floor')->orderBy('room_number')->get(['id', 'room_number', 'floor_id']),
            'staffList'=> User::role('Housekeeping')->orderBy('name')->get(['id', 'name']),
            'filters'  => $request->only(['status', 'priority', 'task_type', 'room_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id'     => ['required', 'exists:rooms,id'],
            'task_type'   => ['required', 'in:cleaning,inspection,maintenance,deep_clean'],
            'priority'    => ['required', 'in:low,normal,high,urgent'],
            'due_at'      => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'notes'       => ['nullable', 'string'],
        ]);

        HousekeepingTask::create([
            ...$validated,
            'status'     => 'pending',
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Tugas housekeeping berhasil dibuat.');
    }

    public function update(Request $request, HousekeepingTask $housekeepingTask)
    {
        $validated = $request->validate([
            'status'      => ['required', 'in:pending,in_progress,completed,cancelled'],
            'priority'    => ['nullable', 'in:low,normal,high,urgent'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'notes'       => ['nullable', 'string'],
        ]);

        $now = now();
        if ($validated['status'] === 'in_progress' && !$housekeepingTask->started_at) {
            $validated['started_at'] = $now;
        }
        if ($validated['status'] === 'completed' && !$housekeepingTask->completed_at) {
            $validated['completed_at'] = $now;
        }

        $housekeepingTask->update($validated);

        return back()->with('success', 'Tugas berhasil diperbarui.');
    }

    public function destroy(HousekeepingTask $housekeepingTask)
    {
        $housekeepingTask->delete();
        return back()->with('success', 'Tugas berhasil dihapus.');
    }
}
