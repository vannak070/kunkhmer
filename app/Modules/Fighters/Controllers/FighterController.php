<?php

/**
 * ============================================================
 *  FighterController — Fighter Management
 * ============================================================
 *  Endpoints:
 *    GET    /api/fighters                   → List fighters    [public]
 *    GET    /api/fighters/{id}              → Get fighter      [public]
 *    POST   /api/fighters                   → Create fighter   [auth]
 *    PUT    /api/fighters/{id}              → Update fighter   [auth]
 *    DELETE /api/fighters/{id}              → Delete fighter   [auth]
 *    POST   /api/fighters/{id}/verify       → Verify fighter   [auth]
 *
 *  Query params for GET /api/fighters:
 *    ?status=Active|Draft|Inactive|Suspended
 *    ?clubId={uuid}
 *
 *  Request body (camelCase) is mapped → DB columns (snake_case) internally.
 *  Response always camelCase for the React frontend.
 * ============================================================
 */

namespace App\Modules\Fighters\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Fighter;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class FighterController extends Controller
{
    // ─────────────────────────────────────────────────────────
    //  GET /api/fighters
    //  Public — list fighters; optional ?status= & ?clubId=
    // ─────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Fighter::with('club');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($clubId = $request->query('clubId')) {
            $query->where('club_id', $clubId);
        }

        $fighters = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => $fighters->map(fn($f) => $this->formatFighter($f)),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  GET /api/fighters/{id}
    //  Public — get a single fighter with club relation
    // ─────────────────────────────────────────────────────────
    public function show($id)
    {
        $fighter = Fighter::with('club')->find($id);

        if (!$fighter) {
            return response()->json([
                'success' => false,
                'error'   => 'Fighter not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatFighter($fighter),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  POST /api/fighters
    //  Protected — create a new fighter
    //  Club/Gym users can only create fighters for their club
    // ─────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $user  = $request->user();
        $input = $request->all();

        // Prevent club spoofing: Club/Gym role must use their own club_id
        $clubId = $input['clubId'] ?? null;
        if ($user && $user->role === 'Club/Gym' && $user->club_id) {
            $clubId = $user->club_id;
        }

        $fighter = Fighter::create([
            'name'            => $input['name'],
            'name_khmer'      => $input['nameKhmer'] ?? null,
            'alias'           => $input['alias'] ?? null,
            'date_of_birth'   => $input['dateOfBirth'] ?? null,
            'nationality'     => $input['nationality'] ?? 'Cambodian',
            'province'        => $input['province'] ?? null,
            'gender'          => $input['gender'] ?? 'Male',
            'current_weight'  => $input['currentWeight'] ?? null,
            'height'          => $input['height'] ?? null,
            'club_id'         => $clubId,
            'style'           => $input['style'] ?? null,
            'grade'           => $input['grade'] ?? 'D',
            'image'           => $input['image'] ?? null,
            'status'          => 'Draft',
        ]);

        $fighter->load('club');

        return response()->json([
            'success' => true,
            'data'    => $this->formatFighter($fighter),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────
    //  PUT /api/fighters/{id}
    //  Protected — update fighter fields
    //  Club/Gym users can only update their own club's fighters
    // ─────────────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $fighter = Fighter::find($id);

        if (!$fighter) {
            return response()->json([
                'success' => false,
                'error'   => 'Fighter not found',
            ], 404);
        }

        // Authorization: Club/Gym can only edit fighters they own
        $user = $request->user();
        if ($user && $user->role === 'Club/Gym' && $user->club_id) {
            if ($fighter->club_id !== $user->club_id) {
                return response()->json([
                    'success' => false,
                    'error'   => 'Forbidden: You do not own this fighter profile',
                ], 403);
            }
        }

        $input      = $request->all();
        $updateData = [];

        // camelCase → snake_case mapping
        if (isset($input['name']))             $updateData['name']              = $input['name'];
        if (isset($input['nameKhmer']))        $updateData['name_khmer']        = $input['nameKhmer'];
        if (isset($input['alias']))            $updateData['alias']             = $input['alias'];
        if (isset($input['dateOfBirth']))      $updateData['date_of_birth']     = $input['dateOfBirth'];
        if (isset($input['nationality']))      $updateData['nationality']        = $input['nationality'];
        if (isset($input['province']))         $updateData['province']          = $input['province'];
        if (isset($input['gender']))           $updateData['gender']            = $input['gender'];
        if (isset($input['currentWeight']))    $updateData['current_weight']    = $input['currentWeight'];
        if (isset($input['height']))           $updateData['height']            = $input['height'];
        if (isset($input['clubId']))           $updateData['club_id']           = $input['clubId'];
        if (isset($input['style']))            $updateData['style']             = $input['style'];
        if (isset($input['grade']))            $updateData['grade']             = $input['grade'];
        if (isset($input['image']))            $updateData['image']             = $input['image'];
        if (isset($input['status']))           $updateData['status']            = $input['status'];
        if (isset($input['professionalStatus'])) $updateData['professional_status'] = $input['professionalStatus'];

        $fighter->update($updateData);
        $fighter->load('club');

        return response()->json([
            'success' => true,
            'data'    => $this->formatFighter($fighter->fresh(['club'])),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  POST /api/fighters/{id}/verify
    //  Protected — approve/verify a fighter (KKF Officer only)
    // ─────────────────────────────────────────────────────────
    public function verify(Request $request, $id)
    {
        $fighter = Fighter::find($id);

        if (!$fighter) {
            return response()->json([
                'success' => false,
                'error'   => 'Fighter not found',
            ], 404);
        }

        $user = $request->user();

        $fighter->update([
            'status'        => 'Active',
            'verified_by'   => $user ? $user->id : null,
            'verified_date' => Carbon::now(),
        ]);

        $fighter->load('club');

        return response()->json([
            'success' => true,
            'data'    => $this->formatFighter($fighter->fresh(['club'])),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  DELETE /api/fighters/{id}
    //  Protected — delete a fighter
    // ─────────────────────────────────────────────────────────
    public function destroy($id)
    {
        $fighter = Fighter::find($id);

        if (!$fighter) {
            return response()->json([
                'success' => false,
                'error'   => 'Fighter not found',
            ], 404);
        }

        $fighter->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fighter deleted successfully',
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  Private helper — camelCase fighter shape for React
    // ─────────────────────────────────────────────────────────
    private function formatFighter(Fighter $fighter): array
    {
        return [
            'id'                => $fighter->id,
            'name'              => $fighter->name,
            'nameKhmer'         => $fighter->name_khmer,
            'alias'             => $fighter->alias,
            'dateOfBirth'       => $fighter->date_of_birth,
            'nationality'       => $fighter->nationality,
            'province'          => $fighter->province,
            'gender'            => $fighter->gender,
            'currentWeight'     => $fighter->current_weight,
            'height'            => $fighter->height,
            'clubId'            => $fighter->club_id,
            'clubName'          => $fighter->club ? $fighter->club->name : null,
            'style'             => $fighter->style,
            'grade'             => $fighter->grade,
            'image'             => $fighter->image,
            'status'            => $fighter->status,
            'professionalStatus'=> $fighter->professional_status,
            'verifiedBy'        => $fighter->verified_by,
            'verifiedDate'      => $fighter->verified_date,
            'createdAt'         => $fighter->created_at
                ? Carbon::parse($fighter->created_at)->toIso8601String()
                : null,
            'updatedAt'         => $fighter->updated_at
                ? Carbon::parse($fighter->updated_at)->toIso8601String()
                : null,
        ];
    }
}
