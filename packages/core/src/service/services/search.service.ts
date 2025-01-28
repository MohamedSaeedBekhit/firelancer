import { JobState } from '../../common/shared-schema';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../common';
import { Logger } from '../../config';
import { Job } from '../../job-queue/job';

/**
 * @description
 * This service allows a concrete search service to override its behaviour
 * by passing itself to the `adopt()` method.
 */
@Injectable()
export class SearchService {
    private override: Pick<SearchService, 'reindex'> | undefined;

    /**
     * @description
     * Adopt a concrete search service implementation to pass through the
     * calls to.
     */
    adopt(override: Pick<SearchService, 'reindex'>) {
        this.override = override;
    }

    async reindex(ctx: RequestContext): Promise<Job> {
        if (this.override) {
            return this.override.reindex(ctx);
        }
        if (!process.env.CI) {
            Logger.warn('The SearchService should be overridden by an appropriate search plugin.');
        }
        return new Job({
            queueName: 'error',
            data: {},
            id: 998,
            state: JobState.FAILED,
            progress: 0,
        });
    }
}
