@extends('layouts.app')

@section('title', $fighter->name . ' - Profile | Kun Khmer Management System')
@section('page_title', 'Athlete Profile')

@section('content')
<div class="space-y-8">

    <!-- Back Navigation -->
    <div>
        <a href="{{ route('web.fighters.index') }}" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Roster
        </a>
    </div>

    <!-- Main Profile Card -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Side: Photo & Stats Summary -->
        <div class="space-y-6">
            <div class="glass-panel rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                <!-- Profile Image -->
                <div class="w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary bg-slate-900 shadow-xl shadow-primary/10 mb-4">
                    <img src="{{ $fighter->image ?? 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300' }}" alt="{{ $fighter->name }}" class="w-full h-full object-cover">
                </div>

                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 {{ $fighter->status == 'Active' ? 'text-emerald-400' : 'text-slate-400' }} mb-2">
                    {{ $fighter->status }}
                </span>

                <h2 class="font-outfit font-extrabold text-2xl text-white tracking-tight">{{ $fighter->name }}</h2>
                <p class="text-sm text-slate-400 font-semibold font-outfit">{{ $fighter->name_khmer }}</p>
                
                @if($fighter->alias)
                <p class="text-sm text-amber-500 font-bold italic mt-2">"{{ $fighter->alias }}"</p>
                @endif

                <div class="w-full grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-800/40 text-left">
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nationality</span>
                        <span class="block text-sm font-semibold text-white font-outfit">{{ $fighter->nationality }}</span>
                    </div>
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Weight Class</span>
                        <span class="block text-sm font-semibold text-white font-outfit">{{ $fighter->current_weight }} kg</span>
                    </div>
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Height</span>
                        <span class="block text-sm font-semibold text-white font-outfit">{{ $fighter->height }} m</span>
                    </div>
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Grade</span>
                        <span class="block text-sm font-extrabold text-primary font-outfit">{{ $fighter->grade }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Side: Details & History -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Biography Card -->
            <div class="glass-panel rounded-3xl p-8 space-y-6">
                <h3 class="font-outfit font-bold text-lg text-white">Athlete Credentials</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Professional Status</span>
                        <span class="block text-sm font-semibold text-white mt-1">{{ $fighter->professional_status }}</span>
                    </div>
                    
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Born Province</span>
                        <span class="block text-sm font-semibold text-white mt-1">{{ $fighter->province ?? 'Unspecified' }}</span>
                    </div>
                    
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Affiliated Club</span>
                        <span class="block text-sm font-semibold text-white mt-1">
                            @if($fighter->club)
                                <a href="{{ route('web.clubs.show', $fighter->club->id) }}" class="text-primary hover:underline">{{ $fighter->club->name }}</a>
                            @else
                                Independent Fighter
                            @endif
                        </span>
                    </div>

                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fighter Record</span>
                        <span class="block text-sm font-bold text-emerald-400 mt-1 font-outfit">{{ $fighter->record ?? '0-0-0' }}</span>
                    </div>
                </div>
            </div>

            <!-- Validation Info -->
            <div class="glass-panel rounded-3xl p-8 border-l-4 border-l-emerald-500/80">
                <h3 class="font-outfit font-bold text-base text-white mb-2">KKF Federation Verification</h3>
                <p class="text-xs text-slate-400">This athlete registration has been officially verified by the Kun Khmer Federation (KKF). The records, weight statistics, and gym affiliations are fully synchronized with the state roster database.</p>
                <div class="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-400">
                    <i class="fa-solid fa-circle-check"></i>
                    Status: Fully Verified & Certified Roster Member
                </div>
            </div>
        </div>

    </div>

</div>
@endsection
