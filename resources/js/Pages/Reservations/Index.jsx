import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ reservations, filters, locations = [] }) {
    const { data, setData, get } = useForm({
        product: filters.product || '',
        client: filters.client || '',
        status: filters.status || '',
        size: filters.size || '',
    });

    const [editingStatus, setEditingStatus] = useState(null);
    const [statusValue, setStatusValue] = useState('');
    const [editingLocation, setEditingLocation] = useState(null);
    const [locationValue, setLocationValue] = useState('');
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showCustomPlatform, setShowCustomPlatform] = useState(false);
    const [sellData, setSellData] = useState({
        quantity: '',
        price_per_unit: '',
        total_amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        platform: '',
    });
    const [sellError, setSellError] = useState('');
    const [isSelling, setIsSelling] = useState(false);

    const handleFilter = (e) => {
        e.preventDefault();
        get('/reservations', { preserveState: true });
    };

    const handleReset = () => {
        setData({
            product: '',
            client: '',
            status: '',
            size: '',
        });
        router.get('/reservations', {}, { preserveState: true });
    };

    const startStatusEdit = (reservation) => {
        setEditingStatus(reservation.id);
        setStatusValue(reservation.status);
    };

    const saveStatus = (reservationId) => {
        router.patch(`/reservations/${reservationId}/status`, {
            status: statusValue
        }, {
            preserveState: true,
            onSuccess: () => {
                setEditingStatus(null);
                setStatusValue('');
            },
            onError: () => {
                // Handle error if needed
            }
        });
    };

    const cancelStatusEdit = () => {
        setEditingStatus(null);
        setStatusValue('');
    };

    const startLocationEdit = (reservation) => {
        setEditingLocation(reservation.id);
        setLocationValue(reservation.location);
    };

    const saveLocation = (reservationId) => {
        router.patch(`/reservations/${reservationId}/location`, {
            location: locationValue
        }, {
            preserveState: true,
            onSuccess: () => {
                setEditingLocation(null);
                setLocationValue('');
            },
            onError: () => {
                // Handle error if needed
            }
        });
    };

    const cancelLocationEdit = () => {
        setEditingLocation(null);
        setLocationValue('');
    };

    const openSellModal = (reservation) => {
        setSelectedReservation(reservation);
        setSellData({
            quantity: reservation.quantity.toString(),
            price_per_unit: '',
            total_amount: '',
            date: new Date().toISOString().split('T')[0],
            payment_method: reservation.payment_method || 'cash',
        });
        setSellError('');
        setShowSellModal(true);
    };

    const closeSellModal = () => {
        setShowSellModal(false);
        setSelectedReservation(null);
        setShowCustomPlatform(false);
        setSellData({
            quantity: '',
            price_per_unit: '',
            total_amount: '',
            date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            platform: '',
        });
        setSellError('');
    };

    const handleSellSubmit = () => {
        setSellError('');

        if (!sellData.quantity || parseInt(sellData.quantity) <= 0) {
            setSellError('Quantity is required and must be greater than 0');
            return;
        }
        if (!sellData.total_amount || parseFloat(sellData.total_amount) < 0) {
            setSellError('Total amount is required');
            return;
        }
        if (!sellData.date) {
            setSellError('Date is required');
            return;
        }

        const soldQty = parseInt(sellData.quantity);
        const reservedQty = selectedReservation.quantity;

        setIsSelling(true);
        
        router.post('/sales', {
            product_id: selectedReservation.product_id,
            client_id: selectedReservation.client_id,
            reservation_id: selectedReservation.id,
            quantity: soldQty,
            price_per_unit: sellData.price_per_unit ? parseFloat(sellData.price_per_unit) : null,
            total_amount: parseFloat(sellData.total_amount),
            date: sellData.date,
            payment_method: sellData.payment_method,
            platform: sellData.platform,
        }, {
            onSuccess: () => {
                setIsSelling(false);
                closeSellModal();
                
                // If sold quantity equals reserved quantity, delete the reservation
                if (soldQty === reservedQty) {
                    router.delete(`/reservations/${selectedReservation.id}`, {
                        preserveState: true
                    });
                } else {
                    // Otherwise, update the reservation with remaining quantity via API
                    fetch(`/api/reservations/${selectedReservation.id}/quantity`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                        },
                        body: JSON.stringify({ quantity: reservedQty - soldQty })
                    }).then(response => {
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            console.error('Failed to update reservation quantity');
                        }
                    }).catch(err => {
                        console.error('Error updating reservation:', err);
                    });
                }
            },
            onError: (errors) => {
                setIsSelling(false);
                setSellError(Object.values(errors).join(', '));
            }
        });
    };

    const handleDelete = (reservationId) => {
        if (window.confirm('Are you sure you want to delete this reservation?')) {
            router.delete(`/reservations/${reservationId}`, {
                preserveState: true
            });
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Reservations
                </h2>
            }
        >
            <Head title="Reservations" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Reservations Management</h1>
                                <p className="mt-2 text-gray-600">Track and manage client reservations</p>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-bold text-gray-900">{reservations.length}</div>
                                <div className="text-sm text-gray-500">Total Reservations</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Reservation Filters
                            </h3>
                            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                                {reservations.length} reservations found
                            </span>
                        </div>

                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                                    <input
                                        type="text"
                                        placeholder="Search by product name..."
                                        value={data.product}
                                        onChange={(e) => setData('product', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                                    <input
                                        type="text"
                                        placeholder="Search by client name..."
                                        value={data.client}
                                        onChange={(e) => setData('client', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                                    <input
                                        type="text"
                                        placeholder="Filter by size..."
                                        value={data.size}
                                        onChange={(e) => setData('size', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Filters
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Apply Filters
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Reservations Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">Reservations List</h3>
                                <Link href="/reservations/create" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    New Reservation
                                </Link>
                            </div>
                        </div>

                        {reservations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reservations.map((reservation) => (
                                            <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{reservation.product.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {reservation.product.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{reservation.client.name}</div>
                                                    <div className="text-xs text-gray-500">{reservation.client.phone || 'No phone'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                                        {reservation.quantity} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {reservation.size || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingLocation === reservation.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <select
                                                                value={locationValue}
                                                                onChange={(e) => setLocationValue(e.target.value)}
                                                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                                autoFocus
                                                            >
                                                                <option value="">Select location</option>
                                                                {locations.map((loc) => (
                                                                    <option key={loc} value={loc}>
                                                                        {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={() => saveLocation(reservation.id)}
                                                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={cancelLocationEdit}
                                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            onClick={() => startLocationEdit(reservation)}
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-all hover:shadow-md ${
                                                                reservation.location === 'warehouse' ? 'bg-orange-100 text-orange-800' :
                                                                reservation.location === 'shop' ? 'bg-green-100 text-green-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {reservation.location === 'warehouse' && '🏭 '}
                                                            {reservation.location === 'shop' && '🏪 '}
                                                            {reservation.location === 'other' && '📍 '}
                                                            {reservation.location ? reservation.location.charAt(0).toUpperCase() + reservation.location.slice(1) : 'N/A'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingStatus === reservation.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <select
                                                                value={statusValue}
                                                                onChange={(e) => setStatusValue(e.target.value)}
                                                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                autoFocus
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="confirmed">Confirmed</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                            <button
                                                                onClick={() => saveStatus(reservation.id)}
                                                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={cancelStatusEdit}
                                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            onClick={() => startStatusEdit(reservation)}
                                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:shadow-md ${getStatusBadgeColor(reservation.status)}`}
                                                        >
                                                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {reservation.date ? new Date(reservation.date + 'T00:00:00').toLocaleDateString() : 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(reservation.created_at).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => openSellModal(reservation)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                            title="Sell this reservation"
                                                        >
                                                            💰 Sell
                                                        </button>
                                                        <Link
                                                            href={`/reservations/${reservation.id}/edit`}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                        >
                                                            ✏️ Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(reservation.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
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
                                <p className="mt-4 text-gray-600 text-lg">No reservations found</p>
                                <p className="mt-2 text-gray-500">Create a new reservation to get started</p>
                                <Link href="/reservations/create" className="mt-4 inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-colors">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create Reservation
                                </Link>
                            </div>
                        )}
                    </div>

            {/* Sell Modal */}
            {showSellModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 sticky top-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Convert to Sale</h2>
                                    <p className="text-sm text-gray-600 mt-1">{selectedReservation.product.name}</p>
                                </div>
                                <button
                                    onClick={closeSellModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 space-y-3">
                            {/* Reservation Info */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-gray-600">Reservation Details:</p>
                                <p className="text-lg font-semibold text-green-900 mt-1">{selectedReservation.quantity} units</p>
                                <p className="text-xs text-gray-500 mt-1">Client: {selectedReservation.client.name}</p>
                            </div>

                            {/* Error Message */}
                            {sellError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">{sellError}</p>
                                </div>
                            )}

                            {/* Two Column Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Quantity Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedReservation.quantity}
                                        value={sellData.quantity}
                                        onChange={(e) => setSellData({ ...sellData, quantity: e.target.value })}
                                        placeholder="Qty"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Date Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={sellData.date}
                                        onChange={(e) => setSellData({ ...sellData, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Price Per Unit Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price/Unit <span className="text-gray-400">(Opt.)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={sellData.price_per_unit}
                                        onChange={(e) => setSellData({ ...sellData, price_per_unit: e.target.value })}
                                        placeholder="Price"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Total Amount Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={sellData.total_amount}
                                        onChange={(e) => setSellData({ ...sellData, total_amount: e.target.value })}
                                        placeholder="Total"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Payment Method Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={sellData.payment_method}
                                        onChange={(e) => setSellData({ ...sellData, payment_method: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="debit_card">Debit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                    </select>
                                </div>

                                {/* Platform Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Platform <span className="text-red-500">*</span>
                                    </label>
                                    {!showCustomPlatform ? (
                                        <select
                                            value={sellData.platform}
                                            onChange={(e) => {
                                                if (e.target.value === 'custom') {
                                                    setShowCustomPlatform(true);
                                                    setSellData({ ...sellData, platform: '' });
                                                } else {
                                                    setSellData({ ...sellData, platform: e.target.value });
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                        >
                                            <option value="">Select</option>
                                            <option value="daraz">Daraz</option>
                                            <option value="amazon">Amazon</option>
                                            <option value="website">Website</option>
                                            <option value="direct_sale">Direct Sale</option>
                                            <option value="custom">+ Custom</option>
                                        </select>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={sellData.platform}
                                                onChange={(e) => setSellData({ ...sellData, platform: e.target.value })}
                                                placeholder="Platform"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => setShowCustomPlatform(false)}
                                                className="px-2 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors text-sm"
                                            >
                                                ✓
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex space-x-3 justify-end">
                            <button
                                onClick={closeSellModal}
                                disabled={isSelling}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSellSubmit}
                                disabled={isSelling}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {isSelling && (
                                    <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                <span>{isSelling ? 'Converting...' : 'Convert to Sale'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
