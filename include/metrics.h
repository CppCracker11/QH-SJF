#ifndef MH
#define MH
#include "process.h"
typedef struct{double aw,at,ar,sd,mx,p5,p9,th,ut;}Mt;
Mt mc(Pr*p,int n,double fs,double fa);
void mp(const Mt*m);
#endif
/* Glossary: Mt=metrics; aw=average wait; at=average turnaround; ar=average response; sd=average slowdown; mx=max wait; p5=95th percentile; p9=99th percentile; th=throughput; ut=utilization; mc=calculate metrics; mp=print metrics. */
