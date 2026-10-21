import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownUp, ArrowRight, BarChart3, Check, ChevronDown, CircleHelp, Clock3, Cpu, Download, FileSpreadsheet, Gauge, Layers3, Moon, Play, RefreshCw, Search, ShieldCheck, Sun, Timer, Waypoints, Zap } from "lucide-react";

type Alg = { id: string; key: string; name: string; full: string };
type Wld = { pid: number; arrival: number; burst: number };
type Pro = Wld & { predicted: number; start: number; completion: number; waiting: number; turnaround: number; response: number; score: number };
type Gnt = { pid: number | null; label: string; start: number; end: number; duration: number; idle: boolean };
type Met = { avg_wait: number; avg_turnaround: number; avg_response: number; avg_slowdown: number; max_wait: number; p95_wait: number; p99_wait: number; throughput: number; cpu_utilization: number; makespan: number };
type Res = Alg & { metrics: Met; processes: Pro[]; gantt: Gnt[] };
type Dat = { mode: string; seed: number; n: number; amx?: number; bmn?: number; bmx?: number; err?: number; workload: Wld[]; algorithms: Alg[]; selected?: Res; results?: Res[]; leaders?: Record<string, string> };
type Req = { n: number; alg: string; amx?: number; bmn?: number; bmx?: number; err?: number };

const API = "http://127.0.0.1:8000/api";
const FMT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const VAL = (v: number) => Number.isFinite(v) ? FMT.format(v) : "—";
const RAW = (v: number) => Number.isFinite(v) ? v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "") : "—";

function Ico({ nm, sz = 18 }: { nm: string; sz?: number }) {
  if (nm === "spark") return <Zap size={sz} />;
  if (nm === "chart") return <BarChart3 size={sz} />;
  if (nm === "cpu") return <Cpu size={sz} />;
  if (nm === "time") return <Clock3 size={sz} />;
  if (nm === "flow") return <Waypoints size={sz} />;
  if (nm === "file") return <FileSpreadsheet size={sz} />;
  if (nm === "run") return <Play size={sz} />;
  if (nm === "sync") return <RefreshCw size={sz} />;
  if (nm === "down") return <Download size={sz} />;
  if (nm === "search") return <Search size={sz} />;
  if (nm === "gauge") return <Gauge size={sz} />;
  if (nm === "shield") return <ShieldCheck size={sz} />;
  if (nm === "layers") return <Layers3 size={sz} />;
  if (nm === "help") return <CircleHelp size={sz} />;
  if (nm === "sort") return <ArrowDownUp size={sz} />;
  if (nm === "sun") return <Sun size={sz} />;
  if (nm === "moon") return <Moon size={sz} />;
  if (nm === "check") return <Check size={sz} />;
  if (nm === "arrow") return <ArrowRight size={sz} />;
  if (nm === "activity") return <Activity size={sz} />;
  if (nm === "timer") return <Timer size={sz} />;
  return <ChevronDown size={sz} />;
}

function Ipt({ lab, val, set, min = 1, max = 500 }: { lab: string; val: number; set: (v: number) => void; min?: number; max?: number }) {
  return <label className="fld"><span className="lab">{lab}</span><input type="number" min={min} max={max} value={val} onChange={e => set(Math.max(min, Math.min(max, Number(e.target.value) || min)))} /></label>;
}

function Bar({ dat }: { dat: Gnt[] }) {
  const mx = dat.length ? Math.max(...dat.map(a => a.end)) : 1;
  return <div className="gnt-wrap"><div className="gnt" role="img" aria-label="Gantt chart timeline">{dat.map((a, i) => <div key={`${a.label}-${i}-${a.start}`} className={"seg " + (a.idle ? "idle" : "tone-" + ((Math.max(1, a.pid || 1) - 1) % 8))} style={{ flexGrow: Math.max(0.05, a.duration), flexBasis: 0 }} title={`${a.label} · ${RAW(a.start)} to ${RAW(a.end)} · duration ${RAW(a.duration)}`}><span>{a.duration > mx * 0.032 ? a.label : ""}</span><small>{a.duration > mx * 0.075 ? `${RAW(a.start)}–${RAW(a.end)}` : ""}</small></div>)}</div><div className="gax"><span>0</span><span>Time increases →</span><span>{RAW(mx)}</span></div><div className="leg"><span><i className="sw proc"/> Process execution</span><span><i className="sw idle"/> Idle time</span><span>Click or hover over a segment for its exact interval.</span></div></div>;
}

