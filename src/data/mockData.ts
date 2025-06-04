export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  licenseNumber?: string
  flightHours?: number
  medicalExpiry?: string
  lastTraining?: string
  certifications?: string[]
  aircraftCertifications?: { model: string; date: string }[]
}

// Usuarios mock para la aplicación
export const mockUsers = [
  {
    id: "1",
    name: "Carlos Rodríguez",
    email: "piloto@ibexheli.com",
    role: "pilot",
    licenseNumber: "PL-12345",
    flightHours: 2450,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    medicalExpiry: "2024-06-30",
    lastTraining: "2023-09-15",
    certifications: ["VFR", "IFR", "Night Flying", "Mountain Operations"],
    aircraftCertifications: [
      { model: "Bell 407", date: "2021-05-10" },
      { model: "Airbus H125", date: "2022-03-15" },
      { model: "Robinson R44", date: "2020-11-22" },
      { model: "Sikorsky S-76", date: "2023-01-08" },
    ],
  },
  {
    id: "4",
    name: "Laura Gómez",
    email: "laura@ibexheli.com",
    role: "pilot",
    licenseNumber: "PL-23456",
    flightHours: 1850,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    medicalExpiry: "2024-08-15",
    lastTraining: "2023-10-20",
    certifications: ["VFR", "IFR", "Night Flying"],
    aircraftCertifications: [
      { model: "Bell 407", date: "2022-02-18" },
      { model: "Robinson R44", date: "2021-07-12" },
    ],
  },
  {
    id: "5",
    name: "Javier Torres",
    email: "javier@ibexheli.com",
    role: "pilot",
    licenseNumber: "PL-34567",
    flightHours: 3200,
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    medicalExpiry: "2024-05-10",
    lastTraining: "2023-08-05",
    certifications: ["VFR", "IFR", "Night Flying", "Mountain Operations", "External Load"],
    aircraftCertifications: [
      { model: "Bell 407", date: "2020-11-30" },
      { model: "Airbus H125", date: "2021-04-22" },
      { model: "Sikorsky S-76", date: "2022-09-14" },
    ],
  },
  {
    id: "6",
    name: "Sofía Mendoza",
    email: "sofia@ibexheli.com",
    role: "pilot",
    licenseNumber: "PL-45678",
    flightHours: 1200,
    avatar: "https://randomuser.me/api/portraits/women/36.jpg",
    medicalExpiry: "2024-07-22",
    lastTraining: "2023-11-10",
    certifications: ["VFR", "Night Flying"],
    aircraftCertifications: [
      { model: "Robinson R44", date: "2022-06-05" },
      { model: "Bell 407", date: "2023-02-18" },
    ],
  },
  {
    id: "2",
    name: "Ana Martínez",
    email: "operador@ibexheli.com",
    role: "operator",
    department: "Operaciones",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "3",
    name: "Miguel Sánchez",
    email: "admin@ibexheli.com",
    role: "admin",
    department: "Dirección",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
  },
]

export const mockPilots = mockUsers.filter((user) => user.role === "pilot")

// Helicópteros mock
export const mockHelicopters = [
  {
    id: "1",
    model: "Bell 407",
    registration: "EC-123",
    yearManufactured: 2018,
    lastMaintenance: "2023-10-15",
    status: "active",
    totalFlightHours: 1250,
    image: "/bel407.jpg",
  },
  {
    id: "2",
    model: "Airbus H125",
    registration: "EC-456",
    yearManufactured: 2020,
    lastMaintenance: "2023-11-05",
    status: "maintenance",
    totalFlightHours: 890,
    image: "/airbush125.jpeg",
  },
  {
    id: "3",
    model: "Robinson R44",
    registration: "EC-789",
    yearManufactured: 2019,
    lastMaintenance: "2023-09-20",
    status: "active",
    totalFlightHours: 1560,
    image: "/robinsonr44.jpg",
  },
  {
    id: "4",
    model: "Sikorsky S-76",
    registration: "EC-012",
    yearManufactured: 2015,
    lastMaintenance: "2023-10-30",
    status: "active",
    totalFlightHours: 2340,
    image: "/s76.jpg",
  },
]

