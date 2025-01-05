import { Type } from '@firelancer/common';
import { FirelancerEvent, JobPostEvent } from '../../event-bus';
import { FirelancerEntity } from '../base/base.entity';
import { JobPost } from '../job-post/job-post.entity';

export type CollectableEntity<Entity extends FirelancerEntity, Event extends FirelancerEvent> = {
    EntityType: Type<Entity>;
    EntityEvent: Type<Event>;
};

export const collectableEntities: CollectableEntity<FirelancerEntity, FirelancerEvent>[] = [
    {
        EntityType: JobPost,
        EntityEvent: JobPostEvent,
    },
];
