// FULL MERGED PHASE 6 APP (INTEGRATED)
// Adds:
// - Invoicing + Payment + Release Flow
// - Final invoice from approved/done work lines
// - Labor + parts billing summary
// - Partial / full payment handling
// - Vehicle release status + release checklist
// - Printable-style job summary view foundation

import React, { useEffect, useMemo, useState } from "react";
import {
  Home,
  Wrench,
  Users,
  ClipboardList,
  Car,
  Package,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  FileText,
  Receipt,
  CreditCard,
  Truck,
} from "lucide-react";

// ================= TYPES =================

type ViewKey =
  | "dashboard"
  | "inspection"
  | "approval"
  | "ro"
  | "parts"
  | "shop"
  | "tech"
  | "billing";

type UserRole = "Admin" | "Technician" | "Service Advisor";

type User = {
  username: string;
  password: string;
  role: UserRole;
};

type WorkLineStatus =
  | "Pending"
  | "Approved"
  | "In Progress"
  | "Waiting Parts"
  | "Quality Check"
  | "Done"
  | "Cancelled";

type ApprovalStatus =
  | "Pending Approval"
  | "Approved"
  | "Partially Approved"
  | "Declined";

type CustomerDecisionEntry = {
  id: string;
  timestamp: number;
  customerName: string;
  decision: ApprovalStatus;
  note: string;
};

type ROWorkLine = {
  id: string;
  label: string;
  category: string;
  technician: string;
  estimatedHours: number;
  actualHours: number;
  laborRate: number;
  laborCost: number;
  partsCost: number;
  estimateTotal: number;
  status: WorkLineStatus;
  approvalStatus: ApprovalStatus;
  startedAt?: number;
  partsSummary: "No Parts" | "Waiting Parts" | "Ready";
  customerDecisionLog: CustomerDecisionEntry[];
};

type ROStatus = "Open" | "In Progress" | "Waiting Parts" | "Quality Check" | "Completed";

type InvoiceStatus = "Draft" | "Ready for Payment" | "Partially Paid" | "Paid";
type ReleaseStatus = "Hold" | "Ready for Release" | "Released";

type PaymentEntry = {
  id: string;
  timestamp: number;
  amount: number;
  method: "Cash" | "Card" | "Bank Transfer" | "GCash" | "Other";
  note: string;
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

type RepairOrder = {
  id: string;
  roNumber: string;
  plate: string;
  vehicle: string;
  customer: string;
  bay: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  status: ROStatus;
  workLines: ROWorkLine[];
  createdAt: number;
  invoiceStatus: InvoiceStatus;
  releaseStatus: ReleaseStatus;
  payments: PaymentEntry[];
  invoiceNote: string;
  releaseChecklist: ReleaseChecklist;
};

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
};

type InspectionIssueKey =
  | "brakes"
  | "suspension"
  | "engine"
  | "electrical"
  | "aircon"
  | "steering"
  | "tires";

type InspectionIssueDefinition = {
  key: InspectionIssueKey;
  label: string;
  category: string;
  defaultHours: number;
  defaultWorkLineLabel: string;
};

type InspectionSelection = Record<InspectionIssueKey, boolean>;

type InspectionForm = {
  plate: string;
  vehicle: string;
  customer: string;
  bay: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  issues: InspectionSelection;
};

type PaymentForm = {
  amount: string;
  method: PaymentEntry["method"];
  note: string;
};

// ================= SEED =================

const USERS: User[] = [{ username: "admin", password: "admin123", role: "Admin" }];
const DEFAULT_LABOR_RATE = 850;

const DEFAULT_WORK_LINE: ROWorkLine = {
  id: "",
  label: "New Job",
  category: "General",
  technician: "",
  estimatedHours: 1,
  actualHours: 0,
  laborRate: DEFAULT_LABOR_RATE,
  laborCost: DEFAULT_LABOR_RATE,
  partsCost: 0,
  estimateTotal: DEFAULT_LABOR_RATE,
  status: "Pending",
  approvalStatus: "Pending Approval",
  partsSummary: "No Parts",
  customerDecisionLog: [],
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
};

// ================= UTILS =================

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

function getWorkLineEstimate(line: ROWorkLine): ROWorkLine {
  const laborCost = round2((line.estimatedHours || 0) * (line.laborRate || 0));
  const estimateTotal = round2(laborCost + (line.partsCost || 0));
  return { ...line, laborCost, estimateTotal };
}

