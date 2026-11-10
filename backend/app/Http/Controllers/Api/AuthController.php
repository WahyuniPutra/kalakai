<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartnerProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'account_type' => ['sometimes', 'in:user,partner'],
            'business_name' => ['required_if:account_type,partner', 'nullable', 'string', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'category' => ['required_if:account_type,partner', 'nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $isPartner = ($data['account_type'] ?? 'user') === 'partner';
        $user = DB::transaction(function () use ($data, $isPartner) {
            $user = User::create([
                'name' => $data['name'],
                'email' => mb_strtolower($data['email']),
                'password' => $data['password'],
                'role' => $isPartner ? 'partner' : 'user',
            ]);

            if ($isPartner) {
                PartnerProfile::create([
                    'user_id' => $user->id,
                    'business_name' => $data['business_name'],
                    'logo_url' => $data['logo_url'] ?? null,
                    'category' => $data['category'],
                    'city' => $data['city'] ?? null,
                    'description' => $data['description'] ?? null,
                    'catalog' => [],
                    'status' => 'pending',
                ]);
            }

            return $user;
        });

        if ($isPartner) {
            return response()->json([
                'pending_review' => true,
                'message' => 'Pendaftaran mitra berhasil dikirim. Akun dapat digunakan setelah disetujui Super Admin.',
            ], 202);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('kalakai-web', ['*'], now()->addDays(30))->plainTextToken,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', mb_strtolower($data['email']))->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau kata sandi tidak cocok.'],
            ]);
        }

        if ($user->role === 'partner' && $user->partnerProfile?->status !== 'active') {
            $message = $user->partnerProfile?->status === 'rejected'
                ? 'Pendaftaran mitra Anda belum disetujui. Silakan hubungi tim Kalakai.'
                : 'Akun mitra Anda sedang menunggu verifikasi Super Admin.';

            return response()->json(['message' => $message, 'pending_review' => true], 403);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('kalakai-web', ['*'], now()->addDays(30))->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Anda berhasil keluar.']);
    }
}
