import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ reservation, products, clients, locations: initialLocations = [] }) {
    const [showNewLocation, setShowNewLocation] = React.useState(false);
    const [newLocationName, setNewLocationName] = React.useState('');
    const [locations, setLocations] = React.useState(initialLocations.length > 0 ? initialLocations : ['warehouse', 'shop', 'other']);
    
    const { data, setData, put, errors } = useForm({
        product_id: reservation.product_id || '',
        client_id: reservation.client_id || '',
        quantity: reservation.quantity || 1,
        size: reservation.size || '',
        location: reservation.location || '',
        date: reservation.date || '',
        status: reservation.status || 'pending',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/reservations/${reservation.id}`, {
            onSuccess: () => {
                window.location.reload();
            }
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
                                                {product.name} - {product.size} - {product.color} (Qty: {product.quantity})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.product_id && <div className="text-red-500">{errors.product_id}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Client</label>
                                    <select
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="">Select Client</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} - {client.email}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.client_id && <div className="text-red-500">{errors.client_id}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="1"
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
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm">Update Reservation</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}