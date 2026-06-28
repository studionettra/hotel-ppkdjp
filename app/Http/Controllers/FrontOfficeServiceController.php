<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\HousekeepingTask;
use App\Models\FnbOrder;
use App\Models\FolioCharge;
use App\Models\LaundryItem;
use App\Models\User;
use App\Notifications\ExtraBedRequested;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class FrontOfficeServiceController extends Controller
{
    public function orderExtrabed(Request $request, Reservation $reservation)
    {
        $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string']
        ]);

        $checkIn = $reservation->checkIn;
        if (!$checkIn || !$checkIn->guestFolio) {
            return back()->with('error', 'Tamu belum check-in atau tidak ada Folio.');
        }

        DB::transaction(function () use ($request, $reservation, $checkIn) {
            // 1. Create charge in Folio
            FolioCharge::create([
                'folio_id'    => $checkIn->guestFolio->id,
                'charge_type' => 'extrabed',
                'description' => 'Extrabed' . ($request->notes ? ' - ' . $request->notes : ''),
                'quantity'    => 1,
                'unit_price'  => $request->price,
                'amount'      => $request->price,
                'charge_date' => today(),
                'created_by'  => auth()->id(),
            ]);
            $checkIn->guestFolio->recalculate();

            // 2. Create Housekeeping Task
            HousekeepingTask::create([
                'room_id'    => $reservation->room_id,
                'task_type'  => 'extrabed',
                'priority'   => 'high',
                'status'     => 'pending',
                'created_by' => auth()->id(),
                'notes'      => 'Permintaan Extrabed dari FO' . ($request->notes ? ': ' . $request->notes : ''),
                'due_at'     => now()->addMinutes(30),
            ]);

            $users = User::permission('housekeeping.view')->get();
            Notification::send($users, new ExtraBedRequested($task));
        });

        return back()->with('success', 'Pesanan Ekstrabed berhasil dibuat dan diteruskan ke Housekeeping.');
    }

    public function orderFnb(Request $request, Reservation $reservation)
    {
        $request->validate([
            'menu_item_id' => ['required', 'exists:menu_items,id'],
            'quantity'     => ['required', 'integer', 'min:1'],
            'notes'        => ['nullable', 'string']
        ]);

        $checkIn = $reservation->checkIn;
        if (!$checkIn || !$checkIn->guestFolio) {
            return back()->with('error', 'Tamu belum check-in atau tidak ada Folio.');
        }

        DB::transaction(function () use ($request, $reservation, $checkIn) {
            $menuItem = \App\Models\MenuItem::find($request->menu_item_id);
            $totalPrice = $menuItem->price * $request->quantity;

            // 1. Create charge in Folio
            FolioCharge::create([
                'folio_id'    => $checkIn->guestFolio->id,
                'charge_type' => 'fnb',
                'description' => 'F&B: ' . $menuItem->name,
                'quantity'    => $request->quantity,
                'unit_price'  => $menuItem->price,
                'amount'      => $totalPrice,
                'charge_date' => today(),
                'created_by'  => auth()->id(),
            ]);
            $checkIn->guestFolio->recalculate();

            // 2. Create FnbOrder for F&B Department
            $order = FnbOrder::create([
                'order_number' => FnbOrder::generateNumber(),
                'order_type'   => 'room_service',
                'guest_id'     => $reservation->guest_id,
                'room_id'      => $reservation->room_id,
                'status'       => 'pending',
                'created_by'   => auth()->id(),
                'notes'        => 'Pemesanan dari FO: ' . $request->notes,
            ]);

            // 3. Add Item
            $order->items()->create([
                'menu_item_id' => $menuItem->id,
                'item_name'  => $menuItem->name,
                'quantity'   => $request->quantity,
                'unit_price' => $menuItem->price,
                'subtotal'   => $totalPrice,
                'notes'      => $request->notes,
            ]);
            
            // Notification for F&B
            $fnbUsers = User::permission('fnb.view')->get();
            Notification::send($fnbUsers, new \App\Notifications\FnbOrderRequested($order));
        });

        return back()->with('success', 'Pesanan F&B berhasil dibuat dan diteruskan ke bagian F&B.');
    }

    public function orderLaundry(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'item_name'    => ['required', 'string', 'max:255'],
            'item_type'    => ['required', 'in:clothes,linen,towel,uniform,other'],
            'quantity'     => ['required', 'integer', 'min:1'],
            'service_type' => ['required', 'in:regular,express,dry_clean'],
            'unit_price'   => ['required', 'numeric', 'min:0'],
            'notes'        => ['nullable', 'string'],
        ]);

        $checkIn = $reservation->checkIn;
        if (!$checkIn || !$checkIn->guestFolio) {
            return back()->with('error', 'Tamu belum check-in atau tidak ada Folio.');
        }

        DB::transaction(function () use ($data, $checkIn, $reservation) {
            $total_price = $data['quantity'] * $data['unit_price'];
            
            FolioCharge::create([
                'folio_id'    => $checkIn->guestFolio->id,
                'charge_type' => 'laundry',
                'description' => 'Laundry: ' . $data['item_name'] . ($data['notes'] ? ' - ' . $data['notes'] : ''),
                'quantity'    => $data['quantity'],
                'unit_price'  => $data['unit_price'],
                'amount'      => $total_price,
                'charge_date' => now()->toDateString(),
                'created_by'  => auth()->id(),
            ]);
            $checkIn->guestFolio->recalculate();

            $laundry = LaundryItem::create([
                'guest_id'          => $reservation->guest_id,
                'room_id'           => $checkIn->room_id,
                'item_name'         => $data['item_name'],
                'item_type'         => $data['item_type'],
                'quantity'          => $data['quantity'],
                'service_type'      => $data['service_type'],
                'unit_price'        => $data['unit_price'],
                'total_price'       => $total_price,
                'status'            => 'received',
                'received_at'       => now(),
                'notes'             => 'Pesanan dari FO' . ($data['notes'] ? ': ' . $data['notes'] : ''),
                'created_by'        => auth()->id(),
            ]);
            
            // Notification for Housekeeping (Laundry)
            $hkUsers = User::permission('housekeeping.view')->get();
            Notification::send($hkUsers, new \App\Notifications\LaundryOrderRequested($laundry));
        });

        return back()->with('success', 'Pesanan Laundry berhasil ditambahkan dan diteruskan ke Housekeeping.');
    }
}
