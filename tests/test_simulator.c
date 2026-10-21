#include <assert.h>
#include "../include/process.h"
#include "../include/simulator.h"
#include "../include/config.h"
#include "../include/scheduler.h"
int main(void){Pr p[3];Tr t={0};Cf c=df();pi(&p[0],1,0,3);pi(&p[1],2,0,1);pi(&p[2],3,2,2);assert(sr(p,3,SJ,&c,&t));assert(p[1].st==0);assert(p[0].ct==4);assert(p[2].st==4);sf(&t);return 0;}
/* Glossary: test=automated verification; p=processes; n=count; c=config; t=trace; m=metrics; x=selected index. */
