import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Car,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Gauge,
  Home,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  Save,
  Search,
  Settings as SettingsIcon,
  Shield,
  Timer,
  Truck,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";

/* =========================================================
   SHARED TYPES
========================================================= */

type ViewKey =
  | "dashboard"
  | "vehicleIntake"
  | "inspection"
  | "shopFloor"
  | "technicianBoard"
  | "customers"
  | "parts"
  | "reports"
  | "admin"
  | "settings";

type UserRole =
  | "Admin"
  | "Service Advisor"
  | "Chief Mechanic"
  | "Senior Mechanic"
  | "General Mechanic"
  | "Junior Mechanic"
  | "OJT";

type LoginAccount = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  active: boolean;
};

type VehicleMasterMake = {
  make: string;
  models: string[];
};

type VehicleRecord = {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: string;
  color?: string;
  fuelType?: string;
  customerName?: string;
  customerPhone?: string;
};

type IntakePhoto = {
  id: string;
  label: string;
  url: string;
};

type TakeNoteEntry = {
  id: string;
  note: string;
  photoUrl: string;
};

type ArrivalCheckKey = "lights" | "brokenGlass" | "wipers" | "hornCondition";

type ArrivalCheckStatus = "Good" | "Needs Attention" | "Not Checked";

type ArrivalCheck = {
  key: ArrivalCheckKey;
  label: string;
  status: ArrivalCheckStatus;
  note: string;
};

type IntakeRecord = {
  id: string;
  createdAt: string;
  intakeNumber: string;
  intakeRoNumber: string;
  plate: string;
  make: string;
  model: string;
  year: string;
  exteriorPhotos: IntakePhoto[];
  takeNotes: TakeNoteEntry[];
  arrivalChecks: ArrivalCheck[];
  customerName: string;
  customerPhone: string;
  advisorNotes: string;
  savedBy: string;
  status: "Draft" | "Saved";
};

type ShopFloorStatus =
  | "Waiting"
  | "In Progress"
  | "Waiting Parts"
  | "Quality Check"
  | "Ready Release";

type ShopFloorBay = {
  id: string;
  bay: string;
  roNumber: string;
  customer: string;
  vehicle: string;
  plate: string;
  technician: string;
  status: ShopFloorStatus;
  startTime: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
};

type TechnicianStat = {
  id: string;
  name: string;
  role: UserRole;
  clockedIn: boolean;
  active: boolean;
  currentJob: string;
  jobsCompleted: number;
  flatRateHours: number;
};

type CustomerProfile = {
  id: string;
  customerName: string;
  phone: string;
  plate: string;
  vehicle: string;
  totalVisits: number;
  lastServiceDate: string;
  lastService: string;
};

type AlertItem = {
  id: string;
  title: string;
  detail: string;
  severity: "Info" | "Warning" | "Critical";
};

type NewUserForm = {
  name: string;
  username: string;
  password: string;
  role: UserRole;
};

type IntakeFormState = {
  plate: string;
  make: string;
  model: string;
  year: string;
  exteriorPhotos: IntakePhoto[];
  takeNotes: TakeNoteEntry[];
  arrivalChecks: ArrivalCheck[];
  customerName: string;
  customerPhone: string;
  advisorNotes: string;
};

type PartsRequestStatus =
  | "Draft"
  | "Sent to Suppliers"
  | "Waiting for Bids"
  | "Supplier Selected"
  | "Ordered"
  | "Shipped"
  | "Parts Arrived"
  | "Closed"
  | "Cancelled";

type ReceivedCondition = "Good" | "Damaged" | "Incomplete" | "";

type PartsRequest = {
  id: string;
  requestNumber: string;
  roId: string;
  roNumber: string;
  workLineId?: string;
  workLineLabel?: string;
  plate: string;
  vehicle: string;
  partName: string;
  partNumber: string;
  quantity: number;
  notes: string;
  urgency: "Low" | "Normal" | "High" | "Urgent";
  requestedBy: string;
  photoUrls: string[];
  status: PartsRequestStatus;
  selectedSupplier?: string;
  receivedBy?: string;
  receivedAt?: string;
  receivedCondition?: ReceivedCondition;
  receivedNotes?: string;
  receivedPhotoUrl?: string;
  createdAt: string;
};

type SupplierBid = {
  id: string;
  partsRequestId: string;
  supplierName: string;
  quotedAmount: number;
  eta: string;
  notes: string;
  contactPerson: string;
  contactNumber: string;
  status: "Pending" | "Quoted" | "Selected" | "Rejected";
  createdAt: string;
};

type PartsRequestForm = {
  roNumber: string;
  workLineId: string;
  workLineLabel: string;
  plate: string;
  vehicle: string;
  partName: string;
  partNumber: string;
  quantity: string;
  notes: string;
  urgency: "Low" | "Normal" | "High" | "Urgent";
  requestedBy: string;
  photoUrls: string[];
};

type SupplierBidForm = {
  partsRequestId: string;
  supplierName: string;
  quotedAmount: string;
  eta: string;
  notes: string;
  contactPerson: string;
  contactNumber: string;
};

type PartsReceiveForm = {
  receivedBy: string;
  receivedCondition: ReceivedCondition;
  receivedNotes: string;
  receivedPhotoUrl: string;
};

/* =========================================================
   SEED DATA
========================================================= */

const VEHICLE_MASTER_LIST: VehicleMasterMake[] = [
  { make: "Toyota", models: ["Vios", "Corolla Altis", "Hilux", "Fortuner", "Innova"] },
  { make: "Mitsubishi", models: ["Montero Sport", "Strada", "Mirage", "Xpander", "L300"] },
  { make: "Honda", models: ["City", "Civic", "CR-V", "BR-V", "Mobilio"] },
  { make: "Nissan", models: ["Navara", "Terra", "Almera", "Urvan", "Patrol"] },
  { make: "Ford", models: ["Ranger", "Everest", "EcoSport", "Explorer"] },
  { make: "Isuzu", models: ["D-Max", "mu-X", "Traviz"] },
  { make: "Hyundai", models: ["Accent", "Starex", "Tucson", "Santa Fe"] },
  { make: "Kia", models: ["Soluto", "Seltos", "Sportage"] },
  { make: "Suzuki", models: ["Dzire", "Ertiga", "Jimny", "Carry"] },
  { make: "Mazda", models: ["Mazda2", "Mazda3", "CX-5", "BT-50"] },
];

const SEED_LOGIN_ACCOUNTS: LoginAccount[] = [
  {
    id: "acct-1",
    name: "Jomar Admin",
    username: "admin",
    password: "admin123",
    role: "Admin",
    active: true,
  },
  {
    id: "acct-2",
    name: "Marco Advisor",
    username: "advisor",
    password: "advisor123",
    role: "Service Advisor",
    active: true,
  },
  {
    id: "acct-3",
    name: "Ramon Chief",
    username: "chief",
    password: "chief123",
    role: "Chief Mechanic",
    active: true,
  },
  {
    id: "acct-4",
    name: "Leo Senior",
    username: "senior",
    password: "senior123",
    role: "Senior Mechanic",
    active: true,
  },
];

const SEED_VEHICLES: VehicleRecord[] = [
  {
    id: "veh-1",
    plate: "ABC1234",
    make: "Toyota",
    model: "Hilux",
    year: "2022",
    color: "White",
    fuelType: "Diesel",
    customerName: "Juan Dela Cruz",
    customerPhone: "09171234567",
  },
  {
    id: "veh-2",
    plate: "NCC1001",
    make: "Mitsubishi",
    model: "Montero Sport",
    year: "2021",
    color: "Black",
    fuelType: "Diesel",
    customerName: "Maria Santos",
    customerPhone: "09179876543",
  },
  {
    id: "veh-3",
    plate: "XYZ9087",
    make: "Honda",
    model: "City",
    year: "2020",
    color: "Silver",
    fuelType: "Gasoline",
    customerName: "Pedro Reyes",
    customerPhone: "09175552222",
  },
];

const SEED_SHOP_FLOOR: ShopFloorBay[] = [
  {
    id: "bay-1",
    bay: "Bay 1",
    roNumber: "RO-1001",
    customer: "Juan Dela Cruz",
    vehicle: "2022 Toyota Hilux",
    plate: "ABC1234",
    technician: "Ramon Chief",
    status: "In Progress",
    startTime: "8:00 AM",
    priority: "High",
  },
  {
    id: "bay-2",
    bay: "Bay 2",
    roNumber: "RO-1002",
    customer: "Maria Santos",
    vehicle: "2021 Mitsubishi Montero Sport",
    plate: "NCC1001",
    technician: "Leo Senior",
    status: "Waiting Parts",
    startTime: "8:30 AM",
    priority: "Urgent",
  },
  {
    id: "bay-3",
    bay: "Bay 3",
    roNumber: "RO-1003",
    customer: "Pedro Reyes",
    vehicle: "2020 Honda City",
    plate: "XYZ9087",
    technician: "Open",
    status: "Waiting",
    startTime: "9:00 AM",
    priority: "Normal",
  },
];

