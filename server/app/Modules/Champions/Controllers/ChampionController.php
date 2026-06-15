<?php

namespace App\Modules\Champions\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Champion;
use Illuminate\Http\Request;

class ChampionController extends Controller
{
    public function index()
    {
        $champions = Champion::with(['currentHolder'])->orderBy('created_at', 'desc')->get();
        $data = $champions->map(function ($champion) {
            $arr = $champion->toArray();
            $arr['current_holder_name_db'] = $champion->currentHolder ? $champion->currentHolder->name : null;
            $arr['current_holder_photo_db'] = $champion->currentHolder ? $champion->currentHolder->image : null;
            $arr['current_holder_nationality_db'] = $champion->currentHolder ? $champion->currentHolder->nationality : null;
            return $arr;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $champion = Champion::with(['currentHolder', 'defenses'])->find($id);
        if (!$champion) {
            return response()->json(['success' => false, 'error' => 'Champion not found'], 404);
        }

        $arr = $champion->toArray();
        $arr['current_holder_name_db'] = $champion->currentHolder ? $champion->currentHolder->name : null;
        $arr['current_holder_photo_db'] = $champion->currentHolder ? $champion->currentHolder->image : null;
        $arr['current_holder_nationality_db'] = $champion->currentHolder ? $champion->currentHolder->nationality : null;
        $arr['defenses'] = $champion->defenses ? $champion->defenses->toArray() : [];

        return response()->json([
            'success' => true,
            'data' => $arr
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $input = $request->all();

        $champion = Champion::create([
            'title_name' => $input['titleName'],
            'champion_type' => $input['championType'],
            'weight_class' => $input['weightClass'],
            'organization' => $input['organization'] ?? 'KKF',
            'batch_id' => $input['batchId'] ?? null,
            'event_name' => $input['eventName'] ?? null,
            'current_holder_id' => $input['currentHolderId'] ?? null,
            'current_holder_name' => $input['currentHolderName'] ?? null,
            'nationality' => $input['nationality'] ?? null,
            'status' => $input['status'] ?? 'Vacant',
            'defense_count' => $input['defenseCount'] ?? 0,
            'last_defense_date' => $input['lastDefenseDate'] ?? null,
            'next_defense_deadline' => $input['nextDefenseDeadline'] ?? null,
            'belt_image_url' => $input['beltImageUrl'] ?? null,
            'trophy_image_url' => $input['trophyImageUrl'] ?? null,
            'certificate_url' => $input['certificateUrl'] ?? null,
            'notes' => $input['notes'] ?? null,
            'approval_status' => $input['approvalStatus'] ?? 'approved'
        ]);

        return $this->show($champion->id);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $champion = Champion::find($id);
        if (!$champion) {
            return response()->json(['success' => false, 'error' => 'Champion not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['titleName'])) $updateData['title_name'] = $input['titleName'];
        if (isset($input['championType'])) $updateData['champion_type'] = $input['championType'];
        if (isset($input['weightClass'])) $updateData['weight_class'] = $input['weightClass'];
        if (isset($input['organization'])) $updateData['organization'] = $input['organization'];
        if (isset($input['batchId'])) $updateData['batch_id'] = $input['batchId'];
        if (isset($input['eventName'])) $updateData['event_name'] = $input['eventName'];
        if (isset($input['currentHolderId'])) $updateData['current_holder_id'] = $input['currentHolderId'];
        if (isset($input['currentHolderName'])) $updateData['current_holder_name'] = $input['currentHolderName'];
        if (isset($input['nationality'])) $updateData['nationality'] = $input['nationality'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['defenseCount'])) $updateData['defense_count'] = $input['defenseCount'];
        if (isset($input['lastDefenseDate'])) $updateData['last_defense_date'] = $input['lastDefenseDate'];
        if (isset($input['nextDefenseDeadline'])) $updateData['next_defense_deadline'] = $input['nextDefenseDeadline'];
        if (isset($input['beltImageUrl'])) $updateData['belt_image_url'] = $input['beltImageUrl'];
        if (isset($input['trophyImageUrl'])) $updateData['trophy_image_url'] = $input['trophyImageUrl'];
        if (isset($input['certificateUrl'])) $updateData['certificate_url'] = $input['certificateUrl'];
        if (isset($input['notes'])) $updateData['notes'] = $input['notes'];
        if (isset($input['approvalStatus'])) $updateData['approval_status'] = $input['approvalStatus'];

        $champion->update($updateData);

        return $this->show($id);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Super Admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $champion = Champion::find($id);
        if (!$champion) {
            return response()->json(['success' => false, 'error' => 'Champion not found'], 404);
        }
        $champion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Champion deleted successfully',
            'data' => $champion
        ]);
    }
}
