<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\PartnerProfile;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role === 'super_admin') {
            return response()->json([
                'role' => $user->role,
                'user' => $user,
                'stats' => [
                    'users' => User::where('role', 'user')->count(),
                    'partners' => PartnerProfile::where('status', 'active')->count(),
                    'events' => Event::count(),
                    'requests' => ServiceRequest::count(),
                    'pending_partners' => PartnerProfile::where('status', 'pending')->count(),
                ],
                'recent_requests' => ServiceRequest::with(['user:id,name,email', 'partnerProfile:id,business_name', 'event:id,title'])
                    ->latest()->limit(6)->get(),
                'recent_users' => User::whereIn('role', ['user', 'partner'])
                    ->latest()->limit(6)->get(['id', 'name', 'email', 'role', 'created_at']),
                'pending_partner_profiles' => PartnerProfile::with('user:id,name,email')
                    ->where('status', 'pending')->oldest()->get(),
            ]);
        }

        if ($user->role === 'partner') {
            $profile = $user->partnerProfile()->with(['serviceRequests.user:id,name', 'serviceRequests.event:id,title'])
                ->first();

            return response()->json([
                'role' => $user->role,
                'user' => $user,
                'profile' => $profile,
                'stats' => [
                    'catalog_items' => count($profile?->catalog ?? []),
                    'new_requests' => $profile?->serviceRequests()->where('status', 'submitted')->count() ?? 0,
                    'in_progress' => $profile?->serviceRequests()->where('status', 'in_progress')->count() ?? 0,
                    'completed' => $profile?->serviceRequests()->where('status', 'completed')->count() ?? 0,
                ],
                'requests' => $profile?->serviceRequests()->with(['user:id,name', 'event:id,title'])->latest()->limit(10)->get() ?? [],
            ]);
        }

        $events = $user->events()->withCount('guests')->latest()->get();

        return response()->json([
            'role' => 'user',
            'user' => $user,
            'stats' => [
                'events' => $events->count(),
                'guests' => $events->sum('guests_count'),
                'published' => $events->where('is_published', true)->count(),
                'service_requests' => $user->serviceRequests()->count(),
            ],
            'events' => $events,
            'service_requests' => $user->serviceRequests()->with(['partnerProfile:id,business_name', 'event:id,title'])->latest()->limit(5)->get(),
        ]);
    }
}
