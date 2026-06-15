<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class Event extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'date',
        'end_date',
        'location',
        'status',
        'organizer_id',
        'broadcast_station_id',
        'main_sponsor_id',
        'description',
        'image',
        'kkf_approval_date',
        'kkf_approved_by'
    ];

    protected $casts = [
        'date' => 'date',
        'end_date' => 'date',
        'kkf_approval_date' => 'datetime',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function broadcastStation()
    {
        return $this->belongsTo(BroadcastStation::class, 'broadcast_station_id');
    }

    public function mainSponsor()
    {
        return $this->belongsTo(Sponsor::class, 'main_sponsor_id');
    }

    public function kkfApprovedBy()
    {
        return $this->belongsTo(User::class, 'kkf_approved_by');
    }

    public function sponsors()
    {
        return $this->belongsToMany(Sponsor::class, 'event_sponsors', 'event_id', 'sponsor_id');
    }

    public function subEvents()
    {
        return $this->hasMany(SubEvent::class, 'event_id');
    }
}
