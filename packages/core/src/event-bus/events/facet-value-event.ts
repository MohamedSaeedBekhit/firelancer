import { RequestContext } from '../../common';
import { CreateFacetValueInput, ID, UpdateFacetValueInput } from '../../common/shared-schema';
import { FacetValue } from '../../entity/facet-value/facet-value.entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type FacetValueInputTypes = CreateFacetValueInput | UpdateFacetValueInput | ID;

/**
 * @description
 * This event is fired whenever a FacetValue is added, updated or deleted.
 */
export class FacetValueEvent extends FirelancerEntityEvent<FacetValue, FacetValueInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: FacetValue,
        type: 'created' | 'updated' | 'deleted',
        input?: FacetValueInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
