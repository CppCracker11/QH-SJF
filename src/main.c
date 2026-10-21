#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "process.h"
#include "scheduler.h"
#include "config.h"
#include "workload.h"
#include "predictor.h"
#include "simulator.h"
#include "metrics.h"
#include "output.h"
#include "compare.h"
#include "gen.h"
static int num(const char*s,int*v){char*e;long x=strtol(s,&e,10);if(!s[0]||*e||x<1||x>1000000)return 0;*v=(int)x;return 1;}
static int dbl(const char*s,double*v){char*e;double x=strtod(s,&e);if(!s[0]||*e||x<0||x>1e9)return 0;*v=x;return 1;}
static void help(void){puts("QH-SJF CPU Scheduling Simulator\nCommands:\n  ./qh-sjf\n  ./qh-sjf gen --n N --seed S --out FILE [--arr-max A] [--burst-min B] [--burst-max C]\n  ./qh-sjf compare --in FILE --out PREFIX [--err E] [--seed S]\n  ./qh-sjf bench --n N --runs R --seed S --out DIR\nCSV input columns: pid,arrival,burst\nCompare outputs: PREFIX_report.txt, PREFIX_summary.csv, PREFIX_processes.csv");}
static int arg(int ac,char**av,const char*key,const char**val){int i;for(i=2;i+1<ac;i++)if(strcmp(av[i],key)==0){*val=av[i+1];return 1;}return 0;}
static int rgn(int ac,char**av){const char*s;int n=100,sd=1;double am=50,bn=1,bx=20;if(arg(ac,av,"--n",&s)&&!num(s,&n))return 0;if(arg(ac,av,"--seed",&s)&&!num(s,&sd))return 0;if(arg(ac,av,"--arr-max",&s)&&!dbl(s,&am))return 0;if(arg(ac,av,"--burst-min",&s)&&!dbl(s,&bn))return 0;if(arg(ac,av,"--burst-max",&s)&&!dbl(s,&bx))return 0;if(!arg(ac,av,"--out",&s)||bn<=0||bx<bn)return 0;if(!wgx(n,am,bn,bx,sd,s)){fprintf(stderr,"Could not generate workload. Check bounds and output path.\n");return 0;}printf("Generated %d processes in %s (seed %d).\n",n,s,sd);return 1;}
static int rcp(int ac,char**av){const char*in=NULL,*out=NULL,*s;int n=0,sd=1;double er=0;Pr*p;Cf c=df();if(!arg(ac,av,"--in",&in)||!arg(ac,av,"--out",&out))return 0;if(arg(ac,av,"--err",&s)&&!dbl(s,&er))return 0;if(arg(ac,av,"--seed",&s)&&!num(s,&sd))return 0;p=wc(in,&n);if(!p||n<1){wf(p);fprintf(stderr,"Could not load a valid workload from %s.\n",in);return 0;}if(!cmp(p,n,&c,out,er,sd)){wf(p);fprintf(stderr,"Comparison failed. Check output directory and options.\n");return 0;}wf(p);return 1;}
static int rbn(int ac,char**av){const char*s,*out;int n=100,r=10,sd=1,i;char wp[512],pre[512];Cf c=df();Pr*p;if(arg(ac,av,"--n",&s)&&!num(s,&n))return 0;if(arg(ac,av,"--runs",&s)&&!num(s,&r))return 0;if(arg(ac,av,"--seed",&s)&&!num(s,&sd))return 0;if(!arg(ac,av,"--out",&out)||strlen(out)>350)return 0;for(i=0;i<r;i++){snprintf(wp,sizeof wp,"%s/workload_%03d.csv",out,i+1);snprintf(pre,sizeof pre,"%s/run_%03d",out,i+1);if(!wgx(n,50,1,20,sd+i,wp)){fprintf(stderr,"Could not create %s. Create the output directory first.\n",wp);return 0;}p=wc(wp,&n);if(!p||n<1||!cmp(p,n,&c,pre,0,sd+i)){wf(p);fprintf(stderr,"Benchmark failed at run %d.\n",i+1);return 0;}wf(p);}printf("Completed %d runs under %s.\n",r,out);return 1;}
int main(int ac,char**av){int n=0,ch=0,ty=0;Pr*p=NULL;Cf c=df();Pc pc;Tr t={0};Mt m;if(ac>1){if(!strcmp(av[1],"help")||!strcmp(av[1],"--help")){help();return 0;}if(!strcmp(av[1],"gen"))return rgn(ac,av)?0:2;if(!strcmp(av[1],"compare"))return rcp(ac,av)?0:2;if(!strcmp(av[1],"bench"))return rbn(ac,av)?0:2;help();return 2;}puts("QH-SJF CPU Scheduling Simulator\n1 Manual  2 Generated  3 CSV file");printf("Choice: ");if(scanf("%d",&ch)!=1)return 1;if(ch==1)p=wi(&n);else if(ch==2){printf("Workload 1-7: ");if(scanf("%d",&ty)!=1||ty<1||ty>7)return 1;n=20;p=wg(n,ty,1);}else if(ch==3){char pa[256];printf("CSV path: ");if(scanf("%255s",pa)!=1)return 1;p=wc(pa,&n);}else return 1;if(!p||n<=0){puts("No valid workload.");wf(p);return 1;}printf("Policy 1 FCFS 2 SJF 3 HRRN 4 Linear 5 FixedQuad 6 L-only 7 H-only 8 QH-SJF\nChoice: ");if(scanf("%d",&ch)!=1||ch<1||ch>8){wf(p);return 1;}pc=(Pc)ch;pd(p,n,0,1);if(!sr(p,n,pc,&c,&t)){puts("Simulation failed.");wf(p);sf(&t);return 1;}m=mc(p,n,p[0].ar,t.tm);os(p,n,t.od,t.no,pc);mp(&m);wf(p);sf(&t);return 0;}
/* Glossary: num=parse positive integer; dbl=parse nonnegative decimal; help=print CLI usage; arg=find option; rgn=generate workload; rcp=compare algorithms; rbn=repeat experiments; ac=argument count; av=arguments; n=process count; sd=seed; am=arrival maximum; bn/bx=burst bounds; in=input CSV; out=output path; er=prediction error; p=process array; c=config; t=trace; m=metrics; pc=policy; ch=choice; ty=workload type; pa=path; i=run index; r=run count; wp=workload path; pre=output prefix. */
