#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <direct.h>

static int go(const char *cmd)
{
    int ret = system(cmd);
    return ret == 0;
}

int main(void)
{
    char cmd[512];
    int sd;
    FILE *f;

    f = fopen("qh-sjf.exe", "rb");
    if (!f) {
        printf("Error: qh-sjf.exe was not found.\n");
        printf("Place run.exe in the project root.\n");
        return 1;
    }
    fclose(f);

    _mkdir("workloads");
    _mkdir("workloads/generated");
    _mkdir("results");

    sd = (int)(((unsigned long)time(NULL) ^ (unsigned long)clock()) % 999999UL) + 1;

    printf("\nQH-SJF Quick Comparison\n");
    printf("=======================\n");
    printf("Processes: 50\n");
    printf("Random seed: %d\n\n", sd);
    printf("[1/2] Generating workload...\n");

    snprintf(cmd, sizeof(cmd), ".\\qh-sjf.exe gen --n 50 --seed %d --arr-max 40 --burst-min 1 --burst-max 25 --out workloads/generated/test.csv", sd);
    if (!go(cmd)) {
        printf("Workload generation failed.\n");
        return 1;
    }

    printf("\n[2/2] Comparing all scheduling policies...\n");
    snprintf(cmd, sizeof(cmd), ".\\qh-sjf.exe compare --in workloads/generated/test.csv --out results/test --seed %d --err 0", sd);
    if (!go(cmd)) {
        printf("Comparison failed.\n");
        return 1;
    }

    printf("\nAll done! Reports have been overwritten.\n");
    printf("Report:    results/test_report.txt\n");
    printf("Summary:   results/test_summary.csv\n");
    printf("Processes: results/test_processes.csv\n");
    return 0;
}

/* Glossary: go=run a command; cmd=command text; ret=command status; sd=random seed; f=file handle. */
