<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Fighter;
use App\Models\Club;
use App\Models\SportMatch;

class WebHomeController extends Controller
{
    public function index()
    {
        // Total Fighters
        $totalFighters = Fighter::count();

        // Local vs Foreign
        $localFighters = Fighter::where('nationality', 'Cambodian')->count();
        $foreignFighters = $totalFighters - $localFighters;
        $localPercent = $totalFighters > 0 ? round(($localFighters / $totalFighters) * 100) : 0;
        $foreignPercent = $totalFighters > 0 ? round(($foreignFighters / $totalFighters) * 100) : 0;

        // Upcoming matches
        $upcomingMatches = SportMatch::whereNotIn('status', ['Completed', 'Complete'])->count();

        // Affiliated Clubs
        $totalClubs = Club::count();
        $activeClubs = Club::where('status', 'active')->count();

        // Query fighters and calculate wins from their record (e.g. "34-5-2" W-L-D)
        $fighters = Fighter::all();
        $fightersWithWins = $fighters->map(function ($fighter) {
            $parts = explode('-', $fighter->record);
            $wins = isset($parts[0]) ? (int)$parts[0] : 0;
            $losses = isset($parts[1]) ? (int)$parts[1] : 0;
            $draws = isset($parts[2]) ? (int)$parts[2] : 0;
            $fighter->wins = $wins;
            $fighter->losses = $losses;
            $fighter->draws = $draws;
            $totalMatches = $wins + $losses + $draws;
            $fighter->win_rate = $totalMatches > 0 ? round(($wins / $totalMatches) * 100) : 0;
            return $fighter;
        });

        // Top 5 fighters sorted by wins
        $topFighters = $fightersWithWins->sortByDesc('wins')->take(5);

        // Average Win rate across roster
        $totalWinRateSum = $fightersWithWins->sum('win_rate');
        $avgWinRate = $totalFighters > 0 ? round($totalWinRateSum / $totalFighters) : 0;

        // Division leaders
        $divisions = [
            ['weight' => '60kg', 'leader' => 'Chan Rothana', 'record' => '28-8-0', 'win_rate' => '78%'],
            ['weight' => '72kg', 'leader' => 'Thoeun Theara', 'record' => '72-5-3', 'win_rate' => '90%'],
            ['weight' => '70kg', 'leader' => 'Sorn Seavmey', 'record' => '34-5-2', 'win_rate' => '83%'],
        ];

        return view('dashboard', compact(
            'totalFighters',
            'localPercent',
            'foreignPercent',
            'upcomingMatches',
            'totalClubs',
            'activeClubs',
            'topFighters',
            'avgWinRate',
            'divisions'
        ));
    }
}
