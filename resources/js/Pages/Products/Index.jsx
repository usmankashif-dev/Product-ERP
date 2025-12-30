import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ products, filters, locations: initialLocations = [], reservations = [] }) {
    const { data, setData, get } = useForm({
        name: filters.name || '',
        size: filters.size || '',
        color: filters.color || '',
        location: filters.location || '',
    });

    const [editingLocation, setEditingLocation] = useState(null);
    const [locationValue, setLocationValue] = useState('');
    const [showNewLocation, setShowNewLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [locations, setLocations] = useState(initialLocations.length > 0 ? initialLocations : ['warehouse', 'shop', 'other']);
    const [showInlineNewLocation, setShowInlineNewLocation] = useState(false);
    const [inlineNewLocationName, setInlineNewLocationName] = useState('');
    
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sellData, setSellData] = useState({
        quantity: '',
        price_per_unit: '',
        total_amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
    });
    const [sellError, setSellError] = useState('');
    const [isSelling, setIsSelling] = useState(false);

    const handleFilter = (e) => {
        e.preventDefault();
        get('/products', { preserveState: true });
    };

    const handleLocationChange = (e) => {
        const value = e.target.value;
        if (value === 'add_new') {
            setShowNewLocation(true);
            setData('location', '');
        } else {
            setShowNewLocation(false);
            setData('location', value);
        }
    };

    const handleAddLocation = () => {
        if (newLocationName.trim()) {
            const newLocation = newLocationName.toLowerCase().trim();
            if (!locations.includes(newLocation)) {
                setLocations([...locations, newLocation]);
                setData('location', newLocation);
                setNewLocationName('');
                setShowNewLocation(false);
            }
        }
    };

    const startLocationEdit = (product) => {
        setEditingLocation(product.id);
        setLocationValue(product.location);
    };

    const saveLocation = (productId) => {
        router.patch(`/products/${productId}/location`, {
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

    const getAvailableQuantity = (productId) => {
        // Calculate available quantity = product quantity - reserved quantities
        const reservedQuantity = reservations
            .filter(r => r.product_id === productId && (r.status === 'pending' || r.status === 'confirmed'))
            .reduce((sum, r) => sum + r.quantity, 0);
        
        const product = products.find(p => p.id === productId);
        if (!product) return 0;
        
        return Math.max(0, product.quantity - reservedQuantity);
    };

    const openSellModal = (product) => {
        setSelectedProduct(product);
        setSellData({
            quantity: '',
            price_per_unit: '',
            total_amount: '',
            date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
        });
        setSellError('');
        setShowSellModal(true);
    };

    const closeSellModal = () => {
        setShowSellModal(false);
        setSelectedProduct(null);
        setSellError('');
    };

    const handleSellSubmit = () => {
        setSellError('');

        // Validation
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

        // Check if quantity is available (considering reservations)
        const availableQty = getAvailableQuantity(selectedProduct.id);
        if (parseInt(sellData.quantity) > availableQty) {
            setSellError(`Insufficient stock. Available: ${availableQty} units (${selectedProduct.quantity} in stock - ${selectedProduct.quantity - availableQty} reserved)`);
            return;
        }

        setIsSelling(true);
        
        router.post('/sales', {
            product_id: selectedProduct.id,
            quantity: parseInt(sellData.quantity),
            price_per_unit: sellData.price_per_unit ? parseFloat(sellData.price_per_unit) : null,
            total_amount: parseFloat(sellData.total_amount),
            date: sellData.date,
            payment_method: sellData.payment_method,
        }, {
            onSuccess: () => {
                setIsSelling(false);
                closeSellModal();
                // Reload the page to get updated data
                window.location.reload();
            },
            onError: (errors) => {
                setIsSelling(false);
                // errors is an object with field names as keys
                const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to record sale';
                setSellError(errorMessage);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Products
                </h2>
            }
        >
            <Head title="Products" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
                                <p className="mt-2 text-gray-600">Manage your product inventory and stock levels</p>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                                <div className="text-sm text-gray-500">Total Products</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Product Filters
                            </h3>
                            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                                {products.length} products found
                            </span>
                        </div>

                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Size</label>
                                    <input
                                        type="text"
                                        placeholder="Filter by size..."
                                        value={data.size}
                                        onChange={(e) => setData('size', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Color</label>
                                    <input
                                        type="text"
                                        placeholder="Filter by color..."
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <div className="space-y-2">
                                        <select
                                            value={data.location}
                                            onChange={handleLocationChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                                        >
                                            <option value="">All Locations</option>
                                            {locations.map((loc) => (
                                                <option key={loc} value={loc}>
                                                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                                </option>
                                            ))}
                                            <option value="add_new">+ Add New Location</option>
                                        </select>
                                        {showNewLocation && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New Location Name</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newLocationName}
                                                        onChange={(e) => setNewLocationName(e.target.value)}
                                                        placeholder="Enter location name"
                                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddLocation}
                                                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowNewLocation(false);
                                                            setNewLocationName('');
                                                        }}
                                                        className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData({ name: '', size: '', color: '', location: '' });
                                        get('/products', {}, { preserveState: true });
                                    }}
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Filters
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Apply Filters
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">Products List</h3>
                                <Link href="/products/create" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    New Product
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.filter(product => getAvailableQuantity(product.id) > 0).map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        {product.image ? (
                                                            <img className="h-12 w-12 rounded-lg object-cover" src={`/storage/${product.image}`} alt={product.name} />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                                                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-500">${product.price || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            Size: {product.size}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                            Color: {product.color}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {editingLocation === product.id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <select
                                                            value={locationValue}
                                                            onChange={(e) => {
                                                                if (e.target.value === 'add_new') {
                                                                    setShowInlineNewLocation(true);
                                                                } else {
                                                                    setShowInlineNewLocation(false);
                                                                    setLocationValue(e.target.value);
                                                                }
                                                            }}
                                                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            autoFocus
                                                        >
                                                            <option value="">Select location</option>
                                                            {locations.map((loc) => (
                                                                <option key={loc} value={loc}>
                                                                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                                                </option>
                                                            ))}
                                                            <option value="add_new">+ Add New Location</option>
                                                        </select>
                                                        {showInlineNewLocation ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={inlineNewLocationName}
                                                                    onChange={(e) => setInlineNewLocationName(e.target.value)}
                                                                    placeholder="Location name"
                                                                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        if (inlineNewLocationName.trim()) {
                                                                            const newLoc = inlineNewLocationName.toLowerCase().trim();
                                                                            if (!locations.includes(newLoc)) {
                                                                                setLocations([...locations, newLoc]);
                                                                                setLocationValue(newLoc);
                                                                                setInlineNewLocationName('');
                                                                                setShowInlineNewLocation(false);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                                    title="Add"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                </button>
                                                            </>
                                                        ) : null}
                                                        <button
                                                            onClick={() => saveLocation(product.id)}
                                                            className="text-green-600 hover:text-green-800 p-1"
                                                            title="Save"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={cancelLocationEdit}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Cancel"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                                            product.location === 'warehouse' ? 'bg-orange-100 text-orange-800' :
                                                            product.location === 'shop' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}
                                                        onClick={() => startLocationEdit(product)}
                                                        title="Click to edit location"
                                                    >
                                                        {product.location === 'warehouse' && '🏭 '}
                                                        {product.location === 'shop' && '🏪 '}
                                                        {product.location === 'other' && '📍 '}
                                                        {product.location.charAt(0).toUpperCase() + product.location.slice(1)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {product.date ? new Date(product.date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        getAvailableQuantity(product.id) > 10 ? 'bg-green-100 text-green-800' :
                                                        getAvailableQuantity(product.id) > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {getAvailableQuantity(product.id) > 10 && '✅ '}
                                                        {getAvailableQuantity(product.id) > 0 && getAvailableQuantity(product.id) <= 10 && '⚠️ '}
                                                        {getAvailableQuantity(product.id) === 0 && '❌ '}
                                                        {getAvailableQuantity(product.id)} units
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link href={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <Link href={`/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button 
                                                        onClick={() => openSellModal(product)}
                                                        className="text-purple-600 hover:text-purple-900 transition-colors"
                                                        title="Sell Product"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                    <Link href={`/reservations/create?product_id=${product.id}`} className="text-green-600 hover:text-green-900 transition-colors" title="Create Reservation">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </Link>
                                                    <button onClick={() => router.delete(`/products/${product.id}`)} className="text-red-600 hover:text-red-900 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {products.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
                                <div className="mt-6">
                                    <Link href="/products/create" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create Product
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sell Modal */}
            {showSellModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Sell Product</h2>
                                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.name}</p>
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
                            {/* Stock Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                                <p className="text-sm text-gray-600">Available Stock:</p>
                                <p className="text-lg font-semibold text-blue-900">{getAvailableQuantity(selectedProduct.id)} units</p>
                                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-200">
                                    <div>
                                        <p className="text-xs text-gray-500">Product Total</p>
                                        <p className="text-base font-semibold text-gray-900">{selectedProduct.quantity} units</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Reserved</p>
                                        <p className="text-base font-semibold text-orange-600">{selectedProduct.quantity - getAvailableQuantity(selectedProduct.id)} units</p>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {sellError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">{sellError}</p>
                                </div>
                            )}

                            {/* Quantity Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={getAvailableQuantity(selectedProduct.id)}
                                    value={sellData.quantity}
                                    onChange={(e) => setSellData({ ...sellData, quantity: e.target.value })}
                                    placeholder="Enter quantity"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                />
                            </div>

                            {/* Price Per Unit Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price Per Unit <span className="text-gray-400">(Optional)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={sellData.price_per_unit}
                                    onChange={(e) => setSellData({ ...sellData, price_per_unit: e.target.value })}
                                    placeholder="Enter price per unit"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                                    placeholder="Enter total amount"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="debit_card">Debit Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="check">Check</option>
                                </select>
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
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {isSelling && (
                                    <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                <span>{isSelling ? 'Saving...' : 'Save Sale'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}