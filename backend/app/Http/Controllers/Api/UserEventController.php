<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserEventController extends Controller
{
    private const RESERVED_SLUGS = ['api', 'admin', 'dashboard', 'login', 'register', 'mitra', 'up'];

    public function index(Request $request): JsonResponse
    {
        $this->authorizeUserRole($request);
        return response()->json($request->user()->events()->withCount('guests')->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeUserRole($request);
        $data = $this->validatedData($request);
        unset($data['is_published']);
        $event = $request->user()->events()->create($data + ['is_published' => false]);

        return response()->json($event->loadCount('guests'), 201);
    }

    public function show(Request $request, int $eventId): JsonResponse
    {
        $this->authorizeUserRole($request);
        $event = $request->user()->events()->withCount('guests')->findOrFail($eventId);
        return response()->json($event);
    }

    public function update(Request $request, int $eventId): JsonResponse
    {
        $this->authorizeUserRole($request);
        $event = $request->user()->events()->findOrFail($eventId);
        $data = $this->validatedData($request, $event);
        if (isset($data['theme_config'])) {
            // Builder form edits are partial with respect to OpenDesign. Preserve
            // its independently autosaved pages and brand kits when those fields
            // are not sent by the form.
            $existingTheme = $event->theme_config ?? [];
            if (!array_key_exists('open_design', $data['theme_config']) && isset($existingTheme['open_design'])) {
                $data['theme_config']['open_design'] = $existingTheme['open_design'];
            }
        }
        $event->update($data);

        return response()->json($event->fresh()->loadCount('guests'));
    }

    public function uploadAsset(Request $request, int $eventId): JsonResponse
    {
        $this->authorizeUserRole($request);
        $request->user()->events()->findOrFail($eventId);
        $validated = $request->validate([
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp3,wav,ogg,m4a', 'max:15360'],
            'audio' => ['nullable', 'file', 'mimes:mp3,wav,ogg,m4a', 'max:15360'],
            'file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp3,wav,ogg,m4a', 'max:15360'],
        ]);

        $uploaded = $request->file('audio') ?? $request->file('file') ?? $request->file('image');
        if (!$uploaded) {
            return response()->json(['message' => 'Berkas tidak ditemukan atau format tidak didukung.'], 422);
        }

        $path = $uploaded->store("undangan-assets/{$request->user()->id}", 'public');

        return response()->json(['path' => $path], 201);
    }

    public function fonts(Request $request, int $eventId): JsonResponse
    {
        $this->authorizeUserRole($request);
        $event = $request->user()->events()->findOrFail($eventId);
        $theme = $event->theme_config ?? [];
        $openDesign = $theme['open_design'] ?? ['design' => null, 'brand_kits' => [], 'fonts' => []];
        $fonts = $openDesign['fonts'] ?? [];
        if ($request->isMethod('get')) return response()->json($fonts);

        $file = $request->validate(['file' => ['required', 'file', 'max:10240']])['file'];
        $extension = strtolower($file->getClientOriginalExtension());
        abort_unless(in_array($extension, ['ttf', 'otf', 'woff', 'woff2'], true), 422, 'Gunakan file font TTF, OTF, WOFF, atau WOFF2.');
        $path = $file->store("undangan-assets/{$request->user()->id}/fonts", 'public');
        $font = [
            'family' => 'KalakaiFont' . str_replace('-', '', (string) str()->uuid()),
            'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'url' => '/api/assets/' . $path,
        ];
        $openDesign['fonts'] = [...$fonts, $font];
        $theme['open_design'] = $openDesign;
        $event->update(['theme_config' => $theme]);
        return response()->json($font, 201);
    }

    public function publicAsset(string $path)
    {
        abort_unless(str_starts_with($path, 'undangan-assets/') && !str_contains($path, '..'), 404);
        $disk = Storage::disk('public');
        abort_unless($disk->exists($path), 404);

        return response()->file($disk->path($path), [
            'Cache-Control' => 'public, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function authorizeUserRole(Request $request): void
    {
        abort_unless($request->user()?->role === 'user', 403, 'Fitur pengelolaan undangan hanya tersedia untuk akun pengguna.');
    }

    private function validatedData(Request $request, ?Event $event = null): array
    {
        $data = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::notIn(self::RESERVED_SLUGS), Rule::unique('events', 'slug')->ignore($event?->id)],
            'event_type' => ['required', 'string', 'max:50'],
            'groom_name' => ['nullable', 'string', 'max:255'],
            'bride_name' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date'],
            'location_name' => ['nullable', 'string', 'max:255'],
            'location_address' => ['nullable', 'string', 'max:2000'],
            'map_url' => ['nullable', 'url', 'max:2000'],
            'spotify_track_id' => ['nullable', 'string', 'max:120'],
            'theme_config' => ['nullable', 'array'],
            'theme_config.template_id' => ['nullable', Rule::in(['classic', 'garden', 'modern', 'blank'])],
            'theme_config.primary_color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme_config.accent_color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme_config.font_family' => ['nullable', Rule::in(['serif', 'sans'])],
            'theme_config.page_transition' => ['nullable', Rule::in(['fade', 'slide', 'flip', 'zoom'])],
            'theme_config.web_design' => ['nullable', 'array'],
            'theme_config.quote' => ['nullable', 'string', 'max:1000'],
            'theme_config.quote_source' => ['nullable', 'string', 'max:150'],
            'theme_config.audio_title' => ['nullable', 'string', 'max:255'],
            'theme_config.audio_preview_url' => ['nullable', 'url', 'max:2000'],
            'theme_config.hero_image_url' => ['nullable', 'url', 'max:2000'],
            'theme_config.sections' => ['nullable', 'array'],
            'theme_config.sections.names' => ['sometimes', 'boolean'],
            'theme_config.sections.story' => ['sometimes', 'boolean'],
            'theme_config.sections.details' => ['sometimes', 'boolean'],
            'theme_config.sections.gifts' => ['sometimes', 'boolean'],
            'theme_config.sections.guestbook' => ['sometimes', 'boolean'],
            'theme_config.sections.spotify' => ['sometimes', 'boolean'],
            'theme_config.canvas_elements' => ['nullable', 'array', 'max:40'],
            // OpenDesign stores serializable Fabric pages, brand kits and optional font metadata.
            // Keep the document attached to the owning event and bound its total request size.
            'theme_config.open_design' => ['nullable', 'array'],
            'theme_config.canvas_elements.*.id' => ['required', 'string', 'max:80'],
            'theme_config.canvas_elements.*.page' => ['required', Rule::in(['cover', 'names', 'story', 'details', 'gifts', 'guestbook'])],
            'theme_config.canvas_elements.*.type' => ['required', Rule::in(['text', 'ornament', 'photo', 'rect', 'circle', 'line'])],
            'theme_config.canvas_elements.*.text' => ['nullable', 'string', 'max:500'],
            'theme_config.canvas_elements.*.image_url' => ['nullable', 'url', 'max:2000'],
            'theme_config.canvas_elements.*.x' => ['required', 'numeric', 'between:0,100'],
            'theme_config.canvas_elements.*.y' => ['required', 'numeric', 'between:0,100'],
            'theme_config.canvas_elements.*.width' => ['required', 'numeric', 'between:5,100'],
            'theme_config.canvas_elements.*.height' => ['required', 'numeric', 'between:1,100'],
            'theme_config.canvas_elements.*.font_size' => ['required', 'integer', 'between:8,100'],
            'theme_config.canvas_elements.*.font_family' => ['required', Rule::in(['serif', 'sans'])],
            'theme_config.canvas_elements.*.font_style' => ['required', Rule::in(['normal', 'bold', 'italic', 'bold italic'])],
            'theme_config.canvas_elements.*.opacity' => ['required', 'numeric', 'between:0,1'],
            'theme_config.canvas_elements.*.color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme_config.canvas_elements.*.rotation' => ['required', 'numeric', 'between:-360,360'],
            'theme_config.canvas_elements.*.effect' => ['required', Rule::in(['none', 'shadow', 'glow', 'outline'])],
            'theme_config.canvas_elements.*.frame' => ['required', Rule::in(['none', 'round', 'oval', 'ornate'])],
            'theme_config.love_story' => ['nullable', 'array', 'max:8'],
            'theme_config.love_story.*.year' => ['nullable', 'string', 'max:20'],
            'theme_config.love_story.*.title' => ['nullable', 'string', 'max:120'],
            'theme_config.love_story.*.desc' => ['nullable', 'string', 'max:500'],
            'is_published' => ['sometimes', 'boolean'],
        ])->validate();

        if (isset($data['theme_config']['open_design']) && strlen(json_encode($data['theme_config']['open_design']) ?: '') > 5 * 1024 * 1024) {
            throw ValidationException::withMessages(['theme_config.open_design' => 'Dokumen desain maksimal 5 MB.']);
        }
        if (isset($data['theme_config']['web_design']) && strlen(json_encode($data['theme_config']['web_design']) ?: '') > 1024 * 1024) {
            throw ValidationException::withMessages(['theme_config.web_design' => 'Desain halaman web terlalu besar.']);
        }

        if (isset($data['theme_config'])) {
            $data['theme_config'] = array_filter($data['theme_config'], static fn ($value) => $value !== null && $value !== '');
            if (($event?->package_code ?? 'free') === 'free') {
                $data['theme_config']['page_transition'] = 'fade';
                if (isset($data['theme_config']['web_design'])) {
                    $data['theme_config']['web_design']['transition'] = 'fade';
                    $data['theme_config']['web_design']['sections'] = array_slice($data['theme_config']['web_design']['sections'], 0, 10);
                }
            }
        }

        return $data;
    }
}
