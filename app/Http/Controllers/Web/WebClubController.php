<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Club;
use App\Models\Fighter;

class WebClubController extends Controller
{
    public function index()
    {
        // Query all clubs and count their active roster athletes
        $clubs = Club::all()->map(function($club) {
            $club->fighters_count = Fighter::where('club_id', $club->id)->count();
            return $club;
        });

        return view('clubs.index', compact('clubs'));
    }

    public function show($id)
    {
        $club = Club::findOrFail($id);
        $fighters = Fighter::where('club_id', $club->id)->get();
        return view('clubs.show', compact('club', 'fighters'));
    }
}
