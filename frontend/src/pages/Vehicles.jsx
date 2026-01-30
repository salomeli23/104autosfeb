import React, { useState, useEffect, useCallback } from 'react';
import { vehiclesAPI } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Car, Search, User, Phone, Mail } from 'lucide-react';

// Lista de marcas y modelos populares en Colombia
const CAR_BRANDS = [
    'Chevrolet',
    'Renault',
    'Mazda',
    'Kia',
    'Nissan',
    'Toyota',
    'Hyundai',
    'Ford',
    'Volkswagen',
    'Suzuki',
    'Honda',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Jeep',
    'Mitsubishi',
    'Peugeot',
    'Citroën',
    'Fiat',
    'Otro'
];

const CAR_MODELS = {
    'Chevrolet': ['Spark', 'Sail', 'Onix', 'Tracker', 'Captiva', 'Equinox', 'Blazer', 'Tahoe', 'Trailblazer', 'N300', 'N400', 'Otro'],
    'Renault': ['Kwid', 'Sandero', 'Stepway', 'Logan', 'Duster', 'Koleos', 'Captur', 'Oroch', 'Kangoo', 'Master', 'Otro'],
    'Mazda': ['Mazda 2', 'Mazda 3', 'Mazda 6', 'CX-3', 'CX-30', 'CX-5', 'CX-9', 'MX-5', 'BT-50', 'Otro'],
    'Kia': ['Picanto', 'Rio', 'Cerato', 'K5', 'Soul', 'Seltos', 'Sportage', 'Sorento', 'Carnival', 'Stinger', 'Otro'],
    'Nissan': ['March', 'Versa', 'Sentra', 'Kicks', 'Qashqai', 'X-Trail', 'Pathfinder', 'Frontier', 'NP300', 'Otro'],
    'Toyota': ['Yaris', 'Corolla', 'Camry', 'Prius', 'C-HR', 'RAV4', 'Fortuner', 'Land Cruiser', 'Hilux', '4Runner', 'Otro'],
    'Hyundai': ['Grand i10', 'Accent', 'Elantra', 'Sonata', 'Venue', 'Kona', 'Tucson', 'Santa Fe', 'Palisade', 'Creta', 'Otro'],
    'Ford': ['Fiesta', 'Focus', 'Fusion', 'Mustang', 'EcoSport', 'Escape', 'Explorer', 'Expedition', 'Ranger', 'F-150', 'Otro'],
    'Volkswagen': ['Gol', 'Polo', 'Virtus', 'Jetta', 'Passat', 'T-Cross', 'Taos', 'Tiguan', 'Touareg', 'Amarok', 'Otro'],
    'Suzuki': ['Alto', 'Swift', 'Baleno', 'Ciaz', 'S-Presso', 'Vitara', 'Grand Vitara', 'Jimny', 'XL7', 'Otro'],
    'Honda': ['Brio', 'City', 'Civic', 'Accord', 'HR-V', 'CR-V', 'Pilot', 'Passport', 'Odyssey', 'Otro'],
    'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X3', 'X5', 'X7', 'Otro'],
    'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'Clase S', 'GLA', 'GLC', 'GLE', 'GLS', 'Sprinter', 'Otro'],
    'Audi': ['A1', 'A3', 'A4', 'A6', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'Otro'],
    'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Otro'],
    'Mitsubishi': ['Mirage', 'Lancer', 'ASX', 'Outlander', 'Eclipse Cross', 'Montero', 'L200', 'Otro'],
    'Peugeot': ['208', '301', '308', '408', '508', '2008', '3008', '5008', 'Partner', 'Otro'],
    'Citroën': ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'Jumpy', 'Otro'],
    'Fiat': ['Mobi', 'Argo', 'Cronos', 'Tipo', '500', 'Toro', 'Ducato', 'Otro'],
    'Otro': ['Especificar en notas']
};

const COLORS = [
    'Blanco',
    'Negro',
    'Gris',
    'Plata',
    'Rojo',
    'Azul',
    'Verde',
    'Amarillo',
    'Naranja',
    'Café',
    'Beige',
    'Otro'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

export const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [availableModels, setAvailableModels] = useState([]);
    const [formData, setFormData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: CURRENT_YEAR.toString(),
        color: '',
        vin: '',
        client_name: '',
        client_phone: '',
        client_email: '',
        client_cedula: '',
    });

    const fetchVehicles = useCallback(async () => {
        try {
            const response = await vehiclesAPI.getAll();
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Update available models when brand changes
    useEffect(() => {
        if (formData.brand && CAR_MODELS[formData.brand]) {
            setAvailableModels(CAR_MODELS[formData.brand]);
        } else {
            setAvailableModels([]);
        }
    }, [formData.brand]);

    const handleBrandChange = (value) => {
        setFormData(prev => ({ ...prev, brand: value, model: '' }));
    };

    const handleModelChange = (value) => {
        setFormData(prev => ({ ...prev, model: value }));
    };

    const handleYearChange = (value) => {
        setFormData(prev => ({ ...prev, year: value }));
    };

    const handleColorChange = (value) => {
        setFormData(prev => ({ ...prev, color: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.brand || !formData.model || !formData.color) {
            toast.error('Completa todos los campos del vehículo');
            return;
        }

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
                year: CURRENT_YEAR.toString(),
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
                                            onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                                            required
                                            className="font-mono"
                                            placeholder="ABC123"
                                            data-testid="vehicle-plate"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Año *</Label>
                                        <Select value={formData.year} onValueChange={handleYearChange}>
                                            <SelectTrigger data-testid="vehicle-year">
                                                <SelectValue placeholder="Año" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {YEARS.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Marca *</Label>
                                        <Select value={formData.brand} onValueChange={handleBrandChange}>
                                            <SelectTrigger data-testid="vehicle-brand">
                                                <SelectValue placeholder="Seleccionar marca" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CAR_BRANDS.map((brand) => (
                                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Modelo *</Label>
                                        <Select 
                                            value={formData.model} 
                                            onValueChange={handleModelChange}
                                            disabled={!formData.brand}
                                        >
                                            <SelectTrigger data-testid="vehicle-model">
                                                <SelectValue placeholder={formData.brand ? "Seleccionar modelo" : "Primero seleccione marca"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableModels.map((model) => (
                                                    <SelectItem key={model} value={model}>{model}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Color *</Label>
                                        <Select value={formData.color} onValueChange={handleColorChange}>
                                            <SelectTrigger data-testid="vehicle-color">
                                                <SelectValue placeholder="Seleccionar color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COLORS.map((color) => (
                                                    <SelectItem key={color} value={color}>{color}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vin">VIN</Label>
                                        <Input
                                            id="vin"
                                            value={formData.vin}
                                            onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
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
                                            onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                                            required
                                            data-testid="vehicle-client-phone"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client_cedula">Cédula</Label>
                                        <Input
                                            id="client_cedula"
                                            value={formData.client_cedula}
                                            onChange={(e) => setFormData(prev => ({ ...prev, client_cedula: e.target.value }))}
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
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
