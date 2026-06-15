<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUuid;

class Fighter extends Model
{
    use HasUuid, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'name_khmer',
        'alias',
        'date_of_birth',
        'nationality',
        'province',
        'gender',
        'current_weight',
        'height',
        'club_id',
        'image',
        'style',
        'record',
        'grade',
        'status',
        'professional_status',
        'verified_by',
        'verified_date'
    ];

    protected $casts = [
        'current_weight' => 'float',
        'height' => 'float',
        'verified_date' => 'datetime',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class, 'club_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
