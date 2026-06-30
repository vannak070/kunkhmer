<?php

namespace App\Modules\Video\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::with(['fighter', 'club', 'match'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $videos
        ]);
    }

    public function show($id)
    {
        $video = Video::with(['fighter', 'club', 'match'])->find($id);
        if (!$video) {
            return response()->json(['success' => false, 'error' => 'Video not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $video
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $input = $request->all();

        // Map camelCase fields to snake_case table columns
        $video = Video::create([
            'title' => $input['title'],
            'description' => $input['description'] ?? null,
            'youtube_url' => $input['youtubeUrl'] ?? null,
            'duration' => $input['duration'] ?? null,
            'category' => $input['category'] ?? 'General',
            'status' => $input['status'] ?? 'Draft',
            'tags' => is_array($input['tags'] ?? null) ? $input['tags'] : ($input['tags'] ? array_map('trim', explode(',', $input['tags'])) : []),
            'fighter_id' => $input['fighterId'] ?? null,
            'club_id' => $input['clubId'] ?? null,
            'match_id' => $input['matchId'] ?? null,
            'thumbnail' => $input['thumbnail'] ?? null,
            'views' => 0
        ]);

        return response()->json([
            'success' => true,
            'data' => $video->load(['fighter', 'club', 'match'])
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $video = Video::find($id);
        if (!$video) {
            return response()->json(['success' => false, 'error' => 'Video not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['title'])) $updateData['title'] = $input['title'];
        if (isset($input['description'])) $updateData['description'] = $input['description'];
        if (isset($input['youtubeUrl'])) $updateData['youtube_url'] = $input['youtubeUrl'];
        if (isset($input['duration'])) $updateData['duration'] = $input['duration'];
        if (isset($input['category'])) $updateData['category'] = $input['category'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['fighterId'])) $updateData['fighter_id'] = $input['fighterId'] ?: null;
        if (isset($input['clubId'])) $updateData['club_id'] = $input['clubId'] ?: null;
        if (isset($input['matchId'])) $updateData['match_id'] = $input['matchId'] ?: null;
        if (isset($input['thumbnail'])) $updateData['thumbnail'] = $input['thumbnail'];
        
        if (isset($input['tags'])) {
            $updateData['tags'] = is_array($input['tags']) ? $input['tags'] : array_map('trim', explode(',', $input['tags']));
        }

        $video->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $video->load(['fighter', 'club', 'match'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $video = Video::find($id);
        if (!$video) {
            return response()->json(['success' => false, 'error' => 'Video not found'], 404);
        }

        $video->delete();

        return response()->json([
            'success' => true,
            'message' => 'Video deleted successfully',
            'data' => $video
        ]);
    }
}
