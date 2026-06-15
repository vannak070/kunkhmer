<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');

        $user = User::where('username', $username)
            ->where('password_hash', $password)
            ->where('status', 'Active')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid username or password'
            ], 401);
        }

        // Update last login
        $user->update([
            'last_login' => Carbon::now()
        ]);

        // Generate Sanctum Token
        $token = $user->createToken('AuthToken')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'fullName' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'clubId' => $user->club_id,
                    'status' => $user->status,
                    'lastLogin' => $user->last_login ? $user->last_login->toIso8601String() : null
                ]
            ]
        ], 200);
    }

    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function store(Request $request)
    {
        $input = $request->all();
        
        $user = User::create([
            'username' => $input['username'],
            'full_name' => $input['fullName'],
            'email' => $input['email'],
            'password_hash' => $input['password'] ?? 'password123',
            'role' => $input['role'],
            'club_id' => $input['clubId'] ?? null,
            'status' => $input['status'] ?? 'Active'
        ]);

        return response()->json(['success' => true, 'data' => $user], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['username'])) $updateData['username'] = $input['username'];
        if (isset($input['fullName'])) $updateData['full_name'] = $input['fullName'];
        if (isset($input['email'])) $updateData['email'] = $input['email'];
        if (isset($input['role'])) $updateData['role'] = $input['role'];
        if (isset($input['clubId'])) $updateData['club_id'] = $input['clubId'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['password'])) $updateData['password_hash'] = $input['password'];

        $user->update($updateData);

        return response()->json(['success' => true, 'data' => $user]);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        }
        $user->delete();
        return response()->json(['success' => true, 'message' => 'User deleted successfully', 'data' => $user]);
    }
}
