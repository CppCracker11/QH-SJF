#include <stdlib.h>
#include "predictor.h"
void pd(Pr*p,int n,double er,int sd){int i;srand((unsigned)sd+97);for(i=0;i<n;i++){double z=(double)rand()/RAND_MAX*2-1;p[i].pb=p[i].bu*(1+er*z);if(p[i].pb<.001)p[i].pb=.001;}}
/* Glossary: pd=apply burst predictions; p=processes; n=count; er=error fraction; sd=seed; z=random error. */
