<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Guest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserGuestController extends Controller
{
    /**
     * Get list of guests for an event
     */
    public function index(Request $request, int $eventId): JsonResponse
    {
        $event = $request->user()->events()->findOrFail($eventId);

        $guests = $event->guests()
            ->orderBy('name')
            ->get();

        $stats = [
            'total' => $guests->count(),
            'vip' => $guests->where('is_vip', true)->count(),
            'hadir_rsvp' => $guests->where('status', 'hadir')->count(),
            'tidak_hadir_rsvp' => $guests->where('status', 'tidak_hadir')->count(),
            'pending_rsvp' => $guests->where('status', 'pending')->count(),
            'checked_in' => $guests->whereNotNull('checked_in_at')->count(),
            'souvenir_claimed' => $guests->whereNotNull('souvenir_claimed_at')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
            ],
            'stats' => $stats,
            'guests' => $guests,
        ]);
    }

    /**
     * Create a single guest manually
     */
    public function store(Request $request, int $eventId): JsonResponse
    {
        $event = $request->user()->events()->findOrFail($eventId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'category' => 'nullable|string|max:50',
            'is_vip' => 'nullable|boolean',
            'table_number' => 'nullable|string|max:50',
            'pax' => 'nullable|integer|min:1|max:20',
            'souvenir_count' => 'nullable|integer|min:0|max:10',
        ]);

        $slug = $this->generateUniqueSlug($event->id, $validated['name']);
        $qrCode = $this->generateUniqueQrCode();

        $guest = $event->guests()->create([
            'name' => trim($validated['name']),
            'slug' => $slug,
            'phone' => $validated['phone'] ? trim($validated['phone']) : null,
            'category' => !empty($validated['category']) ? trim($validated['category']) : 'Reguler',
            'is_vip' => $validated['is_vip'] ?? false,
            'table_number' => $validated['table_number'] ? trim($validated['table_number']) : null,
            'pax' => $validated['pax'] ?? 2,
            'souvenir_count' => $validated['souvenir_count'] ?? 1,
            'qr_code' => $qrCode,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tamu undangan berhasil ditambahkan.',
            'data' => $guest,
        ], 201);
    }

    /**
     * Bulk import guests (JSON list)
     */
    public function import(Request $request, int $eventId): JsonResponse
    {
        $event = $request->user()->events()->findOrFail($eventId);

        $validated = $request->validate([
            'guests' => 'required|array|min:1',
            'guests.*.name' => 'required|string|max:255',
            'guests.*.phone' => 'nullable|string|max:30',
            'guests.*.category' => 'nullable|string|max:50',
            'guests.*.is_vip' => 'nullable|boolean',
            'guests.*.table_number' => 'nullable|string|max:50',
            'guests.*.pax' => 'nullable|integer|min:1|max:20',
            'guests.*.souvenir_count' => 'nullable|integer|min:0|max:10',
        ]);

        $insertedCount = 0;

        foreach ($validated['guests'] as $row) {
            $name = trim($row['name']);
            if (empty($name)) continue;

            $slug = $this->generateUniqueSlug($event->id, $name);
            $qrCode = $this->generateUniqueQrCode();

            $event->guests()->create([
                'name' => $name,
                'slug' => $slug,
                'phone' => !empty($row['phone']) ? trim($row['phone']) : null,
                'category' => !empty($row['category']) ? trim($row['category']) : 'Reguler',
                'is_vip' => !empty($row['is_vip']),
                'table_number' => !empty($row['table_number']) ? trim($row['table_number']) : null,
                'pax' => !empty($row['pax']) ? (int) $row['pax'] : 2,
                'souvenir_count' => isset($row['souvenir_count']) ? (int) $row['souvenir_count'] : 1,
                'qr_code' => $qrCode,
                'status' => 'pending',
            ]);

            $insertedCount++;
        }

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil mengimpor {$insertedCount} tamu undangan.",
            'inserted_count' => $insertedCount,
        ]);
    }

    /**
     * Update an existing guest
     */
    public function update(Request $request, int $eventId, int $guestId): JsonResponse
    {
        $event = $request->user()->events()->findOrFail($eventId);
        $guest = $event->guests()->findOrFail($guestId);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'category' => 'nullable|string|max:50',
            'is_vip' => 'nullable|boolean',
            'table_number' => 'nullable|string|max:50',
            'pax' => 'nullable|integer|min:1|max:20',
            'souvenir_count' => 'nullable|integer|min:0|max:10',
            'envelope_number' => 'nullable|string|max:50',
        ]);

        $updateData = [];

        if (isset($validated['name']) && $validated['name'] !== $guest->name) {
            $updateData['name'] = trim($validated['name']);
            $updateData['slug'] = $this->generateUniqueSlug($event->id, $validated['name'], $guest->id);
        }

        if (array_key_exists('phone', $validated)) {
            $updateData['phone'] = $validated['phone'] ? trim($validated['phone']) : null;
        }

        if (array_key_exists('category', $validated)) {
            $updateData['category'] = !empty($validated['category']) ? trim($validated['category']) : 'Reguler';
        }

        if (array_key_exists('is_vip', $validated)) {
            $updateData['is_vip'] = (bool) $validated['is_vip'];
        }

        if (array_key_exists('table_number', $validated)) {
            $updateData['table_number'] = $validated['table_number'] ? trim($validated['table_number']) : null;
        }

        if (array_key_exists('pax', $validated)) {
            $updateData['pax'] = (int) $validated['pax'];
        }

        if (array_key_exists('souvenir_count', $validated)) {
            $updateData['souvenir_count'] = (int) $validated['souvenir_count'];
        }

        if (array_key_exists('envelope_number', $validated)) {
            $updateData['envelope_number'] = $validated['envelope_number'] ? trim($validated['envelope_number']) : null;
        }

        $guest->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Data tamu berhasil diperbarui.',
            'data' => $guest,
        ]);
    }

    /**
     * Delete a single guest
     */
    public function destroy(Request $request, int $eventId, int $guestId): JsonResponse
    {
        $event = $request->user()->events()->findOrFail($eventId);
        $guest = $event->guests()->findOrFail($guestId);

        $guest->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Tamu undangan berhasil dihapus.',
        ]);
    }

    /**
     * Generate unique slug for guest in this event
     */
    private function generateUniqueSlug(int $eventId, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        if (empty($base)) {
            $base = 'tamu-' . Str::lower(Str::random(4));
        }

        $slug = $base;
        $counter = 1;

        while (Guest::where('event_id', $eventId)
            ->where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $counter++;
            $slug = "{$base}-{$counter}";
        }

        return $slug;
    }

    /**
     * Generate unique QR code
     */
    private function generateUniqueQrCode(): string
    {
        do {
            $code = 'KLK-' . strtoupper(Str::random(8));
        } while (Guest::where('qr_code', $code)->exists());

        return $code;
    }
}
