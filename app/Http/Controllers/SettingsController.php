<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function index()
    {
        $logoPath = Storage::disk('public')->exists('logo.png') ? '/storage/logo.png' : null;
        
        return Inertia::render('Settings/Index', [
            'currentLogo' => $logoPath
        ]);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,gif,webp|max:2048'
        ]);

        // Delete old logo if it exists
        if (Storage::disk('public')->exists('logo.png')) {
            Storage::disk('public')->delete('logo.png');
        }

        // Store new logo
        $path = $request->file('logo')->storeAs('', 'logo.png', 'public');

        return response()->json([
            'message' => 'Logo uploaded successfully',
            'logoPath' => '/storage/logo.png'
        ]);
    }

    public function deleteLogo()
    {
        if (Storage::disk('public')->exists('logo.png')) {
            Storage::disk('public')->delete('logo.png');
        }

        return response()->json([
            'message' => 'Logo deleted successfully'
        ]);
    }
}
