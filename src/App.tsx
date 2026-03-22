import React, { useEffect, useMemo, useState } from "react";
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
  | "inventory";

type UserRole = "Admin" | "Technician" | "Service Advisor" | "Manager" | "Assistant Manager";

type User = {
  username: string;
  password: string;
  role: UserRole;
};

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
  customer: string;
  customerPhone: string;
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
  | "tires";

type InspectionSelection = Record<InspectionIssueKey, boolean>;

type InspectionIssueDefinition = {
  key: InspectionIssueKey;
  label: string;
  category: string;
  defaultHours: number;
  defaultWorkLineLabel: string;
};

type InspectionForm = {
  plate: string;
  vehicle: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  customer: string;
  customerPhone: string;
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
  customerVisibleFindings: string;
  recommendationsSummary: string;
  serviceAdvisorNotes: string;
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
  { username: "admin", password: "admin123", role: "Admin" },
  { username: "manager", password: "manager123", role: "Manager" },
  { username: "assistant", password: "assistant123", role: "Assistant Manager" },
];

const SHOP_NAME = "Northeast Car Care Centre";
const SHOP_SLOGAN = "Professional Care For Every Journey";
const BUILD_VERSION = "Phase 15B — UI Components + Visual System";

const VIEW_TITLES: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Business intelligence, live operations, and management insights." },
  inspection: { title: "Inspection", subtitle: "Structured intake, findings, and arrival documentation." },
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
  { key: "brakes", label: "Brake Concern", category: "Brakes", defaultHours: 2.5, defaultWorkLineLabel: "Brake Inspection and Repair" },
  { key: "suspension", label: "Suspension Noise / Play", category: "Suspension", defaultHours: 3, defaultWorkLineLabel: "Suspension Inspection and Repair" },
  { key: "engine", label: "Engine Performance Issue", category: "Engine", defaultHours: 2, defaultWorkLineLabel: "Engine Diagnosis and Repair" },
  { key: "electrical", label: "Electrical Issue", category: "Electrical", defaultHours: 1.5, defaultWorkLineLabel: "Electrical System Check" },
  { key: "aircon", label: "Aircon Concern", category: "Aircon", defaultHours: 2, defaultWorkLineLabel: "Aircon Inspection and Service" },
  { key: "steering", label: "Steering Concern", category: "Steering", defaultHours: 2.5, defaultWorkLineLabel: "Steering System Inspection" },
  { key: "tires", label: "Tire / Alignment Concern", category: "Tires", defaultHours: 1.5, defaultWorkLineLabel: "Tire and Alignment Check" },
];

const EMPTY_INSPECTION_SELECTIONS: InspectionSelection = {
  brakes: false,
  suspension: false,
  engine: false,
  electrical: false,
  aircon: false,
  steering: false,
  tires: false,
};

