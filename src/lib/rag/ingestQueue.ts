/** Serializes RAG ingest jobs to prevent worker race conditions on low-end hardware. */
export class IngestQueue {
  private chain: Promise<void> = Promise.resolve();

  enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = this.chain.then(job);
    this.chain = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }
}
