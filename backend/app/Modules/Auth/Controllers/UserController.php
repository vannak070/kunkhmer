<?php

/**
 * ============================================================
 *  UserController — Auth / User Management
 * ============================================================
 *  Endpoints:
 *    POST  /api/users/login          → Authenticate, return Sanctum token
 *    POST  /api/users/logout         → Revoke current token     [auth]
 *    GET   /api/users/me             → Current user profile     [auth]
 *    GET   /api/users                → List all users           [auth]
 *    POST  /api/users                → Create user              [auth]
 *    GET   /api/users/{id}           → Get user by ID           [auth]
 *    PUT   /api/users/{id}           → Update user              [auth]
 *    DELETE /api/users/{id}          → Delete user              [auth]
 *
 *  Response format:
 *    { "success": true|false, "data": {...}|[...], "error": "..." }
 * ============================================================
 */

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ─────────────────────────────────────────────────────────
    //  POST /api/users/login
    //  Public — returns a Sanctum bearer token on success
    // ─────────────────────────────────────────────────────────
    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');

        if (!$username || !$password) {
            return response()->json([
                'success' => false,
                'error'   => 'Username and password are required',
            ], 422);
        }

        $user = User::where('username', $username)
            ->where('status', 'Active')
            ->first();

        if (!$user || !Hash::check($password, $user->password_hash)) {
            return response()->json([
                'success' => false,
                'error'   => 'Invalid username or password',
            ], 401);
        }

        // Update last login timestamp
        $user->update(['last_login' => Carbon::now()]);

        // Revoke old tokens (single-session policy)
        $user->tokens()->delete();

        // Issue new Sanctum token
        $token = $user->createToken('AuthToken')->plainTextToken;

        return response()->json([
            'success' => true,
            'data'    => [
                'token' => $token,
                'user'  => $this->formatUser($user),
            ],
        ], 200);
    }

    // ─────────────────────────────────────────────────────────
    //  POST /api/users/logout
    //  Protected — revokes the current bearer token
    // ─────────────────────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  GET /api/users/me
    //  Protected — returns the currently authenticated user
    // ─────────────────────────────────────────────────────────
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data'    => $this->formatUser($request->user()),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  GET /api/users
    //  Protected — list all users
    // ─────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        if ($denied = $this->denyUnlessSuperAdmin($request)) {
            return $denied;
        }

        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => $users->map(fn($u) => $this->formatUser($u)),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  GET /api/users/{id}
    //  Protected — get a single user
    // ─────────────────────────────────────────────────────────
    public function show(Request $request, $id)
    {
        if ($request->user()->id !== $id && ($denied = $this->denyUnlessSuperAdmin($request))) {
            return $denied;
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error'   => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatUser($user),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  POST /api/users
    //  Protected — create a new user
    // ─────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        if ($denied = $this->denyUnlessSuperAdmin($request)) {
            return $denied;
        }

        $input = $request->all();

        foreach (['username', 'fullName', 'email', 'password', 'role'] as $field) {
            if (empty($input[$field])) {
                return response()->json([
                    'success' => false,
                    'error'   => "The {$field} field is required",
                ], 422);
            }
        }

        $user = User::create([
            'username'      => $input['username'],
            'full_name'     => $input['fullName'],
            'email'         => $input['email'],
            'password_hash' => $input['password'],
            'role'          => $input['role'],
            'club_id'       => $input['clubId'] ?? null,
            'status'        => $input['status'] ?? 'Active',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatUser($user),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────
    //  PUT /api/users/{id}
    //  Protected — update a user
    // ─────────────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        if ($denied = $this->denyUnlessSuperAdmin($request)) {
            return $denied;
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error'   => 'User not found',
            ], 404);
        }

        $input      = $request->all();
        $updateData = [];

        if (isset($input['username']))  $updateData['username']      = $input['username'];
        if (isset($input['fullName']))  $updateData['full_name']     = $input['fullName'];
        if (isset($input['email']))     $updateData['email']         = $input['email'];
        if (isset($input['role']))      $updateData['role']          = $input['role'];
        if (isset($input['clubId']))    $updateData['club_id']       = $input['clubId'];
        if (isset($input['status']))    $updateData['status']        = $input['status'];
        if (isset($input['password']))  $updateData['password_hash'] = $input['password'];

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'data'    => $this->formatUser($user->fresh()),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  DELETE /api/users/{id}
    //  Protected — delete a user
    // ─────────────────────────────────────────────────────────
    public function destroy(Request $request, $id)
    {
        if ($denied = $this->denyUnlessSuperAdmin($request)) {
            return $denied;
        }

        if ($request->user()->id === $id) {
            return response()->json([
                'success' => false,
                'error'   => 'You cannot delete your own account',
            ], 422);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'error'   => 'User not found',
            ], 404);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    // ─────────────────────────────────────────────────────────
    //  Private helper — 403 response unless caller is Super Admin
    // ─────────────────────────────────────────────────────────
    private function denyUnlessSuperAdmin(Request $request)
    {
        if ($request->user()?->role === 'Super Admin') {
            return null;
        }

        return response()->json([
            'success' => false,
            'error'   => 'Forbidden: Insufficient permissions',
        ], 403);
    }

    // ─────────────────────────────────────────────────────────
    //  Private helper — consistent camelCase user shape
    //  sent to the React frontend
    // ─────────────────────────────────────────────────────────
    private function formatUser(User $user): array
    {
        return [
            'id'        => $user->id,
            'username'  => $user->username,
            'fullName'  => $user->full_name,
            'email'     => $user->email,
            'role'      => $user->role,
            'clubId'    => $user->club_id,
            'status'    => $user->status,
            'lastLogin' => $user->last_login
                ? Carbon::parse($user->last_login)->toIso8601String()
                : null,
            'createdAt' => $user->created_at
                ? Carbon::parse($user->created_at)->toIso8601String()
                : null,
        ];
    }
}
