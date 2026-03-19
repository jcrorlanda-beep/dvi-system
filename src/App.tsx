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
  | "history"
  | "purchasing"
  | "inventory";

type UserRole = "Admin" | "Technician" | "Service Advisor";

type User = {
  username: string;
  password: string;
  role: UserRole;
};

type Priority = "Low" | "Normal" | "High" | "Urgent";
type ROStatus = "Open" | "In Progress" | "Waiting Parts" | "Quality Check" | "Completed";
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
  technician: string;
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
  overrideNote: string;
};

type RepairOrder = {
  id: string;
  roNumber: string;
  plate: string;
  vehicle: string;
  customer: string;
  bay: string;
  priority: Priority;
  status: ROStatus;
  createdAt: number;
  workLines: ROWorkLine[];
  invoiceStatus: InvoiceStatus;
  releaseStatus: ReleaseStatus;
  payments: PaymentEntry[];
  invoiceNote: string;
  releaseChecklist: ReleaseChecklist;
  isReturnJob: boolean;
  returnReason: string;
  linkedPreviousRoId?: string;
  inspectionPhotos: InspectionPhoto[];
  serviceAdvisorNotes: string;
  softLocked: boolean;
  lockOverrideReason: string;
};

type PartRequest = {
  id: string;
  roNumber: string;
  workLineId?: string;
  workLineLabel?: string;
  partName: string;
  qty: number;
  unitCost: number;
  status: PartRequestStatus;
  createdAt: number;
  selectedSupplierId?: string;
  inventoryItemId?: string;
  inventoryAllocatedQty?: number;
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
  unitPrice: number;
  etaDays: number;
  notes: string;
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
  customer: string;
  bay: string;
  priority: Priority;
  issues: InspectionSelection;
  isReturnJob: boolean;
  returnReason: string;
  linkedPreviousRoId: string;
  inspectionPhotos: InspectionPhoto[];
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
  unitPrice: string;
  etaDays: string;
  notes: string;
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

/* =========================
   SEED / DEFAULTS
========================= */

const USERS: User[] = [{ username: "admin", password: "admin123", role: "Admin" }];

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

const DEFAULT_INSPECTION_FORM: InspectionForm = {
  plate: "",
  vehicle: "",
  customer: "",
  bay: "Bay 1",
  priority: "Normal",
  issues: EMPTY_INSPECTION_SELECTIONS,
  isReturnJob: false,
  returnReason: "",
  linkedPreviousRoId: "",
  inspectionPhotos: [],
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

const DEFAULT_PAYMENT_FORM: PaymentForm = {
  amount: "",
  method: "Cash",
  note: "",
};

const DEFAULT_SUPPLIER_FORM: SupplierForm = {
  name: "",
  contactPerson: "",
  phone: "",
  notes: "",
};

const DEFAULT_BID_FORM: BidForm = {
  supplierId: "",
  unitPrice: "",
  etaDays: "",
  notes: "",
};

const DEFAULT_INVENTORY_FORM: InventoryForm = {
  partName: "",
  sku: "",
  quantityOnHand: "",
  reorderLevel: "",
  avgCost: "",
  location: "",
};

const DEFAULT_WORK_LINE: ROWorkLine = {
  id: "",
  label: "New Job",
  category: "General",
  technician: "",
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

function getROStatusFromWorkLines(workLines: ROWorkLine[]): ROStatus {
  const actionable = workLines.filter((w) => w.approvalStatus !== "Declined");
  if (!actionable.length) return "Open";
  if (actionable.every((w) => w.status === "Done" || w.status === "Cancelled")) return "Completed";
  if (actionable.some((w) => w.status === "Quality Check")) return "Quality Check";
  if (actionable.some((w) => w.status === "Waiting Parts")) return "Waiting Parts";
  if (actionable.some((w) => ["In Progress", "Approved", "Ready"].includes(w.status))) return "In Progress";
  return "Open";
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
  if (status === "Completed") return styles.badgeGood;
  if (status === "Waiting Parts") return styles.badgeWarn;
  if (status === "In Progress") return styles.badgeBlue;
  if (status === "Quality Check") return styles.badgePurple;
  return styles.badgeMuted;
}

function getPriorityStyle(priority: Priority): React.CSSProperties {
  if (priority === "Urgent") return styles.badgeDanger;
  if (priority === "High") return styles.badgeWarn;
  if (priority === "Normal") return styles.badgeBlue;
  return styles.badgeMuted;
}

/* =========================
   APP
========================= */

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [user, setUser] = useState<User | null>(null);

  const [inspectionForm, setInspectionForm] = useState<InspectionForm>(DEFAULT_INSPECTION_FORM);
  const [paymentForms, setPaymentForms] = useState<Record<string, PaymentForm>>({});
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

  const [ros, setRos] = useState<RepairOrder[]>(() => safeLoad("phase10_ros", []));
  const [parts, setParts] = useState<PartRequest[]>(() => safeLoad("phase10_parts", []));

  useEffect(() => {
    localStorage.setItem("phase10_ros", JSON.stringify(ros));
  }, [ros]);

  useEffect(() => {
    localStorage.setItem("phase10_parts", JSON.stringify(parts));
  }, [parts]);

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

  const syncTechniciansFromROs = (nextRos: RepairOrder[]) => {
    setTechnicians((prev) =>
      prev.map((tech) => {
        let currentRoNumber = "";
        let currentWorkLine = "";
        let currentStartedAt: number | undefined = undefined;
        let completedJobs = 0;

        nextRos.forEach((ro) => {
          ro.workLines.forEach((line) => {
            if (line.technician.trim() !== tech.name) return;
            if (line.status === "Done") completedJobs += 1;
            if (line.status === "In Progress") {
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
            status = "Ready";
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
      let roStatus = getROStatusFromWorkLines(recomputedLines);

      if (actionable.length > 0 && actionable.every((w) => w.status === "Done" || w.status === "Cancelled")) {
        roStatus = "Completed";
      } else if (
        actionable.length > 0 &&
        actionable.every((w) => ["Done", "Cancelled", "Quality Check"].includes(w.status))
      ) {
        roStatus = "Quality Check";
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
        softLocked,
      };
    });

    setRos(computedRos);
    setParts(nextParts);
    syncTechniciansFromROs(computedRos);
  };

  const canEditRo = (ro: RepairOrder) => !ro.softLocked || !!ro.lockOverrideReason.trim();

  /* =========================
     ACTIONS
  ========================= */

  const createRO = () => {
    const nextRO: RepairOrder = {
      id: uid(),
      roNumber: `RO-${Date.now()}`,
      plate: "",
      vehicle: "",
      customer: "",
      bay: "Bay 1",
      priority: "Normal",
      status: "Open",
      createdAt: Date.now(),
      workLines: [],
      invoiceStatus: "Draft",
      releaseStatus: "Hold",
      payments: [],
      invoiceNote: "",
      releaseChecklist: { ...DEFAULT_RELEASE_CHECKLIST },
      isReturnJob: false,
      returnReason: "",
      inspectionPhotos: [],
      serviceAdvisorNotes: "",
      softLocked: false,
      lockOverrideReason: "",
    };
    recomputeAll([nextRO, ...ros], parts);
  };

  const createROFromInspection = () => {
    const generatedWorkLines = buildWorkLinesFromInspection(inspectionForm.issues);

    const nextRO: RepairOrder = {
      id: uid(),
      roNumber: `RO-${Date.now()}`,
      plate: inspectionForm.plate,
      vehicle: inspectionForm.vehicle,
      customer: inspectionForm.customer,
      bay: inspectionForm.bay,
      priority: inspectionForm.priority,
      status: getROStatusFromWorkLines(generatedWorkLines),
      createdAt: Date.now(),
      workLines: generatedWorkLines,
      invoiceStatus: "Draft",
      releaseStatus: "Hold",
      payments: [],
      invoiceNote: "",
      releaseChecklist: { ...DEFAULT_RELEASE_CHECKLIST },
      isReturnJob: inspectionForm.isReturnJob,
      returnReason: inspectionForm.returnReason,
      linkedPreviousRoId: inspectionForm.linkedPreviousRoId || undefined,
      inspectionPhotos: inspectionForm.inspectionPhotos,
      serviceAdvisorNotes: inspectionForm.serviceAdvisorNotes,
      softLocked: false,
      lockOverrideReason: "",
    };

    recomputeAll([nextRO, ...ros], parts);
    setInspectionForm(DEFAULT_INSPECTION_FORM);
    setView("approval");
  };

  const updateRO = (id: string, patch: Partial<RepairOrder>) => {
    const target = ros.find((r) => r.id === id);
    if (!target) return;
    if (!canEditRo(target) && !("lockOverrideReason" in patch)) return;

    recomputeAll(
      ros.map((ro) => (ro.id === id ? { ...ro, ...patch } : ro)),
      parts,
    );
  };

  const addWorkLine = (roId: string) => {
    const target = ros.find((r) => r.id === roId);
    if (!target || !canEditRo(target)) return;

    recomputeAll(
      ros.map((ro) =>
        ro.id !== roId
          ? ro
          : {
              ...ro,
              workLines: [...ro.workLines, getWorkLineEstimate({ ...DEFAULT_WORK_LINE, id: uid() })],
            },
      ),
      parts,
    );
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
          if (!nextLine.technician.trim()) {
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
  };

  const sendSmsApproval = (roId: string, wlId: string) => {
    setRos((prev) =>
      prev.map((ro) =>
        ro.id !== roId
          ? ro
          : {
              ...ro,
              workLines: ro.workLines.map((line) =>
                line.id === wlId
                  ? {
                      ...line,
                      smsApprovalSentAt: Date.now(),
                      smsApprovalStatus: "Sent",
                    }
                  : line,
              ),
            },
      ),
    );
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

  const createPart = (roNumber: string, wl?: ROWorkLine) => {
    const nextPart: PartRequest = {
      id: uid(),
      roNumber,
      workLineId: wl?.id,
      workLineLabel: wl?.label,
      partName: "",
      qty: 1,
      unitCost: 0,
      status: "Draft",
      createdAt: Date.now(),
      inventoryAllocatedQty: 0,
    };
    recomputeAll(ros, [nextPart, ...parts]);
  };

  const updatePart = (id: string, patch: Partial<PartRequest>) => {
    recomputeAll(
      ros,
      parts.map((part) => (part.id === id ? { ...part, ...patch } : part)),
    );
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
    setPaymentForms((prev) => ({ ...prev, [roId]: { ...DEFAULT_PAYMENT_FORM } }));
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
        if (ro.id !== roId || ro.releaseStatus !== "Ready for Release") return ro;
        return {
          ...ro,
          releaseChecklist: { ...ro.releaseChecklist, releasedAt: Date.now() },
          releaseStatus: "Released",
          softLocked: true,
        };
      }),
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

  const createSupplier = () => {
    if (!supplierForm.name.trim()) return;
    setSuppliers((prev) => [{ id: uid(), ...supplierForm }, ...prev]);
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

    setSupplierBids((prev) => [
      {
        id: uid(),
        partRequestId: partId,
        supplierId: form.supplierId,
        unitPrice: Number(form.unitPrice) || 0,
        etaDays: Number(form.etaDays) || 0,
        notes: form.notes,
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
              status: "Supplier Selected",
            }
          : p,
      ),
    );
  };

  const createInventoryItem = () => {
    if (!inventoryForm.partName.trim()) return;

    setInventory((prev) => [
      {
        id: uid(),
        partName: inventoryForm.partName,
        sku: inventoryForm.sku,
        quantityOnHand: Number(inventoryForm.quantityOnHand) || 0,
        reorderLevel: Number(inventoryForm.reorderLevel) || 0,
        avgCost: Number(inventoryForm.avgCost) || 0,
        location: inventoryForm.location,
      },
      ...prev,
    ]);

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
            }
          : p,
      ),
    );
  };

  /* =========================
     DERIVED
  ========================= */

  const dashboardStats = useMemo(
    () => ({
      totalRO: ros.length,
      inProgress: ros.filter((r) => r.status === "In Progress").length,
      waitingParts: ros.filter((r) => r.status === "Waiting Parts").length,
      completed: ros.filter((r) => r.status === "Completed").length,
      pendingApproval: ros.reduce(
        (sum, ro) => sum + ro.workLines.filter((w) => w.approvalStatus === "Pending Approval").length,
        0,
      ),
      readyRelease: ros.filter((r) => r.releaseStatus === "Ready for Release").length,
      returnJobs: ros.filter((r) => r.isReturnJob).length,
    }),
    [ros],
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
      const lines = ros.flatMap((ro) => ro.workLines.filter((w) => w.technician.trim() === tech.name));
      const billedHours = round2(lines.reduce((sum, l) => sum + l.estimatedHours, 0));
      const actualHours = round2(lines.reduce((sum, l) => sum + (l.actualHours || 0), 0));
      const efficiency = actualHours > 0 ? round2((billedHours / actualHours) * 100) : 0;
      const comebacks = ros.filter(
        (ro) => ro.isReturnJob && ro.workLines.some((w) => w.technician.trim() === tech.name),
      ).length;
      const active = lines.filter((l) => l.status === "In Progress").length;
      return { ...tech, billedHours, actualHours, efficiency, comebacks, active };
    });
  }, [technicians, ros]);

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

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return customerHistory;
    return customerHistory.filter((record) =>
      [record.customer, record.plate, record.vehicle].some((v) => v.toLowerCase().includes(q)),
    );
  }, [customerHistory, historySearch]);

  /* =========================
     VIEWS
  ========================= */

  const DashboardView = () => (
    <div>
      <h2 style={styles.heading}>Owner Dashboard + Daily Snapshot</h2>

      <div style={styles.statsGrid}>
        <MetricCard title="Total RO" value={dashboardStats.totalRO} />
        <MetricCard title="In Progress" value={dashboardStats.inProgress} />
        <MetricCard title="Waiting Parts" value={dashboardStats.waitingParts} />
        <MetricCard title="Completed" value={dashboardStats.completed} />
        <MetricCard title="Pending Approval" value={dashboardStats.pendingApproval} />
        <MetricCard title="Ready Release" value={dashboardStats.readyRelease} />
        <MetricCard title="Return Jobs" value={dashboardStats.returnJobs} />
        <MetricCard title="Low Stock Items" value={inventoryAlerts.length} />
      </div>

      <div style={{ ...styles.statsGrid, marginTop: 14 }}>
        <MoneyCard title="Daily Revenue" value={dailyRevenue} />
        <MoneyCard title="Monthly Revenue" value={monthlyRevenue} />
        <MoneyCard title="Avg RO Value" value={avgROValue} />
        <MetricCard title="Comeback Rate %" value={comebackRate} />
        <MetricCard title="Jobs Today" value={dailySnapshot.jobsToday} />
        <MetricCard title="Released Today" value={dailySnapshot.releasedToday} />
        <MetricCard title="Active Jobs" value={dailySnapshot.activeJobs} />
        <MetricCard title="Pending Approvals Today" value={dailySnapshot.pendingApprovals} />
      </div>

      <div style={{ ...styles.shopGrid, marginTop: 16 }}>
        <div style={styles.cardBlock}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Technician Leaderboard</div>
          <div style={{ display: "grid", gap: 8 }}>
            {technicianKpis
              .slice()
              .sort((a, b) => b.efficiency - a.efficiency)
              .map((tech) => (
                <div key={tech.id} style={styles.shopMiniRow}>
                  <span>{tech.name}</span>
                  <span>{tech.efficiency}% efficiency</span>
                </div>
              ))}
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
    </div>
  );

  const InspectionView = () => (
    <div>
      <div style={styles.rowBetween}>
        <h2 style={styles.heading}>Inspection</h2>
        <button style={styles.primaryButton} onClick={createROFromInspection}>
          Generate RO from Inspection
        </button>
      </div>

      <div style={styles.cardBlock}>
        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Plate"
            value={inspectionForm.plate}
            onChange={(e) =>
              setInspectionForm((p) => ({ ...p, plate: e.target.value.toUpperCase() }))
            }
          />
          <input
            style={styles.input}
            placeholder="Vehicle"
            value={inspectionForm.vehicle}
            onChange={(e) => setInspectionForm((p) => ({ ...p, vehicle: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Customer"
            value={inspectionForm.customer}
            onChange={(e) => setInspectionForm((p) => ({ ...p, customer: e.target.value }))}
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

        <div style={{ marginTop: 10 }}>
          <TextArea
            label="Service Advisor Notes"
            value={inspectionForm.serviceAdvisorNotes}
            onChange={(value) =>
              setInspectionForm((p) => ({ ...p, serviceAdvisorNotes: value }))
            }
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={styles.rowBetween}>
            <div style={{ fontWeight: 700 }}>Inspection Photos</div>
            <button style={styles.secondaryButton} onClick={addInspectionPhoto}>
              <Camera size={14} /> Add Photo
            </button>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {inspectionForm.inspectionPhotos.map((photo) => (
              <div key={photo.id} style={styles.innerBlock}>
                <div style={styles.formGrid}>
                  <input
                    style={styles.input}
                    placeholder="Photo label"
                    value={photo.label}
                    onChange={(e) => updateInspectionPhoto(photo.id, "label", e.target.value)}
                  />
                  <input
                    style={styles.input}
                    placeholder="Photo URL"
                    value={photo.url}
                    onChange={(e) => updateInspectionPhoto(photo.id, "url", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Detected Issues</div>
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
        <button style={styles.primaryButton} onClick={createRO}>
          + Create Blank RO
        </button>
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
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ro.inspectionPhotos.map((photo) => (
                <span key={photo.id} style={styles.badgeBlue}>
                  {photo.label}
                </span>
              ))}
            </div>
          )}

          {ro.serviceAdvisorNotes && (
            <div style={{ marginTop: 10, color: "#4b5563" }}>
              <strong>SA Notes:</strong> {ro.serviceAdvisorNotes}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button style={styles.secondaryButton} onClick={() => addWorkLine(ro.id)}>
              + Add Work Line
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
                <input
                  style={styles.input}
                  placeholder="Technician"
                  value={line.technician}
                  onChange={(e) =>
                    updateWorkLine(ro.id, line.id, {
                      technician: e.target.value,
                      assignedBy: "Manager",
                    })
                  }
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

        return (
          <div key={part.id} style={styles.cardBlock}>
            <div style={styles.wrapRow}>
              <span style={styles.badgeDark}>{part.roNumber}</span>
              <span style={styles.badgeMuted}>{part.workLineLabel || "No Work Line"}</span>
              <input
                style={styles.input}
                placeholder="Part Name"
                value={part.partName}
                onChange={(e) => updatePart(part.id, { partName: e.target.value })}
              />
              <input
                style={{ ...styles.input, maxWidth: 90 }}
                type="number"
                value={part.qty}
                onChange={(e) => updatePart(part.id, { qty: Number(e.target.value) || 0 })}
              />
              <input
                style={{ ...styles.input, maxWidth: 120 }}
                type="number"
                value={part.unitCost}
                onChange={(e) => updatePart(part.id, { unitCost: Number(e.target.value) || 0 })}
                placeholder="Unit Cost"
              />
              <select
                style={styles.input}
                value={part.status}
                onChange={(e) => updatePart(part.id, { status: e.target.value as PartRequestStatus })}
              >
                {[
                  "Draft",
                  "Sent to Suppliers",
                  "Waiting for Bids",
                  "Supplier Selected",
                  "Ordered",
                  "Shipped",
                  "Parts Arrived",
                  "Closed",
                  "Cancelled",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span style={styles.badgeBlue}>{getSupplierName(suppliers, part.selectedSupplierId)}</span>
            </div>

            <div style={{ ...styles.formGrid, marginTop: 10 }}>
              <select
                style={styles.input}
                value={bidForm.supplierId}
                onChange={(e) => updateBidForm(part.id, { supplierId: e.target.value })}
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                style={styles.input}
                type="number"
                placeholder="Bid unit price"
                value={bidForm.unitPrice}
                onChange={(e) => updateBidForm(part.id, { unitPrice: e.target.value })}
              />
              <input
                style={styles.input}
                type="number"
                placeholder="ETA days"
                value={bidForm.etaDays}
                onChange={(e) => updateBidForm(part.id, { etaDays: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Bid notes"
                value={bidForm.notes}
                onChange={(e) => updateBidForm(part.id, { notes: e.target.value })}
              />
            </div>

            <div style={{ marginTop: 10, ...styles.wrapRow }}>
              <button style={styles.secondaryButton} onClick={() => addBid(part.id)}>
                <ShoppingCart size={14} /> Add Bid
              </button>
              {inventory.map((item) => (
                <button
                  key={item.id}
                  style={styles.secondaryButton}
                  onClick={() => allocateInventoryToPart(part.id, item.id)}
                >
                  Use {item.partName}
                </button>
              ))}
            </div>

            {bids.length > 0 && (
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {bids.map((bid) => (
                  <div key={bid.id} style={styles.logRow}>
                    <div style={styles.rowBetween}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{getSupplierName(suppliers, bid.supplierId)}</div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          ₱{bid.unitPrice.toLocaleString()} • ETA {bid.etaDays} day(s)
                        </div>
                      </div>
                      <div style={styles.wrapRow}>
                        {bid.selected && <span style={styles.badgeGood}>Selected</span>}
                        <button style={styles.secondaryButton} onClick={() => selectBid(bid.id)}>
                          Select
                        </button>
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

      <div style={styles.shopGrid}>
        {technicianKpis.map((tech) => (
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
              <div>Comebacks: {tech.comebacks}</div>
              <div>Active Jobs: {tech.active}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BillingView = () => (
    <div>
      <h2 style={styles.heading}>Billing + Release + Margin</h2>

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
                <button style={styles.secondaryButton} onClick={() => window.print()}>
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

              <div style={{ marginTop: 10 }}>
                <button
                  style={styles.goodButton}
                  onClick={() => finalizeRelease(ro.id)}
                  disabled={ro.releaseStatus !== "Ready for Release"}
                >
                  <Truck size={14} style={{ marginRight: 6 }} /> Finalize Release
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

                      <div style={{ ...styles.summaryRow, marginTop: 10 }}>
                        <span>Total: ₱{f.total.toLocaleString()}</span>
                        <span>Paid: ₱{f.paid.toLocaleString()}</span>
                        <span>Balance: ₱{f.balance.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );

  /* =========================
     LOGIN
  ========================= */

  if (!user) {
    return (
      <div style={styles.loginWrap}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>Workshop System</h1>
          <p style={{ marginTop: 0, color: "#6b7280" }}>
            Phase 10 flexible automation, alerts, tracking, and soft controls.
          </p>
          <button style={styles.primaryButton} onClick={() => setUser(USERS[0])}>
            Login as {USERS[0].role}
          </button>
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
        <NavButton icon={<Home size={16} />} label="Dashboard" onClick={() => setView("dashboard")} />
        <NavButton icon={<ClipboardList size={16} />} label="Inspection" onClick={() => setView("inspection")} />
        <NavButton icon={<FileText size={16} />} label="Approval" onClick={() => setView("approval")} />
        <NavButton icon={<Car size={16} />} label="RO" onClick={() => setView("ro")} />
        <NavButton icon={<Package size={16} />} label="Parts" onClick={() => setView("parts")} />
        <NavButton icon={<Wrench size={16} />} label="Shop" onClick={() => setView("shop")} />
        <NavButton icon={<Users size={16} />} label="Tech" onClick={() => setView("tech")} />
        <NavButton icon={<Receipt size={16} />} label="Billing" onClick={() => setView("billing")} />
        <NavButton icon={<History size={16} />} label="History" onClick={() => setView("history")} />
        <NavButton icon={<ShoppingCart size={16} />} label="Purchasing" onClick={() => setView("purchasing")} />
        <NavButton icon={<Warehouse size={16} />} label="Inventory" onClick={() => setView("inventory")} />
      </aside>

      <main style={styles.main}>
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button style={styles.navButton} onClick={onClick}>
      {icon}
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
    background: "#f8fafc",
    color: "#111827",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  sidebar: {
    width: 220,
    borderRight: "1px solid #e5e7eb",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "#fff",
  },
  main: {
    flex: 1,
    padding: 20,
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#fff",
    padding: "10px 12px",
    cursor: "pointer",
    textAlign: "left",
  },
  heading: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 24,
  },
  title: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 28,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  metricCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    padding: 16,
  },
  cardBlock: {
    marginTop: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    padding: 14,
  },
  innerBlock: {
    marginTop: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
    padding: 12,
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
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
    padding: 10,
  },
  mutedLabel: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 4,
  },
  checkboxRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 10,
    background: "#fff",
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#fff",
    minWidth: 140,
    boxSizing: "border-box",
  },
  primaryButton: {
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "10px 14px",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 600,
  },
  goodButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  dangerButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  summaryRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "center",
    fontSize: 14,
  },
  logRow: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 10,
    background: "#fff",
  },
  badgeDark: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  badgeMuted: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e5e7eb",
    color: "#111827",
    fontSize: 12,
    fontWeight: 700,
  },
  badgeWarn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f59e0b",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  badgeGood: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#16a34a",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  badgeBlue: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#2563eb",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  badgePurple: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#7c3aed",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  badgeDanger: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dc2626",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
  },
  shopGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  shopCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    padding: 14,
  },
  shopMiniRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
    fontSize: 13,
  },
  loginWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  loginCard: {
    width: "100%",
    maxWidth: 420,
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    background: "#fff",
    padding: 24,
  },
};