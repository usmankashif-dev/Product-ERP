import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ invoice }) {
    const [selectedStatus, setSelectedStatus] = useState(invoice.status);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setIsUpdatingStatus(true);
        
        router.patch(`/invoices/${invoice.id}/status`, { status }, {
            onSuccess: () => {
                setIsUpdatingStatus(false);
            },
            onError: () => {
                setSelectedStatus(invoice.status);
                setIsUpdatingStatus(false);
            }
        });
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
            router.delete(`/invoices/${invoice.id}`, {
                onSuccess: () => {
                    router.visit('/invoices');
                }
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'draft': return '📝';
            case 'sent': return '📤';
            case 'paid': return '✅';
            case 'cancelled': return '❌';
            default: return '📄';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Invoice {invoice.invoice_number}
                </h2>
            }
        >
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Action Bar */}
                    <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedStatus)}`}>
                                {getStatusIcon(selectedStatus)} {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                            </span>
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={isUpdatingStatus}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex gap-2 print:hidden">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                🖨️ Print / PDF
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                                🗑️ Delete
                            </button>
                            <Link
                                href="/invoices"
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                            >
                                ← Back
                            </Link>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="bg-white rounded-lg shadow-lg p-12 print:shadow-none print:p-0">
                        {/* Header */}
                        <div className="mb-12 pb-12 border-b-2 border-gray-200">
                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                    <p className="text-2xl font-semibold text-blue-600">{invoice.invoice_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">Invoice Date:</p>
                                    <p className="text-lg font-semibold text-gray-900 mb-4">
                                        {new Date(invoice.invoice_date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                    {invoice.due_date && (
                                        <>
                                            <p className="text-sm text-gray-600 mb-1">Due Date:</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {new Date(invoice.due_date).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* From & To */}
                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">From</h2>
                                <div className="space-y-1 text-sm text-gray-900">
                                    <p className="font-semibold text-lg">Your Company</p>
                                    <p>Address Line 1</p>
                                    <p>City, State ZIP</p>
                                    <p>Phone: (555) 123-4567</p>
                                    <p>Email: info@company.com</p>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Bill To</h2>
                                <div className="space-y-1 text-sm text-gray-900">
                                    <p className="font-semibold text-lg">
                                        {invoice.client?.name || 'Client Information'}
                                    </p>
                                    {invoice.client?.email && <p>{invoice.client.email}</p>}
                                    {invoice.client?.phone && <p>{invoice.client.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-12">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase">Description</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm uppercase">Qty</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm uppercase">Unit Price</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-4 px-4 text-gray-900 font-medium">
                                            {invoice.product?.name || 'Product'}
                                        </td>
                                        <td className="py-4 px-4 text-right text-gray-900">{invoice.quantity}</td>
                                        <td className="py-4 px-4 text-right text-gray-900">${parseFloat(invoice.unit_price).toFixed(2)}</td>
                                        <td className="py-4 px-4 text-right text-gray-900 font-semibold">${parseFloat(invoice.total_amount).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="grid grid-cols-3 gap-12 mb-12">
                            <div />
                            <div />
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <div className="flex justify-between mb-3">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="text-gray-900 font-medium">${parseFloat(invoice.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-3 pb-3 border-b border-gray-300">
                                    <span className="text-gray-600">Tax (0%):</span>
                                    <span className="text-gray-900 font-medium">$0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-lg font-bold text-gray-900">Total:</span>
                                    <span className="text-2xl font-bold text-blue-600">${parseFloat(invoice.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mb-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
                                <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">Notes</h2>
                                <p className="text-blue-900">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="pt-12 border-t border-gray-200 text-center text-xs text-gray-500">
                            <p>Thank you for your business!</p>
                            <p className="mt-2">This is a computer-generated invoice. No signature is required.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body {
                        background: white;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:p-0 {
                        padding: 0 !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
