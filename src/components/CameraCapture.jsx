import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Camera, X, RotateCcw, Check, Trash2 } from 'lucide-react';

export const CameraCapture = ({ onPhotosChange, photos = [], maxPhotos = 10 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back camera
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    }, [facingMode]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const openCamera = async () => {
        setIsOpen(true);
        setCapturedPhoto(null);
        setTimeout(() => {
            startCamera();
        }, 100);
    };

    const closeCamera = () => {
        stopCamera();
        setCapturedPhoto(null);
        setIsOpen(false);
    };

    const switchCamera = async () => {
        stopCamera();
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
        setTimeout(() => {
            startCamera();
        }, 100);
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            const photoData = canvas.toDataURL('image/jpeg', 0.7);
            setCapturedPhoto(photoData);
            stopCamera();
        }
    };

    const retakePhoto = () => {
        setCapturedPhoto(null);
        startCamera();
    };

    const confirmPhoto = () => {
        if (capturedPhoto && photos.length < maxPhotos) {
            const newPhotos = [...photos, capturedPhoto];
            onPhotosChange(newPhotos);
            setCapturedPhoto(null);
            
            // Continue taking photos or close
            if (newPhotos.length < maxPhotos) {
                startCamera();
            } else {
                closeCamera();
            }
        }
    };

    const removePhoto = (index) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        onPhotosChange(newPhotos);
    };

    return (
        <div className="space-y-3">
            {/* Photo Grid */}
            {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img 
                                src={photo} 
                                alt={`Foto ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                {index + 1}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Camera Button */}
            <Button
                type="button"
                variant="outline"
                onClick={openCamera}
                disabled={photos.length >= maxPhotos}
                className="w-full"
                data-testid="open-camera-btn"
            >
                <Camera className="w-4 h-4 mr-2" />
                {photos.length === 0 
                    ? 'Tomar Fotos' 
                    : `Agregar Foto (${photos.length}/${maxPhotos})`
                }
            </Button>

            {/* Camera Dialog */}
            <Dialog open={isOpen} onOpenChange={(open) => !open && closeCamera()}>
                <DialogContent className="max-w-lg p-0 overflow-hidden">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="font-heading text-lg flex items-center gap-2">
                            <Camera className="w-5 h-5 text-primary" />
                            Capturar Foto ({photos.length + 1}/{maxPhotos})
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="relative bg-black aspect-video">
                        {!capturedPhoto ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img 
                                src={capturedPhoto} 
                                alt="Foto capturada"
                                className="w-full h-full object-cover"
                            />
                        )}
                        
                        {/* Hidden canvas for capture */}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Controls */}
                    <div className="p-4 flex items-center justify-center gap-4">
                        {!capturedPhoto ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={switchCamera}
                                    data-testid="switch-camera-btn"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="w-16 h-16 rounded-full"
                                    onClick={takePhoto}
                                    data-testid="capture-btn"
                                >
                                    <Camera className="w-8 h-8" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={closeCamera}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={retakePhoto}
                                    data-testid="retake-btn"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Repetir
                                </Button>
                                <Button
                                    type="button"
                                    onClick={confirmPhoto}
                                    className="brand-glow"
                                    data-testid="confirm-photo-btn"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Guardar
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
