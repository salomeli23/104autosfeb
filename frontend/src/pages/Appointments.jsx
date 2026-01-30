import React, { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { StatusBadge } from '../components/StatusBadge';
import { ServiceBadge } from '../components/ServiceBadge';
import { TIME_SLOTS, SERVICE_LABELS } from '../lib/utils';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, Clock, User, Car } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SERVICES = Object.entries(SERVICE_LABELS).map(([value, label]) => ({ value, label }));

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

export const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [availableModels, setAvailableModels] = useState([]);
    const [formData, setFormData] = useState({
        client_name: '',
        client_phone: '',
        client_email: '',
        plate: '',
        brand: '',
        model: '',
        date: '',
        time_slot: '',
        services: [],
        notes: '',
    });

    const fetchAppointments = useCallback(async (date) => {
        try {
            setLoading(true);
            const dateStr = format(date, 'yyyy-MM-dd');
            const response = await appointmentsAPI.getAll(dateStr);
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments(selectedDate);
    }, [selectedDate, fetchAppointments]);

    // Update available models when brand changes
    useEffect(() => {
        if (formData.brand && CAR_MODELS[formData.brand]) {
            setAvailableModels(CAR_MODELS[formData.brand]);
        } else {
            setAvailableModels([]);
        }
    }, [formData.brand]);

    const handleDateSelect = (date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleBrandChange = (value) => {
        setFormData(prev => ({ ...prev, brand: value, model: '' }));
    };

    const handleModelChange = (value) => {
        setFormData(prev => ({ ...prev, model: value }));
    };

    const handleTimeSlotChange = (value) => {
        setFormData(prev => ({ ...prev, time_slot: value }));
    };

    const handleServiceToggle = (service) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.services.length === 0) {
            toast.error('Selecciona al menos un servicio');
            return;
        }

        if (!formData.time_slot) {
            toast.error('Selecciona una franja horaria');
            return;
        }

        try {
            const submitData = {
                ...formData,
                date: format(selectedDate, 'yyyy-MM-dd'),
            };
            await appointmentsAPI.create(submitData);
            toast.success('Cita agendada exitosamente');
            setDialogOpen(false);
            fetchAppointments(selectedDate);
            setFormData({
                client_name: '',
                client_phone: '',
                client_email: '',
                plate: '',
                brand: '',
                model: '',
                date: '',
                time_slot: '',
                services: [],
                notes: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al agendar cita');
        }
    };

    // Group appointments by time slot
    const appointmentsBySlot = TIME_SLOTS.reduce((acc, slot) => {
        acc[slot] = appointments.filter(a => a.time_slot === slot);
        return acc;
    }, {});

    return (
        <div className="space-y-6" data-testid="appointments-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl md:text-4xl">Agendamiento</h1>
                    <p className="text-muted-foreground">
                        Gestiona las citas del taller
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="brand-glow touch-target" data-testid="new-appointment-btn">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Cita
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl">Agendar Nueva Cita</DialogTitle>
                            <DialogDescription>Complete los datos del cliente y vehículo para agendar una cita</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Client Info */}
                            <div className="space-y-4">
                                <h3 className="font-heading text-lg flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Datos del Cliente
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="client_name">Nombre *</Label>
                                        <Input
                                            id="client_name"
                                            value={formData.client_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                                            required
                                            data-testid="appointment-client-name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client_phone">Teléfono *</Label>
                                        <Input
                                            id="client_phone"
                                            value={formData.client_phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                                            required
                                            data-testid="appointment-client-phone"
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
                                        data-testid="appointment-client-email"
                                    />
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div className="space-y-4">
                                <h3 className="font-heading text-lg flex items-center gap-2">
                                    <Car className="w-4 h-4" />
                                    Datos del Vehículo
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="plate">Placa</Label>
                                    <Input
                                        id="plate"
                                        value={formData.plate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                                        className="font-mono"
                                        placeholder="ABC123"
                                        data-testid="appointment-plate"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Marca</Label>
                                        <Select value={formData.brand} onValueChange={handleBrandChange}>
                                            <SelectTrigger data-testid="appointment-brand">
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
                                        <Label>Modelo</Label>
                                        <Select 
                                            value={formData.model} 
                                            onValueChange={handleModelChange}
                                            disabled={!formData.brand}
                                        >
                                            <SelectTrigger data-testid="appointment-model">
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
                            </div>

                            {/* Time Slot */}
                            <div className="space-y-2">
                                <Label>Franja Horaria *</Label>
                                <Select value={formData.time_slot} onValueChange={handleTimeSlotChange}>
                                    <SelectTrigger data-testid="appointment-time-slot">
                                        <SelectValue placeholder="Selecciona un horario" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_SLOTS.map((slot) => (
                                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Services */}
                            <div className="space-y-2">
                                <Label>Servicios *</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SERVICES.map((service) => (
                                        <div
                                            key={service.value}
                                            className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                                        >
                                            <Checkbox
                                                id={`service-${service.value}`}
                                                checked={formData.services.includes(service.value)}
                                                onCheckedChange={() => handleServiceToggle(service.value)}
                                                data-testid={`service-checkbox-${service.value}`}
                                            />
                                            <label 
                                                htmlFor={`service-${service.value}`} 
                                                className="text-sm cursor-pointer flex-1"
                                            >
                                                {service.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Observaciones adicionales..."
                                    data-testid="appointment-notes"
                                />
                            </div>

                            <Button type="submit" className="w-full brand-glow" data-testid="submit-appointment-btn">
                                Agendar Cita
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Calendar and Schedule */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="card-hover">
                    <CardHeader>
                        <CardTitle className="font-heading text-lg flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Calendario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            locale={es}
                            className="rounded-md border"
                            data-testid="appointment-calendar"
                        />
                    </CardContent>
                </Card>

                {/* Schedule */}
                <Card className="lg:col-span-2 card-hover">
                    <CardHeader>
                        <CardTitle className="font-heading text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {TIME_SLOTS.map((slot) => {
                                    const slotAppointments = appointmentsBySlot[slot] || [];
                                    return (
                                        <div 
                                            key={slot}
                                            className="flex gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            data-testid={`time-slot-${slot.replace(/[:\s-]/g, '')}`}
                                        >
                                            <div className="w-24 shrink-0">
                                                <p className="font-mono text-sm font-medium">{slot}</p>
                                            </div>
                                            <div className="flex-1">
                                                {slotAppointments.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">Disponible</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {slotAppointments.map((appointment) => (
                                                            <div 
                                                                key={appointment.id}
                                                                className="flex items-center justify-between p-2 rounded bg-card border"
                                                            >
                                                                <div>
                                                                    <p className="font-medium">{appointment.client_name}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {appointment.plate && <span className="font-mono">{appointment.plate}</span>}
                                                                        {appointment.brand && ` - ${appointment.brand}`}
                                                                        {appointment.model && ` ${appointment.model}`}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex gap-1">
                                                                        {appointment.services.slice(0, 2).map((s) => (
                                                                            <ServiceBadge key={s} service={s} />
                                                                        ))}
                                                                    </div>
                                                                    <StatusBadge status={appointment.status} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
