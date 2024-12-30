export function isObject(item: any): item is object {
    return item && typeof item === 'object' && !Array.isArray(item);
}
