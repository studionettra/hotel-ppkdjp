<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomStatusController extends Controller
{
    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $room->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Status kamar berhasil diperbarui.');
    }
}
