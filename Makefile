CC=gcc
CF=-std=c11 -Wall -Wextra -Wpedantic -O2 -Iinclude
LM=-lm
SR=src/main.c src/process.c src/scheduler.c src/config.c src/workload.c src/gen.c src/compare.c src/predictor.c src/policies.c src/simulator.c src/metrics.c src/output.c
OB=$(SR:.c=.o)
all: qh-sjf
qh-sjf: $(OB)
	$(CC) $(CF) -o $@ $(OB) $(LM)
%.o: %.c
	$(CC) $(CF) -c $< -o $@
tests: tp tpo tsi tm tq
	./tp
	./tpo
	./tsi
	./tm
	./tq
tp: tests/test_process.c src/process.c
	$(CC) $(CF) -o $@ $^ $(LM)
tpo: tests/test_policies.c src/process.c src/config.c src/policies.c src/scheduler.c
	$(CC) $(CF) -o $@ $^ $(LM)
tsi: tests/test_simulator.c src/process.c src/config.c src/policies.c src/simulator.c src/scheduler.c
	$(CC) $(CF) -o $@ $^ $(LM)
tm: tests/test_metrics.c src/process.c src/metrics.c
	$(CC) $(CF) -o $@ $^ $(LM)
tq: tests/test_qhsjf.c src/process.c src/config.c src/policies.c src/scheduler.c
	$(CC) $(CF) -o $@ $^ $(LM)
clean:
	rm -f $(OB) qh-sjf tp tpo tsi tm tq
.PHONY: all tests clean
# Glossary: CC=compiler; CF=compiler flags; LM=math library; SR=source files; OB=object files. */
