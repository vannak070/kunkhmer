<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Kun Khmer Management System')</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Tailwind CSS Play CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        outfit: ['Outfit', 'sans-serif'],
                    },
                    colors: {
                        primary: {
                            DEFAULT: '#E11D48', // rose-600
                            hover: '#BE123C', // rose-700
                            light: '#FDA4AF', // rose-300
                            dark: '#881337', // rose-900
                        },
                        panel: {
                            DEFAULT: 'rgba(15, 23, 42, 0.65)', // slate-900 with transparency
                            border: 'rgba(255, 255, 255, 0.08)',
                        }
                    }
                }
            }
        }
    </script>
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-image: 
                radial-gradient(at 0% 0%, rgba(225, 29, 72, 0.05) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(30, 41, 59, 0.4) 0px, transparent 50%);
            background-attachment: fixed;
        }
        
        .font-outfit {
            font-family: 'Outfit', sans-serif;
        }

        .glass-panel {
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .glass-card {
            background: rgba(30, 41, 59, 0.35);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sidebar-link-active {
            background: linear-gradient(135deg, #E11D48 0%, #B91C1C 100%);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.5);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(225, 29, 72, 0.3);
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(225, 29, 72, 0.5);
        }
    </style>
    @yield('styles')
</head>
<body class="h-full overflow-hidden flex">

    <!-- Sidebar -->
    <aside class="w-64 h-full flex flex-col border-r border-slate-800/60 bg-slate-950/80 z-20 transition-all duration-300">
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 gap-3 border-b border-slate-800/40">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <i class="fa-solid fa-k text-white font-bold"></i>
            </div>
            <div>
                <span class="font-outfit font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight block">KUN KHMER</span>
                <span class="text-[9px] font-bold text-primary tracking-widest uppercase block -mt-1">Management System</span>
            </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <!-- Dashboard -->
            <a href="{{ route('web.home') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all {{ request()->routeIs('web.home') ? 'sidebar-link-active' : 'text-slate-400 hover:text-white hover:bg-slate-900/60' }}">
                <i class="fa-solid fa-chart-line w-5"></i>
                Dashboard
            </a>

            <!-- Fighters -->
            <a href="{{ route('web.fighters.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all {{ request()->routeIs('web.fighters.*') ? 'sidebar-link-active' : 'text-slate-400 hover:text-white hover:bg-slate-900/60' }}">
                <i class="fa-solid fa-user-ninja w-5"></i>
                Fighters
            </a>

            <!-- Clubs -->
            <a href="{{ route('web.clubs.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all {{ request()->routeIs('web.clubs.*') ? 'sidebar-link-active' : 'text-slate-400 hover:text-white hover:bg-slate-900/60' }}">
                <i class="fa-solid fa-dumbbell w-5"></i>
                Clubs & Gyms
            </a>

            <!-- Events -->
            <a href="{{ route('web.events.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all {{ request()->routeIs('web.events.*') ? 'sidebar-link-active' : 'text-slate-400 hover:text-white hover:bg-slate-900/60' }}">
                <i class="fa-solid fa-calendar-days w-5"></i>
                Events
            </a>

            <!-- Matches -->
            <a href="{{ route('web.matches.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all {{ request()->routeIs('web.matches.*') ? 'sidebar-link-active' : 'text-slate-400 hover:text-white hover:bg-slate-900/60' }}">
                <i class="fa-solid fa-trophy w-5"></i>
                Matches & Batches
            </a>

            <!-- Champions -->
            <a href="{{ route('web.champions.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all {{ request()->routeIs('web.champions.*') ? 'sidebar-link-active' : 'text-slate-400 hover:text-white hover:bg-slate-900/60' }}">
                <i class="fa-solid fa-award w-5"></i>
                Champions
            </a>

            <!-- Strategic Partners -->
            <a href="{{ route('web.partners.index') }}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all {{ request()->routeIs('web.partners.*') ? 'sidebar-link-active' : 'text-slate-400 hover:text-white hover:bg-slate-900/60' }}">
                <i class="fa-solid fa-handshake w-5"></i>
                Partners & Sponsors
            </a>
        </nav>

        <!-- User Profile Footbar -->
        <div class="p-4 border-t border-slate-800/40 bg-slate-950/40">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
                    {{ strtoupper(substr(Auth::user()->full_name, 0, 1)) }}
                </div>
                <div class="truncate">
                    <span class="block text-xs font-bold text-white truncate">{{ Auth::user()->full_name }}</span>
                    <span class="block text-[10px] font-medium text-primary uppercase tracking-wider">{{ Auth::user()->role }}</span>
                </div>
            </div>
            
            <form action="{{ route('logout') }}" method="POST">
                @csrf
                <button type="submit" class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 border border-rose-500/20 transition-all">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    Sign Out
                </button>
            </form>
        </div>
    </aside>

    <!-- Main Container -->
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/10">
        
        <!-- Header -->
        <header class="h-16 flex items-center justify-between px-8 border-b border-slate-800/40 bg-slate-950/40 z-10">
            <!-- Screen Title -->
            <h1 class="font-outfit font-bold text-lg text-white">@yield('page_title', 'Dashboard')</h1>
            
            <!-- Quick Info/Status -->
            <div class="flex items-center gap-6">
                <!-- Live Clock -->
                <div class="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/40">
                    <i class="fa-solid fa-clock text-primary"></i>
                    <span id="live-time">Loading...</span>
                </div>

                <!-- Notifications -->
                <div class="relative">
                    <button class="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800/60">
                        <i class="fa-solid fa-bell"></i>
                    </button>
                    <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                </div>
            </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-8 z-0">
            @yield('content')
        </main>
    </div>

    <!-- Scripts -->
    <script>
        // Live clock script
        function updateTime() {
            const timeEl = document.getElementById('live-time');
            if (timeEl) {
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        }
        setInterval(updateTime, 1000);
        updateTime();
    </script>
    @yield('scripts')
</body>
</html>
