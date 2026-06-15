<?php

namespace App\Modules\Clubs\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Club;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    public function index()
    {
        $clubs = Club::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $clubs
        ]);
    }

    public function show($id)
    {
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['success' => false, 'error' => 'Club not found'], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $club
        ]);
    }

    public function store(Request $request)
    {
        $input = $request->all();

        $club = Club::create([
            'name' => $input['name'],
            'name_khmer' => $input['nameKhmer'] ?? null,
            'location' => $input['location'] ?? null,
            'head_coach' => $input['headCoach'] ?? null,
            'status' => $input['status'] ?? 'active',
            'rating' => $input['rating'] ?? 4.0,
            'image' => $input['image'] ?? null
        ]);

        return response()->json([
            'success' => true,
            'data' => $club
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['success' => false, 'error' => 'Club not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        // Map camelCase input keys to snake_case model fields
        if (isset($input['name'])) $updateData['name'] = $input['name'];
        if (isset($input['nameKhmer'])) $updateData['name_khmer'] = $input['nameKhmer'];
        if (isset($input['location'])) $updateData['location'] = $input['location'];
        if (isset($input['headCoach'])) $updateData['head_coach'] = $input['headCoach'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['rating'])) $updateData['rating'] = $input['rating'];
        if (isset($input['image'])) $updateData['image'] = $input['image'];

        $club->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $club
        ]);
    }

    public function destroy($id)
    {
        $club = Club::find($id);
        if (!$club) {
            return response()->json(['success' => false, 'error' => 'Club not found'], 404);
        }
        $club->delete();

        return response()->json([
            'success' => true,
            'message' => 'Club deleted successfully',
            'data' => $club
        ]);
    }
}
