import { lastValueFrom, Observable } from 'rxjs';

/**
 * Converts a value that may be wrapped into a Promise or Observable into a Promise-wrapped
 * value.
 */
export async function awaitPromiseOrObservable<T>(value: T | Promise<T> | Observable<T>): Promise<T> {
    let result = await value;
    if (result instanceof Observable) {
        result = await lastValueFrom(result);
    }
    return result;
}
