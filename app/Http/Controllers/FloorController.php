<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFloorRequest;
use App\Http\Requests\UpdateFloorRequest;
use App\Models\Floor;
use Inertia\Inertia;

class FloorController extends Controller
{
    public function index()
    {
        $floors = Floor::orderBy('floor_number')->get();

        return Inertia::render('Floors/Index', compact('floors'));
    }

    public function store(StoreFloorRequest $request)
    {
        Floor::create($request->validated());

        return back()->with('success', 'Lantai berhasil ditambahkan.');
    }

    public function update(StoreFloorRequest $request, Floor $floor)
    {
        $floor->update($request->validated());

        return back()->with('success', 'Lantai berhasil diperbarui.');
    }

    public function destroy(Floor $floor)
    {
        if ($floor->rooms()->exists()) {
            return back()->with('error', 'Lantai tidak dapat dihapus karena masih memiliki kamar.');
        }

        $floor->delete();

        return back()->with('success', 'Lantai berhasil dihapus.');
    }
}
