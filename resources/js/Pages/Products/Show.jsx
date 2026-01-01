import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ product }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Product Details
                </h2>
            }
        >
            <Head title={`Product: ${product.name}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <nav className="mb-4">
                                <ol className="flex text-sm text-gray-500">
                                    <li><Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link></li>
                                    <li className="mx-2">/</li>
                                    <li><Link href="/products" className="hover:text-gray-700">Products</Link></li>
                                    <li className="mx-2">/</li>
                                    <li className="text-gray-900">{product.name}</li>
                                </ol>
                            </nav>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Product Details</h2>
                                <Link href="/products" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                    Back to Products
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <strong>Product Image:</strong>
                                    <div className="mt-2">
                                        {product.image ? (
                                            <img src={`/storage/${product.image}`} alt={product.name} className="max-w-xs h-auto rounded-lg shadow-md" />
                                        ) : (
                                            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <strong>Name:</strong> {product.name}
                                </div>
                                <div>
                                    <strong>Color:</strong> {product.color}
                                </div>
                                <div>
                                    <strong>Location:</strong> {product.location}
                                </div>
                                <div>
                                    <strong>Quantity:</strong> {product.quantity}
                                </div>
                                <div>
                                    <strong>Price:</strong> ${product.price}
                                </div>
                                <div className="md:col-span-2">
                                    <strong>Description:</strong> {product.description || 'No description'}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link href={`/products/${product.id}/edit`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2">
                                    Edit Product
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}