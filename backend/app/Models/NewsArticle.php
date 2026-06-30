<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class NewsArticle extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'news_articles';

    protected $fillable = [
        'title',
        'subtitle',
        'content',
        'author',
        'publish_date',
        'status',
        'category',
        'featured_image',
        'views',
        'tags',
        'featured'
    ];

    protected $casts = [
        'tags' => 'array',
        'featured' => 'boolean',
        'views' => 'integer'
    ];
}