// Actualizar las ubicaciones mock con destinos de la Patagonia
export const mockLocations = [
  { id: "1", name: "Bariloche", code: "BRC", type: "airport" },
  { id: "2", name: "San Martín de los Andes", code: "CPC", type: "airport" },
  { id: "3", name: "El Calafate", code: "FTE", type: "airport" },
  { id: "4", name: "Ushuaia", code: "USH", type: "airport" },
  { id: "5", name: "Puerto Madryn", code: "PMY", type: "airport" },
  { id: "6", name: "Base IBEX Bariloche", code: "IBB", type: "heliport" },
  { id: "7", name: "Base IBEX El Calafate", code: "IBC", type: "heliport" },
  { id: "8", name: "Hospital Bariloche", code: "HBR", type: "heliport" },
  { id: "9", name: "El Chaltén", code: "ECH", type: "landing zone" },
  { id: "10", name: "Perito Moreno", code: "PEM", type: "landing zone" },
  { id: "11", name: "Villa La Angostura", code: "VLA", type: "landing zone" },
  { id: "12", name: "Esquel", code: "EQS", type: "airport" },
  { id: "13", name: "Lago Puelo", code: "LPU", type: "landing zone" },
  { id: "14", name: "El Bolsón", code: "EBO", type: "landing zone" },
  { id: "15", name: "Parque Nacional Lanín", code: "PNL", type: "landing zone" },
]

// Clientes mock
export const mockClients = [
  {
    id: 1,
    name: "Hotel Llao Llao",
    contactPerson: "Martín Gutiérrez",
    email: "reservas@llaollao.com",
    phone: "+54 294 444-8530",
    address: "Av. Ezequiel Bustillo Km 25, Bariloche, Río Negro",
    type: "corporate",
    status: "active",
    notes: "Cliente VIP, servicio de traslados exclusivos para huéspedes",
  },
  {
    id: 2,
    name: "Turismo Aventura Patagonia",
    contactPerson: "Laura Fernández",
    email: "info@aventurapatagonia.com",
    phone: "+54 294 442-2233",
    address: "Mitre 150, Bariloche, Río Negro",
    type: "corporate",
    status: "active",
    notes: "Agencia de turismo, vuelos panorámicos y excursiones",
  },
  {
    id: 4,
    name: "Roberto Méndez",
    contactPerson: "Roberto Méndez",
    email: "rmendez@gmail.com",
    phone: "+54 294 456-7890",
    address: "Los Notros 345, Villa La Angostura, Neuquén",
    type: "individual",
    status: "active",
    notes: "Cliente frecuente, vuelos privados",
  },
  {
    id: 5,
    name: "Hospital Regional Bariloche",
    contactPerson: "Dra. Claudia Vázquez",
    email: "emergencias@hospitalbariloche.gov.ar",
    phone: "+54 294 442-6100",
    address: "Moreno 601, Bariloche, Río Negro",
    type: "corporate",
    status: "active",
    notes: "Servicios de emergencia médica y traslados",
  },
  {
    id: 6,
    name: "Parques Nacionales",
    contactPerson: "Jorge Álvarez",
    email: "operaciones@parquesnacionales.gob.ar",
    phone: "+54 294 443-9751",
    address: "Av. San Martín 24, Bariloche, Río Negro",
    type: "government",
    status: "active",
    notes: "Monitoreo ambiental y operaciones de rescate",
  },
]

// Configuración del sistema
let systemSettings = {
  hourlyRate: 150.0, // Tarifa estándar por hora en USD
  nightHourlyRate: 180.0, // Tarifa nocturna por hora en USD
  weekendHourlyRate: 200.0, // Tarifa fin de semana por hora en USD
  holidayHourlyRate: 250.0, // Tarifa días festivos por hora en USD
}

// Función para obtener la configuración
export const getSettings = () => {
  return { ...systemSettings }
}

// Función para actualizar la configuración
export const updateSettings = (newSettings: Partial<typeof systemSettings>) => {
  systemSettings = { ...systemSettings, ...newSettings }
  return { ...systemSettings }
}

