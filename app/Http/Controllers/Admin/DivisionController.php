<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DivisionStoreRequest;
use App\Http\Requests\Admin\DivisionUpdateRequest;
use App\Models\Division;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Mentor/Divisions/Index', [
            'divisions' => Division::query()->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Mentor/Divisions/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DivisionStoreRequest $request): RedirectResponse
    {
        Division::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Divisi berhasil ditambahkan.'),
        ]);

        return to_route('mentor.divisions.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Division $division): Response
    {
        return Inertia::render('Mentor/Divisions/Edit', [
            'division' => $division,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DivisionUpdateRequest $request, Division $division): RedirectResponse
    {
        $division->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Divisi berhasil diperbarui.'),
        ]);

        return to_route('mentor.divisions.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Division $division): RedirectResponse
    {
        $division->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Divisi berhasil dihapus.'),
        ]);

        return to_route('mentor.divisions.index');
    }
}