const DEFAULT_ARRIVAL_CHECKS: ArrivalCheckMap = {
  lights: { status: "Not Checked", note: "" },
  brokenGlass: { status: "Not Checked", note: "" },
  wipers: { status: "Not Checked", note: "" },
  hornCondition: { status: "Not Checked", note: "" },
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
  customer: "",
  customerPhone: "",
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
  customerVisibleFindings: "",
  recommendationsSummary: "",
  serviceAdvisorNotes: "",
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

/* =========================
   HELPERS
========================= */

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
    roNumber: ro.roNumber || `RO-${Date.now()}`,
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


function buildInspectionVehicleLabel(form: InspectionForm): string {
  const composed = [form.vehicleYear, form.vehicleMake, form.vehicleModel]
    .map((v) => v.trim())
    .filter(Boolean)
    .join(" ");
  return composed || form.vehicle.trim();
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

  const [inspectionForm, setInspectionForm] = useState<InspectionForm>(DEFAULT_INSPECTION_FORM);
  const [paymentForms, setPaymentForms] = useState<Record<string, PaymentForm>>({});
  const [smsGatewaySettings, setSmsGatewaySettings] = useState<SmsGatewaySettings>(
    () => safeLoad("phase11a_sms_gateway", DEFAULT_SMS_GATEWAY_SETTINGS),
  );
  const [historySearch, setHistorySearch] = useState("");

  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(
    () => safeLoad("phase10_techs", DEFAULT_TECHNICIANS),
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(
    () => safeLoad("phase10_suppliers", DEFAULT_SUPPLIERS),
  );
  const [supplierBids, setSupplierBids] = useState<SupplierBid[]>(
    () => safeLoad("phase10_bids", []),
  );
  const [inventory, setInventory] = useState<InventoryItem[]>(
    () => safeLoad("phase10_inventory", DEFAULT_INVENTORY),
  );
  const [supplierForm, setSupplierForm] = useState<SupplierForm>(DEFAULT_SUPPLIER_FORM);
  const [bidForms, setBidForms] = useState<Record<string, BidForm>>({});
  const [inventoryForm, setInventoryForm] = useState<InventoryForm>(DEFAULT_INVENTORY_FORM);

  const [ros, setRos] = useState<RepairOrder[]>(() => safeLoad<Partial<RepairOrder>[]>("phase10_ros", []).map((ro) => normalizeLegacyRepairOrder(ro)));
  const [parts, setParts] = useState<PartRequest[]>(() => safeLoad("phase10_parts", []));
  const [backJobs, setBackJobs] = useState<BackJobRecord[]>(() => safeLoad<BackJobRecord[]>("phase13a_backjobs", []));
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(() => safeLoad<ActivityLogEntry[]>("phase13c_activity_logs", []));
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>(() => safeLoad<SalesEntry[]>("phase13d_sales_entries", []));
  const [salesForm, setSalesForm] = useState<SalesForm>(DEFAULT_SALES_FORM);

  useEffect(() => {
    localStorage.setItem("phase10_ros", JSON.stringify(ros));
  }, [ros]);

  useEffect(() => {
    localStorage.setItem("phase10_parts", JSON.stringify(parts));
  }, [parts]);

  useEffect(() => {
    localStorage.setItem("phase13a_backjobs", JSON.stringify(backJobs));
  }, [backJobs]);

  useEffect(() => {
    localStorage.setItem("phase13c_activity_logs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem("phase13d_sales_entries", JSON.stringify(salesEntries));
  }, [salesEntries]);

  useEffect(() => {
    localStorage.setItem("phase10_techs", JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem("phase10_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("phase10_bids", JSON.stringify(supplierBids));
  }, [supplierBids]);

  useEffect(() => {
    localStorage.setItem("phase10_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("phase11a_sms_gateway", JSON.stringify(smsGatewaySettings));
  }, [smsGatewaySettings]);

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

  const canViewActivityLogs = user?.role === "Admin" || user?.role === "Manager" || user?.role === "Assistant Manager";
  const canViewSalesReports = user?.role === "Admin" || user?.role === "Manager" || user?.role === "Assistant Manager";
  const canEditSalesReports =
    user?.role === "Admin" ||
    user?.role === "Manager" ||
    user?.role === "Assistant Manager" ||
    user?.role === "Service Advisor";

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


  /* =========================
     ACTIONS
  ========================= */

  const createRO = () => {
    const nextRO: RepairOrder = {
      id: uid(),
      roNumber: `RO-${Date.now()}`,
      plate: "",
      vehicle: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      customer: "",
      customerPhone: "",
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
      serviceAdvisorNotes: "",
      softLocked: false,
      lockOverrideReason: "",
    };
    recomputeAll([nextRO, ...ros], parts);
  };

  const createROFromInspection = () => {
    const generatedWorkLines = buildWorkLinesFromInspection(inspectionForm.issues);
    const computedVehicle = buildInspectionVehicleLabel(inspectionForm);

    const nextRO: RepairOrder = {
      id: uid(),
      roNumber: `RO-${Date.now()}`,
      plate: inspectionForm.plate,
      vehicle: computedVehicle,
      vehicleMake: inspectionForm.vehicleMake,
      vehicleModel: inspectionForm.vehicleModel,
      vehicleYear: inspectionForm.vehicleYear,
      customer: inspectionForm.customer,
      customerPhone: inspectionForm.customerPhone,
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
      serviceAdvisorNotes: inspectionForm.serviceAdvisorNotes,
      softLocked: false,
      lockOverrideReason: "",
    };

    recomputeAll([nextRO, ...ros], parts);
    setInspectionForm({ ...DEFAULT_INSPECTION_FORM, takeNotes: createDefaultTakeNotes(), arrivalChecks: { ...DEFAULT_ARRIVAL_CHECKS } });
    setView("approval");
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
      requestNumber: `PR-${Date.now()}`,
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
    const qcInspector = ro.qcChecklist?.inspector || "";
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
      backJobInvoiceNumber: `BJ-${Date.now()}`,
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

  const currentViewMeta = VIEW_TITLES[view] || { title: "Workspace", subtitle: "Manage your workshop operations." };

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


  const InspectionView = () => (
    <div>
      <div style={styles.rowBetween}>
        <div>
          <h2 style={styles.heading}>Inspection Recovery Workflow</h2>
          <div style={{ color: "#6b7280", marginTop: -8 }}>
            Plate first, vehicle details next, arrival checks, take notes, then optional customer details.
          </div>
        </div>
        <button style={styles.primaryButton} onClick={createROFromInspection}>
          Generate RO from Inspection
        </button>
      </div>

      <div style={styles.cardBlock}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>1. Vehicle Identification</div>
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Plate Number"
            value={inspectionForm.plate}
            onChange={(e) =>
              setInspectionForm((p) => ({ ...p, plate: e.target.value.toUpperCase() }))
            }
          />
          <input
            style={styles.input}
            placeholder="Make"
            value={inspectionForm.vehicleMake}
            onChange={(e) => setInspectionForm((p) => ({ ...p, vehicleMake: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Model"
            value={inspectionForm.vehicleModel}
            onChange={(e) => setInspectionForm((p) => ({ ...p, vehicleModel: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Year"
            value={inspectionForm.vehicleYear}
            onChange={(e) => setInspectionForm((p) => ({ ...p, vehicleYear: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Fallback Vehicle Description"
            value={inspectionForm.vehicle}
            onChange={(e) => setInspectionForm((p) => ({ ...p, vehicle: e.target.value }))}
          />
        </div>
        <div style={{ marginTop: 10, color: "#374151", fontSize: 14 }}>
          <strong>Preview:</strong> {buildInspectionVehicleLabel(inspectionForm) || "No vehicle identified yet"}
        </div>
      </div>

      <div style={styles.cardBlock}>
        <div style={styles.rowBetween}>
          <div style={{ fontWeight: 700 }}>2. Initial Exterior Photos</div>
          <button style={styles.secondaryButton} onClick={addInitialExteriorPhoto}>
            <Camera size={14} /> Add Exterior Photo
          </button>
        </div>
        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {inspectionForm.initialExteriorPhotos.length === 0 && (
            <div style={{ color: "#6b7280" }}>No exterior photos yet.</div>
          )}
          {inspectionForm.initialExteriorPhotos.map((photo) => (
            <div key={photo.id} style={styles.innerBlock}>
              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  placeholder="Photo label"
                  value={photo.label}
                  onChange={(e) => updateInitialExteriorPhoto(photo.id, "label", e.target.value)}
                />
                <input
                  style={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(e) => void uploadInitialExteriorPhotoFile(photo.id, e.target.files?.[0])}
                />
                <input
                  style={styles.input}
                  placeholder="Photo URL or paste image link"
                  value={photo.url.startsWith("data:") ? "" : photo.url}
                  onChange={(e) => updateInitialExteriorPhoto(photo.id, "url", e.target.value)}
                />
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
      </div>

      <div style={styles.cardBlock}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>3. Take Notes (3 Entries)</div>
        <div style={{ display: "grid", gap: 10 }}>
          {inspectionForm.takeNotes.map((item) => (
            <div key={item.id} style={styles.innerBlock}>
              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateTakeNote(item.id, "title", e.target.value)}
                />
                <input
                  style={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(e) => void uploadTakeNotePhotoFile(item.id, e.target.files?.[0])}
                />
                <input
                  style={styles.input}
                  placeholder="Photo URL or paste image link"
                  value={item.photoUrl.startsWith("data:") ? "" : item.photoUrl}
                  onChange={(e) => updateTakeNote(item.id, "photoUrl", e.target.value)}
                />
              </div>
              <div style={{ marginTop: 10 }}>
                <TextArea
                  label="Note"
                  value={item.note}
                  onChange={(value) => updateTakeNote(item.id, "note", value)}
                />
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
        <div style={{ fontWeight: 700, marginBottom: 10 }}>4. Arrival Inspection Checks</div>
        <div style={{ display: "grid", gap: 10 }}>
          {(["lights", "brokenGlass", "wipers", "hornCondition"] as ArrivalCheckKey[]).map((key) => (
            <div key={key} style={styles.innerBlock}>
              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  value={renderArrivalCheckLabel(key)}
                  disabled
                />
                <select
                  style={styles.input}
                  value={inspectionForm.arrivalChecks[key].status}
                  onChange={(e) => updateArrivalCheck(key, "status", e.target.value)}
                >
                  {["Not Checked", "OK", "Needs Attention"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  style={styles.input}
                  placeholder="Short note"
                  value={inspectionForm.arrivalChecks[key].note}
                  onChange={(e) => updateArrivalCheck(key, "note", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.cardBlock}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>5. Optional Customer Details / Advisor Notes</div>
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Customer Name"
            value={inspectionForm.customer}
            onChange={(e) => setInspectionForm((p) => ({ ...p, customer: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Customer Phone"
            value={inspectionForm.customerPhone}
            onChange={(e) => setInspectionForm((p) => ({ ...p, customerPhone: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Odometer"
            value={inspectionForm.odometer}
            onChange={(e) => setInspectionForm((p) => ({ ...p, odometer: e.target.value }))}
          />
          <select
            style={styles.input}
            value={inspectionForm.bay}
            onChange={(e) => setInspectionForm((p) => ({ ...p, bay: e.target.value }))}
          >
            {["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Bay 5"].map((bay) => (
              <option key={bay} value={bay}>
                {bay}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            value={inspectionForm.priority}
            onChange={(e) =>
              setInspectionForm((p) => ({ ...p, priority: e.target.value as Priority }))
            }
          >
            {["Low", "Normal", "High", "Urgent"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...styles.formGrid, marginTop: 10 }}>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={inspectionForm.isReturnJob}
              onChange={(e) =>
                setInspectionForm((p) => ({ ...p, isReturnJob: e.target.checked }))
              }
            />
            <span>Return Job / Comeback</span>
          </label>

          <input
            style={styles.input}
            placeholder="Return reason"
            value={inspectionForm.returnReason}
            onChange={(e) => setInspectionForm((p) => ({ ...p, returnReason: e.target.value }))}
          />

          <select
            style={styles.input}
            value={inspectionForm.linkedPreviousRoId}
            onChange={(e) =>
              setInspectionForm((p) => ({ ...p, linkedPreviousRoId: e.target.value }))
            }
          >
            <option value="">Link Previous RO (optional)</option>
            {ros.map((ro) => (
              <option key={ro.id} value={ro.id}>
                {ro.roNumber} • {ro.plate}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <TextArea
            label="Service Advisor Notes"
            value={inspectionForm.serviceAdvisorNotes}
            onChange={(value) =>
              setInspectionForm((p) => ({ ...p, serviceAdvisorNotes: value }))
            }
          />
        </div>
      </div>

      <div style={styles.cardBlock}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>6. Diagnostic Triggers</div>
        <div style={{ color: "#6b7280", marginBottom: 10 }}>
          These create work lines when you generate the RO.
        </div>
        <div style={styles.issueGrid}>
          {INSPECTION_ISSUES.map((issue) => (
            <label key={issue.key} style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={inspectionForm.issues[issue.key]}
                onChange={(e) =>
                  setInspectionForm((p) => ({
                    ...p,
                    issues: { ...p.issues, [issue.key]: e.target.checked },
                  }))
                }
              />
              <span>
                {issue.label} · {issue.defaultWorkLineLabel} · {issue.defaultHours}h
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

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

      {ros.map((ro) => (
        <div key={ro.id} style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div style={styles.wrapRow}>
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
                placeholder="Odometer"
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
              <span style={styles.badgeDark}>{ro.status}</span>
              {ro.isReturnJob && <span style={styles.badgeDanger}>Comeback</span>}
              <button style={styles.secondaryButton} onClick={() => printRepairOrder(ro)}>
                <Printer size={14} /> Print RO
              </button>
              {ro.softLocked && (
                <span style={styles.badgePurple}>
                  <Lock size={12} style={{ marginRight: 4 }} /> Released Lock
                </span>
              )}
            </div>
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

          {ro.inspectionPhotos.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Inspection Photos</div>
              <div style={styles.photoGrid}>
                {ro.inspectionPhotos.map((photo) => (
                  <div key={photo.id} style={styles.photoCard}>
                    <div style={{ ...styles.photoPreviewWrap, marginBottom: 8 }}>
                      {photo.url ? (
                        <img src={photo.url} alt={photo.label || "Inspection photo"} style={styles.photoPreview} />
                      ) : (
                        <div style={styles.photoEmpty}><Image size={18} /> No image</div>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{photo.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ro.serviceAdvisorNotes && (
            <div style={{ marginTop: 10, color: "#4b5563" }}>
              <strong>SA Notes:</strong> {ro.serviceAdvisorNotes}
            </div>
          )}

          {(ro.odometer || ro.customerVisibleFindings || ro.recommendationsSummary || ro.inspectionCompleted) && (
            <div style={{ ...styles.innerBlock, marginTop: 10 }}>
              <div style={styles.summaryRow}>
                <span style={styles.badgeMuted}>Odometer: {ro.odometer || "-"}</span>
                <span style={styles.badgeBlue}>{ro.inspectionCompleted ? "Inspection Complete" : "Waiting Inspection"}</span>
                <span style={ro.qcPassed ? styles.badgeGood : styles.badgeWarn}>{ro.qcPassed ? "QC Passed" : "QC Pending"}</span>
              </div>
              {ro.customerVisibleFindings && <div style={{ marginTop: 8 }}><strong>Findings:</strong> {ro.customerVisibleFindings}</div>}
              {ro.recommendationsSummary && <div style={{ marginTop: 8 }}><strong>Recommendations:</strong> {ro.recommendationsSummary}</div>}
            </div>
          )}

          {((ro.initialExteriorPhotos?.length || 0) > 0 || (ro.takeNotes?.length || 0) > 0) && (
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={styles.badgeBlue}>Exterior Photos: {ro.initialExteriorPhotos?.length || 0}</span>
              <span style={styles.badgeMuted}>Take Notes: {ro.takeNotes?.length || 0}</span>
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
              );})}
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
                <span style={styles.badgeMuted}>Assignment Logs: {line.assignmentLog.length}</span>
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
        </div>
      ))}
    </div>
  );

  const PartsView = () => (
    <div>
      <h2 style={styles.heading}>Parts + Supplier Bids</h2>

      {parts.length === 0 && <div style={styles.cardBlock}>No parts requests yet.</div>}

      {parts.map((part) => {
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
              </div>
            </div>

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
              <TextArea
                label="Part Photo URLs (one per line)"
                value={photosToMultiline(part.photos || [])}
                onChange={(value) => updatePart(part.id, { photos: multilineToPhotos(value) })}
              />
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
                  <input style={styles.input} placeholder="Received Time" value={part.receivedAt ? new Date(part.receivedAt).toLocaleString() : ""} disabled />
                </div>
                <div style={{ marginTop: 10 }}>
                  <TextArea label="Arrival Notes" value={part.receivedNotes || ""} onChange={(value) => updatePart(part.id, { receivedNotes: value })} />
                </div>
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
        {technicianLeaderboard.map((tech) => (
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
        ))}
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
            <input style={styles.input} placeholder="Plate Number" value={item.plateNumber} onChange={(e) => updateBackJob(item.id, { plateNumber: e.target.value.toUpperCase() })} />
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
              <strong>Unified staff login</strong>
            </div>
          </div>
          <button style={{ ...styles.primaryButton, width: "100%", justifyContent: "center", marginTop: 18 }} onClick={() => setUser(USERS[0])}>
            Sign In as {USERS[0].role}
          </button>
          <div style={styles.loginFooter}>Designed by Jomar Carlo Orlanda</div>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div style={styles.appWrap}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <div style={styles.sidebarBrandTitle}>{SHOP_NAME}</div>
          <div style={styles.sidebarBrandSub}>{SHOP_SLOGAN}</div>
          <div style={{ ...styles.loginEyebrow, marginBottom: 0, marginTop: 10 }}>{BUILD_VERSION}</div>
        </div>

        <div style={styles.sidebarSection}>
          <NavButton icon={<Home size={16} />} label="Dashboard" isActive={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavButton icon={<ClipboardList size={16} />} label="Inspection" isActive={view === "inspection"} onClick={() => setView("inspection")} />
          <NavButton icon={<FileText size={16} />} label="Approval" isActive={view === "approval"} onClick={() => setView("approval")} />
          <NavButton icon={<Car size={16} />} label="RO" isActive={view === "ro"} onClick={() => setView("ro")} />
          <NavButton icon={<Package size={16} />} label="Parts" isActive={view === "parts"} onClick={() => setView("parts")} />
          <NavButton icon={<Wrench size={16} />} label="Shop" isActive={view === "shop"} onClick={() => setView("shop")} />
          <NavButton icon={<Users size={16} />} label="Tech" isActive={view === "tech"} onClick={() => setView("tech")} />
          <NavButton icon={<Receipt size={16} />} label="Billing" isActive={view === "billing"} onClick={() => setView("billing")} />
          <NavButton icon={<History size={16} />} label="History" isActive={view === "history"} onClick={() => setView("history")} />
          <NavButton icon={<ShoppingCart size={16} />} label="Purchasing" isActive={view === "purchasing"} onClick={() => setView("purchasing")} />
          <NavButton icon={<Warehouse size={16} />} label="Inventory" isActive={view === "inventory"} onClick={() => setView("inventory")} />
        </div>

        <div style={styles.sidebarFooter}>
          <div style={styles.mutedLabel}>Signed in as</div>
          <div style={{ fontWeight: 700, color: "#e5eefb" }}>{user.username}</div>
          <div style={{ color: "#9fb6d1", fontSize: 12 }}>{user.role}</div>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>{currentViewMeta.title}</div>
            <div style={styles.topbarSubtitle}>{currentViewMeta.subtitle}</div>
          </div>
          <div style={styles.topbarMeta}>
            <span style={styles.statusChip}>{BUILD_VERSION}</span>
            <span style={styles.statusChipMuted}>{user.role}</span>
          </div>
        </div>

        <div style={styles.pageSurface}>
          {view === "dashboard" && <DashboardView />}
          {view === "inspection" && <InspectionView />}
          {view === "approval" && <ApprovalView />}
          {view === "ro" && <ROView />}
          {view === "parts" && <PartsView />}
          {view === "shop" && <ShopView />}
          {view === "tech" && <TechView />}
          {view === "billing" && <BillingView />}
          {view === "history" && <HistoryView />}
          {view === "purchasing" && <PurchasingView />}
          {view === "inventory" && <InventoryView />}
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
    padding: "11px 12px",
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
    padding: "11px 12px",
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
    padding: "11px 12px",
    background: "#ffffff",
    minWidth: 140,
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
    padding: "11px 15px",
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
    padding: "11px 14px",
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
    padding: "11px 14px",
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
    padding: "11px 14px",
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