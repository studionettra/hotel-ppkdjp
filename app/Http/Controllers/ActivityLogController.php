<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('causer', 'subject')
            ->when($request->causer_id, fn ($q) => $q->where('causer_id', $request->causer_id))
            ->when($request->log_name, fn ($q) => $q->where('log_name', $request->log_name))
            ->when($request->event, fn ($q) => $q->where('event', $request->event))
            ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest();

        $users = \App\Models\User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('ActivityLog/Index', [
            'logs'    => $query->paginate(25)->withQueryString(),
            'users'   => $users,
            'filters' => $request->only(['causer_id', 'log_name', 'event', 'date_from', 'date_to']),
        ]);
    }
}
