#include <assert.h>
#include "../include/process.h"
#include "../include/policies.h"
#include "../include/config.h"
int main(void){Pr p[3];Cf c=df();pi(&p[0],1,0,2);pi(&p[1],2,0,8);pi(&p[2],3,0,4);int x=ch(p,3,10,QH,&c);assert(x>=0&&x<3);return 0;}
/* Glossary: test=automated verification; p=processes; n=count; c=config; t=trace; m=metrics; x=selected index. */
