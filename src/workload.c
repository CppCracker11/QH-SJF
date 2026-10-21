#include <stdio.h>
#include <stdlib.h>
#include "workload.h"
static int ca(const void*a,const void*b){const Pr*x=a,*y=b;return x->ar>y->ar?1:(x->ar<y->ar?-1:x->id-y->id);}
Pr*wi(int*n){int i;Pr*p;printf("Number of processes: ");if(scanf("%d",n)!=1||*n<=0)return NULL;p=malloc((size_t)*n*sizeof*p);if(!p)return NULL;for(i=0;i<*n;i++){double ar,bu;printf("P%d arrival burst: ",i+1);if(scanf("%lf%lf",&ar,&bu)!=2||ar<0||bu<=0){free(p);return NULL;}pi(&p[i],i+1,ar,bu);}qsort(p,*n,sizeof*p,ca);return p;}
Pr*wg(int n,int ty,int sd){int i;Pr*p=malloc((size_t)n*sizeof*p);if(!p)return NULL;srand((unsigned)sd);for(i=0;i<n;i++){double r=(double)rand()/RAND_MAX,ar,bu;if(ty==1)bu=8;else if(ty==2)bu=r<.45?1+rand()%4:r<.85?6+rand()%8:18+rand()%18;else if(ty==3)bu=i==0?40:1+rand()%4;else if(ty==4)bu=1+rand()%25;else if(ty==5)bu=1+rand()%15;else if(ty==6)bu=1+rand()%8;else bu=1+rand()%40;if(ty==6)ar=i*8+r*2;else if(ty==5)ar=(i/4)*20+r*2;else if(ty==4)ar=r*8;else ar=i*2+r;pi(&p[i],i+1,ar,bu);}qsort(p,n,sizeof*p,ca);return p;}
Pr*wc(const char*pa,int*n){FILE*f=fopen(pa,"r");Pr*p;char l[256];int c=0,z=32;if(!f)return NULL;p=malloc(z*sizeof*p);if(!p){fclose(f);return NULL;}while(fgets(l,sizeof l,f)){int id;double ar,bu;if(sscanf(l,"%d,%lf,%lf",&id,&ar,&bu)!=3)continue;if(ar<0||bu<=0)continue;if(c==z){Pr*q;z*=2;q=realloc(p,z*sizeof*p);if(!q){free(p);fclose(f);return NULL;}p=q;}pi(&p[c++],id,ar,bu);}fclose(f);*n=c;qsort(p,c,sizeof*p,ca);return p;}
void wf(Pr*p){free(p);}
/* Glossary: wi=manual input; wc=CSV load; wg=workload generator; wf=free workload; p=processes; n=count; ty=workload type; sd=seed; pa=path; ar=arrival; bu=burst. */
