<?php

namespace App\Modules\Matches\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SportMatch;
use App\Models\SubEvent;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    // --- SUB EVENTS / BATCHES ---
    public function indexSubEvents()
    {
        $subEvents = SubEvent::with(['event', 'createdBy'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $subEvents->map(function ($subEvent) {
            $arr = $subEvent->toArray();
            $arr['event_name'] = $subEvent->event ? $subEvent->event->name : null;
            $arr['creator_name'] = $subEvent->createdBy ? $subEvent->createdBy->full_name : null;
            return $arr;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function showSubEvent($id)
    {
        $subEvent = SubEvent::with(['event', 'createdBy'])->find($id);
        if (!$subEvent) {
            return response()->json(['success' => false, 'error' => 'Sub-event (batch) not found'], 404);
        }

        $data = $subEvent->toArray();
        $data['event_name'] = $subEvent->event ? $subEvent->event->name : null;
        $data['creator_name'] = $subEvent->createdBy ? $subEvent->createdBy->full_name : null;

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function storeSubEvent(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer', 'Organizer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $subEvent = SubEvent::create([
            'event_id' => $request->input('eventId'),
            'name' => $request->input('name'),
            'week_number' => $request->input('weekNumber'),
            'date' => $request->input('date'),
            'location' => $request->input('location'),
            'phase' => $request->input('phase', 'Qualifier'),
            'status' => $request->input('status', 'Draft'),
            'batch_number' => $request->input('batchNumber', 'BATCH-' . round(microtime(true) * 1000)),
            'created_by' => $user->id
        ]);

        $subEvent->load(['event', 'createdBy']);
        $data = $subEvent->toArray();
        $data['event_name'] = $subEvent->event ? $subEvent->event->name : null;
        $data['creator_name'] = $subEvent->createdBy ? $subEvent->createdBy->full_name : null;

        return response()->json([
            'success' => true,
            'data' => $data
        ], 201);
    }

    public function updateSubEvent(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer', 'Organizer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $subEvent = SubEvent::find($id);
        if (!$subEvent) {
            return response()->json(['success' => false, 'error' => 'Sub-event (batch) not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['eventId'])) $updateData['event_id'] = $input['eventId'];
        if (isset($input['name'])) $updateData['name'] = $input['name'];
        if (isset($input['weekNumber'])) $updateData['week_number'] = $input['weekNumber'];
        if (isset($input['date'])) $updateData['date'] = $input['date'];
        if (isset($input['location'])) $updateData['location'] = $input['location'];
        if (isset($input['phase'])) $updateData['phase'] = $input['phase'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['batchNumber'])) $updateData['batch_number'] = $input['batchNumber'];

        $subEvent->update($updateData);

        $subEvent->load(['event', 'createdBy']);
        $data = $subEvent->toArray();
        $data['event_name'] = $subEvent->event ? $subEvent->event->name : null;
        $data['creator_name'] = $subEvent->createdBy ? $subEvent->createdBy->full_name : null;

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function destroySubEvent(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Super Admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $subEvent = SubEvent::find($id);
        if (!$subEvent) {
            return response()->json(['success' => false, 'error' => 'Sub-event (batch) not found'], 404);
        }

        $subEvent->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sub-event deleted successfully',
            'data' => $subEvent
        ]);
    }

    // --- MATCHES ---
    public function index(Request $request)
    {
        $subEventId = $request->query('subEventId');
        $query = SportMatch::with(['subEvent', 'fighterA.club', 'fighterB.club', 'referee', 'result']);

        if ($subEventId) {
            $query->where('sub_event_id', $subEventId);
        }

        $matches = $query->orderBy('created_at', 'asc')->get();

        $data = $matches->map(function ($match) {
            $arr = $match->toArray();
            $arr['date'] = $match->subEvent ? $match->subEvent->date->toDateString() : null;
            $arr['sub_event_name'] = $match->subEvent ? $match->subEvent->name : null;

            $arr['fighter_a_name'] = $match->fighterA ? $match->fighterA->name : null;
            $arr['fighter_a_image'] = $match->fighterA ? $match->fighterA->image : null;
            $arr['fighter_a_record'] = $match->fighterA ? $match->fighterA->record : null;
            $arr['fighter_a_grade'] = $match->fighterA ? $match->fighterA->grade : null;

            $arr['fighter_b_name'] = $match->fighterB ? $match->fighterB->name : null;
            $arr['fighter_b_image'] = $match->fighterB ? $match->fighterB->image : null;
            $arr['fighter_b_record'] = $match->fighterB ? $match->fighterB->record : null;
            $arr['fighter_b_grade'] = $match->fighterB ? $match->fighterB->grade : null;

            $arr['club_a_name'] = ($match->fighterA && $match->fighterA->club) ? $match->fighterA->club->name : null;
            $arr['club_b_name'] = ($match->fighterB && $match->fighterB->club) ? $match->fighterB->club->name : null;

            $arr['referee_name'] = $match->referee ? $match->referee->full_name : null;

            $arr['winner_id'] = $match->result ? $match->result->winner_id : null;
            $arr['winner_method'] = $match->result ? $match->result->method : null;
            $arr['winner_round'] = $match->result ? $match->result->round : null;
            $arr['winner_duration'] = $match->result ? $match->result->duration : null;

            return $arr;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $match = SportMatch::with(['subEvent', 'fighterA.club', 'fighterB.club', 'referee', 'result'])->find($id);
        if (!$match) {
            return response()->json(['success' => false, 'error' => 'Match not found'], 404);
        }

        $arr = $match->toArray();
        $arr['date'] = $match->subEvent ? $match->subEvent->date->toDateString() : null;
        $arr['sub_event_name'] = $match->subEvent ? $match->subEvent->name : null;

        $arr['fighter_a_name'] = $match->fighterA ? $match->fighterA->name : null;
        $arr['fighter_a_image'] = $match->fighterA ? $match->fighterA->image : null;
        $arr['fighter_a_record'] = $match->fighterA ? $match->fighterA->record : null;
        $arr['fighter_a_grade'] = $match->fighterA ? $match->fighterA->grade : null;

        $arr['fighter_b_name'] = $match->fighterB ? $match->fighterB->name : null;
        $arr['fighter_b_image'] = $match->fighterB ? $match->fighterB->image : null;
        $arr['fighter_b_record'] = $match->fighterB ? $match->fighterB->record : null;
        $arr['fighter_b_grade'] = $match->fighterB ? $match->fighterB->grade : null;

        $arr['club_a_name'] = ($match->fighterA && $match->fighterA->club) ? $match->fighterA->club->name : null;
        $arr['club_b_name'] = ($match->fighterB && $match->fighterB->club) ? $match->fighterB->club->name : null;

        $arr['referee_name'] = $match->referee ? $match->referee->full_name : null;

        $arr['winner_id'] = $match->result ? $match->result->winner_id : null;
        $arr['winner_method'] = $match->result ? $match->result->method : null;
        $arr['winner_round'] = $match->result ? $match->result->round : null;
        $arr['winner_duration'] = $match->result ? $match->result->duration : null;

        return response()->json([
            'success' => true,
            'data' => $arr
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer', 'Organizer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $match = SportMatch::create([
            'event_id' => $request->input('eventId'),
            'sub_event_id' => $request->input('subEventId'),
            'fighter_a_id' => $request->input('fighterAId'),
            'fighter_b_id' => $request->input('fighterBId'),
            'rounds' => $request->input('rounds'),
            'round_time' => $request->input('roundTime'),
            'knockdown_limit' => $request->input('knockdownLimit'),
            'agreed_weight' => $request->input('agreedWeight'),
            'glove_size' => $request->input('gloveSize'),
            'glove_brand' => $request->input('gloveBrand'),
            'status' => $request->input('status', 'Draft'),
            'proposal_status' => $request->input('proposalStatus', 'draft'),
            'club_a_response' => $request->input('clubAResponse', 'pending'),
            'club_b_response' => $request->input('clubBResponse', 'pending'),
            'referee_id' => $request->input('refereeId'),
            'judge_ids' => $request->input('judgeIds', []),
        ]);

        return $this->show($match->id);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer', 'Organizer', 'Club/Gym'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $match = SportMatch::find($id);
        if (!$match) {
            return response()->json(['success' => false, 'error' => 'Match not found'], 404);
        }

        if ($user->role === 'Club/Gym') {
            $fighterA = $match->fighterA;
            $fighterB = $match->fighterB;
            $userClubId = $user->club_id;
            if ((!$fighterA || $fighterA->club_id !== $userClubId) && (!$fighterB || $fighterB->club_id !== $userClubId)) {
                return response()->json(['success' => false, 'error' => 'Forbidden: You do not represent either club in this match'], 403);
            }
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['eventId'])) $updateData['event_id'] = $input['eventId'];
        if (isset($input['subEventId'])) $updateData['sub_event_id'] = $input['subEventId'];
        if (isset($input['fighterAId'])) $updateData['fighter_a_id'] = $input['fighterAId'];
        if (isset($input['fighterBId'])) $updateData['fighter_b_id'] = $input['fighterBId'];
        if (isset($input['rounds'])) $updateData['rounds'] = $input['rounds'];
        if (isset($input['roundTime'])) $updateData['round_time'] = $input['roundTime'];
        if (isset($input['knockdownLimit'])) $updateData['knockdown_limit'] = $input['knockdownLimit'];
        if (isset($input['agreedWeight'])) $updateData['agreed_weight'] = $input['agreedWeight'];
        if (isset($input['gloveSize'])) $updateData['glove_size'] = $input['gloveSize'];
        if (isset($input['gloveBrand'])) $updateData['glove_brand'] = $input['gloveBrand'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['proposalStatus'])) $updateData['proposal_status'] = $input['proposalStatus'];
        if (isset($input['clubAResponse'])) $updateData['club_a_response'] = $input['clubAResponse'];
        if (isset($input['clubBResponse'])) $updateData['club_b_response'] = $input['clubBResponse'];
        if (isset($input['refereeId'])) $updateData['referee_id'] = $input['refereeId'];
        if (isset($input['judgeIds'])) $updateData['judge_ids'] = $input['judgeIds'];
        if (isset($input['winnerId'])) $updateData['winner_id'] = $input['winnerId'];
        if (isset($input['fighterAConfirmed'])) $updateData['fighter_a_confirmed'] = $input['fighterAConfirmed'];
        if (isset($input['fighterBConfirmed'])) $updateData['fighter_b_confirmed'] = $input['fighterBConfirmed'];
        if (isset($input['refereeConfirmed'])) $updateData['referee_confirmed'] = $input['refereeConfirmed'];
        if (isset($input['gloveConfirmedDate'])) $updateData['glove_confirmed_date'] = $input['gloveConfirmedDate'];

        $match->update($updateData);

        return $this->show($id);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Super Admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $match = SportMatch::find($id);
        if (!$match) {
            return response()->json(['success' => false, 'error' => 'Match not found'], 404);
        }

        $match->delete();

        return response()->json([
            'success' => true,
            'message' => 'Match deleted successfully',
            'data' => $match
        ]);
    }

    public function setMatchResult(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $match = SportMatch::find($id);
        if (!$match) {
            return response()->json(['success' => false, 'error' => 'Match not found'], 404);
        }

        $winnerId = $request->input('winnerId');
        $method = $request->input('method');
        $round = $request->input('round');
        $duration = $request->input('duration');

        \App\Models\BoutResult::updateOrCreate(
            ['match_id' => $id],
            [
                'winner_id' => $winnerId ?: null,
                'method' => $method,
                'round' => $round,
                'duration' => $duration ?: null,
                'recorded_at' => now()
            ]
        );

        $match->update([
            'status' => 'Completed',
            'winner_id' => $winnerId ?: null
        ]);

        $this->recalculateFighterRecord($match->fighter_a_id);
        $this->recalculateFighterRecord($match->fighter_b_id);

        return $this->show($id);
    }

    private function recalculateFighterRecord($fighterId)
    {
        if (!$fighterId) return;

        $matches = SportMatch::where(function ($q) use ($fighterId) {
            $q->where('fighter_a_id', $fighterId)
              ->orWhere('fighter_b_id', $fighterId);
        })
        ->where('status', 'Completed')
        ->get();

        $wins = 0;
        $losses = 0;
        $draws = 0;

        foreach ($matches as $m) {
            $result = $m->result;
            if ($result) {
                if ($result->winner_id === $fighterId) {
                    $wins++;
                } elseif ($result->winner_id === null) {
                    $draws++;
                } else {
                    $losses++;
                }
            }
        }

        $recordString = "{$wins}-{$losses}-{$draws}";
        \App\Models\Fighter::where('id', $fighterId)->update(['record' => $recordString]);
    }
}
