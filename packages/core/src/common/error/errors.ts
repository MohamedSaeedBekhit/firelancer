import { ID } from '../../common/shared-schema';
import { LogLevel } from '../../config';
import { coreEntitiesMap } from '../../entity';
import { I18nError } from '../../i18n';

/**
 * @description
 * This error should be thrown when some unexpected and exceptional case is encountered.
 */
export class InternalServerError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(500, message, variables, 'INTERNAL_SERVER_ERROR', LogLevel.Error);
    }
}

/**
 * @description
 * This error should be thrown when user input is not as expected.
 */
export class UserInputError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(400, message, variables, 'USER_INPUT_ERROR', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when an operation is attempted which is not allowed.
 */
export class IllegalOperationError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(403, message, variables, 'ILLEGAL_OPERATION_ERROR', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when the user's authentication credentials do not match.
 */
export class UnauthorizedError extends I18nError {
    constructor() {
        super(401, 'error.unauthorized', {}, 'UNAUTHORIZED_ERROR', LogLevel.Info);
    }
}

/**
 * @description
 * This error should be thrown when a user attempts to access a resource which is outside of
 * his or her privileges.
 */
export class ForbiddenError extends I18nError {
    constructor(logLevel: LogLevel = LogLevel.Warn) {
        super(403, 'error.forbidden', {}, 'FORBIDDEN_ERROR', logLevel);
    }
}

/**
 * @description
 * This error should be thrown when an entity cannot be found in the database, i.e. no entity of
 * the given entityName (Product, User etc.) exists with the provided id.
 */
export class EntityNotFoundError extends I18nError {
    constructor(entityName: keyof typeof coreEntitiesMap | string, id: ID) {
        super(404, 'error.entity-with-id-not-found', { entityName, id }, 'ENTITY_NOT_FOUND_ERROR', LogLevel.Warn);
    }
}

export class InvalidCredentialsError extends I18nError {
    readonly authenticationError: string;
    constructor(input: { authenticationError: string }) {
        super(401, 'error.invalid-credentials', {}, 'INVALID_CREDENTIALS_ERROR');
        this.authenticationError = input.authenticationError;
    }
}

export class NotVerifiedError extends I18nError {
    readonly refundId: ID;
    constructor() {
        super(403, 'error.not-verified', {}, 'NOT_VERIFIED_ERROR');
    }
}

export class PasswordValidationError extends I18nError {
    readonly validationErrorMessage: string;
    constructor(input: { validationErrorMessage: string }) {
        super(400, 'error.password-validation', {}, 'PASSWORD_VALIDATION_ERROR');
        this.validationErrorMessage = input.validationErrorMessage;
    }
}

export class NativeAuthStrategyError extends I18nError {
    constructor() {
        super(400, 'error.native-auth-strategy', {}, 'NATIVE_AUTH_STRATEGY_ERROR');
    }
}

export class EmailAddressConflictError extends I18nError {
    constructor() {
        super(409, 'error.email-address-conlict', {}, 'EMAIL_ADDRESS_CONFLICT_ERROR');
    }
}

export class MissingPasswordError extends I18nError {
    constructor() {
        super(400, 'error.missing-password', {}, 'MISSING_PASSWORD_ERROR');
    }
}

export class PasswordAlreadySetError extends I18nError {
    constructor(public description: string = 'PASSWORD_ALREADY_SET_ERROR') {
        super(400, 'error.password-already-set', {}, 'PASSWORD_ALREADY_SET_ERROR');
    }
}

export class VerificationTokenExpiredError extends I18nError {
    constructor() {
        super(410, 'error.verification-token-expired', {}, 'VERIFICATION_TOKEN_EXPIRED_ERROR');
    }
}

export class VerificationTokenInvalidError extends I18nError {
    constructor() {
        super(400, 'error.verification-token-invalid', {}, 'VERIFICATION_TOKEN_INVALID_ERROR');
    }
}

export class PasswordResetTokenInvalidError extends I18nError {
    constructor() {
        super(400, 'error.password-reset-token', {}, 'PASSWORD_RESET_TOKEN_INVALID_ERROR');
    }
}

export class PasswordResetTokenExpiredError extends I18nError {
    constructor() {
        super(410, 'error.password-reset-token-expired', {}, 'PASSWORD_RESET_TOKEN_EXPIRED_ERROR');
    }
}

export class IdentifierChangeTokenInvalidError extends I18nError {
    constructor() {
        super(400, 'error.identifier-change-token-invalid', {}, 'IDENTIFIER_CHANGE_TOKEN_INVALID_ERROR');
    }
}

export class IdentifierChangeTokenExpiredError extends I18nError {
    constructor() {
        super(410, 'error.identifier-change-token-expired', {}, 'IDENTIFIER_CHANGE_TOKEN_EXPIRED_ERROR');
    }
}
