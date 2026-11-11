<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['user', 'partner'], true), 403);

        return response()->json($request->user()->load('partnerProfile'));
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->role, ['user', 'partner'], true), 403);
        $emailChanged = $request->input('email') !== $user->email;
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'current_password' => [Rule::requiredIf($emailChanged), 'nullable', 'current_password:sanctum'],
        ];

        if ($user->role === 'partner') {
            abort_unless($user->partnerProfile, 409, 'Profil mitra belum tersedia. Hubungi pengelola Kalakai.');
            $rules += [
                'business_name' => ['required', 'string', 'max:255'],
                'logo_url' => ['nullable', 'url:http,https', 'max:2048'],
                'category' => ['required', 'string', 'max:100'],
                'city' => ['nullable', 'string', 'max:100'],
                'description' => ['nullable', 'string', 'max:2000'],
            ];
        }
        $data = $request->validate($rules);

        DB::transaction(function () use ($user, $data, $emailChanged) {
            $user->fill(['name' => $data['name'], 'email' => $data['email']]);
            if ($emailChanged) {
                $user->email_verified_at = null;
            }
            $user->save();
            if ($user->role === 'partner') {
                $user->partnerProfile->update(collect($data)->only([
                    'business_name', 'logo_url', 'category', 'city', 'description',
                ])->all());
            }
        });

        return response()->json($user->fresh()->load('partnerProfile'));
    }
}
