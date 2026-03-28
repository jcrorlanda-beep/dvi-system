import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  ClipboardList,
  FileText,
  Car,
  Package,
  Wrench,
  Users,
  Receipt,
  History,
  ShoppingCart,
  Warehouse,
  Camera,
  MessageSquare,
  Play,
  Pause,
  CreditCard,
  Truck,
  Printer,
  AlertTriangle,
  RotateCcw,
  UserCog,
  Lock,
  Image,
  CheckCircle2,
  XCircle,
  Search,
  BarChart3,
} from "lucide-react";

/* =========================
   TYPES
========================= */

type ViewKey =
  | "dashboard"
  | "vehicleIntake"
  | "inspection"
  | "approval"
  | "ro"
  | "parts"
  | "shop"
  | "tech"
  | "billing"
  | "customerSummary"
  | "history"
  | "backJob"
  | "activityLogs"
  | "salesReports"
  | "purchasing"
  | "inventory"
  | "employees";

type EmployeeRole =
  | "Admin"
  | "Management"
  | "Service Advisor"
  | "Office Staff"
  | "Technician"
  | "Mechanic"
  | "Reception";

type UserRole = EmployeeRole | "Manager" | "Assistant Manager";

type EmployeeRecord = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  department: string;
  phone: string;
  username: string;
  password: string;
  active: boolean;
  mustChangePassword?: boolean;
  allowedViews?: ViewKey[];
  createdAt: number;
};

type AttendanceStatus = "Present" | "Late" | "Absent" | "Half Day" | "On Leave";

type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  note: string;
  encodedBy: string;
};

type User = EmployeeRecord;

type FuelType = "Gasoline" | "Diesel" | "Hybrid" | "Electric" | "LPG" | "Other";
type TransmissionType = "MT" | "AT" | "CVT" | "DCT" | "Other";

type Priority = "Low" | "Normal" | "High" | "Urgent";
type ROStatus =
  | "Draft"
  | "Waiting Inspection"
  | "Waiting Approval"
  | "Approved / Ready to Work"
  | "In Progress"
  | "Waiting Parts"
  | "Quality Check"
  | "Ready Release"
  | "Released"
  | "Closed";
type WorkLineStatus =
  | "Pending"
  | "Approved"
  | "Ready"
  | "In Progress"
  | "Waiting Parts"
  | "Quality Check"
  | "Done"
  | "Cancelled";

type ApprovalStatus = "Pending Approval" | "Approved" | "Partially Approved" | "Declined";
type InvoiceStatus = "Draft" | "Ready for Payment" | "Partially Paid" | "Paid";
type ReleaseStatus = "Hold" | "Ready for Release" | "Released";
type PartsSummary = "No Parts" | "Waiting Parts" | "Ready";
type PartRequestStatus =
  | "Draft"
  | "Sent to Suppliers"
  | "Waiting for Bids"
  | "Supplier Selected"
  | "Ordered"
  | "Shipped"
  | "Parts Arrived"
  | "Closed"
  | "Cancelled";

type PaymentMethod = "Cash" | "Card" | "Bank Transfer" | "GCash" | "Other";

type TimeSession = {
  id: string;
  startedAt: number;
  endedAt?: number;
};

type InspectionPhoto = {
  id: string;
  label: string;
  url: string;
};

type WorkLinePhoto = {
  id: string;
  label: string;
  url: string;
  stage: "Before" | "During" | "After";
};

type InspectionTakeNote = {
  id: string;
  title: string;
  note: string;
  photoUrl: string;
};

type ArrivalCheckKey = "lights" | "brokenGlass" | "wipers" | "hornCondition";
type ArrivalCheckStatus = "Not Checked" | "OK" | "Needs Attention";

type ArrivalCheckItem = {
  status: ArrivalCheckStatus;
  note: string;
};

type ArrivalCheckMap = Record<ArrivalCheckKey, ArrivalCheckItem>;

type TireCondition = "Good" | "Uneven Wear" | "Worn" | "Bald";
type TirePosition = "frontLeft" | "frontRight" | "rearLeft" | "rearRight";

type TireInspectionItem = {
  condition: TireCondition;
  treadDepthMm: string;
  unsafe: boolean;
};

type TireInspectionMap = Record<TirePosition, TireInspectionItem>;

type UnderHoodInspectionKey =
  | "engineOil"
  | "coolant"
  | "brakeFluid"
  | "powerSteeringFluid"
  | "battery"
  | "belts"
  | "hoses"
  | "airFilter"
  | "cabinFilter"
  | "fluidLeaks";

type UnderHoodInspectionStatus = "OK" | "Needs Attention" | "Urgent";

type UnderHoodInspectionItem = {
  status: UnderHoodInspectionStatus;
  note: string;
};

type UnderHoodInspectionMap = Record<UnderHoodInspectionKey, UnderHoodInspectionItem>;

type SmsGatewaySettings = {
  enabled: boolean;
  endpoint: string;
  apiKey: string;
  deviceName: string;
  useClipboardFallback: boolean;
};

type AssignmentRole = "Primary" | "Supporting";

type TechnicianAssignmentLog = {
  id: string;
  technicianName: string;
  role: AssignmentRole;
  assignedAt: number;
  assignedBy: string;
  removedAt?: number;
  removedBy?: string;
  note: string;
};

type CustomerDecisionEntry = {
  id: string;
  timestamp: number;
  customerName: string;
  decision: ApprovalStatus;
  note: string;
  via: "Manual" | "SMS";
};

type ReleaseChecklist = {
  invoiceReviewed: boolean;
  paymentConfirmed: boolean;
  vehicleChecked: boolean;
  customerNotified: boolean;
  releasedBy: string;
  releaseNote: string;
  releasedAt?: number;
};

type QCResult = "Pending" | "Passed" | "Failed";

type QCFailedLog = {
  id: string;
  timestamp: number;
  inspectedBy: string;
  notes: string;
};

type QCChecklist = {
  workPerformedVerified: boolean;
  originalConcernResolved: "Yes" | "Partially" | "No";
  roadTestPerformed: boolean;
  roadTestResult: string;
  brakesOk: boolean;
  steeringOk: boolean;
  lightsOk: boolean;
  hornOk: boolean;
  noLeaks: boolean;
  fluidLevelsOk: boolean;
  batterySecured: boolean;
  noLooseParts: boolean;
  wheelsSecured: boolean;
  cleanlinessAcceptable: boolean;
  toolsRemoved: boolean;
  finalResult: QCResult;
  notes: string;
  inspectedBy: string;
  inspectedAt?: number;
  failedLogs: QCFailedLog[];
  alignmentBeforeReport: string;
  alignmentBeforeNotes: string;
  alignmentAfterReport: string;
  alignmentAfterNotes: string;
};

type PaymentEntry = {
  id: string;
  timestamp: number;
  amount: number;
  method: PaymentMethod;
  note: string;
};

type ROWorkLine = {
  id: string;
  label: string;
  category: string;
  priority: Priority;
  technician: string;
  primaryTechnician: string;
  supportingTechnicians: string[];
  assignmentLog: TechnicianAssignmentLog[];
  assignedBy: string;
  finishedBy: string;
  estimatedHours: number;
  actualHours: number;
  laborRate: number;
  laborCost: number;
  partsCost: number;
  estimateTotal: number;
  status: WorkLineStatus;
  approvalStatus: ApprovalStatus;
  partsSummary: PartsSummary;
  customerDecisionLog: CustomerDecisionEntry[];
  smsApprovalSentAt?: number;
  smsApprovalStatus: "Not Sent" | "Sent" | "Approved" | "Declined";
  sessions: TimeSession[];
  startedAt?: number;
  pausedAt?: number;
  photos: WorkLinePhoto[];
  overrideNote: string;
};

type RepairOrder = {
  id: string;
  roNumber: string;
  plate: string;
  vehicle: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  fuelType: FuelType | "";
  transmissionType: TransmissionType | "";
  customer: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  municipality: string;
  region: string;
  odometer: string;
  bay: string;
  priority: Priority;
  status: ROStatus;
  createdAt: number;
  inspectionCompleted: boolean;
  qcPassed: boolean;
  qcChecklist: QCChecklist;
  closedAt?: number;
  workLines: ROWorkLine[];
  invoiceStatus: InvoiceStatus;
  releaseStatus: ReleaseStatus;
  payments: PaymentEntry[];
  invoiceNote: string;
  invoiceNumber?: string;
  customerVisibleFindings: string;
  recommendationsSummary: string;
  releaseChecklist: ReleaseChecklist;
  isReturnJob: boolean;
  returnReason: string;
  linkedPreviousRoId?: string;
  inspectionPhotos: InspectionPhoto[];
  initialExteriorPhotos: InspectionPhoto[];
  takeNotes: InspectionTakeNote[];
  arrivalChecks: ArrivalCheckMap;
  tireInspection: TireInspectionMap;
  underHoodInspection: UnderHoodInspectionMap;
  serviceAdvisorNotes: string;
  softLocked: boolean;
  lockOverrideReason: string;
};

type PartRequest = {
  id: string;
  requestNumber: string;
  roNumber: string;
  workLineId?: string;
  workLineLabel?: string;
  plate: string;
  vehicle: string;
  partName: string;
  partNumber: string;
  qty: number;
  unitCost: number;
  notes: string;
  photos: InspectionPhoto[];
  urgency: Priority;
  requestedBy: string;
  status: PartRequestStatus;
  createdAt: number;
  selectedSupplierId?: string;
  inventoryItemId?: string;
  inventoryAllocatedQty?: number;
  customerPartsSellingPrice: number;
  customerLaborSellingPrice: number;
  customerTotalSellingPrice: number;
  receivedAt?: number;
  receivedBy?: string;
  receivedCondition?: "Complete" | "Incomplete" | "Damaged";
  receivedNotes?: string;
  receivedPhotoUrl?: string;
};

type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  notes: string;
};

type SupplierBid = {
  id: string;
  partRequestId: string;
  supplierId: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  etaDays: number;
  warrantyNote: string;
  condition: string;
  notes: string;
  receiptFiles: string[];
  shippingReceiptFiles: string[];
  actualPartPhotos: string[];
  customerSellingPrice: number;
  laborSellingPrice: number;
  selected: boolean;
};

type InventoryItem = {
  id: string;
  partName: string;
  sku: string;
  quantityOnHand: number;
  reorderLevel: number;
  avgCost: number;
  location: string;
};

type TechnicianProfile = {
  id: string;
  name: string;
  role: string;
  clockedIn: boolean;
  currentRoNumber: string;
  currentWorkLine: string;
  currentStartedAt?: number;
  completedJobs: number;
};

type ManagerAlert = {
  id: string;
  roId: string;
  roNumber: string;
  level: "warning" | "critical";
  message: string;
};

type InspectionIssueKey =
  | "brakes"
  | "suspension"
  | "engine"
  | "electrical"
  | "aircon"
  | "steering"
  | "tires"
  | "alignment";

type InspectionSelection = Record<InspectionIssueKey, boolean>;

type InspectionIssueDefinition = {
  key: InspectionIssueKey;
  label: string;
  category: string;
  defaultHours: number;
  defaultWorkLineLabel: string;
};

type VehicleCatalogModel = {
  name: string;
  startYear?: number;
  endYear?: number;
  aliases?: string[];
};

type VehicleCatalogEntry = {
  make: string;
  models: VehicleCatalogModel[];
  aliases?: string[];
};

type InspectionForm = {
  plate: string;
  vehicle: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  fuelType: FuelType | "";
  transmissionType: TransmissionType | "";
  customer: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  municipality: string;
  region: string;
  odometer: string;
  bay: string;
  priority: Priority;
  issues: InspectionSelection;
  isReturnJob: boolean;
  returnReason: string;
  linkedPreviousRoId: string;
  inspectionPhotos: InspectionPhoto[];
  initialExteriorPhotos: InspectionPhoto[];
  takeNotes: InspectionTakeNote[];
  arrivalChecks: ArrivalCheckMap;
  tireInspection: TireInspectionMap;
  underHoodInspection: UnderHoodInspectionMap;
  customerVisibleFindings: string;
  recommendationsSummary: string;
  serviceAdvisorNotes: string;
  customerType: "Person" | "Company";
  companyName: string;
  municipalityGroup: "Ilocos Sur" | "Abra" | "";
  customerMunicipality: string;
};

type PaymentForm = {
  amount: string;
  method: PaymentMethod;
  note: string;
};

type SupplierForm = {
  name: string;
  contactPerson: string;
  phone: string;
  notes: string;
};

type BidForm = {
  supplierId: string;
  brand: string;
  quantity: string;
  unitPrice: string;
  etaDays: string;
  warrantyNote: string;
  condition: string;
  notes: string;
  receiptUrl: string;
  shippingReceiptUrl: string;
  partPhotoUrl: string;
  customerSellingPrice: string;
  laborSellingPrice: string;
};

type InventoryForm = {
  partName: string;
  sku: string;
  quantityOnHand: string;
  reorderLevel: string;
  avgCost: string;
  location: string;
};

type EmployeeForm = {
  id?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  department: string;
  phone: string;
  username: string;
  password: string;
  active: boolean;
  mustChangePassword: boolean;
  allowedViews?: ViewKey[];
};

type CustomerHistoryRecord = {
  key: string;
  customer: string;
  plate: string;
  vehicle: string;
  totalVisits: number;
  totalReturnJobs: number;
  lastVisitAt?: number;
  roIds: string[];
  repeatIssueCategories: string[];
};


type BackJobStatus = "Pending" | "In Progress" | "Resolved" | "Released";
type BackJobCostType = "Warranty" | "Internal" | "Customer";

type BackJobRecord = {
  id: string;
  reportDate: number;
  takeInDate: string;
  plateNumber: string;
  customerName: string;
  vehicle: string;
  initialInvoiceNumber: string;
  initialReleaseDate: string;
  initialConcern: string;
  initialMechanic: string;
  qcPerformedBy: string;
  backJobInvoiceNumber: string;
  currentMechanic: string;
  supportingMechanics: string[];
  backJobType: string;
  findings: string;
  fixPerformed: string;
  status: BackJobStatus;
  costType: BackJobCostType;
  costPhp: number;
  rootCauseCategory: string;
  rootCauseNotes: string;
  stageResponsible: string;
  linkedOriginalRoId?: string;
  linkedOriginalRoNumber?: string;
};


type ActivityLogEntry = {
  id: string;
  timestamp: number;
  user: string;
  role: UserRole | string;
  module:
    | "RO"
    | "Inspection"
    | "Approval"
    | "Parts"
    | "Supplier"
    | "Inventory"
    | "Billing"
    | "QC"
    | "Release"
    | "Back Job"
    | "Customer Summary"
    | "Activity Logs"
    | "Sales";
  action: string;
  recordReference: string;
  oldValue?: string;
  newValue?: string;
  note?: string;
};

type SalesEntry = {
  id: string;
  entryDate: string;
  grossSales: number;
  tireSales: number;
  netSalesLessTires: number;
  notes: string;
  encodedBy: string;
  encodedRole: UserRole | string;
  createdAt: number;
  updatedAt: number;
};

type SalesForm = {
  entryDate: string;
  grossSales: string;
  tireSales: string;
  notes: string;
};

/* =========================
   SEED / DEFAULTS
========================= */

const USERS: User[] = [
  {
    id: "emp-admin",
    employeeCode: "EMP-001",
    firstName: "System",
    lastName: "Admin",
    displayName: "System Admin",
    role: "Admin",
    department: "Management",
    phone: "",
    username: "admin",
    password: "admin123",
    active: true,
    mustChangePassword: false,
    allowedViews: undefined,
    createdAt: Date.now(),
  },
  {
    id: "emp-manager",
    employeeCode: "EMP-002",
    firstName: "Workshop",
    lastName: "Manager",
    displayName: "Workshop Manager",
    role: "Management",
    department: "Management",
    phone: "",
    username: "manager",
    password: "manager123",
    active: true,
    mustChangePassword: false,
    allowedViews: undefined,
    createdAt: Date.now(),
  },
  {
    id: "emp-assistant",
    employeeCode: "EMP-003",
    firstName: "Assistant",
    lastName: "Manager",
    displayName: "Assistant Manager",
    role: "Management",
    department: "Management",
    phone: "",
    username: "assistant",
    password: "assistant123",
    active: true,
    mustChangePassword: false,
    allowedViews: undefined,
    createdAt: Date.now(),
  },
];

const SHOP_NAME = "Northeast Car Care Centre";
const SHOP_SLOGAN = "Professional Care For Every Journey";
const BUILD_VERSION = "Phase 19E — Under-Hood Auto Recommendations + Note Chips";

const APP_STORAGE_KEYS = {
  employees: APP_STORAGE_KEYS.employees,
  attendanceRecords: "phase18a_attendance_records",
  technicians: APP_STORAGE_KEYS.technicians,
  suppliers: APP_STORAGE_KEYS.suppliers,
  bids: APP_STORAGE_KEYS.bids,
  inventory: APP_STORAGE_KEYS.inventory,
  ros: APP_STORAGE_KEYS.ros,
  parts: APP_STORAGE_KEYS.parts,
  backJobs: APP_STORAGE_KEYS.backJobs,
  activityLogs: APP_STORAGE_KEYS.activityLogs,
  salesEntries: APP_STORAGE_KEYS.salesEntries,
  smsGateway: APP_STORAGE_KEYS.smsGateway,
  vehicleCatalog: APP_STORAGE_KEYS.vehicleCatalog,
  vehicleCatalogUrl: APP_STORAGE_KEYS.vehicleCatalogUrl,
} as const;

const MODULE_BEHAVIOR_RULES: Record<ViewKey, { allowCreate: boolean; allowInlineEdit: boolean; supportsLookup: boolean; requiresActiveUser: boolean }> = {
  dashboard: { allowCreate: false, allowInlineEdit: false, supportsLookup: false, requiresActiveUser: true },
  vehicleIntake: { allowCreate: true, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  inspection: { allowCreate: true, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  approval: { allowCreate: false, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  ro: { allowCreate: true, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  parts: { allowCreate: true, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  shop: { allowCreate: false, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  tech: { allowCreate: false, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  billing: { allowCreate: false, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  customerSummary: { allowCreate: false, allowInlineEdit: false, supportsLookup: true, requiresActiveUser: true },
  history: { allowCreate: false, allowInlineEdit: false, supportsLookup: true, requiresActiveUser: true },
  backJob: { allowCreate: true, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  activityLogs: { allowCreate: false, allowInlineEdit: false, supportsLookup: true, requiresActiveUser: true },
  salesReports: { allowCreate: true, allowInlineEdit: true, supportsLookup: false, requiresActiveUser: true },
  purchasing: { allowCreate: true, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  inventory: { allowCreate: true, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
  employees: { allowCreate: true, allowInlineEdit: true, supportsLookup: true, requiresActiveUser: true },
};

const VIEW_MASTER_DATA_GROUPS: Record<ViewKey, string[]> = {
  dashboard: ["Repair Orders", "Payments", "Manager Alerts"],
  vehicleIntake: ["Plate History", "Customer History", "Vehicle Catalog"],
  inspection: ["Intake Draft", "Service Matrix", "Inspection Photos"],
  approval: ["Customer Decisions", "Estimate Totals"],
  ro: ["Repair Orders", "Work Lines", "Assignments"],
  parts: ["Part Requests", "Supplier Bids", "Inventory Allocations"],
  shop: ["Bay Status", "Live Jobs"],
  tech: ["Technician Load", "Assignments", "Productivity"],
  billing: ["Invoices", "Payments", "Release Gates"],
  customerSummary: ["Customer Summary", "Attachments"],
  history: ["Plate History", "Customer History", "Return Jobs"],
  backJob: ["Back Jobs", "Root Cause Tracking"],
  activityLogs: ["Audit Trail"],
  salesReports: ["Daily Sales", "Monthly Projection"],
  purchasing: ["Suppliers", "Bids"],
  inventory: ["Inventory", "Restock Alerts"],
  employees: ["Employees", "Attendance", "Permissions"],
};

const VIEW_LABELS: Record<ViewKey, string> = Object.fromEntries(
  Object.entries(VIEW_TITLES).map(([key, value]) => [key, value.title]),
) as Record<ViewKey, string>;

const VIEW_TITLES: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Business intelligence, live operations, and management insights." },
  vehicleIntake: { title: "Vehicle Intake", subtitle: "Required vehicle details first, customer details can be completed later." },
  inspection: { title: "Inspection", subtitle: "Structured inspection, photos, take notes, and arrival documentation." },
  approval: { title: "Approval", subtitle: "Customer decisions, estimates, and work authorization." },
  ro: { title: "Repair Orders", subtitle: "Master job records, work lines, assignments, and status control." },
  parts: { title: "Parts", subtitle: "Request, quote, receive, and price parts accurately." },
  shop: { title: "Shop Floor", subtitle: "Live bay status, active jobs, and workflow visibility." },
  tech: { title: "Technician Board", subtitle: "Technician load, productivity, and assignment tracking." },
  billing: { title: "Billing", subtitle: "Payments, QC release gates, and financial summaries." },
  customerSummary: { title: "Customer Summary", subtitle: "Customer-facing summaries, print, PDF, SMS, and email actions." },
  history: { title: "History", subtitle: "Customer visits, repeat issues, and service timeline." },
  backJob: { title: "Back Job", subtitle: "Follow-up, recheck, root cause, and accountability tracking." },
  salesReports: { title: "Sales Reports", subtitle: "Daily sales entry, monthly totals, and yearly projections." },
  activityLogs: { title: "Activity Logs", subtitle: "Audit trail of changes across the entire system." },
  purchasing: { title: "Purchasing", subtitle: "Suppliers, sourcing, and purchasing coordination." },
  inventory: { title: "Inventory", subtitle: "Stock, reorder monitoring, and inventory visibility." },
  employees: { title: "Employees", subtitle: "Employee master, login permissions, and daily attendance board." },
};

const DEFAULT_TECHNICIANS: TechnicianProfile[] = [
  { id: "t1", name: "Ramon", role: "Chief Mechanic", clockedIn: true, currentRoNumber: "", currentWorkLine: "", completedJobs: 0 },
  { id: "t2", name: "Leo", role: "Senior Mechanic", clockedIn: true, currentRoNumber: "", currentWorkLine: "", completedJobs: 0 },
  { id: "t3", name: "Paul", role: "Junior Mechanic", clockedIn: false, currentRoNumber: "", currentWorkLine: "", completedJobs: 0 },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "North Auto Supply", contactPerson: "Mark", phone: "09170001111", notes: "OEM and replacement parts" },
  { id: "s2", name: "Ilocos Parts Center", contactPerson: "Ana", phone: "09175556666", notes: "Aftermarket and fast delivery" },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: "i1", partName: "Engine Oil 5W-30", sku: "OIL-5W30", quantityOnHand: 24, reorderLevel: 8, avgCost: 320, location: "Rack A" },
  { id: "i2", partName: "Oil Filter", sku: "FLT-OIL", quantityOnHand: 12, reorderLevel: 5, avgCost: 180, location: "Rack B" },
  { id: "i3", partName: "Brake Pad Set", sku: "BRK-PAD", quantityOnHand: 4, reorderLevel: 4, avgCost: 1450, location: "Rack C" },
];

const INSPECTION_ISSUES: InspectionIssueDefinition[] = [
  { key: "brakes", label: "Brakes", category: "Brakes", defaultHours: 2.5, defaultWorkLineLabel: "Brake Inspection and Repair" },
  { key: "suspension", label: "Suspension", category: "Suspension", defaultHours: 3, defaultWorkLineLabel: "Suspension Inspection and Repair" },
  { key: "engine", label: "Engine", category: "Engine", defaultHours: 2, defaultWorkLineLabel: "Engine Diagnosis and Repair" },
  { key: "electrical", label: "Electrical", category: "Electrical", defaultHours: 1.5, defaultWorkLineLabel: "Electrical System Check" },
  { key: "aircon", label: "Aircon", category: "Aircon", defaultHours: 2, defaultWorkLineLabel: "Aircon Inspection and Service" },
  { key: "steering", label: "Steering", category: "Steering", defaultHours: 2.5, defaultWorkLineLabel: "Steering System Inspection" },
  { key: "tires", label: "Tires", category: "Tires", defaultHours: 1.5, defaultWorkLineLabel: "Tire Service and Inspection" },
  { key: "alignment", label: "Alignment", category: "Alignment", defaultHours: 1.5, defaultWorkLineLabel: "Wheel Alignment Check and Adjustment" },
];

const INSPECTION_ISSUE_SHORT_LABELS: Record<InspectionIssueKey, string> = {
  brakes: "Brakes",
  suspension: "Suspension",
  engine: "Engine",
  electrical: "Electrical",
  aircon: "Aircon",
  steering: "Steering",
  tires: "Tires",
  alignment: "Alignment",
};

const INSPECTION_ISSUE_DESCRIPTIONS: Record<InspectionIssueKey, string> = {
  brakes: "Brake discs, pads, calipers, hydraulics, and ABS-related diagnostics.",
  suspension: "Springs, shocks, struts, control arms, and ride-control concerns.",
  engine: "Engine performance, mechanical condition, and smooth power delivery.",
  electrical: "Wiring, relays, switches, sensors, and non-charging electrical faults.",
  aircon: "Air-conditioning cooling performance, airflow, and cabin comfort concerns.",
  steering: "Steering response, handling, rack, tie rods, and steering-related checks.",
  tires: "Tire wear, tread depth, rotation, pressure, and tire service needs.",
  alignment: "Wheel alignment symptoms, pull, off-center steering wheel, and uneven wear patterns.",
};


type ServiceRecommendationRow = {
  intervalKm: number;
  fullInspectionLabel: string;
  items: {
    engineOil: string;
    oilFilter: string;
    airFilter: string;
    fuelFilter: string;
    cabinFilter: string;
    sparkPlugs: string;
    atfGearOil: string;
    brakeFluid: string;
    brakeService: string;
    coolant: string;
    timingBelt: string;
    egrIntake: string;
    throttleInjector: string;
    tiresAlignment: string;
  };
};

const SERVICE_RECOMMENDATION_ROWS: ServiceRecommendationRow[] = [
  { intervalKm: 10000, fullInspectionLabel: "Basic", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Inspect", fuelFilter: "—", cabinFilter: "Inspect", sparkPlugs: "—", atfGearOil: "—", brakeFluid: "—", brakeService: "Clean / Adjust", coolant: "—", timingBelt: "—", egrIntake: "—", throttleInjector: "—", tiresAlignment: "Rotate" } },
  { intervalKm: 20000, fullInspectionLabel: "Standard", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Clean", fuelFilter: "Replace", cabinFilter: "Inspect", sparkPlugs: "—", atfGearOil: "—", brakeFluid: "—", brakeService: "Clean / Adjust", coolant: "—", timingBelt: "—", egrIntake: "Inspect", throttleInjector: "Inspect", tiresAlignment: "Align" } },
  { intervalKm: 30000, fullInspectionLabel: "Standard", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "—", atfGearOil: "—", brakeFluid: "Flush", brakeService: "Clean / Adjust", coolant: "—", timingBelt: "—", egrIntake: "Inspect", throttleInjector: "Inspect", tiresAlignment: "Service" } },
  { intervalKm: 40000, fullInspectionLabel: "Full", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Replace", atfGearOil: "MT Change", brakeFluid: "Check", brakeService: "Clean / Adjust", coolant: "Replace", timingBelt: "Inspect", egrIntake: "Inspect", throttleInjector: "Inspect", tiresAlignment: "Service" } },
  { intervalKm: 50000, fullInspectionLabel: "Standard", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Inspect", atfGearOil: "—", brakeFluid: "—", brakeService: "Clean / Adjust", coolant: "—", timingBelt: "—", egrIntake: "Clean", throttleInjector: "Clean", tiresAlignment: "Service" } },
  { intervalKm: 60000, fullInspectionLabel: "Standard", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Replace", atfGearOil: "AT / MT Flush", brakeFluid: "Check", brakeService: "Clean / Adjust", coolant: "Check", timingBelt: "Inspect", egrIntake: "Clean", throttleInjector: "Clean", tiresAlignment: "Service" } },
  { intervalKm: 70000, fullInspectionLabel: "Standard", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Inspect", atfGearOil: "AT Flush", brakeFluid: "—", brakeService: "Clean / Adjust", coolant: "—", timingBelt: "—", egrIntake: "Inspect", throttleInjector: "Inspect", tiresAlignment: "Service" } },
  { intervalKm: 80000, fullInspectionLabel: "Full", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Replace", atfGearOil: "Change", brakeFluid: "Replace", brakeService: "Clean / Adjust", coolant: "Replace", timingBelt: "Replace", egrIntake: "Clean", throttleInjector: "Clean", tiresAlignment: "Service" } },
  { intervalKm: 90000, fullInspectionLabel: "Standard", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Inspect", atfGearOil: "—", brakeFluid: "—", brakeService: "Clean / Adjust", coolant: "—", timingBelt: "—", egrIntake: "Inspect", throttleInjector: "Inspect", tiresAlignment: "Service" } },
  { intervalKm: 100000, fullInspectionLabel: "Major", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Replace", atfGearOil: "Change", brakeFluid: "Replace", brakeService: "Clean / Adjust", coolant: "Replace", timingBelt: "Replace", egrIntake: "Clean", throttleInjector: "Clean", tiresAlignment: "Service" } },
  { intervalKm: 110000, fullInspectionLabel: "Standard", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Inspect", atfGearOil: "—", brakeFluid: "—", brakeService: "Clean / Adjust", coolant: "—", timingBelt: "—", egrIntake: "Inspect", throttleInjector: "Inspect", tiresAlignment: "Service" } },
  { intervalKm: 120000, fullInspectionLabel: "Overhaul", items: { engineOil: "Change", oilFilter: "Replace", airFilter: "Replace", fuelFilter: "Replace", cabinFilter: "Replace", sparkPlugs: "Replace", atfGearOil: "Change", brakeFluid: "Replace", brakeService: "Clean / Adjust", coolant: "Replace", timingBelt: "Replace", egrIntake: "Clean", throttleInjector: "Clean", tiresAlignment: "Service" } },
];

function parseOdometerKm(value: string): number {
  const numeric = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function getServiceRecommendationForOdometer(odometer: string) {
  const odometerKm = parseOdometerKm(odometer);
  if (!odometerKm) {
    return {
      odometerKm: 0,
      targetIntervalKm: 10000,
      kmToNextInterval: 10000,
      isOverdue: false,
      row: SERVICE_RECOMMENDATION_ROWS[0],
    };
  }
  const roundedTarget = Math.min(120000, Math.max(10000, Math.ceil(odometerKm / 10000) * 10000));
  const row = SERVICE_RECOMMENDATION_ROWS.find((item) => item.intervalKm === roundedTarget) || SERVICE_RECOMMENDATION_ROWS[SERVICE_RECOMMENDATION_ROWS.length - 1];
  const kmToNextInterval = Math.max(0, roundedTarget - odometerKm);
  const isOverdue = odometerKm > roundedTarget;
  return { odometerKm, targetIntervalKm: roundedTarget, kmToNextInterval, isOverdue, row };
}

const SERVICE_ITEM_LABELS: Record<keyof ServiceRecommendationRow["items"], string> = {
  engineOil: "Engine Oil",
  oilFilter: "Oil Filter",
  airFilter: "Air Filter",
  fuelFilter: "Fuel Filter",
  cabinFilter: "Cabin Filter",
  sparkPlugs: "Spark Plugs",
  atfGearOil: "ATF / Gear Oil",
  brakeFluid: "Brake Fluid",
  brakeService: "Brake Service",
  coolant: "Coolant",
  timingBelt: "Timing Belt",
  egrIntake: "EGR + Intake",
  throttleInjector: "Throttle / Injector",
  tiresAlignment: "Tires / Alignment",
};

function mapServiceItemsToQuickCategories(items: ServiceRecommendationRow["items"]): InspectionIssueKey[] {
  const mapped = new Set<InspectionIssueKey>();
  const active = Object.entries(items).filter(([, value]) => value !== "—");
  active.forEach(([key]) => {
    if (["engineOil", "oilFilter", "airFilter", "fuelFilter", "sparkPlugs", "egrIntake", "throttleInjector", "coolant"].includes(key)) mapped.add("engine");
    if (["brakeFluid", "brakeService"].includes(key)) mapped.add("brakes");
    if (["tiresAlignment"].includes(key)) {
      mapped.add("tires");
      mapped.add("alignment");
    }
    if (key === "atfGearOil") mapped.add("engine");
  });
  return Array.from(mapped);
}



const DEFAULT_PH_VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  { make: "Toyota", models: [{ name: "Corolla", startYear: 1995, endYear: 2013 }, { name: "Corolla Altis", startYear: 2001 }, { name: "Vios", startYear: 2003 }, { name: "Wigo", startYear: 2014 }, { name: "Yaris", startYear: 2007 }, { name: "Yaris Cross", startYear: 2023 }, { name: "Raize", startYear: 2022 }, { name: "Avanza", startYear: 2003 }, { name: "Veloz", startYear: 2022 }, { name: "Rush", startYear: 2018 }, { name: "Revo", startYear: 1998, endYear: 2005 }, { name: "Innova", startYear: 2005 }, { name: "Fortuner", startYear: 2005 }, { name: "Hilux", startYear: 1995 }, { name: "Hiace", startYear: 1995 }, { name: "LiteAce", startYear: 1995, endYear: 2002 }, { name: "Tamaraw", startYear: 1995, endYear: 2004 }, { name: "Land Cruiser", startYear: 1995 }, { name: "Land Cruiser Prado", startYear: 1997 }, { name: "RAV4", startYear: 1995 }, { name: "Camry", startYear: 1995 }, { name: "Previa", startYear: 1995, endYear: 2005 }, { name: "Alphard", startYear: 2008 }, { name: "Coaster", startYear: 1995 }, { name: "86", startYear: 2012 }] },
  { make: "Mitsubishi", models: [{ name: "Lancer", startYear: 1995, endYear: 2017 }, { name: "Lancer EX", startYear: 2008, endYear: 2017 }, { name: "Mirage", startYear: 2012 }, { name: "Mirage G4", startYear: 2013 }, { name: "Xpander", startYear: 2018 }, { name: "Xpander Cross", startYear: 2020 }, { name: "Adventure", startYear: 1997, endYear: 2017 }, { name: "Montero Sport", startYear: 2008 }, { name: "Pajero", startYear: 1995, endYear: 2021 }, { name: "Strada", startYear: 1995 }, { name: "L200", startYear: 1995, endYear: 2006 }, { name: "L300", startYear: 1995 }, { name: "Galant", startYear: 1995, endYear: 2012 }, { name: "Fuzion", startYear: 2007, endYear: 2016 }, { name: "Outlander", startYear: 2003 }, { name: "ASX", startYear: 2010 }, { name: "Xforce", startYear: 2024 }, { name: "Eclipse Cross", startYear: 2018 }], aliases: ["Mitsu"] },
  { make: "Nissan", models: [{ name: "Sentra", startYear: 1995, endYear: 2019 }, { name: "Sylphy", startYear: 2013 }, { name: "Almera", startYear: 2011 }, { name: "Cefiro", startYear: 1995, endYear: 2003 }, { name: "Teana", startYear: 2004, endYear: 2013 }, { name: "Patrol", startYear: 1995 }, { name: "X-Trail", startYear: 2003 }, { name: "Terra", startYear: 2018 }, { name: "Navara", startYear: 2005 }, { name: "Frontier", startYear: 1998, endYear: 2015 }, { name: "Urvan", startYear: 1995 }, { name: "Serena", startYear: 1995 }, { name: "Livina", startYear: 2022 }, { name: "Kicks", startYear: 2022 }, { name: "Juke", startYear: 2014, endYear: 2017 }] },
  { make: "Honda", models: [{ name: "Civic", startYear: 1995 }, { name: "City", startYear: 1996 }, { name: "Accord", startYear: 1995 }, { name: "CR-V", startYear: 1997 }, { name: "HR-V", startYear: 1999 }, { name: "BR-V", startYear: 2016 }, { name: "Mobilio", startYear: 2015, endYear: 2021 }, { name: "Jazz", startYear: 2004, endYear: 2020 }, { name: "City Hatchback", startYear: 2021 }, { name: "Odyssey", startYear: 1995, endYear: 2013 }, { name: "Pilot", startYear: 2003 }, { name: "Prelude", startYear: 1995, endYear: 2001 }, { name: "Stream", startYear: 2001, endYear: 2010 }] },
  { make: "Ford", models: [{ name: "Lynx", startYear: 1999, endYear: 2012 }, { name: "Laser", startYear: 1995, endYear: 2001 }, { name: "Focus", startYear: 2005, endYear: 2018 }, { name: "Fiesta", startYear: 2010, endYear: 2020 }, { name: "EcoSport", startYear: 2014, endYear: 2022 }, { name: "Territory", startYear: 2020 }, { name: "Escape", startYear: 2001, endYear: 2012 }, { name: "Everest", startYear: 2003 }, { name: "Ranger", startYear: 1998 }, { name: "Explorer", startYear: 1995 }, { name: "Expedition", startYear: 1997 }, { name: "Mustang", startYear: 2016 }] },
  { make: "Isuzu", models: [{ name: "D-Max", startYear: 2003 }, { name: "Fuego", startYear: 1995, endYear: 2005 }, { name: "Crosswind", startYear: 2001, endYear: 2017 }, { name: "mu-X", startYear: 2014 }, { name: "Alterra", startYear: 2005, endYear: 2012 }, { name: "Trooper", startYear: 1995, endYear: 2005 }, { name: "Traviz", startYear: 2020 }, { name: "N-Series", startYear: 1995 }] },
  { make: "Suzuki", models: [{ name: "Esteem", startYear: 1995, endYear: 2003 }, { name: "Celerio", startYear: 2009 }, { name: "Alto", startYear: 2000, endYear: 2014 }, { name: "S-Presso", startYear: 2020 }, { name: "Swift", startYear: 2005 }, { name: "Dzire", startYear: 2008 }, { name: "Ertiga", startYear: 2012 }, { name: "XL7", startYear: 2020 }, { name: "Vitara", startYear: 1995, endYear: 2005 }, { name: "Grand Vitara", startYear: 1998, endYear: 2022 }, { name: "Jimny", startYear: 1998 }, { name: "APV", startYear: 2005 }, { name: "Carry", startYear: 1995 }] },
  { make: "Hyundai", models: [{ name: "Accent", startYear: 1995 }, { name: "Elantra", startYear: 1995 }, { name: "Sonata", startYear: 1995 }, { name: "Getz", startYear: 2004, endYear: 2011 }, { name: "Eon", startYear: 2012, endYear: 2018 }, { name: "Reina", startYear: 2019, endYear: 2022 }, { name: "Tucson", startYear: 2005 }, { name: "Santa Fe", startYear: 2001 }, { name: "Starex", startYear: 1998, endYear: 2021 }, { name: "Staria", startYear: 2021 }, { name: "Creta", startYear: 2022 }, { name: "Custin", startYear: 2023 }, { name: "H-100", startYear: 1995 }, { name: "Kona", startYear: 2018 }] },
  { make: "Kia", models: [{ name: "Pride", startYear: 1995, endYear: 2005 }, { name: "Rio", startYear: 2000, endYear: 2023 }, { name: "Picanto", startYear: 2004 }, { name: "Soluto", startYear: 2019 }, { name: "Stonic", startYear: 2019 }, { name: "Seltos", startYear: 2020 }, { name: "Sportage", startYear: 1995 }, { name: "Sorento", startYear: 2003 }, { name: "Carnival", startYear: 1999 }, { name: "Carens", startYear: 2000, endYear: 2018 }, { name: "Besta", startYear: 1995, endYear: 2003 }] },
  { make: "Mazda", models: [{ name: "323", startYear: 1995, endYear: 2004 }, { name: "Mazda3", startYear: 2004 }, { name: "Mazda2", startYear: 2008 }, { name: "626", startYear: 1995, endYear: 2002 }, { name: "Mazda6", startYear: 2003 }, { name: "CX-3", startYear: 2016 }, { name: "CX-5", startYear: 2013 }, { name: "CX-7", startYear: 2008, endYear: 2013 }, { name: "CX-9", startYear: 2008 }, { name: "BT-50", startYear: 2007 }, { name: "Tribute", startYear: 2002, endYear: 2011 }, { name: "MX-5", startYear: 1995 }] },
  { make: "Chevrolet", models: [{ name: "Optra", startYear: 2003, endYear: 2012 }, { name: "Aveo", startYear: 2005, endYear: 2018 }, { name: "Sonic", startYear: 2012, endYear: 2017 }, { name: "Spark", startYear: 2010, endYear: 2021 }, { name: "Cruze", startYear: 2010, endYear: 2018 }, { name: "Malibu", startYear: 2013, endYear: 2015 }, { name: "Tracker", startYear: 2021 }, { name: "Trailblazer", startYear: 2013 }, { name: "Captiva", startYear: 2008, endYear: 2015 }, { name: "Colorado", startYear: 2012, endYear: 2021 }, { name: "Suburban", startYear: 1995, endYear: 2000 }] },
  { make: "Subaru", models: [{ name: "Impreza", startYear: 1995 }, { name: "WRX", startYear: 2002 }, { name: "Forester", startYear: 1998 }, { name: "XV", startYear: 2012 }, { name: "Crosstrek", startYear: 2023 }, { name: "Outback", startYear: 1995 }, { name: "Legacy", startYear: 1995, endYear: 2022 }, { name: "Levorg", startYear: 2015 }, { name: "BRZ", startYear: 2013 }, { name: "Tribeca", startYear: 2006, endYear: 2014 }] },
  { make: "MG", models: [{ name: "ZS", startYear: 2018 }, { name: "GT", startYear: 2022 }, { name: "5", startYear: 2021 }, { name: "RX5", startYear: 2018 }, { name: "HS", startYear: 2021 }, { name: "G50", startYear: 2021 }, { name: "Marvel R", startYear: 2024 }] },
  { make: "Geely", models: [{ name: "Emgrand", startYear: 2022 }, { name: "Coolray", startYear: 2019 }, { name: "Azkarra", startYear: 2020 }, { name: "Okavango", startYear: 2020 }, { name: "GX3 Pro", startYear: 2022 }, { name: "Geometry C", startYear: 2023 }] },
  { make: "Chery", models: [{ name: "QQ", startYear: 2005, endYear: 2013 }, { name: "Tiggo", startYear: 2008, endYear: 2015 }, { name: "Tiggo 2", startYear: 2018 }, { name: "Tiggo 5X", startYear: 2020 }, { name: "Tiggo 7 Pro", startYear: 2021 }, { name: "Tiggo 8 Pro", startYear: 2022 }, { name: "Arrizo 5", startYear: 2021 }, { name: "Arrizo 8", startYear: 2024 }] },
  { make: "GAC", models: [{ name: "GA4", startYear: 2019, endYear: 2022 }, { name: "Empow", startYear: 2023 }, { name: "GS3", startYear: 2019 }, { name: "GS4", startYear: 2024 }, { name: "GS8", startYear: 2019 }, { name: "M6 Pro", startYear: 2024 }, { name: "Emkoo", startYear: 2024 }] },
  { make: "Foton", models: [{ name: "Toplander", startYear: 2017 }, { name: "Traveller", startYear: 2017 }, { name: "Thunder", startYear: 2024 }, { name: "Tornado", startYear: 2010 }, { name: "View", startYear: 2010 }, { name: "Transvan", startYear: 2010 }, { name: "Harabas", startYear: 2010 }] },
  { make: "JMC", models: [{ name: "Vigus", startYear: 2019 }, { name: "Grand Avenue", startYear: 2023 }, { name: "NHR", startYear: 2015 }] },
  { make: "BYD", models: [{ name: "Dolphin", startYear: 2023 }, { name: "Atto 3", startYear: 2023 }, { name: "Seal", startYear: 2024 }, { name: "Han", startYear: 2024 }, { name: "Tang", startYear: 2024 }, { name: "Seagull", startYear: 2025 }] },
  { make: "Peugeot", models: [{ name: "206", startYear: 2002, endYear: 2010 }, { name: "207", startYear: 2007, endYear: 2012 }, { name: "3008", startYear: 2018 }, { name: "5008", startYear: 2018 }, { name: "2008", startYear: 2022 }, { name: "508", startYear: 2012, endYear: 2020 }, { name: "Landtrek", startYear: 2021 }] },
  { make: "BMW", models: [{ name: "3 Series", startYear: 1995 }, { name: "5 Series", startYear: 1995 }, { name: "7 Series", startYear: 1995 }, { name: "X1", startYear: 2010 }, { name: "X3", startYear: 2004 }, { name: "X5", startYear: 2000 }, { name: "X7", startYear: 2019 }, { name: "Z4", startYear: 2003 }, { name: "1 Series", startYear: 2005 }], aliases: ["Bimmer"] },
  { make: "Mercedes-Benz", models: [{ name: "C-Class", startYear: 1995 }, { name: "E-Class", startYear: 1995 }, { name: "S-Class", startYear: 1995 }, { name: "A-Class", startYear: 2000 }, { name: "GLA", startYear: 2014 }, { name: "GLC", startYear: 2016 }, { name: "GLE", startYear: 2016 }, { name: "V-Class", startYear: 2016 }, { name: "Sprinter", startYear: 1995 }], aliases: ["Mercedes", "Benz", "MB"] },
  { make: "Audi", models: [{ name: "A4", startYear: 1995 }, { name: "A6", startYear: 1995 }, { name: "Q3", startYear: 2013 }, { name: "Q5", startYear: 2010 }, { name: "Q7", startYear: 2007 }, { name: "TT", startYear: 1999, endYear: 2023 }] },
  { make: "Volkswagen", models: [{ name: "Beetle", startYear: 1999, endYear: 2018 }, { name: "Golf", startYear: 1995 }, { name: "Jetta", startYear: 1995, endYear: 2017 }, { name: "Santana", startYear: 2020 }, { name: "T-Cross", startYear: 2020 }, { name: "Tiguan", startYear: 2018 }, { name: "Lavida", startYear: 2023 }] },
  { make: "Lexus", models: [{ name: "IS", startYear: 1999 }, { name: "ES", startYear: 1995 }, { name: "GS", startYear: 1995, endYear: 2020 }, { name: "LS", startYear: 1995 }, { name: "NX", startYear: 2015 }, { name: "RX", startYear: 2000 }, { name: "GX", startYear: 2004 }, { name: "LX", startYear: 1995 }] },
  { make: "Mini", models: [{ name: "Cooper", startYear: 2003 }, { name: "Clubman", startYear: 2008, endYear: 2023 }, { name: "Countryman", startYear: 2011 }] },
  { make: "Land Rover", models: [{ name: "Discovery", startYear: 1995 }, { name: "Range Rover", startYear: 1995 }, { name: "Range Rover Sport", startYear: 2005 }, { name: "Evoque", startYear: 2012 }, { name: "Defender", startYear: 2021 }] },
  { make: "Jeep", models: [{ name: "Wrangler", startYear: 1995 }, { name: "Cherokee", startYear: 1995 }, { name: "Grand Cherokee", startYear: 1995 }, { name: "Compass", startYear: 2018 }, { name: "Renegade", startYear: 2017, endYear: 2021 }] },
];


const LUZON_REGION_TOWNS: Record<string, string[]> = {
  "NCR": ["Manila", "Quezon City", "Makati", "Pasig", "Taguig", "Parañaque", "Pasay", "Muntinlupa", "Marikina", "Las Piñas", "Mandaluyong", "Valenzuela", "Malabon", "Navotas", "San Juan", "Caloocan"],
  "CAR": ["Baguio", "La Trinidad", "Tabuk", "Bangued", "Lagawe", "Bontoc", "Bangued", "Lamut", "Tuba"],
  "Province Group I - Ilocos Province Group": ["Laoag", "Batac", "Vigan", "Bantay", "San Fernando", "Dagupan", "Alaminos", "Urdaneta", "Lingayen"],
  "Province Group II - Cagayan Valley": ["Tuguegarao", "Ilagan", "Santiago", "Cauayan", "Bayombong", "Solano", "Aparri", "Basco"],
  "Province Group III - Central Luzon": ["San Fernando", "Angeles", "Mabalacat", "Balanga", "Malolos", "Meycauayan", "Cabanatuan", "Tarlac City", "Olongapo", "Palayan"],
  "Province Group IV-A - CALABARZON": ["Antipolo", "Bacoor", "Dasmariñas", "Imus", "Tagaytay", "Calamba", "Santa Rosa", "San Pablo", "Lucena", "Lipa", "Batangas City", "Tanauan"],
  "Province Group IV-B - MIMAROPA": ["Calapan", "Puerto Princesa", "Roxas", "Mamburao", "Boac", "Romblon", "Odiongan"],
  "Province Group V - Bicol Province Group": ["Legazpi", "Naga", "Sorsogon City", "Iriga", "Tabaco", "Daet", "Virac", "Masbate City", "Ligao"],
};

const LUZON_REGION_OPTIONS = Object.keys(LUZON_REGION_TOWNS);

const EMPTY_INSPECTION_SELECTIONS: InspectionSelection = {
  brakes: false,
  suspension: false,
  engine: false,
  electrical: false,
  aircon: false,
  steering: false,
  tires: false,
  alignment: false,
};


const ILOCOS_SUR_MUNICIPALITIES = [
  "Alilem","Banayoyo","Bantay","Burgos","Cabugao","Caoayan","Cervantes","Galimuyod",
  "Gregorio del Pilar","Lidlidda","Magsingal","Nagbukel","Narvacan","Quirino","Salcedo",
  "San Emilio","San Esteban","San Ildefonso","San Juan","San Vicente","Santa",
  "Santa Catalina","Santa Cruz","Santa Lucia","Santa Maria","Santiago","Santo Domingo",
  "Sigay","Sinait","Sugpon","Suyo","Tagudin"
];

const ABRA_MUNICIPALITIES = [
  "Bangued","Boliney","Bucay","Bucloc","Daguioman","Danglas","Dolores","La Paz","Lacub",
  "Lagayan","Langiden","Licuan-Baay","Luba","Malibcong","Manabo","Peñarrubia","Pidigan",
  "Pilar","Sallapadan","San Isidro","San Juan","San Quintin","Tayum","Tineg","Tubo","Villaviciosa"
];

function getMunicipalitySuggestions(group: "Ilocos Sur" | "Abra" | "", query: string): string[] {
  const source =
    group === "Ilocos Sur"
      ? ILOCOS_SUR_MUNICIPALITIES
      : group === "Abra"
      ? ABRA_MUNICIPALITIES
      : [];
  const q = query.trim().toLowerCase();
  if (!q) return source;
  return source.filter((item) => item.toLowerCase().includes(q));
}

const DEFAULT_ARRIVAL_CHECKS: ArrivalCheckMap = {
  lights: { status: "Not Checked", note: "" },
  brokenGlass: { status: "Not Checked", note: "" },
  wipers: { status: "Not Checked", note: "" },
  hornCondition: { status: "Not Checked", note: "" },
};

const UNDER_HOOD_INSPECTION_LABELS: Record<UnderHoodInspectionKey, string> = {
  engineOil: "Engine Oil",
  coolant: "Coolant",
  brakeFluid: "Brake Fluid",
  powerSteeringFluid: "Power Steering Fluid",
  battery: "Battery",
  belts: "Belts",
  hoses: "Hoses",
  airFilter: "Air Filter",
  cabinFilter: "Cabin Filter",
  fluidLeaks: "Fluid Leaks",
};

const DEFAULT_UNDER_HOOD_INSPECTION: UnderHoodInspectionMap = {
  engineOil: { status: "OK", note: "" },
  coolant: { status: "OK", note: "" },
  brakeFluid: { status: "OK", note: "" },
  powerSteeringFluid: { status: "OK", note: "" },
  battery: { status: "OK", note: "" },
  belts: { status: "OK", note: "" },
  hoses: { status: "OK", note: "" },
  airFilter: { status: "OK", note: "" },
  cabinFilter: { status: "OK", note: "" },
  fluidLeaks: { status: "OK", note: "" },
};


const UNDER_HOOD_NOTE_PRESETS: Record<UnderHoodInspectionKey, Record<UnderHoodInspectionStatus, string[]>> = {
  engineOil: {
    OK: ["Level OK", "Oil still clean", "No sludge seen", "No leak at cap / pan"],
    "Needs Attention": ["Low level", "Dirty oil", "Due for oil change", "Monitor for seepage"],
    Urgent: ["Very low level", "Contaminated oil", "Active oil leak", "Change immediately"],
  },
  coolant: {
    OK: ["Reservoir level OK", "Coolant clean", "No overheating signs", "Hoses dry"],
    "Needs Attention": ["Low coolant", "Needs top-up", "Rusty coolant", "Check cooling system"],
    Urgent: ["Very low coolant", "Coolant leak present", "Overheating risk", "Immediate cooling service"],
  },
  brakeFluid: {
    OK: ["Level OK", "Fluid clear", "Reservoir normal"],
    "Needs Attention": ["Low level", "Dark fluid", "Moisture contamination possible", "Flush soon"],
    Urgent: ["Very low level", "Possible brake leak", "Immediate brake fluid service", "Unsafe to drive"],
  },
  powerSteeringFluid: {
    OK: ["Level OK", "Fluid condition normal", "No steering leak seen"],
    "Needs Attention": ["Low level", "Fluid dark", "Needs top-up", "Inspect steering system"],
    Urgent: ["Very low level", "Steering fluid leak", "Immediate repair needed", "Unsafe steering assist"],
  },
  battery: {
    OK: ["Battery secure", "Terminals clean", "Voltage normal", "Hold-down OK"],
    "Needs Attention": ["Weak battery", "Terminals corroded", "Charging check advised", "Needs cleaning"],
    Urgent: ["Battery failing", "Loose terminal", "Replace battery soon", "Starting issue risk"],
  },
  belts: {
    OK: ["No visible cracks", "Proper tension", "Belt condition normal"],
    "Needs Attention": ["Minor cracks", "Slight wear", "Monitor belt condition", "Recheck next service"],
    Urgent: ["Cracked belt", "Frayed belt", "Loose belt", "Replace belt immediately"],
  },
  hoses: {
    OK: ["No swelling seen", "No leaks seen", "Hoses secure", "Condition normal"],
    "Needs Attention": ["Soft hose", "Minor seepage", "Clamp needs check", "Monitor hose condition"],
    Urgent: ["Bulging hose", "Hose leak", "Cracked hose", "Replace hose immediately"],
  },
  airFilter: {
    OK: ["Filter clean", "Airflow normal", "No replacement needed"],
    "Needs Attention": ["Dirty filter", "Needs cleaning", "Replace soon", "Dust buildup present"],
    Urgent: ["Heavily clogged", "Restricted airflow", "Immediate replacement advised"],
  },
  cabinFilter: {
    OK: ["Filter clean", "Airflow normal", "No foul odor noted"],
    "Needs Attention": ["Dirty filter", "Needs cleaning", "Replace soon", "Airflow reduced"],
    Urgent: ["Heavily clogged", "Very poor airflow", "Immediate replacement advised"],
  },
  fluidLeaks: {
    OK: ["No active leak seen", "Dry under hood", "No seepage noted"],
    "Needs Attention": ["Minor seepage", "Monitor for leaks", "Needs further check", "Source not yet confirmed"],
    Urgent: ["Active leak present", "Immediate repair needed", "Unsafe to ignore", "Major fluid loss risk"],
  },
};

function getUnderHoodNotePresets(key: UnderHoodInspectionKey, status: UnderHoodInspectionStatus): string[] {
  const byKey = UNDER_HOOD_NOTE_PRESETS[key] || {};
  return byKey[status] || [];
}

const UNDER_HOOD_RECOMMENDATION_LINKS: Record<UnderHoodInspectionKey, InspectionIssueKey[]> = {
  engineOil: ["engine"],
  coolant: ["engine"],
  brakeFluid: ["brakes"],
  powerSteeringFluid: ["steering"],
  battery: ["electrical"],
  belts: ["engine"],
  hoses: ["engine"],
  airFilter: ["engine"],
  cabinFilter: ["aircon"],
  fluidLeaks: ["engine"],
};

function getUnderHoodRecommendedCategories(
  key: UnderHoodInspectionKey,
  status: UnderHoodInspectionStatus,
): InspectionIssueKey[] {
  if (status === "OK") return [];
  const base = UNDER_HOOD_RECOMMENDATION_LINKS[key] || [];
  if (key === "fluidLeaks" && status === "Urgent") {
    return Array.from(new Set([...base, "brakes", "steering"]));
  }
  if (key === "battery" && status === "Urgent") {
    return Array.from(new Set([...base, "engine"]));
  }
  return base;
}

function getUnderHoodNoteChips(note: string): string[] {
  return String(note || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

const DEFAULT_TIRE_INSPECTION: TireInspectionMap = {
  frontLeft: { condition: "Good", treadDepthMm: "", unsafe: false },
  frontRight: { condition: "Good", treadDepthMm: "", unsafe: false },
  rearLeft: { condition: "Good", treadDepthMm: "", unsafe: false },
  rearRight: { condition: "Good", treadDepthMm: "", unsafe: false },
};

const TIRE_POSITION_LABELS: Record<TirePosition, string> = {
  frontLeft: "Front Left",
  frontRight: "Front Right",
  rearLeft: "Rear Left",
  rearRight: "Rear Right",
};

const TIRE_POSITION_SHORT_LABELS: Record<TirePosition, string> = {
  frontLeft: "Front Left",
  frontRight: "Front Right",
  rearLeft: "Rear Left",
  rearRight: "Rear Right",
};


const createDefaultTakeNotes = (): InspectionTakeNote[] => [
  { id: "tn-1", title: "Take Note 1", note: "", photoUrl: "" },
  { id: "tn-2", title: "Take Note 2", note: "", photoUrl: "" },
  { id: "tn-3", title: "Take Note 3", note: "", photoUrl: "" },
];

const DEFAULT_INSPECTION_FORM: InspectionForm = {
  plate: "",
  vehicle: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  fuelType: "",
  transmissionType: "",
  customer: "",
  customerFirstName: "",
  customerLastName: "",
  customerPhone: "",
  customerEmail: "",
  municipality: "",
  region: "",
  odometer: "",
  bay: "Bay 1",
  priority: "Normal",
  issues: EMPTY_INSPECTION_SELECTIONS,
  isReturnJob: false,
  returnReason: "",
  linkedPreviousRoId: "",
  inspectionPhotos: [],
  initialExteriorPhotos: [],
  takeNotes: createDefaultTakeNotes(),
  arrivalChecks: { ...DEFAULT_ARRIVAL_CHECKS },
  tireInspection: { ...DEFAULT_TIRE_INSPECTION },
  underHoodInspection: { ...DEFAULT_UNDER_HOOD_INSPECTION },
  customerVisibleFindings: "",
  recommendationsSummary: "",
  serviceAdvisorNotes: "",
  customerType: "Person",
  companyName: "",
  municipalityGroup: "",
  customerMunicipality: "",
};

const DEFAULT_RELEASE_CHECKLIST: ReleaseChecklist = {
  invoiceReviewed: false,
  paymentConfirmed: false,
  vehicleChecked: false,
  customerNotified: false,
  releasedBy: "",
  releaseNote: "",
};

const DEFAULT_QC_CHECKLIST: QCChecklist = {
  workPerformedVerified: false,
  originalConcernResolved: "Yes",
  roadTestPerformed: false,
  roadTestResult: "",
  brakesOk: false,
  steeringOk: false,
  lightsOk: false,
  hornOk: false,
  noLeaks: false,
  fluidLevelsOk: false,
  batterySecured: false,
  noLooseParts: false,
  wheelsSecured: false,
  cleanlinessAcceptable: false,
  toolsRemoved: false,
  finalResult: "Pending",
  notes: "",
  inspectedBy: "",
  failedLogs: [],
  alignmentBeforeReport: "",
  alignmentBeforeNotes: "",
  alignmentAfterReport: "",
  alignmentAfterNotes: "",
};


const DEFAULT_PAYMENT_FORM: PaymentForm = {
  amount: "",
  method: "Cash",
  note: "",
};

const DEFAULT_SMS_GATEWAY_SETTINGS: SmsGatewaySettings = {
  enabled: false,
  endpoint: "",
  apiKey: "",
  deviceName: "Android Gateway",
  useClipboardFallback: true,
};

const DEFAULT_SUPPLIER_FORM: SupplierForm = {
  name: "",
  contactPerson: "",
  phone: "",
  notes: "",
};

const DEFAULT_BID_FORM: BidForm = {
  supplierId: "",
  brand: "",
  quantity: "",
  unitPrice: "",
  etaDays: "",
  warrantyNote: "",
  condition: "",
  notes: "",
  receiptUrl: "",
  shippingReceiptUrl: "",
  partPhotoUrl: "",
  customerSellingPrice: "",
  laborSellingPrice: "",
};

const DEFAULT_INVENTORY_FORM: InventoryForm = {
  partName: "",
  sku: "",
  quantityOnHand: "",
  reorderLevel: "",
  avgCost: "",
  location: "",
};

const DEFAULT_EMPLOYEE_FORM: EmployeeForm = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  displayName: "",
  role: "Technician",
  department: "Workshop",
  phone: "",
  username: "",
  password: "",
  active: true,
  mustChangePassword: false,
  allowedViews: undefined,
};

const DEFAULT_SALES_FORM: SalesForm = {
  entryDate: new Date().toISOString().slice(0, 10),
  grossSales: "",
  tireSales: "",
  notes: "",
};

const DEFAULT_WORK_LINE: ROWorkLine = {
  id: "",
  label: "New Job",
  category: "General",
  priority: "Normal",
  technician: "",
  primaryTechnician: "",
  supportingTechnicians: [],
  assignmentLog: [],
  assignedBy: "",
  finishedBy: "",
  estimatedHours: 1,
  actualHours: 0,
  laborRate: 850,
  laborCost: 850,
  partsCost: 0,
  estimateTotal: 850,
  status: "Pending",
  approvalStatus: "Pending Approval",
  partsSummary: "No Parts",
  customerDecisionLog: [],
  smsApprovalStatus: "Not Sent",
  sessions: [],
  photos: [],
  overrideNote: "",
};

const ALL_VIEWS: ViewKey[] = [
  "dashboard",
  "vehicleIntake",
  "inspection",
  "approval",
  "ro",
  "parts",
  "shop",
  "tech",
  "billing",
  "customerSummary",
  "history",
  "backJob",
  "activityLogs",
  "salesReports",
  "purchasing",
  "inventory",
  "employees",
];

function getDefaultAllowedViewsForRole(role: UserRole): ViewKey[] {
  if (role === "Admin") return [...ALL_VIEWS];
  if (["Management", "Manager", "Assistant Manager"].includes(role)) {
    return [
      "dashboard",
      "vehicleIntake",
      "inspection",
      "approval",
      "ro",
      "parts",
      "shop",
      "tech",
      "billing",
      "customerSummary",
      "history",
      "backJob",
      "activityLogs",
      "salesReports",
      "purchasing",
      "inventory",
      "employees",
    ];
  }
  if (role === "Service Advisor") {
    return ["dashboard", "vehicleIntake", "inspection", "approval", "ro", "parts", "billing", "customerSummary", "history", "salesReports"];
  }
  if (role === "Office Staff" || role === "Reception") {
    return ["dashboard", "vehicleIntake", "inspection", "ro", "billing", "customerSummary", "history"];
  }
  if (role === "Technician" || role === "Mechanic") {
    return ["dashboard", "shop", "tech", "ro", "parts", "history"];
  }
  return ["dashboard"];
}

function normalizeEmployeeRecord(raw: Partial<EmployeeRecord>, index = 0): EmployeeRecord {
  const role = (raw.role || "Technician") as UserRole;
  const firstName = String(raw.firstName || "").trim();
  const lastName = String(raw.lastName || "").trim();
  const displayName = String(raw.displayName || [firstName, lastName].filter(Boolean).join(" ") || raw.username || `Employee ${index + 1}`).trim();
  return {
    id: raw.id || `emp-${index + 1}`,
    employeeCode: raw.employeeCode || `EMP-${String(index + 1).padStart(3, "0")}`,
    firstName,
    lastName,
    displayName,
    role,
    department: String(raw.department || (["Admin", "Management", "Manager", "Assistant Manager"].includes(role) ? "Management" : role === "Service Advisor" ? "Front Desk" : "Workshop")),
    phone: String(raw.phone || ""),
    username: String(raw.username || `employee${index + 1}`),
    password: String(raw.password || "123456"),
    active: raw.active !== false,
    mustChangePassword: Boolean(raw.mustChangePassword),
    allowedViews: Array.isArray(raw.allowedViews) && raw.allowedViews.length ? raw.allowedViews.filter((view): view is ViewKey => ALL_VIEWS.includes(view as ViewKey)) : undefined,
    createdAt: Number(raw.createdAt) || Date.now(),
  };
}

function seedEmployeesFromUsers(users: User[]): EmployeeRecord[] {
  return users.map((user, index) => normalizeEmployeeRecord(user, index));
}

function canAccessViewForUser(currentUser: User | null, targetView: ViewKey): boolean {
  if (!currentUser) return false;
  const allowedViews = currentUser.allowedViews?.length ? currentUser.allowedViews : getDefaultAllowedViewsForRole(currentUser.role);
  return allowedViews.includes(targetView);
}

function mapEmployeeToTechnicianRole(role: UserRole): string {
  if (role === "Technician") return "Technician";
  if (role === "Mechanic") return "Mechanic";
  return role;
}

/* =========================
   HELPERS
========================= */

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const getTodayDateString = () => new Date().toISOString().slice(0, 10);

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function buildDateSerialPrefix(dateLike?: number | string | Date): string {
  const d =
    dateLike instanceof Date
      ? dateLike
      : typeof dateLike === "number" || typeof dateLike === "string"
      ? new Date(dateLike)
      : new Date();

  const safeDate = Number.isNaN(d.getTime()) ? new Date() : d;
  const yyyy = safeDate.getFullYear();
  const mm = pad2(safeDate.getMonth() + 1);
  const dd = pad2(safeDate.getDate());

  return `${yyyy}${mm}${dd}`;
}

function parseStandardNumberSequence(value: string): { prefix: string; seq: number } | null {
  const match = String(value || "").trim().match(/^([A-Z]+)-(\d{8})-(\d{3,})$/);
  if (!match) return null;
  return {
    prefix: `${match[1]}-${match[2]}`,
    seq: Number(match[3]),
  };
}

function generateStandardNumber(
  typePrefix: string,
  existingValues: string[],
  dateLike?: number | string | Date,
): string {
  const datePrefix = buildDateSerialPrefix(dateLike);
  const fullPrefix = `${typePrefix}-${datePrefix}`;

  const maxSeq = existingValues.reduce((max, value) => {
    const parsed = parseStandardNumberSequence(value);
    if (!parsed) return max;
    if (parsed.prefix !== fullPrefix) return max;
    return Math.max(max, parsed.seq);
  }, 0);

  return `${fullPrefix}-${String(maxSeq + 1).padStart(3, "0")}`;
}

function safeLoad<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeLegacyVehicleCatalog(raw: unknown): VehicleCatalogEntry[] {
  if (!Array.isArray(raw)) return DEFAULT_PH_VEHICLE_CATALOG;

  const normalized = raw
    .map((entry: any) => {
      if (!entry || typeof entry !== "object") return null;
      const make = String(entry.make || "").trim();
      if (!make) return null;

      const rawModels = Array.isArray(entry.models) ? entry.models : [];
      const models = rawModels
        .map((model: any) => {
          if (typeof model === "string") {
            const name = model.trim();
            return name ? { name } : null;
          }
          if (model && typeof model === "object") {
            const name = String(model.name || "").trim();
            if (!name) return null;
            return {
              name,
              startYear:
                model.startYear !== undefined && model.startYear !== null && model.startYear !== ""
                  ? Number(model.startYear)
                  : undefined,
              endYear:
                model.endYear !== undefined && model.endYear !== null && model.endYear !== ""
                  ? Number(model.endYear)
                  : undefined,
              aliases: Array.isArray(model.aliases)
                ? model.aliases.map((alias: unknown) => String(alias).trim()).filter(Boolean)
                : undefined,
            };
          }
          return null;
        })
        .filter(Boolean);

      return {
        make,
        models,
        aliases: Array.isArray(entry.aliases)
          ? entry.aliases.map((alias: unknown) => String(alias).trim()).filter(Boolean)
          : undefined,
      };
    })
    .filter(Boolean);

  return normalized.length ? normalized : DEFAULT_PH_VEHICLE_CATALOG;
}

function normalizeVehicleCatalogUrl(raw: unknown): string {
  return typeof raw === "string" ? raw : "";
}

function getMonthKeyFromDateString(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${new Date().getFullYear()}-01`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabelFromKey(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year || new Date().getFullYear(), Math.max(0, (month || 1) - 1), 1);
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

function calculateActualHoursFromSessions(sessions: TimeSession[]): number {
  const ms = sessions.reduce((sum, s) => sum + ((s.endedAt || Date.now()) - s.startedAt), 0);
  return round2(ms / 3600000);
}

function getWorkLineEstimate(line: ROWorkLine): ROWorkLine {
  const laborCost = round2((line.estimatedHours || 0) * (line.laborRate || 0));
  const estimateTotal = round2(laborCost + (line.partsCost || 0));
  const actualHours = line.sessions.length ? calculateActualHoursFromSessions(line.sessions) : line.actualHours;
  return { ...line, laborCost, estimateTotal, actualHours };
}

function getPartsSummaryForWorkLine(parts: PartRequest[], workLineId?: string): PartsSummary {
  if (!workLineId) return "No Parts";
  const linked = parts.filter((p) => p.workLineId === workLineId && !["Cancelled", "Closed"].includes(p.status));
  if (!linked.length) return "No Parts";
  if (linked.some((p) => !["Parts Arrived", "Closed"].includes(p.status))) return "Waiting Parts";
  return "Ready";
}

function sumPartsCostForWorkLine(parts: PartRequest[], workLineId?: string): number {
  if (!workLineId) return 0;
  return round2(
    parts
      .filter((p) => p.workLineId === workLineId && p.status !== "Cancelled")
      .reduce((sum, p) => sum + p.qty * p.unitCost, 0),
  );
}

function getROStatusFromWorkLines(workLines: ROWorkLine[], ro?: Partial<RepairOrder>): ROStatus {
  const actionable = workLines.filter((w) => w.approvalStatus !== "Declined");
  const approved = actionable.filter((w) => ["Approved", "Partially Approved"].includes(w.approvalStatus));
  const pendingApproval = actionable.some((w) => w.approvalStatus === "Pending Approval");
  const anyInProgress = actionable.some((w) => w.status === "In Progress");
  const anyWaitingParts = actionable.some((w) => w.status === "Waiting Parts");
  const anyQualityCheck = actionable.some((w) => w.status === "Quality Check");
  const allDone = actionable.length > 0 && actionable.every((w) => w.status === "Done" || w.status === "Cancelled");
  const hasSeedData = Boolean(ro?.plate || ro?.vehicle || ro?.customer || actionable.length > 0);

  if (ro?.closedAt) return "Closed";
  if (ro?.releaseChecklist?.releasedAt || ro?.releaseStatus === "Released") return "Released";
  if (!ro?.inspectionCompleted) return hasSeedData ? "Waiting Inspection" : "Draft";
  if (pendingApproval || (actionable.length > 0 && approved.length === 0 && !allDone)) return "Waiting Approval";
  if (anyWaitingParts) return "Waiting Parts";
  if (anyInProgress) return "In Progress";
  if (anyQualityCheck || (allDone && !ro?.qcPassed)) return "Quality Check";
  if (allDone && ro?.qcPassed) return "Ready Release";
  if (approved.length > 0) return "Approved / Ready to Work";
  return "Waiting Approval";
}

function getInvoiceStatus(paymentsTotal: number, invoiceTotal: number): InvoiceStatus {
  if (invoiceTotal <= 0) return "Draft";
  if (paymentsTotal <= 0) return "Ready for Payment";
  if (paymentsTotal < invoiceTotal) return "Partially Paid";
  return "Paid";
}

function getReleaseStatus(invoiceStatus: InvoiceStatus, checklist: ReleaseChecklist): ReleaseStatus {
  if (
    invoiceStatus === "Paid" &&
    checklist.invoiceReviewed &&
    checklist.paymentConfirmed &&
    checklist.vehicleChecked &&
    checklist.customerNotified
  ) {
    return checklist.releasedAt ? "Released" : "Ready for Release";
  }
  return "Hold";
}

function getROFinancials(ro: RepairOrder) {
  const billable = ro.workLines.filter((w) => w.approvalStatus !== "Declined");
  const labor = round2(billable.reduce((sum, w) => sum + w.laborCost, 0));
  const parts = round2(billable.reduce((sum, w) => sum + w.partsCost, 0));
  const total = round2(labor + parts);
  const paid = round2(ro.payments.reduce((sum, p) => sum + p.amount, 0));
  const balance = round2(Math.max(0, total - paid));
  return { labor, parts, total, paid, balance };
}

function buildWorkLinesFromInspection(issues: InspectionSelection): ROWorkLine[] {
  return INSPECTION_ISSUES.filter((issue) => issues[issue.key]).map((issue) =>
    getWorkLineEstimate({
      ...DEFAULT_WORK_LINE,
      id: uid(),
      label: issue.defaultWorkLineLabel,
      category: issue.category,
      estimatedHours: issue.defaultHours,
    }),
  );
}

function getCustomerKey(ro: RepairOrder): string {
  return `${ro.customer.trim().toLowerCase()}__${ro.plate.trim().toLowerCase()}`;
}

function buildCustomerHistory(ros: RepairOrder[]): CustomerHistoryRecord[] {
  const map = new Map<string, CustomerHistoryRecord>();

  ros.forEach((ro) => {
    const key = getCustomerKey(ro);
    if (!map.has(key)) {
      map.set(key, {
        key,
        customer: ro.customer,
        plate: ro.plate,
        vehicle: ro.vehicle,
        totalVisits: 0,
        totalReturnJobs: 0,
        roIds: [],
        repeatIssueCategories: [],
      });
    }

    const current = map.get(key)!;
    current.totalVisits += 1;
    if (ro.isReturnJob) current.totalReturnJobs += 1;
    current.roIds.push(ro.id);

    if (!current.lastVisitAt || ro.createdAt > current.lastVisitAt) {
      current.lastVisitAt = ro.createdAt;
    }

    const categories = ro.workLines
      .filter((w) => w.approvalStatus !== "Declined")
      .map((w) => w.category);

    const seen = new Set(current.repeatIssueCategories);
    categories.forEach((category) => {
      if (seen.has(category) || current.roIds.length > 1) {
        if (!current.repeatIssueCategories.includes(category)) {
          current.repeatIssueCategories.push(category);
        }
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => (b.lastVisitAt || 0) - (a.lastVisitAt || 0));
}

function formatDuration(start?: number): string {
  if (!start) return "0m";
  const mins = Math.max(0, Math.floor((Date.now() - start) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function isRepeatIssue(currentRo: RepairOrder, category: string, ros: RepairOrder[]) {
  return ros.some(
    (ro) =>
      ro.id !== currentRo.id &&
      ro.plate.trim().toLowerCase() === currentRo.plate.trim().toLowerCase() &&
      ro.workLines.some((w) => w.category === category && w.approvalStatus !== "Declined"),
  );
}

function getSupplierName(suppliers: Supplier[], id?: string) {
  return suppliers.find((s) => s.id === id)?.name || "Not selected";
}

function photosToMultiline(photos: InspectionPhoto[]): string {
  return photos.map((photo) => photo.url).filter(Boolean).join("\n");
}

function multilineToPhotos(value: string): InspectionPhoto[] {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((url, index) => ({ id: `part-photo-${index}-${url}`, label: `Photo ${index + 1}`, url }));
}

function getCustomerSellingTotal(part: PartRequest): number {
  if (part.customerTotalSellingPrice > 0) return round2(part.customerTotalSellingPrice);
  return round2((part.customerPartsSellingPrice || 0) + (part.customerLaborSellingPrice || 0));
}

function getBidUploadCount(bid: SupplierBid): number {
  return (bid.receiptFiles?.length || 0) + (bid.shippingReceiptFiles?.length || 0) + (bid.actualPartPhotos?.length || 0);
}

function getPrimaryTechnicianName(line: ROWorkLine): string {
  return (line.primaryTechnician || line.technician || "").trim();
}

function getSupportingTechnicianNames(line: ROWorkLine): string[] {
  const primary = getPrimaryTechnicianName(line).toLowerCase();
  const raw = Array.isArray(line.supportingTechnicians) ? line.supportingTechnicians : [];
  return Array.from(new Set(raw.map((name) => name.trim()).filter(Boolean))).filter((name) => name.toLowerCase() !== primary);
}

function lineHasTechnician(line: ROWorkLine, technicianName: string): boolean {
  const name = technicianName.trim().toLowerCase();
  if (!name) return false;
  return (
    getPrimaryTechnicianName(line).toLowerCase() === name ||
    getSupportingTechnicianNames(line).some((support) => support.toLowerCase() === name)
  );
}

function normalizeLegacyRepairOrder(ro: Partial<RepairOrder>): RepairOrder {
  const normalizedWorkLines = (ro.workLines || []).map((rawLine) => {
    const primaryTechnician = ((rawLine as any).primaryTechnician || rawLine.technician || "").trim();
    const supportingTechnicians = Array.isArray((rawLine as any).supportingTechnicians)
      ? Array.from(new Set(((rawLine as any).supportingTechnicians as string[]).map((name) => String(name).trim()).filter(Boolean)))
          .filter((name) => name.toLowerCase() !== primaryTechnician.toLowerCase())
      : [];
    const assignmentLog = Array.isArray((rawLine as any).assignmentLog)
      ? ((rawLine as any).assignmentLog as TechnicianAssignmentLog[])
      : primaryTechnician
      ? [{
          id: `legacy-${rawLine.id || uid()}`,
          technicianName: primaryTechnician,
          role: "Primary" as AssignmentRole,
          assignedAt: ro.createdAt || Date.now(),
          assignedBy: (rawLine as any).assignedBy || "System",
          note: "Imported from legacy technician field.",
        }]
      : [];

    return getWorkLineEstimate({
      ...DEFAULT_WORK_LINE,
      ...rawLine,
      priority: ((rawLine as any).priority as Priority) || "Normal",
      technician: primaryTechnician,
      primaryTechnician,
      supportingTechnicians,
      assignmentLog,
      sessions: Array.isArray(rawLine.sessions) ? rawLine.sessions : [],
      photos: Array.isArray((rawLine as any).photos) ? (rawLine as any).photos : [],
    });
  });

  const inspectionCompleted = Boolean(
    ro.inspectionCompleted ||
      (ro.inspectionPhotos?.length || 0) ||
      (ro.initialExteriorPhotos?.length || 0) ||
      (ro.takeNotes || []).some((item) => item.note || item.photoUrl) ||
      normalizedWorkLines.length > 0 ||
      ro.vehicle ||
      ro.vehicleMake ||
      ro.vehicleModel ||
      ro.vehicleYear ||
      ro.serviceAdvisorNotes
  );

  const normalizedVehicle =
    ro.vehicle || buildInspectionVehicleLabel({
      ...DEFAULT_INSPECTION_FORM,
      vehicle: ro.vehicle || "",
      vehicleMake: ro.vehicleMake || "",
      vehicleModel: ro.vehicleModel || "",
      vehicleYear: ro.vehicleYear || "",
    });

  const normalized: RepairOrder = {
    id: ro.id || uid(),
    roNumber:
      ro.roNumber ||
      generateStandardNumber("RO", [], ro.createdAt || Date.now()),
    plate: ro.plate || "",
    vehicle: normalizedVehicle || "",
    vehicleMake: ro.vehicleMake || "",
    vehicleModel: ro.vehicleModel || "",
    vehicleYear: ro.vehicleYear || "",
    customer: ro.customer || "",
    customerPhone: ro.customerPhone || "",
    odometer: ro.odometer || "",
    bay: ro.bay || "Bay 1",
    priority: ro.priority || "Normal",
    status: "Draft",
    createdAt: ro.createdAt || Date.now(),
    inspectionCompleted,
    qcPassed: Boolean(ro.qcPassed),
    qcChecklist: { ...DEFAULT_QC_CHECKLIST, ...(ro.qcChecklist || {}) },
    closedAt: ro.closedAt,
    workLines: normalizedWorkLines,
    invoiceStatus: ro.invoiceStatus || "Draft",
    releaseStatus: ro.releaseStatus || "Hold",
    payments: Array.isArray(ro.payments) ? ro.payments : [],
    invoiceNote: ro.invoiceNote || "",
    invoiceNumber: ro.invoiceNumber,
    customerVisibleFindings: ro.customerVisibleFindings || "",
    recommendationsSummary: ro.recommendationsSummary || normalizedWorkLines.map((line) => line.label).join(", "),
    releaseChecklist: { ...DEFAULT_RELEASE_CHECKLIST, ...(ro.releaseChecklist || {}) },
    isReturnJob: Boolean(ro.isReturnJob),
    returnReason: ro.returnReason || "",
    linkedPreviousRoId: ro.linkedPreviousRoId,
    inspectionPhotos: Array.isArray(ro.inspectionPhotos) ? ro.inspectionPhotos : [],
    initialExteriorPhotos: Array.isArray(ro.initialExteriorPhotos) ? ro.initialExteriorPhotos : [],
    takeNotes: Array.isArray(ro.takeNotes) && ro.takeNotes.length ? ro.takeNotes : createDefaultTakeNotes(),
    arrivalChecks: { ...DEFAULT_ARRIVAL_CHECKS, ...(ro.arrivalChecks || {}) },
    tireInspection: {
      ...DEFAULT_TIRE_INSPECTION,
      ...Object.fromEntries(
        Object.entries((ro as any).tireInspection || {}).map(([key, value]) => [
          key,
          buildTireInspectionItem(DEFAULT_TIRE_INSPECTION[key as TirePosition] || DEFAULT_TIRE_INSPECTION.frontLeft, value as Partial<TireInspectionItem>),
        ]),
      ),
    },
    underHoodInspection: ensureUnderHoodInspectionMap((ro as any).underHoodInspection),
    serviceAdvisorNotes: ro.serviceAdvisorNotes || "",
    softLocked: Boolean(ro.softLocked),
    lockOverrideReason: ro.lockOverrideReason || "",
  };

  const fin = getROFinancials(normalized);
  normalized.invoiceStatus = getInvoiceStatus(fin.paid, fin.total);
  normalized.releaseStatus = getReleaseStatus(normalized.invoiceStatus, normalized.releaseChecklist);
  normalized.status = getROStatusFromWorkLines(normalized.workLines, normalized);
  return normalized;
}

function buildManagerAlerts(ros: RepairOrder[]): ManagerAlert[] {
  const alerts: ManagerAlert[] = [];

  ros.forEach((ro) => {
    const ageHours = (Date.now() - ro.createdAt) / 3600000;
    if (ro.status === "In Progress" && ageHours > 24) {
      alerts.push({
        id: `${ro.id}-delay`,
        roId: ro.id,
        roNumber: ro.roNumber,
        level: "warning",
        message: "Job in progress more than 24 hours.",
      });
    }

    if (ro.status === "Waiting Parts" && ageHours > 48) {
      alerts.push({
        id: `${ro.id}-parts`,
        roId: ro.id,
        roNumber: ro.roNumber,
        level: "critical",
        message: "Waiting parts for more than 48 hours.",
      });
    }

    if (ro.releaseStatus === "Released" && ro.invoiceStatus !== "Paid") {
      alerts.push({
        id: `${ro.id}-unpaid`,
        roId: ro.id,
        roNumber: ro.roNumber,
        level: "critical",
        message: "Released while not fully paid.",
      });
    }
  });

  return alerts;
}

function buildDailySnapshot(ros: RepairOrder[]) {
  const today = new Date().toDateString();
  const todaysRos = ros.filter((ro) => new Date(ro.createdAt).toDateString() === today);

  return {
    jobsToday: todaysRos.length,
    revenueToday: round2(
      todaysRos.reduce(
        (sum, ro) =>
          sum +
          ro.payments
            .filter((p) => new Date(p.timestamp).toDateString() === today)
            .reduce((s, p) => s + p.amount, 0),
        0,
      ),
    ),
    releasedToday: todaysRos.filter(
      (ro) =>
        ro.releaseChecklist.releasedAt &&
        new Date(ro.releaseChecklist.releasedAt).toDateString() === today,
    ).length,
    activeJobs: ros.filter((ro) => ro.status === "In Progress").length,
    pendingApprovals: ros.reduce(
      (sum, ro) => sum + ro.workLines.filter((w) => w.approvalStatus === "Pending Approval").length,
      0,
    ),
  };
}

function getROBadgeStyle(status: ROStatus): React.CSSProperties {
  if (["Closed", "Released"].includes(status)) return styles.badgeGood;
  if (status === "Ready Release") return styles.badgeBlue;
  if (status === "Waiting Parts") return styles.badgeWarn;
  if (status === "In Progress") return styles.badgeBlue;
  if (status === "Quality Check") return styles.badgePurple;
  if (status === "Approved / Ready to Work") return styles.badgeBlue;
  if (status === "Waiting Approval") return styles.badgeWarn;
  if (status === "Waiting Inspection") return styles.badgeMuted;
  return styles.badgeMuted;
}

function getPriorityStyle(priority: Priority): React.CSSProperties {
  if (priority === "Urgent") return styles.badgeDanger;
  if (priority === "High") return styles.badgeWarn;
  if (priority === "Normal") return styles.badgeBlue;
  return styles.badgeMuted;
}

function getRoWarnings(ro: RepairOrder): string[] {
  const warnings: string[] = [];
  if (!ro.inspectionCompleted) warnings.push("Inspection incomplete");
  if (ro.invoiceStatus !== "Paid" && ro.releaseStatus === "Released") warnings.push("Released with unpaid balance");
  if (ro.workLines.some((line) => line.approvalStatus === "Pending Approval")) warnings.push("Pending approval");
  if (ro.workLines.some((line) => line.partsSummary === "Waiting Parts")) warnings.push("Waiting parts");
  if (ro.isReturnJob) warnings.push("Comeback job");
  return warnings;
}

function detectCompanyLikeName(value: string): boolean {
  const text = value.trim().toLowerCase();
  if (!text) return false;
  return [
    "inc",
    "corp",
    "corporation",
    "company",
    "co.",
    "enterprises",
    "enterprise",
    "trading",
    "motors",
    "services",
    "lending",
    "foundation",
    "association",
    "school",
    "hospital",
    "construction",
  ].some((token) => text.includes(token));
}

function getVehicleIntakeValidation(form: InspectionForm) {
  const firstName = (form.customerFirstName || "").trim();
  const lastName = (form.customerLastName || "").trim();
  const companyName = (form.companyName || "").trim();
  const phone = (form.customerPhone || "").trim();
  const municipality = (form.customerMunicipality || "").trim();

  const customerMode = companyName
    ? "Company"
    : firstName || lastName
    ? "Person"
    : "Unspecified";

  const missing: string[] = [];
  if (!form.plate.trim()) missing.push("Plate Number");
  if (!form.vehicleYear.trim()) missing.push("Year");
  if (!form.vehicleMake.trim()) missing.push("Make");
  if (!form.vehicleModel.trim()) missing.push("Model");
  if (!form.odometer.trim()) missing.push("Odometer");
  if (!(form as any).fuelType?.trim()) missing.push("Fuel Type");
  if (!(form as any).transmissionType?.trim()) missing.push("Transmission Type");
  if (!phone) missing.push("Phone Number");
  if (!municipality) missing.push("Municipality / Town");
  if (!municipality) missing.push("Municipality / Town");

  const customerErrors: string[] = [];
  if (!companyName && !(firstName && lastName)) {
    customerErrors.push("Enter either Company Name or both First Name and Last Name.");
  }
  if (companyName && (firstName || lastName)) {
    customerErrors.push("Use either Company Name or Person Name fields, not both.");
  }
  if (phone && !(new RegExp("^[0-9+()\\s-]{7,20}$")).test(phone)) {
    customerErrors.push("Phone Number format looks incomplete.");
  }

  const warnings: string[] = [];
  if (!companyName && detectCompanyLikeName(`${firstName} ${lastName}`)) {
    warnings.push("The entered name looks like a company. Consider using Company Name instead.");
  }
  if (companyName && !detectCompanyLikeName(companyName)) {
    warnings.push("Company Name does not look like a typical business name, but this is still allowed.");
  }

  return {
    customerMode,
    missing,
    customerErrors,
    warnings,
    isValid: missing.length === 0 && customerErrors.length === 0,
  };
}

function buildInspectionVehicleLabel(form: InspectionForm): string {
  const composed = [form.vehicleYear, form.vehicleMake, form.vehicleModel]
    .map((v) => v.trim())
    .filter(Boolean)
    .join(" ");
  return composed || form.vehicle.trim();
}



function normalizeVehicleCatalogPayload(payload: unknown): VehicleCatalogEntry[] {
  const normalizeModel = (value: unknown): VehicleCatalogModel | null => {
    if (typeof value === "string") {
      const name = value.trim();
      return name ? { name } : null;
    }
    if (!value || typeof value !== "object") return null;
    const name = String((value as any).name || "").trim();
    if (!name) return null;
    return {
      name,
      startYear: Number.isFinite(Number((value as any).startYear)) ? Number((value as any).startYear) : undefined,
      endYear: Number.isFinite(Number((value as any).endYear)) ? Number((value as any).endYear) : undefined,
      aliases: Array.isArray((value as any).aliases)
        ? Array.from(new Set((value as any).aliases.map((alias: unknown) => String(alias).trim()).filter(Boolean)))
        : [],
    };
  };

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const make = String((item as any).make || "").trim();
        const models = Array.isArray((item as any).models)
          ? Array.from(
              new Map(
                (item as any).models
                  .map((model: unknown) => normalizeModel(model))
                  .filter(Boolean)
                  .map((model: VehicleCatalogModel) => [model.name.toLowerCase(), model]),
              ).values(),
            )
          : [];
        const aliases = Array.isArray((item as any).aliases)
          ? Array.from(new Set((item as any).aliases.map((alias: unknown) => String(alias).trim()).filter(Boolean)))
          : [];
        if (!make) return null;
        return { make, models, aliases };
      })
      .filter(Boolean) as VehicleCatalogEntry[];
  }

  if (payload && typeof payload === "object") {
    return Object.entries(payload as Record<string, unknown>)
      .map(([make, models]) => ({
        make: String(make).trim(),
        models: Array.isArray(models)
          ? Array.from(
              new Map(
                models
                  .map((model) => normalizeModel(model))
                  .filter(Boolean)
                  .map((model: VehicleCatalogModel) => [model.name.toLowerCase(), model]),
              ).values(),
            )
          : [],
      }))
      .filter((item) => item.make);
  }

  return [];
}

function filterVehicleMakes(catalog: VehicleCatalogEntry[], query: string): VehicleCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog.slice().sort((a, b) => a.make.localeCompare(b.make));
  return catalog.filter((entry) => {
    const haystacks = [entry.make, ...(entry.aliases || [])].map((value) => value.toLowerCase());
    return haystacks.some((value) => value.includes(q));
  });
}

function filterVehicleModels(
  catalog: VehicleCatalogEntry[],
  makeQuery: string,
  modelQuery: string,
  yearQuery?: string,
): string[] {
  const makeEntry =
    catalog.find((entry) => entry.make.toLowerCase() === makeQuery.trim().toLowerCase()) ||
    filterVehicleMakes(catalog, makeQuery)[0];

  const year = Number(yearQuery);
  const hasYear = Number.isFinite(year) && year > 1900;
  const models = (makeEntry?.models || []).filter((model) => {
    if (!hasYear) return true;
    const startOk = model.startYear ? year >= model.startYear : true;
    const endOk = model.endYear ? year <= model.endYear : true;
    return startOk && endOk;
  });

  const q = modelQuery.trim().toLowerCase();
  const filtered = !q
    ? models
    : models.filter((model) => {
        const haystacks = [model.name, ...(model.aliases || [])].map((value) => value.toLowerCase());
        return haystacks.some((value) => value.includes(q));
      });

  return filtered.map((model) => model.name).sort((a, b) => a.localeCompare(b));
}

function getVehicleCatalogCoverageLabel(catalog: VehicleCatalogEntry[], makeQuery: string): string {
  const makeEntry =
    catalog.find((entry) => entry.make.toLowerCase() === makeQuery.trim().toLowerCase()) ||
    filterVehicleMakes(catalog, makeQuery)[0];

  if (!makeEntry || !makeEntry.models.length) return "Manual entry still allowed for rare or grey-market vehicles.";
  const years = makeEntry.models.flatMap((model) => [model.startYear || 1995, model.endYear || new Date().getFullYear()]);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  return `Historical PH catalog coverage for ${makeEntry.make}: ${minYear}–${maxYear}`;
}


function getSuggestedMunicipalities(region: string, query: string): string[] {
  const base = LUZON_REGION_TOWNS[region] || [];
  const q = query.trim().toLowerCase();
  if (!q) return base.slice().sort((a, b) => a.localeCompare(b));
  return base.filter((town) => town.toLowerCase().includes(q)).sort((a, b) => a.localeCompare(b));
}

function buildCustomerDisplayName(form: InspectionForm): string {
  const fullName = [form.customerFirstName, form.customerLastName].map((v) => v.trim()).filter(Boolean).join(" ");
  return form.companyName.trim() || fullName || form.customer.trim();
}

function buildCustomerLookupText(ro: RepairOrder): string {
  return [
    ro.customer,
    ro.customerFirstName,
    ro.customerLastName,
    ro.customerPhone,
    ro.customerEmail,
    ro.plate,
    ro.vehicle,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
}

function buildInspectionFormFromRO(ro: RepairOrder): InspectionForm {
  const selectedIssues = ro.workLines.reduce((acc, line) => {
    const issue = INSPECTION_ISSUES.find((item) => item.category.toLowerCase() === String(line.category || "").toLowerCase());
    if (issue) acc[issue.key] = true;
    return acc;
  }, { ...EMPTY_INSPECTION_SELECTIONS } as InspectionSelection);

  const companyLike = detectCompanyLikeName(ro.customer || "");
  return {
    ...DEFAULT_INSPECTION_FORM,
    plate: ro.plate || "",
    vehicle: ro.vehicle || "",
    vehicleMake: ro.vehicleMake || "",
    vehicleModel: ro.vehicleModel || "",
    vehicleYear: ro.vehicleYear || "",
    fuelType: (ro.fuelType || "") as FuelType | "",
    transmissionType: (ro.transmissionType || "") as TransmissionType | "",
    customer: ro.customer || "",
    customerFirstName: ro.customerFirstName || "",
    customerLastName: ro.customerLastName || "",
    customerPhone: ro.customerPhone || "",
    customerEmail: ro.customerEmail || "",
    municipality: ro.municipality || "",
    region: ro.region || "",
    odometer: ro.odometer || "",
    bay: ro.bay || "Bay 1",
    priority: ro.priority || "Normal",
    issues: selectedIssues,
    isReturnJob: Boolean(ro.isReturnJob),
    returnReason: ro.returnReason || "",
    linkedPreviousRoId: ro.linkedPreviousRoId || "",
    inspectionPhotos: Array.isArray(ro.inspectionPhotos) ? ro.inspectionPhotos : [],
    initialExteriorPhotos: Array.isArray(ro.initialExteriorPhotos) ? ro.initialExteriorPhotos : [],
    takeNotes: Array.isArray(ro.takeNotes) && ro.takeNotes.length ? ro.takeNotes : createDefaultTakeNotes(),
    arrivalChecks: { ...DEFAULT_ARRIVAL_CHECKS, ...(ro.arrivalChecks || {}) },
    tireInspection: ensureTireInspectionMap(ro.tireInspection),
    underHoodInspection: ensureUnderHoodInspectionMap((ro as any).underHoodInspection),
    customerVisibleFindings: ro.customerVisibleFindings || "",
    recommendationsSummary: ro.recommendationsSummary || "",
    serviceAdvisorNotes: ro.serviceAdvisorNotes || "",
    customerType: companyLike ? "Company" : "Person",
    companyName: companyLike ? ro.customer || "" : "",
    municipalityGroup:
      ro.municipality && ILOCOS_SUR_MUNICIPALITIES.includes(ro.municipality)
        ? "Ilocos Sur"
        : ro.municipality && ABRA_MUNICIPALITIES.includes(ro.municipality)
        ? "Abra"
        : "",
    customerMunicipality: ro.municipality || "",
  };
}

function getCustomerSummaryAttachments(ro: RepairOrder) {
  const inspection = (ro.inspectionPhotos || []).map((photo) => ({
    label: `Inspection • ${photo.label}`,
    url: photo.url,
  }));
  const exterior = (ro.initialExteriorPhotos || []).map((photo) => ({
    label: `Exterior • ${photo.label}`,
    url: photo.url,
  }));
  const workline = (ro.workLines || []).flatMap((line) =>
    (line.photos || [])
      .filter((photo) => !!photo.url)
      .map((photo) => ({
        label: `${line.label} • ${photo.stage} • ${photo.label}`,
        url: photo.url,
      })),
  );
  return [...inspection, ...exterior, ...workline];
}

function buildCustomerSummaryHtml(ro: RepairOrder, parts: PartRequest[]) {
  const financials = getROFinancials(ro);
  const relevantParts = parts.filter((part) => part.roNumber === ro.roNumber && part.status !== "Cancelled");
  const attachmentRows = getCustomerSummaryAttachments(ro);
  const approvedWorkRows = ro.workLines
    .filter((line) => line.approvalStatus !== "Declined")
    .map(
      (line) => `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${line.label}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${line.category}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">₱${line.laborCost.toLocaleString()}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">₱${line.partsCost.toLocaleString()}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">₱${line.estimateTotal.toLocaleString()}</td>
        </tr>
      `,
    )
    .join("");

  const partsRows = relevantParts.length
    ? relevantParts
        .map(
          (part) => `
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;">${part.partName || "Unnamed Part"}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${part.qty}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">₱${(part.customerPartsSellingPrice || part.unitCost || 0).toLocaleString()}</td>
            </tr>
          `,
        )
        .join("")
    : `<tr><td colspan="3" style="padding:8px;border:1px solid #e5e7eb;">No customer-visible parts listed</td></tr>`;

  const attachmentHtml = attachmentRows.length
    ? attachmentRows
        .map(
          (item) => `
            <div style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
              <strong>${item.label}</strong><br/>
              <span style="font-size:12px;color:#6b7280;">${item.url}</span>
            </div>
          `,
        )
        .join("")
    : `<div style="color:#6b7280;">No customer-visible attachments</div>`;

  return `
    <html>
      <head>
        <title>${ro.roNumber} Customer Summary</title>
      </head>
      <body style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111827;">
        <div style="border-bottom:2px solid #111827;padding-bottom:12px;margin-bottom:20px;">
          <div style="font-size:28px;font-weight:800;">${SHOP_NAME}</div>
          <div style="font-size:14px;color:#4b5563;">${SHOP_SLOGAN}</div>
          <div style="margin-top:8px;font-size:12px;color:#6b7280;">Customer Summary • ${new Date().toLocaleString()}</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:18px;">
          <div><strong>RO Number:</strong> ${ro.roNumber}</div>
          <div><strong>Date:</strong> ${new Date(ro.createdAt).toLocaleDateString()}</div>
          <div><strong>Customer:</strong> ${ro.customer || "-"}</div>
          <div><strong>Vehicle:</strong> ${ro.vehicle || "-"}</div>
          <div><strong>Plate:</strong> ${ro.plate || "-"}</div>
          <div><strong>Odometer:</strong> ${ro.odometer || "-"}</div>
        </div>

        <h2 style="margin:18px 0 8px 0;">Findings</h2>
        <div style="padding:12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;white-space:pre-wrap;">${ro.customerVisibleFindings || "No findings provided."}</div>

        <h2 style="margin:18px 0 8px 0;">Recommended Services</h2>
        <div style="padding:12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;white-space:pre-wrap;">${ro.recommendationsSummary || "No recommendations summary provided."}</div>

        <h2 style="margin:18px 0 8px 0;">Approved Work</h2>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Service</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Category</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Service Price</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Parts Price</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${approvedWorkRows || `<tr><td colspan="5" style="padding:8px;border:1px solid #e5e7eb;">No approved work lines</td></tr>`}</tbody>
        </table>

        <h2 style="margin:18px 0 8px 0;">Customer-Visible Parts</h2>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Part</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Qty</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>${partsRows}</tbody>
        </table>

        <h2 style="margin:18px 0 8px 0;">Totals</h2>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
          <div style="padding:12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;"><strong>Service Price</strong><div>₱${financials.labor.toLocaleString()}</div></div>
          <div style="padding:12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;"><strong>Parts Price</strong><div>₱${financials.parts.toLocaleString()}</div></div>
          <div style="padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;"><strong>Total</strong><div>₱${financials.total.toLocaleString()}</div></div>
        </div>

        <h2 style="margin:18px 0 8px 0;">Customer-Visible Attachments</h2>
        <div style="padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">${attachmentHtml}</div>
      </body>
    </html>
  `;
}

function printCustomerSummary(ro: RepairOrder, parts: PartRequest[]) {
  const popup = window.open("", "_blank", "width=980,height=760");
  if (!popup) return;
  popup.document.write(buildCustomerSummaryHtml(ro, parts));
  popup.document.close();
  popup.focus();
  popup.print();
}

function downloadCustomerSummaryPdf(ro: RepairOrder, parts: PartRequest[]) {
  const popup = window.open("", "_blank", "width=980,height=760");
  if (!popup) return;
  popup.document.write(buildCustomerSummaryHtml(ro, parts));
  popup.document.close();
  popup.focus();
  setTimeout(() => {
    popup.alert("Use your browser print dialog and choose 'Save as PDF' to download this summary as PDF.");
    popup.print();
  }, 300);
}

function buildCustomerSummaryMessage(ro: RepairOrder, parts: PartRequest[]) {
  const financials = getROFinancials(ro);
  const services = ro.workLines
    .filter((line) => line.approvalStatus !== "Declined")
    .map((line) => `• ${line.label} — ₱${line.estimateTotal.toLocaleString()}`)
    .join("\n");
  return `${SHOP_NAME}
${SHOP_SLOGAN}

Customer Summary
RO: ${ro.roNumber}
Customer: ${ro.customer || "-"}
Vehicle: ${ro.vehicle || "-"}
Plate: ${ro.plate || "-"}
Odometer: ${ro.odometer || "-"}

Findings:
${ro.customerVisibleFindings || "No findings provided."}

Recommended Services:
${ro.recommendationsSummary || "No recommendations summary provided."}

Approved Work:
${services || "No approved work lines"}

Service Price: ₱${financials.labor.toLocaleString()}
Parts Price: ₱${financials.parts.toLocaleString()}
Total: ₱${financials.total.toLocaleString()}`;
}

function sendCustomerSummaryEmail(ro: RepairOrder, parts: PartRequest[]) {
  const subject = encodeURIComponent(`${SHOP_NAME} - Customer Summary ${ro.roNumber}`);
  const body = encodeURIComponent(buildCustomerSummaryMessage(ro, parts));
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function sendCustomerSummarySmsLink(ro: RepairOrder, parts: PartRequest[]) {
  const message = buildCustomerSummaryMessage(ro, parts);
  const phone = (ro.customerPhone || "").trim();
  if (phone) {
    const cleanPhone = phone.replace(/\s+/g, "");
    window.open(`sms:${cleanPhone}?body=${encodeURIComponent(message)}`, "_self");
  } else {
    copySmsToClipboard(message)
      .then(() => alert("Customer summary copied to clipboard. No phone saved for SMS link."))
      .catch(() => alert(message));
  }
}
function renderArrivalCheckLabel(key: ArrivalCheckKey): string {
  if (key === "brokenGlass") return "Broken Glass";
  if (key === "hornCondition") return "Horn Condition";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function getTreadDepthAssessment(treadDepthMm: string) {
  const raw = String(treadDepthMm || "").trim();
  const treadDepth = Number(raw);
  if (!raw || Number.isNaN(treadDepth)) {
    return {
      label: "Not Measured",
      tone: "neutral" as const,
      background: "#f3f4f6",
      text: "#374151",
      border: "#d1d5db",
    };
  }
  if (treadDepth <= 1.66) {
    return {
      label: "Legal Limit",
      tone: "critical" as const,
      background: "#ef4444",
      text: "#ffffff",
      border: "#dc2626",
    };
  }
  if (treadDepth <= 2) {
    return {
      label: "Won’t Last Long",
      tone: "danger" as const,
      background: "#fb7185",
      text: "#ffffff",
      border: "#e11d48",
    };
  }
  if (treadDepth <= 3) {
    return {
      label: "Inspect Monthly",
      tone: "warn" as const,
      background: "#fbbf24",
      text: "#111827",
      border: "#f59e0b",
    };
  }
  if (treadDepth <= 5) {
    return {
      label: "OK",
      tone: "ok" as const,
      background: "#fcd34d",
      text: "#111827",
      border: "#f59e0b",
    };
  }
  return {
    label: "Good",
    tone: "good" as const,
    background: "#9bd27d",
    text: "#0f172a",
    border: "#65a30d",
  };
}

function getUnsafeTireFlag(condition: TireCondition, treadDepthMm: string): boolean {
  const treadAssessment = getTreadDepthAssessment(treadDepthMm);
  if (condition === "Bald" || condition === "Worn") return true;
  return treadAssessment.tone === "danger" || treadAssessment.tone === "critical";
}

function buildTireInspectionItem(
  current: TireInspectionItem,
  patch: Partial<TireInspectionItem>,
): TireInspectionItem {
  const next = { ...current, ...patch };
  return {
    ...next,
    unsafe: getUnsafeTireFlag(next.condition, next.treadDepthMm),
  };
}

function ensureTireInspectionMap(value?: Partial<TireInspectionMap> | null): TireInspectionMap {
  const base = { ...DEFAULT_TIRE_INSPECTION } as TireInspectionMap;
  if (!value || typeof value !== "object") return base;
  (Object.keys(TIRE_POSITION_LABELS) as TirePosition[]).forEach((position) => {
    const raw = (value as any)?.[position];
    base[position] = buildTireInspectionItem(base[position], raw || {});
  });
  return base;
}


function ensureUnderHoodInspectionMap(value?: Partial<UnderHoodInspectionMap> | null): UnderHoodInspectionMap {
  const base = { ...DEFAULT_UNDER_HOOD_INSPECTION } as UnderHoodInspectionMap;
  if (!value || typeof value !== "object") return base;
  (Object.keys(UNDER_HOOD_INSPECTION_LABELS) as UnderHoodInspectionKey[]).forEach((key) => {
    const raw = (value as any)?.[key] || {};
    base[key] = {
      status: raw.status === "Needs Attention" || raw.status === "Urgent" ? raw.status : "OK",
      note: String(raw.note || ""),
    };
  });
  return base;
}

function getUnderHoodInspectionSummary(map: UnderHoodInspectionMap) {
  const items = Object.values(map);
  return {
    needsAttention: items.filter((item) => item.status === "Needs Attention").length,
    urgent: items.filter((item) => item.status === "Urgent").length,
  };
}

function getTireInspectionSummary(tireInspection: TireInspectionMap) {
  const items = Object.values(tireInspection);
  return {
    unsafeCount: items.filter((item) => item.unsafe).length,
    measuredCount: items.filter((item) => item.treadDepthMm.trim() !== "").length,
    legalLimitCount: items.filter((item) => getTreadDepthAssessment(item.treadDepthMm).label === "Legal Limit").length,
  };
}

function buildTireInspectionText(tireInspection: TireInspectionMap): string {
  return (Object.keys(TIRE_POSITION_LABELS) as TirePosition[])
    .map((position) => {
      const item = tireInspection[position];
      const tread = item.treadDepthMm.trim() ? `${item.treadDepthMm.trim()} mm` : "No depth entered";
      const assessment = getTreadDepthAssessment(item.treadDepthMm).label;
      return `${TIRE_POSITION_LABELS[position]}: ${item.condition} • ${tread} • ${assessment}${item.unsafe ? " • UNSAFE" : ""}`;
    })
    .join("\n");
}

function buildSmsApprovalMessage(ro: RepairOrder, line: ROWorkLine) {

  return `AUTO REPAIR APPROVAL

RO: ${ro.roNumber}
Customer: ${ro.customer || "-"}
Vehicle: ${ro.vehicle || "-"}
Plate: ${ro.plate || "-"}
Phone: ${ro.customerPhone || "-"}

Work Line: ${line.label}
Category: ${line.category}
Estimate: ₱${line.estimateTotal.toLocaleString()}

Reply YES to approve or NO to decline.`;
}

async function sendSmsThroughGateway(
  settings: SmsGatewaySettings,
  phone: string,
  message: string,
) {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone) {
    throw new Error("No customer phone number saved for this RO.");
  }

  if (!settings.enabled || !settings.endpoint.trim()) {
    throw new Error("SMS gateway is not enabled.");
  }

  const response = await fetch(settings.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(settings.apiKey.trim() ? { Authorization: `Bearer ${settings.apiKey.trim()}` } : {}),
    },
    body: JSON.stringify({
      device: settings.deviceName.trim() || "Android Gateway",
      to: trimmedPhone,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gateway request failed (${response.status})`);
  }
}

async function copySmsToClipboard(message: string) {
  await navigator.clipboard.writeText(message);
}

function printRepairOrder(ro: RepairOrder) {
  const financials = getROFinancials(ro);
  const popup = window.open("", "_blank", "width=980,height=760");
  if (!popup) return;

  const workLineRows = ro.workLines
    .map(
      (line) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${line.label}</td>
          <td style="padding:8px;border:1px solid #ddd;">${line.category}</td>
          <td style="padding:8px;border:1px solid #ddd;">${line.technician || "-"}</td>
          <td style="padding:8px;border:1px solid #ddd;">${line.approvalStatus}</td>
          <td style="padding:8px;border:1px solid #ddd;">${line.status}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">₱${line.estimateTotal.toLocaleString()}</td>
        </tr>
      `,
    )
    .join("");

  const inspectionPhotos = ro.inspectionPhotos.length
    ? ro.inspectionPhotos
        .map(
          (photo) => `
            <div style="padding:6px 0;border-bottom:1px solid #eee;">
              <strong>${photo.label}</strong><br/>
              <span>${photo.url || "No URL provided"}</span>
            </div>
          `,
        )
        .join("")
    : "<div>No inspection photos</div>";

  const exteriorPhotos = ro.initialExteriorPhotos?.length
    ? ro.initialExteriorPhotos
        .map(
          (photo) => `
            <div style="padding:6px 0;border-bottom:1px solid #eee;">
              <strong>${photo.label}</strong><br/>
              <span>${photo.url || "No URL provided"}</span>
            </div>
          `,
        )
        .join("")
    : "<div>No initial exterior photos</div>";

  const takeNoteRows = ro.takeNotes?.length
    ? ro.takeNotes
        .map(
          (item) => `
            <div style="padding:8px 0;border-bottom:1px solid #eee;">
              <strong>${item.title}</strong><br/>
              <div>${item.note || "No note"}</div>
              <div style="font-size:12px;color:#6b7280;">${item.photoUrl || "No photo attached"}</div>
            </div>
          `,
        )
        .join("")
    : "<div>No take notes</div>";

  const arrivalRows = Object.entries(ro.arrivalChecks || {})
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${renderArrivalCheckLabel(key as ArrivalCheckKey)}</td>
          <td style="padding:8px;border:1px solid #ddd;">${value.status}</td>
          <td style="padding:8px;border:1px solid #ddd;">${value.note || "-"}</td>
        </tr>
      `,
    )
    .join("");

  const tireRows = (Object.keys(TIRE_POSITION_LABELS) as TirePosition[])
    .map(
      (position) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${TIRE_POSITION_LABELS[position]}</td>
          <td style="padding:8px;border:1px solid #ddd;">${ro.tireInspection?.[position]?.condition || "Good"}</td>
          <td style="padding:8px;border:1px solid #ddd;">${ro.tireInspection?.[position]?.treadDepthMm ? `${ro.tireInspection[position].treadDepthMm} mm` : "-"}</td>
          <td style="padding:8px;border:1px solid #ddd;">${getTreadDepthAssessment(ro.tireInspection?.[position]?.treadDepthMm || "").label}${ro.tireInspection?.[position]?.unsafe ? " • UNSAFE" : ""}</td>
        </tr>
      `,
    )
    .join("");

  const safeUnderHoodInspection = ensureUnderHoodInspectionMap((ro as any).underHoodInspection);
  const underHoodRows = (Object.keys(UNDER_HOOD_INSPECTION_LABELS) as UnderHoodInspectionKey[])
    .map(
      (key) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${UNDER_HOOD_INSPECTION_LABELS[key]}</td>
          <td style="padding:8px;border:1px solid #ddd;">${safeUnderHoodInspection[key].status}</td>
          <td style="padding:8px;border:1px solid #ddd;">${safeUnderHoodInspection[key].note || "-"}</td>
        </tr>
      `,
    )
    .join("");

  popup.document.write(`
    <html>
      <head>
        <title>${ro.roNumber}</title>
      </head>
      <body style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111827;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
          <div>
            <h1 style="margin:0 0 6px 0;">Repair Order Report</h1>
            <div style="font-size:14px;color:#4b5563;">${ro.roNumber}</div>
          </div>
          <div style="text-align:right;">
            <div><strong>Status:</strong> ${ro.status}</div>
            <div><strong>Invoice:</strong> ${ro.invoiceStatus}</div>
            <div><strong>Release:</strong> ${ro.releaseStatus}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:20px;">
          <div><strong>Customer:</strong> ${ro.customer || "-"}</div>
          <div><strong>Phone:</strong> ${ro.customerPhone || "-"}</div>
          <div><strong>Vehicle:</strong> ${ro.vehicle || "-"}</div>
          <div><strong>Plate:</strong> ${ro.plate || "-"}</div>
          <div><strong>Bay:</strong> ${ro.bay}</div>
          <div><strong>Priority:</strong> ${ro.priority}</div>
        </div>

        <h2 style="margin-bottom:10px;">Work Lines</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Work</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Category</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Technician</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Approval</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Status</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right;">Estimate</th>
            </tr>
          </thead>
          <tbody>${workLineRows}</tbody>
        </table>

        <h2 style="margin-bottom:10px;">Financial Summary</h2>
        <div style="margin-bottom:8px;"><strong>Labor:</strong> ₱${financials.labor.toLocaleString()}</div>
        <div style="margin-bottom:8px;"><strong>Parts:</strong> ₱${financials.parts.toLocaleString()}</div>
        <div style="margin-bottom:8px;"><strong>Total:</strong> ₱${financials.total.toLocaleString()}</div>
        <div style="margin-bottom:8px;"><strong>Paid:</strong> ₱${financials.paid.toLocaleString()}</div>
        <div style="margin-bottom:20px;"><strong>Balance:</strong> ₱${financials.balance.toLocaleString()}</div>

        <h2 style="margin-bottom:10px;">Arrival Check</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Check</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Status</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Note</th>
            </tr>
          </thead>
          <tbody>${arrivalRows}</tbody>
        </table>

        <h2 style="margin-bottom:10px;">Tire Wear Inspection</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Position</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Condition</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Tread Depth</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Safety Flag</th>
            </tr>
          </thead>
          <tbody>${tireRows}</tbody>
        </table>

        <h2 style="margin-bottom:10px;">Under the Hood Inspection</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Item</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Status</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Note</th>
            </tr>
          </thead>
          <tbody>${underHoodRows}</tbody>
        </table>

        <h2 style="margin-bottom:10px;">Take Notes</h2>
        <div style="margin-bottom:20px;">${takeNoteRows}</div>

        <h2 style="margin-bottom:10px;">Service Advisor Notes</h2>
        <div style="margin-bottom:20px;">${ro.serviceAdvisorNotes || "No notes"}</div>

        <h2 style="margin-bottom:10px;">Initial Exterior Photos</h2>
        <div style="margin-bottom:20px;">${exteriorPhotos}</div>

        <h2 style="margin-bottom:10px;">Inspection Photos</h2>
        <div>${inspectionPhotos}</div>
      </body>
    </html>
  `);

  popup.document.close();
  popup.focus();
  popup.print();
}

/* =========================
   APP
========================= */

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1280);
  const [draftBanner, setDraftBanner] = useState<string>("");
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<number | null>(null);
  const [selectedTirePosition, setSelectedTirePosition] = useState<TirePosition>("frontLeft");
  const autoSaveTimerRef = useRef<number | null>(null);

  const [inspectionForm, setInspectionForm] = useState<InspectionForm>(DEFAULT_INSPECTION_FORM);
  const [paymentForms, setPaymentForms] = useState<Record<string, PaymentForm>>({});
  const [vehicleCatalog, setVehicleCatalog] = useState<VehicleCatalogEntry[]>(
    () => normalizeLegacyVehicleCatalog(safeLoad(APP_STORAGE_KEYS.vehicleCatalog, DEFAULT_PH_VEHICLE_CATALOG)),
  );
  const [vehicleCatalogUrl, setVehicleCatalogUrl] = useState<string>(
    () => normalizeVehicleCatalogUrl(safeLoad(APP_STORAGE_KEYS.vehicleCatalogUrl, "")),
  );
  const [vehicleCatalogSyncing, setVehicleCatalogSyncing] = useState(false);
  const [smsGatewaySettings, setSmsGatewaySettings] = useState<SmsGatewaySettings>(
    () => safeLoad(APP_STORAGE_KEYS.smsGateway, DEFAULT_SMS_GATEWAY_SETTINGS),
  );
  const [historySearch, setHistorySearch] = useState("");

  const [employees, setEmployees] = useState<EmployeeRecord[]>(() => {
    const saved = safeLoad<Partial<EmployeeRecord>[]>(APP_STORAGE_KEYS.employees, []);
    return (saved.length ? saved : seedEmployeesFromUsers(USERS)).map((employee, index) => normalizeEmployeeRecord(employee, index));
  });
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>(DEFAULT_EMPLOYEE_FORM);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [editingVehicleIntakeRoId, setEditingVehicleIntakeRoId] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => safeLoad<AttendanceRecord[]>(APP_STORAGE_KEYS.attendanceRecords, []));
  const [attendanceBoardDate, setAttendanceBoardDate] = useState<string>(getTodayDateString());
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<"All" | AttendanceStatus>("All");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(
    () => safeLoad(APP_STORAGE_KEYS.technicians, DEFAULT_TECHNICIANS),
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(
    () => safeLoad(APP_STORAGE_KEYS.suppliers, DEFAULT_SUPPLIERS),
  );
  const [supplierBids, setSupplierBids] = useState<SupplierBid[]>(
    () => safeLoad(APP_STORAGE_KEYS.bids, []),
  );
  const [inventory, setInventory] = useState<InventoryItem[]>(
    () => safeLoad(APP_STORAGE_KEYS.inventory, DEFAULT_INVENTORY),
  );
  const [supplierForm, setSupplierForm] = useState<SupplierForm>(DEFAULT_SUPPLIER_FORM);
  const [bidForms, setBidForms] = useState<Record<string, BidForm>>({});
  const [inventoryForm, setInventoryForm] = useState<InventoryForm>(DEFAULT_INVENTORY_FORM);

  const [ros, setRos] = useState<RepairOrder[]>(() => safeLoad<Partial<RepairOrder>[]>(APP_STORAGE_KEYS.ros, []).map((ro) => normalizeLegacyRepairOrder(ro)));
  const [parts, setParts] = useState<PartRequest[]>(() => safeLoad(APP_STORAGE_KEYS.parts, []));
  const [backJobs, setBackJobs] = useState<BackJobRecord[]>(() => safeLoad<BackJobRecord[]>(APP_STORAGE_KEYS.backJobs, []));
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(() => safeLoad<ActivityLogEntry[]>(APP_STORAGE_KEYS.activityLogs, []));
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>(() => safeLoad<SalesEntry[]>(APP_STORAGE_KEYS.salesEntries, []));
  const [salesForm, setSalesForm] = useState<SalesForm>(DEFAULT_SALES_FORM);

  const DRAFT_KEYS = {
    inspectionForm: "phase17a_draft_inspection_form",
    paymentForms: "phase17a_draft_payment_forms",
    supplierForm: "phase17a_draft_supplier_form",
    bidForms: "phase17a_draft_bid_forms",
    inventoryForm: "phase17a_draft_inventory_form",
    salesForm: "phase17a_draft_sales_form",
    employeeForm: "phase18a_draft_employee_form",
    view: "phase17a_last_view",
    savedAt: "phase17a_last_saved_at",
  } as const;

  const [collapsedRos, setCollapsedRos] = useState<Record<string, boolean>>({});
  const [collapsedParts, setCollapsedParts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedInspection = safeLoad(DRAFT_KEYS.inspectionForm, DEFAULT_INSPECTION_FORM);
    const savedPaymentForms = safeLoad<Record<string, PaymentForm>>(DRAFT_KEYS.paymentForms, {});
    const savedSupplierForm = safeLoad<SupplierForm>(DRAFT_KEYS.supplierForm, DEFAULT_SUPPLIER_FORM);
    const savedBidForms = safeLoad<Record<string, BidForm>>(DRAFT_KEYS.bidForms, {});
    const savedInventoryForm = safeLoad<InventoryForm>(DRAFT_KEYS.inventoryForm, DEFAULT_INVENTORY_FORM);
    const savedSalesForm = safeLoad<SalesForm>(DRAFT_KEYS.salesForm, DEFAULT_SALES_FORM);
    const savedEmployeeForm = safeLoad<EmployeeForm>(DRAFT_KEYS.employeeForm, DEFAULT_EMPLOYEE_FORM);
    const savedView = safeLoad<ViewKey | "">(DRAFT_KEYS.view, "");
    const savedAt = safeLoad<number | null>(DRAFT_KEYS.savedAt, null);

    setInspectionForm((prev) => ({
      ...DEFAULT_INSPECTION_FORM,
      ...prev,
      ...savedInspection,
      tireInspection: ensureTireInspectionMap((savedInspection as Partial<InspectionForm>)?.tireInspection),
      underHoodInspection: ensureUnderHoodInspectionMap((savedInspection as Partial<InspectionForm>)?.underHoodInspection),
      customerType: (savedInspection as any)?.customerType === "Company" ? "Company" : "Person",
      companyName: String((savedInspection as any)?.companyName || ""),
      municipalityGroup:
        (savedInspection as any)?.municipalityGroup === "Ilocos Sur" ||
        (savedInspection as any)?.municipalityGroup === "Abra"
          ? (savedInspection as any).municipalityGroup
          : "",
      customerMunicipality: String((savedInspection as any)?.customerMunicipality || ""),
    }));
    setPaymentForms(savedPaymentForms || {});
    setSupplierForm((prev) => ({ ...prev, ...(savedSupplierForm || {}) }));
    setBidForms(savedBidForms || {});
    setInventoryForm((prev) => ({ ...prev, ...(savedInventoryForm || {}) }));
    setSalesForm((prev) => ({ ...prev, ...(savedSalesForm || {}) }));
    setEmployeeForm((prev) => ({ ...prev, ...(savedEmployeeForm || {}) }));
    // Safe-mode startup: ignore recovered last view to prevent reopening a crashing screen.
    if (savedAt) {
      setLastAutoSavedAt(savedAt);
      setDraftBanner(`Recovered draft data from ${new Date(savedAt).toLocaleString()}`);
      setTimeout(() => setDraftBanner(""), 5000);
    }
  }, []);

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      const timestamp = Date.now();
      try {
        localStorage.setItem(DRAFT_KEYS.inspectionForm, JSON.stringify(inspectionForm));
        localStorage.setItem(DRAFT_KEYS.paymentForms, JSON.stringify(paymentForms));
        localStorage.setItem(DRAFT_KEYS.supplierForm, JSON.stringify(supplierForm));
        localStorage.setItem(DRAFT_KEYS.bidForms, JSON.stringify(bidForms));
        localStorage.setItem(DRAFT_KEYS.inventoryForm, JSON.stringify(inventoryForm));
        localStorage.setItem(DRAFT_KEYS.salesForm, JSON.stringify(salesForm));
        localStorage.setItem(DRAFT_KEYS.employeeForm, JSON.stringify(employeeForm));
        localStorage.setItem(DRAFT_KEYS.view, JSON.stringify(view));
        localStorage.setItem(DRAFT_KEYS.savedAt, JSON.stringify(timestamp));
        setLastAutoSavedAt(timestamp);
      } catch {}
    }, 700);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [inspectionForm, paymentForms, supplierForm, bidForms, inventoryForm, salesForm, employeeForm, view]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.ros, JSON.stringify(ros));
  }, [ros]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.parts, JSON.stringify(parts));
  }, [parts]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.backJobs, JSON.stringify(backJobs));
  }, [backJobs]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.activityLogs, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.salesEntries, JSON.stringify(salesEntries));
  }, [salesEntries]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.employees, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    if (!user) return;
    const freshUser = employees.find((employee) => employee.id === user.id);
    if (!freshUser) return;
    if (!freshUser.active) {
      setUser(null);
      return;
    }
    if (JSON.stringify(freshUser) !== JSON.stringify(user)) {
      setUser(freshUser);
    }
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("phase18a_attendance_records", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.technicians, JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.suppliers, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.bids, JSON.stringify(supplierBids));
  }, [supplierBids]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.inventory, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.smsGateway, JSON.stringify(smsGatewaySettings));
  }, [smsGatewaySettings]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.vehicleCatalog, JSON.stringify(vehicleCatalog));
  }, [vehicleCatalog]);

  useEffect(() => {
    const normalizedCatalog = normalizeLegacyVehicleCatalog(safeLoad(APP_STORAGE_KEYS.vehicleCatalog, DEFAULT_PH_VEHICLE_CATALOG));
    const normalizedUrl = normalizeVehicleCatalogUrl(safeLoad(APP_STORAGE_KEYS.vehicleCatalogUrl, ""));
    setVehicleCatalog((prev) => JSON.stringify(prev) === JSON.stringify(normalizedCatalog) ? prev : normalizedCatalog);
    setVehicleCatalogUrl((prev) => prev === normalizedUrl ? prev : normalizedUrl);
  }, []);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.vehicleCatalogUrl, JSON.stringify(vehicleCatalogUrl));
  }, [vehicleCatalogUrl]);

  useEffect(() => {
    setTechnicians((prev) => {
      const preservedByName = new Map(prev.map((tech) => [tech.name.toLowerCase(), tech]));
      const employeeTechs = employees
        .filter((employee) => ["Technician", "Mechanic"].includes(employee.role) && employee.active)
        .map((employee) => {
          const existing = preservedByName.get(employee.displayName.toLowerCase());
          return {
            id: existing?.id || employee.id,
            name: employee.displayName,
            role: existing?.role || mapEmployeeToTechnicianRole(employee.role),
            clockedIn: existing?.clockedIn || false,
            currentRoNumber: existing?.currentRoNumber || "",
            currentWorkLine: existing?.currentWorkLine || "",
            currentStartedAt: existing?.currentStartedAt,
            completedJobs: existing?.completedJobs || 0,
          } as TechnicianProfile;
        });
      const nonEmployeeTechs = prev.filter((tech) => !employeeTechs.some((item) => item.name.toLowerCase() === tech.name.toLowerCase()));
      return [...employeeTechs, ...nonEmployeeTechs];
    });
  }, [employees]);

  const syncTechniciansFromROs = (nextRos: RepairOrder[]) => {
    setTechnicians((prev) =>
      prev.map((tech) => {
        let currentRoNumber = "";
        let currentWorkLine = "";
        let currentStartedAt: number | undefined = undefined;
        let completedJobs = 0;

        nextRos.forEach((ro) => {
          ro.workLines.forEach((line) => {
            if (!lineHasTechnician(line, tech.name)) return;
            if (line.status === "Done") completedJobs += 1;
            if (line.status === "In Progress" && !currentRoNumber) {
              currentRoNumber = ro.roNumber;
              currentWorkLine = line.label;
              currentStartedAt = line.startedAt;
            }
          });
        });

        return {
          ...tech,
          currentRoNumber,
          currentWorkLine,
          currentStartedAt,
          completedJobs,
        };
      }),
    );
  };

  const recomputeAll = (nextRos: RepairOrder[], nextParts: PartRequest[]) => {
    const computedRos = nextRos.map((ro) => {
      const recomputedLines = ro.workLines.map((line) => {
        const partsSummary = getPartsSummaryForWorkLine(nextParts, line.id);
        const partsCost = sumPartsCostForWorkLine(nextParts, line.id);
        let status = line.status;

        if (line.approvalStatus === "Declined") {
          status = "Cancelled";
        } else if (line.approvalStatus === "Pending Approval") {
          if (!["Done", "Cancelled"].includes(status)) status = "Pending";
        } else {
          if (partsSummary === "Waiting Parts" && ["Pending", "Approved", "Ready"].includes(status)) {
            status = "Waiting Parts";
          }
          if (partsSummary === "Ready" && status === "Waiting Parts") {
            status = line.primaryTechnician || line.technician ? "In Progress" : "Ready";
          }
          if (partsSummary === "No Parts" && status === "Approved") {
            status = "Ready";
          }
        }

        return getWorkLineEstimate({
          ...line,
          partsSummary,
          partsCost,
          status,
        });
      });

      const actionable = recomputedLines.filter((w) => w.approvalStatus !== "Declined");
      const normalizedInspectionCompleted = ro.inspectionCompleted || Boolean((ro.inspectionPhotos?.length || 0) || (ro.initialExteriorPhotos?.length || 0) || (ro.takeNotes || []).some((item) => item.note || item.photoUrl) || actionable.length > 0 || ro.vehicle || ro.vehicleMake || ro.vehicleModel || ro.vehicleYear || ro.serviceAdvisorNotes);
      let roStatus = getROStatusFromWorkLines(recomputedLines, {
        ...ro,
        inspectionCompleted: normalizedInspectionCompleted,
      });

      const normalizedQcPassed = ro.qcChecklist?.finalResult === "Passed" ? true : Boolean(ro.qcPassed);
      if (normalizedQcPassed && roStatus === "Quality Check") {
        roStatus = "Ready Release";
      }
      const financials = getROFinancials({ ...ro, workLines: recomputedLines });
      const invoiceStatus = getInvoiceStatus(financials.paid, financials.total);
      const releaseStatus = getReleaseStatus(invoiceStatus, ro.releaseChecklist);
      const softLocked = releaseStatus === "Released";

      return {
        ...ro,
        workLines: recomputedLines,
        status: roStatus,
        invoiceStatus,
        releaseStatus,
        inspectionCompleted: normalizedInspectionCompleted,
        qcPassed: normalizedQcPassed,
        qcChecklist: {
          ...DEFAULT_QC_CHECKLIST,
          ...ro.qcChecklist,
          failedLogs: Array.isArray(ro.qcChecklist?.failedLogs) ? ro.qcChecklist.failedLogs : [],
        },
        softLocked,
      };
    });

    setRos(computedRos);
    setParts(nextParts);
    syncTechniciansFromROs(computedRos);
  };

  const canEditRo = (ro: RepairOrder) => !ro.softLocked || !!ro.lockOverrideReason.trim();

  const managementRoles: UserRole[] = ["Admin", "Management", "Manager", "Assistant Manager"];
  const canViewActivityLogs = !!user && managementRoles.includes(user.role);
  const canViewSalesReports = !!user && managementRoles.includes(user.role);
  const canEditSalesReports = (!!user && managementRoles.includes(user.role)) || user?.role === "Service Advisor";

  const stringifyActivityValue = (value: unknown) => {
    if (value === undefined) return undefined;
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const logActivity = ({
    module,
    action,
    recordReference,
    oldValue,
    newValue,
    note,
  }: {
    module: ActivityLogEntry["module"];
    action: string;
    recordReference: string;
    oldValue?: unknown;
    newValue?: unknown;
    note?: string;
  }) => {
    setActivityLogs((prev) => [
      {
        id: uid(),
        timestamp: Date.now(),
        user: user?.username || "System",
        role: user?.role || "System",
        module,
        action,
        recordReference,
        oldValue: stringifyActivityValue(oldValue),
        newValue: stringifyActivityValue(newValue),
        note,
      },
      ...prev,
    ]);
  };


  const clearDraftRecovery = () => {
    Object.values(DRAFT_KEYS).forEach((key) => localStorage.removeItem(key));
    setDraftBanner("Draft recovery data cleared.");
    setTimeout(() => setDraftBanner(""), 3500);
  };

  const applyUnderHoodPresetNote = (key: UnderHoodInspectionKey, preset: string) => {
    if (!preset) return;
    setInspectionForm((p) => {
      const currentMap = ensureUnderHoodInspectionMap(p.underHoodInspection);
      const currentNote = String(currentMap[key]?.note || "").trim();
      const nextNote = currentNote
        ? currentNote.toLowerCase().includes(preset.toLowerCase())
          ? currentNote
          : `${currentNote}; ${preset}`
        : preset;
      return {
        ...p,
        underHoodInspection: {
          ...currentMap,
          [key]: { ...currentMap[key], note: nextNote },
        },
      };
    });
  };

  const clearUnderHoodNote = (key: UnderHoodInspectionKey) => {
    setInspectionForm((p) => {
      const currentMap = ensureUnderHoodInspectionMap(p.underHoodInspection);
      return {
        ...p,
        underHoodInspection: {
          ...currentMap,
          [key]: { ...currentMap[key], note: "" },
        },
      };
    });
  };

  const applyUnderHoodRecommendationLink = (
    key: UnderHoodInspectionKey,
    category: InspectionIssueKey,
  ) => {
    setInspectionForm((p) => {
      const currentItem = ensureUnderHoodInspectionMap(p.underHoodInspection)[key];
      const recommendationText = `${UNDER_HOOD_INSPECTION_LABELS[key]}: ${currentItem.status}${currentItem.note ? ` (${currentItem.note})` : ""}`;
      const existingSummaryParts = String(p.recommendationsSummary || "")
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);
      const nextSummaryParts = existingSummaryParts.some((item) => item.toLowerCase() === recommendationText.toLowerCase())
        ? existingSummaryParts
        : [...existingSummaryParts, recommendationText];

      return {
        ...p,
        issues: {
          ...p.issues,
          [category]: true,
        },
        recommendationsSummary: nextSummaryParts.join("\n"),
      };
    });
  };

  /* =========================
     ACTIONS
  ========================= */

  const startVehicleIntakeEditFromRO = (roId: string) => {
    const target = ros.find((ro) => ro.id === roId);
    if (!target) return;
    setEditingVehicleIntakeRoId(roId);
    setInspectionForm(buildInspectionFormFromRO(target));
    setSelectedTirePosition("frontLeft");
    setView("vehicleIntake");
  };

  const cancelVehicleIntakeEdit = () => {
    setEditingVehicleIntakeRoId("");
    setInspectionForm({
      ...DEFAULT_INSPECTION_FORM,
      takeNotes: createDefaultTakeNotes(),
      arrivalChecks: { ...DEFAULT_ARRIVAL_CHECKS },
      tireInspection: { ...DEFAULT_TIRE_INSPECTION },
      underHoodInspection: { ...DEFAULT_UNDER_HOOD_INSPECTION },
    });
  };

  const applyLookupRecordToIntake = (ro: RepairOrder, mode: "fill" | "edit" = "fill") => {
    setInspectionForm((prev) => ({
      ...prev,
      ...buildInspectionFormFromRO(ro),
      inspectionPhotos: prev.inspectionPhotos.length ? prev.inspectionPhotos : buildInspectionFormFromRO(ro).inspectionPhotos,
      initialExteriorPhotos: prev.initialExteriorPhotos.length ? prev.initialExteriorPhotos : buildInspectionFormFromRO(ro).initialExteriorPhotos,
      takeNotes: prev.takeNotes.some((item) => item.note || item.photoUrl) ? prev.takeNotes : buildInspectionFormFromRO(ro).takeNotes,
    }));
    if (mode === "edit") {
      setEditingVehicleIntakeRoId(ro.id);
      setView("vehicleIntake");
    }
  };

  const saveVehicleIntakeEdit = () => {
    if (!editingVehicleIntakeRoId) return;
    const target = ros.find((ro) => ro.id === editingVehicleIntakeRoId);
    if (!target) return;
    const customerName = buildCustomerDisplayName(inspectionForm);
    const updatedRo: RepairOrder = {
      ...target,
      plate: inspectionForm.plate,
      vehicle: buildInspectionVehicleLabel(inspectionForm),
      vehicleMake: inspectionForm.vehicleMake,
      vehicleModel: inspectionForm.vehicleModel,
      vehicleYear: inspectionForm.vehicleYear,
      fuelType: inspectionForm.fuelType,
      transmissionType: inspectionForm.transmissionType,
      customer: customerName,
      customerFirstName: inspectionForm.customerFirstName,
      customerLastName: inspectionForm.customerLastName,
      customerPhone: inspectionForm.customerPhone,
      customerEmail: inspectionForm.customerEmail,
      municipality: inspectionForm.customerMunicipality || inspectionForm.municipality,
      region: inspectionForm.region,
      odometer: inspectionForm.odometer,
      bay: inspectionForm.bay,
      priority: inspectionForm.priority,
      isReturnJob: inspectionForm.isReturnJob,
      returnReason: inspectionForm.returnReason,
      linkedPreviousRoId: inspectionForm.linkedPreviousRoId || undefined,
      inspectionPhotos: inspectionForm.inspectionPhotos,
      initialExteriorPhotos: inspectionForm.initialExteriorPhotos,
      takeNotes: inspectionForm.takeNotes,
      arrivalChecks: inspectionForm.arrivalChecks,
      tireInspection: inspectionForm.tireInspection,
      underHoodInspection: inspectionForm.underHoodInspection,
      customerVisibleFindings: inspectionForm.customerVisibleFindings,
      recommendationsSummary: inspectionForm.recommendationsSummary,
      serviceAdvisorNotes: `${inspectionForm.serviceAdvisorNotes || ""}${inspectionForm.customerMunicipality ? `
Municipality / Town: ${inspectionForm.customerMunicipality}` : ""}`.trim(),
    };
    recomputeAll(ros.map((ro) => (ro.id === editingVehicleIntakeRoId ? updatedRo : ro)), parts);
    logActivity({ module: "Inspection", action: "Save Vehicle Intake Edit", recordReference: target.roNumber, oldValue: target, newValue: updatedRo });
    setEditingVehicleIntakeRoId("");
    setView("inspection");
  };

  const createRO = () => {
    const nextRO: RepairOrder = {
      id: uid(),
      roNumber: generateStandardNumber("RO", ros.map((item) => item.roNumber)),
      plate: "",
      vehicle: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      fuelType: "",
      transmissionType: "",
      customer: "",
      customerFirstName: "",
      customerLastName: "",
      customerPhone: "",
      customerEmail: "",
      municipality: "",
      region: "",
      odometer: "",
      bay: "Bay 1",
      priority: "Normal",
      status: "Draft",
      createdAt: Date.now(),
      inspectionCompleted: false,
      qcPassed: false,
      qcChecklist: { ...DEFAULT_QC_CHECKLIST },
      workLines: [],
      invoiceStatus: "Draft",
      releaseStatus: "Hold",
      payments: [],
      invoiceNote: "",
      customerVisibleFindings: "",
      recommendationsSummary: "",
      releaseChecklist: { ...DEFAULT_RELEASE_CHECKLIST },
      isReturnJob: false,
      returnReason: "",
      inspectionPhotos: [],
      initialExteriorPhotos: [],
      takeNotes: createDefaultTakeNotes(),
      arrivalChecks: { ...DEFAULT_ARRIVAL_CHECKS },
      tireInspection: { ...DEFAULT_TIRE_INSPECTION },
      underHoodInspection: { ...DEFAULT_UNDER_HOOD_INSPECTION },
      serviceAdvisorNotes: "",
      softLocked: false,
      lockOverrideReason: "",
    };
    recomputeAll([nextRO, ...ros], parts);
  };

  const createROFromInspection = () => {
    if (
      !inspectionForm.plate.trim() ||
      !inspectionForm.vehicleYear.trim() ||
      !inspectionForm.vehicleMake.trim() ||
      !inspectionForm.vehicleModel.trim() ||
      !inspectionForm.odometer.trim() ||
      !inspectionForm.fuelType ||
      !inspectionForm.transmissionType ||
      !inspectionForm.customerPhone.trim()
    ) {
      alert("Complete the required Vehicle Intake fields first: plate, year, make, model, odometer, fuel type, transmission type, and phone number.");
      setView("vehicleIntake");
      return;
    }

    const generatedWorkLines = buildWorkLinesFromInspection(inspectionForm.issues);
    const computedVehicle = buildInspectionVehicleLabel(inspectionForm);

    const nextRO: RepairOrder = {
      id: uid(),
      roNumber: generateStandardNumber("RO", ros.map((item) => item.roNumber)),
      plate: inspectionForm.plate,
      vehicle: computedVehicle,
      vehicleMake: inspectionForm.vehicleMake,
      vehicleModel: inspectionForm.vehicleModel,
      vehicleYear: inspectionForm.vehicleYear,
      fuelType: inspectionForm.fuelType,
      transmissionType: inspectionForm.transmissionType,
      customer: buildCustomerDisplayName(inspectionForm),
      customerFirstName: inspectionForm.customerFirstName,
      customerLastName: inspectionForm.customerLastName,
      customerPhone: inspectionForm.customerPhone,
      customerEmail: inspectionForm.customerEmail,
      municipality: inspectionForm.municipality,
      region: inspectionForm.region,
      odometer: inspectionForm.odometer,
      bay: inspectionForm.bay,
      priority: inspectionForm.priority,
      status: getROStatusFromWorkLines(generatedWorkLines, { inspectionCompleted: true, qcPassed: false, releaseStatus: "Hold", releaseChecklist: { ...DEFAULT_RELEASE_CHECKLIST } }),
      createdAt: Date.now(),
      inspectionCompleted: true,
      qcPassed: false,
      qcChecklist: { ...DEFAULT_QC_CHECKLIST },
      workLines: generatedWorkLines,
      invoiceStatus: "Draft",
      releaseStatus: "Hold",
      payments: [],
      invoiceNote: "",
      customerVisibleFindings: inspectionForm.customerVisibleFindings,
      recommendationsSummary: inspectionForm.recommendationsSummary,
      releaseChecklist: { ...DEFAULT_RELEASE_CHECKLIST },
      isReturnJob: inspectionForm.isReturnJob,
      returnReason: inspectionForm.returnReason,
      linkedPreviousRoId: inspectionForm.linkedPreviousRoId || undefined,
      inspectionPhotos: inspectionForm.inspectionPhotos,
      initialExteriorPhotos: inspectionForm.initialExteriorPhotos,
      takeNotes: inspectionForm.takeNotes,
      arrivalChecks: inspectionForm.arrivalChecks,
      tireInspection: inspectionForm.tireInspection,
      underHoodInspection: inspectionForm.underHoodInspection,
      serviceAdvisorNotes: `${inspectionForm.serviceAdvisorNotes || ""}${inspectionForm.customerMunicipality ? `\nMunicipality / Town: ${inspectionForm.customerMunicipality}` : ""}`.trim(),
      softLocked: false,
      lockOverrideReason: "",
    };

    recomputeAll([nextRO, ...ros], parts);
    setInspectionForm({ ...DEFAULT_INSPECTION_FORM, takeNotes: createDefaultTakeNotes(), arrivalChecks: { ...DEFAULT_ARRIVAL_CHECKS }, tireInspection: { ...DEFAULT_TIRE_INSPECTION }, underHoodInspection: { ...DEFAULT_UNDER_HOOD_INSPECTION } });
    localStorage.removeItem(DRAFT_KEYS.inspectionForm);
    setDraftBanner("Inspection draft converted into a Repair Order.");
    setTimeout(() => setDraftBanner(""), 3500);
    setView("approval");
  };

  const applyInspectionMake = (make: string) => {
    setInspectionForm((prev) => {
      const nextModels = filterVehicleModels(vehicleCatalog, make, "", prev.vehicleYear);
      const keepCurrentModel = nextModels.some(
        (model) => model.toLowerCase() === prev.vehicleModel.trim().toLowerCase(),
      );
      return {
        ...prev,
        vehicleMake: make,
        vehicleModel: keepCurrentModel ? prev.vehicleModel : "",
      };
    });
  };

  const applyInspectionModel = (model: string) => {
    setInspectionForm((prev) => ({
      ...prev,
      vehicleModel: model,
    }));
  };

  const resetBundledVehicleCatalog = () => {
    setVehicleCatalog(DEFAULT_PH_VEHICLE_CATALOG);
    alert("Bundled Philippine-market vehicle catalog restored.");
  };

  const refreshVehicleCatalog = async () => {
    if (!vehicleCatalogUrl.trim()) {
      alert("Enter a catalog JSON URL first.");
      return;
    }

    try {
      setVehicleCatalogSyncing(true);
      const response = await fetch(vehicleCatalogUrl.trim());
      if (!response.ok) {
        throw new Error(`Catalog refresh failed (${response.status})`);
      }
      const payload = await response.json();
      const normalized = normalizeVehicleCatalogPayload(payload);
      if (!normalized.length) {
        throw new Error("No valid make/model records found in the fetched catalog.");
      }
      setVehicleCatalog(normalized);
      alert(`Vehicle catalog refreshed successfully. ${normalized.length} make(s) loaded.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Vehicle catalog refresh failed.");
    } finally {
      setVehicleCatalogSyncing(false);
    }
  };


  const updateRO = (id: string, patch: Partial<RepairOrder>) => {
    const target = ros.find((r) => r.id === id);
    if (!target) return;
    if (!canEditRo(target) && !("lockOverrideReason" in patch)) return;

    const updated = { ...target, ...patch };
    recomputeAll(
      ros.map((ro) => (ro.id === id ? updated : ro)),
      parts,
    );
    logActivity({ module: "RO", action: "Update RO", recordReference: target.roNumber, oldValue: target, newValue: updated });
  };

  const addWorkLine = (roId: string) => {
    const target = ros.find((r) => r.id === roId);
    if (!target || !canEditRo(target)) return;
    const newLine = getWorkLineEstimate({ ...DEFAULT_WORK_LINE, id: uid() });

    recomputeAll(
      ros.map((ro) =>
        ro.id !== roId
          ? ro
          : {
              ...ro,
              workLines: [...ro.workLines, newLine],
            },
      ),
      parts,
    );
    logActivity({ module: "RO", action: "Add Work Line", recordReference: target.roNumber, newValue: newLine });
  };

  const updateWorkLine = (roId: string, wlId: string, patch: Partial<ROWorkLine>) => {
    const target = ros.find((r) => r.id === roId);
    if (!target || !canEditRo(target)) return;

    const nextRos = ros.map((ro) => {
      if (ro.id !== roId) return ro;

      const workLines = ro.workLines.map((line) => {
        if (line.id !== wlId) return line;

        let nextLine = getWorkLineEstimate({ ...line, ...patch });

        if (patch.status === "In Progress") {
          if (!getPrimaryTechnicianName(nextLine)) {
            nextLine.overrideNote = nextLine.overrideNote || "Started without assigned technician.";
          }

          if (line.status !== "In Progress") {
            nextLine.startedAt = Date.now();
            nextLine.pausedAt = undefined;
            nextLine.sessions = [...line.sessions, { id: uid(), startedAt: Date.now() }];
          }
        }

        if ((patch.status === "Ready" || patch.status === "Approved") && line.status === "In Progress") {
          nextLine.pausedAt = Date.now();
          nextLine.sessions = line.sessions.map((s, idx) =>
            idx === line.sessions.length - 1 && !s.endedAt ? { ...s, endedAt: Date.now() } : s,
          );
        }

        if (patch.status === "Done") {
          nextLine.finishedBy = line.technician;
          nextLine.sessions = line.sessions.map((s, idx) =>
            idx === line.sessions.length - 1 && !s.endedAt ? { ...s, endedAt: Date.now() } : s,
          );
        }

        return nextLine;
      });

      return { ...ro, workLines };
    });

    recomputeAll(nextRos, parts);
    const roRef = ros.find((r) => r.id === roId)?.roNumber || roId;
    logActivity({ module: "RO", action: "Update Work Line", recordReference: roRef, newValue: patch });
  };

  const logCustomerDecision = (
    roId: string,
    wlId: string,
    decision: ApprovalStatus,
    note: string,
    via: "Manual" | "SMS" = "Manual",
  ) => {
    const nextRos = ros.map((ro) => {
      if (ro.id !== roId) return ro;

      return {
        ...ro,
        workLines: ro.workLines.map((line) =>
          line.id !== wlId
            ? line
            : {
                ...line,
                approvalStatus: decision,
                customerDecisionLog: [
                  {
                    id: uid(),
                    timestamp: Date.now(),
                    customerName: ro.customer || "Customer",
                    decision,
                    note,
                    via,
                  },
                  ...line.customerDecisionLog,
                ],
                smsApprovalStatus:
                  via === "SMS" ? (decision === "Declined" ? "Declined" : "Approved") : line.smsApprovalStatus,
              },
        ),
      };
    });

    recomputeAll(nextRos, parts);
    const roRef = ros.find((r) => r.id === roId)?.roNumber || roId;
    logActivity({ module: "Approval", action: "Customer Decision", recordReference: roRef, newValue: { wlId, decision, via, note } });
  };

  const sendSmsApproval = async (roId: string, wlId: string) => {
    const ro = ros.find((item) => item.id === roId);
    const line = ro?.workLines.find((item) => item.id === wlId);
    if (!ro || !line) return;

    const nextRos = ros.map((item) => {
      if (item.id !== roId) return item;
      return {
        ...item,
        workLines: item.workLines.map((workLine) =>
          workLine.id === wlId
            ? { ...workLine, smsApprovalSentAt: Date.now(), smsApprovalStatus: "Sent" }
            : workLine,
        ),
      };
    });
    setRos(nextRos);

    const message = buildSmsApprovalMessage(ro, line);

    try {
      await sendSmsThroughGateway(smsGatewaySettings, ro.customerPhone, message);
      alert("SMS sent through Android gateway.");
    } catch (error) {
      if (smsGatewaySettings.useClipboardFallback) {
        try {
          await copySmsToClipboard(message);
          alert("SMS gateway unavailable. Message copied to clipboard instead.");
        } catch {
          alert(message);
        }
      } else {
        alert(error instanceof Error ? error.message : "SMS sending failed.");
      }
    }
  };

  const startWorkLine = (roId: string, wlId: string) => {
    updateWorkLine(roId, wlId, { status: "In Progress" });
  };

  const pauseWorkLine = (roId: string, wlId: string) => {
    const ro = ros.find((r) => r.id === roId);
    const line = ro?.workLines.find((w) => w.id === wlId);
    if (!line) return;
    updateWorkLine(roId, wlId, { status: line.partsSummary === "Ready" ? "Ready" : "Approved" });
  };

  const updatePrimaryTechnician = (roId: string, wlId: string, technicianName: string) => {
    const trimmed = technicianName.trim();
    const techProfile = technicians.find((tech) => tech.name.toLowerCase() === trimmed.toLowerCase());
    if (techProfile?.role === "OJT") {
      const target = ros.find((ro) => ro.id === roId)?.workLines.find((line) => line.id === wlId);
      if (!target) return;
      updateWorkLine(roId, wlId, { overrideNote: "OJT can only be assigned as Supporting Technician." });
      return;
    }

    const nextRos = ros.map((ro) => {
      if (ro.id !== roId) return ro;
      return {
        ...ro,
        workLines: ro.workLines.map((line) => {
          if (line.id !== wlId) return line;
          const previousPrimary = getPrimaryTechnicianName(line);
          const supporting = getSupportingTechnicianNames(line).filter((name) => name.toLowerCase() !== trimmed.toLowerCase());
          const assignmentLog = [...line.assignmentLog];

          if (previousPrimary && previousPrimary.toLowerCase() !== trimmed.toLowerCase()) {
            assignmentLog.push({
              id: uid(),
              technicianName: previousPrimary,
              role: "Primary",
              assignedAt: Date.now(),
              assignedBy: user?.username || "System",
              removedAt: Date.now(),
              removedBy: user?.username || "System",
              note: "Primary technician replaced.",
            } as TechnicianAssignmentLog);
          }

          if (trimmed && previousPrimary.toLowerCase() !== trimmed.toLowerCase()) {
            assignmentLog.push({
              id: uid(),
              technicianName: trimmed,
              role: "Primary",
              assignedAt: Date.now(),
              assignedBy: user?.username || "System",
              note: previousPrimary ? "Primary technician updated." : "Primary technician assigned.",
            });
          }

          return getWorkLineEstimate({
            ...line,
            technician: trimmed,
            primaryTechnician: trimmed,
            supportingTechnicians: supporting,
            assignmentLog,
            assignedBy: trimmed ? (user?.username || "Manager") : line.assignedBy,
          });
        }),
      };
    });

    recomputeAll(nextRos, parts);
  };

  const updateSupportingTechnicians = (roId: string, wlId: string, rawValue: string) => {
    const parsed = Array.from(new Set(rawValue.split(",").map((name) => name.trim()).filter(Boolean)));
    const nextRos = ros.map((ro) => {
      if (ro.id !== roId) return ro;
      return {
        ...ro,
        workLines: ro.workLines.map((line) => {
          if (line.id !== wlId) return line;
          const primary = getPrimaryTechnicianName(line);
          const filtered = parsed.filter((name) => name.toLowerCase() !== primary.toLowerCase());
          const previous = getSupportingTechnicianNames(line);
          const assignmentLog = [...line.assignmentLog];

          previous.filter((name) => !filtered.some((nextName) => nextName.toLowerCase() === name.toLowerCase())).forEach((name) => {
            assignmentLog.push({
              id: uid(),
              technicianName: name,
              role: "Supporting",
              assignedAt: Date.now(),
              assignedBy: user?.username || "System",
              removedAt: Date.now(),
              removedBy: user?.username || "System",
              note: "Supporting technician removed.",
            });
          });

          filtered.filter((name) => !previous.some((oldName) => oldName.toLowerCase() === name.toLowerCase())).forEach((name) => {
            assignmentLog.push({
              id: uid(),
              technicianName: name,
              role: "Supporting",
              assignedAt: Date.now(),
              assignedBy: user?.username || "System",
              note: "Supporting technician assigned.",
            });
          });

          return {
            ...line,
            supportingTechnicians: filtered,
            assignmentLog,
          };
        }),
      };
    });

    recomputeAll(nextRos, parts);
  };

  const createPart = (roNumber: string, wl?: ROWorkLine) => {
    const linkedRo = ros.find((ro) => ro.roNumber === roNumber);
    const nextPart: PartRequest = {
      id: uid(),
      requestNumber: generateStandardNumber("PR", parts.map((item) => item.requestNumber)),
      roNumber,
      workLineId: wl?.id,
      workLineLabel: wl?.label,
      plate: linkedRo?.plate || "",
      vehicle: linkedRo?.vehicle || "",
      partName: "",
      partNumber: "",
      qty: 1,
      unitCost: 0,
      notes: "",
      photos: [],
      urgency: wl?.priority || linkedRo?.priority || "Normal",
      requestedBy: user?.username || "Service Advisor",
      status: "Draft",
      createdAt: Date.now(),
      inventoryAllocatedQty: 0,
      customerPartsSellingPrice: 0,
      customerLaborSellingPrice: 0,
      customerTotalSellingPrice: 0,
    };
    recomputeAll(ros, [nextPart, ...parts]);
    logActivity({ module: "Parts", action: "Create Part Request", recordReference: roNumber, newValue: nextPart });
  };

  const updatePart = (id: string, patch: Partial<PartRequest>) => {
    const existingPart = parts.find((part) => part.id === id);
    const updatedParts = parts.map((part) => (part.id === id ? { ...part, ...patch } : part));
    recomputeAll(
      ros,
      updatedParts,
    );
    logActivity({ module: "Parts", action: "Update Part Request", recordReference: existingPart?.roNumber || id, oldValue: existingPart, newValue: patch });
  };

  const updatePaymentForm = (roId: string, patch: Partial<PaymentForm>) => {
    setPaymentForms((prev) => ({
      ...prev,
      [roId]: { ...(prev[roId] || DEFAULT_PAYMENT_FORM), ...patch },
    }));
  };

  const addPayment = (roId: string) => {
    const form = paymentForms[roId] || DEFAULT_PAYMENT_FORM;
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return;

    const nextRos = ros.map((ro) =>
      ro.id !== roId
        ? ro
        : {
            ...ro,
            payments: [
              {
                id: uid(),
                timestamp: Date.now(),
                amount,
                method: form.method,
                note: form.note,
              },
              ...ro.payments,
            ],
          },
    );

    recomputeAll(nextRos, parts);
    const roRef = ros.find((r) => r.id === roId)?.roNumber || roId;
    logActivity({ module: "Billing", action: "Add Payment", recordReference: roRef, newValue: { amount, method: form.method, note: form.note } });
    setPaymentForms((prev) => ({ ...prev, [roId]: { ...DEFAULT_PAYMENT_FORM } }));
  };

  const canPerformQCByName = (technicianName: string) => {
    const profile = technicians.find((tech) => tech.name.toLowerCase() === technicianName.trim().toLowerCase());
    return profile ? ["Chief Mechanic", "Senior Mechanic"].includes(profile.role) : false;
  };

  const updateQCChecklist = (roId: string, patch: Partial<QCChecklist>) => {
    recomputeAll(
      ros.map((ro) =>
        ro.id !== roId
          ? ro
          : {
              ...ro,
              qcChecklist: {
                ...ro.qcChecklist,
                ...patch,
              },
              qcPassed:
                patch.finalResult === "Passed"
                  ? true
                  : patch.finalResult === "Failed"
                  ? false
                  : ro.qcPassed,
            },
      ),
      parts,
    );
  };

  const finalizeQC = (roId: string) => {
    const target = ros.find((ro) => ro.id === roId);
    if (!target) return;
    const qc = { ...DEFAULT_QC_CHECKLIST, ...target.qcChecklist };
    if (!qc.inspectedBy.trim()) {
      alert("Select QC inspector first.");
      return;
    }
    if (!canPerformQCByName(qc.inspectedBy)) {
      alert("Only Chief Mechanic or Senior Mechanic can perform QC.");
      return;
    }
    if (qc.finalResult === "Failed" && !qc.notes.trim()) {
      alert("QC failed notes are required.");
      return;
    }

    const nextRos = ros.map((ro) => {
      if (ro.id !== roId) return ro;
      if (qc.finalResult === "Passed") {
        return {
          ...ro,
          qcPassed: true,
          qcChecklist: {
            ...qc,
            inspectedAt: Date.now(),
          },
        };
      }

      const actionable = ro.workLines.filter((line) => line.approvalStatus !== "Declined");
      const fallbackLineId = actionable.find((line) => line.status === "Done" || line.status === "Quality Check")?.id;
      return {
        ...ro,
        qcPassed: false,
        qcChecklist: {
          ...qc,
          inspectedAt: Date.now(),
          failedLogs: [
            {
              id: uid(),
              timestamp: Date.now(),
              inspectedBy: qc.inspectedBy,
              notes: qc.notes,
            },
            ...qc.failedLogs,
          ],
        },
        workLines: ro.workLines.map((line) =>
          line.id !== fallbackLineId
            ? line
            : {
                ...line,
                status: "In Progress",
                overrideNote: `Returned from QC: ${qc.notes}`,
              },
        ),
      };
    });

    recomputeAll(nextRos, parts);
  };

  const updateReleaseChecklist = (roId: string, patch: Partial<ReleaseChecklist>) => {
    recomputeAll(
      ros.map((ro) =>
        ro.id !== roId ? ro : { ...ro, releaseChecklist: { ...ro.releaseChecklist, ...patch } },
      ),
      parts,
    );
  };

  const finalizeRelease = (roId: string) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId || ro.releaseStatus !== "Ready for Release" || !ro.qcPassed) return ro;
        return {
          ...ro,
          releaseChecklist: { ...ro.releaseChecklist, releasedAt: Date.now() },
          releaseStatus: "Released",
          status: "Released",
          softLocked: true,
        };
      }),
    );
  };

  const closeRepairOrder = (roId: string) => {
    recomputeAll(
      ros.map((ro) =>
        ro.id !== roId || ro.releaseStatus !== "Released"
          ? ro
          : {
              ...ro,
              closedAt: Date.now(),
              status: "Closed",
            },
      ),
      parts,
    );
  };

  const toggleTechClock = (techId: string) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === techId ? { ...t, clockedIn: !t.clockedIn } : t)),
    );
  };

  const addInspectionPhoto = () => {
    setInspectionForm((prev) => ({
      ...prev,
      inspectionPhotos: [
        ...prev.inspectionPhotos,
        { id: uid(), label: `Photo ${prev.inspectionPhotos.length + 1}`, url: "" },
      ],
    }));
  };

  const updateInspectionPhoto = (photoId: string, field: "label" | "url", value: string) => {
    setInspectionForm((prev) => ({
      ...prev,
      inspectionPhotos: prev.inspectionPhotos.map((p) =>
        p.id === photoId ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const uploadInspectionPhotoFile = async (photoId: string, file?: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setInspectionForm((prev) => ({
      ...prev,
      inspectionPhotos: prev.inspectionPhotos.map((p) =>
        p.id === photoId ? { ...p, url: dataUrl, label: p.label || file.name } : p,
      ),
    }));
  };

  const addInitialExteriorPhoto = () => {
    setInspectionForm((prev) => ({
      ...prev,
      initialExteriorPhotos: [
        ...prev.initialExteriorPhotos,
        { id: uid(), label: `Exterior Photo ${prev.initialExteriorPhotos.length + 1}`, url: "" },
      ],
    }));
  };

  const updateInitialExteriorPhoto = (photoId: string, field: "label" | "url", value: string) => {
    setInspectionForm((prev) => ({
      ...prev,
      initialExteriorPhotos: prev.initialExteriorPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, [field]: value } : photo,
      ),
    }));
  };

  const uploadInitialExteriorPhotoFile = async (photoId: string, file?: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setInspectionForm((prev) => ({
      ...prev,
      initialExteriorPhotos: prev.initialExteriorPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, url: dataUrl, label: photo.label || file.name } : photo,
      ),
    }));
  };

  const updateTakeNote = (
    takeNoteId: string,
    field: "title" | "note" | "photoUrl",
    value: string,
  ) => {
    setInspectionForm((prev) => ({
      ...prev,
      takeNotes: prev.takeNotes.map((item) =>
        item.id === takeNoteId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const uploadTakeNotePhotoFile = async (takeNoteId: string, file?: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setInspectionForm((prev) => ({
      ...prev,
      takeNotes: prev.takeNotes.map((item) =>
        item.id === takeNoteId ? { ...item, photoUrl: dataUrl, title: item.title || file.name } : item,
      ),
    }));
  };

  const updateArrivalCheck = (
    key: ArrivalCheckKey,
    field: "status" | "note",
    value: string,
  ) => {
    setInspectionForm((prev) => ({
      ...prev,
      arrivalChecks: {
        ...prev.arrivalChecks,
        [key]: {
          ...prev.arrivalChecks[key],
          [field]: value,
        },
      },
    }));
  };

  const updateTireInspection = (
    position: TirePosition,
    patch: Partial<TireInspectionItem>,
  ) => {
    setInspectionForm((prev) => ({
      ...prev,
      tireInspection: {
        ...ensureTireInspectionMap(prev.tireInspection),
        [position]: buildTireInspectionItem(ensureTireInspectionMap(prev.tireInspection)[position], patch),
      },
    }));
  };

  const addWorkLinePhoto = (roId: string, workLineId: string) => {
    const nextRos = ros.map((ro) =>
      ro.id !== roId
        ? ro
        : {
            ...ro,
            workLines: ro.workLines.map((line) =>
              line.id !== workLineId
                ? line
                : {
                    ...line,
                    photos: [
                      ...line.photos,
                      {
                        id: uid(),
                        label: `Photo ${line.photos.length + 1}`,
                        url: "",
                        stage: "Before",
                      },
                    ],
                  },
            ),
          },
    );
    setRos(nextRos);
  };

  const updateWorkLinePhoto = (
    roId: string,
    workLineId: string,
    photoId: string,
    field: "label" | "url" | "stage",
    value: string,
  ) => {
    const nextRos = ros.map((ro) =>
      ro.id !== roId
        ? ro
        : {
            ...ro,
            workLines: ro.workLines.map((line) =>
              line.id !== workLineId
                ? line
                : {
                    ...line,
                    photos: line.photos.map((photo) =>
                      photo.id === photoId ? { ...photo, [field]: value } : photo,
                    ),
                  },
            ),
          },
    );
    setRos(nextRos);
  };

  const uploadWorkLinePhotoFile = async (
    roId: string,
    workLineId: string,
    photoId: string,
    file?: File | null,
  ) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const nextRos = ros.map((ro) =>
      ro.id !== roId
        ? ro
        : {
            ...ro,
            workLines: ro.workLines.map((line) =>
              line.id !== workLineId
                ? line
                : {
                    ...line,
                    photos: line.photos.map((photo) =>
                      photo.id === photoId
                        ? {
                            ...photo,
                            url: dataUrl,
                            label: photo.label || file.name,
                          }
                        : photo,
                    ),
                  },
            ),
          },
    );
    setRos(nextRos);
  };

  const uploadPartRequestPhotoFiles = async (partId: string, files: FileList | null) => {
    if (!files || !files.length) return;
    const uploads = await Promise.all(
      Array.from(files).map(async (file, index) => ({
        id: uid(),
        label: file.name || `Part Photo ${index + 1}`,
        url: await fileToDataUrl(file),
      })),
    );
    updatePart(partId, {
      photos: [...(parts.find((p) => p.id === partId)?.photos || []), ...uploads],
    });
  };

  const uploadPartReceivedPhotoFile = async (partId: string, file?: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    updatePart(partId, { receivedPhotoUrl: dataUrl });
  };

  const testSmsGatewayConnection = async () => {
    if (!smsGatewaySettings.enabled || !smsGatewaySettings.endpoint.trim()) {
      alert("Enter and enable the SMS gateway first.");
      return;
    }
    try {
      const response = await fetch(smsGatewaySettings.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(smsGatewaySettings.apiKey.trim()
            ? { Authorization: `Bearer ${smsGatewaySettings.apiKey.trim()}` }
            : {}),
        },
        body: JSON.stringify({
          device: smsGatewaySettings.deviceName.trim() || "Android Gateway",
          to: "TEST",
          message: "ChatGPT DVI SMS gateway test",
          healthCheck: true,
        }),
      });
      alert(response.ok ? "SMS gateway test request sent successfully." : `SMS gateway test failed (${response.status}).`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "SMS gateway test failed.");
    }
  };

  const createSupplier = () => {
    if (!supplierForm.name.trim()) return;
    const nextSupplier = { id: uid(), ...supplierForm };
    setSuppliers((prev) => [nextSupplier, ...prev]);
    logActivity({ module: "Supplier", action: "Create Supplier", recordReference: nextSupplier.name, newValue: nextSupplier });
    setSupplierForm(DEFAULT_SUPPLIER_FORM);
  };

  const updateBidForm = (partId: string, patch: Partial<BidForm>) => {
    setBidForms((prev) => ({
      ...prev,
      [partId]: { ...(prev[partId] || DEFAULT_BID_FORM), ...patch },
    }));
  };

  const addBid = (partId: string) => {
    const form = bidForms[partId] || DEFAULT_BID_FORM;
    if (!form.supplierId || !form.unitPrice) return;

    const quantity = Number(form.quantity) || parts.find((part) => part.id === partId)?.qty || 1;
    const unitPrice = Number(form.unitPrice) || 0;

    setSupplierBids((prev) => [
      {
        id: uid(),
        partRequestId: partId,
        supplierId: form.supplierId,
        brand: form.brand,
        quantity,
        unitPrice,
        totalCost: round2(quantity * unitPrice),
        etaDays: Number(form.etaDays) || 0,
        warrantyNote: form.warrantyNote,
        condition: form.condition,
        notes: form.notes,
        receiptFiles: form.receiptUrl ? [form.receiptUrl] : [],
        shippingReceiptFiles: form.shippingReceiptUrl ? [form.shippingReceiptUrl] : [],
        actualPartPhotos: form.partPhotoUrl ? [form.partPhotoUrl] : [],
        customerSellingPrice: Number(form.customerSellingPrice) || 0,
        laborSellingPrice: Number(form.laborSellingPrice) || 0,
        selected: false,
      },
      ...prev,
    ]);

    setBidForms((prev) => ({ ...prev, [partId]: { ...DEFAULT_BID_FORM } }));
  };

  const selectBid = (bidId: string) => {
    const bid = supplierBids.find((b) => b.id === bidId);
    if (!bid) return;

    setSupplierBids((prev) =>
      prev.map((b) => ({
        ...b,
        selected: b.id === bidId ? true : b.partRequestId === bid.partRequestId ? false : b.selected,
      })),
    );

    recomputeAll(
      ros,
      parts.map((p) =>
        p.id === bid.partRequestId
          ? {
              ...p,
              selectedSupplierId: bid.supplierId,
              unitCost: bid.unitPrice,
              qty: bid.quantity || p.qty,
              status: "Supplier Selected",
              customerPartsSellingPrice: bid.customerSellingPrice || p.customerPartsSellingPrice,
              customerLaborSellingPrice: bid.laborSellingPrice || p.customerLaborSellingPrice,
              customerTotalSellingPrice:
                bid.customerSellingPrice || bid.laborSellingPrice
                  ? round2((bid.customerSellingPrice || 0) + (bid.laborSellingPrice || 0))
                  : p.customerTotalSellingPrice,
            }
          : p,
      ),
    );
  };

  const createInventoryItem = () => {
    if (!inventoryForm.partName.trim()) return;

    const nextItem = {
        id: uid(),
        partName: inventoryForm.partName,
        sku: inventoryForm.sku,
        quantityOnHand: Number(inventoryForm.quantityOnHand) || 0,
        reorderLevel: Number(inventoryForm.reorderLevel) || 0,
        avgCost: Number(inventoryForm.avgCost) || 0,
        location: inventoryForm.location,
      };
    setInventory((prev) => [
      nextItem,
      ...prev,
    ]);
    logActivity({ module: "Inventory", action: "Create Inventory Item", recordReference: nextItem.sku || nextItem.partName, newValue: nextItem });

    setInventoryForm(DEFAULT_INVENTORY_FORM);
  };

  const restockInventory = (itemId: string, qty: number) => {
    if (!qty) return;
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantityOnHand: item.quantityOnHand + qty } : item)),
    );
  };

  const allocateInventoryToPart = (partId: string, itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    const part = parts.find((p) => p.id === partId);
    if (!item || !part) return;
    if (item.quantityOnHand < part.qty) return;

    setInventory((prev) =>
      prev.map((inv) =>
        inv.id === itemId ? { ...inv, quantityOnHand: inv.quantityOnHand - part.qty } : inv,
      ),
    );

    recomputeAll(
      ros,
      parts.map((p) =>
        p.id === partId
          ? {
              ...p,
              inventoryItemId: itemId,
              inventoryAllocatedQty: part.qty,
              unitCost: item.avgCost,
              status: "Parts Arrived",
              receivedAt: Date.now(),
              receivedBy: user?.username || "Inventory Control",
              receivedCondition: "Complete",
            }
          : p,
      ),
    );
  };

  const confirmPartsArrival = (partId: string) => {
    recomputeAll(
      ros,
      parts.map((part) =>
        part.id !== partId
          ? part
          : {
              ...part,
              status: "Parts Arrived",
              receivedAt: Date.now(),
              receivedBy: user?.username || "Inventory Control",
              receivedCondition: part.receivedCondition || "Complete",
            },
      ),
    );
  };

  const createBackJobFromRO = (roId: string) => {
    const ro = ros.find((item) => item.id === roId);
    if (!ro) return;
    const financials = getROFinancials(ro);
    const primaryLine = ro.workLines.find((line) => line.primaryTechnician || line.technician);
    const qcInspector = ro.qcChecklist?.inspectedBy || "";
    const newBackJob: BackJobRecord = {
      id: uid(),
      reportDate: Date.now(),
      takeInDate: new Date().toISOString().slice(0, 10),
      plateNumber: ro.plate,
      customerName: ro.customer,
      vehicle: ro.vehicle,
      initialInvoiceNumber: ro.invoiceNumber || ro.roNumber,
      initialReleaseDate: ro.releaseChecklist.releasedAt ? new Date(ro.releaseChecklist.releasedAt).toISOString().slice(0, 10) : "",
      initialConcern: ro.returnReason || ro.customerVisibleFindings || "Follow-up / Recheck",
      initialMechanic: primaryLine ? getPrimaryTechnicianName(primaryLine) : "",
      qcPerformedBy: qcInspector,
      backJobInvoiceNumber: generateStandardNumber(
        "BJ",
        backJobs.map((item) => item.backJobInvoiceNumber),
      ),
      currentMechanic: primaryLine ? getPrimaryTechnicianName(primaryLine) : "",
      supportingMechanics: primaryLine ? getSupportingTechnicianNames(primaryLine) : [],
      backJobType: ro.isReturnJob ? "Repeat Issue" : "Follow-up / Recheck",
      findings: "",
      fixPerformed: "",
      status: "Pending",
      costType: "Warranty",
      costPhp: round2(financials.balance),
      rootCauseCategory: "",
      rootCauseNotes: "",
      stageResponsible: "",
      linkedOriginalRoId: ro.id,
      linkedOriginalRoNumber: ro.roNumber,
    };
    setBackJobs((prev) => [newBackJob, ...prev]);
    setView("backJob");
  };

  const updateBackJob = (id: string, patch: Partial<BackJobRecord>) => {
    const existingBackJob = backJobs.find((item) => item.id === id);
    setBackJobs((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    logActivity({ module: "Back Job", action: "Update Back Job", recordReference: existingBackJob?.backJobInvoiceNumber || id, oldValue: existingBackJob, newValue: patch });
  };

  const saveSalesEntry = () => {
    if (!salesForm.entryDate) return;
    const grossSales = Math.max(0, Number(salesForm.grossSales) || 0);
    const tireSales = Math.max(0, Number(salesForm.tireSales) || 0);
    const netSalesLessTires = round2(grossSales - tireSales);

    const existing = salesEntries.find((entry) => entry.entryDate === salesForm.entryDate);
    const nextEntry: SalesEntry = {
      id: existing?.id || uid(),
      entryDate: salesForm.entryDate,
      grossSales,
      tireSales,
      netSalesLessTires,
      notes: salesForm.notes,
      encodedBy: user?.username || "System",
      encodedRole: user?.role || "System",
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    setSalesEntries((prev) => {
      const updated = existing
        ? prev.map((entry) => (entry.entryDate === salesForm.entryDate ? nextEntry : entry))
        : [nextEntry, ...prev];
      return updated.sort((a, b) => b.entryDate.localeCompare(a.entryDate));
    });

    logActivity({
      module: "Sales",
      action: existing ? "Update Sales Entry" : "Create Sales Entry",
      recordReference: salesForm.entryDate,
      oldValue: existing,
      newValue: nextEntry,
    });

    setSalesForm((prev) => ({ ...DEFAULT_SALES_FORM, entryDate: prev.entryDate || DEFAULT_SALES_FORM.entryDate }));
    localStorage.removeItem(DRAFT_KEYS.salesForm);
  };

  const loadSalesEntryToForm = (entry: SalesEntry) => {
    setSalesForm({
      entryDate: entry.entryDate,
      grossSales: String(entry.grossSales),
      tireSales: String(entry.tireSales),
      notes: entry.notes,
    });
  };

  const deleteSalesEntry = (entryId: string) => {
    const target = salesEntries.find((entry) => entry.id === entryId);
    if (!target) return;
    setSalesEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    logActivity({
      module: "Sales",
      action: "Delete Sales Entry",
      recordReference: target.entryDate,
      oldValue: target,
    });
  };

  const startEmployeeEdit = (employee: EmployeeRecord) => {
    setSelectedEmployeeId(employee.id);
    setEmployeeForm({
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      displayName: employee.displayName,
      role: employee.role,
      department: employee.department,
      phone: employee.phone,
      username: employee.username,
      password: employee.password,
      active: employee.active,
      mustChangePassword: Boolean(employee.mustChangePassword),
      allowedViews: employee.allowedViews,
    });
    setView("employees");
  };

  const resetEmployeeForm = () => {
    setSelectedEmployeeId("");
    setEmployeeForm(DEFAULT_EMPLOYEE_FORM);
    localStorage.removeItem(DRAFT_KEYS.employeeForm);
  };

  const saveEmployee = () => {
    if (!employeeForm.employeeCode.trim() || !employeeForm.displayName.trim() || !employeeForm.username.trim() || !employeeForm.password.trim()) {
      alert("Employee code, display name, username, and password are required.");
      return;
    }
    const duplicateUsername = employees.find(
      (employee) => employee.username.trim().toLowerCase() === employeeForm.username.trim().toLowerCase() && employee.id !== selectedEmployeeId,
    );
    if (duplicateUsername) {
      alert("Username already exists. Use a different username.");
      return;
    }

    const payload = normalizeEmployeeRecord({
      id: selectedEmployeeId || uid(),
      employeeCode: employeeForm.employeeCode,
      firstName: employeeForm.firstName,
      lastName: employeeForm.lastName,
      displayName: employeeForm.displayName,
      role: employeeForm.role,
      department: employeeForm.department,
      phone: employeeForm.phone,
      username: employeeForm.username,
      password: employeeForm.password,
      active: employeeForm.active,
      mustChangePassword: employeeForm.mustChangePassword,
      allowedViews: employeeForm.allowedViews,
      createdAt: employees.find((employee) => employee.id === selectedEmployeeId)?.createdAt || Date.now(),
    }, employees.length);

    setEmployees((prev) => {
      const next = selectedEmployeeId ? prev.map((employee) => (employee.id === selectedEmployeeId ? payload : employee)) : [payload, ...prev];
      return next;
    });
    if (payload.role === "Technician" || payload.role === "Mechanic") {
      setTechnicians((prev) => {
        const existing = prev.find((tech) => tech.name.trim().toLowerCase() === payload.displayName.trim().toLowerCase());
        if (existing) {
          return prev.map((tech) =>
            tech.id === existing.id
              ? { ...tech, name: payload.displayName, role: mapEmployeeToTechnicianRole(payload.role) }
              : tech,
          );
        }
        return [
          ...prev,
          {
            id: `tech-${payload.id}`,
            name: payload.displayName,
            role: mapEmployeeToTechnicianRole(payload.role),
            clockedIn: false,
            currentRoNumber: "",
            currentWorkLine: "",
            completedJobs: 0,
          },
        ];
      });
    }
    logActivity({ module: "Activity Logs", action: selectedEmployeeId ? "Update Employee" : "Create Employee", recordReference: payload.employeeCode, newValue: payload });
    resetEmployeeForm();
  };

  const toggleEmployeeActive = (employeeId: string) => {
    const target = employees.find((employee) => employee.id === employeeId);
    if (!target) return;
    setEmployees((prev) => prev.map((employee) => employee.id === employeeId ? { ...employee, active: !employee.active } : employee));
    if (user?.id === employeeId && target.active) {
      setUser({ ...target, active: false });
    }
  };

  const handleLogin = () => {
    const matched = employees.find((employee) => employee.username.trim().toLowerCase() === loginUsername.trim().toLowerCase() && employee.password === loginPassword);
    if (!matched) {
      setLoginError("Invalid username or password.");
      return;
    }
    if (!matched.active) {
      setLoginError("This employee account is inactive.");
      return;
    }
    try { localStorage.removeItem(DRAFT_KEYS.view); } catch {}
    setView("vehicleIntake");
    setUser(matched);
    setLoginError("");
  };

  const quickLoginAs = (employee: EmployeeRecord) => {
    setLoginUsername(employee.username);
    setLoginPassword(employee.password);
    try { localStorage.removeItem(DRAFT_KEYS.view); } catch {}
    setView("vehicleIntake");
    setUser(employee);
    setLoginError("");
  };

  const getVisibleViews = (currentUser: User | null): ViewKey[] => {
    if (!currentUser) return [];
    return currentUser.allowedViews?.length ? currentUser.allowedViews : getDefaultAllowedViewsForRole(currentUser.role);
  };

  const getAttendanceRecord = (employeeId: string, date = attendanceBoardDate) =>
    attendanceRecords.find((record) => record.employeeId === employeeId && record.date === date);

  const syncTechnicianClockFromAttendance = (employee: EmployeeRecord, nextRecord: AttendanceRecord) => {
    if (!(employee.role === "Technician" || employee.role === "Mechanic")) return;
    setTechnicians((prev) =>
      prev.map((tech) =>
        tech.name.trim().toLowerCase() === employee.displayName.trim().toLowerCase()
          ? {
              ...tech,
              role: mapEmployeeToTechnicianRole(employee.role),
              clockedIn: Boolean(nextRecord.checkInTime && !nextRecord.checkOutTime && ["Present", "Late", "Half Day"].includes(nextRecord.status)),
            }
          : tech,
      ),
    );
  };

  const upsertAttendanceRecord = (
    employee: EmployeeRecord,
    patch: Partial<AttendanceRecord>,
    options?: { actionLabel?: string; note?: string },
  ) => {
    const existing = getAttendanceRecord(employee.id, attendanceBoardDate);
    const nextRecord: AttendanceRecord = {
      id: existing?.id || uid(),
      employeeId: employee.id,
      date: attendanceBoardDate,
      status: patch.status || existing?.status || "Present",
      checkInTime: patch.checkInTime !== undefined ? patch.checkInTime : existing?.checkInTime,
      checkOutTime: patch.checkOutTime !== undefined ? patch.checkOutTime : existing?.checkOutTime,
      note: patch.note !== undefined ? patch.note : existing?.note || "",
      encodedBy: user?.displayName || user?.username || existing?.encodedBy || "System",
    };
    setAttendanceRecords((prev) => {
      const withoutCurrent = prev.filter((record) => !(record.employeeId === employee.id && record.date === attendanceBoardDate));
      return [nextRecord, ...withoutCurrent];
    });
    syncTechnicianClockFromAttendance(employee, nextRecord);
    if (options?.actionLabel) {
      logActivity({
        module: "Activity Logs",
        action: options.actionLabel,
        recordReference: `${employee.displayName} • ${attendanceBoardDate}`,
        newValue: nextRecord,
        note: options.note,
      });
    }
  };

  const handleEmployeeCheckIn = (employee: EmployeeRecord) => {
    const existing = getAttendanceRecord(employee.id, attendanceBoardDate);
    upsertAttendanceRecord(
      employee,
      {
        status: existing?.status === "Late" ? "Late" : "Present",
        checkInTime: existing?.checkInTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        checkOutTime: existing?.status === "Absent" || existing?.status === "On Leave" ? undefined : existing?.checkOutTime,
      },
      { actionLabel: "Employee Check In" },
    );
  };

  const handleEmployeeCheckOut = (employee: EmployeeRecord) => {
    const existing = getAttendanceRecord(employee.id, attendanceBoardDate);
    if (!existing?.checkInTime) {
      handleEmployeeCheckIn(employee);
      return;
    }
    upsertAttendanceRecord(
      employee,
      {
        status: existing.status || "Present",
        checkOutTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      { actionLabel: "Employee Check Out" },
    );
  };

  const setEmployeeAttendanceStatus = (employee: EmployeeRecord, status: AttendanceStatus) => {
    const existing = getAttendanceRecord(employee.id, attendanceBoardDate);
    const nextPatch: Partial<AttendanceRecord> = {
      status,
      note: existing?.note || "",
    };
    if (status === "Present" || status === "Late" || status === "Half Day") {
      nextPatch.checkInTime = existing?.checkInTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (status !== "Half Day") nextPatch.checkOutTime = existing?.checkOutTime;
    } else {
      nextPatch.checkInTime = undefined;
      nextPatch.checkOutTime = undefined;
    }
    upsertAttendanceRecord(employee, nextPatch, { actionLabel: "Attendance Status Update", note: status });
  };

  const updateAttendanceNote = (employee: EmployeeRecord, note: string) => {
    upsertAttendanceRecord(employee, { note, status: getAttendanceRecord(employee.id, attendanceBoardDate)?.status || "Absent" });
  };

  const applyAllowedViewPreset = (role: UserRole) => {
    setEmployeeForm((prev) => ({ ...prev, allowedViews: getDefaultAllowedViewsForRole(role) }));
  };

  const exportSystemBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      buildVersion: BUILD_VERSION,
      ros,
      parts,
      backJobs,
      activityLogs,
      salesEntries,
      technicians,
      suppliers,
      supplierBids,
      inventory,
      employees,
      attendanceRecords,
      inspectionDraft: inspectionForm,
      employeeForm,
      paymentForms,
      supplierForm,
      bidForms,
      inventoryForm,
      salesForm,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dvi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setDraftBanner("System backup exported.");
    setTimeout(() => setDraftBanner(""), 3500);
  };

  /* =========================
     DERIVED
  ========================= */

  const dashboardStats = useMemo(
    () => ({
      totalRO: ros.length,
      waitingInspection: ros.filter((r) => r.status === "Waiting Inspection").length,
      waitingApproval: ros.filter((r) => r.status === "Waiting Approval").length,
      readyToWork: ros.filter((r) => r.status === "Approved / Ready to Work").length,
      inProgress: ros.filter((r) => r.status === "In Progress").length,
      waitingParts: ros.filter((r) => r.status === "Waiting Parts").length,
      qualityCheck: ros.filter((r) => r.status === "Quality Check").length,
      readyRelease: ros.filter((r) => r.status === "Ready Release").length,
      released: ros.filter((r) => r.status === "Released").length,
      closed: ros.filter((r) => r.status === "Closed").length,
      completed: ros.filter((r) => r.status === "Closed").length,
      returnJobs: ros.filter((r) => r.isReturnJob).length,
      backJobs: backJobs.length,
    }),
    [ros, backJobs],
  );

  const dailySnapshot = useMemo(() => buildDailySnapshot(ros), [ros]);
  const managerAlerts = useMemo(() => buildManagerAlerts(ros), [ros]);
  const dailyRevenue = dailySnapshot.revenueToday;

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    return round2(
      ros.reduce(
        (sum, ro) =>
          sum +
          ro.payments
            .filter((p) => {
              const d = new Date(p.timestamp);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((s, p) => s + p.amount, 0),
        0,
      ),
    );
  }, [ros]);

  const weeklyRevenue = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return round2(
      ros.reduce(
        (sum, ro) =>
          sum +
          ro.payments
            .filter((p) => p.timestamp >= start.getTime())
            .reduce((s, p) => s + p.amount, 0),
        0,
      ),
    );
  }, [ros]);

  const monthRevenueBreakdown = useMemo(() => {
    const now = new Date();
    return ros.reduce(
      (acc, ro) => {
        ro.payments.forEach((p) => {
          const d = new Date(p.timestamp);
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            const financials = getROFinancials(ro);
            acc.labor += financials.labor;
            acc.parts += financials.parts;
          }
        });
        return acc;
      },
      { labor: 0, parts: 0 },
    );
  }, [ros]);

  const openReceivables = useMemo(
    () => round2(ros.reduce((sum, ro) => sum + getROFinancials(ro).balance, 0)),
    [ros],
  );

  const statusPipeline = useMemo(
    () => ({
      draft: ros.filter((r) => r.status === "Draft").length,
      open: ros.filter((r) => r.status === "Draft").length,
      waitingInspection: ros.filter((r) => r.status === "Waiting Inspection").length,
      waitingApproval: ros.filter((r) => r.status === "Waiting Approval").length,
      readyToWork: ros.filter((r) => r.status === "Approved / Ready to Work").length,
      inProgress: ros.filter((r) => r.status === "In Progress").length,
      waitingParts: ros.filter((r) => r.status === "Waiting Parts").length,
      qc: ros.filter((r) => r.status === "Quality Check").length,
      readyRelease: ros.filter((r) => r.status === "Ready Release").length,
      released: ros.filter((r) => r.status === "Released").length,
      closed: ros.filter((r) => r.status === "Closed").length,
    }),
    [ros],
  );

  const stuckJobs = useMemo(
    () =>
      ros
        .filter((ro) => {
          const ageHours = (Date.now() - ro.createdAt) / 3600000;
          return (
            (ro.status === "In Progress" && ageHours >= 24) ||
            (ro.status === "Waiting Parts" && ageHours >= 48) ||
            (ro.status === "Quality Check" && ageHours >= 12)
          );
        })
        .sort((a, b) => a.createdAt - b.createdAt),
    [ros],
  );

  const pendingInvoiceRos = useMemo(
    () =>
      ros
        .filter((ro) => ro.invoiceStatus !== "Paid" || ro.releaseStatus === "Hold")
        .sort((a, b) => getROFinancials(b).balance - getROFinancials(a).balance),
    [ros],
  );

  const topServiceCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    ros.forEach((ro) => {
      ro.workLines
        .filter((w) => w.approvalStatus !== "Declined")
        .forEach((w) => {
          counts[w.category] = (counts[w.category] || 0) + 1;
        });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [ros]);

  const highValueRos = useMemo(
    () =>
      ros
        .map((ro) => ({ ro, total: getROFinancials(ro).total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
    [ros],
  );

  const sevenDayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - idx));
      const label = day.toLocaleDateString([], { month: "short", day: "numeric" });
      const value = round2(
        ros.reduce(
          (sum, ro) =>
            sum +
            ro.payments
              .filter((p) => {
                const d = new Date(p.timestamp);
                return d.toDateString() === day.toDateString();
              })
              .reduce((s, p) => s + p.amount, 0),
          0,
        ),
      );
      return { label, value };
    });
  }, [ros]);


  const avgROValue = useMemo(() => {
    if (!ros.length) return 0;
    return round2(ros.reduce((sum, ro) => sum + getROFinancials(ro).total, 0) / ros.length);
  }, [ros]);

  const comebackRate = useMemo(() => {
    if (!ros.length) return 0;
    return round2((ros.filter((r) => r.isReturnJob).length / ros.length) * 100);
  }, [ros]);

  const technicianKpis = useMemo(() => {
    return technicians.map((tech) => {
      const lines = ros.flatMap((ro) => ro.workLines.filter((w) => lineHasTechnician(w, tech.name)));
      const billedHours = round2(lines.reduce((sum, l) => sum + l.estimatedHours, 0));
      const actualHours = round2(lines.reduce((sum, l) => sum + (l.actualHours || 0), 0));
      const efficiency = actualHours > 0 ? round2((billedHours / actualHours) * 100) : 0;
      const comebacks = ros.filter((ro) => ro.isReturnJob && ro.workLines.some((w) => lineHasTechnician(w, tech.name))).length;
      const active = lines.filter((l) => l.status === "In Progress").length;
      const completedLines = lines.filter((l) => l.status === "Done").length;
      const qcLines = lines.filter((l) => l.status === "Quality Check").length;
      const totalAssigned = lines.length;
      const completionRate = totalAssigned > 0 ? round2((completedLines / totalAssigned) * 100) : 0;
      const avgHoursPerJob = completedLines > 0 ? round2(actualHours / completedLines) : 0;
      const laborRevenue = round2(lines.reduce((sum, l) => sum + l.laborCost, 0));
      const estimatedValue = round2(lines.reduce((sum, l) => sum + l.estimateTotal, 0));
      const utilizationScore = round2(Math.min(100, active * 25 + completedLines * 10));
      const primaryAssignments = lines.filter((line) => getPrimaryTechnicianName(line).toLowerCase() === tech.name.toLowerCase()).length;
      const supportingAssignments = lines.filter((line) => getSupportingTechnicianNames(line).some((name) => name.toLowerCase() === tech.name.toLowerCase())).length;
      const rankingScore = round2(
        efficiency * 0.35 +
          completionRate * 0.25 +
          Math.min(completedLines * 8, 100) * 0.2 +
          Math.max(0, 100 - comebacks * 18) * 0.1 +
          Math.min(utilizationScore, 100) * 0.1
      );
      return { ...tech, billedHours, actualHours, efficiency, comebacks, active, completedLines, qcLines, totalAssigned, completionRate, avgHoursPerJob, laborRevenue, estimatedValue, utilizationScore, primaryAssignments, supportingAssignments, rankingScore };
    });
  }, [technicians, ros]);

  const technicianLeaderboard = useMemo(
    () => technicianKpis.slice().sort((a, b) => b.rankingScore - a.rankingScore),
    [technicianKpis],
  );

  const technicianSummary = useMemo(() => {
    const totalBilledHours = round2(technicianKpis.reduce((sum, tech) => sum + tech.billedHours, 0));
    const totalActualHours = round2(technicianKpis.reduce((sum, tech) => sum + tech.actualHours, 0));
    const totalCompleted = technicianKpis.reduce((sum, tech) => sum + tech.completedLines, 0);
    const activeTechs = technicianKpis.filter((tech) => tech.clockedIn).length;
    const workingTechs = technicianKpis.filter((tech) => tech.active > 0).length;
    const avgEfficiency = technicianKpis.length
      ? round2(technicianKpis.reduce((sum, tech) => sum + tech.efficiency, 0) / technicianKpis.length)
      : 0;
    return { totalBilledHours, totalActualHours, totalCompleted, activeTechs, workingTechs, avgEfficiency };
  }, [technicianKpis]);

  const returnIntelligence = useMemo(() => {
    const byTech: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    ros.filter((r) => r.isReturnJob).forEach((ro) => {
      ro.workLines.forEach((line) => {
        if (line.technician) byTech[line.technician] = (byTech[line.technician] || 0) + 1;
        byCategory[line.category] = (byCategory[line.category] || 0) + 1;
      });
    });

    return { byTech, byCategory };
  }, [ros]);

  const shopRows = useMemo(() => {
    const priorityOrder: Record<Priority, number> = {
      Urgent: 0,
      High: 1,
      Normal: 2,
      Low: 3,
    };

    return ros.slice().sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return a.bay.localeCompare(b.bay) || b.createdAt - a.createdAt;
    });
  }, [ros]);

  const estimateSummary = useMemo(
    () => ros.map((ro) => ({ roId: ro.id, roNumber: ro.roNumber, ...getROFinancials(ro) })),
    [ros],
  );

  const customerHistory = useMemo(() => buildCustomerHistory(ros), [ros]);
  const inventoryAlerts = useMemo(
    () => inventory.filter((i) => i.quantityOnHand <= i.reorderLevel),
    [inventory],
  );


  const filteredActivityLogs = useMemo(() => {
    return activityLogs;
  }, [activityLogs]);

  const activityLogSummaryByUser = useMemo(() => {
    const map = new Map<string, number>();
    activityLogs.forEach((entry) => {
      map.set(entry.user, (map.get(entry.user) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [activityLogs]);

  const sortedSalesEntries = useMemo(
    () => salesEntries.slice().sort((a, b) => b.entryDate.localeCompare(a.entryDate)),
    [salesEntries],
  );

  const salesCurrentMonthSummary = useMemo(() => {
    const now = new Date();
    const monthEntries = salesEntries.filter((entry) => {
      const d = new Date(entry.entryDate);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const totalGrossSales = round2(monthEntries.reduce((sum, entry) => sum + entry.grossSales, 0));
    const totalTireSales = round2(monthEntries.reduce((sum, entry) => sum + entry.tireSales, 0));
    const totalNetSalesLessTires = round2(monthEntries.reduce((sum, entry) => sum + entry.netSalesLessTires, 0));
    const encodedSalesDays = new Set(monthEntries.map((entry) => entry.entryDate)).size;
    const averageDailySales = encodedSalesDays ? round2(totalNetSalesLessTires / encodedSalesDays) : 0;
    const monthlyProjection = round2(averageDailySales * getDaysInMonth(now.getFullYear(), now.getMonth()));
    return {
      totalGrossSales,
      totalTireSales,
      totalNetSalesLessTires,
      encodedSalesDays,
      averageDailySales,
      monthlyProjection,
    };
  }, [salesEntries]);

  const yearlySalesTable = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const rows = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthEntries = salesEntries.filter((entry) => {
        const d = new Date(entry.entryDate);
        return d.getFullYear() === year && d.getMonth() === monthIndex;
      });
      const grossSales = round2(monthEntries.reduce((sum, entry) => sum + entry.grossSales, 0));
      const tireSales = round2(monthEntries.reduce((sum, entry) => sum + entry.tireSales, 0));
      const netSalesLessTires = round2(monthEntries.reduce((sum, entry) => sum + entry.netSalesLessTires, 0));
      const encodedSalesDays = new Set(monthEntries.map((entry) => entry.entryDate)).size;
      const averageDailySales = encodedSalesDays ? round2(netSalesLessTires / encodedSalesDays) : 0;
      const monthlyProjection = round2(averageDailySales * getDaysInMonth(year, monthIndex));
      return {
        key: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
        monthLabel: new Date(year, monthIndex, 1).toLocaleString(undefined, { month: "long" }),
        grossSales,
        tireSales,
        netSalesLessTires,
        encodedSalesDays,
        averageDailySales,
        monthlyProjection,
      };
    });
    const monthsWithEntries = rows.filter((row) => row.encodedSalesDays > 0);
    const averageMonthlySales = monthsWithEntries.length
      ? round2(monthsWithEntries.reduce((sum, row) => sum + row.netSalesLessTires, 0) / monthsWithEntries.length)
      : 0;
    const yearProjection = round2(averageMonthlySales * 12);
    return { year, rows, averageMonthlySales, yearProjection };
  }, [salesEntries]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return customerHistory;
    return customerHistory.filter((record) =>
      [record.customer, record.plate, record.vehicle].some((v) => v.toLowerCase().includes(q)),
    );
  }, [customerHistory, historySearch]);


  const plateLookupMatches = useMemo(() => {
    const plateQuery = inspectionForm.plate.trim().toLowerCase();
    if (!plateQuery) return [] as RepairOrder[];
    return ros
      .filter((ro) => String(ro.plate || "").trim().toLowerCase().includes(plateQuery))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 8);
  }, [inspectionForm.plate, ros]);

  const customerLookupMatches = useMemo(() => {
    const customerQuery = [inspectionForm.customer, inspectionForm.customerFirstName, inspectionForm.customerLastName, inspectionForm.customerPhone]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!customerQuery) return [] as RepairOrder[];
    return ros
      .filter((ro) => buildCustomerLookupText(ro).toLowerCase().includes(customerQuery))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 8);
  }, [inspectionForm.customer, inspectionForm.customerFirstName, inspectionForm.customerLastName, inspectionForm.customerPhone, ros]);

  const masterDataSnapshot = useMemo(() => ({
    plates: Array.from(new Set(ros.map((ro) => String(ro.plate || "").trim()).filter(Boolean))).sort(),
    customers: Array.from(new Set(ros.map((ro) => String(ro.customer || "").trim()).filter(Boolean))).sort(),
    vehicles: Array.from(new Set(ros.map((ro) => String(ro.vehicle || "").trim()).filter(Boolean))).sort(),
    suppliers: suppliers.map((item) => item.name),
    inventoryItems: inventory.map((item) => item.partName),
    activeEmployees: employees.filter((employee) => employee.active).map((employee) => employee.displayName),
  }), [ros, suppliers, inventory, employees]);

  const attendanceMapForBoardDate = useMemo(() => {
    return attendanceRecords
      .filter((record) => record.date === attendanceBoardDate)
      .reduce<Record<string, AttendanceRecord>>((acc, record) => {
        acc[record.employeeId] = record;
        return acc;
      }, {});
  }, [attendanceRecords, attendanceBoardDate]);

  const employeeDirectory = useMemo(() => {
    return employees.reduce<Record<string, EmployeeRecord>>((acc, employee) => {
      acc[employee.id] = employee;
      return acc;
    }, {});
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    return employees
      .filter((employee) => {
        if (!q) return true;
        return [employee.displayName, employee.employeeCode, employee.username, employee.role, employee.department]
          .some((value) => value.toLowerCase().includes(q));
      })
      .filter((employee) => {
        if (attendanceStatusFilter === "All") return true;
        return (attendanceMapForBoardDate[employee.id]?.status || "Absent") === attendanceStatusFilter;
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [employees, employeeSearch, attendanceStatusFilter, attendanceMapForBoardDate]);

  const attendanceBoardSummary = useMemo(() => {
    const records = employees.map((employee) => attendanceMapForBoardDate[employee.id]).filter(Boolean) as AttendanceRecord[];
    return {
      present: records.filter((record) => record.status === "Present").length,
      late: records.filter((record) => record.status === "Late").length,
      halfDay: records.filter((record) => record.status === "Half Day").length,
      onLeave: records.filter((record) => record.status === "On Leave").length,
      checkedOut: records.filter((record) => Boolean(record.checkOutTime)).length,
    };
  }, [employees, attendanceMapForBoardDate]);

  const technicianEmployeeSummary = useMemo(() => {
    const technicianEmployees = employees.filter((employee) => employee.role === "Technician" || employee.role === "Mechanic");
    const todaysMap = attendanceRecords
      .filter((record) => record.date === getTodayDateString())
      .reduce<Record<string, AttendanceRecord>>((acc, record) => {
        acc[record.employeeId] = record;
        return acc;
      }, {});
    return {
      total: technicianEmployees.length,
      present: technicianEmployees.filter((employee) => {
        const status = todaysMap[employee.id]?.status;
        return status === "Present" || status === "Late" || status === "Half Day";
      }).length,
      checkedOut: technicianEmployees.filter((employee) => Boolean(todaysMap[employee.id]?.checkOutTime)).length,
    };
  }, [employees, attendanceRecords]);

  const renderSafeCurrentView = () => {
    try {
      if (view === "dashboard") return DashboardView();
      if (view === "vehicleIntake") return VehicleIntakeView();
      if (view === "inspection") return InspectionView();
      if (view === "approval") return ApprovalView();
      if (view === "ro") return ROView();
      if (view === "parts") return PartsView();
      if (view === "shop") return ShopView();
      if (view === "tech") return TechView();
      if (view === "billing") return BillingView();
      if (view === "customerSummary") return CustomerSummaryView();
      if (view === "history") return HistoryView();
      if (view === "backJob") return BackJobView();
      if (view === "activityLogs") return ActivityLogsView();
      if (view === "salesReports") return SalesReportsView();
      if (view === "purchasing") return PurchasingView();
      if (view === "inventory") return InventoryView();
      if (view === "employees") return EmployeeView();
      return VehicleIntakeView();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return (
        <div style={{ ...styles.cardBlock, border: "1px solid #fecaca", background: "#fef2f2" }}>
          <div style={{ fontWeight: 800, color: "#991b1b", marginBottom: 8 }}>View render error</div>
          <div style={{ color: "#7f1d1d", fontSize: 14, marginBottom: 12 }}>Current view: {VIEW_TITLES[view]?.title || view}</div>
          <div style={{ color: "#7f1d1d", fontSize: 13, whiteSpace: "pre-wrap", marginBottom: 12 }}>{message}</div>
          <div style={styles.wrapRow}>
            <button style={styles.primaryButton} onClick={() => setView("vehicleIntake")}>Open Vehicle Intake</button>
            <button style={styles.secondaryButton} onClick={() => setView("inspection")}>Open Inspection</button>
            <button style={styles.secondaryButton} onClick={clearDraftRecovery}>Clear Drafts</button>
          </div>
        </div>
      );
    }
  };

  const currentViewMeta = VIEW_TITLES[view] || { title: "Workspace", subtitle: "Manage your workshop operations." };
  const visibleViews = getVisibleViews(user);
  const isAdmin = user?.role === "Admin";
  const canManageEmployees = Boolean(user && ["Admin", "Management", "Manager", "Assistant Manager"].includes(user.role));
  const canManageAttendance = Boolean(user && ["Admin", "Management", "Manager", "Assistant Manager", "Service Advisor", "Office Staff", "Reception"].includes(user.role));
  const canManagePermissions = Boolean(user && user.role === "Admin");

  useEffect(() => {
    if (user && !canAccessViewForUser(user, view)) {
      const fallbackView = visibleViews[0] || "dashboard";
      if (fallbackView !== view) setView(fallbackView);
    }
  }, [user, view, visibleViews]);

  const isPhone = viewportWidth <= 768;
  const isTablet = viewportWidth > 768 && viewportWidth <= 1100;
  const isCompact = viewportWidth <= 1100;
  const safeTireInspection = ensureTireInspectionMap(inspectionForm?.tireInspection);

  const getTireIndicatorButtonStyle = (position: TirePosition, selected: boolean, editableDiagram: boolean): React.CSSProperties => {
    const tire = safeTireInspection[position];
    const treadAssessment = getTreadDepthAssessment(tire.treadDepthMm);
    return {
      position: "absolute",
      width: isPhone ? 74 : 86,
      minHeight: isPhone ? 72 : 82,
      borderRadius: 18,
      border: `2px solid ${selected ? treadAssessment.border : "rgba(148, 163, 184, 0.55)"}`,
      background: selected ? treadAssessment.background : "rgba(255,255,255,0.94)",
      boxShadow: selected ? `0 0 0 3px ${treadAssessment.border}22` : "0 10px 22px rgba(15, 23, 42, 0.08)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      cursor: editableDiagram ? "pointer" : "default",
      color: treadAssessment.text,
      fontWeight: 800,
      padding: "8px 6px",
      transition: "all 0.18s ease",
    };
  };

  const renderTireVehicleDiagram = (editableDiagram = false) => {
    const positions: { position: TirePosition; top: string; left?: string; right?: string }[] = [
      { position: "frontLeft", top: "12%", left: isPhone ? "2%" : "5%" },
      { position: "frontRight", top: "12%", right: isPhone ? "2%" : "5%" },
      { position: "rearLeft", top: "68%", left: isPhone ? "2%" : "5%" },
      { position: "rearRight", top: "68%", right: isPhone ? "2%" : "5%" },
    ];

    return (
      <div style={{ ...styles.innerBlock, padding: isPhone ? 14 : 18 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Vehicle Tire Illustration</div>
        <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 12 }}>
          {editableDiagram ? "Click a tire indicator to jump to that tire's inspection details." : "Visual tire status from Vehicle Intake."}
        </div>
        <div
          style={{
            position: "relative",
            maxWidth: 460,
            width: "100%",
            height: isPhone ? 320 : 360,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "8%",
              bottom: "8%",
              left: "22%",
              right: "22%",
              borderRadius: 36,
              background: "linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 48%, #e2e8f0 100%)",
              border: "2px solid #94a3b8",
              boxShadow: "inset 0 0 0 6px rgba(255,255,255,0.42)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "34%",
              right: "34%",
              height: isPhone ? 54 : 60,
              borderRadius: 999,
              background: "rgba(255,255,255,0.52)",
              border: "1px solid rgba(148, 163, 184, 0.7)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "12%",
              left: "34%",
              right: "34%",
              height: isPhone ? 54 : 60,
              borderRadius: 999,
              background: "rgba(255,255,255,0.52)",
              border: "1px solid rgba(148, 163, 184, 0.7)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "28%",
              bottom: "28%",
              left: "44%",
              right: "44%",
              borderRadius: 999,
              background: "rgba(148, 163, 184, 0.24)",
            }}
          />

          {positions.map(({ position, top, left, right }) => {
            const tire = safeTireInspection[position];
            const treadAssessment = getTreadDepthAssessment(tire.treadDepthMm);
            const selected = selectedTirePosition === position;
            return (
              <button
                key={position}
                type="button"
                title={`${TIRE_POSITION_LABELS[position]} • ${tire.condition} • ${tire.treadDepthMm || "No depth"} • ${treadAssessment.label}${tire.unsafe ? " • Unsafe" : ""}`}
                onClick={() => editableDiagram && setSelectedTirePosition(position)}
                style={{
                  ...getTireIndicatorButtonStyle(position, selected, editableDiagram),
                  top,
                  left,
                  right,
                }}
              >
                <span style={{ fontSize: 11, letterSpacing: 0.4 }}>{TIRE_POSITION_SHORT_LABELS[position]}</span>
                <span style={{ fontSize: 11, lineHeight: 1.1 }}>{tire.treadDepthMm.trim() ? `${tire.treadDepthMm.trim()} mm` : "--"}</span>
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: treadAssessment.border,
                  boxShadow: tire.unsafe ? `0 0 0 4px ${treadAssessment.border}33` : "none",
                }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* =========================
     VIEWS
  ========================= */


  const DashboardView = () => (
    <div>
      <h2 style={styles.heading}>Owner Dashboard + Business Intelligence</h2>

      <div style={styles.statsGrid}>
        <MetricCard title="Total RO" value={dashboardStats.totalRO} />
        <MetricCard title="Waiting Inspection" value={dashboardStats.waitingInspection} />
        <MetricCard title="Waiting Approval" value={dashboardStats.waitingApproval} />
        <MetricCard title="Ready to Work" value={dashboardStats.readyToWork} />
        <MetricCard title="In Progress" value={dashboardStats.inProgress} />
        <MetricCard title="Waiting Parts" value={dashboardStats.waitingParts} />
        <MetricCard title="Quality Check" value={dashboardStats.qualityCheck} />
        <MetricCard title="Ready Release" value={dashboardStats.readyRelease} />
        <MetricCard title="Released" value={dashboardStats.released} />
        <MetricCard title="Closed" value={dashboardStats.closed} />
        <MetricCard title="Return Jobs" value={dashboardStats.returnJobs} />
        <MetricCard title="Low Stock Items" value={inventoryAlerts.length} />
      </div>

      <div style={{ ...styles.statsGrid, marginTop: 14 }}>
        <MoneyCard title="Daily Revenue" value={dailyRevenue} />
        <MoneyCard title="Weekly Revenue" value={weeklyRevenue} />
        <MoneyCard title="Monthly Revenue" value={monthlyRevenue} />
        <MoneyCard title="Net Sales less Tires" value={salesCurrentMonthSummary.totalNetSalesLessTires} />
        <MoneyCard title="Open Receivables" value={openReceivables} />
        <MetricCard title="Comeback Rate %" value={comebackRate} />
        <MetricCard title="Jobs Today" value={dailySnapshot.jobsToday} />
        <MetricCard title="Released Today" value={dailySnapshot.releasedToday} />
        <MetricCard title="Pending Approvals Today" value={dailySnapshot.pendingApprovals} />
      </div>

      <div style={{ ...styles.summaryGrid, marginTop: 16 }}>
        {sevenDayRevenue.map((day) => (
          <div key={day.label} style={styles.metricMini}>
            <div style={styles.mutedLabel}>{day.label}</div>
            <strong>₱{day.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>

      <div style={{ ...styles.shopGrid, marginTop: 16 }}>
        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Operational Pipeline</div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={styles.shopMiniRow}><span>Open</span><strong>{statusPipeline.open}</strong></div>
            <div style={styles.shopMiniRow}><span>In Progress</span><strong>{statusPipeline.inProgress}</strong></div>
            <div style={styles.shopMiniRow}><span>Waiting Parts</span><strong>{statusPipeline.waitingParts}</strong></div>
            <div style={styles.shopMiniRow}><span>Quality Check</span><strong>{statusPipeline.qc}</strong></div>
            <div style={styles.shopMiniRow}><span>Completed</span><strong>{statusPipeline.completed}</strong></div>
            <div style={styles.shopMiniRow}><span>Ready Release</span><strong>{statusPipeline.readyRelease}</strong></div>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Revenue Mix This Month</div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={styles.shopMiniRow}>
              <span>Labor Revenue</span>
              <strong>₱{round2(monthRevenueBreakdown.labor).toLocaleString()}</strong>
            </div>
            <div style={styles.shopMiniRow}>
              <span>Parts Revenue</span>
              <strong>₱{round2(monthRevenueBreakdown.parts).toLocaleString()}</strong>
            </div>
            <div style={styles.shopMiniRow}>
              <span>Average RO Value</span>
              <strong>₱{avgROValue.toLocaleString()}</strong>
            </div>
            <div style={styles.shopMiniRow}>
              <span>Open Receivables</span>
              <strong>₱{openReceivables.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Technician Summary</div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={styles.shopMiniRow}><span>Clocked In</span><strong>{technicianSummary.activeTechs}</strong></div>
            <div style={styles.shopMiniRow}><span>Actively Working</span><strong>{technicianSummary.workingTechs}</strong></div>
            <div style={styles.shopMiniRow}><span>Total Billed Hours</span><strong>{technicianSummary.totalBilledHours}</strong></div>
            <div style={styles.shopMiniRow}><span>Total Actual Hours</span><strong>{technicianSummary.totalActualHours}</strong></div>
            <div style={styles.shopMiniRow}><span>Completed Lines</span><strong>{technicianSummary.totalCompleted}</strong></div>
            <div style={styles.shopMiniRow}><span>Average Efficiency</span><strong>{technicianSummary.avgEfficiency}%</strong></div>
          </div>
        </div>
      </div>

      <div style={{ ...styles.shopGrid, marginTop: 16 }}>
        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Top Technicians</div>
          <div style={{ display: "grid", gap: 8 }}>
            {technicianLeaderboard.slice(0, 5).map((tech, index) => (
              <div key={tech.id} style={styles.logRow}>
                <div style={styles.rowBetween}>
                  <div style={{ fontWeight: 700 }}>#{index + 1} {tech.name}</div>
                  <span style={styles.badgeBlue}>{tech.rankingScore} score</span>
                </div>
                <div style={{ marginTop: 6, display: "grid", gap: 4, fontSize: 13, color: "#374151" }}>
                  <div>Efficiency: {tech.efficiency}%</div>
                  <div>Completed Lines: {tech.completedLines}</div>
                  <div>Active Jobs: {tech.active}</div>
                  <div>Comebacks: {tech.comebacks}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Stuck Jobs / Bottlenecks</div>
          <div style={{ display: "grid", gap: 8 }}>
            {stuckJobs.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No stuck jobs detected.</div>
            ) : (
              stuckJobs.map((ro) => (
                <div key={ro.id} style={styles.logRow}>
                  <div style={styles.rowBetween}>
                    <div style={{ fontWeight: 700 }}>{ro.roNumber}</div>
                    <span style={getROBadgeStyle(ro.status)}>{ro.status}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: "#374151" }}>
                    {ro.customer || "No Customer"} • {ro.vehicle || "No Vehicle"} • {ro.bay}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: "#6b7280" }}>
                    Age: {formatDuration(ro.createdAt)} • Priority: {ro.priority}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Pending Payment / Release</div>
          <div style={{ display: "grid", gap: 8 }}>
            {pendingInvoiceRos.slice(0, 6).map((ro) => {
              const financials = getROFinancials(ro);
              return (
                <div key={ro.id} style={styles.logRow}>
                  <div style={styles.rowBetween}>
                    <div style={{ fontWeight: 700 }}>{ro.roNumber}</div>
                    <span style={styles.badgeWarn}>₱{financials.balance.toLocaleString()} balance</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: "#374151" }}>
                    Invoice: {ro.invoiceStatus} • Release: {ro.releaseStatus}
                  </div>
                </div>
              );
            })}
            {pendingInvoiceRos.length === 0 && <div style={{ color: "#6b7280" }}>All invoices settled and released.</div>}
          </div>
        </div>
      </div>

      <div style={{ ...styles.shopGrid, marginTop: 16 }}>
        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Top Services</div>
          <div style={{ display: "grid", gap: 8 }}>
            {topServiceCategories.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No service trend data yet.</div>
            ) : (
              topServiceCategories.map(([category, count]) => (
                <div key={category} style={styles.shopMiniRow}>
                  <span>{category}</span>
                  <strong>{count} lines</strong>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>High Value Jobs</div>
          <div style={{ display: "grid", gap: 8 }}>
            {highValueRos.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No repair orders yet.</div>
            ) : (
              highValueRos.map(({ ro, total }) => (
                <div key={ro.id} style={styles.logRow}>
                  <div style={styles.rowBetween}>
                    <div style={{ fontWeight: 700 }}>{ro.roNumber}</div>
                    <span style={styles.badgeGood}>₱{total.toLocaleString()}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: "#374151" }}>
                    {ro.customer || "No Customer"} • {ro.vehicle || "No Vehicle"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Return Job Hotspots</div>
          <div style={{ display: "grid", gap: 8 }}>
            {Object.entries(returnIntelligence.byCategory).length === 0 ? (
              <div style={{ color: "#6b7280" }}>No return-job trends yet.</div>
            ) : (
              Object.entries(returnIntelligence.byCategory).map(([cat, count]) => (
                <div key={cat} style={styles.shopMiniRow}>
                  <span>{cat}</span>
                  <span>{count} comebacks</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ ...styles.shopGrid, marginTop: 16 }}>
        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Phase 16A Integration Center</div>
          <div style={{ color: "#6b7280", marginBottom: 12 }}>
            Frontend-real integrations for Android SMS gateway, file uploads saved in-app, and email compose flow.
          </div>

          <div style={{ fontWeight: 600, marginBottom: 8 }}>SMS Gateway</div>
          <div style={styles.formGrid}>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={smsGatewaySettings.enabled}
                onChange={(e) => setSmsGatewaySettings((prev) => ({ ...prev, enabled: e.target.checked }))}
              />
              <span>Enable SMS gateway</span>
            </label>
            <input
              style={styles.input}
              placeholder="Gateway Endpoint URL"
              value={smsGatewaySettings.endpoint}
              onChange={(e) => setSmsGatewaySettings((prev) => ({ ...prev, endpoint: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Gateway API Key"
              value={smsGatewaySettings.apiKey}
              onChange={(e) => setSmsGatewaySettings((prev) => ({ ...prev, apiKey: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Device Name"
              value={smsGatewaySettings.deviceName}
              onChange={(e) => setSmsGatewaySettings((prev) => ({ ...prev, deviceName: e.target.value }))}
            />
          </div>
          <div style={{ ...styles.wrapRow, marginTop: 10 }}>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={smsGatewaySettings.useClipboardFallback}
                onChange={(e) => setSmsGatewaySettings((prev) => ({ ...prev, useClipboardFallback: e.target.checked }))}
              />
              <span>Clipboard fallback</span>
            </label>
            <button style={styles.secondaryButton} onClick={() => void testSmsGatewayConnection()}>
              <MessageSquare size={14} /> Test SMS Gateway
            </button>
          </div>

          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Email Flow</div>
          <div style={{ color: "#374151", fontSize: 14 }}>
            Customer Summary currently uses a real email compose flow with <strong>mailto:</strong>. Clicking
            <strong> Send via Email</strong> opens the user’s email client with a prefilled subject and body.
          </div>

          <div style={{ fontWeight: 600, marginTop: 16, marginBottom: 8 }}>File Uploads</div>
          <div style={{ color: "#374151", fontSize: 14 }}>
            Inspection photos, workline photos, and parts photos now support real file selection and are stored directly
            in the app as data URLs for local use.
          </div>
        </div>
      </div>

      <div style={{ ...styles.shopGrid, marginTop: 16 }}>
        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Auto-Save + Recovery</div>
          <div style={{ color: "#6b7280", marginBottom: 10 }}>
            Draft forms now save automatically and recover after refresh or crash.
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={styles.shopMiniRow}><span>Inspection Draft</span><strong>{inspectionForm.plate || "Empty"}</strong></div>
            <div style={styles.shopMiniRow}><span>Last Auto-Save</span><strong>{lastAutoSavedAt ? new Date(lastAutoSavedAt).toLocaleTimeString() : "Not yet"}</strong></div>
            <div style={styles.shopMiniRow}><span>Recovery State</span><strong>{draftBanner ? "Recovered / Active" : "Normal"}</strong></div>
          </div>
          <div style={{ ...styles.wrapRow, marginTop: 10 }}>
            <button style={styles.secondaryButton} onClick={exportSystemBackup}>Export Backup</button>
            <button style={styles.secondaryButton} onClick={clearDraftRecovery}>Clear Drafts</button>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Manager Alerts</div>
          <div style={{ display: "grid", gap: 8 }}>
            {managerAlerts.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No alerts right now.</div>
            ) : (
              managerAlerts.map((alert) => (
                <div key={alert.id} style={styles.logRow}>
                  <div style={styles.rowBetween}>
                    <div style={{ fontWeight: 600 }}>{alert.roNumber}</div>
                    <span style={alert.level === "critical" ? styles.badgeDanger : styles.badgeWarn}>
                      {alert.level}
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>{alert.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );



  const VehicleIntakeView = () => {
  const suggestedMunicipalities = getMunicipalitySuggestions(inspectionForm.municipalityGroup || "", inspectionForm.customerMunicipality || "");
  const intakeValidation = getVehicleIntakeValidation(inspectionForm);
    const suggestedMakes = filterVehicleMakes(vehicleCatalog, inspectionForm.vehicleMake).slice(0, 10);
    const suggestedModels = filterVehicleModels(
      vehicleCatalog,
      inspectionForm.vehicleMake,
      inspectionForm.vehicleModel,
      inspectionForm.vehicleYear,
    ).slice(0, 12);
    const suggestedTowns = getSuggestedMunicipalities(inspectionForm.region, inspectionForm.municipality).slice(0, 12);
    const tireInspectionSummary = getTireInspectionSummary(safeTireInspection);
    const requiredArrivalAttentionCount = (Object.keys(inspectionForm.arrivalChecks) as ArrivalCheckKey[]).filter(
      (key) => inspectionForm.arrivalChecks[key].status === "Needs Attention",
    ).length;
    const requiredReady =
      !!inspectionForm.plate.trim() &&
      !!inspectionForm.vehicleYear.trim() &&
      !!inspectionForm.vehicleMake.trim() &&
      !!inspectionForm.vehicleModel.trim() &&
      !!inspectionForm.odometer.trim() &&
      !!inspectionForm.fuelType &&
      !!inspectionForm.transmissionType &&
      !!inspectionForm.customerPhone.trim();

    return (
      <div>
        {isCompact && (
          <div style={{ ...styles.cardBlock, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Mobile / Tablet Tips</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>Fields are now arranged to stack better on smaller screens. Complete required intake fields first, then proceed to Inspection.</div>
          </div>
        )}
        <div style={styles.rowBetween}>
          <div>
            <h2 style={styles.heading}>Vehicle Intake</h2>
            <div style={{ color: "#6b7280", marginTop: -8 }}>
              Complete the required vehicle details here first. Service advisors can finish the rest later.
            </div>
          </div>
          <div style={styles.wrapRow}>
            {editingVehicleIntakeRoId ? (
              <>
                <button style={styles.secondaryButton} onClick={cancelVehicleIntakeEdit}>
                  Cancel Edit Mode
                </button>
                <button style={styles.primaryButton} onClick={saveVehicleIntakeEdit}>
                  Save Vehicle Intake Changes
                </button>
              </>
            ) : (
              <button style={styles.primaryButton} onClick={() => setView("inspection")}>
                Continue to Inspection
              </button>
            )}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Required Vehicle Details</div>
            <div style={styles.wrapRow}>
              {editingVehicleIntakeRoId ? <span style={styles.badgePurple}>Edit Mode Active</span> : <span style={styles.badgeBlue}>New Intake</span>}
              <span style={styles.badgeMuted}>Rules: {MODULE_BEHAVIOR_RULES.vehicleIntake.allowInlineEdit ? "Editable" : "Locked"} • Lookup {MODULE_BEHAVIOR_RULES.vehicleIntake.supportsLookup ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
          <div style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Plate Number *"
              autoFocus
              value={inspectionForm.plate}
              onChange={(e) => setInspectionForm((p) => ({ ...p, plate: e.target.value.toUpperCase() }))}
            />
            <input
              style={styles.input}
              placeholder="Year *"
              value={inspectionForm.vehicleYear}
              onChange={(e) => setInspectionForm((p) => ({ ...p, vehicleYear: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Make *"
              list="vehicle-intake-make-options"
              value={inspectionForm.vehicleMake}
              onChange={(e) => applyInspectionMake(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Model *"
              list="vehicle-intake-model-options"
              value={inspectionForm.vehicleModel}
              onChange={(e) => setInspectionForm((p) => ({ ...p, vehicleModel: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Odometer *"
              value={inspectionForm.odometer}
              onChange={(e) => setInspectionForm((p) => ({ ...p, odometer: e.target.value }))}
            />
            <select
              style={styles.input}
              value={inspectionForm.fuelType}
              onChange={(e) => setInspectionForm((p) => ({ ...p, fuelType: e.target.value as FuelType | "" }))}
            >
              <option value="">Fuel Type *</option>
              {["Gasoline", "Diesel", "Hybrid", "Electric", "LPG", "Other"].map((fuel) => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>
            <select
              style={styles.input}
              value={inspectionForm.transmissionType}
              onChange={(e) => setInspectionForm((p) => ({ ...p, transmissionType: e.target.value as TransmissionType | "" }))}
            >
              <option value="">Transmission Type *</option>
              {["MT", "AT", "CVT", "DCT", "Other"].map((transmission) => (
                <option key={transmission} value={transmission}>{transmission}</option>
              ))}
            </select>
            <input
              style={styles.input}
              placeholder="Phone Number *"
              value={inspectionForm.customerPhone}
              onChange={(e) => setInspectionForm((p) => ({ ...p, customerPhone: e.target.value }))}
            />
          </div>

          <datalist id="vehicle-intake-make-options">
            {suggestedMakes.map((entry) => <option key={entry.make} value={entry.make} />)}
          </datalist>
          <datalist id="vehicle-intake-model-options">
            {suggestedModels.map((model) => <option key={model} value={model} />)}
          </datalist>

          <div style={{ ...styles.shopGrid, marginTop: 14 }}>
            <div style={styles.innerBlock}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Suggested Makes</div>
              <div style={styles.wrapRow}>
                {suggestedMakes.map((entry) => (
                  <button
                    key={entry.make}
                    type="button"
                    style={inspectionForm.vehicleMake.trim().toLowerCase() === entry.make.toLowerCase() ? styles.primaryButton : styles.secondaryButton}
                    onClick={() => applyInspectionMake(entry.make)}
                  >
                    {entry.make}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.innerBlock}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Suggested Models</div>
              <div style={styles.wrapRow}>
                {suggestedModels.map((model) => (
                  <button
                    key={model}
                    type="button"
                    style={inspectionForm.vehicleModel.trim().toLowerCase() === model.toLowerCase() ? styles.primaryButton : styles.secondaryButton}
                    onClick={() => applyInspectionModel(model)}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, ...styles.summaryRow }}>
            <span style={requiredReady ? styles.badgeGood : styles.badgeWarn}>
              {requiredReady ? "Required intake complete" : "Missing required intake fields"}
            </span>
            <span style={styles.badgeBlue}>Preview: {buildInspectionVehicleLabel(inspectionForm) || "No vehicle yet"}</span>
          </div>

          <div style={{ ...styles.shopGrid, marginTop: 14 }}>
            <div style={styles.innerBlock}>
              <div style={styles.rowBetween}>
                <div style={{ fontWeight: 700 }}>Plate Lookup</div>
                <span style={styles.badgeMuted}>{plateLookupMatches.length} match{plateLookupMatches.length === 1 ? "" : "es"}</span>
              </div>
              <div style={{ color: "#6b7280", fontSize: 13, margin: "6px 0 10px" }}>Type a plate number to pull the latest vehicle and service history into intake without losing focus.</div>
              <div style={{ display: "grid", gap: 8 }}>
                {plateLookupMatches.length ? plateLookupMatches.map((ro) => (
                  <div key={`plate-${ro.id}`} style={styles.lookupCard}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{ro.plate || "No Plate"} • {ro.vehicle || "No Vehicle"}</div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>{ro.roNumber} • {ro.customer || "No Customer"} • {new Date(ro.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={styles.wrapRow}>
                      <button type="button" style={styles.secondaryButton} onClick={() => applyLookupRecordToIntake(ro, "fill")}>Use Record</button>
                      <button type="button" style={styles.secondaryButton} onClick={() => startVehicleIntakeEditFromRO(ro.id)}>Edit Existing</button>
                    </div>
                  </div>
                )) : <div style={{ color: "#6b7280", fontSize: 13 }}>No plate matches yet.</div>}
              </div>
            </div>

            <div style={styles.innerBlock}>
              <div style={styles.rowBetween}>
                <div style={{ fontWeight: 700 }}>Customer Lookup</div>
                <span style={styles.badgeMuted}>{customerLookupMatches.length} match{customerLookupMatches.length === 1 ? "" : "es"}</span>
              </div>
              <div style={{ color: "#6b7280", fontSize: 13, margin: "6px 0 10px" }}>Search by name or phone to pull previous customer details and linked vehicles.</div>
              <div style={{ display: "grid", gap: 8 }}>
                {customerLookupMatches.length ? customerLookupMatches.map((ro) => (
                  <div key={`customer-${ro.id}`} style={styles.lookupCard}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{ro.customer || "No Customer"}</div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>{ro.customerPhone || "No Phone"} • {ro.plate || "No Plate"} • {ro.vehicle || "No Vehicle"}</div>
                    </div>
                    <div style={styles.wrapRow}>
                      <button type="button" style={styles.secondaryButton} onClick={() => applyLookupRecordToIntake(ro, "fill")}>Use Record</button>
                      <button type="button" style={styles.secondaryButton} onClick={() => startVehicleIntakeEditFromRO(ro.id)}>Edit Existing</button>
                    </div>
                  </div>
                )) : <div style={{ color: "#6b7280", fontSize: 13 }}>No customer matches yet.</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Customer Details (can be completed later by Service Advisors)</div>
          <div style={styles.formGrid}>
          <select
            style={styles.input}
            value={inspectionForm.customerType || "Person"}
            onChange={(e) =>
              setInspectionForm((p) => ({
                ...p,
                customerType: e.target.value as "Person" | "Company",
              }))
            }
          >
            <option value="Person">Person</option>
            <option value="Company">Company</option>
          </select>

          {inspectionForm.customerType === "Company" ? (
            <input
              style={styles.input}
              placeholder="Company Name"
              value={inspectionForm.companyName || ""}
              onChange={(e) => setInspectionForm((p) => ({ ...p, companyName: e.target.value, customer: e.target.value }))}
            />
          ) : (
            <>
              <input
                style={styles.input}
                placeholder="Last Name"
                value={inspectionForm.customerLastName || ""}
                onChange={(e) => setInspectionForm((p) => ({ ...p, customerLastName: e.target.value }))}
              />
              <input
                style={styles.input}
                placeholder="First Name"
                value={inspectionForm.customerFirstName || ""}
                onChange={(e) => setInspectionForm((p) => ({ ...p, customerFirstName: e.target.value }))}
              />
            </>
          )}

          <input
            style={styles.input}
            placeholder="Phone Number *"
            value={inspectionForm.customerPhone}
            onChange={(e) => setInspectionForm((p) => ({ ...p, customerPhone: e.target.value }))}
          />

          <div style={{ ...styles.input, display: "flex", alignItems: "center", color: "#6b7280" }}>
            Fill either Company Name or both First Name and Last Name.
          </div>

          <div style={{ ...styles.input, display: "flex", alignItems: "center", color: "#6b7280" }}>
            Choose Ilocos Sur or Abra to get municipality suggestions, or type any municipality manually.
          </div>

          <input
            style={styles.input}
            placeholder="Email Address (optional)"
            value={inspectionForm.customerEmail || ""}
            onChange={(e) => setInspectionForm((p) => ({ ...p, customerEmail: e.target.value }))}
          />


          <select
            style={styles.input}
            value={inspectionForm.municipalityGroup || ""}
            onChange={(e) =>
              setInspectionForm((p) => ({
                ...p,
                municipalityGroup: e.target.value as "Ilocos Sur" | "Abra" | "",
                customerMunicipality: "",
              }))
            }
          >
            <option value="">Select Province Group (optional)</option>
            <option value="Ilocos Sur">Ilocos Sur</option>
            <option value="Abra">Abra</option>
          </select>

          <input
            style={styles.input}
            list="municipality-options"
            placeholder="Municipality / Town *"
            value={inspectionForm.customerMunicipality || ""}
            onChange={(e) => setInspectionForm((p) => ({ ...p, customerMunicipality: e.target.value }))}
          />

          <datalist id="municipality-options">
            {suggestedMunicipalities.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div style={styles.innerBlock}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Suggested Towns / Municipalities</div>
          <div style={styles.wrapRow}>
            {suggestedMunicipalities.length > 0 ? suggestedMunicipalities.map((town) => (
              <button
                key={town}
                type="button"
                style={inspectionForm.customerMunicipality === town ? styles.primaryButton : styles.secondaryButton}
                onClick={() => setInspectionForm((p) => ({ ...p, customerMunicipality: town }))}
              >
                {town}
              </button>
            )) : <span style={styles.badgeMuted}>Choose Ilocos Sur or Abra first, or type a custom town.</span>}
          </div>
        </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Initial Exterior Photos</div>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {inspectionForm.initialExteriorPhotos.length === 0 && (
              <div style={{ color: "#6b7280" }}>No exterior photos yet.</div>
            )}
            {inspectionForm.initialExteriorPhotos.map((photo) => (
              <div key={photo.id} style={styles.innerBlock}>
                <div style={styles.formGrid}>
                  <input style={styles.input} placeholder="Photo label" value={photo.label} onChange={(e) => updateInitialExteriorPhoto(photo.id, "label", e.target.value)} />
                  <input style={styles.input} type="file" accept="image/*" onChange={(e) => void uploadInitialExteriorPhotoFile(photo.id, e.target.files?.[0])} />
                  <input style={styles.input} placeholder="Photo URL or paste image link" value={photo.url.startsWith("data:") ? "" : photo.url} onChange={(e) => updateInitialExteriorPhoto(photo.id, "url", e.target.value)} />
                </div>
                {photo.url && (
                  <div style={{ marginTop: 10 }}>
                    <div style={styles.photoPreviewWrap}>
                      <img src={photo.url} alt={photo.label || "Exterior photo"} style={styles.photoPreview} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ ...styles.wrapRow, marginTop: 10 }}>
            <button style={styles.secondaryButton} onClick={addInitialExteriorPhoto}>
              <Camera size={14} /> Add Exterior Photo
            </button>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Arrival Inspection Checks</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Quick condition checks captured during intake before the tire inspection.
              </div>
            </div>
            <span style={requiredArrivalAttentionCount > 0 ? styles.badgeWarn : styles.badgeGood}>
              {requiredArrivalAttentionCount > 0 ? `${requiredArrivalAttentionCount} Need Attention` : "No Arrival Flags"}
            </span>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {(["lights", "brokenGlass", "wipers", "hornCondition"] as ArrivalCheckKey[]).map((key) => {
              const needsAttention = inspectionForm.arrivalChecks[key].status === "Needs Attention";
              return (
                <div key={key} style={{ ...styles.innerBlock, border: needsAttention ? "1px solid #f59e0b" : "1px solid #e2e8f0" }}>
                  <div style={styles.formGrid}>
                    <input style={styles.input} value={renderArrivalCheckLabel(key)} disabled />
                    <select style={styles.input} value={inspectionForm.arrivalChecks[key].status} onChange={(e) => updateArrivalCheck(key, "status", e.target.value)}>
                      {["Not Checked", "OK", "Needs Attention"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <input style={styles.input} placeholder="Short note" value={inspectionForm.arrivalChecks[key].note} onChange={(e) => updateArrivalCheck(key, "note", e.target.value)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Take Notes</div>
          <div style={{ display: "grid", gap: 10 }}>
            {inspectionForm.takeNotes.map((item) => (
              <div key={item.id} style={styles.innerBlock}>
                <div style={styles.formGrid}>
                  <input style={styles.input} placeholder="Title" value={item.title} onChange={(e) => updateTakeNote(item.id, "title", e.target.value)} />
                  <input style={styles.input} type="file" accept="image/*" onChange={(e) => void uploadTakeNotePhotoFile(item.id, e.target.files?.[0])} />
                  <input style={styles.input} placeholder="Photo URL or paste image link" value={item.photoUrl.startsWith("data:") ? "" : item.photoUrl} onChange={(e) => updateTakeNote(item.id, "photoUrl", e.target.value)} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <TextArea label="Note" value={item.note} onChange={(value) => updateTakeNote(item.id, "note", value)} />
                </div>
                {item.photoUrl && (
                  <div style={{ marginTop: 10 }}>
                    <div style={styles.photoPreviewWrap}>
                      <img src={item.photoUrl} alt={item.title || "Take note photo"} style={styles.photoPreview} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Tire Wear Inspection</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Uses your tread chart: 6 mm and above = Good, 4–5 mm = OK, 3 mm = Inspect Monthly, 2 mm = Won’t Last Long, 1.66 mm = Legal Limit.
              </div>
            </div>
            <div style={styles.wrapRow}>
              <span style={tireInspectionSummary.unsafeCount > 0 ? styles.badgeDanger : styles.badgeGood}>
                {tireInspectionSummary.unsafeCount > 0 ? `${tireInspectionSummary.unsafeCount} Unsafe Tire${tireInspectionSummary.unsafeCount > 1 ? "s" : ""}` : "No Unsafe Tire Flag"}
              </span>
              <span style={tireInspectionSummary.legalLimitCount > 0 ? styles.badgeDanger : styles.badgeBlue}>
                {tireInspectionSummary.legalLimitCount > 0 ? `${tireInspectionSummary.legalLimitCount} at Legal Limit` : `${tireInspectionSummary.measuredCount}/4 Depths Entered`}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {renderTireVehicleDiagram(true)}
            {([selectedTirePosition, ...(Object.keys(TIRE_POSITION_LABELS) as TirePosition[]).filter((position) => position !== selectedTirePosition)])
              .map((position) => {
              const tire = safeTireInspection[position];
              const treadAssessment = getTreadDepthAssessment(tire.treadDepthMm);
              const isSelectedTire = selectedTirePosition === position;
              return (
                <div
                  key={position}
                  style={{
                    ...styles.innerBlock,
                    background: treadAssessment.background,
                    border: `2px solid ${isSelectedTire ? treadAssessment.border : treadAssessment.border}`,
                    boxShadow: isSelectedTire ? `0 0 0 3px ${treadAssessment.border}22` : "none",
                  }}
                >
                  <div style={styles.rowBetween}>
                    <div style={{ fontWeight: 800, color: treadAssessment.text }}>
                      {TIRE_POSITION_LABELS[position]} {isSelectedTire ? "• Selected from diagram" : ""}
                    </div>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => setSelectedTirePosition(position)}
                    >
                      Focus on {TIRE_POSITION_SHORT_LABELS[position]}
                    </button>
                  </div>
                  <div style={{ ...styles.formGrid, marginTop: 10 }}>
                    <input style={{ ...styles.input, fontWeight: 700, color: treadAssessment.text, background: "rgba(255,255,255,0.72)" }} value={TIRE_POSITION_LABELS[position]} disabled />
                    <select
                      style={{ ...styles.input, background: "rgba(255,255,255,0.88)" }}
                      value={tire.condition}
                      onChange={(e) => updateTireInspection(position, { condition: e.target.value as TireCondition })}
                    >
                      {["Good", "Uneven Wear", "Worn", "Bald"].map((condition) => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                    <input style={{ ...styles.input, background: "rgba(255,255,255,0.88)" }} placeholder="Tread Depth (mm)" value={tire.treadDepthMm} onChange={(e) => updateTireInspection(position, { treadDepthMm: e.target.value })} />
                  </div>
                  <div style={{ ...styles.summaryRow, marginTop: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: treadAssessment.background, color: treadAssessment.text, border: `1px solid ${treadAssessment.border}` }}>{treadAssessment.label}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.72)", color: "#111827", border: "1px solid rgba(255,255,255,0.7)" }}>{tire.treadDepthMm.trim() ? `${tire.treadDepthMm.trim()} mm` : "Depth not entered"}</span>
                    {tire.unsafe ? <span style={styles.badgeDanger}>Unsafe</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const InspectionView = () => {
    const tireInspectionSummary = getTireInspectionSummary(safeTireInspection);
    const safeUnderHoodInspection = ensureUnderHoodInspectionMap(inspectionForm.underHoodInspection);
    const underHoodSummary = getUnderHoodInspectionSummary(safeUnderHoodInspection);
    const selectedIssues = INSPECTION_ISSUES.filter((issue) => inspectionForm.issues[issue.key]);
    const serviceMileagePlan = getServiceRecommendationForOdometer(inspectionForm.odometer);
    const dueServiceItems = Object.entries(serviceMileagePlan.row.items).filter(([, value]) => value !== "—");
    const arrivalAttentionCount = (Object.keys(inspectionForm.arrivalChecks) as ArrivalCheckKey[]).filter(
      (key) => inspectionForm.arrivalChecks[key].status === "Needs Attention",
    ).length;
    const intakeComplete =
      !!inspectionForm.plate.trim() &&
      !!inspectionForm.vehicleYear.trim() &&
      !!inspectionForm.vehicleMake.trim() &&
      !!inspectionForm.vehicleModel.trim() &&
      !!inspectionForm.odometer.trim() &&
      !!inspectionForm.fuelType &&
      !!inspectionForm.transmissionType &&
      !!inspectionForm.customerPhone.trim();

    return (
      <div>
        <div style={styles.rowBetween}>
          <div>
            <h2 style={styles.heading}>Inspection</h2>
            <div style={{ color: "#6b7280", marginTop: -8 }}>
              Stable inspection workflow with intake summary, mileage-based service recommendations, under-the-hood review, tire visibility, and quick service selection.
            </div>
          </div>
          <div style={styles.wrapRow}>
            <button
              style={styles.secondaryButton}
              onClick={() => {
                if (editingVehicleIntakeRoId) {
                  setView("vehicleIntake");
                  return;
                }
                const draftRo = ros.find((ro) => ro.plate === inspectionForm.plate && ro.customerPhone === inspectionForm.customerPhone) || ros.find((ro) => ro.id === editingVehicleIntakeRoId);
                if (draftRo) {
                  startVehicleIntakeEditFromRO(draftRo.id);
                } else {
                  setView("vehicleIntake");
                }
              }}
            >
              Edit Vehicle Intake
            </button>
            <button style={styles.primaryButton} onClick={createROFromInspection}>
              Generate RO from Inspection
            </button>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Inspection Readiness</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Review the intake, tire condition, arrival checks, and selected diagnostics before generating the RO.
              </div>
            </div>
            <span style={intakeComplete ? styles.badgeGood : styles.badgeWarn}>
              {intakeComplete ? "Intake Complete" : "Intake Incomplete"}
            </span>
          </div>

          <div style={{ ...styles.summaryGrid, marginTop: 12 }}>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Plate</div><strong>{inspectionForm.plate || "-"}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Vehicle</div><strong>{buildInspectionVehicleLabel(inspectionForm) || "-"}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Odometer</div><strong>{inspectionForm.odometer || "-"}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Fuel / Trans</div><strong>{inspectionForm.fuelType || "-"} • {inspectionForm.transmissionType || "-"}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Phone</div><strong>{inspectionForm.customerPhone || "-"}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Bay / Priority</div><strong>{inspectionForm.bay} • {inspectionForm.priority}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Arrival Flags</div><strong>{arrivalAttentionCount}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Quick Service Categories</div><strong>{selectedIssues.length}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Under-Hood Flags</div><strong>{underHoodSummary.needsAttention + underHoodSummary.urgent}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Unsafe Tires</div><strong>{tireInspectionSummary.unsafeCount}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Measured Tires</div><strong>{tireInspectionSummary.measuredCount}/4</strong></div>
          </div>

          {inspectionForm.serviceAdvisorNotes?.trim() ? (
            <div style={{ ...styles.innerBlock, marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Service Advisor Notes from Intake</div>
              <div style={{ color: "#374151", whiteSpace: "pre-wrap", fontSize: 14 }}>{inspectionForm.serviceAdvisorNotes}</div>
            </div>
          ) : null}
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Mileage-Based Service Recommendations</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Based on the current odometer, these are the recommended services to review during vehicle inspection.
              </div>
            </div>
            <div style={styles.wrapRow}>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => {
                  const recommendedIssues = mapServiceItemsToQuickCategories(serviceMileagePlan.row.items);
                  setInspectionForm((p) => ({
                    ...p,
                    issues: {
                      ...p.issues,
                      ...Object.fromEntries(recommendedIssues.map((key) => [key, true])),
                    } as InspectionSelection,
                    recommendationsSummary: recommendedIssues.length
                      ? `Mileage due at ${serviceMileagePlan.targetIntervalKm.toLocaleString()} km: ${recommendedIssues.map((key) => INSPECTION_ISSUE_SHORT_LABELS[key]).join(", ")}`
                      : p.recommendationsSummary,
                  }));
                }}
              >
                Apply Recommended Services
              </button>
              <span style={styles.badgeBlue}>Due at {serviceMileagePlan.targetIntervalKm.toLocaleString()} km</span>
              <span style={serviceMileagePlan.kmToNextInterval === 0 ? styles.badgeWarn : styles.badgeMuted}>
                {serviceMileagePlan.kmToNextInterval === 0
                  ? "Due Now"
                  : `${serviceMileagePlan.kmToNextInterval.toLocaleString()} km remaining`}
              </span>
              <span style={styles.badgeGood}>{serviceMileagePlan.row.fullInspectionLabel} Inspection</span>
            </div>
          </div>

          <div style={{ ...styles.summaryGrid, marginTop: 12 }}>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Current Odometer</div><strong>{serviceMileagePlan.odometerKm ? `${serviceMileagePlan.odometerKm.toLocaleString()} km` : "Add odometer first"}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Service Interval</div><strong>{serviceMileagePlan.targetIntervalKm.toLocaleString()} km</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Full Inspection</div><strong>{serviceMileagePlan.row.fullInspectionLabel}</strong></div>
            <div style={styles.metricMini}><div style={styles.mutedLabel}>Recommended Items</div><strong>{dueServiceItems.length}</strong></div>
          </div>

          <div style={{ ...styles.formGrid, marginTop: 12 }}>
            {dueServiceItems.map(([key, value]) => (
              <div key={key} style={{ ...styles.innerBlock, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{SERVICE_ITEM_LABELS[key as keyof ServiceRecommendationRow["items"]]}</div>
                <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 13 }}>{String(value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Under the Hood Inspection</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Always shown by default so technicians can review key under-hood items on every inspection.
              </div>
            </div>
            <div style={styles.wrapRow}>
              <span style={underHoodSummary.urgent > 0 ? styles.badgeDanger : styles.badgeGood}>
                {underHoodSummary.urgent > 0 ? `${underHoodSummary.urgent} Urgent` : "No Urgent Flags"}
              </span>
              <span style={underHoodSummary.needsAttention > 0 ? styles.badgeWarn : styles.badgeBlue}>
                {underHoodSummary.needsAttention > 0 ? `${underHoodSummary.needsAttention} Need Attention` : "All Under-Hood Items OK"}
              </span>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {(Object.keys(UNDER_HOOD_INSPECTION_LABELS) as UnderHoodInspectionKey[]).map((key) => {
              const item = safeUnderHoodInspection[key];
              const statusStyle = item.status === "Urgent" ? styles.badgeDanger : item.status === "Needs Attention" ? styles.badgeWarn : styles.badgeGood;
              const presetOptions = getUnderHoodNotePresets(key, item.status);
              const recommendedCategories = getUnderHoodRecommendedCategories(key, item.status);
              const noteChips = getUnderHoodNoteChips(item.note);
              return (
                <div key={key} style={{ ...styles.innerBlock, border: item.status === "Urgent" ? "1px solid #ef4444" : item.status === "Needs Attention" ? "1px solid #f59e0b" : "1px solid #e2e8f0" }}>
                  <div style={styles.formGrid}>
                    <input style={styles.input} value={UNDER_HOOD_INSPECTION_LABELS[key]} disabled />
                    <select
                      style={styles.input}
                      value={item.status}
                      onChange={(e) =>
                        setInspectionForm((p) => ({
                          ...p,
                          underHoodInspection: {
                            ...ensureUnderHoodInspectionMap(p.underHoodInspection),
                            [key]: { ...ensureUnderHoodInspectionMap(p.underHoodInspection)[key], status: e.target.value as UnderHoodInspectionStatus },
                          },
                        }))
                      }
                    >
                      {["OK", "Needs Attention", "Urgent"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <select
                      style={styles.input}
                      defaultValue=""
                      onChange={(e) => {
                        const selectedPreset = e.target.value;
                        applyUnderHoodPresetNote(key, selectedPreset);
                        e.target.selectedIndex = 0;
                      }}
                    >
                      <option value="">{UNDER_HOOD_INSPECTION_LABELS[key]} quick notes</option>
                      {presetOptions.map((preset) => (
                        <option key={preset} value={preset}>{preset}</option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        style={{ ...styles.input, flex: 1 }}
                        placeholder="Short note or manual input"
                        value={item.note}
                        onChange={(e) =>
                          setInspectionForm((p) => ({
                            ...p,
                            underHoodInspection: {
                              ...ensureUnderHoodInspectionMap(p.underHoodInspection),
                              [key]: { ...ensureUnderHoodInspectionMap(p.underHoodInspection)[key], note: e.target.value },
                            },
                          }))
                        }
                      />
                      <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={() => clearUnderHoodNote(key)}
                      >
                        Clear Note
                      </button>
                    </div>
                  </div>
                  <div style={{ ...styles.wrapRow, marginTop: 8 }}>
                    <span style={statusStyle}>{item.status}</span>
                    {recommendedCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        style={item.status === "Urgent" ? styles.primaryButton : styles.secondaryButton}
                        onClick={() => applyUnderHoodRecommendationLink(key, category)}
                      >
                        Recommend {INSPECTION_ISSUE_SHORT_LABELS[category]}
                      </button>
                    ))}
                  </div>
                  {noteChips.length > 0 ? (
                    <div style={{ ...styles.wrapRow, marginTop: 10 }}>
                      {noteChips.map((chip) => {
                        const isPresetChip = presetOptions.some((preset) => preset.toLowerCase() === chip.toLowerCase());
                        const chipStyle =
                          item.status === "Urgent"
                            ? {
                                background: isPresetChip ? "#fee2e2" : "#fff1f2",
                                color: "#991b1b",
                                border: "1px solid #fca5a5",
                              }
                            : item.status === "Needs Attention"
                            ? {
                                background: isPresetChip ? "#fef3c7" : "#fffbeb",
                                color: "#92400e",
                                border: "1px solid #fcd34d",
                              }
                            : {
                                background: isPresetChip ? "#dcfce7" : "#eff6ff",
                                color: isPresetChip ? "#166534" : "#1d4ed8",
                                border: isPresetChip ? "1px solid #86efac" : "1px solid #bfdbfe",
                              };
                        return (
                          <span
                            key={`${key}-${chip}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              ...chipStyle,
                            }}
                          >
                            {chip}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Tire Status from Vehicle Intake</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Visual tire condition stays read-only here so technicians can inspect without re-encoding the intake tire data.
              </div>
            </div>
            <div style={styles.wrapRow}>
              <span style={tireInspectionSummary.unsafeCount > 0 ? styles.badgeDanger : styles.badgeGood}>
                {tireInspectionSummary.unsafeCount > 0 ? `${tireInspectionSummary.unsafeCount} Unsafe Tire${tireInspectionSummary.unsafeCount > 1 ? "s" : ""}` : "No Unsafe Tire Flag"}
              </span>
              <span style={tireInspectionSummary.legalLimitCount > 0 ? styles.badgeDanger : styles.badgeBlue}>
                {tireInspectionSummary.legalLimitCount > 0 ? `${tireInspectionSummary.legalLimitCount} at Legal Limit` : `${tireInspectionSummary.measuredCount}/4 Depths Entered`}
              </span>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {renderTireVehicleDiagram(false)}
            <div style={{ display: "grid", gap: 10 }}>
              {(Object.keys(TIRE_POSITION_LABELS) as TirePosition[]).map((position) => {
                const tire = safeTireInspection[position];
                const treadAssessment = getTreadDepthAssessment(tire.treadDepthMm);
                return (
                  <div
                    key={position}
                    style={{
                      ...styles.shopMiniRow,
                      background: treadAssessment.background,
                      color: treadAssessment.text,
                      border: `1px solid ${treadAssessment.border}`,
                      borderRadius: 12,
                      padding: "10px 12px",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{TIRE_POSITION_LABELS[position]}</span>
                    <span>
                      {tire.condition} • {tire.treadDepthMm.trim() ? `${tire.treadDepthMm.trim()} mm` : "No depth"} • {treadAssessment.label}{tire.unsafe ? " • UNSAFE" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Quick Service Categories</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Tap quick service category buttons. Selected items will become work lines when you generate the RO.
              </div>
            </div>
            <div style={styles.wrapRow}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() =>
                  setInspectionForm((p) => ({
                    ...p,
                    issues: INSPECTION_ISSUES.reduce((acc, issue) => ({ ...acc, [issue.key]: false }), {} as InspectionSelection),
                  }))
                }
              >
                Clear All
              </button>
              <span style={selectedIssues.length > 0 ? styles.badgeGood : styles.badgeMuted}>
                {selectedIssues.length} Selected
              </span>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={styles.wrapRow}>
              {INSPECTION_ISSUES
                .slice()
                .sort((a, b) => Number(inspectionForm.issues[b.key]) - Number(inspectionForm.issues[a.key]))
                .map((issue) => {
                  const selected = inspectionForm.issues[issue.key];
                  return (
                    <button
                      key={issue.key}
                      type="button"
                      title={INSPECTION_ISSUE_DESCRIPTIONS[issue.key]}
                      onClick={() =>
                        setInspectionForm((p) => ({
                          ...p,
                          issues: { ...p.issues, [issue.key]: !p.issues[issue.key] },
                        }))
                      }
                      style={{
                        ...styles.secondaryButton,
                        color: selected ? "#166534" : "#0f172a",
                        border: selected ? "1px solid #86efac" : "1px solid #cbd5e1",
                        background: selected ? "#dcfce7" : "#ffffff",
                        fontWeight: 700,
                      }}
                    >
                      {INSPECTION_ISSUE_SHORT_LABELS[issue.key]}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const ApprovalView = () => (
    <div>
      <h2 style={styles.heading}>Approval + Estimate</h2>

      {ros.map((ro) => {
        const summary = estimateSummary.find((s) => s.roId === ro.id);

        return (
          <div key={ro.id} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700 }}>{ro.roNumber}</div>
                <div style={{ color: "#6b7280" }}>
                  {ro.customer || "No Customer"} • {ro.vehicle || "No Vehicle"}
                </div>
                {ro.isReturnJob && (
                  <div style={{ color: "#dc2626", fontWeight: 700, marginTop: 4 }}>
                    Return Job • {ro.returnReason || "No reason"}
                  </div>
                )}
              </div>
              <span style={getROBadgeStyle(ro.status)}>{ro.status}</span>
            </div>

            <div style={{ ...styles.summaryRow, marginTop: 12 }}>
              <span>Labor: ₱{summary?.labor.toLocaleString()}</span>
              <span>Parts: ₱{summary?.parts.toLocaleString()}</span>
              <strong>Total: ₱{summary?.total.toLocaleString()}</strong>
            </div>

            {ro.workLines.map((line) => (
              <div key={line.id} style={styles.innerBlock}>
                <div style={styles.rowBetween}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{line.label}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{line.category}</div>
                  </div>
                  <div style={styles.wrapRow}>
                    <span style={styles.badgeMuted}>{line.approvalStatus}</span>
                    <span style={line.partsSummary === "Waiting Parts" ? styles.badgeWarn : styles.badgeBlue}>
                      {line.partsSummary}
                    </span>
                    {isRepeatIssue(ro, line.category, ros) && (
                      <span style={styles.badgeDanger}>Repeat Issue</span>
                    )}
                  </div>
                </div>

                <div style={{ ...styles.formGrid, marginTop: 10 }}>
                  <input
                    style={styles.input}
                    type="number"
                    value={line.estimatedHours}
                    onChange={(e) =>
                      updateWorkLine(ro.id, line.id, {
                        estimatedHours: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="Estimated Hours"
                  />
                  <input
                    style={styles.input}
                    type="number"
                    value={line.laborRate}
                    onChange={(e) =>
                      updateWorkLine(ro.id, line.id, {
                        laborRate: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="Labor Rate"
                  />
                </div>

                <div style={{ ...styles.summaryRow, marginTop: 10 }}>
                  <span>Labor Cost: ₱{line.laborCost.toLocaleString()}</span>
                  <span>Parts Cost: ₱{line.partsCost.toLocaleString()}</span>
                  <strong>Estimate: ₱{line.estimateTotal.toLocaleString()}</strong>
                </div>

                <div style={{ ...styles.wrapRow, marginTop: 10 }}>
                  <button
                    style={styles.goodButton}
                    onClick={() =>
                      logCustomerDecision(ro.id, line.id, "Approved", "Customer approved full work line.")
                    }
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    style={styles.secondaryButton}
                    onClick={() =>
                      logCustomerDecision(
                        ro.id,
                        line.id,
                        "Partially Approved",
                        "Customer partially approved the work line.",
                      )
                    }
                  >
                    <FileText size={14} /> Partial
                  </button>
                  <button
                    style={styles.dangerButton}
                    onClick={() =>
                      logCustomerDecision(ro.id, line.id, "Declined", "Customer declined the work line.")
                    }
                  >
                    <XCircle size={14} /> Decline
                  </button>
                  <button
                    style={styles.secondaryButton}
                    onClick={() => sendSmsApproval(ro.id, line.id)}
                  >
                    <MessageSquare size={14} /> Send SMS
                  </button>
                  {line.smsApprovalStatus !== "Not Sent" && (
                    <span style={styles.badgeMuted}>SMS: {line.smsApprovalStatus}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );


  const ROView = () => (
    <div>
      <div style={styles.rowBetween}>
        <h2 style={styles.heading}>Repair Orders</h2>
        <div style={styles.wrapRow}>
          <button style={styles.secondaryButton} onClick={() => setView("backJob")}>Open Back Jobs</button>
          <button style={styles.primaryButton} onClick={createRO}>
            + Create Blank RO
          </button>
        </div>
      </div>

      {ros.map((ro) => {
        const roWarnings = getRoWarnings(ro);
        const isCollapsed = !!collapsedRos[ro.id];
        const readyCount = ro.workLines.filter((line) => ["Ready", "Approved"].includes(line.status)).length;
        const progressCount = ro.workLines.filter((line) => line.status === "In Progress").length;

        return (
          <div key={ro.id} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div style={{ display: "grid", gap: 8, flex: 1 }}>
                <div style={styles.wrapRow}>
                  <span style={styles.badgeDark}>{ro.roNumber}</span>
                  <span style={getROBadgeStyle(ro.status)}>{ro.status}</span>
                  <span style={getPriorityStyle(ro.priority)}>{ro.priority}</span>
                  {ro.isReturnJob && <span style={styles.badgeDanger}>Comeback</span>}
                  {ro.softLocked && (
                    <span style={styles.badgePurple}>
                      <Lock size={12} style={{ marginRight: 4 }} /> Released Lock
                    </span>
                  )}
                  <span style={styles.badgeMuted}>Ready: {readyCount}</span>
                  <span style={styles.badgeMuted}>Active: {progressCount}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{ro.customer || "No Customer"} • {ro.vehicle || "No Vehicle"} • {ro.plate || "No Plate"}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>Bay {ro.bay} • Odometer {ro.odometer || "-"} • Created {new Date(ro.createdAt).toLocaleString()}</div>
              </div>

              <div style={styles.wrapRow}>
                <button style={styles.secondaryButton} onClick={() => printRepairOrder(ro)}>
                  <Printer size={14} /> Print RO
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => toggleRoCollapsed(ro.id)}
                >
                  {isCollapsed ? "Expand" : "Collapse"}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={styles.primaryButton} onClick={() => startNextReadyLine(ro)}>
                <Play size={14} /> Start Next Work
              </button>
              <button style={styles.secondaryButton} onClick={() => markFirstActionableWaitingParts(ro)}>
                <Package size={14} /> Mark Waiting Parts
              </button>
              <button style={styles.secondaryButton} onClick={() => sendFirstActionableToQualityCheck(ro)}>
                <CheckCircle2 size={14} /> Send to QC
              </button>
              <button style={styles.secondaryButton} onClick={() => setView("billing")}>
                <Receipt size={14} /> Open Billing / Release
              </button>
              <button style={styles.secondaryButton} onClick={() => setView("parts")}>
                <ShoppingCart size={14} /> Open Parts
              </button>
              <button style={styles.secondaryButton} onClick={() => setView("customerSummary")}>
                <FileText size={14} /> Open Summary
              </button>
            </div>

            {roWarnings.length > 0 && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid #fde68a", background: "#fffbeb", display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 700, color: "#92400e" }}>Workflow attention needed</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {roWarnings.map((warning) => (
                    <span key={warning} style={styles.badgeWarn}>⚠ {warning}</span>
                  ))}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <>
                <div style={{ ...styles.formGrid, marginTop: 12 }}>
                  <input
                    disabled={!canEditRo(ro)}
                    style={styles.input}
                    placeholder="Plate"
                    value={ro.plate}
                    onChange={(e) => updateRO(ro.id, { plate: e.target.value })}
                  />
                  <input
                    disabled={!canEditRo(ro)}
                    style={styles.input}
                    placeholder="Vehicle"
                    value={ro.vehicle}
                    onChange={(e) => updateRO(ro.id, { vehicle: e.target.value })}
                  />
                  <input
                    disabled={!canEditRo(ro)}
                    style={styles.input}
                    placeholder="Customer"
                    value={ro.customer}
                    onChange={(e) => updateRO(ro.id, { customer: e.target.value })}
                  />
                  <input
                    disabled={!canEditRo(ro)}
                    style={styles.input}
                    placeholder="Customer Phone"
                    value={ro.customerPhone}
                    onChange={(e) => updateRO(ro.id, { customerPhone: e.target.value })}
                  />
                  <input
                    disabled={!canEditRo(ro)}
                    style={styles.input}
                    placeholder="Odometer *"
                    value={ro.odometer}
                    onChange={(e) => updateRO(ro.id, { odometer: e.target.value })}
                  />
                  <select
                    disabled={!canEditRo(ro)}
                    style={styles.input}
                    value={ro.bay}
                    onChange={(e) => updateRO(ro.id, { bay: e.target.value })}
                  >
                    {["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Bay 5"].map((bay) => (
                      <option key={bay} value={bay}>
                        {bay}
                      </option>
                    ))}
                  </select>
                  <select
                    disabled={!canEditRo(ro)}
                    style={styles.input}
                    value={ro.priority}
                    onChange={(e) => updateRO(ro.id, { priority: e.target.value as Priority })}
                  >
                    {["Low", "Normal", "High", "Urgent"].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {ro.softLocked && (
                  <div style={{ ...styles.formGrid, marginTop: 10 }}>
                    <input
                      style={styles.input}
                      placeholder="Override reason to edit released RO"
                      value={ro.lockOverrideReason}
                      onChange={(e) => updateRO(ro.id, { lockOverrideReason: e.target.value })}
                    />
                    <div style={{ color: "#6b7280", fontSize: 13, alignSelf: "center" }}>
                      Flexible mode: provide reason to unlock edits.
                    </div>
                  </div>
                )}

                {(ro.odometer || ro.customerVisibleFindings || ro.recommendationsSummary || ro.inspectionCompleted) && (
                  <div style={{ ...styles.innerBlock, marginTop: 10 }}>
                    <div style={styles.summaryRow}>
                      <span style={styles.badgeMuted}>Odometer: {ro.odometer || "-"}</span>
                      <span style={styles.badgeBlue}>{ro.inspectionCompleted ? "Inspection Complete" : "Waiting Inspection"}</span>
                      <span style={ro.qcPassed ? styles.badgeGood : styles.badgeWarn}>{ro.qcPassed ? "QC Passed" : "QC Pending"}</span>
                      <span style={ro.invoiceStatus === "Paid" ? styles.badgeGood : styles.badgeMuted}>Invoice: {ro.invoiceStatus}</span>
                    </div>
                    {ro.customerVisibleFindings && <div style={{ marginTop: 8 }}><strong>Findings:</strong> {ro.customerVisibleFindings}</div>}
                    {ro.recommendationsSummary && <div style={{ marginTop: 8 }}><strong>Recommendations:</strong> {ro.recommendationsSummary}</div>}
                  </div>
                )}

                {((ro.initialExteriorPhotos?.length || 0) > 0 || (ro.takeNotes?.length || 0) > 0 || ro.inspectionPhotos.length > 0) && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={styles.badgeBlue}>Exterior Photos: {ro.initialExteriorPhotos?.length || 0}</span>
                    <span style={styles.badgeMuted}>Take Notes: {ro.takeNotes?.length || 0}</span>
                    <span style={styles.badgeMuted}>Inspection Photos: {ro.inspectionPhotos.length}</span>
                    {Object.entries(ro.arrivalChecks || DEFAULT_ARRIVAL_CHECKS).map(([key, value]) => {
                      const arrivalValue = value as ArrivalCheckItem;
                      return (
                        <span
                          key={key}
                          style={
                            arrivalValue.status === "Needs Attention"
                              ? styles.badgeDanger
                              : arrivalValue.status === "OK"
                              ? styles.badgeGood
                              : styles.badgeMuted
                          }
                        >
                          {renderArrivalCheckLabel(key as ArrivalCheckKey)}: {arrivalValue.status}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div style={{ marginTop: 12, ...styles.wrapRow }}>
                  <button style={styles.secondaryButton} onClick={() => addWorkLine(ro.id)}>
                    + Add Work Line
                  </button>
                  <button style={styles.secondaryButton} onClick={() => createBackJobFromRO(ro.id)}>
                    <RotateCcw size={14} /> Create Back Job
                  </button>
                </div>

                {ro.workLines.map((line) => (
                  <div key={line.id} style={styles.innerBlock}>
                    <div style={styles.wrapRow}>
                      <input
                        disabled={!canEditRo(ro)}
                        style={styles.input}
                        value={line.label}
                        onChange={(e) => updateWorkLine(ro.id, line.id, { label: e.target.value })}
                      />
                      <input
                        disabled={!canEditRo(ro)}
                        style={styles.input}
                        value={line.category}
                        onChange={(e) => updateWorkLine(ro.id, line.id, { category: e.target.value })}
                        placeholder="Category"
                      />
                      <select
                        style={styles.input}
                        value={line.status}
                        onChange={(e) =>
                          updateWorkLine(ro.id, line.id, { status: e.target.value as WorkLineStatus })
                        }
                      >
                        {["Pending", "Approved", "Ready", "In Progress", "Waiting Parts", "Quality Check", "Done", "Cancelled"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ),
                        )}
                      </select>
                      <select
                        style={styles.input}
                        value={line.priority}
                        onChange={(e) => updateWorkLine(ro.id, line.id, { priority: e.target.value as Priority })}
                      >
                        {["Low", "Normal", "High", "Urgent"].map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                      <input
                        style={styles.input}
                        placeholder="Primary Technician"
                        value={getPrimaryTechnicianName(line)}
                        onChange={(e) => updatePrimaryTechnician(ro.id, line.id, e.target.value)}
                      />
                      <input
                        style={styles.input}
                        placeholder="Supporting Technicians (comma separated)"
                        value={getSupportingTechnicianNames(line).join(", ")}
                        onChange={(e) => updateSupportingTechnicians(ro.id, line.id, e.target.value)}
                      />
                      <span style={styles.badgeMuted}>{line.approvalStatus}</span>
                      <span style={line.partsSummary === "Waiting Parts" ? styles.badgeWarn : styles.badgeBlue}>
                        {line.partsSummary}
                      </span>
                      {line.status === "Ready" && <span style={styles.badgeGood}>Ready to Start</span>}
                    </div>

                    <div style={{ ...styles.wrapRow, marginTop: 10 }}>
                      <button style={styles.secondaryButton} onClick={() => createPart(ro.roNumber, line)}>
                        <Package size={14} /> Request Part
                      </button>
                      <button style={styles.secondaryButton} onClick={() => startWorkLine(ro.id, line.id)}>
                        <Play size={14} /> Start
                      </button>
                      <button style={styles.secondaryButton} onClick={() => pauseWorkLine(ro.id, line.id)}>
                        <Pause size={14} /> Pause
                      </button>
                      <span style={styles.badgeMuted}>Estimate: ₱{line.estimateTotal.toLocaleString()}</span>
                      <span style={styles.badgeMuted}>Actual: {line.actualHours.toFixed(2)}h</span>
                      <span style={styles.badgeMuted}>Sessions: {line.sessions.length}</span>
                      <span style={styles.badgeBlue}>Primary: {getPrimaryTechnicianName(line) || "Unassigned"}</span>
                      <span style={styles.badgeMuted}>Supporting: {getSupportingTechnicianNames(line).length}</span>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={styles.rowBetween}>
                        <div style={{ fontWeight: 700 }}>Workline Photos</div>
                        <button style={styles.secondaryButton} onClick={() => addWorkLinePhoto(ro.id, line.id)}>
                          <Camera size={14} /> Add Workline Photo
                        </button>
                      </div>

                      {line.photos.length > 0 ? (
                        <div style={{ ...styles.photoGrid, marginTop: 10 }}>
                          {line.photos.map((photo) => (
                            <div key={photo.id} style={styles.photoCard}>
                              <div style={{ ...styles.photoPreviewWrap, marginBottom: 8 }}>
                                {photo.url ? (
                                  <img src={photo.url} alt={photo.label || "Workline photo"} style={styles.photoPreview} />
                                ) : (
                                  <div style={styles.photoEmpty}><Image size={18} /> No image</div>
                                )}
                              </div>

                              <div style={{ display: "grid", gap: 8 }}>
                                <input
                                  style={styles.input}
                                  placeholder="Photo label"
                                  value={photo.label}
                                  onChange={(e) =>
                                    updateWorkLinePhoto(ro.id, line.id, photo.id, "label", e.target.value)
                                  }
                                />
                                <select
                                  style={styles.input}
                                  value={photo.stage}
                                  onChange={(e) =>
                                    updateWorkLinePhoto(
                                      ro.id,
                                      line.id,
                                      photo.id,
                                      "stage",
                                      e.target.value as WorkLinePhoto["stage"],
                                    )
                                  }
                                >
                                  {["Before", "During", "After"].map((stage) => (
                                    <option key={stage} value={stage}>
                                      {stage}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  style={styles.input}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    void uploadWorkLinePhotoFile(ro.id, line.id, photo.id, e.target.files?.[0])
                                  }
                                />
                                <input
                                  style={styles.input}
                                  placeholder="Photo URL or paste image link"
                                  value={photo.url.startsWith("data:") ? "" : photo.url}
                                  onChange={(e) =>
                                    updateWorkLinePhoto(ro.id, line.id, photo.id, "url", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: "#6b7280", marginTop: 10 }}>No workline photos yet.</div>
                      )}
                    </div>

                    {line.overrideNote && (
                      <div style={{ marginTop: 8, color: "#92400e" }}>
                        <strong>Override:</strong> {line.overrideNote}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const PartsView = () => (
    <div>
      <h2 style={styles.heading}>Parts + Supplier Bids</h2>

      {parts.length === 0 && <div style={styles.cardBlock}>No parts requests yet.</div>}

      {parts.map((part) => {
        const isCollapsed = !!collapsedParts[part.id];
        const bids = supplierBids.filter((b) => b.partRequestId === part.id);
        const bidForm = bidForms[part.id] || DEFAULT_BID_FORM;
        const internalTotal = round2((part.qty || 0) * (part.unitCost || 0));
        const customerTotal = getCustomerSellingTotal(part);

        return (
          <div key={part.id} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div style={styles.wrapRow}>
                <span style={styles.badgeDark}>{part.requestNumber || part.id}</span>
                <span style={styles.badgeMuted}>{part.roNumber}</span>
                <span style={styles.badgeBlue}>{part.workLineLabel || "No Work Line"}</span>
                <span style={part.status === "Parts Arrived" ? styles.badgeGood : styles.badgeWarn}>{part.status}</span>
              </div>
              <div style={styles.wrapRow}>
                <span style={styles.badgeMuted}>Internal Cost ₱{internalTotal.toLocaleString()}</span>
                <span style={styles.badgeGood}>Customer Total ₱{customerTotal.toLocaleString()}</span>
                <button style={styles.secondaryButton} onClick={() => togglePartCollapsed(part.id)}>
                  {isCollapsed ? "Expand" : "Collapse"}
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <React.Fragment>
            <div style={{ ...styles.formGrid, marginTop: 10 }}>
              <input style={styles.input} placeholder="Plate" value={part.plate} onChange={(e) => updatePart(part.id, { plate: e.target.value })} />
              <input style={styles.input} placeholder="Vehicle" value={part.vehicle} onChange={(e) => updatePart(part.id, { vehicle: e.target.value })} />
              <input style={styles.input} placeholder="Part Name" value={part.partName} onChange={(e) => updatePart(part.id, { partName: e.target.value })} />
              <input style={styles.input} placeholder="Part Number" value={part.partNumber} onChange={(e) => updatePart(part.id, { partNumber: e.target.value })} />
              <input style={styles.input} type="number" placeholder="Quantity" value={part.qty} onChange={(e) => updatePart(part.id, { qty: Number(e.target.value) || 0 })} />
              <select style={styles.input} value={part.urgency} onChange={(e) => updatePart(part.id, { urgency: e.target.value as Priority })}>
                {["Low", "Normal", "High", "Urgent"].map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
              <input style={styles.input} placeholder="Requested By" value={part.requestedBy} onChange={(e) => updatePart(part.id, { requestedBy: e.target.value })} />
              <select style={styles.input} value={part.status} onChange={(e) => updatePart(part.id, { status: e.target.value as PartRequestStatus })}>
                {["Draft", "Sent to Suppliers", "Waiting for Bids", "Supplier Selected", "Ordered", "Shipped", "Parts Arrived", "Closed", "Cancelled"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ ...styles.formGrid, marginTop: 10 }}>
              <input style={styles.input} type="number" placeholder="Internal Unit Cost" value={part.unitCost} onChange={(e) => updatePart(part.id, { unitCost: Number(e.target.value) || 0 })} />
              <input style={styles.input} type="number" placeholder="Customer Parts Selling Price" value={part.customerPartsSellingPrice} onChange={(e) => updatePart(part.id, { customerPartsSellingPrice: Number(e.target.value) || 0 })} />
              <input style={styles.input} type="number" placeholder="Customer Labor Price" value={part.customerLaborSellingPrice} onChange={(e) => updatePart(part.id, { customerLaborSellingPrice: Number(e.target.value) || 0 })} />
              <input style={styles.input} type="number" placeholder="Customer Total Price" value={part.customerTotalSellingPrice} onChange={(e) => updatePart(part.id, { customerTotalSellingPrice: Number(e.target.value) || 0 })} />
            </div>

            <div style={{ marginTop: 10 }}>
              <TextArea label="Request Notes" value={part.notes} onChange={(value) => updatePart(part.id, { notes: value })} />
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Part Photos</div>
              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => void uploadPartRequestPhotoFiles(part.id, e.target.files)}
                />
                <div style={{ ...styles.input, display: "flex", alignItems: "center" }}>
                  {part.photos?.length || 0} uploaded photo(s)
                </div>
              </div>
              {(part.photos?.length || 0) > 0 && (
                <div style={{ ...styles.photoGrid, marginTop: 10 }}>
                  {(part.photos || []).map((photo) => (
                    <div key={photo.id} style={styles.photoCard}>
                      <div style={{ ...styles.photoPreviewWrap, marginBottom: 8 }}>
                        {photo.url ? (
                          <img src={photo.url} alt={photo.label || "Part photo"} style={styles.photoPreview} />
                        ) : (
                          <div style={styles.photoEmpty}><Image size={18} /> No image</div>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{photo.label}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10 }}>
                <TextArea
                  label="Part Photo URLs (optional, one per line)"
                  value={photosToMultiline(part.photos || [])}
                  onChange={(value) => updatePart(part.id, { photos: multilineToPhotos(value) })}
                />
              </div>
            </div>

            <div style={{ marginTop: 10, ...styles.wrapRow }}>
              <button style={styles.secondaryButton} onClick={() => addBid(part.id)}>
                <ShoppingCart size={14} /> Add Supplier Bid
              </button>
              <button style={styles.secondaryButton} onClick={() => confirmPartsArrival(part.id)}>
                <Package size={14} /> Confirm Parts Arrived
              </button>
              {inventory.map((item) => (
                <button key={item.id} style={styles.secondaryButton} onClick={() => allocateInventoryToPart(part.id, item.id)}>
                  Use {item.partName}
                </button>
              ))}
            </div>

            {(part.receivedAt || part.receivedBy || part.receivedCondition || part.receivedNotes || part.receivedPhotoUrl) && (
              <div style={{ ...styles.innerBlock, marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Parts Arrival Confirmation</div>
                <div style={styles.formGrid}>
                  <input style={styles.input} placeholder="Received By" value={part.receivedBy || ""} onChange={(e) => updatePart(part.id, { receivedBy: e.target.value })} />
                  <select style={styles.input} value={part.receivedCondition || "Complete"} onChange={(e) => updatePart(part.id, { receivedCondition: e.target.value as "Complete" | "Incomplete" | "Damaged" })}>
                    {["Complete", "Incomplete", "Damaged"].map((condition) => <option key={condition} value={condition}>{condition}</option>)}
                  </select>
                  <input style={styles.input} placeholder="Received Photo URL" value={part.receivedPhotoUrl || ""} onChange={(e) => updatePart(part.id, { receivedPhotoUrl: e.target.value })} />
                  <input style={styles.input} type="file" accept="image/*" onChange={(e) => void uploadPartReceivedPhotoFile(part.id, e.target.files?.[0])} />
                  <input style={styles.input} placeholder="Received Time" value={part.receivedAt ? new Date(part.receivedAt).toLocaleString() : ""} disabled />
                </div>
                <div style={{ marginTop: 10 }}>
                  <TextArea label="Arrival Notes" value={part.receivedNotes || ""} onChange={(value) => updatePart(part.id, { receivedNotes: value })} />
                </div>
                {part.receivedPhotoUrl && (
                  <div style={{ marginTop: 10 }}>
                    <div style={styles.photoPreviewWrap}>
                      <img src={part.receivedPhotoUrl} alt="Received part" style={styles.photoPreview} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ ...styles.innerBlock, marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Supplier Bidding</div>
              <div style={styles.formGrid}>
                <select style={styles.input} value={bidForm.supplierId} onChange={(e) => updateBidForm(part.id, { supplierId: e.target.value })}>
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input style={styles.input} placeholder="Brand" value={bidForm.brand} onChange={(e) => updateBidForm(part.id, { brand: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Quantity" value={bidForm.quantity} onChange={(e) => updateBidForm(part.id, { quantity: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Unit Cost PHP" value={bidForm.unitPrice} onChange={(e) => updateBidForm(part.id, { unitPrice: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Delivery Time (days)" value={bidForm.etaDays} onChange={(e) => updateBidForm(part.id, { etaDays: e.target.value })} />
                <input style={styles.input} placeholder="Condition" value={bidForm.condition} onChange={(e) => updateBidForm(part.id, { condition: e.target.value })} />
                <input style={styles.input} placeholder="Warranty Note" value={bidForm.warrantyNote} onChange={(e) => updateBidForm(part.id, { warrantyNote: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Customer Parts Selling Price" value={bidForm.customerSellingPrice} onChange={(e) => updateBidForm(part.id, { customerSellingPrice: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Labor Selling Price" value={bidForm.laborSellingPrice} onChange={(e) => updateBidForm(part.id, { laborSellingPrice: e.target.value })} />
                <input style={styles.input} placeholder="Receipt File URL" value={bidForm.receiptUrl} onChange={(e) => updateBidForm(part.id, { receiptUrl: e.target.value })} />
                <input style={styles.input} placeholder="Shipping Receipt URL" value={bidForm.shippingReceiptUrl} onChange={(e) => updateBidForm(part.id, { shippingReceiptUrl: e.target.value })} />
                <input style={styles.input} placeholder="Actual Part Photo URL" value={bidForm.partPhotoUrl} onChange={(e) => updateBidForm(part.id, { partPhotoUrl: e.target.value })} />
              </div>
              <div style={{ marginTop: 10 }}>
                <TextArea label="Supplier Bid Notes" value={bidForm.notes} onChange={(value) => updateBidForm(part.id, { notes: value })} />
              </div>
            </div>

            {bids.length > 0 && (
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {bids.map((bid) => (
                  <div key={bid.id} style={styles.logRow}>
                    <div style={styles.rowBetween}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{getSupplierName(suppliers, bid.supplierId)} • {bid.brand || "No brand"}</div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          Qty {bid.quantity} • Unit ₱{bid.unitPrice.toLocaleString()} • Total ₱{bid.totalCost.toLocaleString()} • ETA {bid.etaDays} day(s)
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          Warranty: {bid.warrantyNote || "-"} • Condition: {bid.condition || "-"} • Uploads: {getBidUploadCount(bid)}
                        </div>
                        <div style={{ fontSize: 13, color: "#111827", marginTop: 4 }}>
                          Customer selling: ₱{round2((bid.customerSellingPrice || 0) + (bid.laborSellingPrice || 0)).toLocaleString()}
                        </div>
                      </div>
                      <div style={styles.wrapRow}>
                        {bid.selected && <span style={styles.badgeGood}>Selected</span>}
                        <button style={styles.secondaryButton} onClick={() => selectBid(bid.id)}>Select</button>
                      </div>
                    </div>
                    {bid.notes && <div style={{ marginTop: 6, fontSize: 13 }}>{bid.notes}</div>}
                  </div>
                ))}
              </div>
            )}
              </React.Fragment>
            )}
          </div>
        );
      })}
    </div>
  );

  const ShopView = () => (
    <div>
      <h2 style={styles.heading}>Live Shop Board</h2>

      <div style={styles.shopGrid}>
        {shopRows.map((ro) => (
          <div key={ro.id} style={styles.shopCard}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700 }}>{ro.bay}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{ro.roNumber}</div>
              </div>
              <span style={getROBadgeStyle(ro.status)}>{ro.status}</span>
            </div>

            <div style={{ marginTop: 10 }}>{ro.vehicle || "No Vehicle"}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>{ro.plate || "No Plate"}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>{ro.customer || "No Customer"}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Primary Tech: {getPrimaryTechnicianName(ro.workLines[0] || DEFAULT_WORK_LINE) || "Unassigned"}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Supporting: {getSupportingTechnicianNames(ro.workLines[0] || DEFAULT_WORK_LINE).length}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Elapsed: {formatDuration(ro.workLines.find((line) => line.status === "In Progress")?.startedAt)}</div>

            <div style={{ ...styles.wrapRow, marginTop: 10 }}>
              <span style={getPriorityStyle(ro.priority)}>{ro.priority}</span>
              <span
                style={
                  ro.releaseStatus === "Released"
                    ? styles.badgeGood
                    : ro.releaseStatus === "Ready for Release"
                    ? styles.badgeBlue
                    : styles.badgeMuted
                }
              >
                {ro.releaseStatus}
              </span>
              {ro.isReturnJob && <span style={styles.badgeDanger}>Comeback</span>}
              {ro.priority === "Urgent" && (
                <span style={styles.badgeDanger}>
                  <AlertTriangle size={12} style={{ marginRight: 4 }} /> Urgent First
                </span>
              )}
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
              {ro.workLines.slice(0, 3).map((line) => (
                <div key={line.id} style={styles.shopMiniRow}>
                  <span>{line.label}</span>
                  <span style={styles.badgeMuted}>{line.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TechView = () => (
    <div>
      <h2 style={styles.heading}>Technician Board + KPI</h2>

      <div style={styles.statsGrid}>
        <MetricCard title="Clocked In" value={technicianSummary.activeTechs} />
        <MetricCard title="Actively Working" value={technicianSummary.workingTechs} />
        <MetricCard title="Completed Lines" value={technicianSummary.totalCompleted} />
        <MetricCard title="Avg Efficiency %" value={technicianSummary.avgEfficiency} />
      </div>

      <div style={{ ...styles.cardBlock, marginTop: 16 }}>
        <div style={styles.rowBetween}>
          <div>
            <div style={{ fontWeight: 700 }}>Attendance Link</div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
              Technician and mechanic attendance now comes from the employee board for today.
            </div>
          </div>
          <button style={styles.secondaryButton} onClick={() => setView("employees")}>Open Attendance Board</button>
        </div>
        <div style={{ ...styles.statsGrid, marginTop: 12 }}>
          <MetricCard title="Tech / Mechanic Employees" value={technicianEmployeeSummary.total} />
          <MetricCard title="Present Today" value={technicianEmployeeSummary.present} />
          <MetricCard title="Checked Out Today" value={technicianEmployeeSummary.checkedOut} />
        </div>
      </div>

      <div style={{ ...styles.cardBlock, marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Top Performers</div>
        <div style={{ display: "grid", gap: 8 }}>
          {technicianLeaderboard.slice(0, 3).map((tech, index) => (
            <div key={tech.id} style={styles.logRow}>
              <div style={styles.rowBetween}>
                <div style={{ fontWeight: 700 }}>
                  #{index + 1} {tech.name}
                </div>
                <span style={styles.badgeGood}>{tech.rankingScore} pts</span>
              </div>
              <div style={{ marginTop: 6, display: "grid", gap: 4, fontSize: 13, color: "#374151" }}>
                <div>Efficiency: {tech.efficiency}%</div>
                <div>Completed Lines: {tech.completedLines}</div>
                <div>Completion Rate: {tech.completionRate}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.shopGrid, marginTop: 16 }}>
        {technicianLeaderboard.map((tech) => {
          const linkedEmployee = employees.find((employee) => employee.displayName.trim().toLowerCase() === tech.name.trim().toLowerCase());
          const linkedAttendance = linkedEmployee ? attendanceRecords.find((record) => record.employeeId === linkedEmployee.id && record.date === getTodayDateString()) : undefined;
          return (
            <div key={tech.id} style={styles.shopCard}>
              <div style={styles.rowBetween}>
                <div>
                  <div style={{ fontWeight: 700 }}>{tech.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{tech.role}</div>
                </div>
                <div style={styles.wrapRow}>
                  <span style={tech.clockedIn ? styles.badgeGood : styles.badgeMuted}>
                    {tech.clockedIn ? "Clocked In" : "Clocked Out"}
                  </span>
                  <span style={styles.badgeBlue}>{tech.rankingScore} score</span>
                  <button style={styles.secondaryButton} onClick={() => toggleTechClock(tech.id)}>
                    <UserCog size={14} /> Toggle
                  </button>
                </div>
              </div>

              {linkedEmployee && (
                <div style={{ ...styles.innerBlock, marginTop: 10 }}>
                  <div style={styles.rowBetween}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Linked Employee Attendance</div>
                    <span style={linkedAttendance?.status === "Present" ? styles.badgeGood : linkedAttendance?.status === "Late" ? styles.badgeWarn : linkedAttendance?.status === "Half Day" ? styles.badgeBlue : styles.badgeMuted}>
                      {linkedAttendance?.status || "Absent"}
                    </span>
                  </div>
                  <div style={{ display: "grid", gap: 4, fontSize: 13, color: "#374151", marginTop: 8 }}>
                    <div>Employee: {linkedEmployee.employeeCode} • {linkedEmployee.username}</div>
                    <div>Check In / Out: {linkedAttendance?.checkInTime || "-"} / {linkedAttendance?.checkOutTime || "-"}</div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                <div>
                  <strong>Current RO:</strong> {tech.currentRoNumber || "—"}
                </div>
                <div>
                  <strong>Current Job:</strong> {tech.currentWorkLine || "—"}
                </div>
                <div>
                  <strong>Active Time:</strong> {tech.currentStartedAt ? formatDuration(tech.currentStartedAt) : "—"}
                </div>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                <div>Billed Hours: {tech.billedHours}</div>
                <div>Actual Hours: {tech.actualHours}</div>
                <div>Efficiency: {tech.efficiency}%</div>
                <div>Completed Lines: {tech.completedLines}</div>
                <div>Quality Check Lines: {tech.qcLines}</div>
                <div>Completion Rate: {tech.completionRate}%</div>
                <div>Average Hours / Job: {tech.avgHoursPerJob}</div>
                <div>Comebacks: {tech.comebacks}</div>
                <div>Active Jobs: {tech.active}</div>
                <div>Labor Revenue: ₱{tech.laborRevenue.toLocaleString()}</div>
                <div>Total Estimated Value: ₱{tech.estimatedValue.toLocaleString()}</div>
                <div>Utilization Score: {tech.utilizationScore}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const CustomerSummaryView = () => (
    <div>
      <div style={styles.rowBetween}>
        <h2 style={styles.heading}>Customer Summary + PDF + Send</h2>
        <div style={{ color: "#6b7280" }}>Customer-facing summary with print, PDF, SMS, and email actions.</div>
      </div>

      {ros.length === 0 && <div style={styles.cardBlock}>No repair orders available for summary generation.</div>}

      {ros.map((ro) => {
        const financials = getROFinancials(ro);
        const attachmentCount = getCustomerSummaryAttachments(ro).length;
        return (
          <div key={ro.id} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700 }}>{ro.roNumber}</div>
                <div style={{ color: "#6b7280" }}>{ro.customer || "No Customer"} • {ro.vehicle || "No Vehicle"} • {ro.plate || "No Plate"}</div>
              </div>
              <div style={styles.wrapRow}>
                <span style={getROBadgeStyle(ro.status)}>{ro.status}</span>
                <span style={styles.badgeMuted}>Attachments: {attachmentCount}</span>
              </div>
            </div>

            <div style={{ ...styles.summaryGrid, marginTop: 12 }}>
              <div style={styles.metricMini}><div style={styles.mutedLabel}>Service Price</div><strong>₱{financials.labor.toLocaleString()}</strong></div>
              <div style={styles.metricMini}><div style={styles.mutedLabel}>Parts Price</div><strong>₱{financials.parts.toLocaleString()}</strong></div>
              <div style={styles.metricMini}><div style={styles.mutedLabel}>Total</div><strong>₱{financials.total.toLocaleString()}</strong></div>
            </div>

            <div style={{ marginTop: 12 }}>
              <TextArea label="Customer-visible Findings" value={ro.customerVisibleFindings} onChange={(value) => updateRO(ro.id, { customerVisibleFindings: value })} />
            </div>

            <div style={{ marginTop: 12 }}>
              <TextArea label="Recommendations Summary" value={ro.recommendationsSummary} onChange={(value) => updateRO(ro.id, { recommendationsSummary: value })} />
            </div>

            <div style={{ marginTop: 12, ...styles.wrapRow }}>
              <button style={styles.secondaryButton} onClick={() => printCustomerSummary(ro, parts)}><Printer size={14} /> Print Summary</button>
              <button style={styles.secondaryButton} onClick={() => downloadCustomerSummaryPdf(ro, parts)}><FileText size={14} /> Download PDF</button>
              <button style={styles.secondaryButton} onClick={() => sendCustomerSummarySmsLink(ro, parts)}><MessageSquare size={14} /> Send via SMS Link</button>
              <button style={styles.secondaryButton} onClick={() => sendCustomerSummaryEmail(ro, parts)}><FileText size={14} /> Send via Email</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const BillingView = () => (
    <div>
      <h2 style={styles.heading}>Billing + QC + Release + Margin</h2>

      {ros.map((ro) => {
        const financials = getROFinancials(ro);
        const paymentForm = paymentForms[ro.id] || DEFAULT_PAYMENT_FORM;
        const partsCostActual = round2(
          parts
            .filter((p) => p.roNumber === ro.roNumber && p.status !== "Cancelled")
            .reduce((sum, p) => sum + p.qty * p.unitCost, 0),
        );
        const grossProfit = round2(financials.total - partsCostActual);
        const margin = financials.total > 0 ? round2((grossProfit / financials.total) * 100) : 0;

        return (
          <div key={ro.id} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700 }}>{ro.roNumber}</div>
                <div style={{ color: "#6b7280" }}>
                  {ro.customer || "No Customer"} • {ro.vehicle || "No Vehicle"}
                </div>
              </div>
              <div style={styles.wrapRow}>
                <span style={styles.badgeDark}>{ro.invoiceStatus}</span>
                <span
                  style={
                    ro.releaseStatus === "Released"
                      ? styles.badgeGood
                      : ro.releaseStatus === "Ready for Release"
                      ? styles.badgeBlue
                      : styles.badgeMuted
                  }
                >
                  {ro.releaseStatus}
                </span>
                <button style={styles.secondaryButton} onClick={() => printRepairOrder(ro)}>
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            <div style={{ ...styles.summaryGrid, marginTop: 12 }}>
              <div style={styles.metricMini}>
                <div style={styles.mutedLabel}>Labor Revenue</div>
                <strong>₱{financials.labor.toLocaleString()}</strong>
              </div>
              <div style={styles.metricMini}>
                <div style={styles.mutedLabel}>Parts Revenue</div>
                <strong>₱{financials.parts.toLocaleString()}</strong>
              </div>
              <div style={styles.metricMini}>
                <div style={styles.mutedLabel}>Total</div>
                <strong>₱{financials.total.toLocaleString()}</strong>
              </div>
              <div style={styles.metricMini}>
                <div style={styles.mutedLabel}>Paid</div>
                <strong>₱{financials.paid.toLocaleString()}</strong>
              </div>
              <div style={styles.metricMini}>
                <div style={styles.mutedLabel}>Balance</div>
                <strong>₱{financials.balance.toLocaleString()}</strong>
              </div>
              <div style={styles.metricMini}>
                <div style={styles.mutedLabel}>Gross Profit</div>
                <strong>₱{grossProfit.toLocaleString()}</strong>
              </div>
              <div style={styles.metricMini}>
                <div style={styles.mutedLabel}>Margin %</div>
                <strong>{margin}%</strong>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Payment Entry</div>

              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Amount"
                  value={paymentForm.amount}
                  onChange={(e) => updatePaymentForm(ro.id, { amount: e.target.value })}
                />
                <select
                  style={styles.input}
                  value={paymentForm.method}
                  onChange={(e) =>
                    updatePaymentForm(ro.id, { method: e.target.value as PaymentMethod })
                  }
                >
                  {["Cash", "Card", "Bank Transfer", "GCash", "Other"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  style={styles.input}
                  placeholder="Payment note"
                  value={paymentForm.note}
                  onChange={(e) => updatePaymentForm(ro.id, { note: e.target.value })}
                />
              </div>

              <div style={{ marginTop: 10 }}>
                <button style={styles.primaryButton} onClick={() => addPayment(ro.id)}>
                  <CreditCard size={14} style={{ marginRight: 6 }} /> Add Payment
                </button>
              </div>

              {ro.payments.length > 0 && (
                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {ro.payments.map((p) => (
                    <div key={p.id} style={styles.logRow}>
                      <div style={{ fontWeight: 600 }}>
                        ₱{p.amount.toLocaleString()} • {p.method}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {new Date(p.timestamp).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 13 }}>{p.note || "No note"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Release Checklist</div>

              <div style={styles.issueGrid}>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={ro.releaseChecklist.invoiceReviewed}
                    onChange={(e) =>
                      updateReleaseChecklist(ro.id, { invoiceReviewed: e.target.checked })
                    }
                  />
                  <span>Invoice Reviewed</span>
                </label>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={ro.releaseChecklist.paymentConfirmed}
                    onChange={(e) =>
                      updateReleaseChecklist(ro.id, { paymentConfirmed: e.target.checked })
                    }
                  />
                  <span>Payment Confirmed</span>
                </label>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={ro.releaseChecklist.vehicleChecked}
                    onChange={(e) =>
                      updateReleaseChecklist(ro.id, { vehicleChecked: e.target.checked })
                    }
                  />
                  <span>Vehicle Checked</span>
                </label>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={ro.releaseChecklist.customerNotified}
                    onChange={(e) =>
                      updateReleaseChecklist(ro.id, { customerNotified: e.target.checked })
                    }
                  />
                  <span>Customer Notified</span>
                </label>
              </div>

              <div style={{ ...styles.formGrid, marginTop: 10 }}>
                <input
                  style={styles.input}
                  placeholder="Released By"
                  value={ro.releaseChecklist.releasedBy}
                  onChange={(e) => updateReleaseChecklist(ro.id, { releasedBy: e.target.value })}
                />
                <input
                  style={styles.input}
                  placeholder="Release Note"
                  value={ro.releaseChecklist.releaseNote}
                  onChange={(e) => updateReleaseChecklist(ro.id, { releaseNote: e.target.value })}
                />
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>QC Checklist</div>
                <div style={styles.issueGrid}>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.workPerformedVerified} onChange={(e) => updateQCChecklist(ro.id, { workPerformedVerified: e.target.checked })} /><span>Work performed verified</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.roadTestPerformed} onChange={(e) => updateQCChecklist(ro.id, { roadTestPerformed: e.target.checked })} /><span>Road test performed if applicable</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.brakesOk} onChange={(e) => updateQCChecklist(ro.id, { brakesOk: e.target.checked })} /><span>Brakes OK</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.steeringOk} onChange={(e) => updateQCChecklist(ro.id, { steeringOk: e.target.checked })} /><span>Steering OK</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.lightsOk} onChange={(e) => updateQCChecklist(ro.id, { lightsOk: e.target.checked })} /><span>Lights OK</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.hornOk} onChange={(e) => updateQCChecklist(ro.id, { hornOk: e.target.checked })} /><span>Horn OK</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.noLeaks} onChange={(e) => updateQCChecklist(ro.id, { noLeaks: e.target.checked })} /><span>No leaks</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.fluidLevelsOk} onChange={(e) => updateQCChecklist(ro.id, { fluidLevelsOk: e.target.checked })} /><span>Fluid levels OK</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.batterySecured} onChange={(e) => updateQCChecklist(ro.id, { batterySecured: e.target.checked })} /><span>Battery secured</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.noLooseParts} onChange={(e) => updateQCChecklist(ro.id, { noLooseParts: e.target.checked })} /><span>No loose parts</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.wheelsSecured} onChange={(e) => updateQCChecklist(ro.id, { wheelsSecured: e.target.checked })} /><span>Wheels secured</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.cleanlinessAcceptable} onChange={(e) => updateQCChecklist(ro.id, { cleanlinessAcceptable: e.target.checked })} /><span>Cleanliness acceptable</span></label>
                  <label style={styles.checkboxRow}><input type="checkbox" checked={ro.qcChecklist.toolsRemoved} onChange={(e) => updateQCChecklist(ro.id, { toolsRemoved: e.target.checked })} /><span>Tools removed</span></label>
                </div>
                <div style={{ ...styles.formGrid, marginTop: 10 }}>
                  <select style={styles.input} value={ro.qcChecklist.originalConcernResolved} onChange={(e) => updateQCChecklist(ro.id, { originalConcernResolved: e.target.value as QCChecklist["originalConcernResolved"] })}>
                    {["Yes", "Partially", "No"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input style={styles.input} placeholder="Road test result" value={ro.qcChecklist.roadTestResult} onChange={(e) => updateQCChecklist(ro.id, { roadTestResult: e.target.value })} />
                  <select style={styles.input} value={ro.qcChecklist.inspectedBy} onChange={(e) => updateQCChecklist(ro.id, { inspectedBy: e.target.value })}>
                    <option value="">QC inspector</option>
                    {technicians.filter((tech) => ["Chief Mechanic", "Senior Mechanic"].includes(tech.role)).map((tech) => <option key={tech.id} value={tech.name}>{tech.name} • {tech.role}</option>)}
                  </select>
                  <select style={styles.input} value={ro.qcChecklist.finalResult} onChange={(e) => updateQCChecklist(ro.id, { finalResult: e.target.value as QCResult })}>
                    {["Pending", "Passed", "Failed"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{ marginTop: 10 }}>
                  <TextArea label="QC Notes" value={ro.qcChecklist.notes} onChange={(value) => updateQCChecklist(ro.id, { notes: value })} />
                </div>
                {ro.workLines.some((line) => `${line.label} ${line.category}`.toLowerCase().includes("alignment")) && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Alignment Documentation</div>
                    <div style={styles.formGrid}>
                      <input style={styles.input} placeholder="Before Alignment Report upload (URL)" value={ro.qcChecklist.alignmentBeforeReport} onChange={(e) => updateQCChecklist(ro.id, { alignmentBeforeReport: e.target.value })} />
                      <input style={styles.input} placeholder="After Alignment Report upload (URL)" value={ro.qcChecklist.alignmentAfterReport} onChange={(e) => updateQCChecklist(ro.id, { alignmentAfterReport: e.target.value })} />
                    </div>
                    <div style={{ ...styles.formGrid, marginTop: 10 }}>
                      <input style={styles.input} placeholder="Before Alignment Notes" value={ro.qcChecklist.alignmentBeforeNotes} onChange={(e) => updateQCChecklist(ro.id, { alignmentBeforeNotes: e.target.value })} />
                      <input style={styles.input} placeholder="After Alignment Notes" value={ro.qcChecklist.alignmentAfterNotes} onChange={(e) => updateQCChecklist(ro.id, { alignmentAfterNotes: e.target.value })} />
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 10, ...styles.wrapRow }}>
                  <span style={ro.qcChecklist.finalResult === "Passed" ? styles.badgeGood : ro.qcChecklist.finalResult === "Failed" ? styles.badgeDanger : styles.badgeMuted}>QC: {ro.qcChecklist.finalResult}</span>
                  {ro.qcChecklist.inspectedAt && <span style={styles.badgeMuted}>QC at {new Date(ro.qcChecklist.inspectedAt).toLocaleString()}</span>}
                  <button style={ro.qcChecklist.finalResult === "Failed" ? styles.dangerButton : styles.goodButton} onClick={() => finalizeQC(ro.id)}>
                    {ro.qcChecklist.finalResult === "Failed" ? "Log QC Failure" : "Finalize QC"}
                  </button>
                </div>
                {ro.qcChecklist.failedLogs.length > 0 && (
                  <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                    {ro.qcChecklist.failedLogs.slice(0, 3).map((entry) => (
                      <div key={entry.id} style={styles.logRow}>
                        <div style={{ fontWeight: 600 }}>QC Failed • {entry.inspectedBy}</div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>{new Date(entry.timestamp).toLocaleString()}</div>
                        <div style={{ fontSize: 13 }}>{entry.notes}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 10, ...styles.wrapRow }}>
                <button
                  style={styles.goodButton}
                  onClick={() => finalizeRelease(ro.id)}
                  disabled={ro.releaseStatus !== "Ready for Release" || !ro.qcPassed}
                >
                  <Truck size={14} style={{ marginRight: 6 }} /> Finalize Release
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => closeRepairOrder(ro.id)}
                  disabled={ro.releaseStatus !== "Released"}
                >
                  Close RO
                </button>
              </div>

              {ro.releaseChecklist.releasedAt && (
                <div style={{ marginTop: 10, color: "#16a34a", fontWeight: 600 }}>
                  Released at {new Date(ro.releaseChecklist.releasedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const PurchasingView = () => (
    <div>
      <h2 style={styles.heading}>Suppliers + Purchasing</h2>
      <div style={{ color: "#6b7280", marginBottom: 10 }}>Supplier bids are private. Internal cost is for management and inventory control; customer-facing totals are set separately on each parts request.</div>

      <div style={styles.shopGrid}>
        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Add Supplier</div>
          <div style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Supplier name"
              value={supplierForm.name}
              onChange={(e) => setSupplierForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Contact person"
              value={supplierForm.contactPerson}
              onChange={(e) =>
                setSupplierForm((p) => ({ ...p, contactPerson: e.target.value }))
              }
            />
            <input
              style={styles.input}
              placeholder="Phone"
              value={supplierForm.phone}
              onChange={(e) => setSupplierForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Notes"
              value={supplierForm.notes}
              onChange={(e) => setSupplierForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <button style={styles.primaryButton} onClick={createSupplier}>
              Add Supplier
            </button>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Supplier Directory</div>
          <div style={{ display: "grid", gap: 8 }}>
            {suppliers.map((s) => (
              <div key={s.id} style={styles.logRow}>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {s.contactPerson} • {s.phone}
                </div>
                <div style={{ fontSize: 13 }}>{s.notes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const InventoryView = () => (
    <div>
      <h2 style={styles.heading}>Inventory</h2>

      <div style={styles.cardBlock}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Add Inventory Item</div>
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Part name"
            value={inventoryForm.partName}
            onChange={(e) => setInventoryForm((p) => ({ ...p, partName: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="SKU"
            value={inventoryForm.sku}
            onChange={(e) => setInventoryForm((p) => ({ ...p, sku: e.target.value }))}
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Qty on hand"
            value={inventoryForm.quantityOnHand}
            onChange={(e) =>
              setInventoryForm((p) => ({ ...p, quantityOnHand: e.target.value }))
            }
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Reorder level"
            value={inventoryForm.reorderLevel}
            onChange={(e) =>
              setInventoryForm((p) => ({ ...p, reorderLevel: e.target.value }))
            }
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Avg cost"
            value={inventoryForm.avgCost}
            onChange={(e) => setInventoryForm((p) => ({ ...p, avgCost: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Location"
            value={inventoryForm.location}
            onChange={(e) => setInventoryForm((p) => ({ ...p, location: e.target.value }))}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button style={styles.primaryButton} onClick={createInventoryItem}>
            Add Inventory
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {inventory.map((item) => (
          <div key={item.id} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.partName}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  {item.sku} • {item.location}
                </div>
              </div>
              <div style={styles.wrapRow}>
                <span style={item.quantityOnHand <= item.reorderLevel ? styles.badgeDanger : styles.badgeGood}>
                  QOH {item.quantityOnHand}
                </span>
                <button style={styles.secondaryButton} onClick={() => restockInventory(item.id, 5)}>
                  +5 Restock
                </button>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Reorder Level: {item.reorderLevel} • Avg Cost: ₱{item.avgCost.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const HistoryView = () => (
    <div>
      <div style={styles.rowBetween}>
        <h2 style={styles.heading}>Customer History + Service Timeline</h2>
        <div style={{ position: "relative", minWidth: 260 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
            }}
          />
          <input
            style={{ ...styles.input, paddingLeft: 34, width: "100%" }}
            placeholder="Search customer, plate, vehicle"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
          />
        </div>
      </div>

      {filteredHistory.length === 0 && <div style={styles.cardBlock}>No service history found.</div>}

      {filteredHistory.map((record) => {
        const roList = record.roIds
          .map((id) => ros.find((ro) => ro.id === id))
          .filter(Boolean) as RepairOrder[];

        return (
          <div key={record.key} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{record.customer || "No Customer Name"}</div>
                <div style={{ color: "#6b7280" }}>
                  {record.plate || "No Plate"} • {record.vehicle || "No Vehicle"}
                </div>
              </div>
              <div style={styles.wrapRow}>
                <span style={styles.badgeMuted}>{record.totalVisits} visits</span>
                <span style={record.totalReturnJobs > 0 ? styles.badgeDanger : styles.badgeBlue}>
                  {record.totalReturnJobs} return jobs
                </span>
              </div>
            </div>

            {record.repeatIssueCategories.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {record.repeatIssueCategories.map((cat) => (
                  <span key={cat} style={styles.badgeWarn}>
                    {cat} repeat issue
                  </span>
                ))}
              </div>
            )}

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {roList
                .slice()
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((ro) => {
                  const f = getROFinancials(ro);
                  return (
                    <div key={ro.id} style={styles.innerBlock}>
                      <div style={styles.rowBetween}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{ro.roNumber}</div>
                          <div style={{ fontSize: 13, color: "#6b7280" }}>
                            {new Date(ro.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div style={styles.wrapRow}>
                          <span style={getROBadgeStyle(ro.status)}>{ro.status}</span>
                          {ro.isReturnJob && (
                            <span style={styles.badgeDanger}>
                              <RotateCcw size={12} style={{ marginRight: 4 }} /> Comeback
                            </span>
                          )}
                        </div>
                      </div>

                      {ro.isReturnJob && (
                        <div style={{ marginTop: 6, color: "#dc2626", fontWeight: 600 }}>
                          Return Reason: {ro.returnReason || "No reason specified"}
                        </div>
                      )}

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Approved Work</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {ro.workLines
                            .filter((w) => w.approvalStatus !== "Declined")
                            .map((w) => (
                              <span key={w.id} style={styles.badgeMuted}>
                                {w.label}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Parts Replaced</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {parts
                            .filter((p) => p.roNumber === ro.roNumber && p.status !== "Cancelled")
                            .map((p) => (
                              <span key={p.id} style={styles.badgeBlue}>
                                {p.partName || "Unnamed Part"} x{p.qty}
                              </span>
                            ))}
                        </div>
                      </div>

                      {ro.inspectionPhotos.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>Inspection Photos</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {ro.inspectionPhotos.map((photo) => (
                              <span key={photo.id} style={styles.badgeMuted}>
                                {photo.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {ro.workLines.some((w) => w.photos.length > 0) && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>Workline Photos</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {ro.workLines.flatMap((w) => w.photos.map((photo) => ({ line: w.label, ...photo }))).map((photo) => (
                              <span key={photo.id} style={styles.badgeBlue}>
                                {photo.stage}: {photo.line}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ ...styles.summaryRow, marginTop: 10 }}>
                        <span>Total: ₱{f.total.toLocaleString()}</span>
                        <span>Paid: ₱{f.paid.toLocaleString()}</span>
                        <span>Balance: ₱{f.balance.toLocaleString()}</span>
                      </div>

                      {backJobs.filter((item) => item.linkedOriginalRoId === ro.id).length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>Back Job Records</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {backJobs.filter((item) => item.linkedOriginalRoId === ro.id).map((item) => (
                              <span key={item.id} style={styles.badgeDanger}>
                                {item.backJobInvoiceNumber || "Back Job"} • {item.status}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const BackJobView = () => (
    <div>
      <div style={styles.rowBetween}>
        <h2 style={styles.heading}>Back Job Management</h2>
        <span style={styles.badgeDark}>{backJobs.length} record(s)</span>
      </div>

      {backJobs.length === 0 && (
        <div style={styles.cardBlock}>
          No back jobs yet. Create one from a released or historical RO using the Create Back Job button.
        </div>
      )}

      {backJobs.map((item) => (
        <div key={item.id} style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700 }}>{item.backJobInvoiceNumber || "Back Job"}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Linked RO: {item.linkedOriginalRoNumber || "-"} • {item.plateNumber || "No Plate"} • {item.customerName || "No Customer"}
              </div>
            </div>
            <div style={styles.wrapRow}>
              <span style={item.costType === "Customer" ? styles.badgeBlue : item.costType === "Internal" ? styles.badgeWarn : styles.badgeGood}>{item.costType}</span>
              <span style={item.status === "Released" ? styles.badgeGood : item.status === "Resolved" ? styles.badgeBlue : item.status === "In Progress" ? styles.badgeWarn : styles.badgeMuted}>{item.status}</span>
            </div>
          </div>

          <div style={{ ...styles.formGrid, marginTop: 12 }}>
            <input style={styles.input} placeholder="Report Date" type="date" value={item.reportDate ? new Date(item.reportDate).toISOString().slice(0,10) : ""} onChange={(e) => updateBackJob(item.id, { reportDate: e.target.value ? new Date(e.target.value).getTime() : Date.now() })} />
            <input style={styles.input} placeholder="Back Job Take-In Date" type="date" value={item.takeInDate} onChange={(e) => updateBackJob(item.id, { takeInDate: e.target.value })} />
            <input style={styles.input} placeholder="Plate Number *" value={item.plateNumber} onChange={(e) => updateBackJob(item.id, { plateNumber: e.target.value.toUpperCase() })} />
            <input style={styles.input} placeholder="Customer Name" value={item.customerName} onChange={(e) => updateBackJob(item.id, { customerName: e.target.value })} />
            <input style={styles.input} placeholder="Vehicle" value={item.vehicle} onChange={(e) => updateBackJob(item.id, { vehicle: e.target.value })} />
            <input style={styles.input} placeholder="Initial Invoice #" value={item.initialInvoiceNumber} onChange={(e) => updateBackJob(item.id, { initialInvoiceNumber: e.target.value })} />
            <input style={styles.input} placeholder="Initial Release Date" type="date" value={item.initialReleaseDate} onChange={(e) => updateBackJob(item.id, { initialReleaseDate: e.target.value })} />
            <input style={styles.input} placeholder="Initial Mechanic" value={item.initialMechanic} onChange={(e) => updateBackJob(item.id, { initialMechanic: e.target.value })} />
            <input style={styles.input} placeholder="QC Performed By" value={item.qcPerformedBy} onChange={(e) => updateBackJob(item.id, { qcPerformedBy: e.target.value })} />
            <input style={styles.input} placeholder="Back Job Invoice #" value={item.backJobInvoiceNumber} onChange={(e) => updateBackJob(item.id, { backJobInvoiceNumber: e.target.value })} />
            <input style={styles.input} placeholder="Current Mechanic" value={item.currentMechanic} onChange={(e) => updateBackJob(item.id, { currentMechanic: e.target.value })} />
            <input style={styles.input} placeholder="Supporting Mechanics (comma separated)" value={item.supportingMechanics.join(", ")} onChange={(e) => updateBackJob(item.id, { supportingMechanics: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })} />
            <input style={styles.input} placeholder="Back Job Type" value={item.backJobType} onChange={(e) => updateBackJob(item.id, { backJobType: e.target.value })} />
            <select style={styles.input} value={item.status} onChange={(e) => updateBackJob(item.id, { status: e.target.value as BackJobStatus })}>
              {["Pending", "In Progress", "Resolved", "Released"].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select style={styles.input} value={item.costType} onChange={(e) => updateBackJob(item.id, { costType: e.target.value as BackJobCostType })}>
              {["Warranty", "Internal", "Customer"].map((costType) => <option key={costType} value={costType}>{costType}</option>)}
            </select>
            <input style={styles.input} type="number" placeholder="Cost PHP" value={item.costPhp} onChange={(e) => updateBackJob(item.id, { costPhp: Number(e.target.value) || 0 })} />
            <input style={styles.input} placeholder="Root Cause Category" value={item.rootCauseCategory} onChange={(e) => updateBackJob(item.id, { rootCauseCategory: e.target.value })} />
            <input style={styles.input} placeholder="Stage Responsible" value={item.stageResponsible} onChange={(e) => updateBackJob(item.id, { stageResponsible: e.target.value })} />
          </div>

          <div style={{ marginTop: 12 }}>
            <TextArea label="Initial Concern" value={item.initialConcern} onChange={(value) => updateBackJob(item.id, { initialConcern: value })} />
          </div>
          <div style={{ marginTop: 12 }}>
            <TextArea label="Findings" value={item.findings} onChange={(value) => updateBackJob(item.id, { findings: value })} />
          </div>
          <div style={{ marginTop: 12 }}>
            <TextArea label="Fix Performed" value={item.fixPerformed} onChange={(value) => updateBackJob(item.id, { fixPerformed: value })} />
          </div>
          <div style={{ marginTop: 12 }}>
            <TextArea label="Root Cause Notes" value={item.rootCauseNotes} onChange={(value) => updateBackJob(item.id, { rootCauseNotes: value })} />
          </div>
        </div>
      ))}
    </div>
  );


  const SalesReportsView = () => (
    <div>
      <div style={styles.rowBetween}>
        <h2 style={styles.heading}>Sales Report</h2>
        <div style={{ color: "#6b7280", fontSize: 13 }}>Currency: PHP only</div>
      </div>

      {!canViewSalesReports ? (
        <div style={styles.cardBlock}>You do not have permission to view sales reports.</div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <MoneyCard title="Gross Sales (Month)" value={salesCurrentMonthSummary.totalGrossSales} />
            <MoneyCard title="Tire Sales (Month)" value={salesCurrentMonthSummary.totalTireSales} />
            <MoneyCard title="Net Sales less Tires" value={salesCurrentMonthSummary.totalNetSalesLessTires} />
            <MetricCard title="Encoded Sales Days" value={salesCurrentMonthSummary.encodedSalesDays} />
            <MoneyCard title="Average Daily Sales" value={salesCurrentMonthSummary.averageDailySales} />
            <MoneyCard title="Monthly Projection" value={salesCurrentMonthSummary.monthlyProjection} />
            <MoneyCard title="Average Monthly Sales" value={yearlySalesTable.averageMonthlySales} />
            <MoneyCard title="Year Projection" value={yearlySalesTable.yearProjection} />
          </div>

          <div style={{ ...styles.shopGrid, marginTop: 16 }}>
            <div style={styles.cardBlock}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Daily Sales Entry</div>
              {!canEditSalesReports ? (
                <div style={{ color: "#6b7280" }}>Only Service Advisor and management can encode sales.</div>
              ) : (
                <>
                  <div style={styles.formGrid}>
                    <input
                      style={styles.input}
                      type="date"
                      value={salesForm.entryDate}
                      onChange={(e) => setSalesForm((prev) => ({ ...prev, entryDate: e.target.value }))}
                    />
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Gross Sales PHP"
                      value={salesForm.grossSales}
                      onChange={(e) => setSalesForm((prev) => ({ ...prev, grossSales: e.target.value }))}
                    />
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Tire Sales PHP"
                      value={salesForm.tireSales}
                      onChange={(e) => setSalesForm((prev) => ({ ...prev, tireSales: e.target.value }))}
                    />
                    <input
                      style={styles.input}
                      placeholder="Notes"
                      value={salesForm.notes}
                      onChange={(e) => setSalesForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <div style={{ ...styles.summaryRow, marginTop: 10 }}>
                    <span>Net Sales less Tires: ₱{round2((Number(salesForm.grossSales) || 0) - (Number(salesForm.tireSales) || 0)).toLocaleString()}</span>
                    <span>Encoded By: {user?.username || "-"}</span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <button style={styles.primaryButton} onClick={saveSalesEntry}>
                      Save Sales Entry
                    </button>
                  </div>
                </>
              )}
            </div>

            <div style={styles.cardBlock}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Recent Daily Entries</div>
              {sortedSalesEntries.length === 0 ? (
                <div style={{ color: "#6b7280" }}>No sales entries yet.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {sortedSalesEntries.slice(0, 12).map((entry) => (
                    <div key={entry.id} style={styles.logRow}>
                      <div style={styles.rowBetween}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{entry.entryDate}</div>
                          <div style={{ fontSize: 13, color: "#6b7280" }}>Encoded by {entry.encodedBy} • {entry.encodedRole}</div>
                        </div>
                        <div style={styles.wrapRow}>
                          <span style={styles.badgeBlue}>Net ₱{entry.netSalesLessTires.toLocaleString()}</span>
                          {canEditSalesReports && <button style={styles.secondaryButton} onClick={() => loadSalesEntryToForm(entry)}>Edit</button>}
                          {canEditSalesReports && <button style={styles.dangerButton} onClick={() => deleteSalesEntry(entry.id)}>Delete</button>}
                        </div>
                      </div>
                      <div style={{ ...styles.summaryRow, marginTop: 8 }}>
                        <span>Gross: ₱{entry.grossSales.toLocaleString()}</span>
                        <span>Tires: ₱{entry.tireSales.toLocaleString()}</span>
                        <span>Net less Tires: ₱{entry.netSalesLessTires.toLocaleString()}</span>
                      </div>
                      {entry.notes && <div style={{ marginTop: 6, fontSize: 13 }}>{entry.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.cardBlock}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Monthly Totals Table — {yearlySalesTable.year}</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 840 }}>
                <thead>
                  <tr>
                    {["Month", "Gross Sales", "Tire Sales", "Net less Tires", "Encoded Days", "Avg Daily Sales", "Monthly Projection"].map((head) => (
                      <th key={head} style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "10px 8px", fontSize: 13, color: "#374151" }}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {yearlySalesTable.rows.map((row) => (
                    <tr key={row.key}>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>{row.monthLabel}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>₱{row.grossSales.toLocaleString()}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>₱{row.tireSales.toLocaleString()}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>₱{row.netSalesLessTires.toLocaleString()}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>{row.encodedSalesDays}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>₱{row.averageDailySales.toLocaleString()}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f4f6" }}>₱{row.monthlyProjection.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...styles.summaryRow, marginTop: 12 }}>
              <span>Average Monthly Sales: ₱{yearlySalesTable.averageMonthlySales.toLocaleString()}</span>
              <strong>Year Projection: ₱{yearlySalesTable.yearProjection.toLocaleString()}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const ActivityLogsView = () => (
    <div>
      <div style={styles.rowBetween}>
        <h2 style={styles.heading}>Activity Logs</h2>
        <div style={{ color: "#6b7280", fontSize: 13 }}>
          Manager / Assistant Manager / Admin only
        </div>
      </div>

      {!canViewActivityLogs ? (
        <div style={styles.cardBlock}>You do not have permission to view activity logs.</div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <MetricCard title="Total Logs" value={activityLogs.length} />
            <MetricCard title="Users With Activity" value={activityLogSummaryByUser.length} />
            <MetricCard title="RO Logs" value={activityLogs.filter((entry) => entry.module === "RO").length} />
            <MetricCard title="Parts Logs" value={activityLogs.filter((entry) => entry.module === "Parts" || entry.module === "Supplier").length} />
            <MetricCard title="Sales Logs" value={activityLogs.filter((entry) => entry.module === "Sales").length} />
          </div>

          <div style={{ ...styles.shopGrid, marginTop: 16 }}>
            <div style={styles.cardBlock}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Per-User Activity</div>
              <div style={{ display: "grid", gap: 8 }}>
                {activityLogSummaryByUser.length === 0 ? (
                  <div style={{ color: "#6b7280" }}>No activity yet.</div>
                ) : (
                  activityLogSummaryByUser.map(([username, count]) => (
                    <div key={username} style={styles.shopMiniRow}>
                      <span>{username}</span>
                      <span>{count} log(s)</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.cardBlock}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Recent System Activity</div>
              <div style={{ display: "grid", gap: 8 }}>
                {filteredActivityLogs.slice(0, 25).map((entry) => (
                  <div key={entry.id} style={styles.logRow}>
                    <div style={styles.rowBetween}>
                      <div style={{ fontWeight: 700 }}>{entry.action}</div>
                      <span style={styles.badgeMuted}>{entry.module}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                      {new Date(entry.timestamp).toLocaleString()} • {entry.user} • {entry.role}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <strong>Reference:</strong> {entry.recordReference}
                    </div>
                    {entry.note && (
                      <div style={{ marginTop: 6 }}>
                        <strong>Note:</strong> {entry.note}
                      </div>
                    )}
                    {(entry.oldValue || entry.newValue) && (
                      <details style={{ marginTop: 8 }}>
                        <summary style={{ cursor: "pointer", fontWeight: 600 }}>View change details</summary>
                        {entry.oldValue && (
                          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                            <strong>Old:</strong> {entry.oldValue}
                          </div>
                        )}
                        {entry.newValue && (
                          <div style={{ marginTop: 8, fontSize: 12, color: "#111827" }}>
                            <strong>New:</strong> {entry.newValue}
                          </div>
                        )}
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const EmployeeView = () => {
    const sortedEmployees = filteredEmployees;
    return (
      <div>
        <div style={styles.rowBetween}>
          <div>
            <h2 style={styles.heading}>Employee Master + Attendance</h2>
            <div style={{ color: "#6b7280", marginTop: -8 }}>
              Manage employee records, login credentials, allowed views, and daily attendance tracking.
            </div>
          </div>
          <div style={styles.wrapRow}>
            <button style={styles.secondaryButton} onClick={resetEmployeeForm}>New Employee</button>
            <button style={styles.secondaryButton} onClick={() => setView("tech")}>Open Technician Board</button>
            <span style={styles.badgeBlue}>Attendance Date: {attendanceBoardDate}</span>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <MetricCard title="Total Employees" value={employees.length} />
          <MetricCard title="Active Accounts" value={employees.filter((employee) => employee.active).length} />
          <MetricCard title="Present / Late" value={attendanceBoardSummary.present + attendanceBoardSummary.late} />
          <MetricCard title="Checked Out" value={attendanceBoardSummary.checkedOut} />
        </div>

        <div style={{ ...styles.shopGrid, marginTop: 16 }}>
          <div style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div style={{ fontWeight: 700 }}>{selectedEmployeeId ? "Edit Employee" : "Create Employee"}</div>
              {!canManageEmployees && <span style={styles.badgeWarn}>Read-only: management or admin required</span>}
            </div>
            <div style={styles.formGrid}>
              <input disabled={!canManageEmployees} style={styles.input} placeholder="Employee Code" value={employeeForm.employeeCode} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, employeeCode: e.target.value }))} />
              <input disabled={!canManageEmployees} style={styles.input} placeholder="First Name" value={employeeForm.firstName} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, firstName: e.target.value }))} />
              <input disabled={!canManageEmployees} style={styles.input} placeholder="Last Name" value={employeeForm.lastName} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, lastName: e.target.value }))} />
              <input disabled={!canManageEmployees} style={styles.input} placeholder="Display Name" value={employeeForm.displayName} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, displayName: e.target.value }))} />
              <select disabled={!canManageEmployees} style={styles.input} value={employeeForm.role} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}>
                {["Admin", "Management", "Service Advisor", "Office Staff", "Technician", "Mechanic", "Reception"].map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <input disabled={!canManageEmployees} style={styles.input} placeholder="Department" value={employeeForm.department} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, department: e.target.value }))} />
              <input disabled={!canManageEmployees} style={styles.input} placeholder="Phone" value={employeeForm.phone} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <input disabled={!canManageEmployees} style={styles.input} placeholder="Username" value={employeeForm.username} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, username: e.target.value }))} />
              <input disabled={!canManageEmployees} style={styles.input} placeholder="Password" value={employeeForm.password} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, password: e.target.value }))} />
            </div>
            <div style={{ ...styles.wrapRow, marginTop: 12 }}>
              <label style={styles.checkboxRow}>
                <input disabled={!canManageEmployees} type="checkbox" checked={employeeForm.active} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, active: e.target.checked }))} />
                <span>Active</span>
              </label>
              <label style={styles.checkboxRow}>
                <input disabled={!canManageEmployees} type="checkbox" checked={employeeForm.mustChangePassword} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, mustChangePassword: e.target.checked }))} />
                <span>Must Change Password</span>
              </label>
            </div>

            <div style={{ ...styles.innerBlock, marginTop: 12 }}>
              <div style={styles.rowBetween}>
                <div style={{ fontWeight: 700 }}>Allowed Views / Permission Lock</div>
                {canManagePermissions ? (
                  <div style={styles.wrapRow}>
                    <button style={styles.secondaryButton} onClick={() => applyAllowedViewPreset(employeeForm.role)}>Use Role Default</button>
                    <button style={styles.secondaryButton} onClick={() => setEmployeeForm((prev) => ({ ...prev, allowedViews: [...ALL_VIEWS] }))}>Allow All</button>
                  </div>
                ) : (
                  <span style={styles.badgeMuted}>Admin only</span>
                )}
              </div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
                When blank, the app uses the default views for the selected role. Custom view locks override the role default.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 12 }}>
                {ALL_VIEWS.map((targetView) => {
                  const checked = (employeeForm.allowedViews?.length ? employeeForm.allowedViews : getDefaultAllowedViewsForRole(employeeForm.role)).includes(targetView);
                  const customChecked = Boolean(employeeForm.allowedViews?.includes(targetView));
                  return (
                    <label key={targetView} style={{ ...styles.checkboxRow, border: "1px solid #e5e7eb", borderRadius: 12, padding: "8px 10px", background: customChecked ? "#eff6ff" : "#f8fafc" }}>
                      <input
                        disabled={!canManagePermissions}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const base = employeeForm.allowedViews?.length ? employeeForm.allowedViews : getDefaultAllowedViewsForRole(employeeForm.role);
                          const next = e.target.checked
                            ? Array.from(new Set([...base, targetView]))
                            : base.filter((entry) => entry !== targetView);
                          setEmployeeForm((prev) => ({ ...prev, allowedViews: next }));
                        }}
                      />
                      <span>{VIEW_TITLES[targetView]?.title || targetView}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ ...styles.wrapRow, marginTop: 12 }}>
              <button disabled={!canManageEmployees} style={styles.primaryButton} onClick={saveEmployee}>{selectedEmployeeId ? "Update Employee" : "Save Employee"}</button>
              <button style={styles.secondaryButton} onClick={resetEmployeeForm}>Clear Form</button>
            </div>
          </div>

          <div style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div style={{ fontWeight: 700 }}>Employee List</div>
              <div style={styles.wrapRow}>
                <input style={{ ...styles.input, minWidth: 180 }} placeholder="Search employee" value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} />
                <select style={styles.input} value={attendanceStatusFilter} onChange={(e) => setAttendanceStatusFilter(e.target.value as "All" | AttendanceStatus)}>
                  {["All", "Present", "Late", "Absent", "Half Day", "On Leave"].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {sortedEmployees.map((employee) => {
                const employeeAttendance = attendanceMapForBoardDate[employee.id];
                const employeeAllowedViews = employee.allowedViews?.length ? employee.allowedViews : getDefaultAllowedViewsForRole(employee.role);
                return (
                  <div key={employee.id} style={styles.logRow}>
                    <div style={styles.rowBetween}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{employee.displayName}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{employee.employeeCode} • {employee.username} • {employee.role}</div>
                      </div>
                      <div style={styles.wrapRow}>
                        <span style={employee.active ? styles.badgeGood : styles.badgeMuted}>{employee.active ? "Active" : "Inactive"}</span>
                        <span style={employeeAttendance?.status === "Late" ? styles.badgeWarn : employeeAttendance?.status === "Present" ? styles.badgeGood : employeeAttendance?.status === "Half Day" ? styles.badgeBlue : styles.badgeMuted}>
                          {employeeAttendance?.status || "No Record"}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13, color: "#374151" }}>
                      <div>Department: {employee.department || "-"}</div>
                      <div>Phone: {employee.phone || "-"}</div>
                      <div>Check In / Out: {employeeAttendance?.checkInTime || "-"} / {employeeAttendance?.checkOutTime || "-"}</div>
                      <div>Allowed Views: {employeeAllowedViews.map((targetView) => VIEW_TITLES[targetView]?.title || targetView).join(", ")}</div>
                    </div>
                    <div style={{ ...styles.wrapRow, marginTop: 10 }}>
                      <button style={styles.secondaryButton} onClick={() => startEmployeeEdit(employee)}>Edit</button>
                      {canManageEmployees && <button style={styles.secondaryButton} onClick={() => toggleEmployeeActive(employee.id)}>{employee.active ? "Set Inactive" : "Set Active"}</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div>
              <div style={{ fontWeight: 700 }}>Daily Attendance Board</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                Check in, check out, update status, and prepare the technician board from employee attendance.
              </div>
            </div>
            <div style={styles.wrapRow}>
              <input style={styles.input} type="date" value={attendanceBoardDate} onChange={(e) => setAttendanceBoardDate(e.target.value)} />
              <button style={styles.secondaryButton} onClick={() => setAttendanceBoardDate(getTodayDateString())}>Today</button>
              {!canManageAttendance && <span style={styles.badgeWarn}>Read-only attendance</span>}
            </div>
          </div>

          <div style={{ ...styles.statsGrid, marginTop: 14 }}>
            <MetricCard title="Present" value={attendanceBoardSummary.present} />
            <MetricCard title="Late" value={attendanceBoardSummary.late} />
            <MetricCard title="Half Day" value={attendanceBoardSummary.halfDay} />
            <MetricCard title="On Leave" value={attendanceBoardSummary.onLeave} />
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {sortedEmployees.map((employee) => {
              const record = attendanceMapForBoardDate[employee.id];
              return (
                <div key={`attendance-${employee.id}`} style={styles.logRow}>
                  <div style={styles.rowBetween}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{employee.displayName}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{employee.role} • {employee.department || "-"}</div>
                    </div>
                    <div style={styles.wrapRow}>
                      <span style={record?.status === "Present" ? styles.badgeGood : record?.status === "Late" ? styles.badgeWarn : record?.status === "Half Day" ? styles.badgeBlue : styles.badgeMuted}>
                        {record?.status || "Absent"}
                      </span>
                      <span style={styles.badgeMuted}>In: {record?.checkInTime || "-"}</span>
                      <span style={styles.badgeMuted}>Out: {record?.checkOutTime || "-"}</span>
                    </div>
                  </div>

                  <div style={{ ...styles.wrapRow, marginTop: 10 }}>
                    <button disabled={!canManageAttendance} style={styles.primaryButton} onClick={() => handleEmployeeCheckIn(employee)}>Check In</button>
                    <button disabled={!canManageAttendance} style={styles.secondaryButton} onClick={() => handleEmployeeCheckOut(employee)}>Check Out</button>
                    <button disabled={!canManageAttendance} style={styles.secondaryButton} onClick={() => setEmployeeAttendanceStatus(employee, "Late")}>Late</button>
                    <button disabled={!canManageAttendance} style={styles.secondaryButton} onClick={() => setEmployeeAttendanceStatus(employee, "Half Day")}>Half Day</button>
                    <button disabled={!canManageAttendance} style={styles.secondaryButton} onClick={() => setEmployeeAttendanceStatus(employee, "On Leave")}>On Leave</button>
                    <button disabled={!canManageAttendance} style={styles.secondaryButton} onClick={() => setEmployeeAttendanceStatus(employee, "Absent")}>Absent</button>
                  </div>

                  <div style={{ ...styles.formGrid, marginTop: 10 }}>
                    <input
                      disabled={!canManageAttendance}
                      style={styles.input}
                      placeholder="Attendance note"
                      value={record?.note || ""}
                      onChange={(e) => updateAttendanceNote(employee, e.target.value)}
                    />
                    <input disabled style={styles.input} value={record?.encodedBy || "-"} placeholder="Encoded by" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /* =========================
     LOGIN
  ========================= */

  if (!user) {
    return (
      <div style={styles.loginWrap}>
        <div style={styles.loginAccent} />
        <div style={styles.loginCard}>
          <div style={styles.loginEyebrow}>Automotive Service Management Platform</div>
          <h1 style={styles.title}>{SHOP_NAME}</h1>
          <p style={{ marginTop: 0, marginBottom: 10, color: "#475569", fontSize: 15 }}>
            {SHOP_SLOGAN}
          </p>
          <div style={styles.statusChip}>Build Version: {BUILD_VERSION}</div>
          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            <div style={styles.metricMini}>
              <div style={styles.mutedLabel}>Access</div>
              <strong>Employee login + permissions + attendance foundation</strong>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            <input style={styles.input} placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
            <input style={styles.input} type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }} />
            {loginError && <div style={{ color: "#dc2626", fontSize: 13 }}>{loginError}</div>}
          </div>
          <button style={{ ...styles.primaryButton, width: "100%", justifyContent: "center", marginTop: 18 }} onClick={handleLogin}>
            Sign In
          </button>
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Quick Access</div>
            <div style={styles.wrapRow}>
              {employees.filter((employee) => employee.active).slice(0, 3).map((employee) => (
                <button key={employee.id} style={styles.secondaryButton} onClick={() => quickLoginAs(employee)}>
                  {employee.role}: {employee.username}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.loginFooter}>Designed by Jomar Carlo Orlanda</div>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div style={{ ...styles.appWrap, flexDirection: isCompact ? "column" : "row" }}>
      <aside style={{ ...styles.sidebar, width: isCompact ? "100%" : styles.sidebar.width, minWidth: isCompact ? "100%" : styles.sidebar.minWidth, padding: isPhone ? 12 : isTablet ? 14 : 18, position: isCompact ? "sticky" : "relative", top: isCompact ? 0 : undefined, zIndex: isCompact ? 20 : undefined, maxHeight: isCompact ? "unset" : "100vh" }}>
        <div style={styles.sidebarBrand}>
          <div style={styles.sidebarBrandTitle}>{SHOP_NAME}</div>
          <div style={styles.sidebarBrandSub}>{SHOP_SLOGAN}</div>
          <div style={{ ...styles.loginEyebrow, marginBottom: 0, marginTop: 10 }}>{BUILD_VERSION}</div>
        </div>

        <div style={{ ...styles.sidebarSection, gridTemplateColumns: isCompact ? "repeat(2, minmax(0, 1fr))" : "1fr" }}>
          {canAccessViewForUser(user, "dashboard") && <NavButton icon={<Home size={16} />} label="Dashboard" isActive={view === "dashboard"} onClick={() => setView("dashboard")} />}
          {canAccessViewForUser(user, "vehicleIntake") && <NavButton icon={<Car size={16} />} label="Vehicle Intake" isActive={view === "vehicleIntake"} onClick={() => setView("vehicleIntake")} />}
          {canAccessViewForUser(user, "inspection") && <NavButton icon={<ClipboardList size={16} />} label="Inspection" isActive={view === "inspection"} onClick={() => setView("inspection")} />}
          {canAccessViewForUser(user, "approval") && <NavButton icon={<FileText size={16} />} label="Approval" isActive={view === "approval"} onClick={() => setView("approval")} />}
          {canAccessViewForUser(user, "ro") && <NavButton icon={<Car size={16} />} label="RO" isActive={view === "ro"} onClick={() => setView("ro")} />}
          {canAccessViewForUser(user, "parts") && <NavButton icon={<Package size={16} />} label="Parts" isActive={view === "parts"} onClick={() => setView("parts")} />}
          {canAccessViewForUser(user, "shop") && <NavButton icon={<Wrench size={16} />} label="Shop" isActive={view === "shop"} onClick={() => setView("shop")} />}
          {canAccessViewForUser(user, "tech") && <NavButton icon={<Users size={16} />} label="Tech" isActive={view === "tech"} onClick={() => setView("tech")} />}
          {canAccessViewForUser(user, "billing") && <NavButton icon={<Receipt size={16} />} label="Billing" isActive={view === "billing"} onClick={() => setView("billing")} />}
          {canAccessViewForUser(user, "history") && <NavButton icon={<History size={16} />} label="History" isActive={view === "history"} onClick={() => setView("history")} />}
          {canAccessViewForUser(user, "purchasing") && <NavButton icon={<ShoppingCart size={16} />} label="Purchasing" isActive={view === "purchasing"} onClick={() => setView("purchasing")} />}
          {canAccessViewForUser(user, "inventory") && <NavButton icon={<Warehouse size={16} />} label="Inventory" isActive={view === "inventory"} onClick={() => setView("inventory")} />}
          {canAccessViewForUser(user, "employees") && <NavButton icon={<UserCog size={16} />} label="Employees" isActive={view === "employees"} onClick={() => setView("employees")} />}
        </div>

        <div style={styles.sidebarFooter}>
          <div style={styles.mutedLabel}>Signed in as</div>
          <div style={{ fontWeight: 700, color: "#e5eefb" }}>{user.displayName || user.username}</div>
          <div style={{ color: "#9fb6d1", fontSize: 12 }}>{user.role}</div>
          <div style={{ color: "#9fb6d1", fontSize: 12 }}>{user.username}</div>
        </div>
      </aside>

      <main style={{ ...styles.main, padding: isPhone ? 12 : isTablet ? 14 : 18 }}>
        <div style={{ ...styles.topbar, alignItems: isCompact ? "flex-start" : "center" }}>
          <div>
            <div style={{ ...styles.topbarTitle, fontSize: isPhone ? 22 : isTablet ? 24 : 28 }}>{currentViewMeta.title}</div>
            <div style={styles.topbarSubtitle}>{currentViewMeta.subtitle}</div>
          </div>
          <div style={styles.topbarMeta}>
            <span style={styles.statusChip}>{BUILD_VERSION}</span>
            <span style={styles.statusChipMuted}>{user.role}</span>
          </div>
        </div>

        {draftBanner && (
          <div style={{ ...styles.cardBlock, marginBottom: 12, border: "1px solid #bfdbfe", background: "#eff6ff" }}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700, color: "#1d4ed8" }}>Draft Recovery</div>
                <div style={{ color: "#334155", fontSize: 13 }}>{draftBanner}</div>
                {lastAutoSavedAt && (
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                    Last auto-saved: {new Date(lastAutoSavedAt).toLocaleString()}
                  </div>
                )}
              </div>
              <div style={styles.wrapRow}>
                <button style={styles.secondaryButton} onClick={exportSystemBackup}>Export Backup</button>
                <button style={styles.secondaryButton} onClick={clearDraftRecovery}>Clear Drafts</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ ...styles.pageSurface, padding: isPhone ? 12 : isTablet ? 14 : 18, borderRadius: isPhone ? 16 : 24 }}>
          {renderSafeCurrentView()}
        </div>
      </main>
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function NavButton({
  icon,
  label,
  isActive = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button style={isActive ? styles.navButtonActive : styles.navButton} onClick={onClick}>
      <span style={styles.navIcon}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <div style={{ color: "#6b7280", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function MoneyCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <div style={{ color: "#6b7280", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>₱{value.toLocaleString()}</div>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ marginBottom: 6, fontWeight: 600, fontSize: 13 }}>{label}</div>
      <textarea
        style={{ ...styles.input, width: "100%", minHeight: 90, resize: "vertical" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/* =========================
   STYLES
========================= */

const styles: Record<string, React.CSSProperties> = {
  appWrap: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(180deg, #f3f7fc 0%, #edf3fb 100%)",
    color: "#0f172a",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  sidebar: {
    width: 278,
    minWidth: 278,
    background: "linear-gradient(180deg, #0f172a 0%, #16243a 100%)",
    color: "#e2e8f0",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    borderRight: "1px solid rgba(255,255,255,0.06)",
    boxSizing: "border-box",
  },
  sidebarBrand: {
    borderRadius: 18,
    padding: 16,
    background: "linear-gradient(135deg, rgba(37,99,235,0.24), rgba(59,130,246,0.1))",
    border: "1px solid rgba(147,197,253,0.18)",
  },
  sidebarBrandTitle: {
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.15,
    color: "#f8fafc",
  },
  sidebarBrandSub: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 6,
  },
  sidebarSection: {
    display: "grid",
    gap: 8,
    flex: 1,
    alignContent: "start",
  },
  sidebarFooter: {
    borderTop: "1px solid rgba(148,163,184,0.18)",
    paddingTop: 14,
  },
  main: {
    flex: 1,
    padding: 18,
    boxSizing: "border-box",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  topbarTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  topbarSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    maxWidth: 760,
  },
  topbarMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  statusChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: 999,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
    border: "1px solid #bfdbfe",
  },
  statusChipMuted: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: 999,
    background: "#ffffff",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #dbe4f0",
  },
  pageSurface: {
    borderRadius: 24,
    padding: 18,
    background: "rgba(255,255,255,0.8)",
    border: "1px solid #dde7f2",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.06)",
    backdropFilter: "blur(8px)",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.02)",
    color: "#dbe4f0",
    padding: "12px 12px",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 700,
    transition: "all 0.2s ease",
  },
  navButtonActive: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    border: "1px solid rgba(147,197,253,0.35)",
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(37,99,235,0.26), rgba(96,165,250,0.16))",
    color: "#ffffff",
    padding: "12px 12px",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 800,
    boxShadow: "0 10px 20px rgba(30,64,175,0.18)",
  },
  navIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
  },
  heading: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: -0.15,
    color: "#0f172a",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.5,
  },
  title: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 30,
    fontWeight: 800,
    lineHeight: 1.1,
    color: "#0f172a",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  metricCard: {
    border: "1px solid #dbe4f0",
    borderRadius: 18,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  cardBlock: {
    marginTop: 12,
    border: "1px solid #dbe4f0",
    borderRadius: 18,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  innerBlock: {
    marginTop: 10,
    border: "1px solid #e3ebf5",
    borderRadius: 14,
    background: "#f8fbff",
    padding: 14,
  },
  rowBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  wrapRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },
  issueGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 8,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 10,
  },
  metricMini: {
    border: "1px solid #dbe4f0",
    borderRadius: 14,
    background: "#f8fbff",
    padding: 12,
  },
  mutedLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },
  checkboxRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    border: "1px solid #dbe4f0",
    borderRadius: 12,
    padding: 10,
    background: "#ffffff",
    boxSizing: "border-box",
  },
  input: {
    border: "1px solid #cfd9e5",
    borderRadius: 12,
    padding: "12px 12px",
    background: "#ffffff",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    color: "#0f172a",
    boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.03)",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    borderRadius: 12,
    padding: "12px 15px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 10px 20px rgba(37,99,235,0.18)",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid #d1dbe8",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 700,
  },
  goodButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
  },
  dangerButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
  },
  summaryRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "center",
    fontSize: 14,
    color: "#334155",
  },
  logRow: {
    border: "1px solid #e3ebf5",
    borderRadius: 14,
    padding: 12,
    background: "#ffffff",
  },
  badgeDark: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: 999,
    background: "#0f172a",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
  },
  badgeMuted: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
  },
  badgeWarn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: 999,
    background: "#f59e0b",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
  },
  badgeGood: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: 999,
    background: "#16a34a",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
  },
  badgeBlue: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: 999,
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
  },
  badgePurple: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: 999,
    background: "#7c3aed",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
  },
  badgeDanger: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: 999,
    background: "#dc2626",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
  },
  shopGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },
  shopCard: {
    border: "1px solid #dbe4f0",
    borderRadius: 18,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  shopMiniRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
    fontSize: 13,
    color: "#334155",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  photoCard: {
    border: "1px solid #dbe4f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 12,
  },
  photoPreviewWrap: {
    width: "100%",
    aspectRatio: "4 / 3",
    borderRadius: 12,
    overflow: "hidden",
    background: "#eef2f7",
    border: "1px solid #dbe4f0",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  photoEmpty: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    color: "#64748b",
    fontSize: 13,
  },
  loginWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at top, #dbeafe 0%, #eff6ff 28%, #f8fafc 68%, #eef2ff 100%)",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: 20,
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  },
  loginAccent: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: 999,
    background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.04) 46%, rgba(37,99,235,0) 72%)",
    top: -160,
    right: -120,
  },
  loginCard: {
    width: "100%",
    maxWidth: 470,
    border: "1px solid #dbe4f0",
    borderRadius: 24,
    background: "rgba(255,255,255,0.96)",
    padding: 28,
    boxShadow: "0 24px 50px rgba(15, 23, 42, 0.12)",
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(12px)",
  },
  loginUpdateItem: {
    fontSize: 12,
    color: "#475569",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "8px 10px",
    lineHeight: 1.35,
  },
  loginEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(37,99,235,0.12)",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 14,
  },
  loginFooter: {
    marginTop: 16,
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
};