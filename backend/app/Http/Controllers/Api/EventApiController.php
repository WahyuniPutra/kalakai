<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Wish;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventApiController extends Controller
{
    /**
     * Get public event details (with wishes and gift accounts)
     */
    public function show(string $slug): JsonResponse
    {
        $event = Event::with(['giftAccounts', 'wishes' => fn($q) => $q->where('is_approved', true)])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (!$event) {
            return response()->json([
                'status' => 'error',
                'message' => 'Acara tidak ditemukan atau belum dipublikasikan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $event,
        ]);
    }

    /**
     * Get personalized event for a specific guest
     */
    public function showWithGuest(string $eventSlug, string $guestSlug): JsonResponse
    {
        $event = Event::with(['giftAccounts', 'wishes' => fn($q) => $q->where('is_approved', true)])
            ->where('slug', $eventSlug)
            ->where('is_published', true)
            ->first();

        if (!$event) {
            return response()->json([
                'status' => 'error',
                'message' => 'Acara tidak ditemukan.',
            ], 404);
        }

        $guest = Guest::where('event_id', $event->id)
            ->where('slug', $guestSlug)
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'event' => $event,
                'guest' => $guest ?? [
                    'name' => ucwords(str_replace('-', ' ', $guestSlug)),
                    'category' => 'Tamu Terhormat',
                    'pax' => 2,
                    'qr_code' => 'KLK-' . strtoupper(substr(md5($guestSlug), 0, 8)),
                    'status' => 'pending',
                ],
            ],
        ]);
    }

    /**
     * Submit RSVP and congratulations/wishes
     */
    public function storeRsvp(Request $request, string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'attendance' => 'required|in:hadir,tidak_hadir,ragu',
            'message' => 'required|string|max:1000',
            'guest_id' => 'nullable|exists:guests,id',
        ]);

        // If guest_id provided or guest matches by name, update status
        if (!empty($validated['guest_id'])) {
            Guest::where('id', $validated['guest_id'])
                ->where('event_id', $event->id)
                ->update(['status' => $validated['attendance']]);
        }

        $wish = Wish::create([
            'event_id' => $event->id,
            'guest_id' => $validated['guest_id'] ?? null,
            'guest_name' => $validated['guest_name'],
            'attendance' => $validated['attendance'],
            'message' => $validated['message'],
            'is_approved' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Terima kasih atas doa dan konfirmasi kehadirannya!',
            'data' => $wish,
        ]);
    }

    /**
     * Check-in guest via QR Code at Reception Desk
     */
    public function checkin(Request $request, string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'qr_code' => 'required|string',
        ]);

        $guest = Guest::where('event_id', $event->id)
            ->where('qr_code', $validated['qr_code'])
            ->first();

        if (!$guest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode QR tidak valid atau tamu tidak terdaftar di buku tamu acara ini.',
            ], 404);
        }

        $isAlreadyCheckedIn = !empty($guest->checked_in_at);

        $guest->update([
            'status' => 'hadir',
            'checked_in_at' => $guest->checked_in_at ?? now(),
        ]);

        return response()->json([
            'status' => 'success',
            'already_checked_in' => $isAlreadyCheckedIn,
            'message' => $isAlreadyCheckedIn
                ? "Tamu {$guest->name} sebelumnya sudah melakukan check-in pada {$guest->checked_in_at->format('H:i')}"
                : "Check-in Berhasil! Selamat datang {$guest->name}",
            'data' => $guest,
        ]);
    }

    /**
     * Guestbook statistics & guest list for Receptionist Dashboard
     */
    public function guestbook(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        $guests = Guest::where('event_id', $event->id)
            ->orderByRaw('checked_in_at DESC NULLS LAST')
            ->orderBy('name')
            ->get();

        $stats = [
            'total_guests' => $guests->count(),
            'total_hadir' => $guests->where('status', 'hadir')->count(),
            'total_tidak_hadir' => $guests->where('status', 'tidak_hadir')->count(),
            'total_pending' => $guests->where('status', 'pending')->count(),
            'total_checked_in' => $guests->whereNotNull('checked_in_at')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'event_date' => $event->event_date,
            ],
            'stats' => $stats,
            'guests' => $guests,
        ]);
    }
}
