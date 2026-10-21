#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "metrics.h"
static int ca(const void*a,const void*b){double x=*(const double*)a,y=*(const double*)b;return x>y?1:(x<y?-1:0);}
static double pc(double*a,int n,double q){int k=(int)ceil(q*n);if(k<1)k=1;if(k>n)k=n;qsort(a,n,sizeof*a,ca);return a[k-1];}
Mt mc(Pr*p,int n,double fs,double fa){Mt m={0};double*w=malloc((size_t)n*sizeof*w),sw=0,st=0,sr=0,ss=0,sb=0;int i;if(!w)return m;for(i=0;i<n;i++){w[i]=p[i].wt;sw+=p[i].wt;st+=p[i].tt;sr+=p[i].rt;ss+=p[i].tt/p[i].bu;sb+=p[i].bu;if(p[i].wt>m.mx)m.mx=p[i].wt;}m.aw=sw/n;m.at=st/n;m.ar=sr/n;m.sd=ss/n;m.p5=pc(w,n,.95);m.p9=pc(w,n,.99);if(fa>fs){m.th=n/(fa-fs);m.ut=sb/(fa-fs);}free(w);return m;}
void mp(const Mt*m){printf("\nMetrics\nAvg Wait: %.3f\nAvg Turnaround: %.3f\nAvg Response: %.3f\nAvg Slowdown: %.3f\nMax Wait: %.3f\nP95 Wait: %.3f\nP99 Wait: %.3f\nThroughput: %.6f\nCPU Util: %.3f\n",m->aw,m->at,m->ar,m->sd,m->mx,m->p5,m->p9,m->th,m->ut);}
/* Glossary: Mt=metrics; aw=average wait; at=average turnaround; ar=average response; sd=average slowdown; mx=max wait; p5=95th percentile wait; p9=99th percentile wait; th=throughput; ut=CPU utilization; mc=calculate metrics; mp=print metrics. */
