import { RequestContext } from '../../common';
import { CreateAssetInput, ID, UpdateAssetInput } from '../../common/shared-schema';
import { Asset } from '../../entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type AssetInputTypes = CreateAssetInput | UpdateAssetInput | ID;

/**
 * @description
 * This event is fired whenever a Asset is added, updated or deleted.
 */
export class AssetEvent extends FirelancerEntityEvent<Asset, AssetInputTypes> {
    constructor(ctx: RequestContext, entity: Asset, type: 'created' | 'updated' | 'deleted', input?: AssetInputTypes) {
        super(entity, type, ctx, input);
    }
}
