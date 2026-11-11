<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceRequestController extends Controller
{
    private const TRANSITIONS = [
        'user' => [
            'submitted' => ['cancelled'],
            'quoted' => ['accepted', 'cancelled'],
        ],
        'partner' => [
            'submitted' => ['quoted', 'cancelled'],
            'accepted' => ['in_progress'],
            'in_progress' => ['completed'],
        ],
    ];

    private function ownedRequests(User $user): HasMany
    {
        if ($user->role === 'user') {
            return $user->serviceRequests();
        }
        abort_unless($user->role === 'partner' && $user->partnerProfile?->status === 'active', 403);

        return $user->partnerProfile->serviceRequests();
    }

    public function index(Request $request): JsonResponse
    {
        $query = $this->ownedRequests($request->user())->with(['user:id,name', 'event:id,title', 'partnerProfile:id,business_name']);
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['submitted', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'])],
            'q' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['q'])) {
            $query->whereLike('title', '%'.$filters['q'].'%');
        }

        return response()->json($query->latest('id')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'user', 403);
        $data = $request->validate([
            'request_key' => ['required', 'uuid'],
            'partner_profile_id' => ['required', 'integer', Rule::exists('partner_profiles', 'id')->where('status', 'active')],
            'event_id' => ['nullable', 'integer', Rule::exists('events', 'id')->where('user_id', $user->id)],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:2000'],
            'quantity' => ['nullable', 'integer', 'between:1,100000'],
        ]);
        $item = $user->serviceRequests()->firstOrCreate(
            ['request_key' => $data['request_key']],
            $data + ['type' => 'service', 'status' => 'submitted'],
        );

        return response()->json($item, $item->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, int $serviceRequest): JsonResponse
    {
        $user = $request->user();
        $item = $this->ownedRequests($user)->findOrFail($serviceRequest);
        $allowed = self::TRANSITIONS[$user->role][$item->status] ?? [];
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(['quoted', 'accepted', 'cancelled', 'in_progress', 'completed'])],
            'quoted_price' => ['required_if:status,quoted', 'nullable', 'integer', 'between:1,9999999999'],
            'quote_note' => ['nullable', 'string', 'max:1000'],
        ]);
        if (!in_array($data['status'], $allowed, true)) {
            return response()->json(['message' => 'Status permintaan sudah berubah. Muat ulang lalu coba lagi.'], 409);
        }
        $changes = ['status' => $data['status']];
        if ($data['status'] === 'quoted') {
            $details = is_array($item->details) ? $item->details : [];
            $details['quote_note'] = $data['quote_note'] ?? null;
            $changes['details'] = json_encode($details, JSON_THROW_ON_ERROR);
            $changes['quoted_price'] = $data['quoted_price'];
        }
        $updated = $this->ownedRequests($user)->whereKey($item->id)->where('status', $item->status)->update($changes);
        if (!$updated) {
            return response()->json(['message' => 'Status permintaan sudah berubah. Muat ulang lalu coba lagi.'], 409);
        }

        return response()->json($item->fresh());
    }
}
