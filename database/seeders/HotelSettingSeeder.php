<?php

namespace Database\Seeders;

use App\Models\HotelSetting;
use Illuminate\Database\Seeder;

class HotelSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'hotel_name',       'value' => 'Hotel PPKD Jakarta',   'group' => 'general', 'label' => 'Nama Hotel'],
            ['key' => 'hotel_address',    'value' => 'Jakarta, Indonesia',    'group' => 'general', 'label' => 'Alamat'],
            ['key' => 'hotel_phone',      'value' => '+62-21-0000000',        'group' => 'general', 'label' => 'Telepon'],
            ['key' => 'hotel_email',      'value' => 'info@hotelppkd.com',   'group' => 'general', 'label' => 'Email'],
            ['key' => 'hotel_website',    'value' => 'https://hotelppkd.com','group' => 'general', 'label' => 'Website'],
            ['key' => 'hotel_stars',      'value' => '3',                     'group' => 'general', 'label' => 'Bintang Hotel'],

            ['key' => 'checkin_time',     'value' => '14:00',                 'group' => 'policy',  'label' => 'Waktu Check-In'],
            ['key' => 'checkout_time',    'value' => '12:00',                 'group' => 'policy',  'label' => 'Waktu Check-Out'],
            ['key' => 'tax_rate',         'value' => '11',                    'group' => 'policy',  'label' => 'Tarif PPN (%)'],
            ['key' => 'currency',         'value' => 'IDR',                   'group' => 'policy',  'label' => 'Mata Uang'],
            ['key' => 'cancellation_days','value' => '3',                     'group' => 'policy',  'label' => 'Batas Pembatalan (hari)'],

            ['key' => 'smtp_host',        'value' => '',                      'group' => 'email',   'label' => 'SMTP Host'],
            ['key' => 'smtp_port',        'value' => '587',                   'group' => 'email',   'label' => 'SMTP Port'],
            ['key' => 'smtp_username',    'value' => '',                      'group' => 'email',   'label' => 'Username SMTP'],
            ['key' => 'email_from_name',  'value' => 'Hotel PPKD',           'group' => 'email',   'label' => 'Nama Pengirim'],
        ];

        foreach ($settings as $setting) {
            HotelSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
