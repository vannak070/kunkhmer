@extends('layouts.app')

@section('title', $event->name . ' - Event | Kun Khmer Management System')
@section('page_title', 'Event Details')

@section('content')
<div class="space-y-8">

    <!-- Back Navigation -->
    <div>
        <a href="{{ route('web.events.index') }}" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Events
        </a>
    </div>

    <!-- Event details banner -->
    <div class="glass-panel rounded-3xl overflow-hidden relative">
        <div class="h-64 relative bg-slate-900">
            <img src="{{ $event->image ?? 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800' }}" alt="{{ $event->name }}" class="w-full h-full object-cover opacity-75">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
            
            <div class="absolute bottom-6 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-600/90 text-white shadow-lg border border-emerald-400/20">
                            {{ $event->status }}
                        </span>
                        <span class="text-xs text-slate-400 font-semibold font-outfit">{{ \Carbon\Carbon::parse($event->date)->format('M d, Y') }}</span>
                    </div>
                    <h2 class="font-outfit font-extrabold text-3xl text-white tracking-tight">{{ $event->name }}</h2>
                </div>
            </div>
        </div>

        <div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-800/40">
            <div class="space-y-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-outfit">Sponsors</span>
                <div class="flex flex-wrap gap-2 pt-1">
                    @forelse($event->sponsors as $sponsor)
                    <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-white flex items-center gap-1.5">
                        <span class="text-sm">{{ $sponsor->logo_url }}</span>
                        {{ $sponsor->name }}
                    </span>
                    @empty
                    <span class="text-xs text-slate-400 italic">No sponsors linked</span>
                    @endforelse
                </div>
            </div>
            
            <div class="space-y-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-outfit">Broadcaster</span>
                <p class="text-sm text-slate-300 flex items-center gap-2">
                    <i class="fa-solid fa-tv text-primary"></i>
                    {{ $event->broadcastStation->name ?? 'Unspecified' }}
                </p>
            </div>

            <div class="space-y-2">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-outfit">Stadium / Location</span>
                <p class="text-sm text-slate-300 flex items-center gap-2">
                    <i class="fa-solid fa-location-dot text-primary"></i>
                    {{ $event->location }}
                </p>
            </div>
        </div>
    </div>

    <!-- Batches (Sub Events) Grid -->
    <div class="space-y-6">
        <h3 class="font-outfit font-bold text-lg text-white">Event Fight Cards / Batches ({{ $batches->count() }})</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @forelse($batches as $batch)
            <div class="glass-panel rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Batch {{ $batch->batch_number }}</span>
                        <span class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 text-amber-400">
                            {{ $batch->status }}
                        </span>
                    </div>

                    <h4 class="font-outfit font-bold text-white text-lg">{{ $batch->name }}</h4>
                    
                    <div class="grid grid-cols-2 gap-4 text-xs text-slate-400 pt-2">
                        <div>
                            <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Date</span>
                            <span class="font-semibold text-white">{{ \Carbon\Carbon::parse($batch->date)->format('M d, Y') }}</span>
                        </div>
                        <div>
                            <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Phase</span>
                            <span class="font-semibold text-white">{{ $batch->phase }}</span>
                        </div>
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-end">
                    <a href="{{ route('web.matches.batch.show', $batch->id) }}" class="text-xs font-bold text-slate-300 hover:text-primary transition-all flex items-center gap-1">
                        View Match Cards
                        <i class="fa-solid fa-chevron-right text-[9px]"></i>
                    </a>
                </div>
            </div>
            @empty
            <div class="col-span-full py-8 text-center glass-panel rounded-2xl">
                <span class="text-xs text-slate-400">No fight cards/batches have been registered for this event yet.</span>
            </div>
            @endforelse
        </div>
    </div>

</div>
@endsection
