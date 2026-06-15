@extends('layouts.app')

@section('title', 'Register Athlete | Kun Khmer Management System')
@section('page_title', 'Register New Athlete')

@section('content')
<div class="space-y-8 max-w-4xl">

    <!-- Back Navigation -->
    <div>
        <a href="{{ route('web.fighters.index') }}" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Roster
        </a>
    </div>

    <!-- Registration Form -->
    <div class="glass-panel rounded-3xl p-8">
        <h2 class="font-outfit font-bold text-lg text-white mb-6">Athlete Profile Registration</h2>
        
        <form action="{{ route('web.fighters.store') }}" method="POST" class="space-y-6">
            @csrf

            <!-- Primary Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- English Name -->
                <div>
                    <label for="name" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name (English)</label>
                    <input type="text" name="name" id="name" required value="{{ old('name') }}" placeholder="e.g. Thoeun Theara"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Khmer Name -->
                <div>
                    <label for="name_khmer" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name (Khmer)</label>
                    <input type="text" name="name_khmer" id="name_khmer" required value="{{ old('name_khmer') }}" placeholder="e.g. ធឿន ធារ៉ា"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Alias -->
                <div>
                    <label for="alias" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fighter Alias / Moniker</label>
                    <input type="text" name="alias" id="alias" value="{{ old('alias') }}" placeholder="e.g. The King of Kun Khmer"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Date of Birth -->
                <div>
                    <label for="date_of_birth" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                    <input type="date" name="date_of_birth" id="date_of_birth" required value="{{ old('date_of_birth') }}"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Gender -->
                <div>
                    <label for="gender" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                    <select name="gender" id="gender" required
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                        <option value="Male" {{ old('gender') == 'Male' ? 'selected' : '' }}>Male</option>
                        <option value="Female" {{ old('gender') == 'Female' ? 'selected' : '' }}>Female</option>
                    </select>
                </div>

                <!-- Nationality -->
                <div>
                    <label for="nationality" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nationality</label>
                    <input type="text" name="nationality" id="nationality" required value="{{ old('nationality', 'Cambodian') }}"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Province -->
                <div>
                    <label for="province" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Birth Province</label>
                    <input type="text" name="province" id="province" value="{{ old('province') }}" placeholder="e.g. Battambang"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Club -->
                <div>
                    <label for="club_id" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Affiliated Gym/Club</label>
                    <select name="club_id" id="club_id"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                        <option value="">Independent Fighter</option>
                        @foreach($clubs as $club)
                        <option value="{{ $club->id }}" {{ old('club_id') == $club->id ? 'selected' : '' }}>{{ $club->name }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <!-- Stats/Record Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-800/40">
                <!-- Weight -->
                <div>
                    <label for="current_weight" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                    <input type="number" step="0.1" name="current_weight" id="current_weight" required value="{{ old('current_weight') }}" placeholder="63.5"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Height -->
                <div>
                    <label for="height" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Height (m)</label>
                    <input type="number" step="0.01" name="height" id="height" required value="{{ old('height') }}" placeholder="1.72"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Record -->
                <div>
                    <label for="record" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Record (W-L-D)</label>
                    <input type="text" name="record" id="record" value="{{ old('record') }}" placeholder="e.g. 15-3-0"
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>

                <!-- Grade -->
                <div>
                    <label for="grade" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Roster Grade</label>
                    <select name="grade" id="grade" required
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                        <option value="A" {{ old('grade') == 'A' ? 'selected' : '' }}>A</option>
                        <option value="B" {{ old('grade') == 'B' ? 'selected' : '' }}>B</option>
                        <option value="C" {{ old('grade') == 'C' ? 'selected' : '' }}>C</option>
                        <option value="D" {{ old('grade') == 'D' ? 'selected' : '' }}>D</option>
                    </select>
                </div>
            </div>

            <!-- Lifecycle/Status Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/40">
                <!-- Status -->
                <div>
                    <label for="status" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Status</label>
                    <select name="status" id="status" required
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                        <option value="Active" {{ old('status') == 'Active' ? 'selected' : '' }}>Active</option>
                        <option value="Suspended" {{ old('status') == 'Suspended' ? 'selected' : '' }}>Suspended</option>
                        <option value="Retired" {{ old('status') == 'Retired' ? 'selected' : '' }}>Retired</option>
                    </select>
                </div>

                <!-- Pro Status -->
                <div>
                    <label for="professional_status" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Professional Roster</label>
                    <select name="professional_status" id="professional_status" required
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none focus:border-primary transition-all">
                        <option value="Professional" {{ old('professional_status') == 'Professional' ? 'selected' : '' }}>Professional</option>
                        <option value="Amateur" {{ old('professional_status') == 'Amateur' ? 'selected' : '' }}>Amateur</option>
                    </select>
                </div>

                <!-- Photo URL -->
                <div>
                    <label for="image" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Profile Photo URL</label>
                    <input type="url" name="image" id="image" value="{{ old('image') }}" placeholder="https://images.unsplash.com/..."
                        class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all">
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-6 border-t border-slate-800/40">
                <a href="{{ route('web.fighters.index') }}" class="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-bold hover:bg-slate-900/40 transition-all">
                    Cancel
                </a>
                <button type="submit" class="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
                    Register Athlete
                </button>
            </div>

        </form>
    </div>

</div>
@endsection
