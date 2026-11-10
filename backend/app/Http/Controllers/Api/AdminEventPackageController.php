<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AdminEventPackageController extends Controller
{
    public function update(Request $request, int $eventId): JsonResponse
    {
        abort_unless($request->user()?->role === 'super_admin', 403, 'Hanya Super Admin yang dapat mengubah paket acara.');

        $validated = $request->validate([
            'package_code' => ['required', Rule::in(['free', 'bahagia', 'resepsi'])],
        ]);

        $event = Event::findOrFail($eventId);
        $previousPackage = $event->package_code;
        $event->update(['package_code' => $validated['package_code']]);

        Log::info('admin.event.package.updated', [
            'admin_id' => $request->user()->id,
            'event_id' => $event->id,
            'from' => $previousPackage,
            'to' => $event->package_code,
        ]);

        return response()->json([
            'event_id' => $event->id,
            'package_code' => $event->package_code,
            'message' => 'Paket acara berhasil diperbarui.',
        ]);
    }
}
