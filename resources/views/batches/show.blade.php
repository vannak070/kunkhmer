@extends('layouts.app')

@section('title', $batch->name . ' - Detail | Kun Khmer Management System')
@section('page_title', 'Match Card Details')

@section('content')
<div class="space-y-8">

    <!-- Back Navigation -->
    <div>
        <a href="{{ route('web.matches.index') }}" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Batches
        </a>
    </div>

    <!-- Stepper & Details Header -->
    <div class="glass-panel rounded-3xl p-6 lg:p-8 space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Batch: {{ $batch->batch_number }}</span>
                <h2 class="font-outfit font-extrabold text-2xl text-white tracking-tight mt-0.5">{{ $batch->name }}</h2>
                <p class="text-xs text-slate-400 font-semibold font-outfit mt-1">{{ $batch->event->name ?? 'Standalone Card' }} | Location: {{ $batch->location }}</p>
            </div>
            <div>
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-amber-500">
                    {{ $batch->status }}
                </span>
            </div>
        </div>

        <!-- Stepper Lifecycle -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/40">
            @php
                $status = $batch->status;
                $steps = [
                    ['id' => 'Draft', 'label' => 'Drafting', 'icon' => 'fa-edit', 'desc' => 'Fight cards setup'],
                    ['id' => 'Weight-In', 'label' => 'Weight-In', 'icon' => 'fa-scale-balanced', 'desc' => 'Fighter weight check'],
                    ['id' => 'Live', 'label' => 'Ready & Live', 'icon' => 'fa-fire', 'desc' => 'Live fight night'],
                    ['id' => 'Completed', 'label' => 'Completed', 'icon' => 'fa-medal', 'desc' => 'Bout records updated']
                ];
                
                $activeIdx = 0;
                foreach($steps as $idx => $step) {
                    if ($status == $step['id'] || ($status == 'Complete' && $step['id'] == 'Completed') || ($status == 'Scheduled' && $step['id'] == 'Draft') || ($status == 'Ready' && $step['id'] == 'Weight-In')) {
                        $activeIdx = $idx;
                    }
                }
            @endphp

            @foreach($steps as $idx => $step)
                @php
                    $isCompleted = $idx < $activeIdx;
                    $isActive = $idx == $activeIdx;
                @endphp
                <div class="glass-card rounded-2xl p-4 border {{ $isActive ? 'border-primary/40 shadow-lg shadow-primary/5 bg-slate-900/40' : ($isCompleted ? 'border-emerald-500/25 bg-slate-900/10' : 'border-slate-800/40') }} flex gap-3">
                    <span class="w-10 h-10 rounded-xl flex items-center justify-center text-sm {{ $isActive ? 'bg-primary text-white shadow-lg' : ($isCompleted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-500') }}">
                        <i class="fa-solid {{ $step['icon'] }}"></i>
                    </span>
                    <div>
                        <span class="block text-xs font-bold {{ $isActive ? 'text-primary' : ($isCompleted ? 'text-emerald-400' : 'text-slate-500') }}">{{ $step['label'] }}</span>
                        <span class="block text-[9px] text-slate-500 font-semibold uppercase mt-0.5">{{ $step['desc'] }}</span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Matchups List -->
    <div class="glass-panel rounded-3xl p-6 lg:p-8 space-y-6">
        <h3 class="font-outfit font-bold text-lg text-white">Fight Matchups ({{ $matches->count() }})</h3>
        
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th class="pb-3">Matchup</th>
                        <th class="pb-3">Agreed Weight</th>
                        <th class="pb-3">Specs</th>
                        <th class="pb-3 text-right">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/40">
                    @forelse($matches as $match)
                    <tr class="group hover:bg-slate-900/20 transition-all">
                        <td class="py-4 flex items-center gap-6">
                            <!-- Fighter A -->
                            <div class="flex items-center gap-3 w-44">
                                <img src="{{ $match->fighterA->image ?? 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100' }}" alt="" class="w-8 h-8 rounded-lg object-cover border border-slate-800">
                                <div>
                                    <span class="block font-semibold text-white truncate">{{ $match->fighterA->name }}</span>
                                    <span class="block text-[9px] text-slate-500 uppercase tracking-widest font-outfit">{{ $match->fighterA->record }}</span>
                                </div>
                            </div>
                            
                            <!-- VS Badge -->
                            <span class="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg font-outfit">VS</span>

                            <!-- Fighter B -->
                            <div class="flex items-center gap-3 w-44">
                                <img src="{{ $match->fighterB->image ?? 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100' }}" alt="" class="w-8 h-8 rounded-lg object-cover border border-slate-800">
                                <div>
                                    <span class="block font-semibold text-white truncate">{{ $match->fighterB->name }}</span>
                                    <span class="block text-[9px] text-slate-500 uppercase tracking-widest font-outfit">{{ $match->fighterB->record }}</span>
                                </div>
                            </div>
                        </td>
                        
                        <td class="py-4 font-semibold font-outfit text-white">{{ $match->agreed_weight }} kg</td>
                        
                        <td class="py-4 text-slate-400 text-xs">
                            <span class="block">Glove size: <strong class="text-white">{{ $match->glove_size }}</strong></span>
                            <span class="block">Brand: {{ $match->glove_brand }}</span>
                        </td>
                        
                        <td class="py-4 text-right">
                            <span class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-950 border border-slate-800 text-rose-500">
                                {{ $match->status }}
                            </span>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="py-8 text-center text-xs text-slate-500">No matches scheduled in this batch yet.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection
