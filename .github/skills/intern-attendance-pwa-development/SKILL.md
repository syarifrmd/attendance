---
name: intern-attendance-pwa-development
description: "Apply this skill whenever building, writing, or reviewing code for the Intern Attendance PWA system. This covers Laravel backend API design, React (TypeScript) frontend architecture, Tailwind CSS UI implementation, PWA configuration, and integration of Geolocation and Face Verification features. Use this to ensure alignment with the system flowchart, role-based access (Intern vs Mentor), and mobile-first design principles."
license: MIT
metadata:
  author: system-architect

---
# Intern Attendance PWA Development Skill
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