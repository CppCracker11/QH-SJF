#ifndef CH
#define CH
typedef struct{double b0,k,am,ax,la,fq;int se;}Cf;
Cf df(void);
void cp(const Cf*c);
#endif
/* Glossary: Cf=config; b0=reference burst; k=saturation; am=min aging; ax=max aging; la=linear aging; fq=fixed quadratic aging; se=seed; df=default config; cp=print config. */
