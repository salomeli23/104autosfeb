import React, { useState, useEffect } from 'react';
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
import { TIME_SLOTS, SERVICE_LABELS, formatDate } from '../lib/utils';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, Clock, User, Phone, Mail, Car } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SERVICES = Object.entries(SERVICE_LABELS).map(([value, label]) => ({ value, label }));

export const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dialogOpen, setDialogOpen] = useState(false);
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

    const fetchAppointments = async (date) => {
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const response = await appointmentsAPI.getAll(dateStr);
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const handleDateSelect = (date) => {
        if (date) {
            setSelectedDate(date);
        }
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
                                            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                            required
                                            data-testid="appointment-client-name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client_phone">Teléfono *</Label>
                                        <Input
                                            id="client_phone"
                                            value={formData.client_phone}
                                            onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
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
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="plate">Placa</Label>
                                        <Input
                                            id="plate"
                                            value={formData.plate}
                                            onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                                            className="font-mono"
                                            data-testid="appointment-plate"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Marca</Label>
                                        <Input
                                            id="brand"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            data-testid="appointment-brand"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Modelo</Label>
                                        <Input
                                            id="model"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            data-testid="appointment-model"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Time Slot */}
                            <div className="space-y-2">
                                <Label>Franja Horaria *</Label>
                                <Select
                                    value={formData.time_slot}
                                    onValueChange={(value) => setFormData({ ...formData, time_slot: value })}
                                    required
                                >
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
                                            onClick={() => handleServiceToggle(service.value)}
                                        >
                                            <Checkbox
                                                id={service.value}
                                                checked={formData.services.includes(service.value)}
                                                onCheckedChange={() => handleServiceToggle(service.value)}
                                                data-testid={`service-checkbox-${service.value}`}
                                            />
                                            <label htmlFor={service.value} className="text-sm cursor-pointer">
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
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                                    const slotAppointments = appointmentsBySlot[slot];
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
