#include "process.h"
void pi(Pr*p,int id,double ar,double bu){p->id=id;p->ar=ar;p->bu=bu;p->pb=bu;p->st=-1;p->ct=-1;p->wt=p->tt=p->rt=p->sc=0;}
/* Glossary: Pr=process; pi=initialize process; id=identifier; ar=arrival; bu=actual burst; pb=predicted burst; st=start; ct=completion; wt=waiting; tt=turnaround; rt=response; sc=score. */
