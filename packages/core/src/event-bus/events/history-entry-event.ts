import { RequestContext } from '../../common/request-context';
import { HistoryEntryType, ID } from '../../common/shared-schema';
import { HistoryEntry } from '../../entity/history-entry/history-entry.entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type HistoryInput =
    | {
          type: HistoryEntryType;
          data?: unknown;
      }
    | ID;

/**
 * @description
 * This event is fired whenever one HistoryEntry is added, updated or deleted.
 */
export class HistoryEntryEvent extends FirelancerEntityEvent<HistoryEntry, HistoryInput> {
    public readonly historyType: 'order' | 'customer' | string;

    constructor(
        ctx: RequestContext,
        entity: HistoryEntry,
        type: 'created' | 'updated' | 'deleted',
        historyType: 'order' | 'customer' | string,
        input?: HistoryInput,
    ) {
        super(entity, type, ctx, input);
        this.historyType = historyType;
    }
}