function Tbl({ rows, mode = "proc" }: { rows: Array<Record<string, unknown>>; mode?: string }) {
  const [qry, setQry] = useState("");
  const [sort, setSort] = useState(mode === "sum" ? "avg_wait" : "pid");
  const [rev, setRev] = useState(false);
  const cols = mode === "wld" ? [{ k: "pid", t: "PID" }, { k: "arrival", t: "Arrival time (AT)" }, { k: "burst", t: "Burst time (BT)" }] : mode === "sum" ? [{ k: "full", t: "Algorithm" }, { k: "avg_wait", t: "Avg WT" }, { k: "avg_turnaround", t: "Avg TAT" }, { k: "avg_response", t: "Avg RT" }, { k: "avg_slowdown", t: "Avg slowdown" }, { k: "max_wait", t: "Max WT" }, { k: "p95_wait", t: "P95 WT" }, { k: "p99_wait", t: "P99 WT" }, { k: "throughput", t: "Throughput" }, { k: "cpu_utilization", t: "CPU util." }, { k: "makespan", t: "Makespan" }] : [{ k: "pid", t: "PID" }, { k: "arrival", t: "AT" }, { k: "burst", t: "BT" }, { k: "predicted", t: "Pred. BT" }, { k: "start", t: "Start" }, { k: "completion", t: "CT" }, { k: "turnaround", t: "TAT" }, { k: "waiting", t: "WT" }, { k: "response", t: "RT" }];
  const fil = useMemo(() => {
    let out = rows.filter(r => Object.values(r).join(" ").toLowerCase().includes(qry.toLowerCase()));
    out = [...out].sort((a, b) => {
      const x = a[sort], y = b[sort];
      const z = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""));
      return rev ? -z : z;
    });
    return out;
  }, [rows, qry, sort, rev]);
  return <div className="tbl-box"><div className="tbl-tools"><div className="tbl-count">{fil.length} row{fil.length === 1 ? "" : "s"}</div><label className="srch"><Ico nm="search" sz={15}/><input aria-label="Search table" value={qry} onChange={e => setQry(e.target.value)} placeholder="Search rows" /></label></div><div className="tbl-scroll"><table><thead><tr>{cols.map(c => <th key={c.k}><button className="thb" onClick={() => { if (sort === c.k) setRev(!rev); else { setSort(c.k); setRev(false); } }}>{c.t}<Ico nm="sort" sz={12}/></button></th>)}</tr></thead><tbody>{fil.map((r, i) => <tr key={`${String(r.pid ?? r.id ?? r.full)}-${i}`}>{cols.map(c => <td key={c.k}>{c.k === "full" ? <span className="algcell"><i className={`dot d-${String(r.id ?? "").toLowerCase()}`}/>{String(r[c.k] ?? "—")}</span> : c.k === "cpu_utilization" ? `${VAL(Number(r[c.k]))}%` : typeof r[c.k] === "number" && c.k !== "pid" ? VAL(Number(r[c.k])) : String(r[c.k] ?? "—")}</td>)}</tr>)}</tbody></table>{fil.length === 0 && <div className="empty">No matching rows.</div>}</div></div>;
}

function MetCard({ ico, lab, val, sub, hi = false }: { ico: string; lab: string; val: string; sub: string; hi?: boolean }) {
  return <div className={`mcard ${hi ? "mh" : ""}`}><div className="m-top"><span className="m-ico"><Ico nm={ico} sz={17}/></span><span>{lab}</span></div><strong>{val}</strong><small>{sub}</small></div>;
}

