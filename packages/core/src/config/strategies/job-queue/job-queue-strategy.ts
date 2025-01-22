import { InjectableStrategy } from '../../../common';
import { Job, JobData, JobQueueStrategyJobOptions } from '../../../job-queue';

/**
 * @description
 * Defines how the jobs in the JobQueueService are persisted and
 * accessed. Custom strategies can be defined to make use of external
 * services such as Redis.
 *
 * :::info
 *
 * This is configured via the `jobQueueOptions.jobQueueStrategy` property of
 * your FirelancerConfig.
 *
 * :::
 */
export interface JobQueueStrategy extends InjectableStrategy {
    /**
     * @description
     * Add a new job to the queue.
     */
    add<Data extends JobData<Data> = object>(
        job: Job<Data>,
        jobOptions?: JobQueueStrategyJobOptions<Data>,
    ): Promise<Job<Data>>;

    /**
     * @description
     * Start the job queue
     */

    start<Data extends JobData<Data> = object>(
        queueName: string,
        process: (job: Job<Data>) => Promise<unknown>,
    ): Promise<void>;

    /**
     * @description
     * Stops a queue from running. Its not guaranteed to stop immediately.
     */

    stop<Data extends JobData<Data> = object>(
        queueName: string,
        process: (job: Job<Data>) => Promise<unknown>,
    ): Promise<void>;
}
