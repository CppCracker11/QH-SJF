from __future__ import annotations

import csv
import os
import secrets
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator

ROOT = Path(__file__).resolve().parents[1]
INC = ROOT / "include"
SRC = ROOT / "src"
BIN = ROOT / ("qh-sjf.exe" if os.name == "nt" else "qh-sjf")
SRC_NM = ["main.c", "process.c", "scheduler.c", "config.c", "workload.c", "gen.c", "compare.c", "predictor.c", "policies.c", "simulator.c", "metrics.c", "output.c"]
ALG = [
    {"id": "FC", "key": "FCFS", "name": "First-Come, First-Served", "full": "First-Come, First-Served (FCFS)"},
    {"id": "SJ", "key": "SJF", "name": "Shortest Job First", "full": "Shortest Job First (SJF)"},
    {"id": "HR", "key": "HRRN", "name": "Highest Response Ratio Next", "full": "Highest Response Ratio Next (HRRN)"},
    {"id": "LA", "key": "Linear Aging", "name": "Linear Aging", "full": "Linear Aging (LA)"},
    {"id": "FQ", "key": "Fixed Quadratic", "name": "Fixed Quadratic Aging", "full": "Fixed Quadratic Aging (FQ)"},
    {"id": "LO", "key": "L-only", "name": "Load-only variant", "full": "Load-only variant (L-only)"},
    {"id": "HO", "key": "H-only", "name": "Heterogeneity-only variant", "full": "Heterogeneity-only variant (H-only)"},
    {"id": "QH", "key": "QH-SJF", "name": "Queue- and Heterogeneity-Aware Shortest Job First", "full": "Queue- and Heterogeneity-Aware Shortest Job First (QH-SJF)"},
]
ALM = {a["id"]: a for a in ALG}

app = FastAPI(title="QH-SJF API", version="1.0.0", description="HTTP interface for the existing C scheduling simulator")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


class Req(BaseModel):
    n: int = Field(default=50, ge=1, le=500)
    alg: str = Field(default="QH")
    seed: int | None = Field(default=None, ge=1, le=999999)
    amx: float = Field(default=40, ge=0, le=100000)
    bmn: float = Field(default=1, gt=0, le=100000)
    bmx: float = Field(default=25, gt=0, le=100000)
    err: float = Field(default=0, ge=0, lt=1)

    @model_validator(mode="after")
    def chk(self) -> "Req":
        if self.bmx < self.bmn:
            raise ValueError("Burst maximum must be greater than or equal to burst minimum.")
        if self.alg not in ALM:
            raise ValueError("Select one of the supported scheduling policies.")
        return self


def bld() -> None:
    pts = [SRC / s for s in SRC_NM] + list(INC.glob("*.h"))
    if BIN.exists() and BIN.stat().st_mtime >= max(p.stat().st_mtime for p in pts):
        return
    gcc = os.environ.get("CC", "gcc")
    cmd = [gcc, "-std=c11", "-Wall", "-Wextra", "-Wpedantic", "-O2", f"-I{INC}", *[str(SRC / s) for s in SRC_NM], "-o", str(BIN), "-lm"]
    try:
        res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=90, check=False)
    except (OSError, subprocess.TimeoutExpired) as ex:
        raise HTTPException(status_code=503, detail=f"Could not build the C engine. Install GCC and confirm it is on PATH. Details: {ex}") from ex
    if res.returncode != 0:
        msg = (res.stderr or res.stdout or "Unknown compiler error")[-5000:]
        raise HTTPException(status_code=500, detail=f"C engine build failed:\n{msg}")


def cmd(args: list[str], sec: int = 90) -> subprocess.CompletedProcess[str]:
    try:
        res = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, timeout=sec, check=False)
    except subprocess.TimeoutExpired as ex:
        raise HTTPException(status_code=504, detail="The simulation exceeded the execution time limit.") from ex
    except OSError as ex:
        raise HTTPException(status_code=500, detail=f"Could not start the C simulator: {ex}") from ex
    if res.returncode != 0:
        msg = (res.stderr or res.stdout or "The C simulator returned an error.")[-4000:]
        raise HTTPException(status_code=422, detail=msg)
    return res


def num(val: Any) -> float:
    try:
        out = float(val)
        if out != out or out in (float("inf"), float("-inf")):
            return 0.0
        return out
    except (TypeError, ValueError):
        return 0.0


def rd(path: Path) -> list[dict[str, str]]:
    try:
        with path.open("r", newline="", encoding="utf-8-sig") as fh:
            return [dict(row) for row in csv.DictReader(fh) if row and any(v for v in row.values() if v is not None)]
    except OSError as ex:
        raise HTTPException(status_code=500, detail=f"Cannot read simulator output {path.name}: {ex}") from ex


def wld(path: Path) -> list[dict[str, Any]]:
    out = []
    for row in rd(path):
        try:
            out.append({"pid": int(float(row["pid"])), "arrival": num(row["arrival"]), "burst": num(row["burst"])})
        except (KeyError, TypeError, ValueError):
            continue
    if not out:
        raise HTTPException(status_code=422, detail="The generated workload was empty or invalid.")
    return out


