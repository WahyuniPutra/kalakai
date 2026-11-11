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
                'package_code' => 'resepsi',
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
                    'openpage_config' => [
                        'version' => '2.0.0',
                        'metadata' => [
                            'title' => 'The Wedding of Romeo & Juliet',
                            'description' => 'Undangan digital resmi dan tiket masuk resepsi Romeo & Juliet',
                            'ogImage' => 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
                        ],
                        'theme' => [
                            'preset' => 'rose-romance',
                            'primaryColor' => '#e11d48',
                            'accentColor' => '#f43f5e',
                            'bgColor' => '#09090b',
                            'cardBgColor' => '#18181b',
                            'textColor' => '#fafafa',
                            'textMutedColor' => '#a1a1aa',
                            'borderColor' => '#27272a',
                            'fontDisplay' => 'serif',
                            'fontBody' => 'sans',
                            'borderRadius' => '3xl',
                        ],
                        'audio' => [
                            'enabled' => true,
                            'title' => 'Until I Found You - Stephen Sanchez',
                            'audioUrl' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                            'spotifyId' => '3n3Ppam7vgaVa1iaRUc9Lp',
                        ],
                        'blocks' => [
                            [
                                'id' => 'block-hero',
                                'type' => 'hero',
                                'variant' => 'overlay',
                                'visible' => true,
                                'content' => [
                                    'eyebrow' => "WALIMATUL 'URSY & PERAYAAN CINTA",
                                    'title' => 'Romeo & Juliet',
                                    'subtitle' => 'Bersama melangkah menggapai ridho Illahi menuju mahligai rumah tangga yang sakinah, mawaddah, warahmah.',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
                                ],
                            ],
                            [
                                'id' => 'block-countdown',
                                'type' => 'countdown',
                                'variant' => 'cards',
                                'visible' => true,
                                'content' => [
                                    'targetDate' => '2026-12-25T09:00:00',
                                    'label' => 'Menghitung Hari Menuju Akad & Resepsi',
                                ],
                            ],
                            [
                                'id' => 'block-couple',
                                'type' => 'couple',
                                'variant' => 'split',
                                'visible' => true,
                                'content' => [
                                    'groomName' => 'Romeo Montague, S.T.',
                                    'groomBio' => 'Putra pertama dari Bpk. Montague & Ibu Montague',
                                    'groomPhoto' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
                                    'brideName' => 'Juliet Capulet, S.Farm.',
                                    'brideBio' => 'Putri bungsu dari Bpk. Capulet & Ibu Capulet',
                                    'bridePhoto' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
                                ],
                            ],
                            [
                                'id' => 'block-quote',
                                'type' => 'quote',
                                'variant' => 'centered',
                                'visible' => true,
                                'content' => [
                                    'quote' => 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
                                    'source' => 'QS. Ar-Rum: 21',
                                ],
                            ],
                            [
                                'id' => 'block-story',
                                'type' => 'story',
                                'variant' => 'timeline',
                                'visible' => true,
                                'content' => [
                                    'timeline' => [
                                        ['year' => '2021', 'title' => 'Pertemuan Pertama', 'desc' => 'Tatap mata pertama di tepi Sungai Kahayan, Palangka Raya, mengawali kisah manis.'],
                                        ['year' => '2023', 'title' => 'Komitmen Bersama', 'desc' => 'Memutuskan melangkah bersama dan saling menguatkan dalam cita-cita.'],
                                        ['year' => '2026', 'title' => 'Hari Bahagia', 'desc' => 'Menyatukan cinta suci di hadapan keluarga dan kerabat terkasih.'],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'block-schedule',
                                'type' => 'schedule',
                                'variant' => 'cards',
                                'visible' => true,
                                'content' => [
                                    'events' => [
                                        [
                                            'name' => 'Akad Nikah',
                                            'time' => '08:00 - 10:00 WIB',
                                            'date' => 'Jumat, 25 Desember 2026',
                                            'location' => 'Grand Ballroom Hotel Aquarius, Palangka Raya',
                                            'note' => 'Khusus keluarga besar dan kerabat inti',
                                        ],
                                        [
                                            'name' => 'Resepsi Pernikahan',
                                            'time' => '11:00 - 15:00 WIB',
                                            'date' => 'Jumat, 25 Desember 2026',
                                            'location' => 'Grand Ballroom Hotel Aquarius, Palangka Raya',
                                            'note' => 'Sesi ramah tamah dan jamuan makan siang',
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'block-ticket',
                                'type' => 'ticket',
                                'variant' => 'card',
                                'visible' => true,
                                'content' => [
                                    'title' => 'Tiket Masuk & QR Check-in',
                                    'description' => 'Tunjukkan QR code personal ini kepada penerima tamu di meja resepsionis untuk verifikasi cepat dan pengambilan souvenir.',
                                ],
                            ],
                            [
                                'id' => 'block-gifts',
                                'type' => 'gifts',
                                'variant' => 'cards',
                                'visible' => true,
                                'content' => [
                                    'accounts' => [
                                        [
                                            'bank' => 'BCA',
                                            'number' => '8210987654',
                                            'holder' => 'Romeo Montague',
                                        ],
                                        [
                                            'bank' => 'Bank Mandiri',
                                            'number' => '1370019283746',
                                            'holder' => 'Juliet Capulet',
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'block-guestbook',
                                'type' => 'guestbook',
                                'variant' => 'feed',
                                'visible' => true,
                                'content' => [
                                    'title' => 'Doa & Ucapan Hangat',
                                    'description' => 'Tinggalkan doa restu dan pesan bahagia Anda untuk kedua mempelai.',
                                ],
                            ],
                            [
                                'id' => 'block-footer',
                                'type' => 'footer',
                                'variant' => 'simple',
                                'visible' => true,
                                'content' => [
                                    'thankYouText' => 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
                                    'signature' => 'Kami yang berbahagia: Keluarga Besar Romeo & Juliet',
                                ],
                            ],
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
                'is_vip' => true,
                'table_number' => 'Meja VIP 01',
                'pax' => 2,
                'souvenir_count' => 1,
                'souvenir_claimed_at' => null,
                'envelope_number' => null,
                'qr_code' => 'KLK-ROMJUL-001',
                'status' => 'pending',
            ],
            [
                'name' => 'dr. Anita Wijaya, Sp.A',
                'slug' => 'dr-anita-wijaya',
                'phone' => '081987654321',
                'category' => 'Keluarga',
                'is_vip' => false,
                'table_number' => 'Meja Keluarga A',
                'pax' => 2,
                'souvenir_count' => 1,
                'souvenir_claimed_at' => now()->subHours(2),
                'envelope_number' => 'ENV-014',
                'qr_code' => 'KLK-ROMJUL-002',
                'status' => 'hadir',
                'checked_in_at' => now()->subHours(2),
            ],
            [
                'name' => 'Kevin Sanjaya & Rekan',
                'slug' => 'kevin-sanjaya',
                'phone' => '085233445566',
                'category' => 'Teman Dekat',
                'is_vip' => false,
                'table_number' => 'Meja 08',
                'pax' => 1,
                'souvenir_count' => 1,
                'souvenir_claimed_at' => null,
                'envelope_number' => null,
                'qr_code' => 'KLK-ROMJUL-003',
                'status' => 'pending',
            ],
            [
                'name' => 'Kerabat Kalakai Community',
                'slug' => 'kerabat-kalakai',
                'phone' => '082151489900',
                'category' => 'VIP Tamu Kehormatan',
                'is_vip' => true,
                'table_number' => 'Meja VVIP Utama',
                'pax' => 3,
                'souvenir_count' => 2,
                'souvenir_claimed_at' => null,
                'envelope_number' => null,
                'qr_code' => 'KLK-ROMJUL-004',
                'status' => 'pending',
            ],
            [
                'name' => 'Hendra Setiawan & Istri',
                'slug' => 'hendra-setiawan',
                'phone' => '081377889900',
                'category' => 'Kolega',
                'is_vip' => false,
                'table_number' => 'Meja 12',
                'pax' => 2,
                'souvenir_count' => 1,
                'souvenir_claimed_at' => null,
                'envelope_number' => null,
                'qr_code' => 'KLK-ROMJUL-005',
                'status' => 'pending',
            ],
            [
                'name' => 'Siti Nurhaliza & Partner',
                'slug' => 'siti-nurhaliza',
                'phone' => '081266554433',
                'category' => 'Teman Kampus',
                'is_vip' => false,
                'table_number' => 'Meja 09',
                'pax' => 2,
                'souvenir_count' => 1,
                'souvenir_claimed_at' => null,
                'envelope_number' => null,
                'qr_code' => 'KLK-ROMJUL-006',
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
