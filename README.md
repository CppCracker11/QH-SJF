# QH-SJF CPU Scheduling Simulator

C11 CPU scheduling simulator and experiment runner with a separate React frontend and Python API. The scheduling core itself uses only the C standard library and the standard math library.

## Policies

FCFS, SJF, HRRN, Linear Aging, Fixed Quadratic Aging, L-only, H-only, and QH-SJF.

QH-SJF computes workload pressure and heterogeneity from ready processes, adjusts aging strength, and selects the lowest score. Predicted bursts guide scheduling decisions; actual bursts determine execution duration.

## Build and test

```sh
make
make tests
./qh-sjf --help
```

Requires a C11 compiler and the standard math library.

## Generate a random workload

```sh
./qh-sjf gen --n 50 --seed 42 --arr-max 40 --burst-min 1 --burst-max 25 --out workloads/generated/test.csv
```

Bounds: `N` is 1 to 1,000,000; arrival times are from zero through `arr-max`; burst times are from `burst-min` through `burst-max`. Use the same seed to reproduce a workload. The output directory must already exist.

## Compare all policies

```sh
./qh-sjf compare --in workloads/generated/test.csv --out results/test --seed 42 --err 0
```

The CSV input columns are `pid,arrival,burst`; a header is accepted. `--out` is a prefix, not a directory. This command runs all eight policies on identical process data and writes:

- `results/test_report.txt`: metrics and a Gantt timeline for each policy.
- `results/test_summary.csv`: one aggregate-metrics row per policy.
- `results/test_processes.csv`: per-process timings for every policy.

`--err` sets symmetric prediction error as a fraction (for example, `0.2` means up to 20% error). Use `--seed` to reproduce predictions. Zero error is the default.

## Repeated experiments

Create the output directory first, then run:

```sh
mkdir -p results/bench
./qh-sjf bench --n 50 --runs 10 --seed 42 --out results/bench
```

Each run creates its own workload and three comparison outputs. Seeds vary by run so results are reproducible. The workload CSV and result files are retained for later analysis.

## Interactive mode

Run `./qh-sjf` without arguments to enter a manual workload, select a built-in workload, or load a CSV, then run one policy.

## Design

The benchmark layer reuses the simulator, policies, prediction layer, and metrics code. The Python API calls the same C command-line engine and turns its CSV output into structured JSON; the frontend does not implement scheduling logic.

## Glossary

- `Pr`: process record; `Pc`: policy code; `Cf`: scheduler configuration; `Tr`: simulation trace; `Mt`: aggregate metrics.
- `ar`, `bu`, `pb`, `st`, `ct`, `wt`, `tt`, `rt`, `sc`: arrival, actual burst, predicted burst, start, completion, waiting, turnaround, response, score.
- `FC`, `SJ`, `HR`, `LA`, `FQ`, `LO`, `HO`, `QH`: FCFS, SJF, HRRN, linear aging, fixed quadratic aging, L-only, H-only, QH-SJF.

## Web frontend and Python API

The web application is added alongside the original C project. The existing C source files remain in `src/` and `include/`; they are not moved into `api/`.

### Requirements on Windows

- GCC available on `PATH` (the API compiles the C engine automatically).
- Python 3.10 or newer (`py` or `python` available on `PATH`).
- Node.js 20.19+ or 22.12+ and npm.

### Quick start

Double-click `start-web.bat` from the project root to open separate terminal windows for the API and frontend. Or start each independently using the commands below.

### Start the API

Open PowerShell in `api/` and run:

```powershell
.\start.bat
```

The API runs at `http://127.0.0.1:8000`. Interactive API docs are at `http://127.0.0.1:8000/docs`. The first health check compiles the C engine if it is missing or older than its source files.

### Start the frontend

Open a second terminal in `frontend/` and run:

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. Keep both terminals running while using the website.

### Website features

- **Single algorithm:** choose a policy and process count; inspect the generated process table, Gantt chart, per-process AT/BT/CT/TAT/WT/RT, and aggregate metrics.
- **Compare all:** generate one workload and run all eight implemented policies against the same input, with an aggregate scorecard, all Gantt charts, and selectable per-process results.
- Download the generated workload, aggregate summary, and process-level CSVs from the results page.
- Advanced controls include arrival/burst bounds and prediction error. The random seed is displayed for reproducibility.

The API calls the existing C command-line engine, reads its CSV exports, and returns structured JSON. Scheduling decisions and metric calculations remain in C. Web requests are limited to 500 processes to keep interactive use responsive; the CLI retains its existing capabilities.
