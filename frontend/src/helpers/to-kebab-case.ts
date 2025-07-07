export const toKebabCase = (str: string): string =>
  str
    .match(/[A-Za-z0-9]+/g)               // pull out groups of letters/digits
    ?.map(word => word.toLowerCase())     // to lowercase
    .join('-') || '';                     // join with '-'
