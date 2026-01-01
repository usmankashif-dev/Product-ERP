import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard({
    totalYearSales,
    totalMonthSales,
    totalWeekSales,
    totalYearQuantity,
    totalMonthQuantity,
    totalWeekQuantity,
    productSales,
    chartLabels,
    chartData,
    totalProducts,
    totalStock,
    pendingReservations,
    confirmedReservations,
}) {
    const salesMetrics = [
        {
            label: 'This Year',
            amount: totalYearSales,
            quantity: totalYearQuantity,
            icon: '📅',
            color: 'from-blue-500 to-blue-600',
        },
        {
            label: 'This Month',
            amount: totalMonthSales,
            quantity: totalMonthQuantity,
            icon: '📊',
            color: 'from-purple-500 to-purple-600',
        },
        {
            label: 'This Week',
            amount: totalWeekSales,
            quantity: totalWeekQuantity,
            icon: '📈',
            color: 'from-green-500 to-green-600',
        },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: { size: 12 },
                    color: '#6B7280',
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
            },
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(229, 231, 235, 0.5)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#9CA3AF',
                    font: { size: 11 },
                    callback: function (value) {
                        return value.toLocaleString();
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9CA3AF',
                    font: { size: 11 },
                },
            },
        },
    };

    const lineChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Daily Sales Revenue',
                data: chartData,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            },
        ],
    };

    const barChartData = {
        labels: productSales.map(p => p.product?.name || 'Unknown'),
        datasets: [
            {
                label: 'Units Sold',
                data: productSales.map(p => p.total_quantity),
                backgroundColor: '#8B5CF6',
                borderRadius: 8,
                borderSkipped: false,
            },
            {
                label: 'Revenue',
                data: productSales.map(p => p.total_revenue),
                backgroundColor: '#3B82F6',
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
                        <p className="mt-2 text-gray-600">Overview of your sales performance and inventory</p>
                    </div>

                    {/* Sales Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {salesMetrics.map((metric, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideUp" style={{animationDelay: `${idx * 100}ms`}}>
                                <div className={`bg-gradient-to-r ${metric.color} px-6 py-4 text-white`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-90">{metric.label}</p>
                                            <p className="text-3xl font-bold mt-1">{metric.amount.toLocaleString()}</p>
                                            <p className="text-xs opacity-75 mt-2">{metric.quantity.toLocaleString()} units sold</p>
                                        </div>
                                        <span className="text-5xl opacity-30">{metric.icon}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Line Chart - Daily Sales */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Daily Sales Trend</h3>
                                <p className="text-sm text-gray-600">This month's daily revenue</p>
                            </div>
                            <div style={{ height: '300px', position: 'relative' }}>
                                <Line data={lineChartData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Inventory Stats */}
                        <div className="space-y-6">
                            {/* Products Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Products</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
                                    </div>
                                    <div className="bg-blue-100 rounded-full p-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Stock</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{totalStock.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-2">units available</p>
                                    </div>
                                    <div className="bg-green-100 rounded-full p-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Reservations Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium mb-4">Reservations</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    ⏳ Pending
                                                </span>
                                                <span className="text-2xl font-bold text-gray-900">{pendingReservations}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✅ Confirmed
                                                </span>
                                                <span className="text-2xl font-bold text-gray-900">{confirmedReservations}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products Bar Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
                            <p className="text-sm text-gray-600">Products with highest sales volume and revenue</p>
                        </div>
                        {productSales.length > 0 ? (
                            <div style={{ height: '350px', position: 'relative' }}>
                                <Bar data={barChartData} options={chartOptions} />
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-4 text-gray-600">No sales data yet</p>
                            </div>
                        )}
                    </div>

                    {/* Product Sales Table */}
                    {productSales.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">Detailed Sales by Product</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {productSales.map((sale, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50 transition-all duration-200 hover:shadow-md border-l-4 border-l-transparent hover:border-l-blue-500 animate-slideUp" style={{animationDelay: `${idx * 50}ms`}}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{sale.product?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500">{sale.product?.size} - {sale.product?.color}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {sale.total_quantity.toLocaleString()} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">{parseFloat(sale.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{(sale.total_revenue / sale.total_quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/products" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-105">
                            📦 Manage Products
                        </Link>
                        <Link href="/reservations" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-105">
                            📝 Manage Reservations
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideUp {
                    animation: slideUp 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
