<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Champion;
use App\Models\Fighter;

class WebChampionController extends Controller
{
    public function index()
    {
        $champions = Champion::with('currentHolder')->orderBy('weight_class', 'asc')->get();
        return view('champions.index', compact('champions'));
    }

    public function history($id)
    {
        $champion = Champion::with('currentHolder')->findOrFail($id);

        // Query defenses list from the database
        $defenses = DB::table('champion_defenses')
            ->where('champion_id', $id)
            ->orderBy('date', 'desc')
            ->get();

        return view('champions.history', compact('champion', 'defenses'));
    }
}
