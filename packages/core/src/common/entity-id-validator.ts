import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';
import isUuidValidator from 'validator/lib/isUUID';
import { getConfig } from '../config';

export const IS_ENTITY_ID = 'isEntityId';

export function isEntityId(value: unknown) {
    const config = getConfig();
    if (config.entityOptions.entityIdStrategy.primaryKeyType === 'uuid') {
        return typeof value === 'string' && isUuidValidator(value, 4);
    }
    if (config.entityOptions.entityIdStrategy.primaryKeyType === 'increment') {
        return typeof value === 'number' && Number.isInteger(value) && value > 0;
    }
    throw Error('Unsupported entity id type');
}

/**
 * @description
 * Custom validator to check if a given value matches the expected type for the
 * EntityId based on the selected EntityIdStrategy.
 */
export function IsEntityId(validationOptions?: ValidationOptions) {
    return ValidateBy(
        {
            name: IS_ENTITY_ID,
            validator: {
                validate: function (value) {
                    return isEntityId(value);
                },
                defaultMessage: buildMessage(function (eachPrefix) {
                    const config = getConfig();
                    return (
                        eachPrefix +
                        `$property must be entity-id type (${config.entityOptions.entityIdStrategy.primaryKeyType})`
                    );
                }, validationOptions),
            },
        },
        validationOptions,
    );
}
