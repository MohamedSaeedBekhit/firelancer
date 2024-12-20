import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parseContext } from '../../common/parse-context';
import { internal_getRequestContext } from '../../common/request-context';

/**
 * @description
 * Resolver param decorator which extracts the RequestContext from the incoming
 * request object.
 *
 * @example
 * ```ts
 *  \@Get()
 *  getAdministrators(\@Ctx() ctx: RequestContext) {
 *      // ...
 *  }
 * ```
 */
export const Ctx = createParamDecorator((data, executionContext: ExecutionContext) => {
    const context = parseContext(executionContext);
    return internal_getRequestContext(context.req, executionContext);
});
