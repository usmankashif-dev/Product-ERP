import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ locations: initialLocations = [] }) {
    const [showNewLocation, setShowNewLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [locations, setLocations] = useState(initialLocations.length > 0 ? initialLocations : ['warehouse', 'shop', 'other']);

    const { data, setData, post, errors } = useForm({
        name: '',
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
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter product name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                </div>

                                {/* Color Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        placeholder="e.g., Red, Blue"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    {errors.color && <div className="text-red-500 text-sm mt-1">{errors.color}</div>}
                                </div>

                                {/* Location Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.location}
                                        onChange={handleLocationChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map((loc) => (
                                            <option key={loc} value={loc}>
                                                {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                            </option>
                                        ))}
                                        <option value="add_new">+ Add New Location</option>
                                    </select>
                                    {errors.location && <div className="text-red-500 text-sm mt-1">{errors.location}</div>}
                                </div>

                                {showNewLocation && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">New Location Name</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newLocationName}
                                                onChange={(e) => setNewLocationName(e.target.value)}
                                                placeholder="Enter location name"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Date and Quantity - Two Column */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        {errors.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            placeholder="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        {errors.quantity && <div className="text-red-500 text-sm mt-1">{errors.quantity}</div>}
                                    </div>
                                </div>

                                {/* Price Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter product description"
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    ></textarea>
                                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                </div>

                                {/* Image Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Image <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files[0])}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                                    />
                                    {errors.image && <div className="text-red-500 text-sm mt-1">{errors.image}</div>}
                                    <p className="text-sm text-gray-500 mt-2">Accepted formats: JPEG, PNG, JPG, GIF. Max size: 2MB</p>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6 border-t border-gray-200">
                                    <button 
                                        type="submit" 
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
                                    >
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