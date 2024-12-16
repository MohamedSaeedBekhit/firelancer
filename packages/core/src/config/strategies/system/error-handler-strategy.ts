import { ArgumentsHost } from '@nestjs/common';
import { InjectableStrategy } from '../../../common';
import { Job } from '../../../job-queue';

/**
 * @description
 * This strategy defines logic for handling errors thrown during on both the server
 * and the worker. It can be used for additional logging & monitoring, or for sending error
 * reports to external services.
 *
 * :::info
 *
 * This is configured via the `systemOptions.errorHandlers` property of
 * your FirelancerConfig.
 *
 * :::
 *
 * @example
 * ```ts
 * import { ArgumentsHost, ExecutionContext } from '\@nestjs/common';
 * import { GqlContextType, GqlExecutionContext } from '\@nestjs/graphql';
 * import { ErrorHandlerStrategy, I18nError, Injector, Job, LogLevel } from '\@firelancer/core';
 *
 * import { MonitoringService } from './monitoring.service';
 *
 * export class CustomErrorHandlerStrategy implements ErrorHandlerStrategy {
 *     private monitoringService: MonitoringService;
 *
 *     init(injector: Injector) {
 *         this.monitoringService = injector.get(MonitoringService);
 *     }
 *
 *     handleServerError(error: Error, { host }: { host: ArgumentsHost }) {
 *       const errorContext: any = {};
 *
 *       // Check if the request is from HTTP/REST
 *       if (host?.getType() === 'http') {
 *           const ctx = host.switchToHttp();
 *           const request = ctx.getRequest();
 *           const response = ctx.getResponse();
 *
 *           errorContext.requestInfo = {
 *               method: request.method,
 *               url: request.url,
 *               headers: request.headers,
 *           };
 *
 *           // Optionally, include user or other contextual data if available
 *           if (request.user) {
 *               errorContext.user = request.user;
 *           }
 *
 *           // Send a response if desired
 *           response.status(500).json({
 *               message: 'Internal server error',
 *               details: error.message,
 *           });
 *       }
 *
 *       this.monitoringService.captureException(error, errorContext);
 *  }
 *
 *     handleWorkerError(error: Error, { job }: { job: Job }) {
 *         const errorContext = {
 *             queueName: job.queueName,
 *             jobId: job.id,
 *         };
 *         this.monitoringService.captureException(error, errorContext);
 *     }
 * }
 * ```
 */
export interface ErrorHandlerStrategy extends InjectableStrategy {
  /**
   * @description
   * This method will be invoked for any error thrown during the execution of the
   * server.
   */
  handleServerError(exception: Error, context: { host: ArgumentsHost }): void | Promise<void>;

  /**
   * @description
   * This method will be invoked for any error thrown during the execution of a
   * job on the worker.
   */
  handleWorkerError(exception: Error, context: { job: Job }): void | Promise<void>;
}
