import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ reservations, filters, locations = [] }) {
    const { data, setData, get } = useForm({
        product: filters.product || '',
        client: filters.client || '',
        status: filters.status || '',
    });

    const [editingStatus, setEditingStatus] = useState(null);
    const [statusValue, setStatusValue] = useState('');
    const [editingLocation, setEditingLocation] = useState(null);
    const [locationValue, setLocationValue] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showCustomPlatform, setShowCustomPlatform] = useState(false);
    const [showDamagedModal, setShowDamagedModal] = useState(false);
    const [damagedAmount, setDamagedAmount] = useState('');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        quantity: '',
        unit_price: '',
        total_amount: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
    });
    const [invoiceError, setInvoiceError] = useState('');
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
    const [sellData, setSellData] = useState({
        quantity: '',
        price_per_unit: '',
        total_amount: '',
        discount_type: '',
        discount_value: '',
        discount_amount: 0,
        shipping_charges: 0,
        final_amount: '',
        order_date: new Date().toISOString().split('T')[0],
        dispatch_date: '',
        delivered_date: '',
        payment_method: 'cash',
        bank_name: '',
        platform: '',
        customer_name: '',
        customer_phone: '',
        customer_address: '',
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
        // Auto-fill with reservation full quantity and product price
        const productPrice = reservation.product?.price || '';
        const totalAmount = reservation.quantity * (productPrice || 0);
        setSellData({
            quantity: reservation.quantity.toString(),
            price_per_unit: productPrice.toString(),
            total_amount: totalAmount.toString(),
            discount_type: '',
            discount_value: '',
            discount_amount: 0,
            shipping_charges: 0,
            final_amount: totalAmount.toString(),
            order_date: new Date().toISOString().split('T')[0],
            dispatch_date: '',
            delivered_date: '',
            payment_method: reservation.payment_method || 'cash',
            customer_name: '',
            customer_phone: '',
            customer_address: '',
            platform: '',
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
            discount_type: '',
            discount_value: '',
            discount_amount: 0,
            shipping_charges: 0,
            final_amount: '',
            order_date: new Date().toISOString().split('T')[0],
            dispatch_date: '',
            delivered_date: '',
            payment_method: 'cash',
            platform: '',
            customer_name: '',
            customer_phone: '',
            customer_address: '',
        });
        setSellError('');
    };

    const handleDiscountChange = (type, value) => {
        const totalAmount = parseFloat(sellData.total_amount) || 0;
        const shipping = parseFloat(sellData.shipping_charges) || 0;
        let discountAmount = 0;
        let finalAmount = totalAmount;

        if (type && value) {
            if (type === 'amount') {
                discountAmount = Math.min(parseFloat(value), totalAmount); // Can't discount more than total
            } else if (type === 'percentage') {
                const percentage = Math.min(parseFloat(value), 100); // Max 100%
                discountAmount = (totalAmount * percentage) / 100;
            }
            finalAmount = totalAmount - discountAmount + shipping;
        } else {
            finalAmount = totalAmount + shipping;
        }

        setSellData({
            ...sellData,
            discount_type: type,
            discount_value: value,
            discount_amount: discountAmount,
            final_amount: finalAmount.toString(),
        });
    };

    const handleSellSubmit = () => {
        setSellError('');

        if (!sellData.order_date) {
            setSellError('Order date is required');
            return;
        }
        if (!sellData.payment_method) {
            setSellError('Payment method is required');
            return;
        }
        if (!sellData.platform) {
            setSellError('Platform is required');
            return;
        }

        const soldQty = parseInt(sellData.quantity);
        const reservedQty = selectedReservation.quantity;

        setIsSelling(true);
        
        router.post('/sales', {
            product_id: selectedReservation.product_id,
            reservation_id: selectedReservation.id,
            quantity: soldQty,
            price_per_unit: sellData.price_per_unit ? parseFloat(sellData.price_per_unit) : null,
            total_amount: parseFloat(sellData.total_amount),
            discount_type: sellData.discount_type || null,
            discount_value: sellData.discount_value ? parseFloat(sellData.discount_value) : null,
            shipping_charges: sellData.shipping_charges ? parseFloat(sellData.shipping_charges) : 0,
            order_date: sellData.order_date,
            dispatch_date: sellData.dispatch_date || null,
            delivered_date: sellData.delivered_date || null,
            payment_method: sellData.payment_method,
            bank_name: sellData.bank_name || null,
            platform: sellData.platform,
            customer_name: selectedReservation.client_name,
            customer_phone: selectedReservation.client_phone,
            customer_address: selectedReservation.client_address,
        }, {
            onSuccess: () => {
                setIsSelling(false);
                closeSellModal();
                
                // Delete the reservation since we sold all of it
                router.delete(`/reservations/${selectedReservation.id}`, {
                    preserveState: true
                });
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

    const openDamagedModal = (reservation) => {
        setSelectedReservation(reservation);
        setDamagedAmount('');
        setShowDamagedModal(true);
    };

    const closeDamagedModal = () => {
        setShowDamagedModal(false);
        setSelectedReservation(null);
        setDamagedAmount('');
    };

    const handleMarkDamaged = () => {
        if (!damagedAmount || parseInt(damagedAmount) <= 0) {
            alert('Please enter a valid damaged amount');
            return;
        }
        
        if (parseInt(damagedAmount) > selectedReservation.quantity) {
            alert(`Cannot mark ${damagedAmount} as damaged. Available: ${selectedReservation.quantity}`);
            return;
        }

        router.post(`/reservations/${selectedReservation.id}/mark-damaged`, {
            damaged_amount: parseInt(damagedAmount),
        }, {
            onSuccess: () => {
                closeDamagedModal();
                window.location.reload();
            },
            onError: (errors) => {
                alert(Object.values(errors).flat().join(', '));
            }
        });
    };

    const openInvoiceModal = (reservation) => {
        setSelectedReservation(reservation);
        setInvoiceData({
            quantity: reservation.quantity.toString(),
            unit_price: '',
            total_amount: '',
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: '',
            notes: '',
        });
        setInvoiceError('');
        setShowInvoiceModal(true);
    };

    const closeInvoiceModal = () => {
        setShowInvoiceModal(false);
        setSelectedReservation(null);
        setInvoiceData({
            quantity: '',
            unit_price: '',
            total_amount: '',
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: '',
            notes: '',
        });
        setInvoiceError('');
    };

    const handleInvoiceSubmit = () => {
        setInvoiceError('');

        if (!invoiceData.quantity || parseInt(invoiceData.quantity) <= 0) {
            setInvoiceError('Quantity is required and must be greater than 0');
            return;
        }
        if (!invoiceData.unit_price || parseFloat(invoiceData.unit_price) < 0) {
            setInvoiceError('Unit price is required');
            return;
        }
        if (!invoiceData.total_amount || parseFloat(invoiceData.total_amount) < 0) {
            setInvoiceError('Total amount is required');
            return;
        }
        if (!invoiceData.invoice_date) {
            setInvoiceError('Invoice date is required');
            return;
        }

        setIsCreatingInvoice(true);
        
        router.post('/invoices', {
            product_id: selectedReservation.product_id,
            reservation_id: selectedReservation.id,
            client_id: selectedReservation.client_id,
            quantity: parseInt(invoiceData.quantity),
            unit_price: parseFloat(invoiceData.unit_price),
            total_amount: parseFloat(invoiceData.total_amount),
            invoice_date: invoiceData.invoice_date,
            due_date: invoiceData.due_date || null,
            notes: invoiceData.notes || null,
        }, {
            onSuccess: () => {
                setIsCreatingInvoice(false);
                closeInvoiceModal();
                router.visit('/invoices');
            },
            onError: (errors) => {
                setIsCreatingInvoice(false);
                const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to create invoice';
                setInvoiceError(errorMessage);
            }
        });
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
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Client</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Payment</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reservations.map((reservation, index) => (
                                            <tr key={reservation.id} className="hover:bg-purple-50 transition-all duration-200 hover:shadow-md border-l-4 border-l-transparent hover:border-l-purple-500 animate-slideUp" style={{animationDelay: `${index * 50}ms`}}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{reservation.product_name || reservation.product?.name || 'Product'}</div>
                                                    <div className="text-xs text-gray-500">ID: {reservation.product?.id || 'N/A'}</div>
                                                    {reservation.image && (
                                                        <img className="h-8 w-8 rounded mt-1 object-cover" src={`/storage/${reservation.image}`} alt="Reservation" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                    <div className="text-sm font-medium text-gray-900">{reservation.client_name || reservation.client?.name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{reservation.client_phone || reservation.client?.phone || 'No phone'}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                        {reservation.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                                                    <div className="text-xs">
                                                        <span className="text-orange-600 font-semibold">Rs. {parseFloat(reservation.paid_amount || 0).toFixed(2)}</span>
                                                        <span className="text-gray-500 mx-1">/</span>
                                                        <span className="text-green-600 font-semibold">Rs. {parseFloat(reservation.total_amount || 0).toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                                                    {editingStatus === reservation.id ? (
                                                        <div className="flex gap-1 items-center">
                                                            <select
                                                                value={statusValue}
                                                                onChange={(e) => setStatusValue(e.target.value)}
                                                                className="text-xs px-1 py-0.5 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                autoFocus
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="confirmed">Confirmed</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                            <button
                                                                onClick={() => saveStatus(reservation.id)}
                                                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-0.5 px-1 rounded transition-colors"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={cancelStatusEdit}
                                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-0.5 px-1 rounded transition-colors"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            onClick={() => startStatusEdit(reservation)}
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-all hover:shadow-md ${
                                                                reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {reservation.status === 'pending' && '⏳ '}
                                                            {reservation.status === 'confirmed' && '✓ '}
                                                            {reservation.status === 'cancelled' && '✕ '}
                                                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell text-xs text-gray-600">
                                                    {reservation.date ? new Date(reservation.date).toLocaleDateString() : 'No date'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <button
                                                            onClick={() => {
                                                                openSellModal(reservation);
                                                            }}
                                                            className="text-green-600 hover:text-green-900 transition-colors text-lg"
                                                            title="Mark as Sold"
                                                        >
                                                            ✅
                                                        </button>
                                                        <Link
                                                            href={`/reservations/${reservation.id}`}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors text-lg"
                                                            title="View Details"
                                                        >
                                                            👁️
                                                        </Link>
                                                        <Link
                                                            href={`/reservations/${reservation.id}/edit`}
                                                            className="text-yellow-600 hover:text-yellow-900 transition-colors text-lg"
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                openDamagedModal(reservation);
                                                            }}
                                                            className="text-orange-600 hover:text-orange-900 transition-colors text-lg"
                                                            title="Mark Damaged"
                                                        >
                                                            ⚠️
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowInvoiceModal(true);
                                                                setSelectedReservation(reservation);
                                                            }}
                                                            className="text-purple-600 hover:text-purple-900 transition-colors text-lg"
                                                            title="Create Invoice"
                                                        >
                                                            📄
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleDelete(reservation.id);
                                                            }}
                                                            className="text-red-600 hover:text-red-900 transition-colors text-lg"
                                                            title="Delete"
                                                        >
                                                            🗑️
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
                        <div className="px-6 py-4 space-y-4">
                            {/* Reservation Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Reservation Summary</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Product:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedReservation.product_name || selectedReservation.product?.name || 'Product'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Quantity:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedReservation.quantity} units</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Price/Unit:</span>
                                        <span className="text-sm font-medium text-gray-900">PKR {parseFloat(sellData.price_per_unit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between bg-blue-100 px-2 py-1 rounded">
                                        <span className="text-sm text-gray-600">Total Amount:</span>
                                        <span className="text-sm font-bold text-blue-900">PKR {parseFloat(sellData.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-blue-200">
                                        <span className="text-sm text-gray-600">Customer:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedReservation.client_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Phone:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedReservation.client_phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Address:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedReservation.client_address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {sellError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">{sellError}</p>
                                </div>
                            )}

                            {/* Sale Details Grid */}
                            <div className="space-y-3">
                                {/* Order Date Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Order Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={sellData.order_date}
                                        onChange={(e) => setSellData({ ...sellData, order_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Dispatch Date Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dispatch Date (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={sellData.dispatch_date}
                                        onChange={(e) => setSellData({ ...sellData, dispatch_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Delivered Date Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivered Date (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={sellData.delivered_date}
                                        onChange={(e) => setSellData({ ...sellData, delivered_date: e.target.value })}
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
                                        onChange={(e) => {
                                            setSellData({ ...sellData, payment_method: e.target.value });
                                            if (e.target.value !== 'bank_transfer') {
                                                setSellData(prev => ({ ...prev, bank_name: '' }));
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option value="cash">Cash</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="debit_card">Debit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="online_transfer">Online Transfer</option>
                                        <option value="mobile_wallet">Mobile Wallet</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Bank Selection Field */}
                                {sellData.payment_method === 'bank_transfer' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Bank
                                        </label>
                                        <select
                                            value={sellData.bank_name}
                                            onChange={(e) => setSellData({ ...sellData, bank_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                        >
                                            <option value="">-- Choose a bank --</option>
                                            <option value="HBL - Habib Bank Limited">HBL - Habib Bank Limited</option>
                                            <option value="ABL - Allied Bank Limited">ABL - Allied Bank Limited</option>
                                            <option value="UBL - United Bank Limited">UBL - United Bank Limited</option>
                                            <option value="MCB - MCB Bank Limited">MCB - MCB Bank Limited</option>
                                            <option value="NBP - National Bank of Pakistan">NBP - National Bank of Pakistan</option>
                                            <option value="BOP - Bank of Punjab">BOP - Bank of Punjab</option>
                                            <option value="Faysal Bank">Faysal Bank</option>
                                            <option value="Askari Bank">Askari Bank</option>
                                            <option value="SILK Bank">SILK Bank</option>
                                            <option value="Jazz Bank">Jazz Bank</option>
                                            <option value="Alfalah Bank">Alfalah Bank</option>
                                            <option value="SBP - State Bank of Pakistan">SBP - State Bank of Pakistan</option>
                                            <option value="Bank Al Falah">Bank Al Falah</option>
                                            <option value="Habib Metropolitan Bank">Habib Metropolitan Bank</option>
                                            <option value="KASB Bank">KASB Bank</option>
                                            <option value="ICBC Bank">ICBC Bank</option>
                                            <option value="Dubai Islamic Bank">Dubai Islamic Bank</option>
                                            <option value="Meezan Bank">Meezan Bank</option>
                                            <option value="Bank Islami Pakistan">Bank Islami Pakistan</option>
                                            <option value="Other Banks">Other Banks</option>
                                        </select>
                                    </div>
                                )}

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

                                {/* Shipping Charges Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Shipping Charges (optional)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={sellData.shipping_charges}
                                        onChange={(e) => {
                                            const shipping = parseFloat(e.target.value) || 0;
                                            const totalAmount = parseFloat(sellData.total_amount) || 0;
                                            let newFinal = totalAmount + shipping;
                                            if (sellData.discount_amount > 0) {
                                                newFinal = totalAmount - sellData.discount_amount + shipping;
                                            }
                                            setSellData({ ...sellData, shipping_charges: shipping, final_amount: newFinal.toString() });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Discount Type Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Type (optional)
                                    </label>
                                    <select
                                        value={sellData.discount_type}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleDiscountChange(e.target.value, sellData.discount_value);
                                            } else {
                                                handleDiscountChange('', '');
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                    >
                                        <option value="">No Discount</option>
                                        <option value="amount">Fixed Amount (PKR)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>

                                {/* Discount Value Field */}
                                {sellData.discount_type && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount Value {sellData.discount_type === 'percentage' ? '(%)' : '(PKR)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={sellData.discount_value}
                                            onChange={(e) => handleDiscountChange(sellData.discount_type, e.target.value)}
                                            placeholder={sellData.discount_type === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                )}

                                {/* Discount Summary */}
                                {sellData.discount_type && sellData.discount_value && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Discount Amount:</span>
                                            <span className="text-sm font-semibold text-green-900">- PKR {parseFloat(sellData.discount_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {parseFloat(sellData.shipping_charges) > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Shipping Charges:</span>
                                                <span className="text-sm font-semibold text-green-900">+ PKR {parseFloat(sellData.shipping_charges).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between bg-green-100 px-2 py-1 rounded pt-2 border-t border-green-300">
                                            <span className="text-sm font-semibold text-gray-700">Final Amount:</span>
                                            <span className="text-sm font-bold text-green-900">PKR {parseFloat(sellData.final_amount || sellData.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                )}
                                {!sellData.discount_type && parseFloat(sellData.shipping_charges) > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Amount:</span>
                                            <span className="text-sm font-semibold text-blue-900">PKR {parseFloat(sellData.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Shipping Charges:</span>
                                            <span className="text-sm font-semibold text-blue-900">+ PKR {parseFloat(sellData.shipping_charges).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between bg-blue-100 px-2 py-1 rounded pt-2 border-t border-blue-300">
                                            <span className="text-sm font-semibold text-gray-700">Final Amount:</span>
                                            <span className="text-sm font-bold text-blue-900">PKR {parseFloat(sellData.final_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                )}
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

            {/* Damaged Modal */}
            {showDamagedModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Mark as Damaged</h2>
                                    <p className="text-sm text-gray-600 mt-1">Reservation for {selectedReservation.product_name}</p>
                                </div>
                                <button
                                    onClick={closeDamagedModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 space-y-4">
                            {/* Stock Info */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="text-sm text-gray-600">Reserved Quantity:</p>
                                <p className="text-lg font-semibold text-orange-900">{selectedReservation.quantity} units</p>
                            </div>

                            {/* Damaged Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Damaged Amount (units) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedReservation.quantity}
                                    value={damagedAmount}
                                    onChange={(e) => setDamagedAmount(e.target.value)}
                                    placeholder="Enter number of damaged units"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex space-x-3 justify-end">
                            <button
                                onClick={closeDamagedModal}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkDamaged}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Mark Damaged
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            {showInvoiceModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50 sticky top-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Create Invoice</h2>
                                    <p className="text-sm text-gray-600 mt-1">Reservation #{selectedReservation.id}</p>
                                </div>
                                <button
                                    onClick={closeInvoiceModal}
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
                            {/* Error Message */}
                            {invoiceError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">{invoiceError}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={invoiceData.quantity}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, quantity: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Unit Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unit Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={invoiceData.unit_price}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, unit_price: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Invoice Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Invoice Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={invoiceData.invoice_date}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, invoice_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Total Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={invoiceData.total_amount}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, total_amount: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-sm"
                                    />
                                </div>

                                {/* Due Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={invoiceData.due_date}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={invoiceData.notes}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                                    placeholder="Invoice notes..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-sm"
                                    rows="3"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex space-x-3 justify-end">
                            <button
                                onClick={closeInvoiceModal}
                                disabled={isCreatingInvoice}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInvoiceSubmit}
                                disabled={isCreatingInvoice}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {isCreatingInvoice && (
                                    <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                <span>{isCreatingInvoice ? 'Creating...' : 'Create Invoice'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
