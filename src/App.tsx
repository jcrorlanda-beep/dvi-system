// FULL MERGED PHASE 4 APP (INTEGRATED)
// Adds:
// - Inspection -> Work Line Generator
// - Smart status automation
// - Technician current job tracking
// - Parts linked to work lines with visual state
// - Upgraded shop floor + bay assignment

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
} from "lucide-react";

// ================= TYPES =================

type ViewKey = "dashboard" | "inspection" | "ro" | "parts" | "shop" | "tech";

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

type ROWorkLine = {
  id: string;
  label: string;
  category: string;
  technician: string;
  estimatedHours: number;
  actualHours: number;
  status: WorkLineStatus;
  startedAt?: number;
  partsSummary: "No Parts" | "Waiting Parts" | "Ready";
};

type ROStatus = "Open" | "In Progress" | "Waiting Parts" | "Quality Check" | "Completed";

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

// ================= SEED =================

const USERS: User[] = [{ username: "admin", password: "admin123", role: "Admin" }];

const DEFAULT_WORK_LINE: ROWorkLine = {
  id: "",
  label: "New Job",
  category: "General",
  technician: "",
  estimatedHours: 1,
  actualHours: 0,
  status: "Pending",
  partsSummary: "No Parts",
};

const INSPECTION_ISSUES: InspectionIssueDefinition[] = [
  {
    key: "brakes",
    label: "Brake Concern",
    category: "Brakes",
    defaultHours: 2.5,
    defaultWorkLineLabel: "Brake Inspection and Repair",
  },
  {
    key: "suspension",
    label: "Suspension Noise / Play",
    category: "Suspension",
    defaultHours: 3,
    defaultWorkLineLabel: "Suspension Inspection and Repair",
  },
  {
    key: "engine",
    label: "Engine Performance Issue",
    category: "Engine",
    defaultHours: 2,
    defaultWorkLineLabel: "Engine Diagnosis and Repair",
  },
  {
    key: "electrical",
    label: "Electrical Issue",
    category: "Electrical",
    defaultHours: 1.5,
    defaultWorkLineLabel: "Electrical System Check",
  },
  {
    key: "aircon",
    label: "Aircon Concern",
    category: "Aircon",
    defaultHours: 2,
    defaultWorkLineLabel: "Aircon Inspection and Service",
  },
  {
    key: "steering",
    label: "Steering Concern",
    category: "Steering",
    defaultHours: 2.5,
    defaultWorkLineLabel: "Steering System Inspection",
  },
  {
    key: "tires",
    label: "Tire / Alignment Concern",
    category: "Tires",
    defaultHours: 1.5,
    defaultWorkLineLabel: "Tire and Alignment Check",
  },
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

function getROStatusFromWorkLines(workLines: ROWorkLine[]): ROStatus {
  if (!workLines.length) return "Open";
  if (workLines.every((w) => w.status === "Done" || w.status === "Cancelled")) return "Completed";
  if (workLines.some((w) => w.status === "Quality Check")) return "Quality Check";
  if (workLines.some((w) => w.status === "Waiting Parts")) return "Waiting Parts";
  if (workLines.some((w) => w.status === "In Progress" || w.status === "Approved")) return "In Progress";
  return "Open";
}

function getPartsSummaryForWorkLine(parts: PartRequest[], workLineId?: string): ROWorkLine["partsSummary"] {
  if (!workLineId) return "No Parts";
  const linked = parts.filter((p) => p.workLineId === workLineId && !["Cancelled", "Closed"].includes(p.status));
  if (!linked.length) return "No Parts";
  if (linked.some((p) => !["Parts Arrived", "Closed"].includes(p.status))) return "Waiting Parts";
  return "Ready";
}

function recomputeROAutomation(ros: RepairOrder[], parts: PartRequest[]): RepairOrder[] {
  return ros.map((ro) => {
    const workLines = ro.workLines.map((w) => {
      const partsSummary = getPartsSummaryForWorkLine(parts, w.id);
      let status = w.status;

      if (partsSummary === "Waiting Parts" && ["Pending", "Approved"].includes(status)) {
        status = "Waiting Parts";
      }

      if (partsSummary === "Ready" && status === "Waiting Parts") {
        status = "Approved";
      }

      return {
        ...w,
        partsSummary,
        status,
      };
    });

    return {
      ...ro,
      workLines,
      status: getROStatusFromWorkLines(workLines),
    };
  });
}

function buildWorkLinesFromInspection(issues: InspectionSelection): ROWorkLine[] {
  return INSPECTION_ISSUES.filter((issue) => issues[issue.key]).map((issue) => ({
    ...DEFAULT_WORK_LINE,
    id: uid(),
    label: issue.defaultWorkLineLabel,
    category: issue.category,
    estimatedHours: issue.defaultHours,
  }));
}

function runSanityChecks() {
  const noLines = getROStatusFromWorkLines([]) === "Open";
  const completed =
    getROStatusFromWorkLines([
      { ...DEFAULT_WORK_LINE, id: "1", status: "Done" },
      { ...DEFAULT_WORK_LINE, id: "2", status: "Cancelled" },
    ]) === "Completed";
  const builtLines = buildWorkLinesFromInspection({
    ...EMPTY_INSPECTION_SELECTIONS,
    brakes: true,
    engine: true,
  }).length === 2;

  console.assert(noLines, "RO with no work lines should be Open");
  console.assert(completed, "RO should be Completed when all work lines are Done or Cancelled");
  console.assert(builtLines, "Inspection issue selection should generate correct number of work lines");
}

runSanityChecks();

// ================= APP =================

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [inspectionForm, setInspectionForm] = useState<InspectionForm>(DEFAULT_INSPECTION_FORM);

  const [ros, setRos] = useState<RepairOrder[]>(() => safeLoad<RepairOrder[]>("phase4_ros", []));
  const [parts, setParts] = useState<PartRequest[]>(() => safeLoad<PartRequest[]>("phase4_parts", []));

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("phase4_ros", JSON.stringify(ros));
    }
  }, [ros]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("phase4_parts", JSON.stringify(parts));
    }
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
    };
    setRos((prev) => [nextRO, ...prev]);
    setInspectionForm(DEFAULT_INSPECTION_FORM);
    setView("ro");
  };

  const updateRO = (id: string, patch: Partial<RepairOrder>) => {
    setRos((prev) =>
      prev.map((ro) => (ro.id === id ? { ...ro, ...patch } : ro)),
    );
  };

  const addWorkLine = (roId: string) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId) return ro;
        const workLines = [...ro.workLines, { ...DEFAULT_WORK_LINE, id: uid() }];
        return { ...ro, workLines, status: getROStatusFromWorkLines(workLines) };
      }),
    );
  };

  const updateWorkLine = (roId: string, wlId: string, patch: Partial<ROWorkLine>) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId) return ro;
        const workLines = ro.workLines.map((w) => {
          if (w.id !== wlId) return w;
          let next = { ...w, ...patch };

          if (patch.status === "In Progress" && !w.startedAt) {
            next.startedAt = Date.now();
          }

          if (patch.status === "Done" && w.startedAt) {
            const elapsedHours = Math.max(0.1, (Date.now() - w.startedAt) / 3600000);
            next.actualHours = Number(elapsedHours.toFixed(2));
          }

          return next;
        });

        const automated = recomputeROAutomation([{ ...ro, workLines }], parts)[0];
        return automated;
      }),
    );
  };

  const startWorkLine = (roId: string, wlId: string) => {
    updateWorkLine(roId, wlId, { status: "In Progress" });
  };

  const pauseWorkLine = (roId: string, wlId: string) => {
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
      status: "Draft",
      createdAt: Date.now(),
    };

    const nextParts = [nextPart, ...parts];
    setParts(nextParts);
    setRos((prev) => recomputeROAutomation(prev, nextParts));
  };

  const updatePart = (id: string, patch: Partial<PartRequest>) => {
    const nextParts = parts.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setParts(nextParts);
    setRos((prev) => recomputeROAutomation(prev, nextParts));
  };

  // ================= DERIVED =================

  const dashboardStats = useMemo(
    () => ({
      totalRO: ros.length,
      inProgress: ros.filter((r) => r.status === "In Progress").length,
      waitingParts: ros.filter((r) => r.status === "Waiting Parts").length,
      completed: ros.filter((r) => r.status === "Completed").length,
      totalParts: parts.length,
    }),
    [ros, parts],
  );

  const technicianLoad = useMemo(() => {
    const map: Record<string, { jobs: number; current: string[] }> = {};
    ros.forEach((ro) => {
      ro.workLines.forEach((w) => {
        const tech = w.technician.trim();
        if (!tech) return;
        if (!map[tech]) map[tech] = { jobs: 0, current: [] };
        map[tech].jobs += 1;
        if (w.status === "In Progress") {
          map[tech].current.push(`${ro.roNumber}: ${w.label}`);
        }
      });
    });
    return map;
  }, [ros]);

  const shopRows = useMemo(
    () =>
      ros
        .slice()
        .sort((a, b) => a.bay.localeCompare(b.bay) || b.createdAt - a.createdAt),
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
        <MetricCard title="Parts Requests" value={dashboardStats.totalParts} />
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
            onChange={(e) => setInspectionForm((p) => ({ ...p, plate: e.target.value.toUpperCase() }))}
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
              setInspectionForm((p) => ({
                ...p,
                priority: e.target.value as InspectionForm["priority"],
              }))
            }
          >
            {["Low", "Normal", "High", "Urgent"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
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
          <div style={styles.wrapRow}>
            <input
              style={styles.input}
              placeholder="Plate"
              value={ro.plate}
              onChange={(e) => updateRO(ro.id, { plate: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Vehicle"
              value={ro.vehicle}
              onChange={(e) => updateRO(ro.id, { vehicle: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Customer"
              value={ro.customer}
              onChange={(e) => updateRO(ro.id, { customer: e.target.value })}
            />
            <select
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
              style={styles.input}
              value={ro.priority}
              onChange={(e) =>
                updateRO(ro.id, { priority: e.target.value as RepairOrder["priority"] })
              }
            >
              {["Low", "Normal", "High", "Urgent"].map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <span style={styles.badgeDark}>{ro.status}</span>
          </div>

          <div style={{ marginTop: 12 }}>
            <button style={styles.secondaryButton} onClick={() => addWorkLine(ro.id)}>
              + Add Work Line
            </button>
          </div>

          {ro.workLines.map((w) => (
            <div key={w.id} style={styles.innerBlock}>
              <div style={styles.wrapRow}>
                <input
                  style={styles.input}
                  value={w.label}
                  onChange={(e) => updateWorkLine(ro.id, w.id, { label: e.target.value })}
                />
                <input
                  style={styles.input}
                  value={w.category}
                  onChange={(e) => updateWorkLine(ro.id, w.id, { category: e.target.value })}
                  placeholder="Category"
                />
                <select
                  style={styles.input}
                  value={w.status}
                  onChange={(e) =>
                    updateWorkLine(ro.id, w.id, {
                      status: e.target.value as WorkLineStatus,
                    })
                  }
                >
                  {[
                    "Pending",
                    "Approved",
                    "In Progress",
                    "Waiting Parts",
                    "Quality Check",
                    "Done",
                    "Cancelled",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  style={styles.input}
                  placeholder="Technician"
                  value={w.technician}
                  onChange={(e) => updateWorkLine(ro.id, w.id, { technician: e.target.value })}
                />
                <input
                  style={{ ...styles.input, maxWidth: 100 }}
                  type="number"
                  placeholder="Est. Hrs"
                  value={w.estimatedHours}
                  onChange={(e) =>
                    updateWorkLine(ro.id, w.id, {
                      estimatedHours: Number(e.target.value) || 0,
                    })
                  }
                />
                <span style={w.partsSummary === "Waiting Parts" ? styles.badgeWarn : styles.badgeMuted}>
                  {w.partsSummary}
                </span>
              </div>

              <div style={{ ...styles.wrapRow, marginTop: 10 }}>
                <button style={styles.secondaryButton} onClick={() => createPart(ro.roNumber, w)}>
                  <Package size={14} /> Request Part
                </button>
                <button style={styles.secondaryButton} onClick={() => startWorkLine(ro.id, w.id)}>
                  <Play size={14} /> Start
                </button>
                <button style={styles.secondaryButton} onClick={() => pauseWorkLine(ro.id, w.id)}>
                  <Pause size={14} /> Pause
                </button>
                <span style={styles.badgeMuted}>Actual: {w.actualHours.toFixed(2)}h</span>
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
      {parts.length === 0 ? <div style={styles.cardBlock}>No parts requests yet.</div> : null}
      {parts.map((part) => (
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
            <select
              style={styles.input}
              value={part.status}
              onChange={(e) =>
                updatePart(part.id, { status: e.target.value as PartRequestStatus })
              }
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
              ].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
                <div style={{ fontSize: 13, color: "#6b7280" }}>{ro.roNumber}</div>
              </div>
              <span style={getROBadgeStyle(ro.status)}>{ro.status}</span>
            </div>
            <div style={{ marginTop: 10 }}>{ro.vehicle || "No Vehicle"}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>{ro.plate || "No Plate"}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>{ro.customer || "No Customer"}</div>
            <div style={{ marginTop: 10 }}>
              <span style={getPriorityStyle(ro.priority)}>{ro.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TechView = () => (
    <div>
      <h2 style={styles.heading}>Technician Board</h2>
      {Object.entries(technicianLoad).length === 0 ? (
        <div style={styles.cardBlock}>No technician assignments yet.</div>
      ) : (
        Object.entries(technicianLoad).map(([tech, info]) => (
          <div key={tech} style={styles.cardBlock}>
            <div style={styles.rowBetween}>
              <div style={{ fontWeight: 700 }}>{tech}</div>
              <span style={styles.badgeMuted}>{info.jobs} jobs</span>
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {info.current.length ? (
                info.current.map((job) => (
                  <div key={job} style={styles.innerBlock}>
                    {job}
                  </div>
                ))
              ) : (
                <div style={{ color: "#6b7280" }}>No active job in progress.</div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ================= LOGIN =================

  if (!user) {
    return (
      <div style={styles.loginWrap}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>Workshop System</h1>
          <p style={{ marginTop: 0, color: "#6b7280" }}>Phase 4 integrated automation build.</p>
          <button style={styles.primaryButton} onClick={() => setUser(USERS[0])}>
            Login as {USERS[0].role}
          </button>
        </div>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div style={styles.appWrap}>
      <aside style={styles.sidebar}>
        <NavButton icon={<Home size={16} />} label="Dashboard" onClick={() => setView("dashboard")} />
        <NavButton icon={<ClipboardList size={16} />} label="Inspection" onClick={() => setView("inspection")} />
        <NavButton icon={<Car size={16} />} label="RO" onClick={() => setView("ro")} />
        <NavButton icon={<Package size={16} />} label="Parts" onClick={() => setView("parts")} />
        <NavButton icon={<Wrench size={16} />} label="Shop" onClick={() => setView("shop")} />
        <NavButton icon={<Users size={16} />} label="Tech" onClick={() => setView("tech")} />
      </aside>

      <main style={styles.main}>
        {view === "dashboard" && <DashboardView />}
        {view === "inspection" && <InspectionView />}
        {view === "ro" && <ROView />}
        {view === "parts" && <PartsView />}
        {view === "shop" && <ShopView />}
        {view === "tech" && <TechView />}
      </main>
    </div>
  );
}

// ================= SMALL COMPONENTS =================

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

function getROBadgeStyle(status: ROStatus): React.CSSProperties {
  if (status === "Completed") return styles.badgeGood;
  if (status === "Waiting Parts") return styles.badgeWarn;
  if (status === "In Progress") return styles.badgeBlue;
  if (status === "Quality Check") return styles.badgePurple;
  return styles.badgeMuted;
}

function getPriorityStyle(priority: RepairOrder["priority"]): React.CSSProperties {
  if (priority === "Urgent") return styles.badgeDanger;
  if (priority === "High") return styles.badgeWarn;
  if (priority === "Normal") return styles.badgeBlue;
  return styles.badgeMuted;
}

// ================= STYLES =================

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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  shopCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    padding: 14,
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
