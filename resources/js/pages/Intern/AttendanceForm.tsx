import { useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import MobileLayout from '@/layouts/MobileLayout';
import toast, { Toaster } from 'react-hot-toast';
import { Camera, MapPin, Loader2, UploadCloud, CheckCircle2, XCircle, Clock, LogOut, AlertTriangle } from 'lucide-react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';
const FACE_MATCH_THRESHOLD = 0.45;
const FACE_AVG_THRESHOLD = 0.55;

// Indosat Semarang office coordinates & radius
const WFO_LAT = -6.98979;
const WFO_LNG = 110.42133;
const WFO_RADIUS_M = 100;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const getDetectorOptions = () => {
    if (faceapi.nets.ssdMobilenetv1.isLoaded) {
        return new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
    }

    return new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.3,
    });
};

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

interface TodayAttendance {
    id: string;
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
    is_late?: boolean;
    late_level?: 'green' | 'yellow' | 'red';
    late_minutes?: number;
}

interface WorkSchedule {
    start_time: string;
    end_time: string;
    work_days: string[];
}

export default function AttendanceForm({
    profile_faces = [],
    today_attendance = null,
    work_schedule = null,
}: {
    profile_faces: string[];
    today_attendance: TodayAttendance | null;
    work_schedule: WorkSchedule | null;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [modelLoadProgress, setModelLoadProgress] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [flashEffect, setFlashEffect] = useState(false);
    const [baselineDescriptors, setBaselineDescriptors] = useState<Float32Array[]>([]);

    // UI states
    const [activeTab, setActiveTab] = useState<'wfo' | 'wfhwfa' | 'offsite'>('wfo');
    const [geoError, setGeoError] = useState<string | null>(null);
    const [locationStatus, setLocationStatus] = useState<
        'pending' | 'locating' | 'success' | 'error'
    >('pending');

    // Camera selection states
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        status: 'wfo',
        latitude: '',
        longitude: '',
        face_verification_image: null as File | null,
        face_match_score: '',
        proof_image: null as File | null,
        reason: '',
        checkout_reason: '',
    });

    const getDescriptorFromPath = useCallback(async (path: string) => {
        const url = '/storage/' + path;
        console.log('[FaceVerify] Loading profile image:', url);
        const img = await loadImage(url);
        console.log('[FaceVerify] Image loaded, dimensions:', img.naturalWidth, 'x', img.naturalHeight);
        const result = await faceapi
            .detectSingleFace(img, getDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (result) {
            console.log('[FaceVerify] Descriptor extracted, detection score:', result.detection.score.toFixed(3));
        } else {
            console.warn('[FaceVerify] No face detected in profile image:', url);
        }

        return result?.descriptor ?? null;
    }, []);

    // Load face-api.js models following official documentation
    useEffect(() => {
        const loadModels = async () => {
            try {
                setModelLoadProgress('Loading Face Detector...');
                try {
                    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
                } catch (error) {
                    console.warn('SSD MobileNet v1 not available, fallback to Tiny Face Detector.', error);
                    setModelLoadProgress('Loading Tiny Face Detector...');
                    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                }

                setModelLoadProgress('Loading Face Landmark Model...');
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

                setModelLoadProgress('Loading Face Recognition Model...');
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

                if (profile_faces.length > 0) {
                    setModelLoadProgress('Memuat data profil wajah...');
                    const descriptors: Float32Array[] = [];

                    for (const facePath of profile_faces) {
                        try {
                            const descriptor = await getDescriptorFromPath(facePath);
                            if (descriptor) {
                                descriptors.push(descriptor);
                            }
                        } catch (error) {
                            console.warn('Gagal memuat foto profil:', facePath, error);
                        }
                    }

                    console.log(`[FaceVerify] Loaded ${descriptors.length}/${profile_faces.length} baseline descriptors`);

                    if (descriptors.length === 0) {
                        console.warn('Wajah tidak terdeteksi pada foto profil.');
                        toast.error('Wajah tidak terdeteksi pada foto profil. Silakan perbarui foto profil Anda.');
                    }

                    setBaselineDescriptors(descriptors);
                }

                setModelsLoaded(true);
                setModelLoadProgress('');
            } catch (err) {
                console.error('Face API models failed to load:', err);
                setModelLoadProgress('Gagal memuat model');
                toast.error(
                    'Gagal memuat model pendeteksi wajah. Pastikan folder public/models tersedia.',
                );
            }
        };
        loadModels();
    }, [getDescriptorFromPath, profile_faces]);

    // Cleanup stream on unmount or stream change
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    // Effect to bind the stream to the video element after it mounts
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const startCamera = useCallback(
        async (deviceId?: string) => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Browser memblokir fitur kamera (Pastikan menggunakan HTTPS atau Localhost)');
                }

                if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                }

                const targetDeviceId = deviceId || selectedCameraId;
                let mediaStream;

                try {
                    // Coba akses kamera depan (user) atau ID spesifik
                    const constraints: MediaStreamConstraints = targetDeviceId
                        ? { video: { deviceId: { exact: targetDeviceId } } }
                        : { video: { facingMode: 'user' } };
                        
                    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch (fallbackError) {
                    console.warn("Kamera depan gagal, mencoba kamera default...", fallbackError);
                    // Jika gagal (misal di PC tanpa kamera depan), fallback ke kamera apa saja
                    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                }

                setStream(mediaStream);

                // Ambil daftar kamera setelah izin diberikan
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter((d) => d.kind === 'videoinput');
                setCameras(videoDevices);

                // Set pilihan dropdown sesuai kamera yang sedang aktif
                if (!targetDeviceId && videoDevices.length > 0) {
                    const activeTrack = mediaStream.getVideoTracks()[0];
                    const activeDeviceId = activeTrack.getSettings().deviceId;
                    if (activeDeviceId) {
                        setSelectedCameraId(activeDeviceId);
                    } else {
                        setSelectedCameraId(videoDevices[0].deviceId);
                    }
                }
            } catch (error: any) {
                console.error("Camera fetch error:", error);
                const errName = error.name ? `[${error.name}]` : '';
                toast.error(
                    `Akses Kamera Gagal ${errName}: ${error.message || 'Periksa perizinan OS/Browser'}.`
                );
            }
        },
        [selectedCameraId, stream],
    );

    const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDeviceId = e.target.value;
        setSelectedCameraId(newDeviceId);
        startCamera(newDeviceId);
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    const getLocation = useCallback(() => {
        setLocationStatus('locating');
        setGeoError(null);
        if (!navigator.geolocation) {
            setLocationStatus('error');
            toast.error('Geolocation tidak didukung di browser ini.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setData((prev) => ({ ...prev, latitude: latitude.toString(), longitude: longitude.toString() }));

                if (activeTab === 'wfo') {
                    const dist = haversineDistance(latitude, longitude, WFO_LAT, WFO_LNG);
                    if (dist > WFO_RADIUS_M) {
                        setLocationStatus('error');
                        const msg = `Anda berada ${Math.round(dist)} m dari kantor. WFO hanya bisa dalam radius ${WFO_RADIUS_M} m.`;
                        setGeoError(msg);
                        toast.error(msg);
                        setData((prev) => ({ ...prev, latitude: '', longitude: '' }));
                        return;
                    }
                }

                setLocationStatus('success');
                toast.success('Lokasi berhasil didapatkan.');
            },
            (error) => {
                setLocationStatus('error');
                toast.error('Gagal mendapatkan lokasi: ' + error.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    }, [setData, activeTab]);

    const handleCaptureFace = useCallback(async () => {
        if (!videoRef.current || !modelsLoaded) {
            return;
        }

        if (baselineDescriptors.length === 0) {
            toast.error('Foto profil belum siap untuk verifikasi.');
            return;
        }

        setIsDetecting(true);
        let isRunning = true;
        let matchStreak = 0;
        const requiredStreak = 5;
        const minDetectionScore = 0.5;
        let timeoutTimer: NodeJS.Timeout;

        // Beri waktu maksimal 20 detik untuk menyelesaikan tantangan
        const stopDetection = (errorMsg?: string) => {
            isRunning = false;
            clearTimeout(timeoutTimer);
            setIsDetecting(false);
            if (errorMsg) {
                toast.error(errorMsg, { id: 'liveness', duration: 4000 });
            }
        };

        timeoutTimer = setTimeout(() => {
            stopDetection('Waktu verifikasi habis. Silakan coba lagi.');
        }, 20000);

        toast.loading('Tatap lurus ke kamera...', { id: 'liveness' });

        const checkFrame = async () => {
            if (!isRunning || !videoRef.current || videoRef.current.paused || videoRef.current.ended) {
                return;
            }

            try {
                const result = await faceapi
                    .detectSingleFace(videoRef.current, getDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (!result) {
                    if (overlayRef.current) {
                        const ctx = overlayRef.current.getContext('2d');
                        ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
                    }
                    if (isRunning) {
                        setTimeout(checkFrame, 200);
                    }
                    return;
                }

                if (videoRef.current && overlayRef.current) {
                    const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
                    faceapi.matchDimensions(overlayRef.current, displaySize);
                    const resizedResult = faceapi.resizeResults(result, displaySize);
                    const ctx = overlayRef.current.getContext('2d');
                    ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
                    const drawBox = new faceapi.draw.DrawBox(resizedResult.detection.box, {
                        lineWidth: 2,
                        boxColor: '#6366f1'
                    });
                    drawBox.draw(overlayRef.current);
                }

                // Match Identity
                const distances = baselineDescriptors.map((baseline) =>
                    faceapi.euclideanDistance(baseline, result.descriptor),
                );
                const minDistance = Math.min(...distances);
                const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

                console.log(`[FaceVerify] Distances: min=${minDistance.toFixed(3)}, avg=${avgDistance.toFixed(3)}, all=[${distances.map(d => d.toFixed(3)).join(', ')}]`);

                if (minDistance > FACE_MATCH_THRESHOLD || avgDistance > FACE_AVG_THRESHOLD) {
                    matchStreak = 0;
                    // Don't stop, just wait until the right person comes into frame
                    toast(`Wajah tidak cocok (skor: ${minDistance.toFixed(2)})`, { id: 'liveness', icon: '⚠️' });
                    if (isRunning) {
                        setTimeout(checkFrame, 500);
                    }
                    return;
                }

                if (result.detection.score < minDetectionScore) {
                    matchStreak = 0;
                    if (isRunning) {
                        setTimeout(checkFrame, 200);
                    }
                    return;
                }

                matchStreak += 1;
                if (matchStreak < requiredStreak) {
                    if (isRunning) {
                        setTimeout(checkFrame, 200);
                    }
                    return;
                }

                // Success block
                clearTimeout(timeoutTimer);
                setFlashEffect(true);
                
                if (videoRef.current && overlayRef.current) {
                    const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
                    const resizedResult = faceapi.resizeResults(result, displaySize);
                    const drawBox = new faceapi.draw.DrawBox(resizedResult.detection.box, { lineWidth: 3, boxColor: '#22c55e' });
                    drawBox.draw(overlayRef.current);
                }

                toast.success(`Identitas terverifikasi! (skor: ${minDistance.toFixed(2)})`, { id: 'liveness' });
                
                const capturedScore = minDistance.toFixed(4);
                setTimeout(() => {
                    const canvas = faceapi.createCanvasFromMedia(videoRef.current!);
                    canvas.width = videoRef.current!.videoWidth;
                    canvas.height = videoRef.current!.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(videoRef.current!, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            setData((prev) => ({
                                ...prev,
                                face_verification_image: new File([blob], 'face_capture.jpg', { type: 'image/jpeg' }),
                                face_match_score: capturedScore,
                            }));
                        }
                        setFlashEffect(false);
                    }, 'image/jpeg', 0.85);

                    stopCamera();
                    stopDetection();
                }, 400);
                return;

            } catch (err) {
                console.error("Frame check error:", err);
                if (isRunning) {
                    setTimeout(checkFrame, 500); // Retry logic
                }
            }
        };

        checkFrame();
    }, [modelsLoaded, baselineDescriptors, setData, stopCamera]);

    const submitAttendance = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'wfo' && (!data.latitude || !data.face_verification_image)) {
            toast.error('Lokasi GPS dan Verifikasi Wajah wajib untuk WFO.');
            return;
        }

        if (activeTab === 'wfhwfa' && !data.reason) {
            toast.error('Alasan wajib untuk WFH/WFA.');
            return;
        }

        if (activeTab === 'offsite' && (!data.proof_image || !data.reason)) {
            toast.error('Foto Bukti dan Alasan wajib untuk Izin/Sakit.');
            return;
        }

        post('/intern/attendance/store', {
            onSuccess: () => { toast.success('Absensi berhasil disimpan!'); },
        });
    };

    // Check-out handler
    const [minutesUntilEnd, setMinutesUntilEnd] = useState<number | null>(null);
    const [canCheckOut, setCanCheckOut] = useState(false);

    useEffect(() => {
        if (!work_schedule?.end_time) {
            setCanCheckOut(true);
            return;
        }

        const updateCountdown = () => {
            const now = new Date();
            const [h, m] = work_schedule.end_time.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(h, m, 0, 0);
            const diffMs = endDate.getTime() - now.getTime();
            if (diffMs <= 0) {
                setCanCheckOut(true);
                setMinutesUntilEnd(0);
            } else {
                setCanCheckOut(false);
                setMinutesUntilEnd(Math.ceil(diffMs / 60000));
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 30000);
        return () => clearInterval(interval);
    }, [work_schedule?.end_time]);
    const handleCheckOut = (e: React.FormEvent) => {
        e.preventDefault();

        if (today_attendance?.status === 'wfo' && (!data.latitude || !data.face_verification_image)) {
            toast.error('Lokasi GPS dan Verifikasi Wajah wajib untuk presensi pulang WFO.');
            return;
        }

        if (!canCheckOut && !data.checkout_reason) {
            toast.error('Alasan Pulang Awal wajib diisi.');
            return;
        }

        post(`/intern/attendance/${today_attendance?.id}/checkout`, {
            onSuccess: () => toast.success('Presensi pulang berhasil!'),
            onError: () => toast.error('Gagal melakukan presensi pulang. Periksa input Anda.'),
        });
    };

    const renderWFORequirements = () => (
        <>
            {/* Geolocation Section */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900">
                            Lokasi Saat Ini
                        </h3>
                        <p className="text-xs text-blue-700/70">
                            Diperlukan untuk validasi area
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={getLocation}
                        disabled={locationStatus === 'locating'}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                        {locationStatus === 'locating' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : locationStatus === 'success' ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <MapPin className="h-4 w-4" />
                        )}
                        {locationStatus === 'success' ? 'Didapat' : 'Dapatkan'}
                    </button>
                </div>
                {data.latitude && (
                    <p className="rounded bg-blue-100 p-2 font-mono text-xs text-blue-800">
                        Lat: {data.latitude.substring(0, 10)}
                        <br />
                        Lng: {data.longitude.substring(0, 10)}
                    </p>
                )}
            </div>

            {/* Face Verification Section */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            Verifikasi Wajah
                        </h3>
                        <p className="text-xs text-gray-500">
                            {!modelsLoaded && modelLoadProgress
                                ? modelLoadProgress
                                : modelsLoaded
                                  ? baselineDescriptors.length > 0
                                      ? 'Model AI siap digunakan.'
                                      : 'Foto profil wajah belum tersedia.'
                                  : 'Menunggu model AI...'}
                        </p>
                    </div>
                    {!stream && !data.face_verification_image && (
                        <button
                            type="button"
                            onClick={() => startCamera()}
                            disabled={!modelsLoaded}
                            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                        >
                            Buka Kamera
                        </button>
                    )}
                </div>

                {/* Camera View */}
                {stream && !data.face_verification_image && (
                    <div className="relative w-full overflow-hidden rounded-lg bg-black aspect-[4/3] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                        <canvas ref={overlayRef} className="absolute inset-0 h-full w-full object-cover pointer-events-none" />
                        <div className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-200 ${flashEffect ? 'opacity-90' : 'opacity-0'}`} />
                        <div className="pointer-events-none absolute inset-0 ring-4 ring-white/20 ring-inset rounded-lg" />
                        
                        {cameras.length > 0 && (
                            <div className="absolute top-2 right-2 left-2 z-10">
                                <select value={selectedCameraId} onChange={handleCameraChange} className="w-full rounded-lg border-none bg-black/50 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm focus:ring-2 focus:ring-white/50 appearance-none">
                                    {cameras.map((cam, idx) => (
                                        <option key={cam.deviceId} value={cam.deviceId} className="text-gray-900">
                                            {cam.label || `Camera ${idx + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="absolute inset-x-0 bottom-4 flex justify-center">
                            <button
                                type="button"
                                onClick={handleCaptureFace}
                                disabled={isDetecting || !modelsLoaded}
                                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-indigo-600 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                            >
                                {isDetecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                                Scan Wajah
                            </button>
                        </div>
                    </div>
                )}

                {/* Success state */}
                {data.face_verification_image && (
                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">
                                Wajah Terverifikasi
                            </p>
                            <p className="text-xs text-green-600">
                                Foto wajah berhasil diambil.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setData('face_verification_image', null);
                                startCamera();
                            }}
                            className="text-xs font-medium text-green-700 underline"
                        >
                            Ulangi
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <MobileLayout title="Presensi">
            <Toaster position="top-center" />
            <div className="mb-4">
                <h1 className="mb-1 text-xl font-bold text-gray-900">
                    Presensi Hari Ini
                </h1>
                <p className="text-sm text-gray-500">
                    Pilih tipe kehadiran dan lengkapi data.
                </p>
            </div>

            {/* Work Schedule Info */}
            {work_schedule && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <div className="text-xs text-indigo-700">
                        <span className="font-semibold">Jam Kerja:</span>{' '}
                        {work_schedule.start_time} – {work_schedule.end_time}
                        <span className="ml-2 text-indigo-400">
                            (Presensi pulang setelah jam {work_schedule.end_time})
                        </span>
                    </div>
                </div>
            )}

            {/* Already Checked In – Show Check-Out Panel */}
            {today_attendance && ['wfo', 'wfh', 'wfa'].includes(today_attendance.status) && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <h2 className="font-semibold text-emerald-800">Presensi Masuk Tercatat</h2>
                    </div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-emerald-700">
                        <Clock className="h-4 w-4" />
                        <span>
                            Masuk:{' '}
                            <strong>
                                {today_attendance.check_in_at
                                    ? new Date(today_attendance.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                    : '-'}
                            </strong>
                        </span>
                        {today_attendance.check_out_at && (
                            <>
                                <span className="text-emerald-400">|</span>
                                <LogOut className="h-4 w-4" />
                                <span>
                                    Pulang:{' '}
                                    <strong>
                                        {new Date(today_attendance.check_out_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </strong>
                                </span>
                            </>
                        )}
                    </div>
                    <p className="mb-4 text-xs text-emerald-600 flex items-center gap-2">
                        <span>Status Kehadiran: <span className="font-bold uppercase">{today_attendance.status}</span></span>
                        {today_attendance.is_late !== undefined && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                today_attendance.late_level === 'green' ? 'bg-green-100 text-green-700' :
                                today_attendance.late_level === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {today_attendance.late_level === 'green' ? 'Tepat Waktu' : `Terlambat ${today_attendance.late_minutes}m`}
                            </span>
                        )}
                    </p>
                    {!today_attendance.check_out_at ? (
                        <form onSubmit={handleCheckOut} className="space-y-4">
                            {today_attendance.status === 'wfo' && renderWFORequirements()}
                            
                            {!canCheckOut && minutesUntilEnd !== null && minutesUntilEnd > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                        <div className="text-xs text-amber-700">
                                            <p className="font-semibold">Belum waktunya pulang</p>
                                            <p>
                                                Presensi pulang normal baru bisa dilakukan pukul{' '}
                                                <strong>{work_schedule?.end_time}</strong>.
                                                Sisa <strong>{minutesUntilEnd} menit</strong> lagi.
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Alasan Pulang Awal (Wajib)
                                        </label>
                                        <textarea
                                            value={data.checkout_reason}
                                            onChange={(e) => setData('checkout_reason', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            placeholder="Jelaskan alasan pulang lebih awal..."
                                        />
                                        {errors.checkout_reason && <p className="mt-1 text-xs text-red-500">{errors.checkout_reason}</p>}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-md transition-transform active:scale-[0.98] ${
                                    canCheckOut || data.checkout_reason.trim().length > 0
                                        ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
                                        : 'cursor-not-allowed bg-gray-400 shadow-gray-200'
                                }`}
                            >
                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                                {canCheckOut ? 'Presensi Pulang' : 'Pulang Lebih Awal'}
                            </button>
                        </form>
                    ) : (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-100 py-3 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 className="h-5 w-5" />
                            Presensi Hari Ini Lengkap
                        </div>
                    )}
                </div>
            )}

            {/* Izin/Sakit already submitted */}
            {today_attendance && ['izin', 'sakit'].includes(today_attendance.status) && (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-amber-500" />
                    <p className="font-semibold text-amber-800">Presensi Sudah Dicatat</p>
                    <p className="mt-1 text-sm text-amber-600">
                        Status: <span className="font-bold uppercase">{today_attendance.status}</span>
                    </p>
                </div>
            )}

            {/* Only show the form if not yet submitted today */}
            {!today_attendance && (
                <>

            {/* Toggle Tabs - 3 tabs */}
            <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
                <button type="button" onClick={() => { setActiveTab('wfo'); setData((p) => ({ ...p, status: 'wfo', latitude: '', longitude: '', face_verification_image: null, reason: '', proof_image: null })); setLocationStatus('pending'); setGeoError(null); }}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${ activeTab === 'wfo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500' }`}>
                    WFO
                </button>
                <button type="button" onClick={() => { setActiveTab('wfhwfa'); setData((p) => ({ ...p, status: 'wfh', latitude: '', longitude: '', face_verification_image: null })); stopCamera(); }}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${ activeTab === 'wfhwfa' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500' }`}>
                    WFH / WFA
                </button>
                <button type="button" onClick={() => { setActiveTab('offsite'); setData((p) => ({ ...p, status: 'izin', latitude: '', longitude: '', face_verification_image: null })); stopCamera(); }}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${ activeTab === 'offsite' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500' }`}>
                    Izin / Sakit
                </button>
            </div>

            <form onSubmit={submitAttendance} className="space-y-5 pb-8">
                {/* Status Selection */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status Kehadiran
                    </label>
                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        disabled={activeTab === 'wfo'}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                        {activeTab === 'wfo' && <option value="wfo">Work From Office (WFO)</option>}
                        {activeTab === 'wfhwfa' && (
                            <>
                                <option value="wfh">Work From Home (WFH)</option>
                                <option value="wfa">Work From Anywhere (WFA)</option>
                            </>
                        )}
                        {activeTab === 'offsite' && (
                            <>
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                            </>
                        )}
                    </select>
                    {errors.status && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.status}
                        </p>
                    )}
                </div>

                {activeTab === 'wfo' && renderWFORequirements()}

                {(activeTab === 'wfhwfa' || activeTab === 'offsite') && (
                    <>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Alasan (Wajib)
                            </label>
                            <textarea
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-gray-300 bg-white p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder={`Jelaskan alasan ${activeTab === 'offsite' ? 'izin / sakit' : 'WFH / WFA'}...`}
                            />
                            {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                {activeTab === 'offsite' ? 'Bukti Foto / Surat Dokter (Wajib)' : 'Foto Bukti (Opsional)'}
                            </label>
                            <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-gray-500">
                                <UploadCloud className="mb-2 h-8 w-8" />
                                <span className="text-sm">Klik untuk upload foto</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={(e) => setData('proof_image', e.target.files?.[0] || null)}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                            </div>
                            {data.proof_image && <p className="mt-2 text-xs text-green-600">File terpilih: {data.proof_image.name}</p>}
                            {errors.proof_image && <p className="mt-1 text-xs text-red-500">{errors.proof_image}</p>}
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition-transform active:scale-[0.98]"
                >
                    {processing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : null}
                    Presensi Masuk
                </button>
            </form>
            </>
            )}
        </MobileLayout>
    );
}
