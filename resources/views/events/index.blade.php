@extends('layouts.app')

@section('title', 'Events | Kun Khmer Management System')
@section('page_title', 'Tournaments & Events')

@section('content')
<div class="space-y-6">

    <div>
        <h2 class="text-sm text-slate-400">Track and schedule Kun Khmer tournament events and federation schedules.</h2>
    </div>

    <!-- Events List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        @forelse($events as $event)
        <div class="glass-panel rounded-3xl overflow-hidden group hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <!-- Event Banner -->
            <div class="h-56 relative bg-slate-900 overflow-hidden">
                <img src="{{ $event->image ?? 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600' }}" alt="{{ $event->name }}" class="w-full h-full object-cover group-hover:scale-103 transition-all duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>
                
                <!-- Status Badge -->
                <span class="absolute top-4 right-4 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-950/80 backdrop-blur-sm border border-slate-800 {{ $event->status == 'Published' ? 'text-emerald-400' : 'text-slate-400' }}">
                    {{ $event->status }}
                </span>

                <!-- Event Name Overlaid -->
                <div class="absolute bottom-4 left-6 right-6">
                    <span class="text-[10px] font-bold text-primary uppercase tracking-widest font-outfit">{{ \Carbon\Carbon::parse($event->date)->format('M d, Y') }}</span>
                    <h3 class="font-outfit font-extrabold text-xl text-white tracking-tight mt-0.5">{{ $event->name }}</h3>
                </div>
            </div>

            <!-- Content Details -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p class="text-xs text-slate-400 leading-relaxed">{{ Str::limit($event->description, 140) }}</p>

                <div class="space-y-2 text-xs text-slate-400">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-location-dot text-slate-600 w-4"></i>
                        <span>{{ $event->location }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-tv text-slate-600 w-4"></i>
                        <span>Broadcaster: <strong class="text-white">{{ $event->broadcastStation->name ?? 'None' }}</strong></span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-user-tie text-slate-600 w-4"></i>
                        <span>Organizer: <strong class="text-white">{{ $event->organizer->full_name ?? 'None' }}</strong></span>
                    </div>
                </div>

                <!-- Footer Roster count -->
                <div class="pt-4 border-t border-slate-800/60 flex items-center justify-end">
                    <a href="{{ route('web.events.show', $event->id) }}" class="text-xs font-bold text-slate-300 hover:text-primary transition-all flex items-center gap-1">
                        View Schedule & Matches
                        <i class="fa-solid fa-chevron-right text-[9px]"></i>
                    </a>
                </div>
            </div>
        </div>
        @empty
        <div class="col-span-full py-16 text-center">
            <i class="fa-solid fa-calendar-xmark text-4xl text-slate-600 mb-4 block"></i>
            <span class="text-sm font-semibold text-slate-400">No events scheduled.</span>
        </div>
        @endforelse
    </div>

</div>
@endsection
