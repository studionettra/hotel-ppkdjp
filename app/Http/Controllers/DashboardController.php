<?php

namespace App\Http\Controllers;

use App\Models\FnbOrder;
use App\Models\HousekeepingTask;
use App\Models\LaundryItem;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\PoolMaintenanceLog;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $permissions = $user->getAllPermissions()->pluck('name')->toArray();
        
        $data = [];
        $today = Carbon::today();
        
        // --- Admin Data ---
        // Assumption: only Administrator role has access to all these views, 
        // we can check if they have 'user.view' as a proxy for Admin, or just check multiple.
        if (in_array('user.view', $permissions) && in_array('dashboard.view', $permissions)) { 
            $data['admin'] = [
                'occupancy_rate' => $this->getOccupancyRate(),
                'revenue_today' => Payment::whereDate('created_at', $today)->sum('amount'),
                'active_guests' => Reservation::where('status', 'checked_in')->sum('adults') + Reservation::where('status', 'checked_in')->sum('children'),
                'available_rooms' => Room::where('status', 'vc')->count(),
                'new_reservations' => Reservation::whereDate('created_at', $today)->count(),
                'ooo_rooms' => Room::whereIn('status', ['ooo', 'oos'])->count(),
                'revenue_trend' => $this->getRevenueTrend(),
                'occupancy_trend' => $this->getOccupancyTrend(),
            ];
        }

        // --- FO Data ---
        if (in_array('reservation.view', $permissions)) {
            $data['fo'] = [
                'todays_arrivals' => Reservation::whereDate('check_in_date', $today)->where('status', 'confirmed')->count(),
                'todays_departures' => Reservation::whereDate('check_out_date', $today)->where('status', 'checked_in')->count(),
                'available_rooms' => Room::whereIn('status', ['vc', 'vd'])->count(),
                'active_reservations' => Reservation::whereIn('status', ['checked_in', 'confirmed'])->count(),
                'arrival_list' => Reservation::with(['guest', 'roomType', 'room'])->whereDate('check_in_date', $today)->where('status', 'confirmed')->get(),
                'departure_list' => Reservation::with(['guest', 'room', 'roomType'])->whereDate('check_out_date', '<=', $today)->where('status', 'checked_in')->get(),
            ];
        }

        // --- Housekeeping Data ---
        if (in_array('housekeeping.view', $permissions)) {
            $data['hk'] = [
                'vacant_dirty' => Room::where('status', 'vd')->count(),
                'occupied_dirty' => Room::where('status', 'od')->count(),
                'pending_laundry' => LaundryItem::whereIn('status', ['received', 'processing'])->count(),
                'cleaning_tasks' => HousekeepingTask::whereIn('status', ['pending', 'assigned', 'in_progress'])->count(),
                'pool_maintenance_due' => PoolMaintenanceLog::whereDate('scheduled_at', '<=', $today)->where('status', 'pending')->count(),
            ];
        }

        // --- F&B Data ---
        if (in_array('fnb.view', $permissions)) {
            $data['fnb'] = [
                'active_orders' => FnbOrder::whereIn('status', ['pending', 'preparing', 'served'])->count(),
                'room_service_orders' => FnbOrder::where('order_type', 'room_service')->whereIn('status', ['pending', 'preparing', 'served'])->count(),
                'restaurant_orders' => FnbOrder::where('order_type', 'dine_in')->whereIn('status', ['pending', 'preparing', 'served'])->count(),
                'revenue_today' => FnbOrder::whereDate('created_at', $today)->sum('total'),
            ];
        }

        return Inertia::render('Dashboard/Index', [
            'dashboardData' => $data,
        ]);
    }

    private function getOccupancyRate()
    {
        $totalRooms = Room::count();
        if ($totalRooms == 0) return 0;
        
        $occupied = Room::whereIn('status', ['oc', 'od'])->count();
        return round(($occupied / $totalRooms) * 100, 1);
    }

    private function getRevenueTrend()
    {
        $trend = ['categories' => [], 'data' => []];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $total = Payment::whereDate('created_at', $date)->sum('amount');
            $trend['categories'][] = $date->format('M d');
            $trend['data'][] = (float) $total;
        }
        return $trend;
    }

    private function getOccupancyTrend()
    {
        $trend = ['categories' => [], 'data' => []];
        $totalRooms = Room::count();
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $occupied = Reservation::whereDate('check_in_date', '<=', $date)
                ->whereDate('check_out_date', '>', $date)
                ->whereIn('status', ['checked_in', 'checked_out'])
                ->count();
            
            $rate = $totalRooms > 0 ? round(($occupied / $totalRooms) * 100, 1) : 0;
            $trend['categories'][] = $date->format('M d');
            $trend['data'][] = $rate;
        }
        return $trend;
    }
}
