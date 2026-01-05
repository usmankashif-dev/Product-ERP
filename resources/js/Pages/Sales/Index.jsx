import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ sales }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('order_date');
    const [sortOrder, setSortOrder] = useState('desc');

    // Filter and sort sales
    const filteredSales = sales
        .filter(sale => {
            const searchLower = searchTerm.toLowerCase();
            return (
                sale.product?.name?.toLowerCase().includes(searchLower) ||
                sale.product?.color?.toLowerCase().includes(searchLower) ||
                sale.customer_name?.toLowerCase().includes(searchLower) ||
                sale.order_date?.includes(searchTerm)
            );
        })
        .sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle nested properties
            if (sortBy === 'product_name') {
                aValue = a.product?.name;
                bValue = b.product?.name;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.final_amount || sale.total_amount), 0);
    const totalUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Sales
                </h2>
            }
        >
            <Head title="Sales" />

            <div className="py-12 bg-white min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">Sales</h1>
                                <p className="mt-2 text-gray-600">Track all your product sales</p>
                            </div>
                            <Link
                                href="/sales/create"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                New Sale
                            </Link>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                                        <p className="text-3xl font-bold text-green-900 mt-2">PKR {totalRevenue.toFixed(2)}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">💰</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">Total Units Sold</p>
                                        <p className="text-3xl font-bold text-blue-900 mt-2">{totalUnits}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">📦</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-600 text-sm font-medium">Total Sales</p>
                                        <p className="text-3xl font-bold text-purple-900 mt-2">{sales.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Sort */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search by product, customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="order_date">Order Date</option>
                                    <option value="dispatch_date">Dispatch Date</option>
                                    <option value="delivered_date">Delivered Date</option>
                                    <option value="total_amount">Amount</option>
                                    <option value="quantity">Quantity</option>
                                    <option value="product_name">Product Name</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSales.map((sale, index) => (
                                    <tr key={sale.id} className="hover:bg-blue-50 transition-colors animate-slideUp" style={{animationDelay: `${index * 50}ms`}}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{sale.product?.name}</p>
                                                <p className="text-xs text-gray-500">{sale.product?.color}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{sale.customer_name}</p>
                                                <p className="text-xs text-gray-500">{sale.customer_phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PKR {parseFloat(sale.price_per_unit).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                            <div>
                                                {sale.final_amount ? (
                                                    <>
                                                        <div className="text-xs text-gray-500 line-through">PKR {parseFloat(sale.total_amount).toFixed(2)}</div>
                                                        <div className="text-sm font-bold">PKR {parseFloat(sale.final_amount).toFixed(2)}</div>
                                                    </>
                                                ) : (
                                                    <div>PKR {parseFloat(sale.total_amount).toFixed(2)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(sale.order_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                sale.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                                                sale.payment_method === 'bank' ? 'bg-blue-100 text-blue-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {sale.payment_method?.charAt(0).toUpperCase() + sale.payment_method?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link
                                                href={`/returns/create?sale_id=${sale.id}`}
                                                className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                                            >
                                                Return
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredSales.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
                                <p className="mt-1 text-sm text-gray-500">No sales match your search criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
