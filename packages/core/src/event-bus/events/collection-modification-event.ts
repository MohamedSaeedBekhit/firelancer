import { ID, RequestContext, Type } from '../../common';
import { Collection } from '../../entity/collection/collection.entity';
import { FirelancerEvent } from '../firelancer-event';

/**
 * @description
 * This event is fired whenever a Collection is modified in some way.
 *
 * The `jobPostIds` argument is an array of ids of all JobPosts which:
 *
 * 1. were part of this collection prior to modification and are no longer
 * 2. are now part of this collection after modification but were not before
 */
export class CollectionModificationEvent extends FirelancerEvent {
    constructor(
        public ctx: RequestContext,
        public collection: Collection,
        public entityType: Type<any>,
        public entityIds: ID[],
    ) {
        super();
    }
}
