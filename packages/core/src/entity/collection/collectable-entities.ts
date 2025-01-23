import { Type } from '@firelancer/common';
import { FirelancerEvent, JobPostEvent } from '../../event-bus';
import { FirelancerEntity } from '../base/base.entity';
import { JobPost } from '../job-post/job-post.entity';

export type CollectableEntity = {
    EntityType: Type<FirelancerEntity>;
    EntityEvent: Type<FirelancerEvent>;
};

export const collectableEntities: CollectableEntity[] = [
    {
        EntityType: JobPost,
        EntityEvent: JobPostEvent,
    },
];
