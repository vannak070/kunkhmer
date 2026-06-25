<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class SportMatch extends Model
{
    use HasUuid;

    protected $table = 'matches';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'event_id',
        'sub_event_id',
        'fighter_a_id',
        'fighter_b_id',
        'rounds',
        'round_time',
        'knockdown_limit',
        'agreed_weight',
        'glove_size',
        'glove_brand',
        'fighter_a_confirmed',
        'fighter_b_confirmed',
        'referee_confirmed',
        'glove_confirmed_date',
        'status',
        'proposal_status',
        'club_a_response',
        'club_b_response',
        'referee_id',
        'judge_ids',
        'winner_id',
        'is_title_match',
        'championship_id',
        'sort_order'
    ];

    protected $casts = [
        'rounds' => 'integer',
        'round_time' => 'integer',
        'knockdown_limit' => 'integer',
        'agreed_weight' => 'float',
        'fighter_a_confirmed' => 'boolean',
        'fighter_b_confirmed' => 'boolean',
        'referee_confirmed' => 'boolean',
        'glove_confirmed_date' => 'datetime',
        'judge_ids' => 'json',
        'is_title_match' => 'boolean',
        'sort_order' => 'integer'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function subEvent()
    {
        return $this->belongsTo(SubEvent::class, 'sub_event_id');
    }

    public function fighterA()
    {
        return $this->belongsTo(Fighter::class, 'fighter_a_id');
    }

    public function fighterB()
    {
        return $this->belongsTo(Fighter::class, 'fighter_b_id');
    }

    public function referee()
    {
        return $this->belongsTo(User::class, 'referee_id');
    }

    public function winner()
    {
        return $this->belongsTo(Fighter::class, 'winner_id');
    }

    public function championship()
    {
        return $this->belongsTo(Champion::class, 'championship_id');
    }

    public function result()
    {
        return $this->hasOne(BoutResult::class, 'match_id');
    }
}
