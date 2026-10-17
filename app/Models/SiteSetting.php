<?php

namespace App\Models;

use Database\Factories\SiteSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    /** @use HasFactory<SiteSettingFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['name', 'slogan', 'logo_path', 'favicon_path', 'updated_by'];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], ['name' => 'Chess Mission', 'slogan' => 'React + Laravel']);
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? '/storage/'.$this->logo_path : null;
    }

    public function faviconUrl(): ?string
    {
        return $this->favicon_path ? '/storage/'.$this->favicon_path : null;
    }

    /** @return array{name: string, slogan: string|null, logo_url: string|null, favicon_url: string|null} */
    public function toBranding(): array
    {
        return ['name' => $this->name, 'slogan' => $this->slogan, 'logo_url' => $this->logoUrl(), 'favicon_url' => $this->faviconUrl()];
    }
}
