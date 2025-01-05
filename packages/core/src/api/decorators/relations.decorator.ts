import { Type } from '@firelancer/common';
import { EntityRelationPaths } from '../../common';
import { FirelancerEntity } from '../../entity';

export type RelationPaths<T extends FirelancerEntity> = Array<EntityRelationPaths<T>>;
export type FieldsDecoratorConfig<T extends FirelancerEntity> =
    | Type<T>
    | {
          entity: Type<T>;
          depth?: number;
          omit?: RelationPaths<T>;
      };
