<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Fighter;
use App\Models\Club;

class WebFighterController extends Controller
{
    public function index(Request $request)
    {
        $query = Fighter::with('club');

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_khmer', 'like', "%{$search}%")
                  ->orWhere('alias', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('gender')) {
            $query->where('gender', $request->input('gender'));
        }
        if ($request->filled('nationality')) {
            $query->where('nationality', $request->input('nationality'));
        }
        if ($request->filled('club_id')) {
            $query->where('club_id', $request->input('club_id'));
        }

        $fighters = $query->paginate(12)->withQueryString();
        $clubs = Club::all();

        return view('fighters.index', compact('fighters', 'clubs'));
    }

    public function show($id)
    {
        $fighter = Fighter::with('club')->findOrFail($id);
        return view('fighters.show', compact('fighter'));
    }

    public function create()
    {
        $clubs = Club::all();
        return view('fighters.create', compact('clubs'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'name_khmer' => 'required|string|max:255',
            'alias' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'nationality' => 'required|string|max:255',
            'province' => 'nullable|string|max:255',
            'gender' => 'required|string|in:Male,Female',
            'current_weight' => 'required|numeric|min:0',
            'height' => 'required|numeric|min:0',
            'club_id' => 'nullable|exists:clubs,id',
            'record' => 'nullable|string|max:50',
            'grade' => 'required|string|max:5',
            'status' => 'required|string|max:50',
            'professional_status' => 'required|string|max:50',
            'image' => 'nullable|url|max:1024',
        ]);

        $data = $request->all();
        $data['id'] = (string) Str::uuid();

        Fighter::create($data);

        return redirect()->route('web.fighters.index')->with('success', 'Athlete registered successfully!');
    }
}
