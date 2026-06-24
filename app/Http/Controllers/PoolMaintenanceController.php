<?php

namespace App\Http\Controllers;

use App\Models\PoolMaintenanceLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PoolMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = PoolMaintenanceLog::with(['assignedTo'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->pool_area, fn ($q) => $q->where('pool_area', $request->pool_area))
            ->when($request->maintenance_type, fn ($q) => $q->where('maintenance_type', $request->maintenance_type))
            ->latest();

        return Inertia::render('Housekeeping/Pool/Index', [
            'logs'      => $query->paginate(20)->withQueryString(),
            'staffList' => User::role(['Housekeeping'])->orderBy('name')->get(['id', 'name']),
            'filters'   => $request->only(['status', 'pool_area', 'maintenance_type']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pool_area'        => ['required', 'in:main,kids,indoor,jacuzzi'],
            'maintenance_type' => ['required', 'in:cleaning,chemical_check,equipment_check,repair,inspection'],
            'scheduled_at'     => ['nullable', 'date'],
            'ph_level'         => ['nullable', 'numeric', 'min:0', 'max:14'],
            'chlorine_level'   => ['nullable', 'numeric', 'min:0'],
            'temperature'      => ['nullable', 'numeric'],
            'assigned_to'      => ['nullable', 'exists:users,id'],
            'findings'         => ['nullable', 'string'],
            'action_taken'     => ['nullable', 'string'],
        ]);

        PoolMaintenanceLog::create([
            ...$validated,
            'status'     => 'scheduled',
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Log maintenance kolam berhasil dibuat.');
    }

    public function update(Request $request, PoolMaintenanceLog $poolMaintenanceLog)
    {
        $validated = $request->validate([
            'status'         => ['required', 'in:scheduled,in_progress,completed,cancelled'],
            'ph_level'       => ['nullable', 'numeric', 'min:0', 'max:14'],
            'chlorine_level' => ['nullable', 'numeric', 'min:0'],
            'temperature'    => ['nullable', 'numeric'],
            'findings'       => ['nullable', 'string'],
            'action_taken'   => ['nullable', 'string'],
            'assigned_to'    => ['nullable', 'exists:users,id'],
        ]);

        $now = now();
        if ($validated['status'] === 'in_progress' && !$poolMaintenanceLog->started_at) {
            $validated['started_at'] = $now;
        }
        if ($validated['status'] === 'completed' && !$poolMaintenanceLog->completed_at) {
            $validated['completed_at'] = $now;
        }

        $poolMaintenanceLog->update($validated);

        return back()->with('success', 'Log maintenance diperbarui.');
    }

    public function destroy(PoolMaintenanceLog $poolMaintenanceLog)
    {
        $poolMaintenanceLog->delete();
        return back()->with('success', 'Log maintenance dihapus.');
    }
}
