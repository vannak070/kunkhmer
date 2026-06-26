<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class Club extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'name_khmer',
        'location',
        'head_coach',
        'status',
        'rating',
        'image',
        'phone',
        'email',
        'established',
        'description'
    ];

    protected $casts = [
        'rating' => 'float',
    ];

    public function fighters()
    {
        return $this->hasMany(Fighter::class, 'club_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'club_id');
    }
}
