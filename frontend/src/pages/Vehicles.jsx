import React, { useState, useEffect } from 'react';
import { vehiclesAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { formatDateTime } from '../lib/utils';
import { toast } from 'sonner';
import { Plus, Car, Search, User, Phone, Mail, CreditCard } from 'lucide-react';

export const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        vin: '',
        client_name: '',
        client_phone: '',
        client_email: '',
        client_cedula: '',
    });

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

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await vehiclesAPI.create({
                ...formData,
                plate: formData.plate.toUpperCase(),
                year: parseInt(formData.year),
            });
            toast.success('Vehículo registrado exitosamente');
            setDialogOpen(false);
            fetchVehicles();
            setFormData({
                plate: '',
                brand: '',
                model: '',
                year: new Date().getFullYear(),
                color: '',
                vin: '',
                client_name: '',
                client_phone: '',
                client_email: '',
                client_cedula: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al registrar vehículo');
        }
    };

    const filteredVehicles = vehicles.filter(v => 
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6" data-testid="vehicles-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl md:text-4xl">Vehículos</h1>
                    <p className="text-muted-foreground">
                        Registro e ingreso de vehículos al taller
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="brand-glow touch-target" data-testid="new-vehicle-btn">
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Vehículo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl">Registrar Vehículo</DialogTitle>
                            <DialogDescription>Ingrese los datos del vehículo y del cliente propietario</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Vehicle Info */}
                            <div className="space-y-4">
                                <h3 className="font-heading text-lg flex items-center gap-2">
                                    <Car className="w-4 h-4" />
                                    Datos del Vehículo
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="plate">Placa *</Label>
                                        <Input
                                            id="plate"
                                            value={formData.plate}
                                            onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                                            required
                                            className="font-mono"
                                            placeholder="ABC123"
                                            data-testid="vehicle-plate"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Marca *</Label>
                                        <Input
                                            id="brand"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            required
                                            placeholder="Toyota"
                                            data-testid="vehicle-brand"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Modelo *</Label>
                                        <Input
                                            id="model"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            required
                                            placeholder="Corolla"
                                            data-testid="vehicle-model"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Año *</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            required
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            data-testid="vehicle-year"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="color">Color *</Label>
                                        <Input
                                            id="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            required
                                            placeholder="Blanco"
                                            data-testid="vehicle-color"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vin">VIN</Label>
                                        <Input
                                            id="vin"
                                            value={formData.vin}
                                            onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                                            className="font-mono"
                                            placeholder="Opcional"
                                            data-testid="vehicle-vin"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="space-y-4">
                                <h3 className="font-heading text-lg flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Datos del Cliente
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="client_name">Nombre Completo *</Label>
                                    <Input
                                        id="client_name"
                                        value={formData.client_name}
                                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                        required
                                        data-testid="vehicle-client-name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="client_phone">Teléfono *</Label>
                                        <Input
                                            id="client_phone"
                                            value={formData.client_phone}
                                            onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                                            required
                                            data-testid="vehicle-client-phone"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client_cedula">Cédula</Label>
                                        <Input
                                            id="client_cedula"
                                            value={formData.client_cedula}
                                            onChange={(e) => setFormData({ ...formData, client_cedula: e.target.value })}
                                            data-testid="vehicle-client-cedula"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="client_email">Email</Label>
                                    <Input
                                        id="client_email"
                                        type="email"
                                        value={formData.client_email}
                                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                        data-testid="vehicle-client-email"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full brand-glow" data-testid="submit-vehicle-btn">
                                Registrar Vehículo
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por placa, cliente o marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="vehicle-search"
                />
            </div>

            {/* Vehicles Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Car className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg">No hay vehículos registrados</p>
                    <p className="text-sm">Registra el primer vehículo para comenzar</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="card-hover" data-testid={`vehicle-card-${vehicle.id}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                            <Car className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold text-lg">{vehicle.plate}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {vehicle.brand} {vehicle.model} {vehicle.year}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded bg-muted text-xs">
                                        {vehicle.color}
                                    </span>
                                </div>
                                <div className="space-y-2 pt-3 border-t">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span>{vehicle.client_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span>{vehicle.client_phone}</span>
                                    </div>
                                    {vehicle.client_email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <span className="truncate">{vehicle.client_email}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
