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
        const shipping = parseFloat(data.shipping_charges) || 0;
        setData('total_amount', total);
        // Reset discount when total changes
        setData('discount_type', '');
        setData('discount_value', '');
        setData('discount_amount', 0);
        setData('final_amount', (parseFloat(total) + shipping).toString());
    };

    const handleDiscountChange = (type, value, totalAmount = null) => {
        const amount = totalAmount !== null ? totalAmount : parseFloat(data.total_amount) || 0;
        const shipping = parseFloat(data.shipping_charges) || 0;
        let discountAmount = 0;
        let finalAmount = amount;

        if (type && value) {
            if (type === 'amount') {
                discountAmount = Math.min(parseFloat(value), amount);
            } else if (type === 'percentage') {
                const percentage = Math.min(parseFloat(value), 100);
                discountAmount = (amount * percentage) / 100;
            }
            finalAmount = amount - discountAmount + shipping;
        } else {
            finalAmount = amount + shipping;
        }

        setData('discount_type', type);
        setData('discount_value', value);
        setData('discount_amount', discountAmount);
        setData('final_amount', finalAmount.toString());
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        setData('product_id', productId);

        // Auto-fill price if product is selected
        const selectedProduct = products.find(p => p.id == productId);
        if (selectedProduct && selectedProduct.price) {
            setData('price_per_unit', selectedProduct.price.toString());
            // Calculate total with default quantity (1) and selected product price
            const quantity = parseFloat(data.quantity) || 1;
            const price = parseFloat(selectedProduct.price) || 0;
            const total = (quantity * price).toFixed(2);
            const shipping = parseFloat(data.shipping_charges) || 0;
            setData('total_amount', total);
            setData('discount_type', '');
            setData('discount_value', '');
            setData('discount_amount', 0);
            setData('final_amount', (parseFloat(total) + shipping).toString());
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
                                    <label className="block text-gray-700">Shipping Charges (optional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.shipping_charges}
                                        onChange={(e) => {
                                            const shipping = parseFloat(e.target.value) || 0;
                                            setData('shipping_charges', shipping);
                                            // Recalculate final amount with shipping
                                            const currentTotal = parseFloat(data.total_amount) || 0;
                                            let newFinal = currentTotal + shipping;
                                            if (data.discount_amount > 0) {
                                                newFinal = currentTotal - data.discount_amount + shipping;
                                            }
                                            setData('final_amount', newFinal.toString());
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="0.00"
                                    />
                                    {errors.shipping_charges && <div className="text-red-500">{errors.shipping_charges}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Discount Type (optional)</label>
                                    <select
                                        value={data.discount_type}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleDiscountChange(e.target.value, data.discount_value);
                                            } else {
                                                handleDiscountChange('', '');
                                            }
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="">No Discount</option>
                                        <option value="amount">Fixed Amount (Rs.)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                    {errors.discount_type && <div className="text-red-500">{errors.discount_type}</div>}
                                </div>
                                {data.discount_type && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Discount Value {data.discount_type === 'percentage' ? '(%)' : '(Rs.)'}</label>
                                        <input
                                            type="number"
                                            value={data.discount_value}
                                            onChange={(e) => handleDiscountChange(data.discount_type, e.target.value)}
                                            placeholder={data.discount_type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors.discount_value && <div className="text-red-500">{errors.discount_value}</div>}
                                    </div>
                                )}
                                <div className="mb-4">
                                    <label className="block text-gray-700">Order Date</label>
                                    <input
                                        type="date"
                                        value={data.order_date}
                                        onChange={(e) => setData('order_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.order_date && <div className="text-red-500">{errors.order_date}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Dispatch Date (optional)</label>
                                    <input
                                        type="date"
                                        value={data.dispatch_date}
                                        onChange={(e) => setData('dispatch_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.dispatch_date && <div className="text-red-500">{errors.dispatch_date}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Delivered Date (optional)</label>
                                    <input
                                        type="date"
                                        value={data.delivered_date}
                                        onChange={(e) => setData('delivered_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.delivered_date && <div className="text-red-500">{errors.delivered_date}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Payment Method</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={(e) => {
                                            setData('payment_method', e.target.value);
                                            if (e.target.value !== 'bank_transfer') {
                                                setData('bank_name', '');
                                            }
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="debit_card">Debit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="online_transfer">Online Transfer</option>
                                        <option value="mobile_wallet">Mobile Wallet</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.payment_method && <div className="text-red-500">{errors.payment_method}</div>}
                                </div>
                                {data.payment_method === 'bank_transfer' && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Select Bank</label>
                                        <select
                                            value={data.bank_name}
                                            onChange={(e) => setData('bank_name', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
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
                                        {errors.bank_name && <div className="text-red-500">{errors.bank_name}</div>}
                                    </div>
                                )}
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
                                
                                {/* Summary Section */}
                                <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="text-lg font-semibold text-gray-900">Rs. {parseFloat(data.total_amount || 0).toFixed(2)}</span>
                                        </div>
                                        {parseFloat(data.discount_amount) > 0 && (
                                            <div className="flex justify-between items-center text-orange-600">
                                                <span className="text-gray-600">Discount:</span>
                                                <span className="text-lg font-semibold">- Rs. {parseFloat(data.discount_amount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {parseFloat(data.shipping_charges) > 0 && (
                                            <div className="flex justify-between items-center text-blue-600">
                                                <span className="text-gray-600">Shipping Charges:</span>
                                                <span className="text-lg font-semibold">+ Rs. {parseFloat(data.shipping_charges).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                                            <span className="text-gray-700 font-semibold">Final Amount:</span>
                                            <span className="text-2xl font-bold text-green-600">Rs. {parseFloat(data.final_amount || data.total_amount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
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