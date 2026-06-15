@extends('layouts.app')

@section('title', 'Matches & Batches | Kun Khmer Management System')
@section('page_title', 'Match Batches')

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h2 class="text-sm text-slate-400">Manage all tournament fight card batches, weight-ins, and match day schedules.</h2>
        </div>
        <a href="{{ route('web.matches.create') }}" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
            <i class="fa-solid fa-folder-plus"></i>
            Create Match Batch
        </a>
    </div>

    <!-- Batches List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($batches as $batch)
        <div class="glass-panel rounded-3xl p-6 hover:border-primary/25 transition-all flex flex-col justify-between">
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Batch {{ $batch->batch_number }}</span>
                    <span class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 text-amber-500 font-outfit">
                        {{ $batch->status }}
                    </span>
                </div>

                <div>
                    <h3 class="font-outfit font-bold text-lg text-white group-hover:text-primary transition-all">{{ $batch->name }}</h3>
                    <span class="text-[10px] font-bold text-primary uppercase tracking-wider block mt-1">{{ $batch->event->name ?? 'Standalone Batch' }}</span>
                </div>

                <div class="grid grid-cols-2 gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/20">
                    <div>
                        <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Date</span>
                        <span class="font-semibold text-white font-outfit">{{ \Carbon\Carbon::parse($batch->date)->format('M d, Y') }}</span>
                    </div>
                    <div>
                        <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Phase</span>
                        <span class="font-semibold text-white font-outfit">{{ $batch->phase }}</span>
                    </div>
                </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>By: <strong class="text-slate-300">{{ $batch->creator->full_name ?? 'KKF Staff' }}</strong></span>
                <a href="{{ route('web.matches.batch.show', $batch->id) }}" class="text-xs font-bold text-slate-300 hover:text-primary transition-all flex items-center gap-1">
                    Manage Card
                    <i class="fa-solid fa-chevron-right text-[9px]"></i>
                </a>
            </div>
        </div>
        @empty
        <div class="col-span-full py-16 text-center">
            <i class="fa-solid fa-folder-open text-4xl text-slate-600 mb-4 block"></i>
            <span class="text-sm font-semibold text-slate-400">No match batches registered.</span>
        </div>
        @endforelse
    </div>

</div>
@endsection
