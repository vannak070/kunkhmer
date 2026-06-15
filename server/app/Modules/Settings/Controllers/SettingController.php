<?php

namespace App\Modules\Settings\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use App\Models\BroadcastStation;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // --- SPONSORS ---
    public function indexSponsors()
    {
        $sponsors = Sponsor::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $sponsors
        ]);
    }

    public function storeSponsor(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $input = $request->all();
        $sponsor = Sponsor::create([
            'name' => $input['name'],
            'logo_url' => $input['logoUrl'] ?? null,
            'industry' => $input['industry'] ?? null,
            'tier' => $input['tier'] ?? 'Gold',
            'active' => isset($input['active']) ? (bool)$input['active'] : true,
            'contact_person' => $input['contactPerson'] ?? null,
            'contact_email' => $input['contactEmail'] ?? null,
            'contact_phone' => $input['contactPhone'] ?? null,
            'website_url' => $input['websiteUrl'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $sponsor
        ], 201);
    }

    public function updateSponsor(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $sponsor = Sponsor::find($id);
        if (!$sponsor) {
            return response()->json(['success' => false, 'error' => 'Sponsor not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['name'])) $updateData['name'] = $input['name'];
        if (isset($input['logoUrl'])) $updateData['logo_url'] = $input['logoUrl'];
        if (isset($input['industry'])) $updateData['industry'] = $input['industry'];
        if (isset($input['tier'])) $updateData['tier'] = $input['tier'];
        if (isset($input['active'])) $updateData['active'] = (bool)$input['active'];
        if (isset($input['contactPerson'])) $updateData['contact_person'] = $input['contactPerson'];
        if (isset($input['contactEmail'])) $updateData['contact_email'] = $input['contactEmail'];
        if (isset($input['contactPhone'])) $updateData['contact_phone'] = $input['contactPhone'];
        if (isset($input['websiteUrl'])) $updateData['website_url'] = $input['websiteUrl'];

        $sponsor->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $sponsor
        ]);
    }

    public function destroySponsor(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Super Admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $sponsor = Sponsor::find($id);
        if (!$sponsor) {
            return response()->json(['success' => false, 'error' => 'Sponsor not found'], 404);
        }
        $sponsor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sponsor deleted successfully',
            'data' => $sponsor
        ]);
    }

    // --- BROADCAST STATIONS ---
    public function indexBroadcastStations()
    {
        $stations = BroadcastStation::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $stations
        ]);
    }

    public function storeBroadcastStation(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $input = $request->all();
        $station = BroadcastStation::create([
            'name' => $input['name'],
            'stream_url' => $input['streamUrl'] ?? null,
            'type' => $input['type'] ?? 'Cable TV',
            'reach' => $input['reach'] ?? 'National',
            'active' => isset($input['active']) ? (bool)$input['active'] : true,
            'contact_person' => $input['contactPerson'] ?? null,
            'contact_email' => $input['contactEmail'] ?? null,
            'contact_phone' => $input['contactPhone'] ?? null,
            'website_url' => $input['websiteUrl'] ?? null,
            'logo_url' => $input['logoUrl'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $station
        ], 201);
    }

    public function updateBroadcastStation(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $station = BroadcastStation::find($id);
        if (!$station) {
            return response()->json(['success' => false, 'error' => 'Broadcast station not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['name'])) $updateData['name'] = $input['name'];
        if (isset($input['streamUrl'])) $updateData['stream_url'] = $input['streamUrl'];
        if (isset($input['type'])) $updateData['type'] = $input['type'];
        if (isset($input['reach'])) $updateData['reach'] = $input['reach'];
        if (isset($input['active'])) $updateData['active'] = (bool)$input['active'];
        if (isset($input['contactPerson'])) $updateData['contact_person'] = $input['contactPerson'];
        if (isset($input['contactEmail'])) $updateData['contact_email'] = $input['contactEmail'];
        if (isset($input['contactPhone'])) $updateData['contact_phone'] = $input['contactPhone'];
        if (isset($input['websiteUrl'])) $updateData['website_url'] = $input['websiteUrl'];
        if (isset($input['logoUrl'])) $updateData['logo_url'] = $input['logoUrl'];

        $station->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $station
        ]);
    }

    public function destroyBroadcastStation(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Super Admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $station = BroadcastStation::find($id);
        if (!$station) {
            return response()->json(['success' => false, 'error' => 'Broadcast station not found'], 404);
        }
        $station->delete();

        return response()->json([
            'success' => true,
            'message' => 'Broadcast station deleted successfully',
            'data' => $station
        ]);
    }
}
