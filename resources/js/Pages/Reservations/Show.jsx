import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ reservation }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Reservation Details
                </h2>
            }
        >
            <Head title={`Reservation: ${reservation.product.name}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <nav className="mb-4">
                                <ol className="flex text-sm text-gray-500">
                                    <li><Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link></li>
                                    <li className="mx-2">/</li>
                                    <li><Link href="/reservations" className="hover:text-gray-700">Reservations</Link></li>
                                    <li className="mx-2">/</li>
                                    <li className="text-gray-900">{reservation.product.name}</li>
                                </ol>
                            </nav>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Reservation Details</h2>
                                <Link href="/reservations" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                    Back to Reservations
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <strong>Product:</strong> {reservation.product.name} ({reservation.product.size}, {reservation.product.color})
                                </div>
                                <div>
                                    <strong>Client:</strong> {reservation.client_name || reservation.client?.name || 'N/A'} {(reservation.client_phone || reservation.client?.phone) && <span>({reservation.client_phone || reservation.client?.phone})</span>}
                                </div>
                                {reservation.client_address && (
                                    <div>
                                        <strong>Address:</strong> {reservation.client_address}
                                    </div>
                                )}
                                <div>
                                    <strong>Quantity:</strong> {reservation.quantity}
                                </div>
                                <div>
                                    <strong>Size:</strong> {reservation.size || 'N/A'}
                                </div>
                                <div>
                                    <strong>Status:</strong> {reservation.status}
                                </div>
                                <div>
                                    <strong>Payment Method:</strong> {reservation.payment_method ? reservation.payment_method.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A'}
                                </div>
                                <div>
                                    <strong>Reserved At:</strong> {new Date(reservation.reserved_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link href={`/reservations/${reservation.id}/edit`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2">
                                    Edit Reservation
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}