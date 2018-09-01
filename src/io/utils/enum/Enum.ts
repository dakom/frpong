export const getEnumValues = (target:any) =>
    Object.keys(target).map(key => target[key]);
