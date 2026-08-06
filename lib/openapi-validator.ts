import { parse as parseYaml, YAMLParseError } from 'yaml';

type OpenApiDocument = Record<string, unknown>;

interface OpenApiValidationError {
  path: string;
  message: string;
}

interface OpenApiValidationResult {
  valid: boolean;
  spec?: OpenApiDocument;
  errors: OpenApiValidationError[];
}

export const validateOpenApiSpec = (input: string | unknown): OpenApiValidationResult => {
  const errors: OpenApiValidationError[] = [];
  const spec = parseInput(input, errors);

  if (!spec) {
    return { valid: false, errors };
  }

  validateDocument(spec, errors);

  return errors.length === 0 ? { valid: true, spec, errors: [] } : { valid: false, errors };
};

const parseInput = (input: string | unknown, errors: OpenApiValidationError[]): OpenApiDocument | undefined => {
  if (typeof input !== 'string') {
    if (isObject(input)) return input;

    errors.push({
      path: '',
      message: 'Spec must be a JSON/YAML string or object.',
    });
    return undefined;
  }

  if (!input.trim()) {
    errors.push({ path: '', message: 'Spec cannot be empty.' });
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = parseYaml(input);
  } catch (error) {
    const message = error instanceof YAMLParseError ? error.message : 'Invalid JSON/YAML syntax.';
    errors.push({ path: '', message });
    return undefined;
  }

  if (!isObject(parsed)) {
    errors.push({
      path: '',
      message: 'Spec must contain an object at the document root.',
    });
    return undefined;
  }

  return parsed;
};

const validateDocument = (spec: OpenApiDocument, errors: OpenApiValidationError[]): void => {
  if (typeof spec.openapi !== 'string' || !/^3\.([0-9]+)(?:\.[0-9]+)?$/.test(spec.openapi)) {
    errors.push({
      path: 'openapi',
      message: 'Required field must be an OpenAPI 3.x version string.',
    });
  }

  if (!isObject(spec.info)) {
    errors.push({ path: 'info', message: 'Required field must be an object.' });
  } else {
    if (typeof spec.info.title !== 'string' || !spec.info.title.trim()) {
      errors.push({
        path: 'info.title',
        message: 'Required field must be a non-empty string.',
      });
    }

    if (typeof spec.info.version !== 'string' || !spec.info.version.trim()) {
      errors.push({
        path: 'info.version',
        message: 'Required field must be a non-empty string.',
      });
    }
  }

  if (!isObject(spec.paths)) {
    errors.push({
      path: 'paths',
      message: 'Required field must be an object.',
    });
  }
};

const isObject = (value: unknown): value is OpenApiDocument => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
