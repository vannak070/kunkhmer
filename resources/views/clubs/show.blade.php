@extends('layouts.app')

@section('title', $club->name . ' - Gym | Kun Khmer Management System')
@section('page_title', 'Gym Details')

@section('content')
<div class="space-y-8">

    <!-- Back Navigation -->
    <div>
        <a href="{{ route('web.clubs.index') }}" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Clubs
        </a>
    </div>

    <!-- Gym Details Header Panel -->
    <div class="glass-panel rounded-3xl overflow-hidden relative">
        <div class="h-64 relative bg-slate-900">
            <img src="{{ $club->image ?? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }}" alt="{{ $club->name }}" class="w-full h-full object-cover opacity-75">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
            
            <div class="absolute bottom-6 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-600/90 text-white shadow-lg border border-emerald-400/20">
                            {{ $club->status }}
                        </span>
                        <div class="flex items-center gap-1 text-xs text-amber-500 font-bold">
                            <i class="fa-solid fa-star"></i>
                            <span>{{ $club->rating }} Rating</span>
                        </div>
                    </div>
                    <h2 class="font-outfit font-extrabold text-3xl text-white tracking-tight">{{ $club->name }}</h2>
                    <p class="text-sm text-slate-300 font-semibold font-outfit mt-0.5">{{ $club->name_khmer }}</p>
                </div>
            </div>
        </div>

        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800/40">
            <div class="space-y-4">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Camp Location</span>
                <p class="text-sm text-slate-300 flex items-center gap-2">
                    <i class="fa-solid fa-location-dot text-primary"></i>
                    {{ $club->location }}
                </p>
            </div>
            <div class="space-y-4">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Management & Coaching</span>
                <p class="text-sm text-slate-300 flex items-center gap-2">
                    <i class="fa-solid fa-user-tie text-primary"></i>
                    Head Coach: <strong class="text-white">{{ $club->head_coach }}</strong>
                </p>
            </div>
        </div>
    </div>

    <!-- Gym Roster -->
    <div class="space-y-6">
        <h3 class="font-outfit font-bold text-lg text-white">Active Gym Roster ({{ $fighters->count() }})</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            @forelse($fighters as $fighter)
            <div class="glass-panel rounded-2xl overflow-hidden group hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                <div class="h-40 relative overflow-hidden bg-slate-900">
                    <img src="{{ $fighter->image ?? 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300' }}" alt="{{ $fighter->name }}" class="w-full h-full object-cover">
                    <span class="absolute top-2 right-2 w-6 h-6 rounded-md bg-slate-950/80 border border-slate-800 text-primary font-bold text-[10px] flex items-center justify-center">
                        {{ $fighter->grade }}
                    </span>
                </div>
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h4 class="font-bold text-white text-sm group-hover:text-primary transition-all truncate">{{ $fighter->name }}</h4>
                        <span class="text-[10px] text-slate-400 font-medium font-outfit">{{ $fighter->name_khmer }}</span>
                        
                        <div class="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                            <span class="font-outfit">Record: {{ $fighter->record }}</span>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-slate-800/60 text-right">
                        <a href="{{ route('web.fighters.show', $fighter->id) }}" class="text-[11px] font-bold text-slate-400 hover:text-white transition-all flex items-center justify-end gap-1">
                            Athlete Bio
                            <i class="fa-solid fa-chevron-right text-[8px]"></i>
                        </a>
                    </div>
                </div>
            </div>
            @empty
            <div class="col-span-full py-8 text-center glass-panel rounded-2xl">
                <span class="text-xs text-slate-400">No fighters are currently registered under this camp.</span>
            </div>
            @endforelse
        </div>
    </div>

</div>
@endsection