function AlgCard({ dat, pos }: { dat: Res; pos: number }) {
  const [open, setOpen] = useState(false);
  return <section className="alg-card" style={{ animationDelay: `${pos * 45}ms` }}><div className="alg-head"><div className="alg-title"><span className={`alg-no no-${pos}`}>{String(pos + 1).padStart(2, "0")}</span><div><h3>{dat.full}</h3><p>{dat.processes.length} jobs · {dat.gantt.length} timeline segments</p></div></div><button className="arr-btn" onClick={() => setOpen(!open)} aria-expanded={open}><span>{open ? "Hide rows" : "View rows"}</span><ChevronDown size={17} className={open ? "turn" : ""}/></button></div><Bar dat={dat.gantt}/><div className="alg-met"><span><small>Avg WT</small><b>{VAL(dat.metrics.avg_wait)}</b></span><span><small>Avg TAT</small><b>{VAL(dat.metrics.avg_turnaround)}</b></span><span><small>Avg RT</small><b>{VAL(dat.metrics.avg_response)}</b></span><span><small>CPU util.</small><b>{VAL(dat.metrics.cpu_utilization)}%</b></span></div>{open && <div className="alg-pro"><Tbl rows={dat.processes.map(p => ({ ...p }))}/></div>}</section>;
}

