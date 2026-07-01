import {url as matchURL} from '@shared/util/regEx';

export const isNotEmpty = (value: string | undefined): value is string => value != null && value !== '';

export const isRegExValid = (regExToCheck: string): boolean => {
  try {
    new RegExp(regExToCheck);
  } catch {
    return false;
  }

  return true;
};

// Returns true if the pattern contains any '.' character that is
// not preceded by a backslash. We surface this in the form so users
// who expect 'foo.xml' to match literal dots know they need 'foo[.]xml'
// -- addresses jesec/flood#517 where 'in regex ... *.XXX.* ... matched
// *XXX too' because RegExp treated '.' as a wildcard.
export const regexHasUnescapedDot = (pattern: string): boolean => {
  let previousChar = '';
  for (const char of pattern) {
    if (char === '.') {
      if (previousChar !== '\\') {
        return true;
      }
    }
    previousChar = char;
  }
  return false;
};

export const regexHasUnescapedStarAnchor = (pattern: string): boolean => {
  // Surface 'pattern starts or ends with an unanchored .*' which
  // is the second common trap behind #517: '*.XXX.*' matches any
  // string that contains XXX, not just strings with surrounding dots.
  if (pattern.startsWith('.*')) {
    return true;
  }
  if (pattern.endsWith('.*')) {
    return true;
  }
  return false;
};

export const isURLValid = (url: string | undefined): url is string =>
  url != null && url !== '' && url.match(matchURL) !== null;

export const isPositiveInteger = (value: number | string | undefined): boolean => {
  if (value === null || value === '') return false;

  const number = parseInt(`${value}`, 10);

  return !Number.isNaN(number) && number > 0;
};
