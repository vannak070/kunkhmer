<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoutResult extends Model
{
    protected $table = 'bout_results';
    protected $primaryKey = 'match_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // Recorded_at managed directly

    protected $fillable = [
        'match_id',
        'winner_id',
        'method',
        'round',
        'duration',
        'recorded_at'
    ];

    protected $casts = [
        'round' => 'integer',
        'recorded_at' => 'datetime',
    ];

    public function match()
    {
        return $this->belongsTo(SportMatch::class, 'match_id');
    }

    public function winner()
    {
        return $this->belongsTo(Fighter::class, 'winner_id');
    }
}