def met(row: dict[str, str]) -> dict[str, Any]:
    utl = num(row.get("cpu_utilization_fraction")) * 100.0
    return {
        "avg_wait": num(row.get("avg_wait")),
        "avg_turnaround": num(row.get("avg_turnaround")),
        "avg_response": num(row.get("avg_response")),
        "avg_slowdown": num(row.get("avg_slowdown")),
        "max_wait": num(row.get("max_wait")),
        "p95_wait": num(row.get("p95_wait")),
        "p99_wait": num(row.get("p99_wait")),
        "throughput": num(row.get("throughput")),
        "cpu_utilization": utl,
        "makespan": num(row.get("makespan")),
    }


def proc(row: dict[str, str]) -> dict[str, Any]:
    return {
        "pid": int(num(row.get("pid"))),
        "arrival": num(row.get("arrival")),
        "burst": num(row.get("burst")),
        "predicted": num(row.get("predicted")),
        "start": num(row.get("start")),
        "completion": num(row.get("completion")),
        "waiting": num(row.get("waiting")),
        "turnaround": num(row.get("turnaround")),
        "response": num(row.get("response")),
        "score": num(row.get("score")),
    }


def gnt(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    arr = sorted(rows, key=lambda row: (row["start"], row["pid"]))
    out: list[dict[str, Any]] = []
    now = 0.0
    for row in arr:
        st = row["start"]
        en = row["completion"]
        if st > now + 1e-7:
            out.append({"pid": None, "label": "IDLE", "start": now, "end": st, "duration": st - now, "idle": True})
        out.append({"pid": row["pid"], "label": f"P{row['pid']}", "start": st, "end": en, "duration": max(0.0, en - st), "idle": False})
        now = max(now, en)
    return out


def run(req: Req, allp: bool) -> dict[str, Any]:
    sd = req.seed or secrets.randbelow(999999) + 1
    bld()
    try:
        with tempfile.TemporaryDirectory(prefix="qh-web-", dir=ROOT) as td:
            tmp = Path(td)
            wcp = tmp / "workload.csv"
            pre = tmp / "res"
            cmd([str(BIN), "gen", "--n", str(req.n), "--seed", str(sd), "--arr-max", str(req.amx), "--burst-min", str(req.bmn), "--burst-max", str(req.bmx), "--out", str(wcp)])
            wrows = wld(wcp)
            cmd([str(BIN), "compare", "--in", str(wcp), "--out", str(pre), "--seed", str(sd), "--err", str(req.err)])
            sm = rd(tmp / "res_summary.csv")
            pr = rd(tmp / "res_processes.csv")
            out: list[dict[str, Any]] = []
            for alg in ALG:
                srow = next((x for x in sm if x.get("policy") == alg["key"]), None)
                if srow is None:
                    raise HTTPException(status_code=500, detail=f"No summary was produced for {alg['key']}.")
                rows = [proc(x) for x in pr if x.get("policy") == alg["key"] and x.get("pid", "").strip()]
                rows.sort(key=lambda x: x["pid"])
                out.append({**alg, "metrics": met(srow), "processes": rows, "gantt": gnt(rows)})
            if len(wrows) != req.n:
                raise HTTPException(status_code=500, detail=f"Expected {req.n} processes but loaded {len(wrows)}.")
            ans: dict[str, Any] = {"seed": sd, "n": req.n, "amx": req.amx, "bmn": req.bmn, "bmx": req.bmx, "err": req.err, "workload": wrows, "algorithms": ALG}
            if allp:
                ans["mode"] = "compare"
                ans["results"] = out
                ans["leaders"] = {
                    "waiting": min(out, key=lambda x: x["metrics"]["avg_wait"])["id"],
                    "turnaround": min(out, key=lambda x: x["metrics"]["avg_turnaround"])["id"],
                    "response": min(out, key=lambda x: x["metrics"]["avg_response"])["id"],
                    "throughput": max(out, key=lambda x: x["metrics"]["throughput"])["id"],
                }
            else:
                ans["mode"] = "single"
                ans["selected"] = next(x for x in out if x["id"] == req.alg)
            return ans
    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"The comparison pipeline failed: {ex}") from ex


@app.get("/api/health")
def hlth() -> dict[str, Any]:
    bld()
    return {"status": "ok", "engine": "C11", "api": "FastAPI"}


@app.get("/api/algorithms")
def algs() -> dict[str, Any]:
    return {"algorithms": ALG}


@app.post("/api/simulate")
def sim(req: Req) -> dict[str, Any]:
    return run(req, False)


@app.post("/api/compare")
def cmp(req: Req) -> dict[str, Any]:
    return run(req, True)


@app.get("/")
def home() -> dict[str, str]:
    return {"name": "QH-SJF API", "docs": "/docs", "health": "/api/health"}


# Glossary: ROOT=project root; INC=header folder; SRC=source folder; BIN=compiled C engine; ALG=policy definitions; ALM=policy lookup; Req=request model; bld=build engine; cmd=run process; num=parse number; rd=read CSV; wld=read workload; met=map aggregate metrics; proc=map process metrics; gnt=build Gantt segments; run=run experiment; hlth=health endpoint; algs=policy endpoint; sim=single-policy endpoint; cmp=compare endpoint; sd=random seed; td=temp path; wcp=workload CSV; pre=output prefix; sm=summary rows; pr=process rows; out=results; ans=response; req=request; allp=compare flag.
