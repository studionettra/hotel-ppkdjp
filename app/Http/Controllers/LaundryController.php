<?php

namespace App\Http\Controllers;

use App\Models\LaundryItem;
use App\Models\Guest;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LaundryController extends Controller
{
    public function index(Request $request)
    {
        $query = LaundryItem::with(['guest', 'room'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->service_type, fn ($q) => $q->where('service_type', $request->service_type))
            ->when($request->room_id, fn ($q) => $q->where('room_id', $request->room_id))
            ->latest();

        return Inertia::render('Housekeeping/Laundry/Index', [
            'items'   => $query->paginate(20)->withQueryString(),
            'rooms'   => Room::orderBy('room_number')->get(['id', 'room_number']),
            'filters' => $request->only(['status', 'service_type', 'room_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'guest_id'          => ['required', 'exists:guests,id'],
            'room_id'           => ['required', 'exists:rooms,id'],
            'item_name'         => ['required', 'string', 'max:255'],
            'item_type'         => ['required', 'in:clothes,linen,towel,uniform,other'],
            'quantity'          => ['required', 'integer', 'min:1'],
            'service_type'      => ['required', 'in:regular,express,dry_clean'],
            'unit_price'        => ['required', 'numeric', 'min:0'],
            'estimated_ready_at'=> ['nullable', 'date'],
            'notes'             => ['nullable', 'string'],
        ]);

        $validated['total_price'] = $validated['unit_price'] * $validated['quantity'];
        $validated['received_at'] = now();
        $validated['created_by']  = Auth::id();

        LaundryItem::create($validated);

        return back()->with('success', 'Item laundry berhasil ditambahkan.');
    }

    public function update(Request $request, LaundryItem $laundryItem)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:received,processing,ready,delivered,cancelled'],
            'notes'  => ['nullable', 'string'],
        ]);

        if ($validated['status'] === 'delivered' && !$laundryItem->delivered_at) {
            $validated['delivered_at'] = now();
        }

        $oldStatus = $laundryItem->status;
        $laundryItem->update($validated);

        if ($oldStatus !== 'delivered' && $validated['status'] === 'delivered') {
            if ($laundryItem->createdBy) {
                $laundryItem->createdBy->notify(new \App\Notifications\LaundryOrderCompleted($laundryItem));
            } else {
                $foUsers = \App\Models\User::permission('front_office.view')->get();
                \Illuminate\Support\Facades\Notification::send($foUsers, new \App\Notifications\LaundryOrderCompleted($laundryItem));
            }
        }

        return back()->with('success', 'Status laundry diperbarui.');
    }

    public function destroy(LaundryItem $laundryItem)
    {
        $laundryItem->delete();
        return back()->with('success', 'Item laundry dihapus.');
    }
}
