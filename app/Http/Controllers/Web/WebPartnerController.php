<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WebPartnerController extends Controller
{
    public function index()
    {
        $broadcasters = DB::table('broadcast_stations')->get();
        $sponsors = DB::table('sponsors')->get();

        return view('partners.index', compact('broadcasters', 'sponsors'));
    }
}
