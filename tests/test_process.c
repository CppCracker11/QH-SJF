#include <assert.h>
#include "../include/process.h"
int main(void){Pr p;pi(&p,1,2,5);assert(p.id==1&&p.ar==2&&p.bu==5&&p.pb==5&&p.st<0);return 0;}
/* Glossary: test=automated verification; p=processes; n=count; c=config; t=trace; m=metrics; x=selected index. */
