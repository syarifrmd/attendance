---
name: facejs-recognition-expert
description: 'Fix face recognition accuracy using face-api.js and Laravel. Use when: face recognition, face-api.js, face match, liveness, thresholds, multi-angle capture, camera issues, uploads, validation, storage.'
argument-hint: 'Target flow (setup-profile, attendance verify) and any symptoms'
---

# Face.js Recognition Expert

## What This Skill Does
- Improves face matching accuracy with multi-angle baselines and descriptor tuning.
- Debugs face-api.js model loading, detection, and recognition issues.
- Aligns frontend capture with Laravel validation and storage rules.

## When to Use
- Face recognition is inaccurate or unstable.
- face-api.js models fail to load or detect faces.
- Live capture does not match profile photos.
- Attendance verification needs stronger reliability.

## Inputs to Collect
- Target page or flow (setup profile vs attendance verification).
- Symptoms (false reject, false accept, no face detected, slow, crash).
- Example photos or a short screen recording.

## Procedure
1. **Confirm Models and Assets**
   - Ensure `/public/models` contains TinyFaceDetector, FaceLandmark68, and FaceRecognitionNet files.
   - Load models once and show progress UI.
   - Use consistent TinyFaceDetector options (inputSize and scoreThreshold) across baseline and live capture.

2. **Improve Baseline Data Quality**
   - Capture 3 poses: front, left, right.
   - Require stable frames (3 consecutive matches) before saving each pose.
   - Reject blurry or overexposed frames.

3. **Build Baseline Descriptors**
   - For each stored face image, detect and compute a descriptor.
   - Drop null results and warn if fewer than 2 descriptors remain.
   - Store descriptors in memory for matching (do not persist in DB unless needed).

4. **Live Matching Logic**
   - Detect a single face and compute descriptor.
   - Compute distance to each baseline descriptor and use the minimum distance.
   - Compare to a threshold. Start with 0.6, then tune:
     - Too many false rejects: increase slightly (0.62 to 0.68).
     - Too many false accepts: decrease (0.5 to 0.58).

5. **Pose or Liveness Gate (Optional)**
   - Use landmarks to estimate yaw from nose-to-eye distances.
   - Require a brief pose sequence (front, left, right) for enrollment only.
   - Keep verification simple (front) to reduce friction.

6. **Frontend UX and Feedback**
   - Show camera readiness, model loading, and baseline readiness.
   - Display toast errors for camera permission, model load failures, or mismatch.
   - Offer retry if capture fails or baseline is missing.

7. **Backend Integration (Laravel)**
   - Validate uploads based on status:
     - WFO/WFH/WFA: face image and GPS required.
     - Izin/Sakit: proof image and reason required.
   - Store face images under `storage/app/public` and save paths in `profiles` and `attendances`.
   - Keep controllers lean; use form requests for validation.

8. **Quality Checks and Tests**
   - Add tests for profile side photo uploads and attendance props.
   - Run `vendor/bin/pint --dirty --format agent` and `php artisan test --compact` for the touched tests.

## Decision Points
- If baseline descriptors < 2, prompt re-capture before verification.
- If model loading fails, stop camera flow and show a blocking error.
- If verification is unstable, adjust threshold and re-test with the same user.

## Troubleshooting Guide
- **No face detected**: increase inputSize, improve lighting, ensure video has correct size.
- **Baseline mismatch**: re-capture profile photos, ensure front camera is used.
- **Slow detection**: reduce inputSize or lower scoreThreshold slightly.
- **Image load errors**: confirm storage paths and use `crossOrigin = anonymous`.

## Completion Criteria
- Baseline capture stores 3 usable images.
- Verification matches the correct user within the chosen threshold.
- Uploads and validation succeed for all attendance statuses.
