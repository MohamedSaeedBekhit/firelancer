import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { I18nService, I18nError } from '../../i18n';
import { parseContext } from '../../common';
import { ConfigService } from '../../config';

/**
 * Logs thrown I18nErrors via the configured FirelancerLogger.
 */
@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
    constructor(
        private configService: ConfigService,
        private i18nService: I18nService,
    ) {}

    catch(exception: Error, host: ArgumentsHost) {
        for (const handler of this.configService.systemOptions.errorHandlers) {
            void handler.handleServerError(exception, { host });
        }

        const { req, res } = parseContext(host);
        let message = 'The server encountered an internal error and was unable to complete your request';
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let statusCode = 500;

        if (exception instanceof I18nError) {
            errorCode = exception.code ?? errorCode;
            this.i18nService.translateError(req, exception);
        }

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            message = exception.message;
        }

        res.status(statusCode).json({
            statusCode,
            errorCode,
            message,
            timestamp: new Date().toISOString(),
            path: req.url,
        });
    }
}
