import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ products }) {
    const [showNewPlatform, setShowNewPlatform] = useState(false);
    const [newPlatformName, setNewPlatformName] = useState('');
    const [platforms, setPlatforms] = useState(['facebook', 'instagram', 'website', 'whatsapp', 'phone', 'in_person', 'email', 'daraz']);

    const { data, setData, post, errors } = useForm({
        product_id: '',
        quantity: 1,
        price_per_unit: '',
        total_amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        platform: '',
        customer_name: '',
        customer_phone: '',
        customer_address: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/sales');
    };

    const calculateTotal = () => {
        const quantity = parseFloat(data.quantity) || 0;
        const price = parseFloat(data.price_per_unit) || 0;
        return (quantity * price).toFixed(2);
    };

    const updateTotal = (newQuantity = null, newPrice = null) => {
        const qty = newQuantity !== null ? newQuantity : (parseFloat(data.quantity) || 0);
        const price = newPrice !== null ? newPrice : (parseFloat(data.price_per_unit) || 0);
        const total = (qty * price).toFixed(2);
        setData('total_amount', total);
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        setData('product_id', productId);

        // Auto-fill price if product is selected
        const selectedProduct = products.find(p => p.id == productId);
        if (selectedProduct && selectedProduct.price) {
            setData('price_per_unit', selectedProduct.price.toString());
            updateTotal();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Sale
                </h2>
            }
        >
            <Head title="Create Sale" />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Create New Sale</h1>
                        <p className="mt-2 text-gray-600">Record a new product sale</p>
                    </div>
                    <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                        <div className="p-8">
                            <nav className="mb-6 pb-4 border-b border-gray-200">
                                <ol className="flex text-sm text-gray-500">
                                    <li><Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link></li>
                                    <li className="mx-2">/</li>
                                    <li><Link href="/sales" className="hover:text-blue-600 transition">Sales</Link></li>
                                    <li className="mx-2">/</li>
                                    <li className="text-gray-900 font-medium">Create</li>
                                </ol>
                            </nav>
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                                    <p className="font-semibold mb-2">Errors:</p>
                                    {Object.entries(errors).map(([field, message]) => (
                                        <p key={field}>{message}</p>
                                    ))}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Information</h3>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            placeholder="Customer name"
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                        {errors.customer_name && <div className="text-red-500">{errors.customer_name}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                            placeholder="Customer phone"
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                        {errors.customer_phone && <div className="text-red-500">{errors.customer_phone}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Address</label>
                                        <textarea
                                            value={data.customer_address}
                                            onChange={(e) => setData('customer_address', e.target.value)}
                                            placeholder="Customer address"
                                            className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
                                            rows="3"
                                        ></textarea>
                                        {errors.customer_address && <div className="text-red-500">{errors.customer_address}</div>}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700">Product</label>
                                    <select
                                        value={data.product_id}
                                        onChange={handleProductChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="">Select Product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - {product.color} (Qty: {product.quantity})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.product_id && <div className="text-red-500">{errors.product_id}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                            setData('quantity', value);
                                            updateTotal(value);
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="1"
                                    />
                                    {errors.quantity && <div className="text-red-500">{errors.quantity}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Price per Unit</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price_per_unit}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setData('price_per_unit', value);
                                            updateTotal(null, parseFloat(value));
                                        }}
                                        placeholder="0.00"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="0"
                                    />
                                    {errors.price_per_unit && <div className="text-red-500">{errors.price_per_unit}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Total Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.total_amount}
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                                        placeholder="Auto-calculated"
                                    />
                                    {errors.total_amount && <div className="text-red-500">{errors.total_amount}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.date && <div className="text-red-500">{errors.date}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Payment Method</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="debit_card">Debit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                    </select>
                                    {errors.payment_method && <div className="text-red-500">{errors.payment_method}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Platform (optional)</label>
                                    <div className="space-y-2">
                                        <select
                                            value={showNewPlatform ? 'add_new' : data.platform}
                                            onChange={(e) => {
                                                if (e.target.value === 'add_new') {
                                                    setShowNewPlatform(true);
                                                } else {
                                                    setShowNewPlatform(false);
                                                    setData('platform', e.target.value);
                                                }
                                            }}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        >
                                            <option value="">Select Platform</option>
                                            {platforms.map((platform) => {
                                                const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1).replace('_', ' ');
                                                return <option key={platform} value={platform}>{platformLabel}</option>;
                                            })}
                                            <option value="add_new">+ Add New Platform</option>
                                        </select>
                                        {showNewPlatform && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New Platform Name</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newPlatformName}
                                                        onChange={(e) => setNewPlatformName(e.target.value)}
                                                        placeholder="Enter platform name"
                                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (newPlatformName.trim()) {
                                                                const newPlatform = newPlatformName.toLowerCase().trim().replace(/\s+/g, '_');
                                                                if (!platforms.includes(newPlatform)) {
                                                                    setPlatforms([...platforms, newPlatform]);
                                                                    setData('platform', newPlatform);
                                                                    setNewPlatformName('');
                                                                    setShowNewPlatform(false);
                                                                }
                                                            }
                                                        }}
                                                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowNewPlatform(false);
                                                            setNewPlatformName('');
                                                        }}
                                                        className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {errors.platform && <div className="text-red-500">{errors.platform}</div>}
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm">Create Sale</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}