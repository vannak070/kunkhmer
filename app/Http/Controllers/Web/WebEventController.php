<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\SubEvent;

class WebEventController extends Controller
{
    public function index()
    {
        $events = Event::with('organizer', 'broadcastStation')->orderBy('date', 'desc')->get();
        return view('events.index', compact('events'));
    }

    public function show($id)
    {
        $event = Event::with('organizer', 'broadcastStation', 'sponsors')->findOrFail($id);
        
        // Fetch SubEvents (batches) for this event
        $batches = SubEvent::where('event_id', $id)->orderBy('date', 'asc')->get();

        return view('events.show', compact('event', 'batches'));
    }
}
