# Core Integration Contract

This release contains no HTTP server and no frontend. It exposes a stable command-line boundary and small C module interfaces so a later API layer can call the same core without reimplementing scheduling logic.

## Workload generation

`wgx(n, amx, bmn, bmx, sd, out)` writes a CSV workload with the columns `pid,arrival,burst`. It returns `1` on success and `0` on invalid bounds or file errors.

## Scheduling comparison

`cmp(p, n, c, pre, er, sd)` runs FCFS, SJF, HRRN, Linear Aging, Fixed Quadratic Aging, L-only, H-only, and QH-SJF on copies of the same workload. It returns `1` on success and `0` on failure. It writes a text report, a summary CSV, and a per-process CSV using `pre` as the output prefix.

## Command-line interface

- `qh-sjf gen ...` creates a workload CSV.
- `qh-sjf compare ...` runs the full comparison.
- `qh-sjf bench ...` creates and compares multiple seeded workloads.
- `qh-sjf` starts the interactive simulator.

The future API should validate requests, invoke these module interfaces, and return generated file paths or structured results. The frontend should not duplicate policy selection, simulation, or metric calculations.
