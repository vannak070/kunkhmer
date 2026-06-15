@extends('layouts.app')

@section('title', 'Fighters | Kun Khmer Management System')
@section('page_title', 'Fighters Roster')

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h2 class="text-sm text-slate-400">Manage all registered Kun Khmer athletes and verification states.</h2>
        </div>
        <a href="{{ route('web.fighters.create') }}" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
            <i class="fa-solid fa-user-plus"></i>
            Register Athlete
        </a>
    </div>

    <!-- Search & Filters -->
    <div class="glass-panel rounded-2xl p-4">
        <form action="{{ route('web.fighters.index') }}" method="GET" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <!-- Search -->
            <div class="md:col-span-2 relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <i class="fa-solid fa-magnifying-glass text-xs"></i>
                </span>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by name, khmer, alias..." 
                    class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all">
            </div>

            <!-- Nationality -->
            <div>
                <select name="nationality" class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                    <option value="">All Nationalities</option>
                    <option value="Cambodian" {{ request('nationality') == 'Cambodian' ? 'selected' : '' }}>Cambodian</option>
                    <option value="Thai" {{ request('nationality') == 'Thai' ? 'selected' : '' }}>Thai</option>
                    <option value="French" {{ request('nationality') == 'French' ? 'selected' : '' }}>French</option>
                </select>
            </div>

            <!-- Gender -->
            <div>
                <select name="gender" class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                    <option value="">All Genders</option>
                    <option value="Male" {{ request('gender') == 'Male' ? 'selected' : '' }}>Male</option>
                    <option value="Female" {{ request('gender') == 'Female' ? 'selected' : '' }}>Female</option>
                </select>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl py-2 transition-all">
                    Apply
                </button>
                @if(request()->anyFilled(['search', 'nationality', 'gender', 'club_id']))
                <a href="{{ route('web.fighters.index') }}" class="px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-xl transition-all">
                    <i class="fa-solid fa-rotate-left"></i>
                </a>
                @endif
            </div>
        </form>
    </div>

    <!-- Fighters Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        @forelse($fighters as $fighter)
        <div class="glass-panel rounded-2xl overflow-hidden group hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <!-- Photo/Banner -->
            <div class="h-48 relative overflow-hidden bg-slate-900">
                <img src="{{ $fighter->image ?? 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300' }}" alt="{{ $fighter->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
                
                <!-- Grade Tag -->
                <span class="absolute top-3 right-3 w-8 h-8 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-primary font-bold text-xs flex items-center justify-center shadow-lg">
                    {{ $fighter->grade }}
                </span>

                <!-- Status Badge -->
                <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 {{ $fighter->status == 'Active' ? 'text-emerald-400' : 'text-slate-400' }}">
                    {{ $fighter->status }}
                </span>
            </div>

            <!-- Details -->
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-1.5 mb-1">
                        <span class="text-[9px] font-bold text-primary uppercase tracking-widest">{{ $fighter->nationality }}</span>
                        <span class="text-[9px] text-slate-500">•</span>
                        <span class="text-[9px] text-slate-400 font-semibold">{{ $fighter->gender }}</span>
                    </div>
                    
                    <h3 class="font-outfit font-bold text-white group-hover:text-primary transition-all">{{ $fighter->name }}</h3>
                    <p class="text-xs text-slate-400 font-medium font-outfit">{{ $fighter->name_khmer }}</p>
                    
                    @if($fighter->alias)
                    <p class="text-xs text-amber-500 italic font-semibold mt-1">"{{ $fighter->alias }}"</p>
                    @endif

                    <!-- Club -->
                    <div class="mt-4 flex items-center gap-2 text-xs text-slate-400">
                        <i class="fa-solid fa-dumbbell text-slate-600 text-[10px]"></i>
                        <span class="truncate">{{ $fighter->club->name ?? 'Independent Fighter' }}</span>
                    </div>
                </div>

                <!-- Record Footbar -->
                <div class="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Record</span>
                        <span class="block font-bold text-white font-outfit text-sm">{{ $fighter->record ?? '0-0-0' }}</span>
                    </div>
                    <a href="{{ route('web.fighters.show', $fighter->id) }}" class="text-xs font-bold text-slate-300 hover:text-primary transition-all flex items-center gap-1">
                        Profile
                        <i class="fa-solid fa-chevron-right text-[9px]"></i>
                    </a>
                </div>
            </div>
        </div>
        @empty
        <div class="col-span-full py-16 text-center">
            <i class="fa-solid fa-user-slash text-4xl text-slate-600 mb-4 block"></i>
            <span class="text-sm font-semibold text-slate-400">No athletes matches your search filter.</span>
        </div>
        @endforelse
    </div>

    <!-- Pagination -->
    <div class="pt-6">
        {{ $fighters->links() }}
    </div>

</div>
@endsection
