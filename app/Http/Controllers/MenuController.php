<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        return Inertia::render('Fnb/Menu/Index', [
            'categories' => MenuCategory::with('items')->orderBy('name')->get(),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        MenuCategory::create($request->only('name', 'description') + ['is_active' => true]);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function updateCategory(Request $request, MenuCategory $menuCategory)
    {
        $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['boolean'],
        ]);

        $menuCategory->update($request->only('name', 'description', 'is_active'));

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroyCategory(MenuCategory $menuCategory)
    {
        $menuCategory->delete();
        return back()->with('success', 'Kategori berhasil dihapus.');
    }

    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'category_id'  => ['required', 'exists:menu_categories,id'],
            'name'         => ['required', 'string', 'max:150'],
            'code'         => ['required', 'string', 'max:20', 'unique:menu_items,code'],
            'description'  => ['nullable', 'string'],
            'price'        => ['required', 'numeric', 'min:0'],
            'unit'         => ['required', 'string', 'max:30'],
            'is_available' => ['boolean'],
        ]);

        MenuItem::create($validated);

        return back()->with('success', 'Menu item berhasil ditambahkan.');
    }

    public function updateItem(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'category_id'  => ['required', 'exists:menu_categories,id'],
            'name'         => ['required', 'string', 'max:150'],
            'code'         => ['required', 'string', 'max:20', 'unique:menu_items,code,' . $menuItem->id],
            'description'  => ['nullable', 'string'],
            'price'        => ['required', 'numeric', 'min:0'],
            'unit'         => ['required', 'string', 'max:30'],
            'is_available' => ['boolean'],
        ]);

        $menuItem->update($validated);

        return back()->with('success', 'Menu item berhasil diperbarui.');
    }

    public function destroyItem(MenuItem $menuItem)
    {
        $menuItem->delete();
        return back()->with('success', 'Menu item berhasil dihapus.');
    }
}
