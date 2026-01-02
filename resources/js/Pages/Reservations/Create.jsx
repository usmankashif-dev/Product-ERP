import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ products, selectedProduct, locations: initialLocations = [] }) {
    const [showNewLocation, setShowNewLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [locations, setLocations] = useState(initialLocations.length > 0 ? initialLocations : ['warehouse', 'shop', 'other']);
    const [imagePreview, setImagePreview] = useState(null);
    
    const { data, setData, post, errors } = useForm({
        product_id: selectedProduct ? selectedProduct.id : '',
        quantity: 1,
        location: '',
        date: '',
        client_name: '',
        client_phone: '',
        client_address: '',
        image: null,
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

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reservations', {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Reservation
                </h2>
            }
        >
            <Head title="Create Reservation" />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Create Reservation</h1>
                        <p className="mt-2 text-gray-600">Create a new reservation for your client</p>
                    </div>
                    <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                        <div className="p-8">
                            <nav className="mb-6 pb-4 border-b border-gray-200">
                                <ol className="flex text-sm text-gray-500">
                                    <li><Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link></li>
                                    <li className="mx-2">/</li>
                                    <li><Link href="/reservations" className="hover:text-blue-600 transition">Reservations</Link></li>
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
                                        onChange={(e) => setData('quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="0"
                                    />
                                    {errors.quantity && <div className="text-red-500">{errors.quantity}</div>}
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
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm">Create Reservation</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}