<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = EmailTemplate::orderBy('name')->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'title' => $t->name,
                'subject' => $t->subject,
                'body' => $t->body,
                'message' => $t->body,
                'module' => $t->module,
                'is_active' => $t->is_active,
                'lastEdited' => $t->updated_at->format('M j, Y g:i A'),
                'updated_at' => $t->updated_at->format('M j, Y g:i A'),
            ];
        });

        return $this->successResponse($templates, 'Email templates retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $template = EmailTemplate::findOrFail($id);
            return $this->successResponse([
                'id' => $template->id,
                'name' => $template->name,
                'title' => $template->name,
                'subject' => $template->subject,
                'body' => $template->body,
                'message' => $template->body,
                'module' => $template->module,
                'is_active' => $template->is_active,
                'lastEdited' => $template->updated_at->format('M j, Y g:i A'),
                'updated_at' => $template->updated_at->format('M j, Y g:i A'),
            ], 'Email template retrieved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Email template not found.', null, 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'module' => 'nullable|string|max:50',
        ]);

        $template = EmailTemplate::create([
            'name' => $validated['name'],
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'module' => $validated['module'] ?? 'general',
            'is_active' => true,
        ]);

        return $this->successResponse([
            'id' => $template->id,
            'name' => $template->name,
            'subject' => $template->subject,
            'body' => $template->body,
            'module' => $template->module,
        ], 'Email template created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $template = EmailTemplate::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'subject' => 'sometimes|string|max:255',
                'body' => 'sometimes|string',
                'module' => 'nullable|string|max:50',
                'is_active' => 'sometimes|boolean',
            ]);

            $template->update($validated);

            return $this->successResponse([
                'id' => $template->id,
                'name' => $template->name,
                'subject' => $template->subject,
                'body' => $template->body,
                'module' => $template->module,
                'is_active' => $template->is_active,
            ], 'Email template updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Email template not found.', null, 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $template = EmailTemplate::findOrFail($id);
            $template->delete();
            return $this->successResponse(null, 'Email template deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Email template not found.', null, 404);
        }
    }
}