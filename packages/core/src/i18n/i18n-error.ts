import { HttpException } from '@nestjs/common';
import { LogLevel } from '../config';

/**
 * @description
 * All errors thrown in the Firelancer server must use or extend this error class. This allows the
 * error message to be translated before being served to the client.
 *
 * The error messages should be provided in the form of a string key which corresponds to
 * a key defined in the `i18n/messages/<languageCode>.json` files.
 *
 * Note that this class should not be directly used in code, but should be extended by
 * a more specific Error class.
 */
export abstract class I18nError extends HttpException {
    protected constructor(
        status: number,
        public message: string,
        public variables: { [key: string]: string | number } = {},
        public code?: string,
        public logLevel: LogLevel = LogLevel.Warn,
    ) {
        super(message, status);
    }
}
