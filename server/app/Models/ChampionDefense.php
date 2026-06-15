<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class ChampionDefense extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // Mapped directly without created_at/updated_at

    protected $table = 'champion_defenses';

    protected $fillable = [
        'champion_id',
        'event_id',
        'event_name',
        'match_id',
        'date',
        'opponent',
        'opponent_id',
        'result',
        'method',
        'round'
    ];

    protected $casts = [
        'date' => 'date',
        'round' => 'integer',
    ];

    public function champion()
    {
        return $this->belongsTo(Champion::class, 'champion_id');
    }

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function match()
    {
        return $this->belongsTo(SportMatch::class, 'match_id');
    }

    public function opponentFighter()
    {
        return $this->belongsTo(Fighter::class, 'opponent_id');
    }
}
