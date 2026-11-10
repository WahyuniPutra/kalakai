<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'theme_config' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function hasPremiumDesign(): bool
    {
        return in_array($this->package_code, ['bahagia', 'resepsi'], true);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class);
    }

    public function wishes(): HasMany
    {
        return $this->hasMany(Wish::class)->latest();
    }

    public function giftAccounts(): HasMany
    {
        return $this->hasMany(GiftAccount::class);
    }
}
