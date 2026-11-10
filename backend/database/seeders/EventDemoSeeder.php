<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Wish;
use App\Models\GiftAccount;

class EventDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $event = Event::updateOrCreate(
            ['slug' => 'romeo-juliet'],
            [
                'title' => 'The Wedding of Romeo & Juliet',
                'event_type' => 'wedding',
                'groom_name' => 'Romeo Montague',
                'bride_name' => 'Juliet Capulet',
                'event_date' => '2026-12-25 09:00:00',
                'location_name' => 'Grand Ballroom Hotel Aquarius, Palangka Raya',
                'location_address' => 'Jl. Imam Bonjol No. 5, Palangka Raya, Kalimantan Tengah',
                'map_url' => 'https://maps.google.com/?q=-2.215562,113.916944',
                'spotify_track_id' => '3n3Ppam7vgaVa1iaRUc9Lp', // Stephen Sanchez - Until I Found You
                'theme_config' => [
                    'primary_color' => '#e11d48',
                    'accent_color' => '#f43f5e',
                    'bg_gradient' => 'from-rose-950 via-slate-950 to-stone-950',
                    'quote' => 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
                    'quote_source' => 'QS. Ar-Rum: 21',
                    'audio_title' => 'Until I Found You - Stephen Sanchez',
                    'audio_preview_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // reliable demo audio fallback
                    'love_story' => [
                        [
                            'year' => '2021',
                            'title' => 'Pertemuan Pertama',
                            'desc' => 'Tatap mata pertama di tepi Sungai Kahayan, Palangka Raya, yang mengawali percakapan panjang tak terlupakan.',
                        ],
                        [
                            'year' => '2023',
                            'title' => 'Menjalin Komitmen',
                            'desc' => 'Memutuskan untuk saling menguatkan mimpi dan berjalan beriringan mengatasi segala tantangan bersama.',
                        ],
                        [
                            'year' => '2026',
                            'title' => 'Hari Bahagia',
                            'desc' => 'Dengan penuh rasa syukur, mengikat janji suci pernikahan di hadapan keluarga dan kerabat terkasih.',
                        ],
                    ],
                ],
                'is_published' => true,
            ]
        );

        $guests = [
            [
                'name' => 'Budi Santoso & Partner',
                'slug' => 'budi-santoso',
                'phone' => '081234567890',
                'category' => 'VIP',
                'pax' => 2,
                'qr_code' => 'KLK-ROMJUL-001',
                'status' => 'pending',
            ],
            [
                'name' => 'dr. Anita Wijaya, Sp.A',
                'slug' => 'dr-anita-wijaya',
                'phone' => '081987654321',
                'category' => 'Keluarga',
                'pax' => 2,
                'qr_code' => 'KLK-ROMJUL-002',
                'status' => 'hadir',
                'checked_in_at' => now()->subHours(2),
            ],
            [
                'name' => 'Kevin Sanjaya & Rekan',
                'slug' => 'kevin-sanjaya',
                'phone' => '085233445566',
                'category' => 'Teman Dekat',
                'pax' => 1,
                'qr_code' => 'KLK-ROMJUL-003',
                'status' => 'pending',
            ],
            [
                'name' => 'Kerabat Kalakai Community',
                'slug' => 'kerabat-kalakai',
                'phone' => '082151489900',
                'category' => 'VIP Tamu Kehormatan',
                'pax' => 3,
                'qr_code' => 'KLK-ROMJUL-004',
                'status' => 'pending',
            ],
        ];

        foreach ($guests as $guestData) {
            Guest::updateOrCreate(
                ['event_id' => $event->id, 'slug' => $guestData['slug']],
                $guestData
            );
        }

        $wishes = [
            [
                'guest_name' => 'dr. Anita Wijaya, Sp.A',
                'attendance' => 'hadir',
                'message' => 'Selamat menempuh hidup baru Romeo & Juliet! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Bahagia selalu sampai kakek nenek!',
            ],
            [
                'guest_name' => 'Ahmad Fauzi & Keluarga',
                'attendance' => 'hadir',
                'message' => 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fii khoir. Lancar acaranya di Palangka Raya!',
            ],
            [
                'guest_name' => 'Sarah Amalia',
                'attendance' => 'hadir',
                'message' => 'So happy for both of you! Cant wait to celebrate together!',
            ],
        ];

        foreach ($wishes as $wishData) {
            Wish::updateOrCreate(
                ['event_id' => $event->id, 'guest_name' => $wishData['guest_name']],
                $wishData
            );
        }

        $giftAccounts = [
            [
                'bank_name' => 'BCA',
                'account_number' => '8735019283',
                'account_holder' => 'Romeo Montague',
            ],
            [
                'bank_name' => 'Mandiri',
                'account_number' => '1370019283401',
                'account_holder' => 'Juliet Capulet',
            ],
            [
                'bank_name' => 'QRIS',
                'account_number' => 'NMID: ID102030405099',
                'account_holder' => 'Romeo & Juliet Wedding',
                'qris_image_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580016ID.CO.QRIS.WWW01189360099900000000015204581253033605802ID5914ROMEO_JULIET6013PALANGKARAYA61057311262070703A016304',
            ],
        ];

        foreach ($giftAccounts as $acc) {
            GiftAccount::updateOrCreate(
                ['event_id' => $event->id, 'bank_name' => $acc['bank_name']],
                $acc
            );
        }
    }
}