const SEED_TECH_STATS: TechnicianStat[] = [
  {
    id: "tech-1",
    name: "Ramon Chief",
    role: "Chief Mechanic",
    clockedIn: true,
    active: true,
    currentJob: "RO-1001",
    jobsCompleted: 4,
    flatRateHours: 7.5,
  },
  {
    id: "tech-2",
    name: "Leo Senior",
    role: "Senior Mechanic",
    clockedIn: true,
    active: true,
    currentJob: "RO-1002",
    jobsCompleted: 3,
    flatRateHours: 6.2,
  },
  {
    id: "tech-3",
    name: "Nico General",
    role: "General Mechanic",
    clockedIn: true,
    active: false,
    currentJob: "",
    jobsCompleted: 2,
    flatRateHours: 4.8,
  },
  {
    id: "tech-4",
    name: "Paul Junior",
    role: "Junior Mechanic",
    clockedIn: false,
    active: false,
    currentJob: "",
    jobsCompleted: 1,
    flatRateHours: 2.1,
  },
];

const SEED_CUSTOMERS: CustomerProfile[] = [
  {
    id: "cust-1",
    customerName: "Juan Dela Cruz",
    phone: "09171234567",
    plate: "ABC1234",
    vehicle: "2022 Toyota Hilux",
    totalVisits: 5,
    lastServiceDate: "2026-03-10",
    lastService: "PMS + Brake Inspection",
  },
  {
    id: "cust-2",
    customerName: "Maria Santos",
    phone: "09179876543",
    plate: "NCC1001",
    vehicle: "2021 Mitsubishi Montero Sport",
    totalVisits: 3,
    lastServiceDate: "2026-03-12",
    lastService: "Suspension Check",
  },
  {
    id: "cust-3",
    customerName: "Pedro Reyes",
    phone: "09175552222",
    plate: "XYZ9087",
    vehicle: "2020 Honda City",
    totalVisits: 2,
    lastServiceDate: "2026-02-28",
    lastService: "Oil Change",
  },
];

const SEED_ALERTS: AlertItem[] = [
  {
    id: "alert-1",
    title: "Bay 2 waiting on parts",
    detail: "Montero Sport front suspension parts still pending.",
    severity: "Warning",
  },
  {
    id: "alert-2",
    title: "Two intakes not yet inspected",
    detail: "Make sure inspection workflow starts after intake save.",
    severity: "Info",
  },
  {
    id: "alert-3",
    title: "Urgent vehicle in queue",
    detail: "Fleet customer unit marked urgent for same-day release.",
    severity: "Critical",
  },
];

const SEED_PARTS_REQUESTS: PartsRequest[] = [
  {
    id: "pr-1",
    requestNumber: "PR-0001",
    roId: "ro-1002",
    roNumber: "RO-1002",
    workLineId: "wl-front-suspension",
    workLineLabel: "Front Suspension Repair",
    plate: "NCC1001",
    vehicle: "2021 Mitsubishi Montero Sport",
    partName: "Front Lower Arm Assembly",
    partNumber: "MLA-2021-FLA",
    quantity: 2,
    notes: "Need genuine or OEM quality. Urgent for same-day repair planning.",
    urgency: "Urgent",
    requestedBy: "Leo Senior",
    photoUrls: [""],
    status: "Waiting for Bids",
    createdAt: new Date().toISOString(),
  },
];

const SEED_SUPPLIER_BIDS: SupplierBid[] = [
  {
    id: "bid-1",
    partsRequestId: "pr-1",
    supplierName: "North Auto Supply",
    quotedAmount: 16500,
    eta: "Today 4:00 PM",
    notes: "OEM replacement available.",
    contactPerson: "Mark",
    contactNumber: "09170001111",
    status: "Quoted",
    createdAt: new Date().toISOString(),
  },
  {
    id: "bid-2",
    partsRequestId: "pr-1",
    supplierName: "Ilocos Parts Center",
    quotedAmount: 15400,
    eta: "Tomorrow 10:00 AM",
    notes: "Aftermarket premium brand.",
    contactPerson: "Ana",
    contactNumber: "09175556666",
    status: "Quoted",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_ARRIVAL_CHECKS: ArrivalCheck[] = [
  { key: "lights", label: "Lights", status: "Not Checked", note: "" },
  { key: "brokenGlass", label: "Broken Glass", status: "Not Checked", note: "" },
  { key: "wipers", label: "Wipers", status: "Not Checked", note: "" },
  { key: "hornCondition", label: "Horn Condition", status: "Not Checked", note: "" },
];

const DEFAULT_TAKE_NOTES: TakeNoteEntry[] = [
  { id: "tn-1", note: "", photoUrl: "" },
  { id: "tn-2", note: "", photoUrl: "" },
  { id: "tn-3", note: "", photoUrl: "" },
];

const DEFAULT_NEW_USER: NewUserForm = {
  name: "",
  username: "",
  password: "",
  role: "Service Advisor",
};

const DEFAULT_INTAKE_FORM: IntakeFormState = {
  plate: "",
  make: "",
  model: "",
  year: "",
  exteriorPhotos: [],
  takeNotes: DEFAULT_TAKE_NOTES,
  arrivalChecks: DEFAULT_ARRIVAL_CHECKS,
  customerName: "",
  customerPhone: "",
  advisorNotes: "",
};

const DEFAULT_PARTS_REQUEST_FORM: PartsRequestForm = {
  roNumber: "",
  workLineId: "",
  workLineLabel: "",
  plate: "",
  vehicle: "",
  partName: "",
  partNumber: "",
  quantity: "1",
  notes: "",
  urgency: "Normal",
  requestedBy: "",
  photoUrls: [""],
};

const DEFAULT_SUPPLIER_BID_FORM: SupplierBidForm = {
  partsRequestId: "",
  supplierName: "",
  quotedAmount: "",
  eta: "",
  notes: "",
  contactPerson: "",
  contactNumber: "",
};

const DEFAULT_PARTS_RECEIVE_FORM: PartsReceiveForm = {
  receivedBy: "",
  receivedCondition: "",
  receivedNotes: "",
  receivedPhotoUrl: "",
};

/* =========================================================
   HELPERS
========================================================= */

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const loadState = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  return safeParse<T>(window.localStorage.getItem(key), fallback);
};

const saveState = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getStatusColor = (status: ShopFloorStatus) => {
  switch (status) {
    case "Waiting":
      return "#f59e0b";
    case "In Progress":
      return "#2563eb";
    case "Waiting Parts":
      return "#dc2626";
    case "Quality Check":
      return "#7c3aed";
    case "Ready Release":
      return "#16a34a";
    default:
      return "#6b7280";
  }
};

const getPriorityColor = (priority: ShopFloorBay["priority"]) => {
  switch (priority) {
    case "Urgent":
      return "#dc2626";
    case "High":
      return "#ea580c";
    case "Normal":
      return "#2563eb";
    case "Low":
      return "#6b7280";
    default:
      return "#6b7280";
  }
};

const getAlertColor = (severity: AlertItem["severity"]) => {
  switch (severity) {
    case "Critical":
      return "#dc2626";
    case "Warning":
      return "#ea580c";
    case "Info":
      return "#2563eb";
    default:
      return "#6b7280";
  }
};

const getIntakeNumber = (count: number) => `INT-${String(count + 1).padStart(4, "0")}`;
const getRoNumber = (count: number) => `RO-${String(1001 + count).padStart(4, "0")}`;
const getPartsRequestNumber = (count: number) => `PR-${String(count + 1).padStart(4, "0")}`;

const matchesText = (source: string, query: string) =>
  source.toLowerCase().includes(query.trim().toLowerCase());

const getPartsStatusColor = (status: PartsRequestStatus) => {
  switch (status) {
    case "Draft":
      return "#6b7280";
    case "Sent to Suppliers":
      return "#2563eb";
    case "Waiting for Bids":
      return "#7c3aed";
    case "Supplier Selected":
      return "#0891b2";
    case "Ordered":
      return "#ea580c";
    case "Shipped":
      return "#0f766e";
    case "Parts Arrived":
      return "#16a34a";
    case "Closed":
      return "#111827";
    case "Cancelled":
      return "#dc2626";
    default:
      return "#6b7280";
  }
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f5f7fb",
  color: "#111827",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ margin: 0, fontSize: 24 }}>{title}</h2>
    {subtitle ? (
      <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>{subtitle}</p>
    ) : null}
  </div>
);

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "#eef2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#4338ca",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) => {
  const background =
    variant === "primary" ? "#111827" : variant === "danger" ? "#dc2626" : "#ffffff";
  const color = variant === "secondary" ? "#111827" : "#ffffff";
  const border = variant === "secondary" ? "1px solid #d1d5db" : "1px solid transparent";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background,
        color,
        border,
        borderRadius: 12,
        padding: "10px 14px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <label style={{ display: "block" }}>
    <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 600 }}>{label}</div>
    <input
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #d1d5db",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
      }}
    />
  </label>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <label style={{ display: "block" }}>
    <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 600 }}>{label}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #d1d5db",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
        background: "#fff",
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <label style={{ display: "block" }}>
    <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: 600 }}>{label}</div>
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #d1d5db",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
        resize: "vertical",
      }}
    />
  </label>
);

