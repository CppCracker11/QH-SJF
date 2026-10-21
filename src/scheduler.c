#include "scheduler.h"
const char*nm(Pc pc){switch(pc){case FC:return"FCFS";case SJ:return"SJF";case HR:return"HRRN";case LA:return"Linear Aging";case FQ:return"Fixed Quadratic";case LO:return"L-only";case HO:return"H-only";case QH:return"QH-SJF";default:return"Unknown";}}
/* Glossary: Pc=policy code; nm=policy name; pc=policy. */
