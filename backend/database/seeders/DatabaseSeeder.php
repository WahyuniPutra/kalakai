<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\PartnerProfile;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        if (!app()->environment('local', 'testing')) {
            return;
        }

        User::updateOrCreate(['email' => 'admin@kalakai.test'], [
            'name' => 'Kalakai Super Admin',
            'password' => Hash::make('KalakaiAdmin!2026'),
            'role' => 'super_admin',
            'email_verified_at' => now(),
        ]);

        $partnerUser = User::updateOrCreate(['email' => 'mitra@kalakai.test'], [
            'name' => 'Mitra Percetakan Demo',
            'password' => Hash::make('MitraKalakai!2026'),
            'role' => 'partner',
            'email_verified_at' => now(),
        ]);

        $customer = User::updateOrCreate(['email' => 'user@kalakai.test'], [
            'name' => 'Pengguna Demo',
            'password' => Hash::make('UserKalakai!2026'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $profile = PartnerProfile::updateOrCreate(['user_id' => $partnerUser->id], [
            'business_name' => 'Cetak Rupa Palangka',
            'category' => 'Percetakan',
            'city' => 'Palangka Raya',
            'description' => 'Mitra percetakan lokal untuk contoh alur permintaan cetak Kalakai.',
            'catalog' => [
                ['name' => 'Undangan soft cover', 'price_from' => 2500, 'unit' => 'lembar'],
                ['name' => 'Undangan hard cover', 'price_from' => 8500, 'unit' => 'lembar'],
                ['name' => 'Amplop custom', 'price_from' => 1200, 'unit' => 'buah'],
            ],
            'status' => 'active',
        ]);

        $this->call(EventDemoSeeder::class);
        $event = Event::where('slug', 'romeo-juliet')->firstOrFail();
        $event->update(['user_id' => $customer->id]);

        ServiceRequest::firstOrCreate(
            [
                'user_id' => $customer->id,
                'partner_profile_id' => $profile->id,
                'title' => 'Cetak undangan Romeo & Juliet',
            ],
            [
                'event_id' => $event->id,
                'type' => 'printing',
                'description' => 'Permintaan contoh untuk melihat alur kerja cetak antara pengguna dan mitra.',
                'details' => [
                    'material' => 'Art carton 260 gsm',
                    'size' => '10 x 15 cm',
                    'finishing' => 'Laminasi doff',
                ],
                'quantity' => 100,
                'quoted_price' => 385000,
                'status' => 'submitted',
            ],
        );
    }
}
