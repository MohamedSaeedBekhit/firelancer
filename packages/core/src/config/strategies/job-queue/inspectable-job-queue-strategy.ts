import { ID } from '../../../common/shared-schema';
import { Job } from '../../../job-queue';
import { JobQueueStrategy } from './job-queue-strategy';

/**
 * @description
 * Defines a job queue strategy that can be inspected using the default admin ui
 */
export interface InspectableJobQueueStrategy extends JobQueueStrategy {
    /**
     * @description
     * Returns a job by its id.
     */
    findOne(id: ID): Promise<Job | undefined>;

    /**
     * @description
     * Returns a list of jobs according to the specified options.
     */
    findMany(): Promise<Job[]>;

    /**
     * @description
     * Returns an array of jobs for the given ids.
     */
    findManyById(ids: ID[]): Promise<Job[]>;

    /**
     * @description
     * Remove all settled jobs in the specified queues older than the given date.
     * If no queueName is passed, all queues will be considered. If no olderThan
     * date is passed, all jobs older than the current time will be removed.
     *
     * Returns a promise of the number of jobs removed.
     */
    removeSettledJobs(queueNames?: string[], olderThan?: Date): Promise<number>;

    cancelJob(jobId: ID): Promise<Job | undefined>;
}

export function isInspectableJobQueueStrategy(strategy: JobQueueStrategy): strategy is InspectableJobQueueStrategy {
    return (
        (strategy as InspectableJobQueueStrategy).findOne !== undefined &&
        (strategy as InspectableJobQueueStrategy).findMany !== undefined &&
        (strategy as InspectableJobQueueStrategy).findManyById !== undefined &&
        (strategy as InspectableJobQueueStrategy).removeSettledJobs !== undefined
    );
}