export default function App() {
  const [tab, setTab] = useState("one");
  const [n, setN] = useState(50);
  const [alg, setAlg] = useState("QH");
  const [amx, setAmx] = useState(40);
  const [bmn, setBmn] = useState(1);
  const [bmx, setBmx] = useState(25);
  const [errp, setErrp] = useState(0);
  const [adv, setAdv] = useState(false);
  const [drk, setDrk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [api, setApi] = useState("checking");
  const [als, setAls] = useState<Alg[]>([]);
  const [dat, setDat] = useState<Dat | null>(null);
  const [pick, setPick] = useState("FC");

  useEffect(() => {
    document.documentElement.dataset.theme = drk ? "dark" : "light";
    const get = async () => {
      try { const res = await fetch(`${API}/health`); if (!res.ok) throw new Error("API unavailable"); const ar = await fetch(`${API}/algorithms`); if (ar.ok) { const jd = await ar.json(); setAls(jd.algorithms as Alg[]); } setApi("online"); }
      catch { setApi("offline"); }
    };
    void get();
  }, [drk]);

  const req = async (allp: boolean) => {
    setBusy(true); setErr(""); setDat(null);
    try {
      const bod: Req = { n, alg, amx, bmn, bmx, err: errp };
      const res = await fetch(`${API}/${allp ? "compare" : "simulate"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bod) });
      const raw = await res.json();
      if (!res.ok) throw new Error(raw.detail || "The request failed.");
      setDat(raw as Dat); setApi("online");
      if (allp && raw.results?.length) setPick(raw.results[0].id);
      window.setTimeout(() => document.getElementById("out")?.scrollIntoView({ behavior: "smooth", block: "start" }), 90);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "The API could not complete this run."); setApi("offline");
    } finally { setBusy(false); }
  };

  const one = dat?.mode === "single" ? dat.selected : undefined;
  const all = dat?.mode === "compare" ? dat.results ?? [] : [];
  const sel = all.find(a => a.id === pick) ?? all[0];
  const sum = all.map(a => ({ id: a.id, full: a.full, ...a.metrics }));
  const winCnt = all.length;
  const best = (k: keyof Met, high = false) => all.length ? all.reduce((a, b) => high ? (a.metrics[k] > b.metrics[k] ? a : b) : (a.metrics[k] < b.metrics[k] ? a : b)) : undefined;

  const exp = (txt: string, mime: string, name: string) => {
    const blob = new Blob([txt], { type: mime }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const dwn = (kind: string) => {
    if (!dat) return;
    if (kind === "input") exp("pid,arrival,burst\n" + dat.workload.map(r => `${r.pid},${r.arrival},${r.burst}`).join("\n"), "text/csv", `qh-sjf-workload-${dat.seed}.csv`);
    else if (kind === "sum") {
      const rows = dat.mode === "single" ? [one].filter(Boolean) as Res[] : all;
      exp("algorithm,avg_wait,avg_turnaround,avg_response,avg_slowdown,max_wait,p95_wait,p99_wait,throughput,cpu_utilization_percent,makespan\n" + rows.map(r => [r.key, r.metrics.avg_wait, r.metrics.avg_turnaround, r.metrics.avg_response, r.metrics.avg_slowdown, r.metrics.max_wait, r.metrics.p95_wait, r.metrics.p99_wait, r.metrics.throughput, r.metrics.cpu_utilization, r.metrics.makespan].join(",")).join("\n"), "text/csv", `qh-sjf-summary-${dat.seed}.csv`);
    } else {
      const rows = dat.mode === "single" ? [one].filter(Boolean) as Res[] : all;
      exp("algorithm,pid,arrival,burst,predicted,start,completion,waiting,turnaround,response,score\n" + rows.flatMap(r => r.processes.map(p => [r.key, p.pid, p.arrival, p.burst, p.predicted, p.start, p.completion, p.waiting, p.turnaround, p.response, p.score].join(","))).join("\n"), "text/csv", `qh-sjf-processes-${dat.seed}.csv`);
    }
  };

  return <div className="app">
    <header className="top"><a className="brand" href="#top" aria-label="QH-SJF home"><span className="brand-mark"><Ico nm="flow" sz={21}/></span><span><b>QH-SJF</b><small>SCHEDULING LAB</small></span></a><div className="top-mid"><span className={`api-dot ${api}`}/><span>{api === "online" ? "C ENGINE CONNECTED" : api === "checking" ? "CONNECTING TO API" : "API OFFLINE"}</span></div><div className="top-end"><span className="ver">ENGINE / C11</span><button className="ic-btn" onClick={() => setDrk(!drk)} aria-label="Toggle color theme"><Ico nm={drk ? "sun" : "moon"} sz={18}/></button></div></header>
    <main id="top" className="main">
      <section className="hero"><div className="hero-tag"><span className="tag-pip"/> CPU SCHEDULING · INTERACTIVE LAB</div><div className="hero-grid"><div className="hero-copy"><h1>Understand the<br/><span>order of execution.</span></h1><p>Run a single scheduling policy or compare all eight against the same generated workload. Real results, directly from your C engine.</p><div className="hero-proof"><span><Ico nm="shield" sz={15}/> Real C simulation</span><span><Ico nm="activity" sz={15}/> Reproducible runs</span><span><Ico nm="layers" sz={15}/> 8 policies</span></div></div><div className="hero-art" aria-hidden="true"><div className="orb orb-a"/><div className="orb orb-b"/><div className="art-line l1"/><div className="art-line l2"/><div className="art-line l3"/><div className="art-chip c1"><span className="chip-dot"/> READY QUEUE <b>{String(n).padStart(2, "0")}</b></div><div className="art-chip c2"><Ico nm="cpu" sz={16}/> CPU CORE <b>ACTIVE</b></div><div className="art-axis"><span>0</span><i/><i/><i/><i/><span>t</span></div></div></div></section>

      <nav className="tabs" aria-label="Simulation modes"><button className={tab === "one" ? "active" : ""} onClick={() => { setTab("one"); setErr(""); setDat(null); }}><span className="tab-ico"><Ico nm="run" sz={17}/></span><span><b>Single algorithm</b><small>Inspect one policy</small></span>{tab === "one" && <i className="tab-pip"/>}</button><button className={tab === "all" ? "active" : ""} onClick={() => { setTab("all"); setErr(""); setDat(null); }}><span className="tab-ico"><Ico nm="chart" sz={17}/></span><span><b>Compare all</b><small>Benchmark every policy</small></span>{tab === "all" && <i className="tab-pip"/>}</button><div className="tab-spacer"/><span className="tab-note"><Ico nm="help" sz={14}/> Same workload, fair comparison</span></nav>

      <section className="cfg card"><div className="sec-head"><div><span className="eyebrow">CONFIGURATION</span><h2>{tab === "one" ? "Set up a simulation" : "Set up a comparison"}</h2><p>{tab === "one" ? "Choose the workload size and scheduling method." : "Choose a workload size. Every policy receives identical processes."}</p></div><div className="cfg-id"><span>RUN MODE</span><b>{tab === "one" ? "01 / SELECTIVE" : "02 / BENCHMARK"}</b></div></div><div className="cfg-grid"><div className="n-box"><Ipt lab="Number of processes (N)" val={n} set={setN} max={500}/><div className="range-note"><span>1 process</span><span>Up to 500</span></div><input className="rng" type="range" min="1" max="500" value={n} onChange={e => setN(Number(e.target.value))} aria-label="Process count slider"/><div className="stepper"><button onClick={() => setN(Math.max(1, n - 10))}>−10</button><button onClick={() => setN(Math.max(1, n - 1))}>−1</button><button onClick={() => setN(Math.min(500, n + 1))}>+1</button><button onClick={() => setN(Math.min(500, n + 10))}>+10</button></div></div>{tab === "one" ? <div className="alg-box"><label className="fld"><span className="lab">Scheduling algorithm</span><span className="sel-wrap"><select value={alg} onChange={e => setAlg(e.target.value)}>{(als.length ? als : dat?.algorithms ?? []).length ? (als.length ? als : dat!.algorithms).map(a => <option key={a.id} value={a.id}>{a.full}</option>) : <><option value="FC">First-Come, First-Served (FCFS)</option><option value="SJ">Shortest Job First (SJF)</option><option value="HR">Highest Response Ratio Next (HRRN)</option><option value="LA">Linear Aging (LA)</option><option value="FQ">Fixed Quadratic Aging (FQ)</option><option value="LO">Load-only variant (L-only)</option><option value="HO">Heterogeneity-only variant (H-only)</option><option value="QH">Queue- and Heterogeneity-Aware Shortest Job First (QH-SJF)</option></>}</select><ChevronDown size={17}/></span></label><div className="alg-desc"><span className="alg-em"><Ico nm="cpu" sz={17}/></span><span><b>{(dat?.algorithms ?? []).find(a => a.id === alg)?.name ?? ({ FC: "First-Come, First-Served", SJ: "Shortest Job First", HR: "Highest Response Ratio Next", LA: "Linear Aging", FQ: "Fixed Quadratic Aging", LO: "Load-only variant", HO: "Heterogeneity-only variant", QH: "Queue- and Heterogeneity-Aware Shortest Job First" } as Record<string, string>)[alg]}</b><small>The chosen policy's timeline and process metrics will be shown below.</small></span></div></div> : <div className="cmp-note"><span className="cmp-ico"><Ico nm="layers" sz={22}/></span><div><b>All 8 policies, one input</b><p>Each algorithm runs against a copy of the same workload, so the results are comparable.</p><div className="mini-tags"><span>FCFS</span><span>SJF</span><span>HRRN</span><span>LA</span><span>FQ</span><span>L-only</span><span>H-only</span><span>QH-SJF</span></div></div></div>}</div><button className="adv-btn" onClick={() => setAdv(!adv)}><span><Ico nm="sort" sz={15}/> Advanced workload settings</span><ChevronDown size={16} className={adv ? "turn" : ""}/></button>{adv && <div className="adv-grid"><Ipt lab="Maximum arrival time" val={amx} set={setAmx} min={0} max={100000}/><Ipt lab="Minimum burst time" val={bmn} set={setBmn} min={0.01} max={100000}/><Ipt lab="Maximum burst time" val={bmx} set={setBmx} min={0.01} max={100000}/><label className="fld"><span className="lab">Prediction error</span><span className="sel-wrap"><select value={errp} onChange={e => setErrp(Number(e.target.value))}><option value={0}>0% · perfect estimates</option><option value={0.1}>10%</option><option value={0.2}>20%</option><option value={0.3}>30%</option></select><ChevronDown size={17}/></span></label></div>}<div className="cfg-foot"><div className="seed-info"><span className="seed-icon"><Ico nm="sync" sz={15}/></span><span><b>Fresh random workload</b><small>Seed is generated automatically and shown with results.</small></span></div><button className="run-btn" onClick={() => void req(tab === "all")} disabled={busy || bmx < bmn}>{busy ? <><span className="spin"/> Running simulation…</> : <><Ico nm="run" sz={17}/>{tab === "one" ? "Run simulation" : "Generate & compare"}<Ico nm="arrow" sz={16}/></>}</button></div>{bmx < bmn && <p className="err-msg">Maximum burst must be greater than or equal to minimum burst.</p>}</section>

      {err && <div className="err-card"><Ico nm="help" sz={19}/><div><b>Run did not complete</b><p>{err}</p><small>Check that the Python API is running at 127.0.0.1:8000.</small></div></div>}
      {busy && <div className="load-card"><div className="load-spin"/><div><b>Running the C scheduling engine</b><p>Generating a workload and calculating process timings for {tab === "one" ? "the selected policy" : "all eight policies"}.</p></div></div>}

      {dat && <div id="out" className="out">
        <div className="out-head"><div><span className="eyebrow">SIMULATION OUTPUT</span><h2>{dat.mode === "single" ? "Your run, visualized." : "The comparison, at a glance."}</h2><p>Generated from the live C engine. Run seed <b>#{dat.seed}</b> · {dat.n} processes · bounds: AT 0–{VAL(dat.amx ?? amx)}, BT {VAL(dat.bmn ?? bmn)}–{VAL(dat.bmx ?? bmx)}, prediction error {VAL((dat.err ?? errp) * 100)}%.</p></div><div className="out-actions"><button className="soft-btn" onClick={() => dwn("input")}><Ico nm="down" sz={15}/> Input CSV</button><button className="soft-btn" onClick={() => dwn("sum")}><Ico nm="down" sz={15}/> Summary CSV</button><button className="soft-btn" onClick={() => dwn("proc")}><Ico nm="down" sz={15}/> Process CSV</button></div></div>
        <section className="card sec"><div className="sec-head small-head"><div><span className="eyebrow">01 / INPUT</span><h2>Generated workload</h2><p>This is the exact process set used by the scheduler.</p></div><span className="pill"><span className="pill-dot"/> {dat.workload.length} processes</span></div><Tbl mode="wld" rows={dat.workload.map(p => ({ ...p }))}/></section>
        {one && <><section className="one-id"><div className="one-mark"><Ico nm="cpu" sz={22}/></div><div><span className="eyebrow">POLICY SELECTED</span><h2>{one.full}</h2><p>{one.processes.length} processes scheduled · seed #{dat.seed}</p></div><span className="one-pill">{one.key}</span></section><div className="met-grid"><MetCard ico="time" lab="Average waiting time" val={VAL(one.metrics.avg_wait)} sub="WT · time units" hi/><MetCard ico="chart" lab="Average turnaround" val={VAL(one.metrics.avg_turnaround)} sub="TAT · time units"/><MetCard ico="activity" lab="Average response" val={VAL(one.metrics.avg_response)} sub="RT · time units"/><MetCard ico="gauge" lab="CPU utilization" val={`${VAL(one.metrics.cpu_utilization)}%`} sub="Busy time / elapsed time"/><MetCard ico="timer" lab="Throughput" val={VAL(one.metrics.throughput)} sub="Processes / time unit"/><MetCard ico="time" lab="Makespan" val={VAL(one.metrics.makespan)} sub="Last completion timestamp"/></div><section className="card sec"><div className="sec-head small-head"><div><span className="eyebrow">02 / EXECUTION</span><h2>Gantt chart</h2><p>Bars show when each process occupied the CPU. Idle intervals are shown separately.</p></div><span className="pill"><Ico nm="time" sz={13}/> Time units</span></div><Bar dat={one.gantt}/></section><section className="card sec"><div className="sec-head small-head"><div><span className="eyebrow">03 / PROCESS DETAIL</span><h2>Per-process metrics</h2><p>AT, TAT, WT, and response time are included for every process.</p></div><span className="pill">{one.key}</span></div><div className="more-met"><span><small>Average slowdown</small><b>{VAL(one.metrics.avg_slowdown)}</b></span><span><small>Maximum waiting</small><b>{VAL(one.metrics.max_wait)}</b></span><span><small>95th percentile WT</small><b>{VAL(one.metrics.p95_wait)}</b></span><span><small>99th percentile WT</small><b>{VAL(one.metrics.p99_wait)}</b></span></div><Tbl rows={one.processes.map(p => ({ ...p }))}/></section></>}
        {dat.mode === "compare" && <><div className="leader-grid">{[{ lab: "Lowest avg. waiting", res: best("avg_wait"), val: (a: Res) => a.metrics.avg_wait }, { lab: "Lowest avg. turnaround", res: best("avg_turnaround"), val: (a: Res) => a.metrics.avg_turnaround }, { lab: "Lowest avg. response", res: best("avg_response"), val: (a: Res) => a.metrics.avg_response }, { lab: "Highest throughput", res: best("throughput", true), val: (a: Res) => a.metrics.throughput }].map((a, i) => <div className="lead-card" key={a.lab}><span className="lead-no">0{i + 1}</span><small>{a.lab}</small><b>{a.res?.key ?? "—"}</b><span className="lead-val">{a.res ? VAL(a.val(a.res)) : "—"}{i === 3 ? " / unit" : " time units"}</span></div>)}</div><section className="card sec"><div className="sec-head small-head"><div><span className="eyebrow">02 / BENCHMARK</span><h2>Algorithm scorecard</h2><p>Lower is better for waiting, turnaround, and response. Higher is better for throughput and utilization.</p></div><span className="pill"><Ico nm="chart" sz={13}/> {winCnt} policies</span></div><Tbl mode="sum" rows={sum as Array<Record<string, unknown>>}/><div className="bars"><div className="bar-head"><div><h3>Average waiting time</h3><p>Compare how long processes spend waiting before execution.</p></div><span className="bar-cap">LOWER IS BETTER</span></div>{all.map(a => { const mx = Math.max(...all.map(b => b.metrics.avg_wait), 0.001); return <div className="bar-row" key={a.id}><span>{a.key}</span><div className="bar-track"><i className={`bar-fill f-${a.id.toLowerCase()}`} style={{ width: `${Math.max(1, a.metrics.avg_wait / mx * 100)}%` }}/></div><b>{VAL(a.metrics.avg_wait)}</b></div>; })}</div></section><section className="sec flat"><div className="sec-head small-head"><div><span className="eyebrow">03 / TIMELINES</span><h2>All Gantt charts</h2><p>Every chart below uses the same generated input. Expand any policy to inspect its process table.</p></div><span className="pill">Same workload</span></div><div className="alg-grid">{all.map((a, i) => <AlgCard key={a.id} dat={a} pos={i}/>)}</div></section><section className="card sec"><div className="sec-head small-head"><div><span className="eyebrow">04 / PROCESS DETAIL</span><h2>Per-process metrics</h2><p>Select a policy to inspect AT, BT, CT, TAT, WT, and RT per process.</p></div><span className="pill">{sel?.processes.length ?? 0} processes</span></div><label className="fld pick"><span className="lab">View process metrics for</span><span className="sel-wrap"><select value={sel?.id ?? pick} onChange={e => setPick(e.target.value)}>{all.map(a => <option key={a.id} value={a.id}>{a.full}</option>)}</select><ChevronDown size={17}/></span></label>{sel && <><div className="focus-head"><div><span className="focus-key">{sel.key}</span><b>{sel.full}</b></div><span className="focus-stat">Avg WT <strong>{VAL(sel.metrics.avg_wait)}</strong></span></div><Tbl rows={sel.processes.map(p => ({ ...p }))}/></>}</section></>}
      </div>}
      <footer className="foot"><span className="foot-brand"><span className="foot-logo"><Ico nm="flow" sz={14}/></span> QH-SJF <b>Scheduling Lab</b></span><span>Built on your C11 simulator · FastAPI · React</span><span className="foot-status"><i className={`api-dot ${api}`}/>{api === "online" ? "Engine ready" : "Waiting for API"}</span></footer>
    </main>
  </div>;
}

// Glossary: Alg=policy metadata; Wld=workload process; Pro=process timings; Gnt=Gantt segment; Met=aggregate metrics; Res=policy result; Dat=API output; Req=request body; API=backend URL; FMT=number formatter; VAL=format metric; RAW=format precise time; Ico=icon; Ipt=numeric input; Bar=Gantt chart; Tbl=sortable data table; MetCard=metric card; AlgCard=policy timeline card; App=main app; dat=latest response; n=process count; alg=chosen policy; amx=arrival bound; bmn/bmx=burst bounds; errp=prediction error; adv=advanced settings; drk=dark theme; busy=run status; err=error text; api=API status; tab=selected mode; pick=policy detail selection; all=policy results; one=single result; sel=chosen detail result; sum=summary rows; req=submit run; dwn=download CSV; exp=save text file; winCnt=policy count; best=metric leader; rows=table input; qry=search query; sort=sort key; rev=sort direction; fil=filtered rows; mx=timeline end; dat=segments; pos=card order; a=segment or algorithm; i=loop index; r=table row; c=column; res=fetch response; raw=decoded JSON; bod=request body; blob=download data; url=temporary link.
