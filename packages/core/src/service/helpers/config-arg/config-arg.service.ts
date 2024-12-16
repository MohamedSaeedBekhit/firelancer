import { Injectable } from '@nestjs/common';
import { ConfigurableOperation } from '../../../api';
import { UserInputError } from '../../../common';
import { ConfigurableOperationDef } from '../../../common/configurable-operation';
import { ConfigService } from '../../../config';
import { CollectionFilter } from '../../../config/strategies/catalog/collection-filter';

export type ConfigDefTypeMap = {
  CollectionFilter: CollectionFilter;
};

export type ConfigDefType = keyof ConfigDefTypeMap;

/**
 * This helper class provides methods relating to ConfigurableOperationDef instances.
 */
@Injectable()
export class ConfigArgService {
  private readonly definitionsByType: { [K in ConfigDefType]: Array<ConfigDefTypeMap[K]> };

  constructor(private configService: ConfigService) {
    this.definitionsByType = {
      CollectionFilter: this.configService.catalogOptions.collectionFilters,
    };
  }

  getDefinitions<T extends ConfigDefType>(defType: T): Array<ConfigDefTypeMap[T]> {
    return this.definitionsByType[defType] as Array<ConfigDefTypeMap[T]>;
  }

  getByCode<T extends ConfigDefType>(defType: T, code: string): ConfigDefTypeMap[T] {
    const defsOfType = this.getDefinitions(defType);
    const match = defsOfType.find((def) => def.code === code);
    if (!match) {
      throw new UserInputError('error.no-configurable-operation-def-with-code-found');
    }
    return match;
  }

  /**
   * Parses and validates the input to a ConfigurableOperation.
   */
  parseInput(defType: ConfigDefType, input: ConfigurableOperation): ConfigurableOperation {
    const match = this.getByCode(defType, input.code);
    this.validateRequiredFields(input, match);
    const orderedArgs = this.orderArgsToMatchDef(match, input.args);
    return {
      code: input.code,
      args: orderedArgs,
    };
  }

  private orderArgsToMatchDef<T extends ConfigDefType>(def: ConfigDefTypeMap[T], args: ConfigurableOperation['args']) {
    const output: ConfigurableOperation['args'] = [];
    for (const name of Object.keys(def.args)) {
      const match = args.find((arg) => arg.name === name);
      if (match) {
        output.push(match);
      }
    }
    return output;
  }

  private validateRequiredFields(input: ConfigurableOperation, def: ConfigurableOperationDef) {
    for (const [name, argDef] of Object.entries(def.args)) {
      if (argDef.required) {
        const inputArg = input.args.find((a) => a.name === name);

        let valid = false;
        try {
          if (['string', 'ID', 'datetime'].includes(argDef.type)) {
            valid = !!inputArg && inputArg.value !== '' && inputArg.value != null;
          } else {
            valid = !!inputArg && JSON.parse(inputArg.value) != null;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // ignore
        }

        if (!valid) {
          throw new UserInputError('error.configurable-argument-is-required');
        }
      }
    }
  }
}
