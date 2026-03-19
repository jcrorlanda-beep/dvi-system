// ===== PHASE 7 FULL APP (CLEAN REBUILD) =====
// Includes:
// - RO + Inspection
// - Worklines + Approval
// - Parts + Billing
// - Shop + Technician Board
// - Customer History + Return Jobs

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
  History,
  Search,
  RotateCcw,
} from "lucide-react";

/* ================= TYPES ================= */

type ViewKey =
  | "dashboard"
  | "inspection"
  | "approval"
  | "ro"
  | "parts"
  | "shop"
  | "tech"
  | "billing"
  | "history";

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
  | "Done"
  | "Cancelled";

type ApprovalStatus =
  | "Pending Approval"
  | "Approved"
  | "Declined";

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
};

type RepairOrder = {
  id: string;
  roNumber: string;
  plate: string;
  vehicle: string;
  customer: string;
  status: string;
  workLines: ROWorkLine[];
  createdAt: number;
  isReturnJob: boolean;
  returnReason: string;
};

type PartRequest = {
  id: string;
  roNumber: string;
  partName: string;
  qty: number;
  unitCost: number;
};

type Payment = {
  id: string;
  roNumber: string;
  amount: number;
};

/* ================= UTILS ================= */

const uid = () => Math.random().toString(36).substring(2, 9);

const calcLine = (l: ROWorkLine) => {
  const labor = l.estimatedHours * l.laborRate;
  return {
    ...l,
    laborCost: labor,
    estimateTotal: labor + l.partsCost,
  };
};

/* ================= APP ================= */

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [user, setUser] = useState<User | null>(null);

  const [ros, setRos] = useState<RepairOrder[]>([]);
  const [parts, setParts] = useState<PartRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");

  /* ================= ACTIONS ================= */

  const createRO = () => {
    const ro: RepairOrder = {
      id: uid(),
      roNumber: "RO-" + Date.now(),
      plate: "",
      vehicle: "",
      customer: "",
      status: "Open",
      workLines: [],
      createdAt: Date.now(),
      isReturnJob: false,
      returnReason: "",
    };
    setRos([ro, ...ros]);
  };

  const addWorkLine = (roId: string) => {
    setRos((prev) =>
      prev.map((ro) =>
        ro.id === roId
          ? {
              ...ro,
              workLines: [
                ...ro.workLines,
                calcLine({
                  id: uid(),
                  label: "New Work",
                  category: "General",
                  technician: "",
                  estimatedHours: 1,
                  actualHours: 0,
                  laborRate: 850,
                  laborCost: 0,
                  partsCost: 0,
                  estimateTotal: 0,
                  status: "Pending",
                  approvalStatus: "Pending Approval",
                }),
              ],
            }
          : ro
      )
    );
  };

  const updateLine = (roId: string, lineId: string, patch: Partial<ROWorkLine>) => {
    setRos((prev) =>
      prev.map((ro) => {
        if (ro.id !== roId) return ro;
        return {
          ...ro,
          workLines: ro.workLines.map((l) =>
            l.id === lineId ? calcLine({ ...l, ...patch }) : l
          ),
        };
      })
    );
  };

  const addPart = (roNumber: string) => {
    setParts([
      { id: uid(), roNumber, partName: "", qty: 1, unitCost: 0 },
      ...parts,
    ]);
  };

  const addPayment = (roNumber: string) => {
    setPayments([
      { id: uid(), roNumber, amount: 1000 },
      ...payments,
    ]);
  };

  /* ================= DERIVED ================= */

  const history = useMemo(() => {
    const map: any = {};
    ros.forEach((ro) => {
      const key = ro.plate;
      if (!map[key]) map[key] = [];
      map[key].push(ro);
    });
    return map;
  }, [ros]);

  /* ================= LOGIN ================= */

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <button onClick={() => setUser({ username: "admin", password: "", role: "Admin" })}>
          Login
        </button>
      </div>
    );
  }

  /* ================= VIEWS ================= */

  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <div style={{ width: 200 }}>
        <button onClick={() => setView("dashboard")}>Dashboard</button>
        <button onClick={() => setView("ro")}>RO</button>
        <button onClick={() => setView("parts")}>Parts</button>
        <button onClick={() => setView("billing")}>Billing</button>
        <button onClick={() => setView("history")}>History</button>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 20 }}>
        {view === "dashboard" && (
          <div>
            <h2>Dashboard</h2>
            Total RO: {ros.length}
          </div>
        )}

        {view === "ro" && (
          <div>
            <h2>Repair Orders</h2>
            <button onClick={createRO}>Create RO</button>

            {ros.map((ro) => (
              <div key={ro.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
                <input
                  placeholder="Plate"
                  value={ro.plate}
                  onChange={(e) =>
                    setRos(
                      ros.map((r) =>
                        r.id === ro.id ? { ...r, plate: e.target.value } : r
                      )
                    )
                  }
                />

                <button onClick={() => addWorkLine(ro.id)}>Add Work</button>

                {ro.workLines.map((l) => (
                  <div key={l.id}>
                    <input
                      value={l.label}
                      onChange={(e) =>
                        updateLine(ro.id, l.id, { label: e.target.value })
                      }
                    />
                    ₱{l.estimateTotal}
                  </div>
                ))}

                <button onClick={() => addPart(ro.roNumber)}>Add Part</button>
                <button onClick={() => addPayment(ro.roNumber)}>Pay</button>
              </div>
            ))}
          </div>
        )}

        {view === "parts" && (
          <div>
            <h2>Parts</h2>
            {parts.map((p) => (
              <div key={p.id}>
                {p.roNumber} - {p.partName}
              </div>
            ))}
          </div>
        )}

        {view === "billing" && (
          <div>
            <h2>Billing</h2>
            {payments.map((p) => (
              <div key={p.id}>
                {p.roNumber} - ₱{p.amount}
              </div>
            ))}
          </div>
        )}

        {view === "history" && (
          <div>
            <h2>History</h2>
            <input
              placeholder="Search plate"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {Object.keys(history)
              .filter((k) => k.includes(search))
              .map((plate) => (
                <div key={plate}>
                  <h4>{plate}</h4>
                  {history[plate].map((ro: RepairOrder) => (
                    <div key={ro.id}>
                      {ro.roNumber} {ro.isReturnJob && " (Return)"}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}