// Vuelos mock con clientId
export const mockFlights = [
  {
    id: "1",
    date: "2023-11-15",
    pilotId: "1",
    helicopterId: "1",
    originId: "6",
    destinationId: "8",
    departureTime: "08:30",
    arrivalTime: "09:15",
    flightHours: "0:45",
    status: "completed",
    notes: "Vuelo médico de emergencia",
    fuelConsumed: 120,
    passengers: 2,
    clientId: "4", // Hospital Regional Bariloche
    startupTime: "08:15",
    shutdownTime: "09:30",
    runTime: "1:15",
    initialOdometer: "1245.5",
    finalOdometer: "1246.2",
    flightTime: "0.7",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "08:45",
    billingStatus: "invoiced_pending", // Facturado pendiente de pago
  },
  {
    id: "2",
    date: "2023-11-14",
    pilotId: "1",
    helicopterId: "3",
    originId: "6",
    destinationId: "9",
    departureTime: "10:00",
    arrivalTime: "11:30",
    flightHours: "1:30",
    status: "completed",
    notes: "Vuelo turístico a El Chaltén",
    fuelConsumed: 180,
    passengers: 3,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "09:45",
    shutdownTime: "11:45",
    runTime: "2:00",
    initialOdometer: "1246.2",
    finalOdometer: "1247.7",
    flightTime: "1.5",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "10:15",
    billingStatus: "paid", // Pagado
  },
  {
    id: "3",
    date: "2023-11-13",
    pilotId: "1",
    helicopterId: "1",
    originId: "6",
    destinationId: "1",
    departureTime: "14:00",
    arrivalTime: "14:45",
    flightHours: "0:45",
    status: "completed",
    notes: "Traslado de ejecutivos a Bariloche",
    fuelConsumed: 130,
    passengers: 4,
    clientId: "1", // Hotel Llao Llao
    startupTime: "13:45",
    shutdownTime: "15:00",
    runTime: "1:15",
    initialOdometer: "1247.7",
    finalOdometer: "1248.4",
    flightTime: "0.7",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "14:15",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "4",
    date: "2023-11-12",
    pilotId: "1",
    helicopterId: "2",
    originId: "7",
    destinationId: "10",
    departureTime: "09:00",
    arrivalTime: "10:45",
    flightHours: "1:45",
    status: "completed",
    notes: "Misión de rescate en Glaciar Perito Moreno",
    fuelConsumed: 210,
    passengers: 1,
    clientId: "5", // Parques Nacionales
    startupTime: "08:45",
    shutdownTime: "11:00",
    runTime: "2:15",
    initialOdometer: "1248.4",
    finalOdometer: "1250.1",
    flightTime: "1.7",
    starts: 1,
    landings: 2,
    launches: 1,
    rin: 1,
    gachoTime: "09:30",
    billingStatus: "paid", // Pagado
  },
  {
    id: "5",
    date: "2023-11-20",
    pilotId: "1",
    helicopterId: "1",
    originId: "6",
    destinationId: "11",
    departureTime: "13:00",
    arrivalTime: "14:30",
    flightHours: "1:30",
    status: "scheduled",
    notes: "Vuelo turístico a Villa La Angostura",
    fuelConsumed: 0,
    passengers: 3,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "",
    shutdownTime: "",
    runTime: "0:00",
    initialOdometer: "",
    finalOdometer: "",
    flightTime: "0.0",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "6",
    date: "2023-11-22",
    pilotId: "1",
    helicopterId: "3",
    originId: "1",
    destinationId: "14",
    departureTime: "09:30",
    arrivalTime: "10:45",
    flightHours: "1:15",
    status: "scheduled",
    notes: "Excursión a El Bolsón",
    fuelConsumed: 0,
    passengers: 4,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "",
    shutdownTime: "",
    runTime: "0:00",
    initialOdometer: "",
    finalOdometer: "",
    flightTime: "0.0",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "7",
    date: "2023-11-25",
    pilotId: "1",
    helicopterId: "2",
    originId: "2",
    destinationId: "15",
    departureTime: "11:00",
    arrivalTime: "12:30",
    flightHours: "1:30",
    status: "scheduled",
    notes: "Sobrevuelo del Parque Nacional Lanín",
    fuelConsumed: 0,
    passengers: 2,
    clientId: "3", // Roberto Méndez
    startupTime: "",
    shutdownTime: "",
    runTime: "0:00",
    initialOdometer: "",
    finalOdometer: "",
    flightTime: "0.0",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "8",
    date: "2023-12-05",
    pilotId: "1",
    helicopterId: "1",
    originId: "6",
    destinationId: "3",
    departureTime: "08:00",
    arrivalTime: "10:30",
    flightHours: "2:30",
    status: "scheduled",
    notes: "Traslado VIP a El Calafate",
    fuelConsumed: 0,
    passengers: 3,
    clientId: "1", // Hotel Llao Llao
    startupTime: "",
    shutdownTime: "",
    runTime: "0:00",
    initialOdometer: "",
    finalOdometer: "",
    flightTime: "0.0",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "9",
    date: "2023-12-10",
    pilotId: "1",
    helicopterId: "4",
    originId: "6",
    destinationId: "8",
    departureTime: "14:00",
    arrivalTime: "14:45",
    flightHours: "0:45",
    status: "scheduled",
    notes: "Traslado médico programado",
    fuelConsumed: 0,
    passengers: 2,
    clientId: "4", // Hospital Regional Bariloche
    startupTime: "",
    shutdownTime: "",
    runTime: "0:00",
    initialOdometer: "",
    finalOdometer: "",
    flightTime: "0.0",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "10",
    date: "2023-11-15",
    pilotId: "4", // Laura Gómez
    helicopterId: "3",
    originId: "6",
    destinationId: "11",
    departureTime: "09:15",
    arrivalTime: "10:30",
    flightHours: "1:15",
    status: "completed",
    notes: "Vuelo turístico a Villa La Angostura",
    fuelConsumed: 150,
    passengers: 3,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "09:00",
    shutdownTime: "10:45",
    runTime: "1:45",
    initialOdometer: "890.2",
    finalOdometer: "891.5",
    flightTime: "1.3",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "invoiced_pending", // Facturado pendiente de pago
  },
  {
    id: "11",
    date: "2023-11-15",
    pilotId: "5", // Javier Torres
    helicopterId: "1",
    originId: "1",
    destinationId: "6",
    departureTime: "11:00",
    arrivalTime: "11:45",
    flightHours: "0:45",
    status: "completed",
    notes: "Traslado ejecutivo",
    fuelConsumed: 110,
    passengers: 2,
    clientId: "1", // Hotel Llao Llao
    startupTime: "10:45",
    shutdownTime: "12:00",
    runTime: "1:15",
    initialOdometer: "1250.8",
    finalOdometer: "1251.5",
    flightTime: "0.7",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "paid", // Pagado
  },
  {
    id: "12",
    date: "2023-11-15",
    pilotId: "6", // Sofía Mendoza
    helicopterId: "4",
    originId: "7",
    destinationId: "3",
    departureTime: "14:30",
    arrivalTime: "16:00",
    flightHours: "1:30",
    status: "completed",
    notes: "Vuelo de reconocimiento",
    fuelConsumed: 180,
    passengers: 1,
    clientId: "5", // Parques Nacionales
    startupTime: "14:15",
    shutdownTime: "16:15",
    runTime: "2:00",
    initialOdometer: "2345.2",
    finalOdometer: "2346.7",
    flightTime: "1.5",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "invoiced_pending", // Facturado pendiente de pago
  },
  {
    id: "13",
    date: "2023-11-16",
    pilotId: "1", // Carlos Rodríguez
    helicopterId: "2",
    originId: "6",
    destinationId: "9",
    departureTime: "08:00",
    arrivalTime: "09:30",
    flightHours: "1:30",
    status: "completed",
    notes: "Vuelo turístico a El Chaltén",
    fuelConsumed: 175,
    passengers: 4,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "07:45",
    shutdownTime: "09:45",
    runTime: "2:00",
    initialOdometer: "892.0",
    finalOdometer: "893.5",
    flightTime: "1.5",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "paid", // Pagado
  },
  {
    id: "14",
    date: "2023-11-16",
    pilotId: "4", // Laura Gómez
    helicopterId: "1",
    originId: "1",
    destinationId: "8",
    departureTime: "10:15",
    arrivalTime: "11:00",
    flightHours: "0:45",
    status: "completed",
    notes: "Traslado médico",
    fuelConsumed: 115,
    passengers: 2,
    clientId: "4", // Hospital Regional Bariloche
    startupTime: "10:00",
    shutdownTime: "11:15",
    runTime: "1:15",
    initialOdometer: "1251.5",
    finalOdometer: "1252.2",
    flightTime: "0.7",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "15",
    date: "2023-11-16",
    pilotId: "5", // Javier Torres
    helicopterId: "4",
    originId: "6",
    destinationId: "15",
    departureTime: "13:00",
    arrivalTime: "14:45",
    flightHours: "1:45",
    status: "completed",
    notes: "Inspección del Parque Nacional Lanín",
    fuelConsumed: 200,
    passengers: 3,
    clientId: "5", // Parques Nacionales
    startupTime: "12:45",
    shutdownTime: "15:00",
    runTime: "2:15",
    initialOdometer: "2346.7",
    finalOdometer: "2348.5",
    flightTime: "1.8",
    starts: 1,
    landings: 2,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "invoiced_pending", // Facturado pendiente de pago
  },
  {
    id: "16",
    date: "2023-11-17",
    pilotId: "6", // Sofía Mendoza
    helicopterId: "3",
    originId: "2",
    destinationId: "14",
    departureTime: "09:30",
    arrivalTime: "10:45",
    flightHours: "1:15",
    status: "completed",
    notes: "Vuelo turístico a El Bolsón",
    fuelConsumed: 155,
    passengers: 3,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "09:15",
    shutdownTime: "11:00",
    runTime: "1:45",
    initialOdometer: "1560.0",
    finalOdometer: "1561.3",
    flightTime: "1.3",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "paid", // Pagado
  },
  {
    id: "17",
    date: "2023-11-17",
    pilotId: "1", // Carlos Rodríguez
    helicopterId: "1",
    originId: "6",
    destinationId: "10",
    departureTime: "11:30",
    arrivalTime: "13:15",
    flightHours: "1:45",
    status: "completed",
    notes: "Vuelo de reconocimiento al Perito Moreno",
    fuelConsumed: 210,
    passengers: 2,
    clientId: "5", // Parques Nacionales
    startupTime: "11:15",
    shutdownTime: "13:30",
    runTime: "2:15",
    initialOdometer: "1252.2",
    finalOdometer: "1254.0",
    flightTime: "1.8",
    starts: 1,
    landings: 2,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "18",
    date: "2023-11-17",
    pilotId: "4", // Laura Gómez
    helicopterId: "2",
    originId: "1",
    destinationId: "12",
    departureTime: "14:00",
    arrivalTime: "15:30",
    flightHours: "1:30",
    status: "completed",
    notes: "Traslado a Esquel",
    fuelConsumed: 185,
    passengers: 3,
    clientId: "3", // Roberto Méndez
    startupTime: "13:45",
    shutdownTime: "15:45",
    runTime: "2:00",
    initialOdometer: "893.5",
    finalOdometer: "895.0",
    flightTime: "1.5",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "invoiced_pending", // Facturado pendiente de pago
  },
  {
    id: "19",
    date: "2023-11-18",
    pilotId: "5", // Javier Torres
    helicopterId: "3",
    originId: "6",
    destinationId: "13",
    departureTime: "08:45",
    arrivalTime: "10:00",
    flightHours: "1:15",
    status: "completed",
    notes: "Vuelo a Lago Puelo",
    fuelConsumed: 150,
    passengers: 2,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "08:30",
    shutdownTime: "10:15",
    runTime: "1:45",
    initialOdometer: "1561.3",
    finalOdometer: "1562.6",
    flightTime: "1.3",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "paid", // Pagado
  },
  {
    id: "20",
    date: "2023-11-18",
    pilotId: "6", // Sofía Mendoza
    helicopterId: "1",
    originId: "1",
    destinationId: "6",
    departureTime: "11:15",
    arrivalTime: "12:00",
    flightHours: "0:45",
    status: "completed",
    notes: "Traslado ejecutivo",
    fuelConsumed: 110,
    passengers: 2,
    clientId: "1", // Hotel Llao Llao
    startupTime: "11:00",
    shutdownTime: "12:15",
    runTime: "1:15",
    initialOdometer: "1254.0",
    finalOdometer: "1254.7",
    flightTime: "0.7",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "21",
    date: "2023-11-18",
    pilotId: "1", // Carlos Rodríguez
    helicopterId: "4",
    originId: "7",
    destinationId: "3",
    departureTime: "13:30",
    arrivalTime: "15:00",
    flightHours: "1:30",
    status: "completed",
    notes: "Vuelo de inspección",
    fuelConsumed: 180,
    passengers: 3,
    clientId: "5", // Parques Nacionales
    startupTime: "13:15",
    shutdownTime: "15:15",
    runTime: "2:00",
    initialOdometer: "2348.5",
    finalOdometer: "2350.0",
    flightTime: "1.5",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "invoiced_pending", // Facturado pendiente de pago
  },
  {
    id: "22",
    date: "2023-11-19",
    pilotId: "4", // Laura Gómez
    helicopterId: "1",
    originId: "6",
    destinationId: "8",
    departureTime: "09:00",
    arrivalTime: "09:45",
    flightHours: "0:45",
    status: "completed",
    notes: "Traslado médico de emergencia",
    fuelConsumed: 115,
    passengers: 2,
    clientId: "4", // Hospital Regional Bariloche
    startupTime: "08:45",
    shutdownTime: "10:00",
    runTime: "1:15",
    initialOdometer: "1254.7",
    finalOdometer: "1255.4",
    flightTime: "0.7",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "paid", // Pagado
  },
  {
    id: "23",
    date: "2023-11-19",
    pilotId: "5", // Javier Torres
    helicopterId: "2",
    originId: "1",
    destinationId: "11",
    departureTime: "10:30",
    arrivalTime: "11:45",
    flightHours: "1:15",
    status: "completed",
    notes: "Vuelo turístico a Villa La Angostura",
    fuelConsumed: 155,
    passengers: 4,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "10:15",
    shutdownTime: "12:00",
    runTime: "1:45",
    initialOdometer: "895.0",
    finalOdometer: "896.3",
    flightTime: "1.3",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "invoiced_pending", // Facturado pendiente de pago
  },
  {
    id: "24",
    date: "2023-11-19",
    pilotId: "6", // Sofía Mendoza
    helicopterId: "3",
    originId: "6",
    destinationId: "9",
    departureTime: "13:00",
    arrivalTime: "14:30",
    flightHours: "1:30",
    status: "completed",
    notes: "Vuelo turístico a El Chaltén",
    fuelConsumed: 175,
    passengers: 3,
    clientId: "2", // Turismo Aventura Patagonia
    startupTime: "12:45",
    shutdownTime: "14:45",
    runTime: "2:00",
    initialOdometer: "1562.6",
    finalOdometer: "1564.1",
    flightTime: "1.5",
    starts: 1,
    landings: 1,
    launches: 0,
    rin: 0,
    gachoTime: "",
    billingStatus: "pending", // Pendiente de facturación
  },
  {
    id: "25",
    date: "2023-11-20",
    pilotId: "1", // Carlos Rodríguez
    helicopterId: "4",
    originId: "3",
    destinationId: "10",
    departureTime: "08:30",
    arrivalTime: "10:15",
    flightHours: "1:45",
    status: "completed",
    notes: "Inspección del Glaciar Perito Moreno",
    fuelConsumed: 210,
    passengers: 2,
    clientId: "5", // Parques Nacionales
    startupTime: "08:15",
    shutdownTime: "10:30",
    runTime: "2:15",
    initialOdometer: "2350.0",
    finalOdometer: "2351.8",
    flightTime: "1.8",
    starts: 1,
    landings: 2,
    launches: 1,
    rin: 1,
    gachoTime: "09:00",
    billingStatus: "paid", // Pagado
  },
]

