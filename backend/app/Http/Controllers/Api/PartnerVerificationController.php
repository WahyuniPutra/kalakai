<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartnerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerVerificationController extends Controller
{
    public function update(Request $request, PartnerProfile $partnerProfile): JsonResponse
    {
        if ($request->user()?->role !== 'super_admin') {
            return response()->json(['message' => 'Akses hanya tersedia untuk Super Admin.'], 403);
        }

        $data = $request->validate([
            'status' => ['required', 'in:active,rejected'],
        ]);

        if ($partnerProfile->status !== 'pending') {
            return response()->json(['message' => 'Pendaftaran mitra ini sudah diproses.'], 409);
        }

        $partnerProfile->update(['status' => $data['status']]);

        return response()->json([
            'message' => $data['status'] === 'active'
                ? 'Mitra berhasil disetujui dan akun sudah aktif.'
                : 'Pendaftaran mitra ditolak.',
            'partner' => $partnerProfile->load('user:id,name,email'),
        ]);
    }
}
