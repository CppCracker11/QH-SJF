#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "gen.h"
static double rnd(void){return (double)rand()/(double)RAND_MAX;}
int wgx(int n,double amx,double bmn,double bmx,int sd,const char*out){FILE*f;int i;if(n<1||amx<0||bmn<=0||bmx<bmn||!out)return 0;srand((unsigned)sd);f=fopen(out,"w");if(!f)return 0;fprintf(f,"pid,arrival,burst\n");for(i=0;i<n;i++){double ar=rnd()*amx,bu=bmn+rnd()*(bmx-bmn);fprintf(f,"%d,%.6f,%.6f\n",i+1,ar,bu);}if(fclose(f)!=0)return 0;return 1;}
/* Glossary: rnd=random fraction; wgx=write generated workload CSV; n=process count; amx=arrival upper bound; bmn/bmx=burst bounds; sd=seed; out=path; f=file; i=loop index; ar=arrival; bu=burst. */
