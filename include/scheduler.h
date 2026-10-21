#ifndef SH
#define SH
typedef enum{FC=1,SJ,HR,LA,FQ,LO,HO,QH}Pc;
const char*nm(Pc pc);
#endif
/* Glossary: Pc=policy code; FC=FCFS; SJ=SJF; HR=HRRN; LA=linear aging; FQ=fixed quadratic; LO=L-only; HO=H-only; QH=QH-SJF; nm=policy name. */
