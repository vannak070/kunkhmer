<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class SubEvent extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'sub_events';

    protected $fillable = [
        'event_id',
        'name',
        'week_number',
        'date',
        'location',
        'phase',
        'status',
        'batch_number',
        'created_by'
    ];

    protected $casts = [
        'date' => 'date',
        'week_number' => 'integer',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function matches()
    {
        return $this->hasMany(SportMatch::class, 'sub_event_id');
    }
}