// Función para obtener datos relacionados
export const getPilotName = (pilotId: string) => {
  const pilot = mockUsers.find((user) => user.id === pilotId)
  return pilot ? pilot.name : "Desconocido"
}

export const getHelicopterInfo = (helicopterId: string) => {
  const helicopter = mockHelicopters.find((h) => h.id === helicopterId)
  return helicopter ? `${helicopter.model} (${helicopter.registration})` : "Desconocido"
}

export const getLocationName = (locationId: string) => {
  const location = mockLocations.find((loc) => loc.id === locationId)
  return location ? `${location.name} (${location.code})` : "Desconocido"
}

export const getClientName = (clientId: string) => {
  const client = mockClients.find((c) => c.id === Number(clientId))
  return client ? client.name : "Desconocido"
}


export const getClientFlights = (clientId: string) => {
  return mockFlights.filter((flight) => flight.clientId === clientId)
}

// Función para obtener el estado de facturación en texto
export const getBillingStatusText = (billingStatus: string) => {
  switch (billingStatus) {
    case "pending":
      return "Pendiente de facturación"
    case "invoiced_pending":
      return "Facturado pendiente de pago"
    case "paid":
      return "Pagado"
    default:
      return "Desconocido"
  }
}

// Función para calcular el valor monetario de las horas de vuelo
export const calculateFlightValue = (flightHours: number, date: string, isNight = false, isHoliday = false) => {
  const { hourlyRate, nightHourlyRate, weekendHourlyRate, holidayHourlyRate } = systemSettings

  // Determinar si es fin de semana
  const flightDate = new Date(date)
  const isWeekend = flightDate.getDay() === 0 || flightDate.getDay() === 6 // 0 = domingo, 6 = sábado

  let rate = hourlyRate

  if (isHoliday) {
    rate = holidayHourlyRate
  } else if (isWeekend) {
    rate = weekendHourlyRate
  } else if (isNight) {
    rate = nightHourlyRate
  }

  return flightHours * rate
}

