/**
 * Type guard to check if value is a string
 *
 * @param value - Value to check
 * @returns Type predicate indicating if value is string
 *
 * @example
 * if (isString(req.query.search)) {
 *   const searchTerm = req.query.search;
 * }
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if value is a number
 * Note: Returns false for NaN
 *
 * @param value - Value to check
 * @returns Type predicate indicating if value is a valid number
 *
 * @example
 * if (isNumber(req.query.page)) {
 *   const page = req.query.page;
 * }
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard to check if value is a boolean
 *
 * @param value - Value to check
 * @returns Type predicate indicating if value is boolean
 *
 * @example
 * if (isBoolean(req.query.isPublic)) {
 *   const isPublic = req.query.isPublic;
 * }
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if value is an object (not null, not array)
 *
 * @param value - Value to check
 * @returns Type predicate indicating if value is an object
 *
 * @example
 * if (isObject(req.body)) {
 *   // Safe to access object properties
 * }
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if value is an array
 *
 * @param value - Value to check
 * @returns Type predicate indicating if value is an array
 *
 * @example
 * if (isArray(req.body.exerciseIds)) {
 *   req.body.exerciseIds.forEach(id => ...);
 * }
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if value is an array of specific type
 *
 * @param value - Value to check
 * @param elementGuard - Type guard function for array elements
 * @returns Type predicate indicating if value is array of specified type
 *
 * @example
 * if (isArrayOf(value, isString)) {
 *   // value is string[]
 *   value.map(s => s.toUpperCase());
 * }
 */
export function isArrayOf<T>(
  value: unknown,
  elementGuard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(elementGuard);
}

/**
 * Type guard to check if value is a Record with string keys and specific value type
 *
 * @param value - Value to check
 * @param valueGuard - Type guard function for record values
 * @returns Type predicate for Record<string, T>
 *
 * @example
 * if (isRecord(value, isString)) {
 *   // value is Record<string, string>
 *   Object.values(value).forEach(s => s.toUpperCase());
 * }
 */
export function isRecord<T>(
  value: unknown,
  valueGuard: (item: unknown) => item is T
): value is Record<string, T> {
  if (!isObject(value)) {
    return false;
  }

  return Object.values(value).every(valueGuard);
}

/**
 * Type guard to check if object has a specific property
 * After this check, TypeScript knows the property exists
 *
 * @param obj - Object to check
 * @param key - Property key to check for
 * @returns Type predicate indicating property exists
 *
 * @example
 * if (hasProperty(req.body, 'email')) {
 *   // TypeScript knows req.body.email exists
 *   const email = req.body.email;
 * }
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

/**
 * Type guard to check if object has a property of specific type
 *
 * @param obj - Object to check
 * @param key - Property key to check for
 * @param valueGuard - Type guard for the property value
 * @returns Type predicate for object with typed property
 *
 * @example
 * if (hasPropertyOfType(req.body, 'email', isString)) {
 *   // TypeScript knows req.body.email is string
 *   const email = req.body.email.toLowerCase();
 * }
 */
export function hasPropertyOfType<K extends string, T>(
  obj: unknown,
  key: K,
  valueGuard: (value: unknown) => value is T
): obj is Record<K, T> {
  return hasProperty(obj, key) && valueGuard(obj[key]);
}

/**
 * Type guard to check if value is null or undefined
 *
 * @param value - Value to check
 * @returns Type predicate for null or undefined
 *
 * @example
 * if (isNullish(value)) {
 *   return defaultValue;
 * }
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Type guard to check if value is defined (not null, not undefined)
 *
 * @param value - Value to check
 * @returns Type predicate for defined values
 *
 * @example
 * const values = [1, null, 2, undefined, 3].filter(isDefined);
 * // values is number[]
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return !isNullish(value);
}

/**
 * Type guard to check if value is a valid Date object
 * Returns false for Invalid Date
 *
 * @param value - Value to check
 * @returns Type predicate for valid Date
 *
 * @example
 * if (isValidDate(new Date(req.body.startDate))) {
 *   // Safe to use as Date
 * }
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Type guard to check if value is a UUID string (v4 format)
 *
 * @param value - Value to check
 * @returns Type predicate for UUID string
 *
 * @example
 * if (isUUID(req.params.id)) {
 *   // Safe to use as UUID
 * }
 */
export function isUUID(value: unknown): value is string {
  if (!isString(value)) {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard to check if value is a non-empty string
 *
 * @param value - Value to check
 * @returns Type predicate for non-empty string
 *
 * @example
 * if (isNonEmptyString(req.body.title)) {
 *   // Safe to use, guaranteed not empty
 * }
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Type guard to check if value is a positive number
 *
 * @param value - Value to check
 * @returns Type predicate for positive number
 *
 * @example
 * if (isPositiveNumber(req.body.pointsReward)) {
 *   // Guaranteed to be > 0
 * }
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Type guard to check if value is a non-negative number (>= 0)
 *
 * @param value - Value to check
 * @returns Type predicate for non-negative number
 *
 * @example
 * if (isNonNegativeNumber(req.body.page)) {
 *   // Guaranteed to be >= 0
 * }
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

/**
 * Type guard to check if value is one of the specified enum values
 *
 * @param value - Value to check
 * @param enumObject - Enum object to check against
 * @returns Type predicate for enum value
 *
 * @example
 * if (isEnumValue(req.body.role, UserRole)) {
 *   // value is UserRole
 * }
 */
export function isEnumValue<T extends Record<string, string | number>>(
  value: unknown,
  enumObject: T
): value is T[keyof T] {
  return Object.values(enumObject).includes(value as T[keyof T]);
}
