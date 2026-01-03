<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\Client;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['product', 'client', 'reservation'])->latest()->paginate(15);
        return Inertia::render('Invoices/Index', ['invoices' => $invoices]);
    }

    public function create()
    {
        $clients = Client::all();
        $products = Product::all();
        return Inertia::render('Invoices/Create', [
            'clients' => $clients,
            'products' => $products,
        ]);
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['product', 'client', 'reservation']);
        return Inertia::render('Invoices/Show', ['invoice' => $invoice]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:clients,id',
            'customer_name' => 'required|string|max:255',
            'customer_address' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'discount' => 'nullable|numeric|min:0|max:100',
            'tax' => 'nullable|numeric|min:0|max:100',
            'payment_method' => 'required|in:cash,bank_transfer,credit_card,check',
            'received_amount' => 'nullable|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'balance' => 'required|numeric',
            'items' => 'required|json',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            DB::beginTransaction();

            // Generate unique invoice number
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 5, '0', STR_PAD_LEFT);

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('invoices', 'public');
            }

            // Decode items
            $items = json_decode($request->items, true);

            // Create invoices for each product item
            foreach ($items as $item) {
                $invoiceData = [
                    'invoice_number' => $invoiceNumber . '-' . ($items[0]['product_id'] === $item['product_id'] ? 1 : array_search($item, $items) + 1),
                    'product_id' => $item['product_id'],
                    'client_id' => $validated['customer_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_amount' => $item['total'],
                    'invoice_date' => $validated['invoice_date'],
                    'due_date' => $validated['due_date'],
                    'status' => 'draft',
                    'location' => $validated['location'],
                    'discount' => $validated['discount'] ?? 0,
                    'tax' => $validated['tax'] ?? 0,
                    'payment_method' => $validated['payment_method'],
                    'received_amount' => $validated['received_amount'] ?? 0,
                    'subtotal' => $validated['subtotal'],
                    'total_invoice' => $validated['total'],
                    'balance' => $validated['balance'],
                    'customer_name' => $validated['customer_name'],
                    'customer_address' => $validated['customer_address'],
                    'customer_phone' => $validated['customer_phone'],
                    'image' => $imagePath,
                ];

                Invoice::create($invoiceData);
            }

            DB::commit();

            return redirect('/invoices')->with('success', 'Invoice created successfully! Invoice #' . $invoiceNumber);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create invoice: ' . $e->getMessage());
        }
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
