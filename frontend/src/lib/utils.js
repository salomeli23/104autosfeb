import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const SERVICE_LABELS = {
    polarizado: 'Polarizado',
    nanoceramica: 'Nanocerámica',
    autobahn_black: 'Autobahn Black CE',
    ultrasecure: 'Ultrasecure',
};

export const STATUS_LABELS = {
    agendado: 'Agendado',
    en_proceso: 'En Proceso',
    en_revision: 'En Revisión',
    terminado: 'Terminado',
};

export const VEHICLE_STATUS_LABELS = {
    agendado: 'Agendado',
    ingresado: 'Ingresado',
    con_tecnico: 'Con Técnico',
    en_proceso: 'En Proceso',
    finalizado: 'Finalizado',
};

export const ROLE_LABELS = {
    admin: 'Administrador',
    asesor: 'Asesor Comercial',
    tecnico: 'Técnico',
};

export const TIME_SLOTS = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
];

export const INSPECTION_AREAS = [
    { id: 'front_bumper', name: 'Parachoques Delantero' },
    { id: 'rear_bumper', name: 'Parachoques Trasero' },
    { id: 'hood', name: 'Capó' },
    { id: 'trunk', name: 'Maletero' },
    { id: 'roof', name: 'Techo' },
    { id: 'left_front_door', name: 'Puerta Delantera Izquierda' },
    { id: 'right_front_door', name: 'Puerta Delantera Derecha' },
    { id: 'left_rear_door', name: 'Puerta Trasera Izquierda' },
    { id: 'right_rear_door', name: 'Puerta Trasera Derecha' },
    { id: 'left_front_fender', name: 'Guardafango Delantero Izquierdo' },
    { id: 'right_front_fender', name: 'Guardafango Delantero Derecho' },
    { id: 'left_rear_fender', name: 'Guardafango Trasero Izquierdo' },
    { id: 'right_rear_fender', name: 'Guardafango Trasero Derecho' },
    { id: 'windshield', name: 'Parabrisas' },
    { id: 'rear_window', name: 'Vidrio Trasero' },
    { id: 'left_windows', name: 'Vidrios Izquierdos' },
    { id: 'right_windows', name: 'Vidrios Derechos' },
    { id: 'left_mirror', name: 'Espejo Izquierdo' },
    { id: 'right_mirror', name: 'Espejo Derecho' },
    { id: 'interior', name: 'Interior General' },
];

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(amount);
};
