import { Column, Entity, JoinTable, ManyToMany, Tree, TreeChildren, TreeParent } from 'typeorm';
import { ConfigurableOperation } from '../../api';
import { DeepPartial, ID, Orderable } from '../../common';
import { FirelancerEntity } from '../base/base.entity';
import { JobPost } from '../job-post/job-post.entity';
import { EntityId } from '../entity-id.decorator';

/**
 * @description
 * A Collection is a grouping of JobPosts based on various configurable criteria.
 */
@Entity()
@Tree('closure-table')
export class Collection extends FirelancerEntity implements Orderable {
    constructor(input?: DeepPartial<Collection>) {
        super(input);
    }

    @Column({ default: false })
    isRoot: boolean;

    @Column()
    position: number;

    @Column({ default: false })
    isPrivate: boolean;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    slug: string;

    @Column('simple-json')
    filters: ConfigurableOperation[];

    @Column({ default: true })
    inheritFilters: boolean;

    @ManyToMany(() => JobPost, (jobPost) => jobPost.collections)
    @JoinTable()
    jobPosts: JobPost[];

    @TreeChildren()
    children: Collection[];

    @TreeParent()
    parent: Collection;

    @EntityId({ nullable: true })
    parentId: ID;
}
