<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\HasUuid;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'username',
        'full_name',
        'email',
        'password_hash',
        'role',
        'status',
        'club_id',
        'last_login'
    ];

    protected $hidden = [
        'password_hash',
    ];

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function club()
    {
        return $this->belongsTo(Club::class, 'club_id');
    }
}
