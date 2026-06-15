<?php

namespace App\Modules\Fighters\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Fighter;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class FighterController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');
        $clubId = $request->query('clubId');

        $query = Fighter::with('club');

        if ($status) {
            $query->where('status', $status);
        }

        if ($clubId) {
            $query->where('club_id', $clubId);
        }

        $fighters = $query->orderBy('created_at', 'desc')->get();

        // Convert key names in result to snake_case matches Node API rows
        $data = $fighters->map(function ($fighter) {
            $arr = $fighter->toArray();
            $arr['club_name'] = $fighter->club ? $fighter->club->name : null;
            return $arr;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $fighter = Fighter::with('club')->find($id);
        if (!$fighter) {
            return response()->json(['success' => false, 'error' => 'Fighter not found'], 404);
        }

        $data = $fighter->toArray();
        $data['club_name'] = $fighter->club ? $fighter->club->name : null;

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $input = $request->all();

        // Prevent gym spoofing
        $clubId = $input['clubId'] ?? null;
        if ($user && $user->role === 'Club/Gym' && $user->club_id) {
            $clubId = $user->club_id;
        }

        $fighter = Fighter::create([
            'name' => $input['name'],
            'name_khmer' => $input['nameKhmer'],
            'alias' => $input['alias'] ?? null,
            'date_of_birth' => $input['dateOfBirth'],
            'nationality' => $input['nationality'] ?? 'Cambodian',
            'province' => $input['province'] ?? null,
            'gender' => $input['gender'],
            'current_weight' => $input['currentWeight'],
            'height' => $input['height'],
            'club_id' => $clubId,
            'style' => $input['style'] ?? null,
            'grade' => $input['grade'] ?? 'D',
            'image' => $input['image'] ?? null,
            'status' => 'Draft'
        ]);

        return response()->json([
            'success' => true,
            'data' => $fighter
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $fighter = Fighter::find($id);
        if (!$fighter) {
            return response()->json(['success' => false, 'error' => 'Fighter not found'], 404);
        }

        $user = $request->user();
        // Authorization check
        if ($user && $user->role === 'Club/Gym' && $user->club_id) {
            if ($fighter->club_id !== $user->club_id) {
                return response()->json(['success' => false, 'error' => 'Forbidden: You do not own this fighter profile'], 403);
            }
        }

        $input = $request->all();
        $updateData = [];

        // Map camelCase input keys to snake_case model fields
        if (isset($input['name'])) $updateData['name'] = $input['name'];
        if (isset($input['nameKhmer'])) $updateData['name_khmer'] = $input['nameKhmer'];
        if (isset($input['alias'])) $updateData['alias'] = $input['alias'];
        if (isset($input['dateOfBirth'])) $updateData['date_of_birth'] = $input['dateOfBirth'];
        if (isset($input['nationality'])) $updateData['nationality'] = $input['nationality'];
        if (isset($input['province'])) $updateData['province'] = $input['province'];
        if (isset($input['gender'])) $updateData['gender'] = $input['gender'];
        if (isset($input['currentWeight'])) $updateData['current_weight'] = $input['currentWeight'];
        if (isset($input['height'])) $updateData['height'] = $input['height'];
        if (isset($input['clubId'])) $updateData['club_id'] = $input['clubId'];
        if (isset($input['style'])) $updateData['style'] = $input['style'];
        if (isset($input['grade'])) $updateData['grade'] = $input['grade'];
        if (isset($input['image'])) $updateData['image'] = $input['image'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['professionalStatus'])) $updateData['professional_status'] = $input['professionalStatus'];

        $fighter->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $fighter
        ]);
    }

    public function verify(Request $request, $id)
    {
        $fighter = Fighter::find($id);
        if (!$fighter) {
            return response()->json(['success' => false, 'error' => 'Fighter not found'], 404);
        }

        $user = $request->user();
        $officerId = $user ? $user->id : null;

        $fighter->update([
            'status' => 'Active',
            'verified_by' => $officerId,
            'verified_date' => Carbon::now()
        ]);

        return response()->json([
            'success' => true,
            'data' => $fighter
        ]);
    }

    public function destroy($id)
    {
        $fighter = Fighter::find($id);
        if (!$fighter) {
            return response()->json(['success' => false, 'error' => 'Fighter not found'], 404);
        }
        $fighter->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fighter successfully deleted',
            'data' => $fighter
        ]);
    }
}
