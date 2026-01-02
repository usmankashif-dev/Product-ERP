import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ productReturn, products = [], clients = [] }) {
    const [showNewClient, setShowNewClient] = useState(false);

    const { data, setData, post, errors } = useForm({
        product_id: productReturn.product_id || '',
        quantity: productReturn.quantity || '',
        damaged: productReturn.damaged || false,
        refund_money: productReturn.refund_money || false,
        client_name: productReturn.client_name || '',
        client_phone: productReturn.client_phone || '',
        client_address: productReturn.client_address || '',
        reason: productReturn.reason || '',
        image: null,
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/returns/${productReturn.id}`, {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Return
                </h2>
            }
        >
            <Head title="Edit Return" />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Return</h1>
                        <p className="mt-2 text-gray-600">Update return information</p>
                    </div>
                    <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                        <div className="p-8">
                            <nav className="mb-6 pb-4 border-b border-gray-200">
                                <ol className="flex text-sm text-gray-500">
                                    <li><Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link></li>
                                    <li className="mx-2">/</li>
                                    <li><Link href="/returns" className="hover:text-blue-600 transition">Returns</Link></li>
                                    <li className="mx-2">/</li>
                                    <li className="text-gray-900 font-medium">Edit</li>
                                </ol>
                            </nav>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Product Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.product_id}
                                        onChange={(e) => setData('product_id', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select Product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - {product.color}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.product_id && <div className="text-red-500 text-sm mt-1">{errors.product_id}</div>}
                                </div>

                                {/* Quantity Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder="Enter quantity"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    {errors.quantity && <div className="text-red-500 text-sm mt-1">{errors.quantity}</div>}
                                </div>

                                {/* Damaged Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="damaged"
                                        checked={data.damaged}
                                        onChange={(e) => setData('damaged', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="damaged" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                                        Item is Damaged
                                    </label>
                                </div>

                                {/* Refund Money Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="refund_money"
                                        checked={data.refund_money}
                                        onChange={(e) => setData('refund_money', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="refund_money" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                                        Refund Money
                                    </label>
                                </div>

                                {/* Reason Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason for Return <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Enter reason for return"
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    />
                                    {errors.reason && <div className="text-red-500 text-sm mt-1">{errors.reason}</div>}
                                </div>

                                {/* Current Image */}
                                {productReturn.image && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                                        <img 
                                            src={`/storage/${productReturn.image}`} 
                                            alt="Return" 
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}

                                {/* Product Image Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Return Image <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files[0])}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                                    />
                                    {errors.image && <div className="text-red-500 text-sm mt-1">{errors.image}</div>}
                                    <p className="text-sm text-gray-500 mt-2">Accepted formats: JPEG, PNG, JPG, GIF. Max size: 2MB. Leave empty to keep current image.</p>
                                </div>

                                {/* Client Information Section */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                                    
                                    {/* Client Name Field */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
                                            placeholder="Client name"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        {errors.client_name && <div className="text-red-500 text-sm mt-1">{errors.client_name}</div>}
                                    </div>

                                    {/* Client Phone Field */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client_phone}
                                            onChange={(e) => setData('client_phone', e.target.value)}
                                            placeholder="Phone number"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        {errors.client_phone && <div className="text-red-500 text-sm mt-1">{errors.client_phone}</div>}
                                    </div>

                                    {/* Client Address Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.client_address}
                                            onChange={(e) => setData('client_address', e.target.value)}
                                            placeholder="Client address"
                                            rows="2"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        />
                                        {errors.client_address && <div className="text-red-500 text-sm mt-1">{errors.client_address}</div>}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6 border-t border-gray-200">
                                    <button 
                                        type="submit" 
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
                                    >
                                        Update Return
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
