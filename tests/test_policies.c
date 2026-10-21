#include <assert.h>
#include "../include/process.h"
#include "../include/policies.h"
#include "../include/config.h"
int main(void){Pr p[3];Cf c=df();pi(&p[0],1,0,8);pi(&p[1],2,0,2);pi(&p[2],3,0,4);assert(ch(p,3,0,SJ,&c)==1);assert(ch(p,3,0,FC,&c)==0);assert(ch(p,3,0,HR,&c)==0);return 0;}
/* Glossary: test=automated verification; p=processes; n=count; c=config; t=trace; m=metrics; x=selected index. */