function getROStatusFromWorkLines(workLines: ROWorkLine[]): ROStatus {
  const actionable = workLines.filter((w) => w.approvalStatus !== "Declined");
  if (!actionable.length) return "Open";
  if (actionable.every((w) => w.status === "Done" || w.status === "Cancelled")) return "Completed";
  if (actionable.some((w) => w.status === "Quality Check")) return "Quality Check";
  if (actionable.some((w) => w.status === "Waiting Parts")) return "Waiting Parts";
  if (actionable.some((w) => w.status === "In Progress" || w.status === "Approved")) return "In Progress";
  return "Open";
}

function getPartsSummaryForWorkLine(parts: PartRequest[], workLineId?: string): ROWorkLine["partsSummary"] {
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
      .reduce((sum, p) => sum + (p.qty || 0) * (p.unitCost || 0), 0),
  );
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

function recomputeROAutomation(ros: RepairOrder[], parts: PartRequest[]): RepairOrder[] {
  return ros.map((ro) => {
    const workLines = ro.workLines.map((line) => {
      const partsSummary = getPartsSummaryForWorkLine(parts, line.id);
      const partsCost = sumPartsCostForWorkLine(parts, line.id);
      let status = line.status;

      if (line.approvalStatus === "Declined") {
        status = "Cancelled";
      } else if (line.approvalStatus === "Pending Approval") {
        if (!["Done", "Cancelled"].includes(status)) status = "Pending";
      } else {
        if (partsSummary === "Waiting Parts" && ["Pending", "Approved"].includes(status)) status = "Waiting Parts";
        if (partsSummary === "Ready" && status === "Waiting Parts") status = "Approved";
      }

      return getWorkLineEstimate({ ...line, partsSummary, partsCost, status });
    });

    const financials = getROFinancials({ ...ro, workLines });
    const invoiceStatus = getInvoiceStatus(financials.paid, financials.total);
    const releaseStatus = getReleaseStatus(invoiceStatus, ro.releaseChecklist);

    return {
      ...ro,
      workLines,
      status: getROStatusFromWorkLines(workLines),
      invoiceStatus,
      releaseStatus,
    };
  });
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

function runSanityChecks() {
  const built = buildWorkLinesFromInspection({ ...EMPTY_INSPECTION_SELECTIONS, brakes: true, engine: true });
  console.assert(built.length === 2, "Inspection should generate 2 work lines");
  console.assert(built[0].estimateTotal > 0, "Generated work line should have estimate total");
  console.assert(getInvoiceStatus(0, 1000) === "Ready for Payment", "Invoice status should be ready when unpaid");
  console.assert(getInvoiceStatus(500, 1000) === "Partially Paid", "Invoice status should be partial when underpaid");
  console.assert(getInvoiceStatus(1000, 1000) === "Paid", "Invoice status should be paid when settled");
}

runSanityChecks();

// ================= APP =================

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [inspectionForm, setInspectionForm] = useState<InspectionForm>(DEFAULT_INSPECTION_FORM);
  const [paymentForms, setPaymentForms] = useState<Record<string, PaymentForm>>({});

  const [ros, setRos] = useState<RepairOrder[]>(() => safeLoad<RepairOrder[]>("phase6_ros", []));
  const [parts, setParts] = useState<PartRequest[]>(() => safeLoad<PartRequest[]>("phase6_parts", []));

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("phase6_ros", JSON.stringify(ros));
  }, [ros]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("phase6_parts", JSON.stringify(parts));
  }, [parts]);

  // ================= ACTIONS =================

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
      workLines: [],
      createdAt: Date.now(),
      invoiceStatus: "Draft",
      releaseStatus: "Hold",
      payments: [],
      invoiceNote: "",
      releaseChecklist: { ...DEFAULT_RELEASE_CHECKLIST },
    };
    setRos((prev) => [nextRO, ...prev]);
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
      workLines: generatedWorkLines,
      createdAt: Date.now(),
      invoiceStatus: "Draft",
      releaseStatus: "Hold",
      payments: [],
      invoiceNote: "",
      releaseChecklist: { ...DEFAULT_RELEASE_CHECKLIST },
    };
    setRos((prev) => [nextRO, ...prev]);
    setInspectionForm(DEFAULT_INSPECTION_FORM);
    setView("approval");
  };

  const updateRO = (id: string, patch: Partial<RepairOrder>) => {
    setRos((prev) => prev.map((ro) => (ro.id === id ? { ...ro, ...patch } : ro)));
  };

  const addWorkLine = (roId: string) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId) return ro;
        const workLines = [...ro.workLines, getWorkLineEstimate({ ...DEFAULT_WORK_LINE, id: uid() })];
        return { ...ro, workLines, status: getROStatusFromWorkLines(workLines) };
      }),
    );
  };

  const updateWorkLine = (roId: string, wlId: string, patch: Partial<ROWorkLine>) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId) return ro;
        const workLines = ro.workLines.map((line) => {
          if (line.id !== wlId) return line;
          let next = getWorkLineEstimate({ ...line, ...patch });

          if (patch.status === "In Progress" && !line.startedAt && line.approvalStatus === "Approved") {
            next.startedAt = Date.now();
          }
          if (patch.status === "Done" && line.startedAt) {
            const elapsedHours = Math.max(0.1, (Date.now() - line.startedAt) / 3600000);
            next.actualHours = round2(elapsedHours);
          }
          if (patch.status === "In Progress" && !["Approved", "Partially Approved"].includes(line.approvalStatus)) {
            next.status = line.status;
          }
          return next;
        });
        return recomputeROAutomation([{ ...ro, workLines }], parts)[0];
      }),
    );
  };

  const logCustomerDecision = (roId: string, wlId: string, decision: ApprovalStatus, note: string) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId) return ro;
        const workLines = ro.workLines.map((line) => {
          if (line.id !== wlId) return line;
          const nextLog: CustomerDecisionEntry[] = [
            {
              id: uid(),
              timestamp: Date.now(),
              customerName: ro.customer || "Customer",
              decision,
              note,
            },
            ...line.customerDecisionLog,
          ];
          return { ...line, approvalStatus: decision, customerDecisionLog: nextLog };
        });
        return recomputeROAutomation([{ ...ro, workLines }], parts)[0];
      }),
    );
  };

  const startWorkLine = (roId: string, wlId: string) => {
    const ro = ros.find((r) => r.id === roId);
    const line = ro?.workLines.find((w) => w.id === wlId);
    if (!line) return;
    if (!["Approved", "Partially Approved"].includes(line.approvalStatus)) return;
    updateWorkLine(roId, wlId, { status: "In Progress" });
  };

  const pauseWorkLine = (roId: string, wlId: string) => {
    const ro = ros.find((r) => r.id === roId);
    const line = ro?.workLines.find((w) => w.id === wlId);
    if (!line || line.approvalStatus === "Declined") return;
    updateWorkLine(roId, wlId, { status: "Approved" });
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
    };
    const nextParts = [nextPart, ...parts];
    setParts(nextParts);
    setRos((prev) => recomputeROAutomation(prev, nextParts));
  };

  const updatePart = (id: string, patch: Partial<PartRequest>) => {
    const nextParts = parts.map((part) => (part.id === id ? { ...part, ...patch } : part));
    setParts(nextParts);
    setRos((prev) => recomputeROAutomation(prev, nextParts));
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

    setRos((prev) => {
      const updated = prev.map((ro) => {
        if (ro.id !== roId) return ro;
        const payments = [
          {
            id: uid(),
            timestamp: Date.now(),
            amount,
            method: form.method,
            note: form.note,
          },
          ...ro.payments,
        ];
        const next = { ...ro, payments };
        return recomputeROAutomation([next], parts)[0];
      });
      return updated;
    });

    setPaymentForms((prev) => ({ ...prev, [roId]: { ...DEFAULT_PAYMENT_FORM } }));
  };

  const updateReleaseChecklist = (roId: string, patch: Partial<ReleaseChecklist>) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId) return ro;
        const releaseChecklist = { ...ro.releaseChecklist, ...patch };
        const releaseStatus = getReleaseStatus(ro.invoiceStatus, releaseChecklist);
        return { ...ro, releaseChecklist, releaseStatus };
      }),
    );
  };

  const finalizeRelease = (roId: string) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId) return ro;
        if (ro.releaseStatus !== "Ready for Release") return ro;
        const releaseChecklist = { ...ro.releaseChecklist, releasedAt: Date.now() };
        return { ...ro, releaseChecklist, releaseStatus: "Released" };
      }),
    );
  };

  // ================= DERIVED =================

  const dashboardStats = useMemo(
    () => ({
      totalRO: ros.length,
      inProgress: ros.filter((r) => r.status === "In Progress").length,
      waitingParts: ros.filter((r) => r.status === "Waiting Parts").length,
      completed: ros.filter((r) => r.status === "Completed").length,
      pendingApproval: ros.reduce((sum, ro) => sum + ro.workLines.filter((w) => w.approvalStatus === "Pending Approval").length, 0),
      readyRelease: ros.filter((r) => r.releaseStatus === "Ready for Release").length,
    }),
    [ros],
  );

  const technicianLoad = useMemo(() => {
    const map: Record<string, { jobs: number; current: string[] }> = {};
    ros.forEach((ro) => {
      ro.workLines.forEach((line) => {
        const tech = line.technician.trim();
        if (!tech) return;
        if (!map[tech]) map[tech] = { jobs: 0, current: [] };
        map[tech].jobs += 1;
        if (line.status === "In Progress") map[tech].current.push(`${ro.roNumber}: ${line.label}`);
      });
    });
    return map;
  }, [ros]);

  const shopRows = useMemo(() => ros.slice().sort((a, b) => a.bay.localeCompare(b.bay) || b.createdAt - a.createdAt), [ros]);

  const estimateSummary = useMemo(
    () => ros.map((ro) => ({ roId: ro.id, roNumber: ro.roNumber, ...getROFinancials(ro) })),
    [ros],
  );

  // ================= VIEWS =================

  const DashboardView = () => (
    <div>
      <h2 style={styles.heading}>Dashboard</h2>
      <div style={styles.statsGrid}>
        <MetricCard title="Total RO" value={dashboardStats.totalRO} />
        <MetricCard title="In Progress" value={dashboardStats.inProgress} />
        <MetricCard title="Waiting Parts" value={dashboardStats.waitingParts} />
        <MetricCard title="Completed" value={dashboardStats.completed} />
        <MetricCard title="Pending Approval" value={dashboardStats.pendingApproval} />
        <MetricCard title="Ready Release" value={dashboardStats.readyRelease} />
      </div>
    </div>
  );

  const InspectionView = () => (
    <div>
      <div style={styles.rowBetween}>
        <h2 style={styles.heading}>Inspection</h2>
        <button style={styles.primaryButton} onClick={createROFromInspection}>Generate RO from Inspection</button>
      </div>
      <div style={styles.cardBlock}>
        <div style={styles.formGrid}>
          <input style={styles.input} placeholder="Plate" value={inspectionForm.plate} onChange={(e) => setInspectionForm((p) => ({ ...p, plate: e.target.value.toUpperCase() }))} />
          <input style={styles.input} placeholder="Vehicle" value={inspectionForm.vehicle} onChange={(e) => setInspectionForm((p) => ({ ...p, vehicle: e.target.value }))} />
          <input style={styles.input} placeholder="Customer" value={inspectionForm.customer} onChange={(e) => setInspectionForm((p) => ({ ...p, customer: e.target.value }))} />
          <select style={styles.input} value={inspectionForm.bay} onChange={(e) => setInspectionForm((p) => ({ ...p, bay: e.target.value }))}>
            {["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Bay 5"].map((bay) => <option key={bay} value={bay}>{bay}</option>)}
          </select>
          <select style={styles.input} value={inspectionForm.priority} onChange={(e) => setInspectionForm((p) => ({ ...p, priority: e.target.value as InspectionForm['priority'] }))}>
            {["Low", "Normal", "High", "Urgent"].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Detected Issues</div>
          <div style={styles.issueGrid}>
            {INSPECTION_ISSUES.map((issue) => (
              <label key={issue.key} style={styles.checkboxRow}>
                <input type="checkbox" checked={inspectionForm.issues[issue.key]} onChange={(e) => setInspectionForm((p) => ({ ...p, issues: { ...p.issues, [issue.key]: e.target.checked } }))} />
                <span>{issue.label} · {issue.defaultWorkLineLabel} · {issue.defaultHours}h</span>
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
                <div style={{ color: '#6b7280' }}>{ro.customer || 'No Customer'} • {ro.vehicle || 'No Vehicle'}</div>
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
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{line.category}</div>
                  </div>
                  <div style={styles.wrapRow}>
                    <span style={styles.badgeMuted}>{line.approvalStatus}</span>
                    <span style={line.partsSummary === 'Waiting Parts' ? styles.badgeWarn : styles.badgeBlue}>{line.partsSummary}</span>
                  </div>
                </div>
                <div style={{ ...styles.formGrid, marginTop: 10 }}>
                  <input style={styles.input} type="number" value={line.estimatedHours} onChange={(e) => updateWorkLine(ro.id, line.id, { estimatedHours: Number(e.target.value) || 0 })} placeholder="Estimated Hours" />
                  <input style={styles.input} type="number" value={line.laborRate} onChange={(e) => updateWorkLine(ro.id, line.id, { laborRate: Number(e.target.value) || 0 })} placeholder="Labor Rate" />
                </div>
                <div style={{ ...styles.summaryRow, marginTop: 10 }}>
                  <span>Labor Cost: ₱{line.laborCost.toLocaleString()}</span>
                  <span>Parts Cost: ₱{line.partsCost.toLocaleString()}</span>
                  <strong>Estimate: ₱{line.estimateTotal.toLocaleString()}</strong>
                </div>
                <div style={{ ...styles.wrapRow, marginTop: 10 }}>
                  <button style={styles.goodButton} onClick={() => logCustomerDecision(ro.id, line.id, 'Approved', 'Customer approved full work line.')}><CheckCircle2 size={14} /> Approve</button>
                  <button style={styles.secondaryButton} onClick={() => logCustomerDecision(ro.id, line.id, 'Partially Approved', 'Customer partially approved the work line.')}><FileText size={14} /> Partial</button>
                  <button style={styles.dangerButton} onClick={() => logCustomerDecision(ro.id, line.id, 'Declined', 'Customer declined the work line.')}><XCircle size={14} /> Decline</button>
                </div>
                {line.customerDecisionLog.length > 0 && (
                  <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                    {line.customerDecisionLog.slice(0, 3).map((entry) => (
                      <div key={entry.id} style={styles.logRow}>
                        <div style={{ fontWeight: 600 }}>{entry.decision}</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{new Date(entry.timestamp).toLocaleString()} • {entry.customerName}</div>
                        <div style={{ fontSize: 13 }}>{entry.note}</div>
                      </div>
                    ))}
                  </div>
                )}
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
        <button style={styles.primaryButton} onClick={createRO}>+ Create Blank RO</button>
      </div>
      {ros.map((ro) => (
        <div key={ro.id} style={styles.cardBlock}>
          <div style={styles.wrapRow}>
            <input style={styles.input} placeholder="Plate" value={ro.plate} onChange={(e) => updateRO(ro.id, { plate: e.target.value })} />
            <input style={styles.input} placeholder="Vehicle" value={ro.vehicle} onChange={(e) => updateRO(ro.id, { vehicle: e.target.value })} />
            <input style={styles.input} placeholder="Customer" value={ro.customer} onChange={(e) => updateRO(ro.id, { customer: e.target.value })} />
            <select style={styles.input} value={ro.bay} onChange={(e) => updateRO(ro.id, { bay: e.target.value })}>{["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Bay 5"].map((bay) => <option key={bay} value={bay}>{bay}</option>)}</select>
            <select style={styles.input} value={ro.priority} onChange={(e) => updateRO(ro.id, { priority: e.target.value as RepairOrder['priority'] })}>{["Low", "Normal", "High", "Urgent"].map((p) => <option key={p} value={p}>{p}</option>)}</select>
            <span style={styles.badgeDark}>{ro.status}</span>
          </div>
          <div style={{ marginTop: 12 }}><button style={styles.secondaryButton} onClick={() => addWorkLine(ro.id)}>+ Add Work Line</button></div>
          {ro.workLines.map((line) => (
            <div key={line.id} style={styles.innerBlock}>
              <div style={styles.wrapRow}>
                <input style={styles.input} value={line.label} onChange={(e) => updateWorkLine(ro.id, line.id, { label: e.target.value })} />
                <input style={styles.input} value={line.category} onChange={(e) => updateWorkLine(ro.id, line.id, { category: e.target.value })} placeholder="Category" />
                <select style={styles.input} value={line.status} onChange={(e) => updateWorkLine(ro.id, line.id, { status: e.target.value as WorkLineStatus })}>{["Pending", "Approved", "In Progress", "Waiting Parts", "Quality Check", "Done", "Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}</select>
                <input style={styles.input} placeholder="Technician" value={line.technician} onChange={(e) => updateWorkLine(ro.id, line.id, { technician: e.target.value })} />
                <span style={styles.badgeMuted}>{line.approvalStatus}</span>
                <span style={line.partsSummary === 'Waiting Parts' ? styles.badgeWarn : styles.badgeBlue}>{line.partsSummary}</span>
              </div>
              <div style={{ ...styles.wrapRow, marginTop: 10 }}>
                <button style={styles.secondaryButton} onClick={() => createPart(ro.roNumber, line)}><Package size={14} /> Request Part</button>
                <button style={styles.secondaryButton} onClick={() => startWorkLine(ro.id, line.id)}><Play size={14} /> Start</button>
                <button style={styles.secondaryButton} onClick={() => pauseWorkLine(ro.id, line.id)}><Pause size={14} /> Pause</button>
                <span style={styles.badgeMuted}>Estimate: ₱{line.estimateTotal.toLocaleString()}</span>
                <span style={styles.badgeMuted}>Actual: {line.actualHours.toFixed(2)}h</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const PartsView = () => (
    <div>
      <h2 style={styles.heading}>Parts</h2>
      {parts.length === 0 && <div style={styles.cardBlock}>No parts requests yet.</div>}
      {parts.map((part) => (
        <div key={part.id} style={styles.cardBlock}>
          <div style={styles.wrapRow}>
            <span style={styles.badgeDark}>{part.roNumber}</span>
            <span style={styles.badgeMuted}>{part.workLineLabel || 'No Work Line'}</span>
            <input style={styles.input} placeholder="Part Name" value={part.partName} onChange={(e) => updatePart(part.id, { partName: e.target.value })} />
            <input style={{ ...styles.input, maxWidth: 90 }} type="number" value={part.qty} onChange={(e) => updatePart(part.id, { qty: Number(e.target.value) || 0 })} />
            <input style={{ ...styles.input, maxWidth: 120 }} type="number" value={part.unitCost} onChange={(e) => updatePart(part.id, { unitCost: Number(e.target.value) || 0 })} placeholder="Unit Cost" />
            <select style={styles.input} value={part.status} onChange={(e) => updatePart(part.id, { status: e.target.value as PartRequestStatus })}>{["Draft", "Sent to Suppliers", "Waiting for Bids", "Supplier Selected", "Ordered", "Shipped", "Parts Arrived", "Closed", "Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </div>
        </div>
      ))}
    </div>
  );

  const ShopView = () => (
    <div>
      <h2 style={styles.heading}>Shop Floor</h2>
      <div style={styles.shopGrid}>
        {shopRows.map((ro) => (
          <div key={ro.id} style={styles.shopCard}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700 }}>{ro.bay}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{ro.roNumber}</div>
              </div>
              <span style={getROBadgeStyle(ro.status)}>{ro.status}</span>
            </div>
            <div style={{ marginTop: 10 }}>{ro.vehicle || 'No Vehicle'}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{ro.plate || 'No Plate'}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{ro.customer || 'No Customer'}</div>
            <div style={{ ...styles.wrapRow, marginTop: 10 }}>
              <span style={getPriorityStyle(ro.priority)}>{ro.priority}</span>
              <span style={ro.releaseStatus === 'Released' ? styles.badgeGood : ro.releaseStatus === 'Ready for Release' ? styles.badgeBlue : styles.badgeMuted}>{ro.releaseStatus}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TechView = () => (
    <div>
      <h2 style={styles.heading}>Technician Board</h2>
      {Object.entries(technicianLoad).length === 0 && <div style={styles.cardBlock}>No technician assignments yet.</div>}
      {Object.entries(technicianLoad).map(([tech, info]) => (
        <div key={tech} style={styles.cardBlock}>
          <div style={styles.rowBetween}>
            <div style={{ fontWeight: 700 }}>{tech}</div>
            <span style={styles.badgeMuted}>{info.jobs} jobs</span>
          </div>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {info.current.length ? info.current.map((job) => <div key={job} style={styles.innerBlock}>{job}</div>) : <div style={{ color: '#6b7280' }}>No active job in progress.</div>}
          </div>
        </div>
      ))}
    </div>
  );

  const BillingView = () => (
    <div>
      <h2 style={styles.heading}>Billing + Release</h2>
      {ros.map((ro) => {
        const financials = getROFinancials(ro);
        const paymentForm = paymentForms[ro.id] || DEFAULT_PAYMENT_FORM;
        return (
          <div key={ro.id} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div>
                <div style={{ fontWeight: 700 }}>{ro.roNumber}</div>
                <div style={{ color: '#6b7280' }}>{ro.customer || 'No Customer'} • {ro.vehicle || 'No Vehicle'}</div>
              </div>
              <div style={styles.wrapRow}>
                <span style={styles.badgeDark}>{ro.invoiceStatus}</span>
                <span style={ro.releaseStatus === 'Released' ? styles.badgeGood : ro.releaseStatus === 'Ready for Release' ? styles.badgeBlue : styles.badgeMuted}>{ro.releaseStatus}</span>
              </div>
            </div>

            <div style={{ ...styles.summaryGrid, marginTop: 12 }}>
              <div style={styles.metricMini}><div style={styles.mutedLabel}>Labor</div><strong>₱{financials.labor.toLocaleString()}</strong></div>
              <div style={styles.metricMini}><div style={styles.mutedLabel}>Parts</div><strong>₱{financials.parts.toLocaleString()}</strong></div>
              <div style={styles.metricMini}><div style={styles.mutedLabel}>Total</div><strong>₱{financials.total.toLocaleString()}</strong></div>
              <div style={styles.metricMini}><div style={styles.mutedLabel}>Paid</div><strong>₱{financials.paid.toLocaleString()}</strong></div>
              <div style={styles.metricMini}><div style={styles.mutedLabel}>Balance</div><strong>₱{financials.balance.toLocaleString()}</strong></div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Payment Entry</div>
              <div style={styles.formGrid}>
                <input style={styles.input} type="number" placeholder="Amount" value={paymentForm.amount} onChange={(e) => updatePaymentForm(ro.id, { amount: e.target.value })} />
                <select style={styles.input} value={paymentForm.method} onChange={(e) => updatePaymentForm(ro.id, { method: e.target.value as PaymentEntry['method'] })}>
                  {["Cash", "Card", "Bank Transfer", "GCash", "Other"].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <input style={styles.input} placeholder="Payment note" value={paymentForm.note} onChange={(e) => updatePaymentForm(ro.id, { note: e.target.value })} />
              </div>
              <div style={{ marginTop: 10 }}>
                <button style={styles.primaryButton} onClick={() => addPayment(ro.id)}><CreditCard size={14} style={{ marginRight: 6 }} /> Add Payment</button>
              </div>
              {ro.payments.length > 0 && (
                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                  {ro.payments.map((p) => (
                    <div key={p.id} style={styles.logRow}>
                      <div style={{ fontWeight: 600 }}>₱{p.amount.toLocaleString()} • {p.method}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{new Date(p.timestamp).toLocaleString()}</div>
                      <div style={{ fontSize: 13 }}>{p.note || 'No note'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Release Checklist</div>
              <div style={styles.issueGrid}>
                <label style={styles.checkboxRow}><input type="checkbox" checked={ro.releaseChecklist.invoiceReviewed} onChange={(e) => updateReleaseChecklist(ro.id, { invoiceReviewed: e.target.checked })} /><span>Invoice Reviewed</span></label>
                <label style={styles.checkboxRow}><input type="checkbox" checked={ro.releaseChecklist.paymentConfirmed} onChange={(e) => updateReleaseChecklist(ro.id, { paymentConfirmed: e.target.checked })} /><span>Payment Confirmed</span></label>
                <label style={styles.checkboxRow}><input type="checkbox" checked={ro.releaseChecklist.vehicleChecked} onChange={(e) => updateReleaseChecklist(ro.id, { vehicleChecked: e.target.checked })} /><span>Vehicle Checked</span></label>
                <label style={styles.checkboxRow}><input type="checkbox" checked={ro.releaseChecklist.customerNotified} onChange={(e) => updateReleaseChecklist(ro.id, { customerNotified: e.target.checked })} /><span>Customer Notified</span></label>
              </div>
              <div style={{ ...styles.formGrid, marginTop: 10 }}>
                <input style={styles.input} placeholder="Released By" value={ro.releaseChecklist.releasedBy} onChange={(e) => updateReleaseChecklist(ro.id, { releasedBy: e.target.value })} />
                <input style={styles.input} placeholder="Release Note" value={ro.releaseChecklist.releaseNote} onChange={(e) => updateReleaseChecklist(ro.id, { releaseNote: e.target.value })} />
              </div>
              <div style={{ marginTop: 10 }}>
                <button style={styles.goodButton} onClick={() => finalizeRelease(ro.id)} disabled={ro.releaseStatus !== 'Ready for Release'}><Truck size={14} style={{ marginRight: 6 }} /> Finalize Release</button>
              </div>
              {ro.releaseChecklist.releasedAt && <div style={{ marginTop: 10, color: '#16a34a', fontWeight: 600 }}>Released at {new Date(ro.releaseChecklist.releasedAt).toLocaleString()}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ================= LOGIN =================

  if (!user) {
    return (
      <div style={styles.loginWrap}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>Workshop System</h1>
          <p style={{ marginTop: 0, color: '#6b7280' }}>Phase 6 invoicing, payment, and release flow.</p>
          <button style={styles.primaryButton} onClick={() => setUser(USERS[0])}>Login as {USERS[0].role}</button>
        </div>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div style={styles.appWrap}>
      <aside style={styles.sidebar}>
        <NavButton icon={<Home size={16} />} label="Dashboard" onClick={() => setView('dashboard')} />
        <NavButton icon={<ClipboardList size={16} />} label="Inspection" onClick={() => setView('inspection')} />
        <NavButton icon={<FileText size={16} />} label="Approval" onClick={() => setView('approval')} />
        <NavButton icon={<Car size={16} />} label="RO" onClick={() => setView('ro')} />
        <NavButton icon={<Package size={16} />} label="Parts" onClick={() => setView('parts')} />
        <NavButton icon={<Wrench size={16} />} label="Shop" onClick={() => setView('shop')} />
        <NavButton icon={<Users size={16} />} label="Tech" onClick={() => setView('tech')} />
        <NavButton icon={<Receipt size={16} />} label="Billing" onClick={() => setView('billing')} />
      </aside>

      <main style={styles.main}>
        {view === 'dashboard' && <DashboardView />}
        {view === 'inspection' && <InspectionView />}
        {view === 'approval' && <ApprovalView />}
        {view === 'ro' && <ROView />}
        {view === 'parts' && <PartsView />}
        {view === 'shop' && <ShopView />}
        {view === 'tech' && <TechView />}
        {view === 'billing' && <BillingView />}
      </main>
    </div>
  );
}

// ================= SMALL COMPONENTS =================

function NavButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button style={styles.navButton} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return <div style={styles.metricCard}><div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div><div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div></div>;
}

function getROBadgeStyle(status: ROStatus): React.CSSProperties {
  if (status === 'Completed') return styles.badgeGood;
  if (status === 'Waiting Parts') return styles.badgeWarn;
  if (status === 'In Progress') return styles.badgeBlue;
  if (status === 'Quality Check') return styles.badgePurple;
  return styles.badgeMuted;
}

function getPriorityStyle(priority: RepairOrder['priority']): React.CSSProperties {
  if (priority === 'Urgent') return styles.badgeDanger;
  if (priority === 'High') return styles.badgeWarn;
  if (priority === 'Normal') return styles.badgeBlue;
  return styles.badgeMuted;
}

// ================= STYLES =================

const styles: Record<string, React.CSSProperties> = {
  appWrap: { minHeight: '100vh', display: 'flex', background: '#f8fafc', color: '#111827', fontFamily: 'Arial, Helvetica, sans-serif' },
  sidebar: { width: 220, borderRight: '1px solid #e5e7eb', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: '#fff' },
  main: { flex: 1, padding: 20 },
  navButton: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', padding: '10px 12px', cursor: 'pointer', textAlign: 'left' },
  heading: { marginTop: 0, marginBottom: 16, fontSize: 24 },
  title: { marginTop: 0, marginBottom: 12, fontSize: 28 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 },
  metricCard: { border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 16 },
  cardBlock: { marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 14 },
  innerBlock: { marginTop: 10, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb', padding: 12 },
  rowBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  wrapRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 },
  issueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 },
  metricMini: { border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb', padding: 10 },
  mutedLabel: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  checkboxRow: { display: 'flex', gap: 8, alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, background: '#fff' },
  input: { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', background: '#fff', minWidth: 140 },
  primaryButton: { border: 'none', borderRadius: 10, padding: '10px 14px', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  secondaryButton: { display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #d1d5db', borderRadius: 10, padding: '10px 14px', background: '#fff', color: '#111827', cursor: 'pointer', fontWeight: 600 },
  goodButton: { display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 10, padding: '10px 14px', background: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  dangerButton: { display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 10, padding: '10px 14px', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  summaryRow: { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 14 },
  logRow: { border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, background: '#fff' },
  badgeDark: { display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#111827', color: '#fff', fontSize: 12, fontWeight: 700 },
  badgeMuted: { display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#e5e7eb', color: '#111827', fontSize: 12, fontWeight: 700 },
  badgeWarn: { display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#f59e0b', color: '#fff', fontSize: 12, fontWeight: 700 },
  badgeGood: { display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700 },
  badgeBlue: { display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 700 },
  badgePurple: { display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 700 },
  badgeDanger: { display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700 },
  shopGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 },
  shopCard: { border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 14 },
  loginWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Arial, Helvetica, sans-serif' },
  loginCard: { width: '100%', maxWidth: 420, border: '1px solid #e5e7eb', borderRadius: 16, background: '#fff', padding: 24 },
};
