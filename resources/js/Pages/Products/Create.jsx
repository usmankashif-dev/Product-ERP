import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ locations: initialLocations = [] }) {
    const [showNewLocation, setShowNewLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [locations, setLocations] = useState(initialLocations.length > 0 ? initialLocations : ['warehouse', 'shop', 'other']);

    const { data, setData, post, errors } = useForm({
        name: '',
        size: '',
        color: '',
        location: '',
        date: '',
        quantity: 0,
        price: '',
        description: '',
        image: null,
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/products');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Product
                </h2>
            }
        >
            <Head title="Create Product" />
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
                        <p className="mt-2 text-gray-600">Add a new product to your inventory</p>
                    </div>
                    <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                        <div className="p-8">
                            <nav className="mb-6 pb-4 border-b border-gray-200">
                                <ol className="flex text-sm text-gray-500">
                                    <li><Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link></li>
                                    <li className="mx-2">/</li>
                                    <li><Link href="/products" className="hover:text-blue-600 transition">Products</Link></li>
                                    <li className="mx-2">/</li>
                                    <li className="text-gray-900 font-medium">Create</li>
                                </ol>
                            </nav>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.name && <div className="text-red-500">{errors.name}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Size</label>
                                    <input
                                        type="text"
                                        value={data.size}
                                        onChange={(e) => setData('size', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.size && <div className="text-red-500">{errors.size}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Color</label>
                                    <input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.color && <div className="text-red-500">{errors.color}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Location</label>
                                    <select
                                        value={data.location}
                                        onChange={handleLocationChange}
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
                                    {errors.location && <div className="text-red-500">{errors.location}</div>}
                                </div>

                                {showNewLocation && (
                                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                                        <label className="block text-gray-700 mb-2">New Location Name</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newLocationName}
                                                onChange={(e) => setNewLocationName(e.target.value)}
                                                placeholder="Enter location name"
                                                className="flex-1 border border-gray-300 rounded px-3 py-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddLocation}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewLocation(false);
                                                    setNewLocationName('');
                                                }}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                    <label className="block text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.quantity && <div className="text-red-500">{errors.quantity}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.price && <div className="text-red-500">{errors.price}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    ></textarea>
                                    {errors.description && <div className="text-red-500">{errors.description}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files[0])}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                    {errors.image && <div className="text-red-500">{errors.image}</div>}
                                    <p className="text-sm text-gray-500 mt-1">Accepted formats: JPEG, PNG, JPG, GIF. Max size: 2MB</p>
                                </div>
                                <div className="pt-6 border-t border-gray-200">
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm">
                                        Create Product
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