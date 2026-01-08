import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ products, filters, locations: initialLocations = [], reservations = [] }) {
    const { data, setData, get } = useForm({
        name: filters.name || '',
        color: filters.color || '',
        location: filters.location || '',
    });

    const [expandedProducts, setExpandedProducts] = useState({});
    const [editingLocation, setEditingLocation] = useState(null);
    const [locationValue, setLocationValue] = useState('');
    const [showNewLocation, setShowNewLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [locations, setLocations] = useState(initialLocations.length > 0 ? initialLocations : ['warehouse', 'shop', 'other']);
    const [showInlineNewLocation, setShowInlineNewLocation] = useState(false);
    const [inlineNewLocationName, setInlineNewLocationName] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    
    const [showSellModal, setShowSellModal] = useState(false);
    const [showDamagedModal, setShowDamagedModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCustomPlatform, setShowCustomPlatform] = useState(false);
    const [damagedAmount, setDamagedAmount] = useState('');
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
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        platform: '',
        customer_name: '',
        customer_phone: '',
        customer_address: '',
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

    const toggleExpandProduct = (productId) => {
        setExpandedProducts(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
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

    const getAvailableProductsCount = () => {
        // Count all products
        return products.length;
    };

    const openSellModal = (product) => {
        setSelectedProduct(product);
        setSellData({
            quantity: '',
            price_per_unit: product.price ? product.price.toString() : '',
            total_amount: '',
            date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            customer_name: '',
            customer_phone: '',
            customer_address: '',
        });
        setSellError('');
        setShowSellModal(true);
    };

    const closeSellModal = () => {
        setShowSellModal(false);
        setSelectedProduct(null);
        setShowCustomPlatform(false);
        setSellData({
            quantity: '',
            price_per_unit: '',
            total_amount: '',
            date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            platform: '',
            customer_name: '',
            customer_phone: '',
            customer_address: '',
        });
        setSellError('');
    };

    const openDamagedModal = (product) => {
        setSelectedProduct(product);
        setDamagedAmount('');
        setShowDamagedModal(true);
    };

    const closeDamagedModal = () => {
        setShowDamagedModal(false);
        setSelectedProduct(null);
        setDamagedAmount('');
    };

    const handleMarkDamaged = () => {
        if (!damagedAmount || parseInt(damagedAmount) <= 0) {
            alert('Please enter a valid damaged amount');
            return;
        }
        
        if (parseInt(damagedAmount) > selectedProduct.quantity) {
            alert(`Cannot mark ${damagedAmount} as damaged. Available: ${selectedProduct.quantity}`);
            return;
        }

        router.post(`/products/${selectedProduct.id}/mark-damaged`, {
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

    const openInvoiceModal = (product) => {
        setSelectedProduct(product);
        setInvoiceData({
            quantity: '',
            unit_price: product.price || '',
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
        setSelectedProduct(null);
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
            product_id: selectedProduct.id,
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
        if (!sellData.customer_name || !sellData.customer_name.trim()) {
            setSellError('Customer name is required');
            return;
        }
        if (!sellData.customer_phone || !sellData.customer_phone.trim()) {
            setSellError('Customer phone is required');
            return;
        }
        if (!sellData.customer_address || !sellData.customer_address.trim()) {
            setSellError('Customer address is required');
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
            platform: sellData.platform,
            customer_name: sellData.customer_name,
            customer_phone: sellData.customer_phone,
            customer_address: sellData.customer_address,
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
                                <div className="text-2xl font-bold text-gray-900">{getAvailableProductsCount()}</div>
                                <div className="text-sm text-gray-500">Available Products</div>
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
                                {getAvailableProductsCount()} available products
                            </span>
                        </div>

                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all hover:scale-105 active:scale-95"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Filters
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
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
                                    {products.map((product, index) => (
                                        <React.Fragment key={product.id}>
                                            <tr className="hover:bg-blue-50 transition-all duration-200 hover:shadow-md border-l-4 border-l-transparent hover:border-l-blue-500 animate-slideUp" style={{animationDelay: `${index * 50}ms`}}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        {product.variations && product.variations.length > 0 && (
                                                            <button
                                                                onClick={() => toggleExpandProduct(product.id)}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                title={expandedProducts[product.id] ? "Collapse" : "Expand"}
                                                            >
                                                                <svg className={`w-5 h-5 transition-transform ${expandedProducts[product.id] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </button>
                                                        )}
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
                                                        <div className="ml-2">
                                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            <div className="text-sm text-gray-500">Rs. {product.price || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center space-x-2">
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
                                                        product.quantity > 10 ? 'bg-green-100 text-green-800' :
                                                        product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.quantity > 10 && '✅ '}
                                                        {product.quantity > 0 && product.quantity <= 10 && '⚠️ '}
                                                        {product.quantity === 0 && '❌ '}
                                                        {product.quantity} units
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900 transition-colors" title="View">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <Link href={`/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            openDamagedModal(product);
                                                        }}
                                                        className="text-orange-600 hover:text-orange-900 transition-colors"
                                                        title="Damaged"
                                                    >
                                                        ⚠️
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this product?')) {
                                                                router.delete(`/products/${product.id}`);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedProducts[product.id] && product.variations && product.variations.length > 0 && (
                                            product.variations.map((variation, varIndex) => (
                                                <tr key={`variation-${variation.id}`} className="bg-gray-50 hover:bg-blue-50 transition-all duration-200 border-l-4 border-l-blue-300 animate-slideUp" style={{animationDelay: `${(index + varIndex + 1) * 50}ms`}}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center space-x-3 ml-6">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                {variation.image ? (
                                                                    <img className="h-10 w-10 rounded-lg object-cover" src={`/storage/${variation.image}`} alt={variation.name} />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                                                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-700">↳ {variation.name}</div>
                                                                <div className="text-xs text-gray-500">Rs. {variation.price || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                    Color: {variation.color}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            variation.location === 'warehouse' ? 'bg-orange-100 text-orange-800' :
                                                            variation.location === 'shop' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {variation.location === 'warehouse' && '🏭 '}
                                                            {variation.location === 'shop' && '🏪 '}
                                                            {variation.location === 'other' && '📍 '}
                                                            {variation.location.charAt(0).toUpperCase() + variation.location.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {variation.date ? new Date(variation.date).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                variation.quantity > 10 ? 'bg-green-100 text-green-800' :
                                                                variation.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {variation.quantity > 10 && '✅ '}
                                                                {variation.quantity > 0 && variation.quantity <= 10 && '⚠️ '}
                                                                {variation.quantity === 0 && '❌ '}
                                                                {variation.quantity} units
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <Link href={`/products/${variation.id}`} className="text-blue-600 hover:text-blue-900 transition-colors" title="View">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            <Link href={`/products/${variation.id}/edit`} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    openDamagedModal(variation);
                                                                }}
                                                                className="text-orange-600 hover:text-orange-900 transition-colors"
                                                                title="Damaged"
                                                            >
                                                                ⚠️
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('Are you sure you want to delete this variation?')) {
                                                                        router.delete(`/products/${variation.id}`);
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                                title="Delete"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </React.Fragment>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sell Modal */}
            {showSellModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 sticky top-0">
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
                        <div className="px-6 py-4 space-y-3">
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

                            {/* Customer Information Section */}
                            <div className="border-t pt-3">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Customer Information</p>
                                <div className="space-y-3">
                                    {/* Customer Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={sellData.customer_name}
                                            onChange={(e) => setSellData({ ...sellData, customer_name: e.target.value })}
                                            placeholder="Customer name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                        />
                                    </div>

                                    {/* Customer Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={sellData.customer_phone}
                                            onChange={(e) => setSellData({ ...sellData, customer_phone: e.target.value })}
                                            placeholder="Phone number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                        />
                                    </div>

                                    {/* Customer Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={sellData.customer_address}
                                            onChange={(e) => setSellData({ ...sellData, customer_address: e.target.value })}
                                            placeholder="Customer address"
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

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
                                        max={getAvailableQuantity(selectedProduct.id)}
                                        value={sellData.quantity}
                                        onChange={(e) => {
                                            const qty = e.target.value ? parseFloat(e.target.value) : 0;
                                            const price = sellData.price_per_unit ? parseFloat(sellData.price_per_unit) : 0;
                                            const total = qty * price;
                                            setSellData({ ...sellData, quantity: e.target.value, total_amount: total.toString() });
                                        }}
                                        placeholder="Enter quantity"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
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
                                        onChange={(e) => {
                                            const price = e.target.value ? parseFloat(e.target.value) : 0;
                                            const qty = sellData.quantity ? parseFloat(sellData.quantity) : 0;
                                            const total = qty * price;
                                            setSellData({ ...sellData, price_per_unit: e.target.value, total_amount: total.toString() });
                                        }}
                                        placeholder="Price"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
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
                                        readOnly
                                        placeholder="Total"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm cursor-not-allowed"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
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
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
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

            {/* Damaged Modal */}
            {showDamagedModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Mark as Damaged</h2>
                                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.name}</p>
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
                                <p className="text-sm text-gray-600">Current Stock:</p>
                                <p className="text-lg font-semibold text-orange-900">{selectedProduct.quantity} units</p>
                            </div>

                            {/* Damaged Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Damaged Amount (units) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedProduct.quantity}
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
            {showInvoiceModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50 sticky top-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Create Invoice</h2>
                                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.name}</p>
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
