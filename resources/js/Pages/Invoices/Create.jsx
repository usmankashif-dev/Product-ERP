import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ clients, products }) {
    const [formData, setFormData] = useState({
        customer_id: '',
        customer_name: '',
        customer_address: '',
        customer_phone: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        location: '',
        image: null,
        discount: 0,
        tax: 0,
        payment_method: 'cash',
        received_amount: 0,
    });

    const [products_list, setProductsList] = useState([]);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [currentProduct, setCurrentProduct] = useState({
        product_id: '',
        quantity: 1,
        price: 0,
        discount: 0,
        discount_type: 'percentage', // 'percentage' or 'amount'
        total: 0,
    });

    const [locations, setLocations] = useState(['warehouse', 'shop', 'other']);
    const [showNewLocation, setShowNewLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Load products
    useEffect(() => {
        if (products) {
            setProductsList(products);
        }
    }, [products]);

    // Handle location change
    const handleLocationChange = (e) => {
        const value = e.target.value;
        if (value === 'add_new') {
            setShowNewLocation(true);
            setFormData(prev => ({
                ...prev,
                location: '',
            }));
        } else {
            setShowNewLocation(false);
            setFormData(prev => ({
                ...prev,
                location: value,
            }));
        }
    };

    // Handle add new location
    const handleAddLocation = () => {
        if (newLocationName.trim()) {
            const newLocation = newLocationName.toLowerCase().trim();
            if (!locations.includes(newLocation)) {
                setLocations([...locations, newLocation]);
                setFormData(prev => ({
                    ...prev,
                    location: newLocation,
                }));
                setNewLocationName('');
                setShowNewLocation(false);
            }
        }
    };

    // Update product price when selected
    useEffect(() => {
        if (currentProduct.product_id) {
            const product = products_list.find(p => p.id === parseInt(currentProduct.product_id));
            if (product) {
                const price = product.price;
                let discountedPrice = price;
                
                if (currentProduct.discount_type === 'percentage') {
                    const discountAmount = price * (currentProduct.discount / 100);
                    discountedPrice = price - discountAmount;
                } else {
                    discountedPrice = price - currentProduct.discount;
                }
                
                const total = discountedPrice * currentProduct.quantity;
                setCurrentProduct(prev => ({
                    ...prev,
                    price: product.price,
                    total: total,
                }));
            }
        }
    }, [currentProduct.product_id, products_list]);

    // Update total when quantity changes
    const handleQuantityChange = (e) => {
        const quantity = parseInt(e.target.value) || 0;
        const price = currentProduct.price;
        let discountedPrice = price;
        
        if (currentProduct.discount_type === 'percentage') {
            const discountAmount = price * (currentProduct.discount / 100);
            discountedPrice = price - discountAmount;
        } else {
            discountedPrice = price - currentProduct.discount;
        }
        
        setCurrentProduct(prev => ({
            ...prev,
            quantity,
            total: discountedPrice * quantity,
        }));
    };

    // Update total when price changes
    const handlePriceChange = (e) => {
        const price = parseFloat(e.target.value) || 0;
        const quantity = currentProduct.quantity;
        let discountedPrice = price;
        
        if (currentProduct.discount_type === 'percentage') {
            const discountAmount = price * (currentProduct.discount / 100);
            discountedPrice = price - discountAmount;
        } else {
            discountedPrice = price - currentProduct.discount;
        }
        
        setCurrentProduct(prev => ({
            ...prev,
            price,
            total: discountedPrice * quantity,
        }));
    };

    // Update total when discount changes
    const handleProductDiscountChange = (e) => {
        const discount = parseFloat(e.target.value) || 0;
        const price = currentProduct.price;
        const quantity = currentProduct.quantity;
        let discountedPrice = price;
        
        if (currentProduct.discount_type === 'percentage') {
            const discountAmount = price * (discount / 100);
            discountedPrice = price - discountAmount;
        } else {
            discountedPrice = price - discount;
        }
        
        setCurrentProduct(prev => ({
            ...prev,
            discount,
            total: discountedPrice * quantity,
        }));
    };

    // Add product to invoice items
    const addProductToInvoice = () => {
        if (!currentProduct.product_id) {
            setErrors({ ...errors, product: 'Please select a product' });
            return;
        }
        if (currentProduct.quantity <= 0) {
            setErrors({ ...errors, quantity: 'Quantity must be greater than 0' });
            return;
        }

        const product = products_list.find(p => p.id === parseInt(currentProduct.product_id));
        const newItem = {
            id: Date.now(),
            product_id: currentProduct.product_id,
            product_name: product.name,
            quantity: currentProduct.quantity,
            price: currentProduct.price,
            discount: currentProduct.discount,
            discount_type: currentProduct.discount_type,
            total: currentProduct.total,
        };

        setInvoiceItems([...invoiceItems, newItem]);
        setCurrentProduct({
            product_id: '',
            quantity: 1,
            price: 0,
            discount: 0,
            discount_type: 'percentage',
            total: 0,
        });
        setErrors({});
    };

    // Remove product from invoice items
    const removeProductFromInvoice = (id) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    };

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subtotal * (formData.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (formData.tax / 100);
    const total = afterDiscount + taxAmount;
    const balance = total - formData.received_amount;

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0],
        }));
    };

    const handleClientChange = (e) => {
        const clientId = e.target.value;
        if (clientId) {
            const client = clients.find(c => c.id === parseInt(clientId));
            setFormData(prev => ({
                ...prev,
                customer_id: clientId,
                customer_name: client?.name || '',
                customer_email: client?.email || '',
                customer_phone: client?.phone || '',
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                customer_id: '',
                customer_name: '',
                customer_email: '',
                customer_phone: '',
            }));
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.customer_id && !formData.customer_name) {
            setErrors({ ...errors, customer: 'Please select or enter customer information' });
            return;
        }

        if (invoiceItems.length === 0) {
            setErrors({ ...errors, items: 'Please add at least one product' });
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('customer_id', formData.customer_id);
        data.append('customer_name', formData.customer_name);
        data.append('customer_address', formData.customer_address);
        data.append('customer_phone', formData.customer_phone);
        data.append('invoice_date', formData.invoice_date);
        data.append('due_date', formData.due_date);
        data.append('location', formData.location);
        data.append('discount', formData.discount);
        data.append('tax', formData.tax);
        data.append('payment_method', formData.payment_method);
        data.append('received_amount', formData.received_amount);
        data.append('subtotal', subtotal);
        data.append('total', total);
        data.append('balance', balance);
        data.append('items', JSON.stringify(invoiceItems));

        if (formData.image) {
            data.append('image', formData.image);
        }

        router.post('/invoices', data, {
            onSuccess: () => {
                setLoading(false);
                router.visit('/invoices');
            },
            onError: (errors) => {
                setLoading(false);
                setErrors(errors);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Invoice
                </h2>
            }
        >
            <Head title="Create Invoice" />
            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {/* Customer Information */}
                        <div className="mb-8 pb-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleInputChange}
                                        placeholder="Customer name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="customer_address"
                                        value={formData.customer_address}
                                        onChange={handleInputChange}
                                        placeholder="Address"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        name="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={handleInputChange}
                                        placeholder="Phone"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {errors.customer && <p className="text-red-600 text-sm mt-2">{errors.customer}</p>}
                        </div>

                        {/* Dates & Location */}
                        <div className="mb-8 pb-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                                    <input
                                        type="date"
                                        name="invoice_date"
                                        value={formData.invoice_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleLocationChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Select Location --</option>
                                        {locations.map(loc => (
                                            <option key={loc} value={loc}>
                                                {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                            </option>
                                        ))}
                                        <option value="add_new">+ Add New Location</option>
                                    </select>
                                </div>
                            </div>

                            {showNewLocation && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">New Location Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newLocationName}
                                            onChange={(e) => setNewLocationName(e.target.value)}
                                            placeholder="Enter location name"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddLocation}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewLocation(false);
                                                setNewLocationName('');
                                            }}
                                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Products Section */}
                        <div className="mb-8 pb-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Products</h3>
                            
                            {/* Product Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                                    <select
                                        value={currentProduct.product_id}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, product_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Select Product --</option>
                                        {products_list.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} (PKR {product.price})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.product && <p className="text-red-600 text-xs mt-1">{errors.product}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input
                                        type="number"
                                        value={currentProduct.price}
                                        onChange={handlePriceChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={currentProduct.discount}
                                            onChange={handleProductDiscountChange}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <select
                                            value={currentProduct.discount_type}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, discount_type: e.target.value, discount: 0 })}
                                            className="px-2 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="percentage">%</option>
                                            <option value="amount">PKR</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentProduct.quantity}
                                        onChange={handleQuantityChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.quantity && <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                                    <input
                                        type="number"
                                        value={currentProduct.total}
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Add/Remove Buttons */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    type="button"
                                    onClick={addProductToInvoice}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    ✓ Add Product
                                </button>
                            </div>

                            {errors.items && <p className="text-red-600 text-sm mb-4">{errors.items}</p>}

                            {/* Invoice Items Table */}
                            {invoiceItems.length > 0 && (
                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-300">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-semibold text-gray-900">Product</th>
                                                <th className="px-4 py-2 text-right font-semibold text-gray-900">Price</th>
                                                <th className="px-4 py-2 text-right font-semibold text-gray-900">Discount</th>
                                                <th className="px-4 py-2 text-right font-semibold text-gray-900">Qty</th>
                                                <th className="px-4 py-2 text-right font-semibold text-gray-900">Total</th>
                                                <th className="px-4 py-2 text-center font-semibold text-gray-900">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceItems.map(item => (
                                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-900">{item.product_name}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">PKR {item.price.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900">
                                                        {item.discount_type === 'percentage' 
                                                            ? `${item.discount}%` 
                                                            : `PKR ${item.discount.toFixed(2)}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-900">PKR {item.total.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProductFromInvoice(item.id)}
                                                            className="text-red-600 hover:text-red-800 font-semibold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div className="mb-8 pb-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image</h3>
                            <input
                                type="file"
                                name="image"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        {/* Discount & Tax */}
                        <div className="mb-8 pb-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Charges</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                                    <input
                                        type="number"
                                        name="tax"
                                        value={formData.tax}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="mb-8 pb-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="check">Check</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Received Amount</label>
                                    <input
                                        type="number"
                                        name="received_amount"
                                        value={formData.received_amount}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">PKR {subtotal.toFixed(2)}</span>
                                </div>
                                {formData.discount > 0 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span>Discount ({formData.discount}%):</span>
                                        <span className="font-semibold text-red-600">-PKR {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {formData.tax > 0 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tax ({formData.tax}%):</span>
                                        <span className="font-semibold text-green-600">+PKR {taxAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-300 pt-3 flex justify-between">
                                    <span className="text-lg font-bold text-gray-900">Total:</span>
                                    <span className="text-lg font-bold text-blue-600">PKR {total.toFixed(2)}</span>
                                </div>
                                <div className={`flex justify-between pt-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    <span className="font-semibold">Balance:</span>
                                    <span className="font-bold text-lg">PKR {balance.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                            >
                                {loading ? 'Creating...' : 'Create Invoice'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit('/invoices')}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
