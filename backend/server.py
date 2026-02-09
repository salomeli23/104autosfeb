from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from enum import Enum
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'polarizadosya-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# SendGrid Configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@polarizadosya.com')

# Create the main app
app = FastAPI(title="PolarizadosYA! API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== ENUMS ====================
class UserRole(str, Enum):
    ADMIN = "admin"
    ASESOR = "asesor"
    TECNICO = "tecnico"

class ServiceType(str, Enum):
    POLARIZADO = "polarizado"
    NANOCERAMICA = "nanoceramica"
    AUTOBAHN_BLACK = "autobahn_black"
    ULTRASECURE = "ultrasecure"

class ServiceStatus(str, Enum):
    AGENDADO = "agendado"
    EN_PROCESO = "en_proceso"
    EN_REVISION = "en_revision"
    TERMINADO = "terminado"

class VehicleStatus(str, Enum):
    AGENDADO = "agendado"
    INGRESADO = "ingresado"
    CON_TECNICO = "con_tecnico"
    EN_PROCESO = "en_proceso"
    FINALIZADO = "finalizado"

class NotificationType(str, Enum):
    INTERNAL = "internal"
    EMAIL = "email"
    WHATSAPP = "whatsapp"

# ==================== MODELS ====================
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.ASESOR
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    phone: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class VehicleCreate(BaseModel):
    plate: str
    brand: str
    model: str
    year: int
    color: str
    vin: Optional[str] = None
    client_name: str
    client_phone: str
    client_email: Optional[EmailStr] = None
    client_cedula: Optional[str] = None

class VehicleResponse(BaseModel):
    id: str
    plate: str
    brand: str
    model: str
    year: int
    color: str
    vin: Optional[str] = None
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    client_cedula: Optional[str] = None
    status: Optional[str] = None
    assigned_technician_id: Optional[str] = None
    assigned_technician_name: Optional[str] = None
    current_service_order_id: Optional[str] = None
    created_at: str
    created_by: str

class AppointmentCreate(BaseModel):
    vehicle_id: Optional[str] = None
    client_name: str
    client_phone: str
    client_email: Optional[EmailStr] = None
    plate: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    date: str
    time_slot: str
    services: List[ServiceType]
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    vehicle_id: Optional[str] = None
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    plate: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    date: str
    time_slot: str
    services: List[str]
    notes: Optional[str] = None
    status: str
    created_at: str
    created_by: str

class InspectionItem(BaseModel):
    area: str
    condition: str
    notes: Optional[str] = None
    has_damage: bool = False

class Inspection360Create(BaseModel):
    vehicle_id: str
    service_order_id: Optional[str] = None
    items: List[InspectionItem]
    general_notes: Optional[str] = None
    photos: List[str] = []

class Inspection360Response(BaseModel):
    id: str
    vehicle_id: str
    service_order_id: Optional[str] = None
    items: List[dict]
    general_notes: Optional[str] = None
    photos: List[str]
    created_at: str
    created_by: str

class QuoteItem(BaseModel):
    service: ServiceType
    description: str
    price: float
    quantity: int = 1

class QuoteCreate(BaseModel):
    vehicle_id: str
    client_name: str
    client_email: Optional[EmailStr] = None
    items: List[QuoteItem]
    notes: Optional[str] = None

class QuoteResponse(BaseModel):
    id: str
    vehicle_id: str
    client_name: str
    client_email: Optional[str] = None
    items: List[dict]
    subtotal: float
    tax: float
    total: float
    notes: Optional[str] = None
    status: str
    approved_at: Optional[str] = None
    signature_url: Optional[str] = None
    cedula_photo_url: Optional[str] = None
    created_at: str
    created_by: str

class ServiceOrderCreate(BaseModel):
    vehicle_id: str
    quote_id: Optional[str] = None
    appointment_id: Optional[str] = None
    services: List[ServiceType]
    assigned_technician_id: Optional[str] = None
    estimated_hours: Optional[float] = None
    notes: Optional[str] = None

class ServiceOrderResponse(BaseModel):
    id: str
    vehicle_id: str
    quote_id: Optional[str] = None
    appointment_id: Optional[str] = None
    services: List[str]
    status: str
    assigned_technician_id: Optional[str] = None
    assigned_technician_name: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    notes: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str
    created_by: str
    vehicle: Optional[dict] = None

class NotificationCreate(BaseModel):
    recipient_id: Optional[str] = None
    recipient_email: Optional[EmailStr] = None
    recipient_phone: Optional[str] = None
    notification_type: NotificationType
    title: str
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None

class NotificationResponse(BaseModel):
    id: str
    recipient_id: Optional[str] = None
    recipient_email: Optional[str] = None
    notification_type: str
    title: str
    message: str
    read: bool
    sent_at: str
    created_at: str

# ==================== AUTH HELPERS ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in [r.value for r in allowed_roles]:
            raise HTTPException(status_code=403, detail="Acceso denegado")
        return current_user
    return role_checker

# ==================== EMAIL HELPER ====================
def send_email_notification(to_email: str, subject: str, html_content: str):
    if not SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured, skipping email")
        return False
    try:
        message = Mail(from_email=SENDER_EMAIL, to_emails=to_email, subject=subject, html_content=html_content)
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

# ==================== AUTH ENDPOINTS ====================
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": user_data.role.value,
        "phone": user_data.phone,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email, user_data.role.value)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            role=user_data.role,
            phone=user_data.phone,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_token(user["id"], user["email"], user["role"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=UserRole(user["role"]),
            phone=user.get("phone"),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=UserRole(current_user["role"]),
        phone=current_user.get("phone"),
        created_at=current_user["created_at"]
    )

# ==================== USERS ENDPOINTS ====================
@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return [UserResponse(
        id=u["id"], email=u["email"], name=u["name"],
        role=UserRole(u["role"]), phone=u.get("phone"), created_at=u["created_at"]
    ) for u in users]

@api_router.get("/users/technicians", response_model=List[UserResponse])
async def get_technicians(current_user: dict = Depends(get_current_user)):
    users = await db.users.find({"role": "tecnico"}, {"_id": 0, "password": 0}).to_list(1000)
    return [UserResponse(
        id=u["id"], email=u["email"], name=u["name"],
        role=UserRole(u["role"]), phone=u.get("phone"), created_at=u["created_at"]
    ) for u in users]

@api_router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, role: UserRole, current_user: dict = Depends(require_roles([UserRole.ADMIN]))):
    result = await db.users.update_one({"id": user_id}, {"$set": {"role": role.value}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Rol actualizado correctamente"}

# ==================== VEHICLES ENDPOINTS ====================
@api_router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(vehicle: VehicleCreate, current_user: dict = Depends(get_current_user)):
    vehicle_id = str(uuid.uuid4())
    vehicle_doc = {
        "id": vehicle_id,
        **vehicle.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["id"]
    }
    await db.vehicles.insert_one(vehicle_doc)
    return VehicleResponse(**{k: v for k, v in vehicle_doc.items() if k != "_id"})

@api_router.get("/vehicles", response_model=List[VehicleResponse])
async def get_vehicles(current_user: dict = Depends(get_current_user)):
    vehicles = await db.vehicles.find({}, {"_id": 0}).to_list(1000)
    return [VehicleResponse(**v) for v in vehicles]

@api_router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: str, current_user: dict = Depends(get_current_user)):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return VehicleResponse(**vehicle)

@api_router.get("/vehicles/plate/{plate}", response_model=VehicleResponse)
async def get_vehicle_by_plate(plate: str, current_user: dict = Depends(get_current_user)):
    vehicle = await db.vehicles.find_one({"plate": plate.upper()}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return VehicleResponse(**vehicle)

# ==================== APPOINTMENTS ENDPOINTS ====================
@api_router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    appointment_id = str(uuid.uuid4())
    vehicle_id = None
    
    # If plate is provided, create or update vehicle
    if appointment.plate:
        plate_upper = appointment.plate.upper()
        existing_vehicle = await db.vehicles.find_one({"plate": plate_upper}, {"_id": 0})
        
        if existing_vehicle:
            # Update existing vehicle with new appointment
            vehicle_id = existing_vehicle["id"]
            await db.vehicles.update_one(
                {"id": vehicle_id},
                {"$set": {
                    "status": VehicleStatus.AGENDADO.value,
                    "client_name": appointment.client_name,
                    "client_phone": appointment.client_phone,
                    "client_email": appointment.client_email,
                }}
            )
        else:
            # Create new vehicle
            vehicle_id = str(uuid.uuid4())
            vehicle_doc = {
                "id": vehicle_id,
                "plate": plate_upper,
                "brand": appointment.brand or "",
                "model": appointment.model or "",
                "year": datetime.now().year,
                "color": "",
                "vin": None,
                "client_name": appointment.client_name,
                "client_phone": appointment.client_phone,
                "client_email": appointment.client_email,
                "client_cedula": None,
                "status": VehicleStatus.AGENDADO.value,
                "assigned_technician_id": None,
                "assigned_technician_name": None,
                "current_service_order_id": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": current_user["id"]
            }
            await db.vehicles.insert_one(vehicle_doc)
    
    appointment_doc = {
        "id": appointment_id,
        **appointment.model_dump(),
        "vehicle_id": vehicle_id,
        "services": [s.value for s in appointment.services],
        "status": ServiceStatus.AGENDADO.value,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["id"]
    }
    await db.appointments.insert_one(appointment_doc)
    
    # Send email notification
    if appointment.client_email and SENDGRID_API_KEY:
        services_text = ", ".join([s.value.replace("_", " ").title() for s in appointment.services])
        html_content = f"""
        <h2>¡Cita Agendada - PolarizadosYA!</h2>
        <p>Hola {appointment.client_name},</p>
        <p>Tu cita ha sido agendada exitosamente:</p>
        <ul>
            <li><strong>Fecha:</strong> {appointment.date}</li>
            <li><strong>Hora:</strong> {appointment.time_slot}</li>
            <li><strong>Servicios:</strong> {services_text}</li>
        </ul>
        <p>¡Te esperamos!</p>
        """
        background_tasks.add_task(send_email_notification, appointment.client_email, "Cita Agendada - PolarizadosYA!", html_content)
    
    return AppointmentResponse(**{k: v for k, v in appointment_doc.items() if k != "_id"})

@api_router.get("/appointments", response_model=List[AppointmentResponse])
async def get_appointments(date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if date:
        query["date"] = date
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", 1).to_list(1000)
    return [AppointmentResponse(**a) for a in appointments]

@api_router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return AppointmentResponse(**appointment)

class StatusUpdate(BaseModel):
    status: ServiceStatus

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, data: StatusUpdate, current_user: dict = Depends(get_current_user)):
    result = await db.appointments.update_one({"id": appointment_id}, {"$set": {"status": data.status.value}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return {"message": "Estado actualizado"}

# ==================== INSPECTIONS ENDPOINTS ====================
@api_router.post("/inspections", response_model=Inspection360Response)
async def create_inspection(inspection: Inspection360Create, current_user: dict = Depends(get_current_user)):
    inspection_id = str(uuid.uuid4())
    inspection_doc = {
        "id": inspection_id,
        "vehicle_id": inspection.vehicle_id,
        "service_order_id": inspection.service_order_id,
        "items": [item.model_dump() for item in inspection.items],
        "general_notes": inspection.general_notes,
        "photos": inspection.photos,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["id"]
    }
    await db.inspections.insert_one(inspection_doc)
    return Inspection360Response(**{k: v for k, v in inspection_doc.items() if k != "_id"})

@api_router.get("/inspections/vehicle/{vehicle_id}", response_model=List[Inspection360Response])
async def get_vehicle_inspections(vehicle_id: str, current_user: dict = Depends(get_current_user)):
    inspections = await db.inspections.find({"vehicle_id": vehicle_id}, {"_id": 0}).to_list(100)
    return [Inspection360Response(**i) for i in inspections]

# ==================== QUOTES ENDPOINTS ====================
@api_router.post("/quotes", response_model=QuoteResponse)
async def create_quote(quote: QuoteCreate, current_user: dict = Depends(get_current_user)):
    quote_id = str(uuid.uuid4())
    items = [item.model_dump() for item in quote.items]
    for item in items:
        item["service"] = item["service"].value
    
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    tax = subtotal * 0.19  # 19% IVA
    total = subtotal + tax
    
    quote_doc = {
        "id": quote_id,
        "vehicle_id": quote.vehicle_id,
        "client_name": quote.client_name,
        "client_email": quote.client_email,
        "items": items,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "notes": quote.notes,
        "status": "pending",
        "approved_at": None,
        "signature_url": None,
        "cedula_photo_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["id"]
    }
    await db.quotes.insert_one(quote_doc)
    return QuoteResponse(**{k: v for k, v in quote_doc.items() if k != "_id"})

@api_router.get("/quotes", response_model=List[QuoteResponse])
async def get_quotes(current_user: dict = Depends(get_current_user)):
    quotes = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [QuoteResponse(**q) for q in quotes]

@api_router.get("/quotes/{quote_id}", response_model=QuoteResponse)
async def get_quote(quote_id: str, current_user: dict = Depends(get_current_user)):
    quote = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return QuoteResponse(**quote)

@api_router.put("/quotes/{quote_id}/approve")
async def approve_quote(quote_id: str, signature_url: Optional[str] = None, cedula_photo_url: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    update_data = {
        "status": "approved",
        "approved_at": datetime.now(timezone.utc).isoformat()
    }
    if signature_url:
        update_data["signature_url"] = signature_url
    if cedula_photo_url:
        update_data["cedula_photo_url"] = cedula_photo_url
    
    result = await db.quotes.update_one({"id": quote_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return {"message": "Cotización aprobada"}

# ==================== SERVICE ORDERS ENDPOINTS ====================
@api_router.post("/service-orders", response_model=ServiceOrderResponse)
async def create_service_order(order: ServiceOrderCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    
    # Get technician name if assigned
    technician_name = None
    if order.assigned_technician_id:
        technician = await db.users.find_one({"id": order.assigned_technician_id}, {"_id": 0})
        if technician:
            technician_name = technician["name"]
    
    order_doc = {
        "id": order_id,
        "vehicle_id": order.vehicle_id,
        "quote_id": order.quote_id,
        "appointment_id": order.appointment_id,
        "services": [s.value for s in order.services],
        "status": ServiceStatus.AGENDADO.value,
        "assigned_technician_id": order.assigned_technician_id,
        "assigned_technician_name": technician_name,
        "estimated_hours": order.estimated_hours,
        "actual_hours": None,
        "notes": order.notes,
        "started_at": None,
        "completed_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["id"]
    }
    await db.service_orders.insert_one(order_doc)
    
    # Create internal notification if technician assigned
    if order.assigned_technician_id:
        notification_doc = {
            "id": str(uuid.uuid4()),
            "recipient_id": order.assigned_technician_id,
            "notification_type": NotificationType.INTERNAL.value,
            "title": "Nueva Orden de Trabajo Asignada",
            "message": f"Se te ha asignado una nueva orden de servicio #{order_id[:8]}",
            "read": False,
            "related_entity_type": "service_order",
            "related_entity_id": order_id,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification_doc)
    
    return ServiceOrderResponse(**{k: v for k, v in order_doc.items() if k != "_id"})

@api_router.get("/service-orders", response_model=List[ServiceOrderResponse])
async def get_service_orders(status: Optional[str] = None, technician_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if status:
        query["status"] = status
    if technician_id:
        query["assigned_technician_id"] = technician_id
    
    orders = await db.service_orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Enrich with vehicle data
    for order in orders:
        vehicle = await db.vehicles.find_one({"id": order["vehicle_id"]}, {"_id": 0})
        order["vehicle"] = vehicle
    
    return [ServiceOrderResponse(**o) for o in orders]

@api_router.get("/service-orders/{order_id}", response_model=ServiceOrderResponse)
async def get_service_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.service_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    vehicle = await db.vehicles.find_one({"id": order["vehicle_id"]}, {"_id": 0})
    order["vehicle"] = vehicle
    
    return ServiceOrderResponse(**order)

@api_router.put("/service-orders/{order_id}/status")
async def update_service_order_status(order_id: str, data: StatusUpdate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    update_data = {"status": data.status.value}
    
    if data.status == ServiceStatus.EN_PROCESO:
        update_data["started_at"] = datetime.now(timezone.utc).isoformat()
    elif data.status == ServiceStatus.TERMINADO:
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.service_orders.update_one({"id": order_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Notify client when completed
    if data.status == ServiceStatus.TERMINADO:
        order = await db.service_orders.find_one({"id": order_id}, {"_id": 0})
        if order:
            vehicle = await db.vehicles.find_one({"id": order["vehicle_id"]}, {"_id": 0})
            if vehicle and vehicle.get("client_email") and SENDGRID_API_KEY:
                html_content = f"""
                <h2>¡Tu vehículo está listo! - PolarizadosYA!</h2>
                <p>Hola {vehicle['client_name']},</p>
                <p>Nos complace informarte que el servicio para tu vehículo <strong>{vehicle['brand']} {vehicle['model']}</strong> ({vehicle['plate']}) ha sido completado.</p>
                <p>¡Puedes pasar a recogerlo cuando gustes!</p>
                <p>Gracias por confiar en PolarizadosYA!</p>
                """
                background_tasks.add_task(send_email_notification, vehicle['client_email'], "¡Tu vehículo está listo! - PolarizadosYA!", html_content)
    
    return {"message": "Estado actualizado"}

class TechnicianAssign(BaseModel):
    technician_id: str

@api_router.put("/service-orders/{order_id}/assign")
async def assign_technician(order_id: str, data: TechnicianAssign, current_user: dict = Depends(require_roles([UserRole.ADMIN, UserRole.ASESOR]))):
    technician = await db.users.find_one({"id": data.technician_id, "role": "tecnico"}, {"_id": 0})
    if not technician:
        raise HTTPException(status_code=404, detail="Técnico no encontrado")
    
    result = await db.service_orders.update_one(
        {"id": order_id},
        {"$set": {"assigned_technician_id": data.technician_id, "assigned_technician_name": technician["name"]}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Create notification for technician
    notification_doc = {
        "id": str(uuid.uuid4()),
        "recipient_id": data.technician_id,
        "notification_type": NotificationType.INTERNAL.value,
        "title": "Nueva Orden Asignada",
        "message": f"Se te ha asignado la orden #{order_id[:8]}",
        "read": False,
        "related_entity_type": "service_order",
        "related_entity_id": order_id,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification_doc)
    
    return {"message": "Técnico asignado correctamente"}

# ==================== NOTIFICATIONS ENDPOINTS ====================
@api_router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"recipient_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return [NotificationResponse(**n) for n in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "recipient_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return {"message": "Notificación marcada como leída"}

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    count = await db.notifications.count_documents({"recipient_id": current_user["id"], "read": False})
    return {"count": count}

# ==================== DASHBOARD/STATS ENDPOINTS ====================
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Today's appointments
    today_appointments = await db.appointments.count_documents({"date": today})
    
    # Orders by status
    agendados = await db.service_orders.count_documents({"status": "agendado"})
    en_proceso = await db.service_orders.count_documents({"status": "en_proceso"})
    en_revision = await db.service_orders.count_documents({"status": "en_revision"})
    terminados = await db.service_orders.count_documents({"status": "terminado"})
    
    # Total vehicles
    total_vehicles = await db.vehicles.count_documents({})
    
    # Pending quotes
    pending_quotes = await db.quotes.count_documents({"status": "pending"})
    
    return {
        "today_appointments": today_appointments,
        "orders_by_status": {
            "agendado": agendados,
            "en_proceso": en_proceso,
            "en_revision": en_revision,
            "terminado": terminados
        },
        "total_vehicles": total_vehicles,
        "pending_quotes": pending_quotes,
        "total_active_orders": agendados + en_proceso + en_revision
    }

@api_router.get("/")
async def root():
    return {"message": "PolarizadosYA! API v1.0"}

# Include router and configure CORS
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
