@extends('layouts.app')

@section('title', $champion->title_name . ' - History | Kun Khmer Management System')
@section('page_title', 'Championship History')

@section('content')
<div class="space-y-8">

    <!-- Back Navigation -->
    <div>
        <a href="{{ route('web.champions.index') }}" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Champions
        </a>
    </div>

    <!-- Title Info header -->
    <div class="glass-panel rounded-3xl p-8 space-y-4">
        <span class="text-[10px] font-bold text-primary uppercase tracking-widest font-outfit">{{ $champion->champion_type }}</span>
        <h2 class="font-outfit font-extrabold text-2xl text-white tracking-tight">{{ $champion->title_name }}</h2>
        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/40 text-xs text-slate-400">
            <div>
                <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Current Champion</span>
                <span class="font-semibold text-white mt-1 block">{{ $champion->current_holder_name }}</span>
            </div>
            <div>
                <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Weight Class</span>
                <span class="font-semibold text-white mt-1 block font-outfit">{{ $champion->weight_class }} kg</span>
            </div>
            <div>
                <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Organization</span>
                <span class="font-semibold text-white mt-1 block">{{ $champion->organization }}</span>
            </div>
            <div>
                <span class="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Total Defenses</span>
                <span class="font-semibold text-white mt-1 block font-outfit">{{ $champion->defense_count }}</span>
            </div>
        </div>
    </div>

    <!-- Historical Title Defenses list -->
    <div class="glass-panel rounded-3xl p-6 lg:p-8 space-y-6">
        <h3 class="font-outfit font-bold text-lg text-white">Historical Title Defenses</h3>
        
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th class="pb-3">Challenger</th>
                        <th class="pb-3">Date</th>
                        <th class="pb-3">Result</th>
                        <th class="pb-3 text-right">Defense Notes</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/40">
                    @forelse($defenses as $def)
                    <tr class="group hover:bg-slate-900/20 transition-all">
                        <td class="py-4 font-semibold text-white">{{ $def->challenger_name }}</td>
                        <td class="py-4 text-slate-400 font-outfit">{{ \Carbon\Carbon::parse($def->date)->format('M d, Y') }}</td>
                        <td class="py-4">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider {{ $def->result == 'Winner' || $def->result == 'Won' || $def->result == 'Retained' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20' }}">
                                {{ $def->result }}
                            </span>
                        </td>
                        <td class="py-4 text-right text-xs text-slate-400 max-w-xs truncate">{{ $def->notes }}</td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="py-8 text-center text-xs text-slate-500">No title defense matches have been registered in the database for this championship.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection
