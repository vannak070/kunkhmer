<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | Kun Khmer Management System</title>
    
    <!-- Google Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Tailwind CDN -->
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
                            DEFAULT: '#E11D48',
                            hover: '#BE123C',
                        }
                    }
                }
            }
        }
    </script>

    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: 
                radial-gradient(at 0% 0%, rgba(225, 29, 72, 0.08) 0px, transparent 40%),
                radial-gradient(at 100% 100%, rgba(30, 41, 59, 0.5) 0px, transparent 55%),
                #090d16;
        }
        .glass-panel {
            background: rgba(15, 23, 42, 0.55);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
    </style>
</head>
<body class="h-full flex items-center justify-center p-6">

    <div class="w-full max-w-md">
        <!-- Logo Header -->
        <div class="text-center mb-8">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center shadow-xl shadow-primary/20 mx-auto mb-4">
                <i class="fa-solid fa-k text-white text-xl font-bold"></i>
            </div>
            <h1 class="font-outfit font-extrabold text-2xl text-white tracking-tight">KUN KHMER</h1>
            <p class="text-xs font-bold text-primary tracking-widest uppercase mt-0.5">Management System</p>
        </div>

        <!-- Login Card -->
        <div class="glass-panel rounded-3xl p-8 shadow-2xl">
            <h2 class="font-outfit font-bold text-xl text-white mb-1">Welcome back</h2>
            <p class="text-xs text-slate-400 mb-6">Sign in to manage athletes, schedules, and events.</p>

            <form action="{{ route('login') }}" method="POST" class="space-y-4">
                @csrf

                <!-- Username/Email -->
                <div>
                    <label for="username" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username or Email</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                            <i class="fa-solid fa-user"></i>
                        </span>
                        <input type="text" name="username" id="username" value="{{ old('username') }}" placeholder="e.g. superadmin" required 
                            class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                    </div>
                    @error('username')
                        <span class="text-xs text-rose-500 mt-1 block"><i class="fa-solid fa-triangle-exclamation mr-1"></i>{{ $message }}</span>
                    @enderror
                </div>

                <!-- Password -->
                <div>
                    <label for="password" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                            <i class="fa-solid fa-lock"></i>
                        </span>
                        <input type="password" name="password" id="password" placeholder="••••••••" required 
                            class="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                    </div>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between text-xs pt-1">
                    <label class="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                        <input type="checkbox" name="remember" class="w-4 h-4 rounded border-slate-800 bg-slate-950 text-primary focus:ring-0">
                        Remember me
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl py-3 mt-4 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2">
                    Sign In
                    <i class="fa-solid fa-arrow-right-to-bracket"></i>
                </button>
            </form>
        </div>

        <!-- Seed Info Callout -->
        <div class="glass-panel rounded-2xl p-4 mt-6 border border-slate-800/60 bg-slate-950/20 text-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2"><i class="fa-solid fa-circle-info mr-1 text-primary"></i>Demo Account Credentials</span>
            <div class="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div class="bg-slate-900/40 p-2 rounded-lg border border-white/5">
                    <span class="text-[10px] font-semibold text-primary block uppercase">Super Admin</span>
                    username: <code class="text-white">superadmin</code><br>
                    password: <code class="text-white">admin123</code>
                </div>
                <div class="bg-slate-900/40 p-2 rounded-lg border border-white/5">
                    <span class="text-[10px] font-semibold text-primary block uppercase">KKF Officer</span>
                    username: <code class="text-white">officer1</code><br>
                    password: <code class="text-white">officer123</code>
                </div>
            </div>
        </div>
    </div>

</body>
</html>