// Función para obtener las horas de vuelo de un piloto en un mes específico
export const getPilotMonthlyHours = (pilotId: string, year: number, month: number) => {
  // Filtrar vuelos completados del piloto en el mes y año especificados
  const monthlyFlights = mockFlights.filter((flight) => {
    const flightDate = new Date(flight.date)
    return (
      flight.pilotId === pilotId &&
      flight.status === "completed" &&
      flightDate.getFullYear() === year &&
      flightDate.getMonth() === month
    )
  })

  // Calcular horas totales
  const totalHours = monthlyFlights.reduce((total, flight) => {
    if (flight.flightTime) {
      return total + Number.parseFloat(flight.flightTime)
    } else if (flight.flightHours) {
      const [hours, minutes] = flight.flightHours.split(":").map(Number)
      return total + hours + minutes / 60
    }
    return total
  }, 0)

  // Calcular valor monetario total
  const totalValue = monthlyFlights.reduce((total, flight) => {
    let flightHours = 0
    if (flight.flightTime) {
      flightHours = Number.parseFloat(flight.flightTime)
    } else if (flight.flightHours) {
      const [hours, minutes] = flight.flightHours.split(":").map(Number)
      flightHours = hours + minutes / 60
    }

    // Determinar si el vuelo fue nocturno (entre 20:00 y 06:00)
    const departureHour = Number.parseInt(flight.departureTime.split(":")[0])
    const isNight = departureHour >= 20 || departureHour < 6

    // Por simplicidad, asumimos que no hay vuelos en días festivos
    const isHoliday = false

    const value = calculateFlightValue(flightHours, flight.date, isNight, isHoliday)
    return total + value
  }, 0)

  return {
    totalHours: Number.parseFloat(totalHours.toFixed(1)),
    totalValue: Number.parseFloat(totalValue.toFixed(2)),
    flights: monthlyFlights,
  }
}

// Estadísticas para el dashboard
export const getStatistics = () => {
  return {
    totalFlights: mockFlights.length,
    completedFlights: mockFlights.filter((f) => f.status === "completed").length,
    scheduledFlights: mockFlights.filter((f) => f.status === "scheduled").length,
    totalPilots: mockUsers.filter((u) => u.role === "pilot").length,
    totalHelicopters: mockHelicopters.length,
    activeHelicopters: mockHelicopters.filter((h) => h.status === "active").length,
    totalClients: mockClients.length,
    totalFlightHours: mockFlights
      .reduce((total, flight) => {
        if (flight.status === "completed") {
          const [hours, minutes] = flight.flightHours.split(":").map(Number)
          return total + hours + minutes / 60
        }
        return total
      }, 0)
      .toFixed(1),
  }
}
