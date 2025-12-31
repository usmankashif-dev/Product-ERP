<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['product', 'client', 'reservation'])->latest()->paginate(15);
        return Inertia::render('Invoices/Index', ['invoices' => $invoices]);
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['product', 'client', 'reservation']);
        return Inertia::render('Invoices/Show', ['invoice' => $invoice]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'reservation_id' => 'nullable|exists:reservations,id',
            'client_id' => 'nullable|exists:clients,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Generate unique invoice number
        $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 5, '0', STR_PAD_LEFT);

        $validated['invoice_number'] = $invoiceNumber;
        $validated['status'] = 'draft';

        $invoice = Invoice::create($validated);

        return redirect()->back()->with('success', 'Invoice created successfully! Invoice #' . $invoiceNumber);
    }

    public function updateStatus(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,paid,cancelled',
        ]);

        $invoice->update($validated);

        return redirect()->back()->with('success', 'Invoice status updated to ' . $validated['status']);
    }

    public function destroy(Invoice $invoice)
    {
        $invoiceNumber = $invoice->invoice_number;
        $invoice->delete();

        return redirect()->back()->with('success', 'Invoice ' . $invoiceNumber . ' deleted successfully');
    }
}
