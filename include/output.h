#ifndef OH
#define OH
#include "process.h"
#include "metrics.h"
#include "scheduler.h"
void os(Pr*p,int n,const int*od,int no,Pc pc);
void ow(const char*pa,Pr*p,int n,const Mt*m,Pc pc);
#endif
/* Glossary: os=output schedule; ow=output CSV; pa=path; od=execution order; no=order count. */
