/* eslint-disable @typescript-eslint/no-explicit-any*/
import { ID, JobState, JsonCompatible } from '@firelancer/common';
import { RequestContext } from '../common';
import { Job } from './job';

/**
 * @description
 * Used to configure a new JobQueue instance.
 */
export interface CreateQueueOptions<T extends JobData<T>> {
    /**
     * @description
     * The name of the queue, e.g. "image processing", "re-indexing" etc.
     */
    name: string;
    /**
     * @description
     * Defines the work to be done for each job in the queue. The returned promise
     * should resolve when the job is complete, or be rejected in case of an error.
     */
    process: (job: Job<T>) => Promise<any>;
}

/**
 * @description
 * A JSON-serializable data type which provides a Job
 * with the data it needs to be processed.
 */
export type JobData<T> = JsonCompatible<T>;

/**
 * @description
 * Used to instantiate a new Job
 */
export interface JobConfig<T extends JobData<T>> {
    queueName: string;
    data: T;
    retries?: number;
    attempts?: number;
    id?: ID;
    state?: JobState;
    progress?: number;
    result?: any;
    error?: any;
    createdAt?: Date;
    startedAt?: Date;
    settledAt?: Date;
}

export type JobOptions<Data extends JsonCompatible<Data>> = Pick<JobConfig<Data>, 'retries'> & {
    ctx?: RequestContext;
};

export type JobQueueStrategyJobOptions<Data extends JsonCompatible<Data>> = Omit<JobOptions<Data>, 'retries'>;
