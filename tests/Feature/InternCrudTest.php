<?php

use App\Enums\Role;
use App\Models\Division;
use App\Models\InternDraft;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => Role::Admin]);
    $this->intern = User::factory()->create(['role' => Role::Intern]);
    $this->division = Division::create([
        'name' => 'Test Division',
        'description' => 'Test',
        'start_time' => '08:00:00',
        'end_time' => '17:00:00',
        'work_days' => ['mon', 'tue', 'wed', 'thu', 'fri'],
        'mentor_name' => 'Test Mentor',
    ]);
});

// --- Intern Draft (Pre-registration) ---

it('admin can create an intern draft', function () {
    $response = $this->actingAs($this->admin)
        ->post('/mentor/intern-drafts', [
            'nim' => 'NIM123456',
            'name' => 'Intern Baru',
            'division_id' => $this->division->id,
            'internship_duration_days' => 90,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('intern_drafts', ['nim' => 'NIM123456', 'name' => 'Intern Baru']);
});

it('cannot create intern draft with duplicate NIM', function () {
    InternDraft::create(['nim' => 'DUPNIM', 'name' => 'First', 'internship_duration_days' => 90]);

    $response = $this->actingAs($this->admin)
        ->post('/mentor/intern-drafts', [
            'nim' => 'DUPNIM',
            'name' => 'Another Intern',
        ]);

    $response->assertSessionHasErrors(['nim']);
});

it('admin can delete an intern draft', function () {
    $draft = InternDraft::create(['nim' => 'DEL123', 'name' => 'To Delete', 'internship_duration_days' => 90]);

    $response = $this->actingAs($this->admin)
        ->delete("/mentor/intern-drafts/{$draft->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('intern_drafts', ['id' => $draft->id]);
});

it('intern cannot access intern draft routes', function () {
    $this->actingAs($this->intern)
        ->post('/mentor/intern-drafts', ['nim' => 'X', 'name' => 'X'])
        ->assertStatus(403);
});

// --- Intern Show (Fix 404) ---

it('admin can view intern detail page', function () {
    $response = $this->actingAs($this->admin)
        ->get("/mentor/interns/{$this->intern->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('Mentor/Interns/Show'));
});

it('returns 404 when trying to view a mentor as an intern detail', function () {
    $mentor = User::factory()->create(['role' => Role::Mentor]);

    $this->actingAs($this->admin)
        ->get("/mentor/interns/{$mentor->id}")
        ->assertNotFound();
});

// --- Intern Update (Edit User) ---

it('admin can update intern profile data', function () {
    $response = $this->actingAs($this->admin)
        ->patch("/mentor/interns/{$this->intern->id}", [
            'name' => 'Updated Name',
            'division_id' => $this->division->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', ['name' => 'Updated Name']);
});

it('cannot update a mentor user via intern endpoint', function () {
    $mentor = User::factory()->create(['role' => Role::Mentor]);

    $this->actingAs($this->admin)
        ->patch("/mentor/interns/{$mentor->id}", ['name' => 'Hacked'])
        ->assertNotFound();
});

// --- Intern Destroy ---

it('admin can delete an intern user', function () {
    $internId = $this->intern->id;

    $response = $this->actingAs($this->admin)
        ->delete("/mentor/interns/{$this->intern->id}");

    $response->assertRedirect(route('mentor.interns.index'));
    $this->assertDatabaseMissing('users', ['id' => $internId]);
});
