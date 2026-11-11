<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    private const PACKAGE_PRICES = [
        'bahagia' => 99000,
        'resepsi' => 199000,
    ];

    private const PACKAGE_TITLES = [
        'bahagia' => 'Paket Bahagia (Silver)',
        'resepsi' => 'Paket Resepsi (Pro Platinum)',
    ];

    /**
     * Create a new checkout transaction for upgrading event package
     */
    public function checkout(Request $request, int $eventId): JsonResponse
    {
        $event = $request->user()->events()->findOrFail($eventId);

        $validated = $request->validate([
            'package_code' => 'required|in:bahagia,resepsi',
            'payment_method' => 'nullable|in:qris,bca_va,mandiri_va',
        ]);

        $packageCode = $validated['package_code'];
        $paymentMethod = $validated['payment_method'] ?? 'qris';
        $amount = self::PACKAGE_PRICES[$packageCode];

        $invoiceNumber = 'INV-KLK-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        // Create virtual account or mock QRIS string
        $qrisPayload = "00020101021226680016ID.CO.KALAKAI.WWW011893600998" . strtoupper(Str::random(12)) . "520458125303360540" . $amount . "5802ID5915KERABAT KALAKAI6012PALANGKARAYA6304" . strtoupper(Str::random(4));
        $vaNumber = $paymentMethod === 'bca_va' ? '88012' . rand(10000000, 99999999) : ($paymentMethod === 'mandiri_va' ? '89012' . rand(10000000, 99999999) : null);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'event_id' => $event->id,
            'invoice_number' => $invoiceNumber,
            'package_code' => $packageCode,
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'payment_status' => 'pending',
            'expires_at' => now()->addHours(24),
            'metadata' => [
                'package_title' => self::PACKAGE_TITLES[$packageCode],
                'qris_payload' => $qrisPayload,
                'va_number' => $vaNumber,
            ],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tagihan pembayaran berhasil dibuat.',
            'data' => [
                'transaction' => $transaction,
                'qris_image_url' => "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" . urlencode($qrisPayload),
                'va_number' => $vaNumber,
            ],
        ], 201);
    }

    /**
     * Check payment status
     */
    public function status(Request $request, string $invoiceNumber): JsonResponse
    {
        $transaction = Transaction::where('invoice_number', $invoiceNumber)
            ->where('user_id', $request->user()->id)
            ->with('event')
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $transaction,
        ]);
    }

    /**
     * Simulate successful payment (for development & demo verification)
     */
    public function simulate(Request $request, string $invoiceNumber): JsonResponse
    {
        $transaction = Transaction::where('invoice_number', $invoiceNumber)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($transaction->payment_status === 'paid') {
            return response()->json([
                'status' => 'success',
                'message' => 'Tagihan ini sudah lunas sebelumnya.',
                'data' => $transaction,
            ]);
        }

        // Mark as paid
        $transaction->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        // Upgrade the event package automatically
        $event = Event::findOrFail($transaction->event_id);
        $event->update([
            'package_code' => $transaction->package_code,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Pembayaran berhasil diverifikasi! Acara '{$event->title}' telah ditingkatkan ke " . self::PACKAGE_TITLES[$transaction->package_code] . ".",
            'data' => [
                'transaction' => $transaction,
                'event' => $event,
            ],
        ]);
    }
}
