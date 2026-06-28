<?php

namespace App\Http\Controllers;

use App\Models\LostAndFound;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LostAndFoundController extends Controller
{
    public function index(Request $request)
    {
        $query = LostAndFound::with(['room', 'reporter'])->latest();
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Housekeeping/LostAndFound/Index', [
            'items' => $query->paginate(15)->withQueryString(),
            'rooms' => Room::orderBy('room_number')->get(['id', 'room_number']),
            'filters' => $request->only('status'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'nullable|exists:rooms,id',
            'found_date' => 'required|date',
            'found_time' => 'required|date_format:H:i',
            'item_description' => 'required|string',
            'location_found' => 'nullable|string|max:255',
            'attendant_name' => 'nullable|string|max:255',
            'status' => 'required|in:stored,claimed,disposed',
        ]);

        $validated['reported_by'] = auth()->id();
        LostAndFound::create($validated);

        return redirect()->back()->with('success', 'Data lost and found berhasil ditambahkan.');
    }

    public function update(Request $request, LostAndFound $lostAndFound)
    {
        $validated = $request->validate([
            'status' => 'required|in:stored,claimed,disposed',
        ]);

        $lostAndFound->update($validated);

        return redirect()->back()->with('success', 'Status berhasil diperbarui.');
    }
}
