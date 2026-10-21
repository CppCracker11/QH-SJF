#include <float.h>
#include <math.h>
#include "policies.h"
static int rd(const Pr*p,double t){return p->st<0&&p->ar<=t;}
static int fc(Pr*p,int n,double t){int b=-1,i;for(i=0;i<n;i++)if(rd(&p[i],t)&&(b<0||p[i].ar<p[b].ar||(p[i].ar==p[b].ar&&p[i].id<p[b].id)))b=i;return b;}
static int sj(Pr*p,int n,double t){int b=-1,i;for(i=0;i<n;i++)if(rd(&p[i],t)&&(b<0||p[i].pb<p[b].pb||(p[i].pb==p[b].pb&&p[i].ar<p[b].ar)||(p[i].pb==p[b].pb&&p[i].ar==p[b].ar&&p[i].id<p[b].id)))b=i;return b;}
static int hr(Pr*p,int n,double t){int b=-1,i;double bs=-DBL_MAX;for(i=0;i<n;i++)if(rd(&p[i],t)){double w=t-p[i].ar,s=(w+p[i].pb)/p[i].pb;if(b<0||s>bs||(s==bs&&p[i].id<p[b].id)){b=i;bs=s;}}return b;}
static int ag(Pr*p,int n,double t,double a,double b0){int b=-1,i;double bs=DBL_MAX;for(i=0;i<n;i++)if(rd(&p[i],t)){double w=t-p[i].ar,s=p[i].pb/(1+a*pow(w/b0,2));p[i].sc=s;if(b<0||s<bs||(s==bs&&p[i].id<p[b].id)){b=i;bs=s;}}return b;}
static double av(Pr*p,int n){double s=0;int i,c=0;for(i=0;i<n;i++)if(p[i].st<0){s+=p[i].pb;c++;}return c?s/c:0;}
static double sv(Pr*p,int n,double m){double s=0;int i,c=0;for(i=0;i<n;i++)if(p[i].st<0){double d=p[i].pb-m;s+=d*d;c++;}return c?sqrt(s/c):0;}
static int qh(Pr*p,int n,double t,const Cf*c,int md){double q=0,m,s,l,h,a;int i;for(i=0;i<n;i++)if(rd(&p[i],t))q+=p[i].pb;m=av(p,n);s=sv(p,n,m);l=q/(q+c->k*c->b0);h=m+s>0?s/(m+s):0;if(md==LO)h=1;if(md==HO)l=1;a=c->am+(c->ax-c->am)*l*h;return ag(p,n,t,a,c->b0);}
int ch(Pr*p,int n,double t,Pc pc,const Cf*c){switch(pc){case FC:return fc(p,n,t);case SJ:return sj(p,n,t);case HR:return hr(p,n,t);case LA:return ag(p,n,t,c->la,c->b0);case FQ:return ag(p,n,t,c->fq,c->b0);case LO:return qh(p,n,t,c,LO);case HO:return qh(p,n,t,c,HO);case QH:return qh(p,n,t,c,QH);default:return-1;}}
/* Glossary: rd=ready process; fc=FCFS choice; sj=SJF choice; hr=HRRN choice; ag=aging choice; av=average predicted burst; sv=predicted burst deviation; qh=QH choice; ch=choose process; p=processes; n=count; t=time; c=config; a=aging factor; b0=reference burst; md=mode. */
