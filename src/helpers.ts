export const microtime = (getAsFloat: boolean = true) => {
  let s, now, multiplier;

  if (typeof performance !== 'undefined' && performance.now) {
    now = (performance.now() + performance.timing.navigationStart) / 1000;
    multiplier = 1e6; // 1,000,000 for microseconds
  } else {
    now = (Date.now ? Date.now() : new Date().getTime()) / 1000;
    multiplier = 1e3; // 1,000
  }

  // Getting microtime as a float is easy
  if (getAsFloat) {
    return now;
  }

  // Dirty trick to only get the integer part
  s = now | 0;

  return (Math.round((now - s) * multiplier ) / multiplier ) + ' ' + s;
}

/**
 * Convert string with camelCase to snake_case
 * @param str string
 * @returns string
 * @example camelToSnake('isNumber') => 'is_number'
 */
export const camelToSnake = (str: string) => str.replace(/[A-Z]/g, (char: string) => '_' + char.toLowerCase());

/**
 * Convert string with snake_case to camelCase
 * @param str string
 * @returns string
 * @example snakeToCamel('is_number') => 'isNumber'
 */
export const snakeToCamel = (str: string) => str.replace(/_[a-z]/g, (char: string) => char.toUpperCase().replace('_', ''));

/**
 * Returns the intersection of two arrays.
 * @example intersection([ 1, 3, 5 ], [ 1, 5, 7 ]) => [ 1, 5 ]
 */
export const intersection = (first: any[], second: any[]) =>
  first.filter((x: any) => second.includes(x));

/**
 * Returns the intersection of multiple arrays.
 * @param arrs any[][]
 * @returns any[]
 * @example intersectionMultiple([ 1, 3, 5 ]) => [ 1, 3, 5 ]
 * @example intersectionMultiple([ 1, 3, 5 ], [ 1, 5, 7 ]) => [ 1, 5 ]
 * @example intersectionMultiple([ 1, 3, 5 ], [ 1, 5, 7 ], [ 1, 7, 11 ]) => [ 1 ]
 */
export const intersectionMultiple = (...arrs: any[][]) => {
  if (!arrs.length) {
    return [];
  }

  if (arrs.length === 1) {
    return arrs[0];
  }

  let result!: any[];

  for (let i = 1; i < arrs.length; i++) {
    result = arrs[i-1].filter(x => arrs[i].includes(x));
  }

  return result;
}

// console.log(intersectionMultiple(
//   [ 1, 3, 5, 7, 9, 11, 13],
//   [ 2, 3, 7, 11, 15],
//   // [ 5, 7, 10, 11, 17 ],
//   // [ 4, 6, 7, 11 ]
// ));
/**
 * Returns the difference between the second array and the first
 * @example difference([ 1, 3, 5 ], [ 1, 5, 9 ]) => [ 3 ];
 * @example difference([ 1, 5, 9 ], [ 1, 3, 5 ]) => [ 9 ];
 */
export const difference = (target: any[], compare: any[]) =>
  compare.filter((x: any) => !target.includes(x));

/**
 * Returns the difference of two arrays.
 * @example difference([ 1, 3, 5 ], [ 1, 5, 9 ]) => [ 3, 9 ];
 */
export const differenceBoth = (first: any[], second: any[]) =>
  first.filter((x: any) => !second.includes(x))
  .concat(second.filter((x: any) => !first.includes(x)));

/**
 * Alias for Object.keys()
 * @param obj Object
 * @returns string[]
 */
export const keys: (obj: {}) => string[] = obj => Object.keys(obj);