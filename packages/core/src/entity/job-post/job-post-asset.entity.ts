import { DeepPartial, Entity, Index, ManyToOne } from 'typeorm';
import { ID } from '../../common/shared-schema';
import { OrderableAsset } from '../asset/orderable-asset.entity';
import { EntityId } from '../entity-id.decorator';
import { JobPost } from './job-post.entity';

@Entity()
export class JobPostAsset extends OrderableAsset {
    constructor(input?: DeepPartial<JobPostAsset>) {
        super(input);
    }

    @EntityId()
    jobPostId: ID;

    @Index()
    @ManyToOne(() => JobPost, (jobPost) => jobPost.assets, { onDelete: 'CASCADE' })
    jobPost: JobPost;
}
