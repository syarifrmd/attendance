<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/ai (AI) - v0
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/wayfinder (WAYFINDER) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.
- To check environment variables, read the `.env` file directly.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.


Intern Attendance PWA Development Guidelines
Best practices and architectural rules for building the Intern Attendance Progressive Web App. Always adhere to these specifications when generating code, database schemas, or UI components for this project.

Project Context & Architecture
This system is a Progressive Web App (PWA) designed primarily for mobile usage by interns, with a desktop-friendly dashboard for mentors.

Backend: Laravel (providing RESTful JSON APIs, database management, and file storage).

Frontend: React with TypeScript, bundled via Vite (vite-plugin-pwa).

Styling: Tailwind CSS (mobile-first, minimalist design).

Core Hardware APIs: HTML5 Geolocation API, WebRTC/Camera API, and Client-side Face Verification (e.g., face-api.js).

1. Role-Based Access Control (RBAC)
The system has two primary roles based on the application flowchart. Never mix intern and mentor route logic.

Anak Magang (Intern):

Restricted to their own data.

Features: View Profile, Perform Attendance (WFO/WFH/WFA/Izin/Sakit), View Dashboard (History & Scale Indicator).

Mentor:

Has administrative access to assigned interns.

Features: Manage Intern Profiles (CRUD), View/Filter Attendance Data, Generate Reports (Daily, Weekly, Monthly).

2. Database & Schema Design
When creating Laravel Migrations and Eloquent Models, enforce the following structures:

Users Table: Must include a role enum (intern, mentor).

Profiles Table: Belongs to User. Must include: foto, nama_lengkap, asal_kampus (Universitas), divisi, mentor_id, and periode_magang (Lama magang).

Attendances Table: - user_id (Foreign Key)

status (Enum: 'wfo', 'wfh', 'wfa', 'izin', 'sakit')

latitude & longitude (Nullable, required for wfo/wfh/wfa)

face_verification_path (Nullable, for wfo/wfh/wfa)

proof_image_path (Nullable, for izin/sakit)

reason (Text, mandatory for offsite/izin/sakit)

created_at (Used for check-in time timestamp)

3. Attendance Logic & Validation
Implement strict validation rules in Laravel Form Requests based on the selected attendance status:

On-Site/Working (WFO / WFH / WFA):

Face Verification is mandatory. Process face verification on the React client-side to save server load, then send the validation boolean/score and the captured image to Laravel.

GPS Location (Latitude/Longitude) is mandatory.

Leave/Sick (Izin / Sakit):

Photo Proof (Bukti Foto) is mandatory. Validate MIME types (mimes:jpg,jpeg,png) and enforce a max file size (e.g., max:2048).

Reason (Alasan) text field is mandatory.

GPS and Face Verification are not required.

4. Frontend Mobile-First UI (React + Tailwind)
When writing React components, prioritize the mobile experience:

Layout: Use a Bottom Navigation Bar for interns (Dashboard, Absensi, Profil).

Responsiveness: Design for mobile screens first (w-full, max-w-md, mx-auto for wrapper) before scaling up for the Mentor dashboard.

Feedback: Use Toast notifications (e.g., react-hot-toast) for successful attendance submissions or error handling (e.g., GPS permission denied, Face not matched).

Loading States: Implement skeleton loaders during API calls, especially when fetching the attendance history or generating reports.

5. Dashboard & Data Visualization
Scale Indicator: The intern dashboard must feature a visual scale indicator (e.g., circular progress, gauge, or heat map using a library like recharts or custom Tailwind SVG). This calculates the percentage of successful check-ins vs. total internship days.

History List: Display a chronological, scrollable list of past attendances with clear color-coded badges (Green for WFO, Yellow for WFH/WFA, Red/Orange for Izin/Sakit).

6. API and Backend Best Practices
Always return structured JSON responses: {"success": true, "message": "...", "data": {...}}.

Use Laravel's Storage::disk('public') for handling uploaded face captures and proof images.

Keep controllers lean. Move report generation logic (Harian, Mingguan, Bulanan) into dedicated Service classes or Action classes.

Use eager loading (with('profile')) when mentors fetch intern attendance lists to prevent N+1 query problems.

</laravel-boost-guidelines>
