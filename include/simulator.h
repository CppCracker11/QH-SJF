#ifndef SIH
#define SIH
#include "process.h"
#include "scheduler.h"
#include "config.h"
typedef struct{double tm;int*od;int no,il,iv;}Tr;
int sr(Pr*p,int n,Pc pc,const Cf*c,Tr*t);
void sf(Tr*t);
#endif
/* Glossary: Tr=trace; tm=simulation time; od=execution order; no=order count; il=idle intervals; iv=invalid flag; sr=run simulator; sf=free trace. */