const Badge = ({
  text,
  background,
  color = "#fff",
}: {
  text: string;
  background: string;
  color?: string;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: 999,
      background,
      color,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </span>
);

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [managedUsers, setManagedUsers] = useState<LoginAccount[]>(() =>
    loadState("dvi_managed_users", SEED_LOGIN_ACCOUNTS),
  );
  const [newUser, setNewUser] = useState<NewUserForm>(() =>
    loadState("dvi_new_user", DEFAULT_NEW_USER),
  );
  const [currentUser, setCurrentUser] = useState<LoginAccount | null>(() =>
    loadState<LoginAccount | null>("dvi_current_user", null),
  );

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [vehicles] = useState<VehicleRecord[]>(SEED_VEHICLES);
  const [intakeForm, setIntakeForm] = useState<IntakeFormState>(() =>
    loadState("dvi_intake_form", DEFAULT_INTAKE_FORM),
  );
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>(() =>
    loadState("dvi_intake_records", []),
  );

  const [shopFloorBoard, setShopFloorBoard] = useState<ShopFloorBay[]>(() =>
    loadState("dvi_shop_floor_board", SEED_SHOP_FLOOR),
  );
  const [techStats, setTechStats] = useState<TechnicianStat[]>(() =>
    loadState("dvi_tech_stats", SEED_TECH_STATS),
  );
  const [customerProfiles] = useState<CustomerProfile[]>(SEED_CUSTOMERS);
  const [alerts] = useState<AlertItem[]>(SEED_ALERTS);

  const [partsRequests, setPartsRequests] = useState<PartsRequest[]>(() =>
    loadState("dvi_parts_requests", SEED_PARTS_REQUESTS),
  );
  const [supplierBids, setSupplierBids] = useState<SupplierBid[]>(() =>
    loadState("dvi_supplier_bids", SEED_SUPPLIER_BIDS),
  );
  const [partsRequestForm, setPartsRequestForm] = useState<PartsRequestForm>(() =>
    loadState("dvi_parts_request_form", DEFAULT_PARTS_REQUEST_FORM),
  );
  const [supplierBidForm, setSupplierBidForm] = useState<SupplierBidForm>(DEFAULT_SUPPLIER_BID_FORM);
  const [receiveForms, setReceiveForms] = useState<Record<string, PartsReceiveForm>>({});

  const [customerQuery, setCustomerQuery] = useState("");
  const [inspectionQuery, setInspectionQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [partsSearch, setPartsSearch] = useState("");
  const [selectedPartsRequestId, setSelectedPartsRequestId] = useState<string>("");

  useEffect(() => saveState("dvi_managed_users", managedUsers), [managedUsers]);
  useEffect(() => saveState("dvi_new_user", newUser), [newUser]);
  useEffect(() => saveState("dvi_current_user", currentUser), [currentUser]);
  useEffect(() => saveState("dvi_intake_form", intakeForm), [intakeForm]);
  useEffect(() => saveState("dvi_intake_records", intakeRecords), [intakeRecords]);
  useEffect(() => saveState("dvi_shop_floor_board", shopFloorBoard), [shopFloorBoard]);
  useEffect(() => saveState("dvi_tech_stats", techStats), [techStats]);
  useEffect(() => saveState("dvi_parts_requests", partsRequests), [partsRequests]);
  useEffect(() => saveState("dvi_supplier_bids", supplierBids), [supplierBids]);
  useEffect(() => saveState("dvi_parts_request_form", partsRequestForm), [partsRequestForm]);

  const vehicleMakeOptions = useMemo(
    () => ["Select make", ...VEHICLE_MASTER_LIST.map((item) => item.make)],
    [],
  );

  const selectedMakeModels = useMemo(() => {
    const found = VEHICLE_MASTER_LIST.find((item) => item.make === intakeForm.make);
    return found ? ["Select model", ...found.models] : ["Select model"];
  }, [intakeForm.make]);

  const roOptions = useMemo(() => {
    const fromShop = shopFloorBoard.map((bay) => bay.roNumber);
    const fromIntake = intakeRecords.map((record) => record.intakeRoNumber);
    return Array.from(new Set([...fromShop, ...fromIntake])).sort();
  }, [shopFloorBoard, intakeRecords]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customerProfiles;
    return customerProfiles.filter(
      (customer) =>
        matchesText(customer.customerName, q) ||
        matchesText(customer.plate, q) ||
        matchesText(customer.vehicle, q) ||
        matchesText(customer.phone, q),
    );
  }, [customerProfiles, customerQuery]);

  const filteredIntakes = useMemo(() => {
    const q = inspectionQuery.trim().toLowerCase();
    if (!q) return intakeRecords;
    return intakeRecords.filter(
      (record) =>
        matchesText(record.intakeNumber, q) ||
        matchesText(record.plate, q) ||
        matchesText(record.make, q) ||
        matchesText(record.model, q) ||
        matchesText(record.customerName, q) ||
        matchesText(record.intakeRoNumber, q),
    );
  }, [inspectionQuery, intakeRecords]);

  const filteredPartsRequests = useMemo(() => {
    const q = partsSearch.trim().toLowerCase();
    if (!q) return partsRequests;
    return partsRequests.filter(
      (request) =>
        matchesText(request.requestNumber, q) ||
        matchesText(request.roNumber, q) ||
        matchesText(request.plate, q) ||
        matchesText(request.vehicle, q) ||
        matchesText(request.partName, q) ||
        matchesText(request.partNumber, q) ||
        matchesText(request.requestedBy, q) ||
        matchesText(request.selectedSupplier || "", q),
    );
  }, [partsRequests, partsSearch]);

  const dashboardStats = useMemo(() => {
    const activeJobs = shopFloorBoard.filter((bay) => bay.status === "In Progress").length;
    const waitingParts = shopFloorBoard.filter((bay) => bay.status === "Waiting Parts").length;
    const readyRelease = shopFloorBoard.filter((bay) => bay.status === "Ready Release").length;
    const savedToday = intakeRecords.length;
    return { activeJobs, waitingParts, readyRelease, savedToday };
  }, [shopFloorBoard, intakeRecords]);

  const partsStats = useMemo(() => {
    const open = partsRequests.filter(
      (request) => !["Closed", "Cancelled"].includes(request.status),
    ).length;
    const waitingBids = partsRequests.filter((request) => request.status === "Waiting for Bids").length;
    const arrived = partsRequests.filter((request) => request.status === "Parts Arrived").length;
    return { open, waitingBids, arrived };
  }, [partsRequests]);

  const visibleNavigation = useMemo(
    () =>
      [
        { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
        { key: "vehicleIntake", label: "Vehicle Intake", icon: <Car size={18} /> },
        { key: "inspection", label: "Inspection", icon: <ClipboardList size={18} /> },
        { key: "shopFloor", label: "Shop Floor", icon: <Wrench size={18} /> },
        { key: "technicianBoard", label: "Technician Board", icon: <Timer size={18} /> },
        { key: "customers", label: "Customers", icon: <Users size={18} /> },
        { key: "parts", label: "Parts", icon: <PackageCheck size={18} /> },
        { key: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
        { key: "admin", label: "Admin", icon: <UserCog size={18} /> },
        { key: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
      ] as { key: ViewKey; label: string; icon: React.ReactNode }[],
    [],
  );

  const selectedRequest = useMemo(
    () => partsRequests.find((request) => request.id === selectedPartsRequestId) || null,
    [partsRequests, selectedPartsRequestId],
  );

  const selectedRequestBids = useMemo(
    () => supplierBids.filter((bid) => bid.partsRequestId === selectedPartsRequestId),
    [supplierBids, selectedPartsRequestId],
  );

  const handleLogin = () => {
    const found = managedUsers.find(
      (user) =>
        user.active &&
        user.username.trim().toLowerCase() === loginUsername.trim().toLowerCase() &&
        user.password === loginPassword,
    );

    if (!found) {
      setLoginError("Invalid username or password.");
      return;
    }

    setCurrentUser(found);
    setLoginError("");
    setLoginUsername("");
    setLoginPassword("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView("dashboard");
    setSidebarOpen(false);
  };

  const resetIntakeForm = () => {
    setIntakeForm({
      plate: "",
      make: "",
      model: "",
      year: "",
      exteriorPhotos: [],
      takeNotes: DEFAULT_TAKE_NOTES.map((note) => ({ ...note, id: makeId("tn") })),
      arrivalChecks: DEFAULT_ARRIVAL_CHECKS.map((check) => ({ ...check })),
      customerName: "",
      customerPhone: "",
      advisorNotes: "",
    });
  };

  const resetPartsRequestForm = () => {
    setPartsRequestForm({
      ...DEFAULT_PARTS_REQUEST_FORM,
      requestedBy: currentUser?.name || "",
      photoUrls: [""],
    });
  };

  useEffect(() => {
    if (!loadState("dvi_intake_form", null as IntakeFormState | null)) {
      resetIntakeForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!partsRequestForm.requestedBy && currentUser?.name) {
      setPartsRequestForm((prev) => ({ ...prev, requestedBy: currentUser.name }));
    }
  }, [currentUser, partsRequestForm.requestedBy]);

  useEffect(() => {
    if (!selectedPartsRequestId && partsRequests.length > 0) {
      setSelectedPartsRequestId(partsRequests[0].id);
    }
  }, [partsRequests, selectedPartsRequestId]);

  const handlePlateBlurAutofill = () => {
    const found = vehicles.find(
      (vehicle) => vehicle.plate.trim().toLowerCase() === intakeForm.plate.trim().toLowerCase(),
    );

    if (!found) return;

    setIntakeForm((prev) => ({
      ...prev,
      make: found.make,
      model: found.model,
      year: found.year,
      customerName: prev.customerName || found.customerName || "",
      customerPhone: prev.customerPhone || found.customerPhone || "",
    }));
  };

  const autofillPartsFromRo = (roNumber: string) => {
    const shopMatch = shopFloorBoard.find((bay) => bay.roNumber === roNumber);
    if (shopMatch) {
      setPartsRequestForm((prev) => ({
        ...prev,
        roNumber,
        plate: shopMatch.plate,
        vehicle: shopMatch.vehicle,
      }));
      return;
    }

    const intakeMatch = intakeRecords.find((record) => record.intakeRoNumber === roNumber);
    if (intakeMatch) {
      setPartsRequestForm((prev) => ({
        ...prev,
        roNumber,
        plate: intakeMatch.plate,
        vehicle: `${intakeMatch.year} ${intakeMatch.make} ${intakeMatch.model}`,
      }));
    }
  };

  const addExteriorPhoto = () => {
    setIntakeForm((prev) => ({
      ...prev,
      exteriorPhotos: [
        ...prev.exteriorPhotos,
        { id: makeId("photo"), label: `Exterior Photo ${prev.exteriorPhotos.length + 1}`, url: "" },
      ],
    }));
  };

  const updateExteriorPhoto = (id: string, field: "label" | "url", value: string) => {
    setIntakeForm((prev) => ({
      ...prev,
      exteriorPhotos: prev.exteriorPhotos.map((photo) =>
        photo.id === id ? { ...photo, [field]: value } : photo,
      ),
    }));
  };

  const removeExteriorPhoto = (id: string) => {
    setIntakeForm((prev) => ({
      ...prev,
      exteriorPhotos: prev.exteriorPhotos.filter((photo) => photo.id !== id),
    }));
  };

  const updateTakeNote = (id: string, field: "note" | "photoUrl", value: string) => {
    setIntakeForm((prev) => ({
      ...prev,
      takeNotes: prev.takeNotes.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const updateArrivalCheck = (
    key: ArrivalCheckKey,
    field: "status" | "note",
    value: ArrivalCheckStatus | string,
  ) => {
    setIntakeForm((prev) => ({
      ...prev,
      arrivalChecks: prev.arrivalChecks.map((check) =>
        check.key === key ? { ...check, [field]: value } : check,
      ),
    }));
  };

  const updatePartsPhotoUrl = (index: number, value: string) => {
    setPartsRequestForm((prev) => ({
      ...prev,
      photoUrls: prev.photoUrls.map((url, i) => (i === index ? value : url)),
    }));
  };

  const addPartsPhotoUrl = () => {
    setPartsRequestForm((prev) => ({
      ...prev,
      photoUrls: [...prev.photoUrls, ""],
    }));
  };

  const removePartsPhotoUrl = (index: number) => {
    setPartsRequestForm((prev) => {
      const next = prev.photoUrls.filter((_, i) => i !== index);
      return { ...prev, photoUrls: next.length ? next : [""] };
    });
  };

  const handleSaveIntake = () => {
    if (!intakeForm.plate.trim()) {
      window.alert("Plate number is required.");
      return;
    }

    if (!intakeForm.make.trim() || intakeForm.make === "Select make") {
      window.alert("Please select vehicle make.");
      return;
    }

    if (!intakeForm.model.trim() || intakeForm.model === "Select model") {
      window.alert("Please select vehicle model.");
      return;
    }

    if (!intakeForm.year.trim()) {
      window.alert("Year is required.");
      return;
    }

    const roNumber = getRoNumber(shopFloorBoard.length);

    const record: IntakeRecord = {
      id: makeId("intake"),
      createdAt: new Date().toISOString(),
      intakeNumber: getIntakeNumber(intakeRecords.length),
      intakeRoNumber: roNumber,
      plate: intakeForm.plate.trim().toUpperCase(),
      make: intakeForm.make,
      model: intakeForm.model,
      year: intakeForm.year,
      exteriorPhotos: intakeForm.exteriorPhotos,
      takeNotes: intakeForm.takeNotes,
      arrivalChecks: intakeForm.arrivalChecks,
      customerName: intakeForm.customerName,
      customerPhone: intakeForm.customerPhone,
      advisorNotes: intakeForm.advisorNotes,
      savedBy: currentUser?.name || "Unknown User",
      status: "Saved",
    };

    setIntakeRecords((prev) => [record, ...prev]);

    setShopFloorBoard((prev) => [
      {
        id: makeId("bay"),
        bay: `Bay ${prev.length + 1}`,
        roNumber,
        customer: record.customerName || "Walk-in Customer",
        vehicle: `${record.year} ${record.make} ${record.model}`,
        plate: record.plate,
        technician: "Open",
        status: "Waiting",
        startTime: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        priority: "Normal",
      },
      ...prev,
    ]);

    resetIntakeForm();
    window.alert(`Vehicle intake saved with ${roNumber}.`);
    setActiveView("inspection");
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.password.trim()) {
      window.alert("Please complete name, username, and password.");
      return;
    }

    const exists = managedUsers.some(
      (user) => user.username.trim().toLowerCase() === newUser.username.trim().toLowerCase(),
    );

    if (exists) {
      window.alert("Username already exists.");
      return;
    }

    const createdUser: LoginAccount = {
      id: makeId("acct"),
      name: newUser.name.trim(),
      username: newUser.username.trim(),
      password: newUser.password,
      role: newUser.role,
      active: true,
    };

    setManagedUsers((prev) => [createdUser, ...prev]);
    setNewUser(DEFAULT_NEW_USER);
    window.alert("User created.");
  };

  const toggleUserActive = (id: string) => {
    setManagedUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, active: !user.active } : user)),
    );
  };

  const toggleTechClock = (id: string) => {
    setTechStats((prev) =>
      prev.map((tech) =>
        tech.id === id
          ? {
              ...tech,
              clockedIn: !tech.clockedIn,
              active: tech.clockedIn ? false : tech.active,
              currentJob: tech.clockedIn ? "" : tech.currentJob,
            }
          : tech,
      ),
    );
  };

  const toggleTechWorking = (id: string) => {
    setTechStats((prev) =>
      prev.map((tech) =>
        tech.id === id
          ? {
              ...tech,
              active: tech.clockedIn ? !tech.active : false,
              currentJob: tech.clockedIn ? (tech.active ? "" : tech.currentJob || "Shop Task") : "",
            }
          : tech,
      ),
    );
  };

  const moveBayStatus = (id: string, status: ShopFloorStatus) => {
    setShopFloorBoard((prev) => prev.map((bay) => (bay.id === id ? { ...bay, status } : bay)));
  };

  const handleCreatePartsRequest = () => {
    if (!partsRequestForm.roNumber.trim()) {
      window.alert("RO Number is required.");
      return;
    }
    if (!partsRequestForm.plate.trim()) {
      window.alert("Plate is required.");
      return;
    }
    if (!partsRequestForm.vehicle.trim()) {
      window.alert("Vehicle is required.");
      return;
    }
    if (!partsRequestForm.partName.trim()) {
      window.alert("Part name is required.");
      return;
    }
    if (!partsRequestForm.quantity.trim() || Number(partsRequestForm.quantity) <= 0) {
      window.alert("Quantity must be greater than zero.");
      return;
    }

    const newRequest: PartsRequest = {
      id: makeId("pr"),
      requestNumber: getPartsRequestNumber(partsRequests.length),
      roId: partsRequestForm.roNumber,
      roNumber: partsRequestForm.roNumber,
      workLineId: partsRequestForm.workLineId || undefined,
      workLineLabel: partsRequestForm.workLineLabel || undefined,
      plate: partsRequestForm.plate.toUpperCase(),
      vehicle: partsRequestForm.vehicle,
      partName: partsRequestForm.partName,
      partNumber: partsRequestForm.partNumber,
      quantity: Number(partsRequestForm.quantity),
      notes: partsRequestForm.notes,
      urgency: partsRequestForm.urgency,
      requestedBy: partsRequestForm.requestedBy || currentUser?.name || "Unknown User",
      photoUrls: partsRequestForm.photoUrls.filter((url) => url.trim()),
      status: "Draft",
      createdAt: new Date().toISOString(),
    };

    setPartsRequests((prev) => [newRequest, ...prev]);
    setSelectedPartsRequestId(newRequest.id);
    resetPartsRequestForm();
    window.alert(`Parts request ${newRequest.requestNumber} created.`);
  };

  const updatePartsRequestStatus = (requestId: string, status: PartsRequestStatus) => {
    setPartsRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
            }
          : request,
      ),
    );

    const request = partsRequests.find((item) => item.id === requestId);
    if (!request) return;

    if (status === "Waiting for Bids" || status === "Sent to Suppliers") {
      setShopFloorBoard((prev) =>
        prev.map((bay) =>
          bay.roNumber === request.roNumber ? { ...bay, status: "Waiting Parts" } : bay,
        ),
      );
    }

    if (status === "Parts Arrived" || status === "Closed") {
      setShopFloorBoard((prev) =>
        prev.map((bay) =>
          bay.roNumber === request.roNumber && bay.status === "Waiting Parts"
            ? { ...bay, status: "In Progress" }
            : bay,
        ),
      );
    }
  };

  const handleAddSupplierBid = () => {
    if (!supplierBidForm.partsRequestId) {
      window.alert("Select a parts request first.");
      return;
    }
    if (!supplierBidForm.supplierName.trim()) {
      window.alert("Supplier name is required.");
      return;
    }
    if (!supplierBidForm.quotedAmount.trim() || Number(supplierBidForm.quotedAmount) <= 0) {
      window.alert("Quoted amount must be greater than zero.");
      return;
    }

    const newBid: SupplierBid = {
      id: makeId("bid"),
      partsRequestId: supplierBidForm.partsRequestId,
      supplierName: supplierBidForm.supplierName,
      quotedAmount: Number(supplierBidForm.quotedAmount),
      eta: supplierBidForm.eta,
      notes: supplierBidForm.notes,
      contactPerson: supplierBidForm.contactPerson,
      contactNumber: supplierBidForm.contactNumber,
      status: "Quoted",
      createdAt: new Date().toISOString(),
    };

    setSupplierBids((prev) => [newBid, ...prev]);

    const relatedRequest = partsRequests.find((request) => request.id === supplierBidForm.partsRequestId);
    if (relatedRequest && ["Draft", "Sent to Suppliers"].includes(relatedRequest.status)) {
      updatePartsRequestStatus(relatedRequest.id, "Waiting for Bids");
    }

    setSupplierBidForm((prev) => ({
      ...DEFAULT_SUPPLIER_BID_FORM,
      partsRequestId: prev.partsRequestId,
    }));
    window.alert("Supplier bid added.");
  };

  const handleSelectSupplierBid = (bidId: string) => {
    const bid = supplierBids.find((item) => item.id === bidId);
    if (!bid) return;

    setSupplierBids((prev) =>
      prev.map((item) =>
        item.partsRequestId === bid.partsRequestId
          ? { ...item, status: item.id === bidId ? "Selected" : "Rejected" }
          : item,
      ),
    );

    setPartsRequests((prev) =>
      prev.map((request) =>
        request.id === bid.partsRequestId
          ? {
              ...request,
              selectedSupplier: bid.supplierName,
              status: "Supplier Selected",
            }
          : request,
      ),
    );
  };

  const setReceiveFormField = (requestId: string, field: keyof PartsReceiveForm, value: string) => {
    setReceiveForms((prev) => ({
      ...prev,
      [requestId]: {
        ...(prev[requestId] || DEFAULT_PARTS_RECEIVE_FORM),
        [field]: value,
      },
    }));
  };

  const handleReceiveParts = (requestId: string) => {
    const request = partsRequests.find((item) => item.id === requestId);
    if (!request) return;

    const receiveForm = receiveForms[requestId] || DEFAULT_PARTS_RECEIVE_FORM;

    if (!receiveForm.receivedBy.trim()) {
      window.alert("Received by is required.");
      return;
    }
    if (!receiveForm.receivedCondition) {
      window.alert("Received condition is required.");
      return;
    }

    setPartsRequests((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status: "Parts Arrived",
              receivedBy: receiveForm.receivedBy,
              receivedAt: new Date().toISOString(),
              receivedCondition: receiveForm.receivedCondition,
              receivedNotes: receiveForm.receivedNotes,
              receivedPhotoUrl: receiveForm.receivedPhotoUrl,
            }
          : item,
      ),
    );

    setShopFloorBoard((prev) =>
      prev.map((bay) =>
        bay.roNumber === request.roNumber && bay.status === "Waiting Parts"
          ? { ...bay, status: "In Progress" }
          : bay,
      ),
    );

    window.alert("Parts received and status updated to Parts Arrived.");
  };

  const renderLogin = () => (
    <div
      style={{
        ...pageStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ ...cardStyle, width: "100%", maxWidth: 440 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#111827",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Shield size={26} />
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>DVI Workshop App</h1>
        <p style={{ margin: "0 0 20px", color: "#6b7280" }}>
          Sign in to continue to the workshop management dashboard.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <InputField
            label="Username"
            value={loginUsername}
            onChange={setLoginUsername}
            placeholder="Enter username"
          />
          <InputField
            label="Password"
            value={loginPassword}
            onChange={setLoginPassword}
            placeholder="Enter password"
            type="password"
          />
          {loginError ? (
            <div
              style={{
                borderRadius: 12,
                background: "#fef2f2",
                color: "#b91c1c",
                padding: 12,
                border: "1px solid #fecaca",
                fontSize: 14,
              }}
            >
              {loginError}
            </div>
          ) : null}
          <Button onClick={handleLogin}>Login</Button>
        </div>

        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid #e5e7eb",
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.6,
          }}
        >
          <div>Sample accounts:</div>
          <div>admin / admin123</div>
          <div>advisor / advisor123</div>
          <div>chief / chief123</div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle
        title="Dashboard"
        subtitle="Quick view of intake activity, live shop floor status, alerts, technician activity, and parts pipeline."
      />

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <StatCard title="Saved Intakes" value={dashboardStats.savedToday} icon={<ClipboardList size={20} />} />
        <StatCard title="Active Jobs" value={dashboardStats.activeJobs} icon={<Wrench size={20} />} />
        <StatCard title="Waiting Parts" value={dashboardStats.waitingParts} icon={<AlertTriangle size={20} />} />
        <StatCard title="Open Parts Requests" value={partsStats.open} icon={<PackageCheck size={20} />} />
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
        }}
      >
        <div style={cardStyle}>
          <SectionTitle title="Live Shop Floor Snapshot" subtitle="Current bay status overview." />
          <div style={{ display: "grid", gap: 12 }}>
            {shopFloorBoard.slice(0, 5).map((bay) => (
              <div
                key={bay.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700 }}>{bay.bay}</div>
                  <Badge text={bay.status} background={getStatusColor(bay.status)} />
                </div>
                <div style={{ color: "#374151", fontSize: 14 }}>{bay.roNumber}</div>
                <div style={{ fontSize: 14 }}>{bay.vehicle}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  Plate: {bay.plate} • Technician: {bay.technician}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle}>
            <SectionTitle title="Alerts" subtitle="Operational reminders and urgent items." />
            <div style={{ display: "grid", gap: 12 }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${getAlertColor(alert.severity)}22`,
                    background: `${getAlertColor(alert.severity)}10`,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Badge text={alert.severity} background={getAlertColor(alert.severity)} />
                    <div style={{ fontWeight: 700 }}>{alert.title}</div>
                  </div>
                  <div style={{ color: "#4b5563", fontSize: 14 }}>{alert.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <SectionTitle title="Parts Snapshot" subtitle="Quick parts status overview." />
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Open Requests</span>
                <strong>{partsStats.open}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Waiting for Bids</span>
                <strong>{partsStats.waitingBids}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Parts Arrived</span>
                <strong>{partsStats.arrived}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehicleIntake = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle
        title="Vehicle Intake"
        subtitle="Plate number first, then vehicle details, initial exterior photos, take-notes, arrival checks, and optional customer details."
      />

      <div style={{ ...cardStyle, display: "grid", gap: 20 }}>
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <InputField
            label="Plate Number"
            value={intakeForm.plate}
            onChange={(value) => setIntakeForm((prev) => ({ ...prev, plate: value.toUpperCase() }))}
            placeholder="Enter plate number"
          />
          <div style={{ display: "flex", alignItems: "end" }}>
            <Button variant="secondary" onClick={handlePlateBlurAutofill}>
              Load Vehicle Info
            </Button>
          </div>
          <SelectField
            label="Make"
            value={intakeForm.make || "Select make"}
            onChange={(value) =>
              setIntakeForm((prev) => ({
                ...prev,
                make: value === "Select make" ? "" : value,
                model: "",
              }))
            }
            options={vehicleMakeOptions}
          />
          <SelectField
            label="Model"
            value={intakeForm.model || "Select model"}
            onChange={(value) =>
              setIntakeForm((prev) => ({
                ...prev,
                model: value === "Select model" ? "" : value,
              }))
            }
            options={selectedMakeModels}
          />
          <InputField
            label="Year"
            value={intakeForm.year}
            onChange={(value) => setIntakeForm((prev) => ({ ...prev, year: value }))}
            placeholder="e.g. 2022"
          />
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Initial Exterior Photos</h3>
              <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
                Add exterior photo labels and URLs for now. File upload can be wired later.
              </p>
            </div>
            <Button variant="secondary" onClick={addExteriorPhoto}>
              <Plus size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Add Photo
            </Button>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {intakeForm.exteriorPhotos.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: 14 }}>No exterior photos added yet.</div>
            ) : null}

            {intakeForm.exteriorPhotos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                <InputField
                  label="Photo Label"
                  value={photo.label}
                  onChange={(value) => updateExteriorPhoto(photo.id, "label", value)}
                  placeholder="Front, rear, left side, right side"
                />
                <InputField
                  label="Photo URL"
                  value={photo.url}
                  onChange={(value) => updateExteriorPhoto(photo.id, "url", value)}
                  placeholder="Paste image URL"
                />
                <div style={{ display: "flex", alignItems: "end" }}>
                  <Button variant="danger" onClick={() => removeExteriorPhoto(photo.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Take-Note Entries</h3>
          <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: 14 }}>
            Three required slots with photo URL and note.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {intakeForm.takeNotes.map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                <InputField
                  label={`Take-Note ${index + 1} Photo URL`}
                  value={entry.photoUrl}
                  onChange={(value) => updateTakeNote(entry.id, "photoUrl", value)}
                  placeholder="Paste image URL"
                />
                <TextAreaField
                  label={`Take-Note ${index + 1} Note`}
                  value={entry.note}
                  onChange={(value) => updateTakeNote(entry.id, "note", value)}
                  placeholder="Describe scratches, dents, stains, missing parts, or concerns"
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Arrival Inspection Checks</h3>
          <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: 14 }}>
            Lights, broken glass, wipers, and horn condition. Each check includes status and short note.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            {intakeForm.arrivalChecks.map((check) => (
              <div
                key={check.key}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{check.label}</div>
                  <select
                    value={check.status}
                    onChange={(e) =>
                      updateArrivalCheck(check.key, "status", e.target.value as ArrivalCheckStatus)
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #d1d5db",
                      borderRadius: 12,
                      padding: "12px 14px",
                      fontSize: 14,
                      background: "#fff",
                    }}
                  >
                    <option value="Not Checked">Not Checked</option>
                    <option value="Good">Good</option>
                    <option value="Needs Attention">Needs Attention</option>
                  </select>
                </div>

                <TextAreaField
                  label="Short Note"
                  value={check.note}
                  onChange={(value) => updateArrivalCheck(check.key, "note", value)}
                  placeholder="Add short note"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Optional Customer Details</h3>
          <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: 14 }}>
            Customer name, phone, and service advisor notes can be added later.
          </p>
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <InputField
              label="Customer Name"
              value={intakeForm.customerName}
              onChange={(value) => setIntakeForm((prev) => ({ ...prev, customerName: value }))}
              placeholder="Optional"
            />
            <InputField
              label="Phone"
              value={intakeForm.customerPhone}
              onChange={(value) => setIntakeForm((prev) => ({ ...prev, customerPhone: value }))}
              placeholder="Optional"
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <TextAreaField
                label="Service Advisor Notes"
                value={intakeForm.advisorNotes}
                onChange={(value) => setIntakeForm((prev) => ({ ...prev, advisorNotes: value }))}
                placeholder="Optional advisor notes"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={resetIntakeForm}>
            Reset
          </Button>
          <Button onClick={handleSaveIntake}>
            <Save size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Save Intake
          </Button>
        </div>
      </div>
    </div>
  );

  const renderInspection = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle
        title="Inspection Queue"
        subtitle="Review saved intakes and use this page as the next step after intake."
      />

      <div style={cardStyle}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "minmax(0, 1fr) auto",
            alignItems: "end",
            marginBottom: 16,
          }}
        >
          <InputField
            label="Search Intake"
            value={inspectionQuery}
            onChange={setInspectionQuery}
            placeholder="Search by intake number, RO number, plate, make, model, customer"
          />
          <Button variant="secondary">
            <Search size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Filter
          </Button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {filteredIntakes.length === 0 ? (
            <div style={{ color: "#6b7280", fontSize: 14 }}>No saved intake records yet.</div>
          ) : null}

          {filteredIntakes.map((record) => (
            <div
              key={record.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {record.intakeNumber} • {record.intakeRoNumber}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    Saved by {record.savedBy} • {new Date(record.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge text={record.status} background="#16a34a" />
              </div>

              <div style={{ fontSize: 15 }}>
                {record.year} {record.make} {record.model} • {record.plate}
              </div>

              <div style={{ color: "#4b5563", fontSize: 14 }}>
                Customer: {record.customerName || "Walk-in / Not yet set"} • Phone:{" "}
                {record.customerPhone || "N/A"}
              </div>

              <div style={{ fontSize: 14, color: "#374151" }}>
                Exterior Photos: {record.exteriorPhotos.length} • Take Notes: {record.takeNotes.length}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                {record.arrivalChecks.map((check) => (
                  <div
                    key={check.key}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{check.label}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{check.status}</div>
                    <div style={{ fontSize: 13 }}>{check.note || "No note"}</div>
                  </div>
                ))}
              </div>

              {record.advisorNotes ? (
                <div
                  style={{
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 12,
                    fontSize: 14,
                  }}
                >
                  <strong>Advisor Notes:</strong> {record.advisorNotes}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShopFloor = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle
        title="Live Shop Floor Board"
        subtitle="Monitor bay activity, RO status, technician assignment, and priority."
      />

      <div style={{ display: "grid", gap: 12 }}>
        {shopFloorBoard.map((bay) => (
          <div
            key={bay.id}
            style={{
              ...cardStyle,
              display: "grid",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{bay.bay}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{bay.roNumber}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge text={bay.status} background={getStatusColor(bay.status)} />
                <Badge text={bay.priority} background={getPriorityColor(bay.priority)} />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Customer</div>
                <div>{bay.customer}</div>
              </div>
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Vehicle</div>
                <div>{bay.vehicle}</div>
              </div>
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Plate</div>
                <div>{bay.plate}</div>
              </div>
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Technician</div>
                <div>{bay.technician}</div>
              </div>
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Start Time</div>
                <div>{bay.startTime}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={() => moveBayStatus(bay.id, "Waiting")}>
                Waiting
              </Button>
              <Button variant="secondary" onClick={() => moveBayStatus(bay.id, "In Progress")}>
                In Progress
              </Button>
              <Button variant="secondary" onClick={() => moveBayStatus(bay.id, "Waiting Parts")}>
                Waiting Parts
              </Button>
              <Button variant="secondary" onClick={() => moveBayStatus(bay.id, "Quality Check")}>
                Quality Check
              </Button>
              <Button variant="secondary" onClick={() => moveBayStatus(bay.id, "Ready Release")}>
                Ready Release
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTechnicianBoard = () => {
    const activeJobs = shopFloorBoard.filter((bay) => bay.status === "In Progress").length;
    const clockedIn = techStats.filter((tech) => tech.clockedIn).length;
    const working = techStats.filter((tech) => tech.active).length;

    return (
      <div style={{ display: "grid", gap: 20 }}>
        <SectionTitle
          title="Technician Board"
          subtitle="Clock in and out, track active jobs, completed work, and flat rate performance."
        />

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <StatCard title="Active Jobs in Shop" value={activeJobs} icon={<Wrench size={20} />} />
          <StatCard title="Clocked In" value={clockedIn} icon={<Clock3 size={20} />} />
          <StatCard title="Currently Working" value={working} icon={<Gauge size={20} />} />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {techStats.map((tech) => (
            <div
              key={tech.id}
              style={{
                ...cardStyle,
                display: "grid",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{tech.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{tech.role}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge
                    text={tech.clockedIn ? "Clocked In" : "Clocked Out"}
                    background={tech.clockedIn ? "#16a34a" : "#6b7280"}
                  />
                  <Badge text={tech.active ? "Working" : "Idle"} background={tech.active ? "#2563eb" : "#9ca3af"} />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Current Job</div>
                  <div>{tech.currentJob || "None"}</div>
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Jobs Completed</div>
                  <div>{tech.jobsCompleted}</div>
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Flat Rate Hours</div>
                  <div>{tech.flatRateHours.toFixed(1)}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => toggleTechClock(tech.id)}>
                  {tech.clockedIn ? "Clock Out" : "Clock In"}
                </Button>
                <Button variant="secondary" onClick={() => toggleTechWorking(tech.id)} disabled={!tech.clockedIn}>
                  {tech.active ? "Set Idle" : "Set Working"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomers = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle
        title="Customers"
        subtitle="Search customer records by name, plate number, phone number, or vehicle."
      />

      <div style={cardStyle}>
        <InputField
          label="Customer Search"
          value={customerQuery}
          onChange={setCustomerQuery}
          placeholder="Search customer name, plate, phone, or vehicle"
        />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            style={{
              ...cardStyle,
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{customer.customerName}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{customer.phone}</div>
              </div>
              <Badge text={`${customer.totalVisits} Visits`} background="#111827" />
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Plate</div>
                <div>{customer.plate}</div>
              </div>
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Vehicle</div>
                <div>{customer.vehicle}</div>
              </div>
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Last Service Date</div>
                <div>{customer.lastServiceDate}</div>
              </div>
              <div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>Last Service</div>
                <div>{customer.lastService}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderParts = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle
        title="Parts Request + Supplier Flow"
        subtitle="Create parts requests, collect supplier bids, select supplier, mark ordered/shipped, and receive parts."
      />

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <StatCard title="Open Requests" value={partsStats.open} icon={<PackageCheck size={20} />} />
        <StatCard title="Waiting for Bids" value={partsStats.waitingBids} icon={<Search size={20} />} />
        <StatCard title="Parts Arrived" value={partsStats.arrived} icon={<Truck size={20} />} />
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Create Parts Request</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <SelectField
              label="RO Number"
              value={partsRequestForm.roNumber || (roOptions[0] || "")}
              onChange={(value) => {
                autofillPartsFromRo(value);
              }}
              options={roOptions.length ? roOptions : [""]}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (partsRequestForm.roNumber) {
                  autofillPartsFromRo(partsRequestForm.roNumber);
                }
              }}
            >
              Load RO Vehicle Details
            </Button>

            <InputField
              label="Optional Work Line ID"
              value={partsRequestForm.workLineId}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, workLineId: value }))}
              placeholder="e.g. WL-001"
            />
            <InputField
              label="Optional Work Line Label"
              value={partsRequestForm.workLineLabel}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, workLineLabel: value }))}
              placeholder="e.g. Front Suspension Repair"
            />
            <InputField
              label="Plate"
              value={partsRequestForm.plate}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, plate: value.toUpperCase() }))}
              placeholder="Plate number"
            />
            <InputField
              label="Vehicle"
              value={partsRequestForm.vehicle}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, vehicle: value }))}
              placeholder="Vehicle description"
            />
            <InputField
              label="Part Name"
              value={partsRequestForm.partName}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, partName: value }))}
              placeholder="Part name"
            />
            <InputField
              label="Part Number"
              value={partsRequestForm.partNumber}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, partNumber: value }))}
              placeholder="Part number"
            />
            <InputField
              label="Quantity"
              value={partsRequestForm.quantity}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, quantity: value }))}
              placeholder="1"
              type="number"
            />
            <SelectField
              label="Urgency"
              value={partsRequestForm.urgency}
              onChange={(value) =>
                setPartsRequestForm((prev) => ({
                  ...prev,
                  urgency: value as PartsRequestForm["urgency"],
                }))
              }
              options={["Low", "Normal", "High", "Urgent"]}
            />
            <InputField
              label="Requested By"
              value={partsRequestForm.requestedBy}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, requestedBy: value }))}
              placeholder="Requester"
            />
            <TextAreaField
              label="Notes"
              value={partsRequestForm.notes}
              onChange={(value) => setPartsRequestForm((prev) => ({ ...prev, notes: value }))}
              placeholder="Notes, brand requirement, OEM/genuine instruction"
              rows={4}
            />

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Photo URLs</div>
              {partsRequestForm.photoUrls.map((url, index) => (
                <div
                  key={`parts-photo-${index}`}
                  style={{
                    display: "grid",
                    gap: 8,
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                  }}
                >
                  <input
                    value={url}
                    onChange={(e) => updatePartsPhotoUrl(index, e.target.value)}
                    placeholder={`Photo URL ${index + 1}`}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #d1d5db",
                      borderRadius: 12,
                      padding: "12px 14px",
                      fontSize: 14,
                    }}
                  />
                  <Button variant="danger" onClick={() => removePartsPhotoUrl(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={addPartsPhotoUrl}>
                  Add Photo URL
                </Button>
                <Button variant="secondary" onClick={resetPartsRequestForm}>
                  Reset
                </Button>
              </div>
            </div>

            <Button onClick={handleCreatePartsRequest}>
              <Save size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Save Parts Request
            </Button>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Supplier Bid Entry</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <SelectField
              label="Parts Request"
              value={supplierBidForm.partsRequestId || (partsRequests[0]?.id || "")}
              onChange={(value) => {
                setSupplierBidForm((prev) => ({ ...prev, partsRequestId: value }));
                setSelectedPartsRequestId(value);
              }}
              options={partsRequests.length ? partsRequests.map((request) => request.id) : [""]}
            />

            {selectedRequest ? (
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  padding: 12,
                  fontSize: 14,
                }}
              >
                <div>
                  <strong>{selectedRequest.requestNumber}</strong> • {selectedRequest.roNumber}
                </div>
                <div>{selectedRequest.partName}</div>
                <div style={{ color: "#6b7280", marginTop: 4 }}>
                  {selectedRequest.vehicle} • {selectedRequest.plate}
                </div>
              </div>
            ) : null}

            <InputField
              label="Supplier Name"
              value={supplierBidForm.supplierName}
              onChange={(value) => setSupplierBidForm((prev) => ({ ...prev, supplierName: value }))}
              placeholder="Supplier name"
            />
            <InputField
              label="Quoted Amount"
              value={supplierBidForm.quotedAmount}
              onChange={(value) => setSupplierBidForm((prev) => ({ ...prev, quotedAmount: value }))}
              placeholder="0.00"
              type="number"
            />
            <InputField
              label="ETA"
              value={supplierBidForm.eta}
              onChange={(value) => setSupplierBidForm((prev) => ({ ...prev, eta: value }))}
              placeholder="Today 4:00 PM"
            />
            <InputField
              label="Contact Person"
              value={supplierBidForm.contactPerson}
              onChange={(value) => setSupplierBidForm((prev) => ({ ...prev, contactPerson: value }))}
              placeholder="Contact person"
            />
            <InputField
              label="Contact Number"
              value={supplierBidForm.contactNumber}
              onChange={(value) => setSupplierBidForm((prev) => ({ ...prev, contactNumber: value }))}
              placeholder="0917..."
            />
            <TextAreaField
              label="Notes"
              value={supplierBidForm.notes}
              onChange={(value) => setSupplierBidForm((prev) => ({ ...prev, notes: value }))}
              placeholder="Warranty, brand, delivery terms"
              rows={3}
            />
            <Button onClick={handleAddSupplierBid}>Save Supplier Bid</Button>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "minmax(0, 1fr) auto",
            alignItems: "end",
          }}
        >
          <InputField
            label="Search Parts Requests"
            value={partsSearch}
            onChange={setPartsSearch}
            placeholder="Search request number, RO, part, plate, vehicle, supplier"
          />
          <Button variant="secondary">
            <Search size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Filter
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {filteredPartsRequests.map((request) => {
          const bids = supplierBids.filter((bid) => bid.partsRequestId === request.id);
          const receiveForm = receiveForms[request.id] || DEFAULT_PARTS_RECEIVE_FORM;

          return (
            <div
              key={request.id}
              style={{
                ...cardStyle,
                display: "grid",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {request.requestNumber} • {request.roNumber}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    Created {new Date(request.createdAt).toLocaleString()} • Requested by {request.requestedBy}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge text={request.status} background={getPartsStatusColor(request.status)} />
                  <Badge text={request.urgency} background={getPriorityColor(request.urgency)} />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                }}
              >
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Vehicle</div>
                  <div>{request.vehicle}</div>
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Plate</div>
                  <div>{request.plate}</div>
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Part</div>
                  <div>{request.partName}</div>
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Part Number</div>
                  <div>{request.partNumber || "N/A"}</div>
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Quantity</div>
                  <div>{request.quantity}</div>
                </div>
                <div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>Selected Supplier</div>
                  <div>{request.selectedSupplier || "Not yet selected"}</div>
                </div>
              </div>

              {request.workLineId || request.workLineLabel ? (
                <div
                  style={{
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 12,
                    fontSize: 14,
                  }}
                >
                  <strong>Linked Work Line:</strong> {request.workLineId || "—"} {request.workLineLabel ? `• ${request.workLineLabel}` : ""}
                </div>
              ) : null}

              {request.notes ? (
                <div
                  style={{
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    padding: 12,
                    fontSize: 14,
                  }}
                >
                  <strong>Notes:</strong> {request.notes}
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => updatePartsRequestStatus(request.id, "Draft")}>
                  Draft
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => updatePartsRequestStatus(request.id, "Sent to Suppliers")}
                >
                  Sent to Suppliers
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => updatePartsRequestStatus(request.id, "Waiting for Bids")}
                >
                  Waiting for Bids
                </Button>
                <Button variant="secondary" onClick={() => updatePartsRequestStatus(request.id, "Ordered")}>
                  Ordered
                </Button>
                <Button variant="secondary" onClick={() => updatePartsRequestStatus(request.id, "Shipped")}>
                  Shipped
                </Button>
                <Button variant="secondary" onClick={() => updatePartsRequestStatus(request.id, "Closed")}>
                  Closed
                </Button>
                <Button variant="danger" onClick={() => updatePartsRequestStatus(request.id, "Cancelled")}>
                  Cancelled
                </Button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 10px" }}>Supplier Bids</h4>
                  <div style={{ display: "grid", gap: 10 }}>
                    {bids.length === 0 ? (
                      <div style={{ color: "#6b7280", fontSize: 14 }}>No bids yet.</div>
                    ) : null}

                    {bids.map((bid) => (
                      <div
                        key={bid.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: 12,
                          display: "grid",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 700 }}>{bid.supplierName}</div>
                          <Badge
                            text={bid.status}
                            background={
                              bid.status === "Selected"
                                ? "#16a34a"
                                : bid.status === "Rejected"
                                  ? "#dc2626"
                                  : "#2563eb"
                            }
                          />
                        </div>
                        <div style={{ fontSize: 14 }}>Quoted: ₱{bid.quotedAmount.toLocaleString()}</div>
                        <div style={{ fontSize: 14, color: "#4b5563" }}>ETA: {bid.eta || "N/A"}</div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          {bid.contactPerson || "No contact"} • {bid.contactNumber || "No number"}
                        </div>
                        {bid.notes ? <div style={{ fontSize: 13 }}>{bid.notes}</div> : null}
                        <div>
                          <Button
                            variant="secondary"
                            onClick={() => handleSelectSupplierBid(bid.id)}
                            disabled={bid.status === "Selected"}
                          >
                            Select Supplier
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 10px" }}>Parts Arrived</h4>
                  <div style={{ display: "grid", gap: 10 }}>
                    <InputField
                      label="Received By"
                      value={receiveForm.receivedBy}
                      onChange={(value) => setReceiveFormField(request.id, "receivedBy", value)}
                      placeholder="Receiver name"
                    />
                    <SelectField
                      label="Received Condition"
                      value={receiveForm.receivedCondition || ""}
                      onChange={(value) => setReceiveFormField(request.id, "receivedCondition", value)}
                      options={["", "Good", "Damaged", "Incomplete"]}
                    />
                    <TextAreaField
                      label="Received Notes"
                      value={receiveForm.receivedNotes}
                      onChange={(value) => setReceiveFormField(request.id, "receivedNotes", value)}
                      placeholder="Condition notes, missing items, damage observations"
                      rows={3}
                    />
                    <InputField
                      label="Received Photo URL"
                      value={receiveForm.receivedPhotoUrl}
                      onChange={(value) => setReceiveFormField(request.id, "receivedPhotoUrl", value)}
                      placeholder="Optional received photo URL"
                    />
                    <Button onClick={() => handleReceiveParts(request.id)}>Mark Parts Arrived</Button>

                    {request.receivedAt ? (
                      <div
                        style={{
                          borderRadius: 12,
                          border: "1px solid #d1fae5",
                          background: "#ecfdf5",
                          padding: 12,
                          fontSize: 14,
                        }}
                      >
                        <div>
                          <strong>Received By:</strong> {request.receivedBy}
                        </div>
                        <div>
                          <strong>Received At:</strong> {new Date(request.receivedAt).toLocaleString()}
                        </div>
                        <div>
                          <strong>Condition:</strong> {request.receivedCondition || "N/A"}
                        </div>
                        <div>
                          <strong>Notes:</strong> {request.receivedNotes || "None"}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPartsRequests.length === 0 ? (
          <div style={cardStyle}>No parts requests found.</div>
        ) : null}
      </div>
    </div>
  );

  const renderReports = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle
        title="Reports"
        subtitle="Initial reporting foundation. More calculators and live reports can be added next."
      />
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <StatCard title="Total Managed Users" value={managedUsers.length} icon={<Users size={20} />} />
        <StatCard title="Total Customers" value={customerProfiles.length} icon={<Users size={20} />} />
        <StatCard title="Total Saved Intakes" value={intakeRecords.length} icon={<ClipboardList size={20} />} />
        <StatCard title="Total Shop Floor Bays" value={shopFloorBoard.length} icon={<Wrench size={20} />} />
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Phase 2 Report Notes</h3>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#4b5563", lineHeight: 1.7 }}>
          <li>Dashboard counts are live from local state.</li>
          <li>Intake saves automatically add a waiting item to the shop floor board and assign an RO number.</li>
          <li>Parts requests are linked to RO number, vehicle, plate, and optional work line.</li>
          <li>Supplier bids can be added and one supplier can be selected per request.</li>
          <li>When parts are received, the related shop floor RO moves out of Waiting Parts when applicable.</li>
        </ul>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle
        title="Admin"
        subtitle="Create users, manage roles, and enable or disable system access."
      />

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Create User</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <InputField
              label="Full Name"
              value={newUser.name}
              onChange={(value) => setNewUser((prev) => ({ ...prev, name: value }))}
              placeholder="Enter full name"
            />
            <InputField
              label="Username"
              value={newUser.username}
              onChange={(value) => setNewUser((prev) => ({ ...prev, username: value }))}
              placeholder="Enter username"
            />
            <InputField
              label="Password"
              value={newUser.password}
              onChange={(value) => setNewUser((prev) => ({ ...prev, password: value }))}
              placeholder="Enter password"
              type="password"
            />
            <SelectField
              label="Role"
              value={newUser.role}
              onChange={(value) => setNewUser((prev) => ({ ...prev, role: value as UserRole }))}
              options={[
                "Admin",
                "Service Advisor",
                "Chief Mechanic",
                "Senior Mechanic",
                "General Mechanic",
                "Junior Mechanic",
                "OJT",
              ]}
            />
            <Button onClick={handleAddUser}>Create User</Button>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>User Management</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {managedUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                      {user.username} • {user.role}
                    </div>
                  </div>
                  <Badge text={user.active ? "Active" : "Inactive"} background={user.active ? "#16a34a" : "#6b7280"} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button variant="secondary" onClick={() => toggleUserActive(user.id)}>
                    {user.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle title="Settings" subtitle="Project settings placeholder for future enhancements." />
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Current Foundation</h3>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#4b5563", lineHeight: 1.7 }}>
          <li>Single-file React + TSX foundation</li>
          <li>LocalStorage persistence for key app states</li>
          <li>Vehicle intake flow rebuilt cleanly</li>
          <li>Shop floor, customers, technician board, admin, and parts request flow wired together</li>
        </ul>
      </div>
    </div>
  );

  const content = (() => {
    switch (activeView) {
      case "dashboard":
        return renderDashboard();
      case "vehicleIntake":
        return renderVehicleIntake();
      case "inspection":
        return renderInspection();
      case "shopFloor":
        return renderShopFloor();
      case "technicianBoard":
        return renderTechnicianBoard();
      case "customers":
        return renderCustomers();
      case "parts":
        return renderParts();
      case "reports":
        return renderReports();
      case "admin":
        return renderAdmin();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  })();

  if (!currentUser) {
    return renderLogin();
  }

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside
          style={{
            width: sidebarOpen ? 280 : 0,
            overflow: "hidden",
            background: "#111827",
            color: "#fff",
            transition: "width 0.2s ease",
            borderRight: "1px solid #1f2937",
          }}
        >
          <div style={{ padding: 18, borderBottom: "1px solid #1f2937" }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>DVI Workshop</div>
            <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
              {currentUser.name} • {currentUser.role}
            </div>
          </div>

          <div style={{ padding: 12, display: "grid", gap: 8 }}>
            {visibleNavigation.map((nav) => (
              <button
                key={nav.key}
                onClick={() => {
                  setActiveView(nav.key);
                  setSidebarOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 14px",
                  cursor: "pointer",
                  background: activeView === nav.key ? "#1f2937" : "transparent",
                  color: "#fff",
                }}
              >
                {nav.icon}
                <span>{nav.label}</span>
              </button>
            ))}

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left",
                border: "none",
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                background: "transparent",
                color: "#fff",
                marginTop: 8,
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "#ffffffee",
              backdropFilter: "blur(8px)",
              borderBottom: "1px solid #e5e7eb",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>Workshop Management</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    {visibleNavigation.find((item) => item.key === activeView)?.label}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative", minWidth: 240, maxWidth: "100%" }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 12,
                      transform: "translateY(-50%)",
                      color: "#6b7280",
                    }}
                  />
                  <input
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Global search placeholder"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #d1d5db",
                      borderRadius: 12,
                      padding: "12px 14px 12px 36px",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={18} />
                </div>
              </div>
            </div>
          </header>

          <main style={{ padding: 20 }}>{content}</main>
        </div>
      </div>
    </div>
  );
}