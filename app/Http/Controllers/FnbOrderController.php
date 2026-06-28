<?php

namespace App\Http\Controllers;

use App\Models\FnbOrder;
use App\Models\FnbOrderItem;
use App\Models\MenuItem;
use App\Models\Room;
use App\Models\Guest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FnbOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = FnbOrder::with(['guest', 'room', 'createdBy'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->order_type, fn ($q) => $q->where('order_type', $request->order_type))
            ->latest();

        return Inertia::render('Fnb/Orders/Index', [
            'orders'  => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'order_type']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Fnb/Orders/Create', [
            'menuItems' => MenuItem::with('category')
                ->where('is_available', true)
                ->orderBy('name')
                ->get(),
            'rooms'  => Room::orderBy('room_number')->get(['id', 'room_number']),
            'guests' => Guest::orderBy('full_name')->get(['id', 'full_name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_type'   => ['required', 'in:dine_in,room_service,takeaway'],
            'guest_id'     => ['nullable', 'exists:guests,id'],
            'room_id'      => ['nullable', 'exists:rooms,id'],
            'table_number' => ['nullable', 'string', 'max:20'],
            'notes'        => ['nullable', 'string'],
            'items'        => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'items.*.notes'        => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated) {
            $order = FnbOrder::create([
                'order_number' => FnbOrder::generateNumber(),
                'order_type'   => $validated['order_type'],
                'guest_id'     => $validated['guest_id'] ?? null,
                'room_id'      => $validated['room_id'] ?? null,
                'table_number' => $validated['table_number'] ?? null,
                'notes'        => $validated['notes'] ?? null,
                'status'       => 'pending',
                'created_by'   => Auth::id(),
            ]);

            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                $subtotal = $menuItem->price * $item['quantity'];
                FnbOrderItem::create([
                    'order_id'     => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $menuItem->price,
                    'subtotal'     => $subtotal,
                    'notes'        => $item['notes'] ?? null,
                ]);
            }

            $order->recalculate();

            if (!Auth::user()->hasRole('F&B Service') && !Auth::user()->hasRole('Administrator')) {
                $fnbUsers = \App\Models\User::permission('fnb.view')->get();
                \Illuminate\Support\Facades\Notification::send($fnbUsers, new \App\Notifications\FnbOrderRequested($order));
            }
        });

        return redirect()->route('fnb.orders.index')->with('success', 'Pesanan berhasil dibuat.');
    }

    public function show(FnbOrder $fnbOrder)
    {
        return Inertia::render('Fnb/Orders/Show', [
            'order' => $fnbOrder->load(['guest', 'room', 'items.menuItem.category', 'createdBy']),
        ]);
    }

    public function update(Request $request, FnbOrder $fnbOrder)
    {
        $validated = $request->validate([
            'status'         => ['required', 'in:pending,preparing,served,completed,cancelled'],
            'payment_method' => ['nullable', 'in:cash,debit_card,credit_card,transfer,room_charge'],
        ]);

        if ($validated['status'] === 'completed' && !$fnbOrder->paid_at) {
            $validated['paid_at'] = now();
        }

        $oldStatus = $fnbOrder->status;
        $fnbOrder->update($validated);

        if ($oldStatus !== $validated['status'] && in_array($validated['status'], ['served', 'completed'])) {
            if ($fnbOrder->createdBy) {
                $fnbOrder->createdBy->notify(new \App\Notifications\FnbOrderCompleted($fnbOrder));
            }
        }

        return back()->with('success', 'Status pesanan diperbarui.');
    }

    public function destroy(FnbOrder $fnbOrder)
    {
        $fnbOrder->delete();
        return redirect()->route('fnb.orders.index')->with('success', 'Pesanan dihapus.');
    }
}
