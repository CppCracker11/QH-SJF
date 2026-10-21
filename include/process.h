#ifndef PH
#define PH
typedef struct{int id;double ar,bu,pb,st,ct,wt,tt,rt,sc;}Pr;
void pi(Pr*p,int id,double ar,double bu);
#endif
/* Glossary: Pr=process; id=identifier; ar=arrival; bu=actual burst; pb=predicted burst; st=start; ct=completion; wt=waiting; tt=turnaround; rt=response; sc=score; pi=initialize process. */
