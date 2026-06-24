<?php

namespace App\Http\Controllers;

use App\Models\CheckIn;
use App\Models\CheckOut;
use App\Models\FnbOrder;
use App\Models\HousekeepingTask;
use App\Models\LaundryItem;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to   = $request->input('to',   now()->toDateString());

        return Inertia::render('Reports/Index', [
            'filters'     => compact('from', 'to'),
            'occupancy'   => $this->occupancyReport($from, $to),
            'revenue'     => $this->revenueReport($from, $to),
            'housekeeping'=> $this->housekeepingReport($from, $to),
            'fnb'         => $this->fnbReport($from, $to),
        ]);
    }

    private function occupancyReport(string $from, string $to): array
    {
        $totalRooms = Room::count();
        $days       = max(1, (int) now()->parse($from)->diffInDays(now()->parse($to)) + 1);

        $occupied = CheckIn::whereBetween('check_in_time', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->whereHas('reservation', fn ($q) => $q->whereIn('status', ['checked_in', 'checked_out']))
            ->count();

        $checkedOut = CheckOut::whereBetween('check_out_time', [$from . ' 00:00:00', $to . ' 23:59:59'])->count();

        $rate = $totalRooms * $days > 0
            ? round(($occupied / ($totalRooms * $days)) * 100, 1)
            : 0;

        $byStatus = Room::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            'total_rooms'   => $totalRooms,
            'check_ins'     => $occupied,
            'check_outs'    => $checkedOut,
            'occupancy_rate'=> $rate,
            'by_status'     => $byStatus,
        ];
    }

    private function revenueReport(string $from, string $to): array
    {
        $payments = Payment::whereBetween('payment_date', [$from, $to])
            ->where('payment_type', 'payment')
            ->select('payment_method', DB::raw('sum(amount) as total'))
            ->groupBy('payment_method')
            ->pluck('total', 'payment_method');

        $deposits = Payment::whereBetween('payment_date', [$from, $to])
            ->where('payment_type', 'deposit')
            ->sum('amount');

        $refunds = Payment::whereBetween('payment_date', [$from, $to])
            ->where('payment_type', 'refund')
            ->sum('amount');

        $fnbRevenue = FnbOrder::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->where('status', 'completed')
            ->sum('total');

        $laundryRevenue = LaundryItem::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->whereIn('status', ['delivered'])
            ->sum('total_price');

        $totalRevenue = $payments->sum() + $fnbRevenue + $laundryRevenue;

        return [
            'by_method'      => $payments,
            'deposits'       => (float) $deposits,
            'refunds'        => (float) $refunds,
            'fnb_revenue'    => (float) $fnbRevenue,
            'laundry_revenue'=> (float) $laundryRevenue,
            'total'          => (float) $totalRevenue,
        ];
    }

    private function housekeepingReport(string $from, string $to): array
    {
        $tasks = HousekeepingTask::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $total     = $tasks->sum();
        $completed = $tasks->get('completed', 0);
        $rate      = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

        $byType = HousekeepingTask::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('task_type', DB::raw('count(*) as count'))
            ->groupBy('task_type')
            ->pluck('count', 'task_type');

        $laundry = LaundryItem::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            'tasks_total'      => $total,
            'tasks_completed'  => $completed,
            'completion_rate'  => $rate,
            'by_status'        => $tasks,
            'by_type'          => $byType,
            'laundry_by_status'=> $laundry,
        ];
    }

    private function fnbReport(string $from, string $to): array
    {
        $orders = FnbOrder::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59']);

        $byType = (clone $orders)
            ->select('order_type', DB::raw('count(*) as count'), DB::raw('sum(total) as revenue'))
            ->groupBy('order_type')
            ->get()
            ->keyBy('order_type');

        $byStatus = (clone $orders)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $topItems = DB::table('fnb_order_items')
            ->join('fnb_orders', 'fnb_orders.id', '=', 'fnb_order_items.order_id')
            ->join('menu_items', 'menu_items.id', '=', 'fnb_order_items.menu_item_id')
            ->whereBetween('fnb_orders.created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('menu_items.name', DB::raw('sum(fnb_order_items.quantity) as total_qty'), DB::raw('sum(fnb_order_items.subtotal) as revenue'))
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        return [
            'total_orders'  => (clone $orders)->count(),
            'total_revenue' => (float) (clone $orders)->where('status', 'completed')->sum('total'),
            'by_type'       => $byType,
            'by_status'     => $byStatus,
            'top_items'     => $topItems,
        ];
    }
}
