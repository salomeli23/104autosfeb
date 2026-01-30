import React, { useState, useEffect } from 'react';
import { inspectionsAPI, vehiclesAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { INSPECTION_AREAS, formatDateTime } from '../lib/utils';
import { toast } from 'sonner';
import { Plus, ClipboardCheck, Search, Car, AlertTriangle, Check, Camera } from 'lucide-react';

const CONDITIONS = [
    { value: 'excellent', label: 'Excelente', color: 'text-green-500' },
    { value: 'good', label: 'Bueno', color: 'text-blue-500' },
    { value: 'fair', label: 'Regular', color: 'text-yellow-500' },
    { value: 'poor', label: 'Malo', color: 'text-red-500' },
];

export const Inspections = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [step, setStep] = useState(1);
    const [inspectionItems, setInspectionItems] = useState(
        INSPECTION_AREAS.map(area => ({
            area: area.id,
            areaName: area.name,
            condition: 'good',
            notes: '',
            has_damage: false,
        }))
    );
    const [generalNotes, setGeneralNotes] = useState('');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await vehiclesAPI.getAll();
                setVehicles(response.data);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    const handleItemChange = (index, field, value) => {
        setInspectionItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!selectedVehicle) {
            toast.error('Selecciona un vehículo');
            return;
        }

        try {
            await inspectionsAPI.create({
                vehicle_id: selectedVehicle.id,
                items: inspectionItems.map(item => ({
                    area: item.area,
                    condition: item.condition,
                    notes: item.notes,
                    has_damage: item.has_damage,
                })),
                general_notes: generalNotes,
                photos: [],
            });
            toast.success('Revisión 360° completada exitosamente');
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al guardar la revisión');
        }
    };

    const resetForm = () => {
        setSelectedVehicle(null);
        setStep(1);
        setInspectionItems(
            INSPECTION_AREAS.map(area => ({
                area: area.id,
                areaName: area.name,
                condition: 'good',
                notes: '',
                has_damage: false,
            }))
        );
        setGeneralNotes('');
    };

    const damageCount = inspectionItems.filter(item => item.has_damage).length;

    return (
        <div className="space-y-6" data-testid="inspections-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl md:text-4xl">Revisión 360°</h1>
                    <p className="text-muted-foreground">
                        Registro detallado del estado del vehículo
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="brand-glow touch-target" data-testid="new-inspection-btn">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Revisión
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl">
                                Revisión 360° - Paso {step} de 2
                            </DialogTitle>
                        </DialogHeader>

                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Seleccionar Vehículo *</Label>
                                    <Select
                                        value={selectedVehicle?.id}
                                        onValueChange={(value) => {
                                            const vehicle = vehicles.find(v => v.id === value);
                                            setSelectedVehicle(vehicle);
                                        }}
                                    >
                                        <SelectTrigger data-testid="inspection-vehicle-select">
                                            <SelectValue placeholder="Buscar vehículo por placa..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map((vehicle) => (
                                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono">{vehicle.plate}</span>
                                                        <span className="text-muted-foreground">
                                                            - {vehicle.brand} {vehicle.model}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedVehicle && (
                                    <Card className="bg-muted/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <Car className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-mono font-bold">{selectedVehicle.plate}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year} - {selectedVehicle.color}
                                                    </p>
                                                    <p className="text-sm">{selectedVehicle.client_name}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!selectedVehicle}
                                    className="w-full"
                                    data-testid="inspection-next-btn"
                                >
                                    Continuar con Inspección
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                {/* Summary */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <Car className="w-5 h-5 text-primary" />
                                        <span className="font-mono">{selectedVehicle?.plate}</span>
                                    </div>
                                    {damageCount > 0 && (
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-sm">{damageCount} daños reportados</span>
                                        </div>
                                    )}
                                </div>

                                {/* Inspection Checklist */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {inspectionItems.map((item, index) => (
                                        <Card 
                                            key={item.area} 
                                            className={`${item.has_damage ? 'border-yellow-500/50' : ''}`}
                                            data-testid={`inspection-item-${item.area}`}
                                        >
                                            <CardContent className="p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{item.areaName}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`damage-${item.area}`}
                                                            checked={item.has_damage}
                                                            onCheckedChange={(checked) => handleItemChange(index, 'has_damage', checked)}
                                                        />
                                                        <Label htmlFor={`damage-${item.area}`} className="text-sm text-yellow-500 cursor-pointer">
                                                            Daño
                                                        </Label>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {CONDITIONS.map((condition) => (
                                                        <Button
                                                            key={condition.value}
                                                            type="button"
                                                            size="sm"
                                                            variant={item.condition === condition.value ? 'default' : 'outline'}
                                                            className={`text-xs ${item.condition === condition.value ? '' : condition.color}`}
                                                            onClick={() => handleItemChange(index, 'condition', condition.value)}
                                                        >
                                                            {condition.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                                {item.has_damage && (
                                                    <Input
                                                        placeholder="Describe el daño..."
                                                        value={item.notes}
                                                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                                        className="text-sm"
                                                    />
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* General Notes */}
                                <div className="space-y-2">
                                    <Label>Observaciones Generales</Label>
                                    <Textarea
                                        value={generalNotes}
                                        onChange={(e) => setGeneralNotes(e.target.value)}
                                        placeholder="Notas adicionales sobre el estado del vehículo..."
                                        data-testid="inspection-general-notes"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1"
                                    >
                                        Atrás
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        className="flex-1 brand-glow"
                                        data-testid="inspection-submit-btn"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Guardar Revisión
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Info Card */}
            <Card className="card-hover bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                            <ClipboardCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-heading text-lg mb-1">Revisión 360° del Vehículo</h3>
                            <p className="text-sm text-muted-foreground">
                                Documenta el estado completo del vehículo al momento del ingreso. 
                                Registra cualquier daño existente para proteger tanto al cliente como al taller.
                                Incluye {INSPECTION_AREAS.length} áreas de inspección.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicle List for Quick Inspection */}
            <Card className="card-hover">
                <CardHeader>
                    <CardTitle className="font-heading text-lg">Vehículos Registrados</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No hay vehículos registrados</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {vehicles.slice(0, 6).map((vehicle) => (
                                <div
                                    key={vehicle.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                    onClick={() => {
                                        setSelectedVehicle(vehicle);
                                        setDialogOpen(true);
                                    }}
                                    data-testid={`vehicle-quick-${vehicle.id}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Car className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="font-mono font-medium">{vehicle.plate}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {vehicle.brand} {vehicle.model}
                                            </p>
                                        </div>
                                    </div>
                                    <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
