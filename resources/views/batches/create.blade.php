@extends('layouts.app')

@section('title', 'Create Match Batch | Kun Khmer Management System')
@section('page_title', 'Create Match Batch')

@section('content')
<div class="space-y-8 max-w-4xl">

    <!-- Back Navigation -->
    <div>
        <a href="{{ route('web.matches.index') }}" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Batches
        </a>
    </div>

    <!-- Creation Form -->
    <div class="glass-panel rounded-3xl p-8">
        <h2 class="font-outfit font-bold text-lg text-white mb-6">Create New Fight Card Batch</h2>
        
        <form action="{{ route('web.matches.store') }}" method="POST" class="space-y-6">
            @csrf

            <!-- Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Select Event -->
                <div>
                    <label for="event_id" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parent Tournament Event</label>
                    <select name="event_id" id="event_id" required
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                        <option value="">Select Event...</option>
                        @foreach($events as $event)
                        <option value="{{ $event->id }}">{{ $event->name }}</option>
                        @endforeach
                    </select>
                </div>

                <!-- Batch Name -->
                <div>
                    <label for="name" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Batch/Fight Card Name</label>
                    <input type="text" name="name" id="name" required value="{{ old('name') }}" placeholder="e.g. Week 3 Fight Card"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Batch Number -->
                <div>
                    <label for="batch_number" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Batch Number</label>
                    <input type="text" name="batch_number" id="batch_number" required value="{{ old('batch_number') }}" placeholder="e.g. BATCH-003"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Week Number -->
                <div>
                    <label for="week_number" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Week Number</label>
                    <input type="number" name="week_number" id="week_number" required value="{{ old('week_number', '1') }}" min="1"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Date -->
                <div>
                    <label for="date" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Scheduled Date</label>
                    <input type="date" name="date" id="date" required value="{{ old('date') }}"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Phase -->
                <div>
                    <label for="phase" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tournament Phase</label>
                    <input type="text" name="phase" id="phase" required value="{{ old('phase', 'Qualifier') }}" placeholder="e.g. Quarter-Finals"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Status -->
                <div>
                    <label for="status" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Initial Status</label>
                    <select name="status" id="status" required
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                        <option value="Draft">Draft</option>
                        <option value="Weight-In">Weight-In</option>
                        <option value="Live">Ready & Live</option>
                    </select>
                </div>

                <!-- Location / Coordinate Picked -->
                <div>
                    <label for="location" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Event Venue / Location</label>
                    <input type="text" name="location" id="location" required value="{{ old('location') }}" placeholder="Select a venue below or click on the map" readonly
                        class="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:ring-0 cursor-not-allowed">
                </div>
            </div>

            <!-- Geographic Location Pinpoint selector -->
            <div class="pt-6 border-t border-slate-800/40">
                <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Geographic Location Pinpoint</span>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Map Pinpoint Area (2 cols) -->
                    <div class="md:col-span-2 bg-slate-950 rounded-2xl border border-slate-800/80 h-64 relative overflow-hidden flex items-center justify-center cursor-crosshair group" id="map-area">
                        <!-- Simulated Grid map overlay -->
                        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                        
                        <!-- Premium abstract styling representing Cambodia -->
                        <div class="w-80 h-44 rounded-full bg-primary/5 blur-3xl absolute pointer-events-none"></div>
                        
                        <!-- Map Label text -->
                        <span class="text-[10px] font-bold text-slate-700 uppercase tracking-widest absolute bottom-4">Interactive Pinpoint Selector (Click Map)</span>

                        <!-- Click Pin Indicator -->
                        <div class="absolute w-5 h-5 -mt-5 -ml-2.5 hidden text-primary select-none pointer-events-none transition-all duration-100 z-10" id="map-pin">
                            <i class="fa-solid fa-location-pin text-xl drop-shadow-[0_4px_8px_rgba(225,29,72,0.6)]"></i>
                        </div>
                    </div>

                    <!-- Venue Quick Select (1 col) -->
                    <div class="space-y-4">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Quick Venue Select</span>
                        <div class="space-y-2">
                            @php
                                $venues = [
                                    ['name' => 'Olympic Stadium Arena, Phnom Penh', 'x' => 120, 'y' => 150],
                                    ['name' => 'Morodok Techo National Stadium', 'x' => 140, 'y' => 130],
                                    ['name' => 'Siem Reap Boxing Stadium', 'x' => 80, 'y' => 60],
                                    ['name' => 'Kampot Boxing Stadium', 'x' => 90, 'y' => 210],
                                ];
                            @endphp

                            @foreach($venues as $v)
                            <button type="button" onclick="selectVenue('{{ $v['name'] }}', {{ $v['x'] }}, {{ $v['y'] }})" 
                                class="w-full text-left bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 hover:text-white transition-all flex items-start gap-2">
                                <i class="fa-solid fa-location-arrow text-[10px] text-primary mt-0.5"></i>
                                <span>{{ $v['name'] }}</span>
                            </button>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-6 border-t border-slate-800/40">
                <a href="{{ route('web.matches.index') }}" class="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-bold hover:bg-slate-900/40 transition-all">
                    Cancel
                </a>
                <button type="submit" class="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
                    Create Match Batch
                </button>
            </div>

        </form>
    </div>

</div>
@endsection

@section('scripts')
<script>
    // Map click pinpoint script
    const mapArea = document.getElementById('map-area');
    const mapPin = document.getElementById('map-pin');
    const locationInput = document.getElementById('location');

    mapArea.addEventListener('click', function(e) {
        const rect = mapArea.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        placePin(x, y);
        locationInput.value = `Arena Grid Coordinate: (${x}, ${y})`;
    });

    function placePin(x, y) {
        mapPin.style.left = `${x}px`;
        mapPin.style.top = `${y}px`;
        mapPin.classList.remove('hidden');
    }

    function selectVenue(name, x, y) {
        locationInput.value = name;
        placePin(x, y);
    }
</script>
@endsection
