<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUuid;

class Video extends Model
{
    use HasUuid, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'videos';

    protected $fillable = [
        'title',
        'description',
        'youtube_url',
        'duration',
        'category',
        'status',
        'tags',
        'fighter_id',
        'club_id',
        'match_id',
        'thumbnail',
        'views'
    ];

    protected $casts = [
        'tags' => 'array',
        'views' => 'integer'
    ];

    public function fighter()
    {
        return $this->belongsTo(Fighter::class, 'fighter_id');
    }

    public function club()
    {
        return $this->belongsTo(Club::class, 'club_id');
    }

    public function match()
    {
        return $this->belongsTo(SportMatch::class, 'match_id'); // Note: SportMatch is the class for 'matches' table
    }
}
