import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const PAKISTAN_BANKS = [
    'HBL - Habib Bank Limited',
    'ABL - Allied Bank Limited',
    'UBL - United Bank Limited',
    'MCB - MCB Bank Limited',
    'NBP - National Bank of Pakistan',
    'BOP - Bank of Punjab',
    'Faysal Bank',
    'Askari Bank',
    'SILK Bank',
    'Jazz Bank',
    'Alfalah Bank',
    'SBP - State Bank of Pakistan',
    'Bank Al Falah',
    'Habib Metropolitan Bank',
    'KASB Bank',
    'ICBC Bank',
    'Dubai Islamic Bank',
    'Meezan Bank',
    'Bank Islami Pakistan',
    'Other Banks'
];

export default function Edit({ reservation, products, locations: initialLocations = [] }) {
    const [showNewLocation, setShowNewLocation] = React.useState(false);
    const [newLocationName, setNewLocationName] = React.useState('');
    const [locations, setLocations] = React.useState(initialLocations.length > 0 ? initialLocations : ['warehouse', 'shop', 'other']);
    const [imagePreview, setImagePreview] = React.useState(reservation.image ? `/storage/${reservation.image}` : null);
    
    const { data, setData, post, errors } = useForm({
        product_id: reservation.product_id || '',
        quantity: reservation.quantity || 1,
        location: reservation.location || '',
        date: reservation.date || '',
        sales_date: reservation.sales_date || '',
        paid_amount: reservation.paid_amount || 0,
        total_amount: reservation.total_amount || 0,
        discount_type: reservation.discount_type || '',
        discount_value: reservation.discount_value || '',
        discount_amount: reservation.discount_amount || 0,
        final_amount: reservation.final_amount || 0,
        status: reservation.status || 'pending',
        client_name: reservation.client_name || '',
        client_phone: reservation.client_phone || '',
        client_address: reservation.client_address || '',
        payment_method: reservation.payment_method || 'cash',
        bank_name: reservation.bank_name || '',
        image: null,
        _method: 'PUT',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDiscountChange = (type, value, totalAmount = null) => {
        const amount = totalAmount !== null ? totalAmount : parseFloat(data.total_amount) || 0;
        let discountAmount = 0;
        let finalAmount = amount;

        if (type && value) {
            if (type === 'amount') {
                discountAmount = Math.min(parseFloat(value), amount);
            } else if (type === 'percentage') {
                const percentage = Math.min(parseFloat(value), 100);
                discountAmount = (amount * percentage) / 100;
            }
            finalAmount = amount - discountAmount;
        }

        setData('discount_type', type);
        setData('discount_value', value);
        setData('discount_amount', discountAmount);
        setData('final_amount', finalAmount);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/reservations/${reservation.id}`, {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Reservation
                </h2>
            }
        >
            <Head title="Edit Reservation" />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Reservation</h1>
                        <p className="mt-2 text-gray-600">Update reservation details</p>
                    </div>
                    <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                        <div className="p-8">
                            <nav className="mb-6 pb-4 border-b border-gray-200">
                                <ol className="flex text-sm text-gray-500">
                                    <li><Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link></li>
                                    <li className="mx-2">/</li>
                                    <li><Link href="/reservations" className="hover:text-blue-600 transition">Reservations</Link></li>
                                    <li className="mx-2">/</li>
                                    <li className="text-gray-900 font-medium">Edit</li>
                                </ol>
                            </nav>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700">Product</label>
                                    <select
                                        value={data.product_id}
                                        onChange={(e) => setData('product_id', e.target.value)}
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
                                        onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="0"
                                    />
                                    {errors.quantity && <div className="text-red-500">{errors.quantity}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Size (optional)</label>
                                    <input
                                        type="text"
                                        value={data.size}
                                        onChange={(e) => setData('size', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.size && <div className="text-red-500">{errors.size}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Location (optional)</label>
                                    <div className="space-y-2">
                                        <select
                                            value={showNewLocation ? 'add_new' : data.location}
                                            onChange={(e) => {
                                                if (e.target.value === 'add_new') {
                                                    setShowNewLocation(true);
                                                } else {
                                                    setShowNewLocation(false);
                                                    setData('location', e.target.value);
                                                }
                                            }}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        >
                                            <option value="">Select Location</option>
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
                                                        onClick={() => {
                                                            if (newLocationName.trim()) {
                                                                const newLoc = newLocationName.toLowerCase().trim();
                                                                if (!locations.includes(newLoc)) {
                                                                    setLocations([...locations, newLoc]);
                                                                    setData('location', newLoc);
                                                                    setNewLocationName('');
                                                                    setShowNewLocation(false);
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
                                    {errors.location && <div className="text-red-500">{errors.location}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Date (optional)</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.date && <div className="text-red-500">{errors.date}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Sales Date (optional)</label>
                                    <input
                                        type="date"
                                        value={data.sales_date}
                                        onChange={(e) => setData('sales_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.sales_date && <div className="text-red-500">{errors.sales_date}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Total Amount</label>
                                    <input
                                        type="number"
                                        value={data.total_amount}
                                        onChange={(e) => setData('total_amount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                    {errors.total_amount && <div className="text-red-500">{errors.total_amount}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Paid Amount</label>
                                    <input
                                        type="number"
                                        value={data.paid_amount}
                                        onChange={(e) => setData('paid_amount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                    {errors.paid_amount && <div className="text-red-500">{errors.paid_amount}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Payment Method</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={(e) => {
                                            setData('payment_method', e.target.value);
                                            if (e.target.value !== 'bank') {
                                                setData('bank_name', '');
                                            }
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="debit_card">Debit Card</option>
                                        <option value="check">Check</option>
                                        <option value="online_transfer">Online Transfer</option>
                                        <option value="mobile_wallet">Mobile Wallet</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.payment_method && <div className="text-red-500">{errors.payment_method}</div>}
                                </div>
                                {data.payment_method === 'bank' && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Select Bank</label>
                                        <select
                                            value={data.bank_name}
                                            onChange={(e) => setData('bank_name', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        >
                                            <option value="">-- Choose a bank --</option>
                                            {PAKISTAN_BANKS.map((bank) => (
                                                <option key={bank} value={bank}>
                                                    {bank}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.bank_name && <div className="text-red-500">{errors.bank_name}</div>}
                                    </div>
                                )}
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
                                        {data.discount_type && data.discount_value && (
                                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-gray-600">Discount Amount:</span>
                                                    <span className="text-sm font-semibold">Rs. {parseFloat(data.discount_amount).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-semibold text-gray-700">Final Amount:</span>
                                                    <span className="text-sm font-bold text-green-900">Rs. {parseFloat(data.final_amount || data.total_amount).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="mb-4">
                                    <label className="block text-gray-700">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    {errors.status && <div className="text-red-500">{errors.status}</div>}
                                </div>
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Information</h3>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
                                            placeholder="Client name"
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                        {errors.client_name && <div className="text-red-500">{errors.client_name}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            value={data.client_phone}
                                            onChange={(e) => setData('client_phone', e.target.value)}
                                            placeholder="Client phone"
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                        {errors.client_phone && <div className="text-red-500">{errors.client_phone}</div>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Address</label>
                                        <textarea
                                            value={data.client_address}
                                            onChange={(e) => setData('client_address', e.target.value)}
                                            placeholder="Client address"
                                            className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
                                            rows="3"
                                        ></textarea>
                                        {errors.client_address && <div className="text-red-500">{errors.client_address}</div>}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Photo (optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Supported formats: JPEG, PNG, JPG, GIF. Max size: 2MB</p>
                                    {errors.image && <div className="text-red-500">{errors.image}</div>}
                                    {imagePreview && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                            <img src={imagePreview} alt="Preview" className="h-32 rounded border border-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm">Update Reservation</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}