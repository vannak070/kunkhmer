<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class Champion extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title_name',
        'champion_type',
        'weight_class',
        'organization',
        'batch_id',
        'event_name',
        'current_holder_id',
        'current_holder_name',
        'nationality',
        'date_created',
        'date_awarded',
        'winning_match_id',
        'status',
        'defense_count',
        'last_defense_date',
        'next_defense_deadline',
        'belt_image_url',
        'trophy_image_url',
        'certificate_url',
        'notes',
        'approval_status'
    ];

    protected $casts = [
        'weight_class' => 'float',
        'date_created' => 'datetime',
        'date_awarded' => 'datetime',
        'last_defense_date' => 'date',
        'next_defense_deadline' => 'date',
        'defense_count' => 'integer',
    ];

    public function currentHolder()
    {
        return $this->belongsTo(Fighter::class, 'current_holder_id');
    }

    public function winningMatch()
    {
        return $this->belongsTo(SportMatch::class, 'winning_match_id');
    }

    public function defenses()
    {
        return $this->hasMany(ChampionDefense::class, 'champion_id');
    }
}
