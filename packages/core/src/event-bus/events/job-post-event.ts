import { RequestContext } from '../../common';
import { CreateJobPostInput, ID } from '../../common/shared-schema';
import { JobPost } from '../../entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type JobPostInputTypes = CreateJobPostInput | ID;

/**
 * @description
 * This event is fired whenever a JobPost is added, updated or deleted.
 */
export class JobPostEvent extends FirelancerEntityEvent<JobPost, JobPostInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: JobPost,
        type: 'created' | 'updated' | 'deleted',
        input?: JobPostInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
