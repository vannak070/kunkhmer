@extends('layouts.app')

@section('title', 'Dashboard | Kun Khmer Management System')
@section('page_title', 'Dashboard Overview')

@section('content')
<div class="space-y-8">

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Athletes -->
        <div class="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div class="flex items-center justify-between mb-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registered Athletes</span>
                <span class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <i class="fa-solid fa-user-ninja"></i>
                </span>
            </div>
            <div class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold tracking-tight font-outfit">{{ $totalFighters }}</span>
                <span class="text-xs font-semibold text-emerald-400">Total</span>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-800/40 flex justify-between text-xs text-slate-400">
                <span>Local: <strong class="text-white">{{ $localPercent }}%</strong></span>
                <span>Foreign: <strong class="text-white">{{ $foreignPercent }}%</strong></span>
            </div>
        </div>

        <!-- Matches -->
        <div class="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div class="flex items-center justify-between mb-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Scheduled Fights</span>
                <span class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <i class="fa-solid fa-trophy"></i>
                </span>
            </div>
            <div class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold tracking-tight font-outfit">{{ $upcomingMatches }}</span>
                <span class="text-xs font-semibold text-amber-500">Active</span>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-800/40 text-xs text-slate-400">
                <span>Pending matchups & live cards</span>
            </div>
        </div>

        <!-- Clubs -->
        <div class="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div class="flex items-center justify-between mb-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Affiliated Gyms</span>
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <i class="fa-solid fa-dumbbell"></i>
                </span>
            </div>
            <div class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold tracking-tight font-outfit">{{ $totalClubs }}</span>
                <span class="text-xs font-semibold text-emerald-400">{{ $activeClubs }} Active</span>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-800/40 text-xs text-slate-400">
                <span>Rosters & ratings synchronized</span>
            </div>
        </div>

        <!-- Win Rate -->
        <div class="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div class="flex items-center justify-between mb-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Roster Avg Win Rate</span>
                <span class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <i class="fa-solid fa-fire text-rose-500"></i>
                </span>
            </div>
            <div class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold tracking-tight font-outfit">{{ $avgWinRate }}%</span>
                <span class="text-xs font-semibold text-primary">High Tier</span>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-800/40 text-xs text-slate-400">
                <span>Calculated from active win/loss histories</span>
            </div>
        </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Top Performing Athletes -->
        <div class="glass-panel rounded-3xl p-6 lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between">
                <h3 class="font-outfit font-bold text-lg text-white">Top Performing Athletes</h3>
                <a href="{{ route('web.fighters.index') }}" class="text-xs font-bold text-primary hover:text-white transition-all">View Roster</a>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            <th class="pb-3">Athlete</th>
                            <th class="pb-3">Record (W-L-D)</th>
                            <th class="pb-3 text-right">Win Rate</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/40">
                        @foreach($topFighters as $fighter)
                        <tr class="group hover:bg-slate-900/30 transition-all">
                            <td class="py-3 flex items-center gap-3">
                                <img src="{{ $fighter->image ?? 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100' }}" alt="{{ $fighter->name }}" class="w-8 h-8 rounded-lg object-cover border border-slate-800">
                                <div>
                                    <span class="block font-semibold text-white group-hover:text-primary transition-all">{{ $fighter->name }}</span>
                                    <span class="block text-[10px] text-slate-400">{{ $fighter->nationality }}</span>
                                </div>
                            </td>
                            <td class="py-3 font-semibold font-outfit">{{ $fighter->record }}</td>
                            <td class="py-3 text-right font-extrabold text-emerald-400 font-outfit">{{ $fighter->win_rate }}%</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Division Leaders -->
        <div class="glass-panel rounded-3xl p-6 space-y-6">
            <h3 class="font-outfit font-bold text-lg text-white">Division Leaders</h3>
            
            <div class="space-y-4">
                @foreach($divisions as $div)
                <div class="glass-card rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{{ $div['weight'] }} Class</span>
                        <span class="font-bold text-white block mt-0.5">{{ $div['leader'] }}</span>
                        <span class="text-xs text-slate-400">Record: {{ $div['record'] }}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-bold text-primary block">Win Rate</span>
                        <span class="text-xl font-extrabold text-white font-outfit">{{ $div['win_rate'] }}</span>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </div>

</div>
@endsection
