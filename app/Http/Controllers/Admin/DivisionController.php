<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DivisionStoreRequest;
use App\Http\Requests\Admin\DivisionUpdateRequest;
use App\Models\Division;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $prefix = $this->viewPrefix($request);

        return Inertia::render("{$prefix}/Divisions/Index", [
            'divisions' => Division::query()->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $prefix = $this->viewPrefix($request);

        return Inertia::render("{$prefix}/Divisions/Create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, DivisionStoreRequest $divisionRequest): RedirectResponse
    {
        Division::create($divisionRequest->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Divisi berhasil ditambahkan.'),
        ]);

        $routePrefix = str_starts_with($request->route()->getName(), 'admin.') ? 'admin' : 'mentor';

        return to_route("{$routePrefix}.divisions.index");
    }

    /**
     * Display the specified resource.
     */
    public function edit(Request $request, Division $division): Response
    {
        $prefix = $this->viewPrefix($request);

        return Inertia::render("{$prefix}/Divisions/Edit", [
            'division' => $division,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DivisionUpdateRequest $divisionRequest, Division $division): RedirectResponse
    {
        $division->update($divisionRequest->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Divisi berhasil diperbarui.'),
        ]);

        $routePrefix = str_starts_with($request->route()->getName(), 'admin.') ? 'admin' : 'mentor';

        return to_route("{$routePrefix}.divisions.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Division $division): RedirectResponse
    {
        $division->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Divisi berhasil dihapus.'),
        ]);

        $routePrefix = str_starts_with($request->route()->getName(), 'admin.') ? 'admin' : 'mentor';

        return to_route("{$routePrefix}.divisions.index");
    }

    /**
     * Determine the Inertia view prefix based on the current route.
     */
    private function viewPrefix(Request $request): string
    {
        return str_starts_with((string) $request->route()->getName(), 'admin.') ? 'Admin' : 'Mentor';
    }
}
