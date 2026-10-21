#ifndef COH
#define COH
#include "process.h"
#include "config.h"
int cmp(const Pr *p, int n, const Cf *c, const char *pre, double er, int sd);
#endif
/* Glossary: cmp=run comparisons; p=input workload; n=process count; c=config; pre=output prefix; er=prediction error; sd=random seed. */
