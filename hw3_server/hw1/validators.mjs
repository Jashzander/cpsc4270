
export const isNonEmptyString = maybeString => maybeString && typeof(maybeString) === 'string'

export const isNullishOrNonEmptyString = maybeString => maybeString == null || isNonEmptyString(maybeString)

export const isNullishOrArray = maybeArray => maybeArray == null || Array.isArray(maybeArray)
