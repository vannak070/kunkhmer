@extends('layouts.app')

@section('title', 'Champions | Kun Khmer Management System')
@section('page_title', 'KKF Championships & Belts')

@section('content')
<div class="space-y-6">

    <div>
        <h2 class="text-sm text-slate-400">View active title belts, tournament trophies, and official title defense counts.</h2>
    </div>

    <!-- Champions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($champions as $champ)
        <div class="glass-panel rounded-3xl p-6 hover:border-primary/25 transition-all flex flex-col justify-between space-y-6">
            
            <div class="space-y-4">
                <!-- Title Header -->
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-primary uppercase tracking-widest font-outfit">{{ $champ->champion_type }}</span>
                    <span class="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 {{ $champ->status == 'Active' ? 'text-emerald-400' : 'text-amber-500' }} font-outfit">
                        {{ $champ->status }}
                    </span>
                </div>

                <div>
                    <h3 class="font-outfit font-extrabold text-lg text-white tracking-tight">{{ $champ->title_name }}</h3>
                    <p class="text-xs text-slate-400 mt-1">Weight limit: <strong class="text-white">{{ $champ->weight_class }} kg</strong> | Org: {{ $champ->organization }}</p>
                </div>

                <!-- Holder profile summary -->
                @if($champ->currentHolder)
                <div class="bg-slate-950/45 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3">
                    <img src="{{ $champ->currentHolder->image ?? 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100' }}" alt="{{ $champ->current_holder_name }}" class="w-10 h-10 rounded-xl object-cover border border-slate-850">
                    <div>
                        <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Current Champion</span>
                        <a href="{{ route('web.fighters.show', $champ->currentHolder->id) }}" class="block font-bold text-white hover:text-primary transition-all text-sm">{{ $champ->current_holder_name }}</a>
                    </div>
                </div>
                @else
                <div class="bg-slate-950/45 border border-slate-800/60 rounded-2xl p-4 text-center">
                    <span class="text-xs text-slate-400 italic">Vacant Championship Title</span>
                </div>
                @endif

                <div class="text-xs text-slate-400 leading-relaxed pt-2">
                    <p>{{ $champ->notes }}</p>
                </div>
            </div>

            <!-- Card footer -->
            <div class="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Title Defenses: <strong class="text-white font-outfit">{{ $champ->defense_count }}</strong></span>
                <a href="{{ route('web.champions.history', $champ->id) }}" class="text-xs font-bold text-slate-300 hover:text-primary transition-all flex items-center gap-1">
                    Defense History
                    <i class="fa-solid fa-chevron-right text-[9px]"></i>
                </a>
            </div>

        </div>
        @empty
        <div class="col-span-full py-16 text-center">
            <i class="fa-solid fa-trophy text-4xl text-slate-600 mb-4 block"></i>
            <span class="text-sm font-semibold text-slate-400">No champions recorded.</span>
        </div>
        @endforelse
    </div>

</div>
@endsection
