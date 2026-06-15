<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class WebAuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('web.home');
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $username = $request->input('username');
        $password = $request->input('password');

        // Retrieve user
        $user = User::where('username', $username)
                    ->orWhere('email', $username)
                    ->first();

        if ($user) {
            // Check password: first check plain-text, then standard Laravel Hash check
            $passwordMatches = ($user->password_hash === $password) || Hash::check($password, $user->password_hash);

            if ($passwordMatches) {
                // Log the user in
                Auth::login($user, $request->has('remember'));

                // Update last login
                $user->update(['last_login' => now()]);

                return redirect()->intended(route('web.home'));
            }
        }

        return back()->withErrors([
            'username' => 'The provided credentials do not match our records.',
        ])->withInput($request->only('username'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}
