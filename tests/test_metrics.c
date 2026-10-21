#include <assert.h>
#include "../include/process.h"
#include "../include/metrics.h"
int main(void){Pr p[2];Mt m;pi(&p[0],1,0,2);pi(&p[1],2,0,3);p[0].st=0;p[0].ct=2;p[0].wt=0;p[0].tt=2;p[0].rt=0;p[1].st=2;p[1].ct=5;p[1].wt=2;p[1].tt=5;p[1].rt=2;m=mc(p,2,0,5);assert(m.aw==1&&m.at==3.5);return 0;}
/* Glossary: test=automated verification; p=processes; n=count; c=config; t=trace; m=metrics; x=selected index. */
