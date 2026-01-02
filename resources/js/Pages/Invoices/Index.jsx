import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ invoices }) {
    const [filterStatus, setFilterStatus] = useState('');
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    // Handle both paginated and non-paginated invoice data
    const invoicesArray = invoices.data ? invoices.data : invoices;

    const filteredInvoices = filterStatus 
        ? invoicesArray.filter(inv => inv.status === filterStatus)
        : invoicesArray;

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

    const handleStatusChange = (invoiceId, newStatus) => {
        setUpdatingStatusId(invoiceId);
        router.patch(`/invoices/${invoiceId}/status`, { status: newStatus }, {
            onSuccess: () => {
                setUpdatingStatusId(null);
            },
            onError: () => {
                setUpdatingStatusId(null);
            }
        });
    };

    const handleDelete = (invoiceId, invoiceNumber) => {
        if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
            router.delete(`/invoices/${invoiceId}`);
        }
    };

    const getTotalAmount = () => {
        return invoicesArray.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0).toFixed(2);
    };

    const getPaidAmount = () => {
        return invoicesArray.filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0).toFixed(2);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Invoices
                </h2>
            }
        >
            <Head title="Invoices" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideUp" style={{animationDelay: '0ms'}}>
                            <div className="text-sm text-gray-600 font-medium">Total Invoices</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{invoicesArray.length}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideUp" style={{animationDelay: '50ms'}}>
                            <div className="text-sm text-gray-600 font-medium">Paid</div>
                            <div className="text-3xl font-bold text-green-600 mt-2">PKR {getPaidAmount()}</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideUp" style={{animationDelay: '100ms'}}>
                            <div className="text-sm text-gray-600 font-medium">Total Amount</div>
                            <div className="text-3xl font-bold text-orange-600 mt-2">PKR {getTotalAmount()}</div>
                        </div>
                    </div>

                    {/* Filter & Search */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Filter by Status</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterStatus('')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterStatus === '' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('draft')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterStatus === 'draft' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                >
                                    📝 Draft
                                </button>
                                <button
                                    onClick={() => setFilterStatus('sent')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterStatus === 'sent' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                >
                                    📤 Sent
                                </button>
                                <button
                                    onClick={() => setFilterStatus('paid')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterStatus === 'paid' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                >
                                    ✅ Paid
                                </button>
                                <button
                                    onClick={() => setFilterStatus('cancelled')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterStatus === 'cancelled' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                >
                                    ❌ Cancelled
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Invoices Table */}
                    {filteredInvoices.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredInvoices.map((invoice, index) => (
                                            <tr key={invoice.id} className="hover:bg-yellow-50 transition-all duration-200 hover:shadow-md border-l-4 border-l-transparent hover:border-l-yellow-500 animate-slideUp" style={{animationDelay: `${index * 50}ms`}}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                    <Link href={`/invoices/${invoice.id}`}>
                                                        {invoice.invoice_number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {invoice.product?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {invoice.client?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    PKR {parseFloat(invoice.total_amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(invoice.invoice_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={invoice.status}
                                                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                                                        disabled={updatingStatusId === invoice.id}
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${getStatusColor(invoice.status)} ${
                                                            updatingStatusId === invoice.id ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    >
                                                        <option value="draft">📝 Draft</option>
                                                        <option value="sent">📤 Sent</option>
                                                        <option value="paid">✅ Paid</option>
                                                        <option value="cancelled">❌ Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={`/invoices/${invoice.id}`}
                                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                                        >
                                                            View
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
                                                            className="text-red-600 hover:text-red-900 font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-gray-600">No invoices found</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideUp {
                    animation: slideUp 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
