<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class BroadcastStation extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'stream_url',
        'type',
        'reach',
        'active',
        'contact_person',
        'contact_email',
        'contact_phone',
        'website_url',
        'logo_url'
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
