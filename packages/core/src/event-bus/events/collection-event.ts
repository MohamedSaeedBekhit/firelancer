import { ID } from '@firelancer/common';
import { CreateCollectionInput, UpdateCollectionInput } from '../../api';
import { RequestContext } from '../../common';
import { Collection } from '../../entity/collection/collection.entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type CollectionInputTypes = CreateCollectionInput | UpdateCollectionInput | ID;

/**
 * @description
 * This event is fired whenever a Collection is added, updated or deleted.
 */
export class CollectionEvent extends FirelancerEntityEvent<Collection, CollectionInputTypes> {
    constructor(ctx: RequestContext, entity: Collection, type: 'created' | 'updated' | 'deleted', input?: CollectionInputTypes) {
        super(entity, type, ctx, input);
    }
}
