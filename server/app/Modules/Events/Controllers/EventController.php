<?php

namespace App\Modules\Events\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with(['organizer', 'broadcastStation', 'mainSponsor', 'sponsors'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $events->map(function ($event) {
            $arr = $event->toArray();
            $arr['organizer_name'] = $event->organizer ? $event->organizer->full_name : null;
            $arr['broadcast_station_name'] = $event->broadcastStation ? $event->broadcastStation->name : null;
            $arr['broadcast_station_logo_url'] = $event->broadcastStation ? $event->broadcastStation->logo_url : null;
            $arr['main_sponsor_name'] = $event->mainSponsor ? $event->mainSponsor->name : null;
            $arr['main_sponsor_logo_url'] = $event->mainSponsor ? $event->mainSponsor->logo_url : null;
            $arr['sponsorIds'] = $event->sponsors->pluck('id')->toArray();
            return $arr;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $event = Event::with(['organizer', 'broadcastStation', 'mainSponsor', 'sponsors'])->find($id);
        if (!$event) {
            return response()->json(['success' => false, 'error' => 'Event not found'], 404);
        }

        $data = $event->toArray();
        $data['organizer_name'] = $event->organizer ? $event->organizer->full_name : null;
        $data['broadcast_station_name'] = $event->broadcastStation ? $event->broadcastStation->name : null;
        $data['broadcast_station_logo_url'] = $event->broadcastStation ? $event->broadcastStation->logo_url : null;
        $data['main_sponsor_name'] = $event->mainSponsor ? $event->mainSponsor->name : null;
        $data['main_sponsor_logo_url'] = $event->mainSponsor ? $event->mainSponsor->logo_url : null;
        $data['sponsorIds'] = $event->sponsors->pluck('id')->toArray();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer', 'Organizer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $organizerId = $user->id;

        $event = Event::create([
            'name' => $request->input('name'),
            'date' => $request->input('date'),
            'end_date' => $request->input('endDate'),
            'location' => $request->input('location'),
            'status' => $request->input('status', 'Draft'),
            'organizer_id' => $organizerId,
            'broadcast_station_id' => $request->input('broadcastStationId'),
            'description' => $request->input('description'),
            'image' => $request->input('image'),
            'main_sponsor_id' => $request->input('mainSponsorId'),
        ]);

        if ($request->has('sponsorIds')) {
            $event->sponsors()->sync($request->input('sponsorIds'));
        }

        $event->load(['organizer', 'broadcastStation', 'mainSponsor', 'sponsors']);
        $data = $event->toArray();
        $data['organizer_name'] = $event->organizer ? $event->organizer->full_name : null;
        $data['broadcast_station_name'] = $event->broadcastStation ? $event->broadcastStation->name : null;
        $data['broadcast_station_logo_url'] = $event->broadcastStation ? $event->broadcastStation->logo_url : null;
        $data['main_sponsor_name'] = $event->mainSponsor ? $event->mainSponsor->name : null;
        $data['main_sponsor_logo_url'] = $event->mainSponsor ? $event->mainSponsor->logo_url : null;
        $data['sponsorIds'] = $event->sponsors->pluck('id')->toArray();

        return response()->json([
            'success' => true,
            'data' => $data
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer', 'Organizer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $event = Event::find($id);
        if (!$event) {
            return response()->json(['success' => false, 'error' => 'Event not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['name'])) $updateData['name'] = $input['name'];
        if (isset($input['date'])) $updateData['date'] = $input['date'];
        if (isset($input['endDate'])) $updateData['end_date'] = $input['endDate'];
        if (isset($input['location'])) $updateData['location'] = $input['location'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['organizerId'])) $updateData['organizer_id'] = $input['organizerId'];
        if (isset($input['broadcastStationId'])) $updateData['broadcast_station_id'] = $input['broadcastStationId'];
        if (isset($input['description'])) $updateData['description'] = $input['description'];
        if (isset($input['image'])) $updateData['image'] = $input['image'];
        if (isset($input['mainSponsorId'])) $updateData['main_sponsor_id'] = $input['mainSponsorId'];

        $event->update($updateData);

        if (isset($input['sponsorIds'])) {
            $event->sponsors()->sync($input['sponsorIds']);
        }

        $event->load(['organizer', 'broadcastStation', 'mainSponsor', 'sponsors']);
        $data = $event->toArray();
        $data['organizer_name'] = $event->organizer ? $event->organizer->full_name : null;
        $data['broadcast_station_name'] = $event->broadcastStation ? $event->broadcastStation->name : null;
        $data['broadcast_station_logo_url'] = $event->broadcastStation ? $event->broadcastStation->logo_url : null;
        $data['main_sponsor_name'] = $event->mainSponsor ? $event->mainSponsor->name : null;
        $data['main_sponsor_logo_url'] = $event->mainSponsor ? $event->mainSponsor->logo_url : null;
        $data['sponsorIds'] = $event->sponsors->pluck('id')->toArray();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'Super Admin') {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $event = Event::find($id);
        if (!$event) {
            return response()->json(['success' => false, 'error' => 'Event not found'], 404);
        }
        $event->delete();
        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully',
            'data' => $event
        ]);
    }
}
