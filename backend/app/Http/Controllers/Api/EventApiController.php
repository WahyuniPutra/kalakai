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
                    'is_vip' => false,
                    'table_number' => 'Reguler',
                    'pax' => 2,
                    'souvenir_count' => 1,
                    'souvenir_claimed_at' => null,
                    'envelope_number' => null,
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
            'claim_souvenir' => 'nullable|boolean',
            'envelope_number' => 'nullable|string|max:50',
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
        $souvenirAlreadyClaimed = !empty($guest->souvenir_claimed_at);

        $updateData = [
            'status' => 'hadir',
            'checked_in_at' => $guest->checked_in_at ?? now(),
        ];

        // Claim souvenir if requested
        if (!empty($validated['claim_souvenir']) && !$souvenirAlreadyClaimed) {
            $updateData['souvenir_claimed_at'] = now();
        }

        // Tag envelope number if provided
        if (!empty($validated['envelope_number'])) {
            $updateData['envelope_number'] = trim($validated['envelope_number']);
        }

        $guest->update($updateData);

        return response()->json([
            'status' => 'success',
            'already_checked_in' => $isAlreadyCheckedIn,
            'souvenir_already_claimed' => $souvenirAlreadyClaimed,
            'message' => $isAlreadyCheckedIn
                ? "Tamu {$guest->name} sebelumnya sudah check-in pada {$guest->checked_in_at->format('H:i')} WIB"
                : "Check-in Berhasil! Selamat datang {$guest->name}",
            'data' => $guest,
        ]);
    }

    /**
     * Toggle souvenir claim status
     */
    public function toggleSouvenir(Request $request, string $slug, int $guestId): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $guest = Guest::where('event_id', $event->id)->where('id', $guestId)->firstOrFail();

        $action = $request->input('action', 'claim');

        if ($action === 'revoke') {
            $guest->update(['souvenir_claimed_at' => null]);
            $message = "Status souvenir untuk {$guest->name} berhasil dibatalkan.";
        } else {
            $guest->update(['souvenir_claimed_at' => now()]);
            $message = "Souvenir ({$guest->souvenir_count} pax) berhasil diserahkan kepada {$guest->name}.";
        }

        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $guest,
        ]);
    }

    /**
     * Update physical envelope number
     */
    public function updateEnvelope(Request $request, string $slug, int $guestId): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $guest = Guest::where('event_id', $event->id)->where('id', $guestId)->firstOrFail();

        $validated = $request->validate([
            'envelope_number' => 'nullable|string|max:50',
        ]);

        $guest->update([
            'envelope_number' => $validated['envelope_number'] ? trim($validated['envelope_number']) : null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Nomor amplop fisik berhasil diperbarui.',
            'data' => $guest,
        ]);
    }

    /**
     * Live display data stream for projector / welcome TV
     */
    public function liveFeed(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        $recentCheckins = Guest::where('event_id', $event->id)
            ->whereNotNull('checked_in_at')
            ->orderBy('checked_in_at', 'desc')
            ->limit(10)
            ->get();

        $recentWishes = Wish::where('event_id', $event->id)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $stats = [
            'total_guests' => Guest::where('event_id', $event->id)->count(),
            'total_checked_in' => Guest::where('event_id', $event->id)->whereNotNull('checked_in_at')->count(),
            'total_pax_attended' => (int) Guest::where('event_id', $event->id)->whereNotNull('checked_in_at')->sum('pax'),
        ];

        return response()->json([
            'status' => 'success',
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'groom_name' => $event->groom_name,
                'bride_name' => $event->bride_name,
                'event_date' => $event->event_date,
                'location_name' => $event->location_name,
                'theme_config' => $event->theme_config,
            ],
            'stats' => $stats,
            'recent_checkins' => $recentCheckins,
            'recent_wishes' => $recentWishes,
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
            'total_souvenirs_claimed' => $guests->whereNotNull('souvenir_claimed_at')->count(),
            'total_souvenirs_target' => (int) $guests->sum('souvenir_count'),
            'total_vip' => $guests->where('is_vip', true)->count(),
            'total_pax_attended' => (int) $guests->whereNotNull('checked_in_at')->sum('pax'),
        ];

        return response()->json([
            'status' => 'success',
            'event' => [
                'id' => $event->id,
                'user_id' => $event->user_id,
                'title' => $event->title,
                'slug' => $event->slug,
                'package_code' => $event->package_code,
                'event_date' => $event->event_date,
                'location_name' => $event->location_name,
            ],
            'stats' => $stats,
            'guests' => $guests,
        ]);
    }
}
