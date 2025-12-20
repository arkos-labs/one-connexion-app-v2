import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
    onCapture: (imageData: string) => void;
    onCancel: () => void;
}

export const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Démarrer la caméra
    const startCamera = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Demander l'accès à la caméra arrière
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' }, // Caméra arrière préférée
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }

            setStream(mediaStream);
            setIsLoading(false);
        } catch (err) {
            console.error('Erreur d\'accès à la caméra:', err);
            setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
            setIsLoading(false);
            toast.error('Erreur d\'accès à la caméra', {
                description: 'Vérifiez que vous avez autorisé l\'accès à la caméra.'
            });
        }
    }, []);

    // Arrêter la caméra
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    // Prendre une photo
    const takePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Définir les dimensions du canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dessiner l'image de la vidéo sur le canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir en base64
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();

        toast.success('Photo capturée !');
    }, [stopCamera]);

    // Reprendre une photo
    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        startCamera();
    }, [startCamera]);

    // Valider la photo
    const confirmPhoto = useCallback(() => {
        if (capturedImage) {
            onCapture(capturedImage);
            stopCamera();
        }
    }, [capturedImage, onCapture, stopCamera]);

    // Annuler
    const handleCancel = useCallback(() => {
        stopCamera();
        onCancel();
    }, [stopCamera, onCancel]);

    // Démarrer la caméra au montage
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    if (error) {
        return (
            <div className="space-y-4">
                <div className="aspect-[4/3] bg-red-50 rounded-xl flex items-center justify-center p-6 text-center">
                    <div>
                        <X className="h-12 w-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-700 font-semibold mb-2">Erreur d'accès à la caméra</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
                <Button onClick={handleCancel} variant="outline" className="w-full">
                    <X className="h-4 w-4 mr-2" /> Retour
                </Button>
            </div>
        );
    }

    if (capturedImage) {
        return (
            <div className="space-y-4 animate-in fade-in">
                <div className="aspect-[4/3] rounded-xl overflow-hidden border relative">
                    <img src={capturedImage} alt="Photo capturée" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-2 text-center flex items-center justify-center gap-2">
                        <Camera className="h-4 w-4" /> Photo capturée
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={retakePhoto} className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" /> Reprendre
                    </Button>
                    <Button onClick={confirmPhoto} className="flex-1 bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4 mr-2" /> Valider la preuve
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="aspect-[4/3] bg-black rounded-xl relative overflow-hidden">
                {/* Vidéo de la caméra */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Canvas caché pour la capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Viseur */}
                <div className="absolute inset-8 border-2 border-white/30 rounded-lg pointer-events-none" />

                {/* Indicateur de chargement */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <RefreshCw className="h-12 w-12 text-white animate-spin" />
                    </div>
                )}

                {/* Bouton de capture */}
                {!isLoading && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <Button
                            size="icon"
                            onClick={takePhoto}
                            className="h-16 w-16 rounded-full bg-white hover:bg-zinc-200 border-4 border-zinc-300"
                        >
                            <Camera className="h-8 w-8 text-black" />
                        </Button>
                    </div>
                )}

                <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full">
                    Caméra en direct
                </p>
            </div>

            <Button onClick={handleCancel} variant="outline" className="w-full">
                <X className="h-4 w-4 mr-2" /> Annuler
            </Button>
        </div>
    );
};
