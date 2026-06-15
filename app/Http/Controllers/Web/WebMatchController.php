<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\SubEvent;
use App\Models\Event;
use App\Models\SportMatch;
use App\Models\User;

class WebMatchController extends Controller
{
    public function index()
    {
        $batches = SubEvent::with('event', 'creator')->orderBy('date', 'desc')->get();
        return view('matches.index', compact('batches'));
    }

    public function create()
    {
        $events = Event::where('status', 'Published')->get();
        return view('batches.create', compact('events'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'name' => 'required|string|max:255',
            'week_number' => 'required|integer|min:1',
            'date' => 'required|date',
            'location' => 'required|string|max:255',
            'phase' => 'required|string|max:100',
            'status' => 'required|string|max:50',
            'batch_number' => 'required|string|max:50|unique:sub_events,batch_number',
        ]);

        $data = $request->all();
        $data['id'] = (string) Str::uuid();
        $data['created_by'] = auth()->id();

        SubEvent::create($data);

        return redirect()->route('web.matches.index')->with('success', 'Match Batch created successfully!');
    }

    public function showBatch($id)
    {
        $batch = SubEvent::with('event', 'creator')->findOrFail($id);

        // Fetch matches belonging to this batch
        $matches = SportMatch::with('fighterA', 'fighterB')
            ->where('sub_event_id', $id)
            ->get();

        return view('batches.show', compact('batch', 'matches'));
    }
}
