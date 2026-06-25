<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class Sponsor extends Model
{
    use HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'logo_url',
        'industry',
        'tier',
        'active',
        'contact_person',
        'contact_email',
        'contact_phone',
        'website_url'
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
