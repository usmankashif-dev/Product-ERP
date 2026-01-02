import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ returns: initialReturns = [], damagedProducts: initialDamagedProducts = [], damagedReservations: initialDamagedReservations = [] }) {
    const [returns, setReturns] = useState(initialReturns);
    const damagedProducts = initialDamagedProducts || [];
    const damagedReservations = initialDamagedReservations || [];

    const handleDelete = (returnId) => {
        if (window.confirm('Are you sure you want to delete this return? This action cannot be undone.')) {
            router.delete(`/returns/${returnId}`, {
                onSuccess: () => {
                    setReturns(returns.filter(r => r.id !== returnId));
                }
            });
        }
    };

    // Combine all items for unified display
    const allItems = [
        ...returns.map(r => ({
            ...r,
            type: 'return',
            displayName: r.product_name || 'Product',
            displayQuantity: r.quantity,
            displayImage: r.image,
            clientInfo: r.client_name
        })),
        ...damagedProducts.map(p => ({
            ...p,
            type: 'damaged-product',
            displayName: p.name,
            displayQuantity: p.damaged_amount,
            displayImage: p.image,
            clientInfo: 'Product'
        })),
        ...damagedReservations.map(r => ({
            ...r,
            type: 'damaged-reservation',
            displayName: r.product_name || 'Product',
            displayQuantity: r.damaged_amount,
            displayImage: r.image,
            clientInfo: r.client_name
        }))
    ];
    
    // Debug log - after allItems is defined
    console.log('Received data:', { returns: initialReturns, damagedProducts, damagedReservations });
    console.log('All Items Count:', allItems.length, 'Returns:', initialReturns.length, 'Damaged Products:', initialDamagedProducts.length, 'Damaged Reservations:', initialDamagedReservations.length);
    console.log('allItems array:', allItems);

    // Calculate statistics
    const stats = {
        totalReturns: returns.length,
        totalQuantity: returns.reduce((sum, r) => sum + (r.quantity || 0), 0),
        damagedCount: returns.reduce((sum, r) => r.damaged ? sum + (r.quantity || 0) : sum, 0),
        refundCount: returns.filter(r => r.refund_money).length,
        pendingCount: returns.filter(r => r.status === 'pending').length,
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Returns Management
                </h2>
            }
        >
            <Head title="Returns" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Returns</h1>
                                <p className="mt-2 text-gray-600">Manage product returns and exchanges</p>
                            </div>
                            <Link 
                                href="/returns/create" 
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                New Return
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {/* Total Returns */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Returns</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReturns}</p>
                                </div>
                                <div className="bg-blue-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Quantity */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Quantity</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalQuantity}</p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Damaged Items */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Damaged Items</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.damagedCount}</p>
                                </div>
                                <div className="bg-orange-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-10H2a2 2 0 00-2 2v12a2 2 0 002 2h20a2 2 0 002-2V5a2 2 0 00-2-2h-10z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Refund Requests */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Refund Requests</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.refundCount}</p>
                                </div>
                                <div className="bg-purple-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Pending */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingCount}</p>
                                </div>
                                <div className="bg-yellow-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">Returns & Damage Items ({allItems.length} total)</h3>
                                <div className="text-sm text-gray-600">
                                    Returns: {returns.length} | Damaged Products: {damagedProducts.length} | Damaged Reservations: {damagedReservations.length}
                                </div>
                            </div>
                        </div>

                        {allItems && allItems.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allItems.map((item, index) => (
                                            <tr key={item.id || index} className="hover:bg-blue-50 transition-all duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.displayImage ? (
                                                        <img className="h-12 w-12 rounded-lg object-cover" src={`/storage/${item.displayImage}`} alt={item.displayName} />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.type === 'return' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Return</span>
                                                    )}
                                                    {item.type === 'damaged-product' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Damaged</span>
                                                    )}
                                                    {item.type === 'damaged-reservation' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Dam. Res.</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.displayName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.displayQuantity || 0} units
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.clientInfo || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {item.type === 'return' && (
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={`/returns/${item.id}`}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                title="View"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            <Link
                                                                href={`/returns/${item.id}/edit`}
                                                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="mt-4 text-gray-600 text-lg">No returns or damage items found</p>
                                <p className="mt-2 text-gray-500">Create a new return to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
