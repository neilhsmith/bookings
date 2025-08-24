/**
 * Server-side validation utilities for TanStack Start server functions
 *
 * This module provides reusable validation functions and error handling
 * for server functions to ensure data integrity and security.
 */

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`;
    super(message);
    this.name = "ValidationException";
    this.errors = errors;
  }
}

/**
 * Validates that a string field meets length requirements
 */
export function validateStringField(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  } = {},
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { required = false, minLength, maxLength } = options;

  // Check if value is provided when required
  if (required && (value === undefined || value === null || value === "")) {
    errors.push({ field: fieldName, message: "is required" });
    return errors; // Return early if required field is missing
  }

  // If value is empty/null and not required, it's valid
  if (value === undefined || value === null || value === "") {
    return errors;
  }

  // Check if value is a string
  if (typeof value !== "string") {
    errors.push({ field: fieldName, message: "must be a string" });
    return errors;
  }

  // Validate length constraints
  const trimmedValue = value.trim();

  if (minLength !== undefined && trimmedValue.length < minLength) {
    errors.push({
      field: fieldName,
      message: `must be at least ${minLength} characters long`,
    });
  }

  if (maxLength !== undefined && trimmedValue.length > maxLength) {
    errors.push({
      field: fieldName,
      message: `must not exceed ${maxLength} characters`,
    });
  }

  return errors;
}

/**
 * Validates post creation/update data
 */
export interface PostValidationData {
  title: unknown;
  content: unknown;
}

export function validatePostData(data: PostValidationData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate title (required, max 100 characters)
  errors.push(
    ...validateStringField(data.title, "title", {
      required: true,
      maxLength: 100,
    }),
  );

  // Validate content (optional, max 5000 characters)
  errors.push(
    ...validateStringField(data.content, "content", {
      required: false,
      maxLength: 5000,
    }),
  );

  return errors;
}

/**
 * Validates and sanitizes post data, throwing ValidationException if invalid
 */
export function validateAndSanitizePostData(data: PostValidationData): {
  title: string;
  content: string;
} {
  const errors = validatePostData(data);

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  return {
    title: typeof data.title === "string" ? data.title.trim() : "",
    content: typeof data.content === "string" ? data.content.trim() : "",
  };
}

/**
 * Validates that an ID parameter is a non-empty string
 */
export function validateId(id: unknown, fieldName: string = "id"): ValidationError[] {
  const errors: ValidationError[] = [];

  if (id === undefined || id === null || id === "") {
    errors.push({ field: fieldName, message: "is required" });
    return errors;
  }

  if (typeof id !== "string") {
    errors.push({ field: fieldName, message: "must be a string" });
    return errors;
  }

  if (id.trim().length === 0) {
    errors.push({ field: fieldName, message: "cannot be empty" });
  }

  return errors;
}

/**
 * Validates and sanitizes an ID parameter
 */
export function validateAndSanitizeId(id: unknown, fieldName: string = "id"): string {
  const errors = validateId(id, fieldName);

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  return (id as string).trim();
}

/**
 * Common error messages for server functions
 */
export const SERVER_ERRORS = {
  NO_REQUEST: "No request found",
  UNAUTHORIZED: "Unauthorized",
  VALIDATION_FAILED: "Validation failed",
  NOT_FOUND: "Resource not found",
  FORBIDDEN: "Access denied",
} as const;
