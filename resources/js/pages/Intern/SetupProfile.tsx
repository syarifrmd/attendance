import { useForm } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import MobileLayout from '@/layouts/MobileLayout';
import toast, { Toaster } from 'react-hot-toast';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';
type FaceResult = faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>
>;

const getDetectorOptions = () => {
    if (faceapi.nets.ssdMobilenetv1.isLoaded) {
        return new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
    }

    return new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.3,
    });
};

export default function SetupProfile({
    divisionName,
    existingProfile,
    userName,
    divisions = [],
}: {
    divisionName?: string | null;
    existingProfile?: any;
    userName?: string;
    divisions?: { id: string; name: string }[];
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [modelLoadProgress, setModelLoadProgress] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [flashEffect, setFlashEffect] = useState(false);
    const [captureStep, setCaptureStep] = useState<'straight' | 'left' | 'right' | 'done'>('straight');

    // Camera selection states
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        foto: null as File | null,
        foto_left: null as File | null,
        foto_right: null as File | null,
        name: userName || '',
        asal_kampus: existingProfile?.asal_kampus || '',
        division_id: existingProfile?.division_id || '',
        internship_duration_days: existingProfile?.internship_duration_days || 90,
    });
    const captureCount = [data.foto, data.foto_left, data.foto_right].filter(Boolean).length;
    const captureComplete = captureCount === 3;
    const captureStepLabel =
        captureStep === 'straight'
            ? 'Lurus'
            : captureStep === 'left'
                ? 'Kiri'
                : captureStep === 'right'
                    ? 'Kanan'
                    : 'Selesai';

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

    }, []);

    const getYawOffset = (result: FaceResult) => {
        const box = result.detection.box;
        const nosePoints = result.landmarks.getNose();
        const noseTip = nosePoints[Math.floor(nosePoints.length / 2)];
        const boxCenterX = box.x + box.width / 2;
        const boxWidth = box.width || 1;

        return (noseTip.x - boxCenterX) / boxWidth;
    };

    const getPoseFromYaw = (yawOffset: number, baseline: number) => {
        const delta = yawOffset - baseline;

        // Face API reads the unmirrored camera pixels. A positive nose offset
        // therefore means the person has turned to their left, even though the
        // preview is mirrored for the familiar selfie-camera experience.
        if (delta > 0.08) {
            return 'left';
        }

        if (delta < -0.08) {
            return 'right';
        }

        if (Math.abs(delta) <= 0.05) {
            return 'center';
        }

        return 'unknown';
    };

    const captureFrame = async (fileName: string) => {
        if (!videoRef.current) {
            return null;
        }

        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0);

        return new Promise<File | null>((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(null);
                    return;
                }

                resolve(new File([blob], fileName, { type: 'image/jpeg' }));
            }, 'image/jpeg', 0.85);
        });
    };

    // Cleanup stream on unmount or stream change
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

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

    const handleCaptureFace = useCallback(async () => {
        if (!videoRef.current || !modelsLoaded) {
            return;
        }

        setIsDetecting(true);
        let isRunning = true;
        let currentState: 'straight' | 'left' | 'right' = 'straight';
        let poseStreak = 0;
        let baselineRatio: number | null = null;
        const baselineSamples: number[] = [];
        const requiredStreak = 2;
        const minDetectionScore = 0.5;
        let timeoutTimer: NodeJS.Timeout;

        const stopDetection = (errorMsg?: string) => {
            isRunning = false;
            clearTimeout(timeoutTimer);
            setIsDetecting(false);
            if (errorMsg) {
                toast.error(errorMsg, { id: 'liveness', duration: 4000 });
            }
        };

        setCaptureStep('straight');

        timeoutTimer = setTimeout(() => {
            stopDetection('Waktu pendaftaran wajah habis. Silakan coba lagi.');
        }, 25000);

        toast.loading('Tatap lurus ke kamera...', { id: 'liveness' });

        const finalizeBaseline = () => {
            if (baselineRatio === null && baselineSamples.length > 0) {
                baselineRatio =
                    baselineSamples.reduce((sum, value) => sum + value, 0) /
                    baselineSamples.length;
            }
        };

        const moveToNextStep = (nextStep: 'left' | 'right' | 'done') => {
            poseStreak = 0;

            if (nextStep === 'left') {
                finalizeBaseline();
                currentState = 'left';
                setCaptureStep('left');
                toast.loading('Sekarang miring ke kiri...', { id: 'liveness' });
                return;
            }

            if (nextStep === 'right') {
                currentState = 'right';
                setCaptureStep('right');
                toast.loading('Sekarang miring ke kanan...', { id: 'liveness' });
                return;
            }

            setCaptureStep('done');
        };

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
                        lineWidth: 2, boxColor: '#6366f1'
                    });
                    drawBox.draw(overlayRef.current);
                }

                if (result.detection.score < minDetectionScore) {
                    poseStreak = 0;
                    if (isRunning) {
                        setTimeout(checkFrame, 200);
                    }
                    return;
                }

                const yawOffset = getYawOffset(result);

                if (currentState === 'straight' && baselineRatio === null) {
                    if (Number.isFinite(yawOffset) && Math.abs(yawOffset) < 0.2) {
                        baselineSamples.push(yawOffset);
                        if (baselineSamples.length >= 6) {
                            finalizeBaseline();
                        }
                    }
                }

                const expectedOrientation =
                    currentState === 'straight' ? 'center' : currentState;
                const baselineValue =
                    baselineRatio ??
                    (baselineSamples.length > 0
                        ? baselineSamples.reduce((sum, value) => sum + value, 0) /
                        baselineSamples.length
                        : 0);
                const orientation = getPoseFromYaw(yawOffset, baselineValue);

                if (orientation === 'unknown' || orientation !== expectedOrientation) {
                    poseStreak = 0;
                    if (isRunning) {
                        setTimeout(checkFrame, 200);
                    }
                    return;
                }

                poseStreak += 1;
                if (poseStreak < requiredStreak) {
                    if (isRunning) {
                        setTimeout(checkFrame, 200);
                    }
                    return;
                }

                setFlashEffect(true);
                await new Promise((resolve) => setTimeout(resolve, 250));

                const fileName =
                    currentState === 'straight'
                        ? 'profile_front.jpg'
                        : currentState === 'left'
                            ? 'profile_left.jpg'
                            : 'profile_right.jpg';
                const file = await captureFrame(fileName);
                setFlashEffect(false);

                if (!file) {
                    stopDetection('Gagal mengambil foto. Silakan coba lagi.');
                    return;
                }

                if (currentState === 'straight') {
                    setData('foto', file);
                    moveToNextStep('left');
                    if (isRunning) {
                        setTimeout(checkFrame, 200);
                    }
                    return;
                }

                if (currentState === 'left') {
                    setData('foto_left', file);
                    moveToNextStep('right');
                    if (isRunning) {
                        setTimeout(checkFrame, 200);
                    }
                    return;
                }

                setData('foto_right', file);
                setCaptureStep('done');

                clearTimeout(timeoutTimer);

                if (videoRef.current && overlayRef.current) {
                    const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
                    const resizedResult = faceapi.resizeResults(result, displaySize);
                    const drawBox = new faceapi.draw.DrawBox(resizedResult.detection.box, { lineWidth: 3, boxColor: '#22c55e' });
                    drawBox.draw(overlayRef.current);
                }

                toast.success('Wajah terdaftar (3 pose).', { id: 'liveness' });

                stopCamera();
                stopDetection();
                return;
            } catch (err) {
                console.error("Frame check error:", err);
                if (isRunning) {
                    setTimeout(checkFrame, 500);
                }
            }
        };

        checkFrame();
    }, [captureFrame, getPoseFromYaw, getYawOffset, modelsLoaded, setData, stopCamera]);

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();

        if (!captureComplete) {
            toast.error('Ambil 3 pose wajah (lurus, kiri, kanan) terlebih dahulu.');
            return;
        }

        post('/intern/setup-profile', {
            onSuccess: () => {
                toast.success('Profil berhasil dibuat!');
            },
        });
    };

    return (
        <MobileLayout title="Setup Profil" showBottomNav={false}>
            <Toaster position="top-center" />
            <div className="mb-4">
                <h1 className="mb-1 text-xl font-bold text-gray-900 dark:text-slate-100">
                    Setup Profil Anda
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                    Satu langkah lagi! Lengkapi profil dan ambil foto wajah untuk keperluan absensi.
                </p>
            </div>

            <form onSubmit={submitProfile} className="space-y-5 pb-8">
                {/* Face Verification Section */}
                <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                Foto Wajah (Wajib)
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                {!modelsLoaded && modelLoadProgress
                                    ? modelLoadProgress
                                    : modelsLoaded
                                        ? captureComplete
                                            ? '3 pose wajah tersimpan.'
                                            : `Langkah ${Math.min(captureCount + 1, 3)}/3: Pose ${captureStepLabel}`
                                        : 'Menunggu model AI...'}
                            </p>
                        </div>
                        {!stream && !captureComplete && (
                            <button
                            type="button"
                            onClick={() => startCamera()}
                            disabled={!modelsLoaded}
                            className="rounded-lg bg-[#f3effd] dark:bg-[#a488ea]/10 px-3 py-1.5 text-sm font-medium text-[#a488ea] dark:text-[#b49ef5] transition-colors hover:bg-[#e8e0fc] dark:hover:bg-[#a488ea]/20 disabled:opacity-50"
                        >
                            Buka Kamera
                        </button>
                        )}
                    </div>

                    {/* Camera View */}
                    {stream && !captureComplete && (
                        <div className="relative w-full overflow-hidden rounded-lg bg-black aspect-[4/3] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full object-cover [transform:scaleX(-1)]"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            <canvas
                                ref={overlayRef}
                                className="absolute inset-0 h-full w-full object-cover pointer-events-none [transform:scaleX(-1)]"
                                style={{ transform: 'scaleX(-1)' }}
                            />

                            {/* Cahaya Splash Overlay */}
                            <div className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-200 ${flashEffect ? 'opacity-90' : 'opacity-0'}`} />

                            {/* Light booster for dark environments */}
                            <div className="pointer-events-none absolute inset-0 ring-4 ring-white/20 ring-inset rounded-lg" />

                            {/* Camera Selector Dropdown */}
                            {cameras.length > 0 && (
                                <div className="absolute top-2 right-2 left-2 z-10">
                                    <select
                                        value={selectedCameraId}
                                        onChange={handleCameraChange}
                                        className="w-full rounded-lg border-none bg-black/50 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm focus:ring-2 focus:ring-white/50 appearance-none"
                                    >
                                        {cameras.map((cam, idx) => (
                                            <option key={cam.deviceId} value={cam.deviceId} className="text-gray-900 dark:text-white dark:bg-slate-800">
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
                                    className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#a488ea] shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                                >
                                    {isDetecting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Camera className="h-5 w-5" />
                                    )}
                                    Ambil Foto
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Success state */}
                    {captureComplete && (
                        <div className="flex items-center gap-3 rounded-lg border border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-950/20 p-3">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Foto Tersimpan
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400/80">
                                    3 pose wajah siap digunakan untuk absensi.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setData('foto', null);
                                    setData('foto_left', null);
                                    setData('foto_right', null);
                                    setCaptureStep('straight');
                                    startCamera();
                                }}
                                className="text-xs font-medium text-green-700 dark:text-green-400 underline"
                            >
                                Ganti Foto
                            </button>
                        </div>
                    )}
                    {!captureComplete && captureCount > 0 && (
                        <div className="mt-3 rounded-lg border border-yellow-200 dark:border-yellow-800/40 bg-yellow-50 dark:bg-yellow-950/20 p-3 text-xs text-yellow-700 dark:text-yellow-400">
                            {`Progress: ${captureCount}/3 pose tersimpan. Pastikan menyelesaikan sampai kanan.`}
                        </div>
                    )}
                    {errors.foto && (
                        <p className="mt-2 text-xs text-red-500">
                            {errors.foto}
                        </p>
                    )}
                    {errors.foto_left && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.foto_left}
                        </p>
                    )}
                    {errors.foto_right && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.foto_right}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                        Nama Lengkap (Wajib)
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-3 shadow-sm focus:border-[#a488ea] focus:ring-[#a488ea]"
                        placeholder="Masukkan nama lengkap Anda"
                    />
                    {errors.name && (
                        <p className="mt-1 text-xs text-rose-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                        Asal Kampus / Sekolah
                    </label>
                    <input
                        type="text"
                        value={data.asal_kampus}
                        onChange={(e) => setData('asal_kampus', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-3 shadow-sm focus:border-[#a488ea] focus:ring-[#a488ea]"
                        placeholder="Universitas / SMK asal"
                    />
                    {errors.asal_kampus && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.asal_kampus}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                        Divisi Penempatan (Wajib)
                    </label>
                    <select
                        value={data.division_id}
                        onChange={(e) => setData('division_id', e.target.value)}
                        required
                        className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-3 shadow-sm focus:border-[#a488ea] focus:ring-[#a488ea]"
                    >
                        <option value="" className="text-gray-900 dark:text-slate-400 dark:bg-slate-800">Pilih Divisi...</option>
                        {divisions.map((d) => (
                            <option key={d.id} value={d.id} className="text-gray-900 dark:text-slate-100 dark:bg-slate-800">
                                Divisi {d.name}
                            </option>
                        ))}
                    </select>
                    {errors.division_id && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.division_id}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                        Durasi Magang (Hari)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="365"
                        value={data.internship_duration_days}
                        onChange={(e) => setData('internship_duration_days', parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-3 shadow-sm focus:border-[#a488ea] focus:ring-[#a488ea]"
                        placeholder="Contoh: 90"
                    />
                    {errors.internship_duration_days && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.internship_duration_days}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="btn-brand mt-6 flex w-full items-center justify-center gap-2 py-4 font-semibold"
                >
                    {processing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : null}
                    Simpan Profil
                </button>
            </form>
        </MobileLayout>
    );
}
