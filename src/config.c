#include <stdio.h>
#include "config.h"
Cf df(void){Cf c={4.0,5.0,0.10,1.00,0.50,0.50,1};return c;}
void cp(const Cf*c){printf("B0=%.3f K=%.3f Amin=%.3f Amax=%.3f LA=%.3f FQ=%.3f\n",c->b0,c->k,c->am,c->ax,c->la,c->fq);}
/* Glossary: Cf=config; df=default config; cp=print config; c=config pointer. */
