#include <stdlib.h>
#include "simulator.h"
#include "policies.h"
static int nx(Pr*p,int n,double t){int b=-1,i;for(i=0;i<n;i++)if(p[i].st<0&&p[i].ar>t&&(b<0||p[i].ar<p[b].ar))b=i;return b;}
int sr(Pr*p,int n,Pc pc,const Cf*c,Tr*t){int d=0,i;double tm=0;t->od=malloc((size_t)n*sizeof*t->od);if(!t->od)return 0;t->no=t->il=t->iv=0;for(i=0;i<n;i++)if(p[i].ar<0||p[i].bu<=0){t->iv=1;return 0;}while(d<n){int x=ch(p,n,tm,pc,c);if(x<0){int y=nx(p,n,tm);if(y<0)break;tm=p[y].ar;t->il++;x=ch(p,n,tm,pc,c);if(x<0)continue;}p[x].st=tm;p[x].wt=tm-p[x].ar;p[x].rt=p[x].wt;tm+=p[x].bu;p[x].ct=tm;p[x].tt=tm-p[x].ar;t->od[t->no++]=p[x].id;d++;}t->tm=tm;return d==n;}
void sf(Tr*t){free(t->od);t->od=NULL;}
/* Glossary: Tr=trace; sr=run simulation; sf=free trace; nx=next arrival; p=processes; n=count; t=time; pc=policy; c=config; d=completed count; i=index; x=selected process; y=next process. */
