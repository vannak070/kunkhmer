<?php

namespace App\Modules\News\Controllers;

use App\Http\Controllers\Controller;
use App\Models\NewsArticle;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index()
    {
        $articles = NewsArticle::orderBy('publish_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $articles
        ]);
    }

    public function show($id)
    {
        $article = NewsArticle::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'error' => 'Article not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $article
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
        $article = NewsArticle::create([
            'title' => $input['title'],
            'subtitle' => $input['subtitle'] ?? null,
            'content' => $input['content'] ?? null,
            'author' => $input['author'] ?? $user->full_name,
            'publish_date' => $input['publishDate'] ?? now()->toDateString(),
            'status' => $input['status'] ?? 'Draft',
            'category' => $input['category'] ?? 'General',
            'featured_image' => $input['featuredImage'] ?? null,
            'tags' => is_array($input['tags'] ?? null) ? $input['tags'] : ($input['tags'] ? array_map('trim', explode(',', $input['tags'])) : []),
            'featured' => filter_var($input['featured'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'views' => 0
        ]);

        return response()->json([
            'success' => true,
            'data' => $article
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $article = NewsArticle::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'error' => 'Article not found'], 404);
        }

        $input = $request->all();
        $updateData = [];

        if (isset($input['title'])) $updateData['title'] = $input['title'];
        if (isset($input['subtitle'])) $updateData['subtitle'] = $input['subtitle'];
        if (isset($input['content'])) $updateData['content'] = $input['content'];
        if (isset($input['author'])) $updateData['author'] = $input['author'];
        if (isset($input['publishDate'])) $updateData['publish_date'] = $input['publishDate'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['category'])) $updateData['category'] = $input['category'];
        if (isset($input['featuredImage'])) $updateData['featured_image'] = $input['featuredImage'];
        if (isset($input['featured'])) $updateData['featured'] = filter_var($input['featured'], FILTER_VALIDATE_BOOLEAN);
        
        if (isset($input['tags'])) {
            $updateData['tags'] = is_array($input['tags']) ? $input['tags'] : array_map('trim', explode(',', $input['tags']));
        }

        $article->update($updateData);

        return response()->json([
            'success' => true,
            'data' => $article
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['Super Admin', 'KKF Officer'])) {
            return response()->json(['success' => false, 'error' => 'Forbidden: Insufficient permissions'], 403);
        }

        $article = NewsArticle::find($id);
        if (!$article) {
            return response()->json(['success' => false, 'error' => 'Article not found'], 404);
        }

        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article deleted successfully',
            'data' => $article
        ]);
    }
}
