@extends('layouts.app')

@section('title', 'Clubs & Gyms | Kun Khmer Management System')
@section('page_title', 'Affiliated Clubs & Gyms')

@section('content')
<div class="space-y-6">

    <div>
        <h2 class="text-sm text-slate-400">View affiliated boxing camps, head coaches, and athlete registrations.</h2>
    </div>

    <!-- Clubs Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($clubs as $club)
        <div class="glass-panel rounded-3xl overflow-hidden group hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <!-- Gym Photo -->
            <div class="h-44 relative bg-slate-900 overflow-hidden">
                <img src="{{ $club->image ?? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' }}" alt="{{ $club->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
                
                <!-- Status Tag -->
                <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-950/80 backdrop-blur-sm border border-slate-800 {{ $club->status == 'active' ? 'text-emerald-400' : 'text-slate-400' }}">
                    {{ $club->status }}
                </span>
            </div>

            <!-- Content -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                    <!-- Rating and Name -->
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-outfit font-bold text-lg text-white group-hover:text-primary transition-all">{{ $club->name }}</h3>
                        <div class="flex items-center gap-1 text-xs text-amber-500 font-bold">
                            <i class="fa-solid fa-star"></i>
                            <span>{{ $club->rating }}</span>
                        </div>
                    </div>
                    
                    <p class="text-xs text-slate-400 font-semibold font-outfit">{{ $club->name_khmer }}</p>

                    <!-- Location / Coach -->
                    <div class="mt-4 space-y-1.5 text-xs text-slate-400">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-location-dot text-slate-600 w-4"></i>
                            <span>{{ $club->location }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-user-tie text-slate-600 w-4"></i>
                            <span>Head Coach: <strong class="text-slate-300">{{ $club->head_coach }}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- Footer Roster count -->
                <div class="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <span class="text-xs text-slate-500">Roster Athletes: <strong class="text-white">{{ $club->fighters_count }}</strong></span>
                    <a href="{{ route('web.clubs.show', $club->id) }}" class="text-xs font-bold text-slate-300 hover:text-primary transition-all flex items-center gap-1">
                        View Gym
                        <i class="fa-solid fa-chevron-right text-[9px]"></i>
                    </a>
                </div>
            </div>
        </div>
        @empty
        <div class="col-span-full py-16 text-center">
            <i class="fa-solid fa-dumbbell text-4xl text-slate-600 mb-4 block"></i>
            <span class="text-sm font-semibold text-slate-400">No clubs registered yet.</span>
        </div>
        @endforelse
    </div>

</div>
@endsection
