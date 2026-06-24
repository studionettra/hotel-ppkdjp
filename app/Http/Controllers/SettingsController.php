<?php

namespace App\Http\Controllers;

use App\Models\HotelSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            'settings' => HotelSetting::orderBy('group')->orderBy('id')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings'       => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'exists:hotel_settings,key'],
        ]);

        foreach ($request->input('settings') as $item) {
            HotelSetting::set($item['key'], $item['value'] ?? '');
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
