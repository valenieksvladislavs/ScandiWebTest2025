export const toKebabCase = (str: string): string => 
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase to kebab-case
    .replace(/[\s_]+/g, '-')             // spaces/underscores to dash
    .toLowerCase();
