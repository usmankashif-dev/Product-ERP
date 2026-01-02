import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ productReturn }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Return Details
                </h2>
            }
        >
            <Head title="Return Details" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <nav className="mb-4">
                                <ol className="flex text-sm text-gray-500">
                                    <li><Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link></li>
                                    <li className="mx-2">/</li>
                                    <li><Link href="/returns" className="hover:text-gray-700">Returns</Link></li>
                                    <li className="mx-2">/</li>
                                    <li className="text-gray-900">Return #{productReturn.id}</li>
                                </ol>
                            </nav>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Return Details</h2>
                                <Link href="/returns" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                    Back to Returns
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <strong className="text-gray-700">Product:</strong>
                                            <p className="text-gray-600">{productReturn.product_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Quantity:</strong>
                                            <p className="text-gray-600">{productReturn.quantity} units</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Return Status */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Status</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <strong className="text-gray-700">Status:</strong>
                                            <p className="text-gray-600">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    productReturn.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    productReturn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {productReturn.status ? productReturn.status.charAt(0).toUpperCase() + productReturn.status.slice(1) : 'N/A'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Damaged:</strong>
                                            <p className="text-gray-600">{productReturn.damaged ? '✅ Yes' : '❌ No'}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Refund Money:</strong>
                                            <p className="text-gray-600">{productReturn.refund_money ? '✅ Yes' : '❌ No'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Client Information */}
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <strong className="text-gray-700">Name:</strong>
                                            <p className="text-gray-600">{productReturn.client_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Phone:</strong>
                                            <p className="text-gray-600">{productReturn.client_phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Address:</strong>
                                            <p className="text-gray-600">{productReturn.client_address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Return Reason */}
                                {productReturn.reason && (
                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Reason</h3>
                                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{productReturn.reason}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <Link href="/returns" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                                    Back to Returns
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
