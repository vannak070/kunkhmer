@extends('layouts.app')

@section('title', 'Strategic Partners | Kun Khmer Management System')
@section('page_title', 'Partners & Corporate Sponsors')

@section('content')
<div class="space-y-8">

    <div>
        <h2 class="text-sm text-slate-400">Manage broadcast stations, digital streaming links, and commercial brand sponsors.</h2>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Broadcasters / Stations -->
        <div class="glass-panel rounded-3xl p-6 lg:p-8 space-y-6">
            <div class="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <h3 class="font-outfit font-bold text-lg text-white flex items-center gap-2">
                    <i class="fa-solid fa-tv text-primary"></i>
                    Broadcast Partners
                </h3>
            </div>
            
            <div class="space-y-4">
                @forelse($broadcasters as $station)
                <div class="glass-card rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all">
                    <div>
                        <span class="text-[9px] font-bold text-primary uppercase tracking-widest font-outfit">{{ $station->type }} • {{ $station->reach }}</span>
                        <h4 class="font-bold text-white text-base mt-0.5">{{ $station->name }}</h4>
                        
                        @if($station->stream_url)
                        <a href="{{ $station->stream_url }}" target="_blank" class="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 mt-1 font-semibold">
                            <i class="fa-solid fa-play text-[10px]"></i>
                            Stream Link
                        </a>
                        @endif
                    </div>
                    <div>
                        <span class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 {{ $station->active ? 'text-emerald-400' : 'text-slate-400' }}">
                            {{ $station->active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>
                </div>
                @empty
                <div class="py-6 text-center">
                    <span class="text-xs text-slate-400 italic">No broadcast stations recorded.</span>
                </div>
                @endforelse
            </div>
        </div>

        <!-- Sponsors Tiers -->
        <div class="glass-panel rounded-3xl p-6 lg:p-8 space-y-6">
            <div class="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <h3 class="font-outfit font-bold text-lg text-white flex items-center gap-2">
                    <i class="fa-solid fa-handshake-angle text-primary"></i>
                    Sponsorship Portfolio
                </h3>
            </div>
            
            <div class="space-y-4">
                @forelse($sponsors as $sponsor)
                <div class="glass-card rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all">
                    <div class="flex items-center gap-3">
                        <span class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shadow-md">
                            {{ $sponsor->logo_url }}
                        </span>
                        <div>
                            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-outfit">{{ $sponsor->tier }} Sponsor</span>
                            <h4 class="font-bold text-white text-base mt-0.5">{{ $sponsor->name }}</h4>
                        </div>
                    </div>
                    <div>
                        <span class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 {{ $sponsor->active ? 'text-emerald-400' : 'text-slate-400' }}">
                            {{ $sponsor->active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>
                </div>
                @empty
                <div class="py-6 text-center">
                    <span class="text-xs text-slate-400 italic">No brand sponsors recorded.</span>
                </div>
                @endforelse
            </div>
        </div>

    </div>

</div>
@endsection
