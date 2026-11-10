<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

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
        $event->update($this->validatedData($request, $event));

        return response()->json($event->fresh()->loadCount('guests'));
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
            'theme_config.canvas_elements.*.id' => ['required', 'string', 'max:80'],
            'theme_config.canvas_elements.*.type' => ['required', Rule::in(['text', 'ornament', 'photo'])],
            'theme_config.canvas_elements.*.text' => ['nullable', 'string', 'max:500'],
            'theme_config.canvas_elements.*.image_url' => ['nullable', 'url', 'max:2000'],
            'theme_config.canvas_elements.*.x' => ['required', 'numeric', 'between:0,100'],
            'theme_config.canvas_elements.*.y' => ['required', 'numeric', 'between:0,100'],
            'theme_config.canvas_elements.*.width' => ['required', 'numeric', 'between:5,100'],
            'theme_config.canvas_elements.*.font_size' => ['required', 'integer', 'between:8,100'],
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

        if (isset($data['theme_config'])) {
            $data['theme_config'] = array_filter($data['theme_config'], static fn ($value) => $value !== null && $value !== '');
        }

        return $data;
    }
}
