<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfYear = $now->clone()->startOfYear();
        $startOfMonth = $now->clone()->startOfMonth();
        $startOfWeek = $now->clone()->startOfWeek();

        // Get sales metrics
        $totalYearSales = Sale::whereBetween('date', [$startOfYear, $now])->sum('total_amount');
        $totalMonthSales = Sale::whereBetween('date', [$startOfMonth, $now])->sum('total_amount');
        $totalWeekSales = Sale::whereBetween('date', [$startOfWeek, $now])->sum('total_amount');

        // Get quantity metrics
        $totalYearQuantity = Sale::whereBetween('date', [$startOfYear, $now])->sum('quantity');
        $totalMonthQuantity = Sale::whereBetween('date', [$startOfMonth, $now])->sum('quantity');
        $totalWeekQuantity = Sale::whereBetween('date', [$startOfWeek, $now])->sum('quantity');

        // Get sales by product
        $productSales = Sale::select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(total_amount) as total_revenue'))
            ->with('product')
            ->groupBy('product_id')
            ->orderByDesc(DB::raw('SUM(total_amount)'))
            ->limit(10)
            ->get();

        // Get daily sales data for the month (for chart)
        $dailySalesData = Sale::select(DB::raw('DATE(date) as date'), DB::raw('SUM(total_amount) as amount'), DB::raw('SUM(quantity) as quantity'))
            ->whereBetween('date', [$startOfMonth, $now])
            ->groupBy(DB::raw('DATE(date)'))
            ->orderBy('date')
            ->get();

        // Format for chart
        $chartLabels = [];
        $chartData = [];
        $daysInMonth = $startOfMonth->daysInMonth;
        
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = $startOfMonth->clone()->addDays($i - 1);
            if ($date > $now) break;
            
            $chartLabels[] = $date->format('D, M j');
            $found = $dailySalesData->firstWhere('date', $date->format('Y-m-d'));
            $chartData[] = $found ? $found->amount : 0;
        }

        // Get total inventory stats
        $totalProducts = Product::count();
        $totalStock = Product::sum('quantity');
        $pendingReservations = Reservation::where('status', 'pending')->count();
        $confirmedReservations = Reservation::where('status', 'confirmed')->count();

        return Inertia::render('Dashboard', [
            'totalYearSales' => round($totalYearSales, 2),
            'totalMonthSales' => round($totalMonthSales, 2),
            'totalWeekSales' => round($totalWeekSales, 2),
            'totalYearQuantity' => $totalYearQuantity,
            'totalMonthQuantity' => $totalMonthQuantity,
            'totalWeekQuantity' => $totalWeekQuantity,
            'productSales' => $productSales,
            'chartLabels' => $chartLabels,
            'chartData' => $chartData,
            'totalProducts' => $totalProducts,
            'totalStock' => $totalStock,
            'pendingReservations' => $pendingReservations,
            'confirmedReservations' => $confirmedReservations,
        ]);
    }
}
