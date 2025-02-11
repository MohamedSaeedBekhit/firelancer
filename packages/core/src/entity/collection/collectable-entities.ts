import { Type } from '@firelancer/common/lib/shared-types';
import { JobPostEvent } from '../../event-bus';
import { JobPost } from '../job-post/job-post.entity';

export type CollectableEntity = { entityType: Type<JobPost>; entityEvent: Type<JobPostEvent> };

export const collectableEntities: CollectableEntity[] = [
    {
        entityType: JobPost,
        entityEvent: JobPostEvent,
    },
];
