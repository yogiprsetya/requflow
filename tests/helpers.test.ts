import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRequestHeaders,
  buildRequestUrl,
  groupParametersByLocation,
  placeholderFor,
  createBodyValue,
  sampleValue,
  jsonValidationError,
} from '../app/(platform)/utils/helpers.js';
import type { RequestParameter } from '../app/(platform)/types.js';

test('groupParametersByLocation groups parameters by their in property', () => {
  const parameters: RequestParameter[] = [
    { name: 'id', in: 'path' },
    { name: 'search', in: 'query' },
    { name: 'token', in: 'header' },
    { name: 'session', in: 'cookie' },
    { name: 'page', in: 'query' },
  ];

  const groups = groupParametersByLocation(parameters);

  assert.deepEqual(
    groups.path.map((p) => p.name),
    ['id']
  );
  assert.deepEqual(
    groups.query.map((p) => p.name),
    ['search', 'page']
  );
  assert.deepEqual(
    groups.header.map((p) => p.name),
    ['token']
  );
  assert.deepEqual(
    groups.cookie.map((p) => p.name),
    ['session']
  );
});

test('buildRequestHeaders filters disabled and empty headers', () => {
  assert.deepEqual(
    buildRequestHeaders([
      { key: 'Authorization', value: 'Bearer token', enabled: true },
      { key: 'X-Disabled', value: 'value', enabled: false },
      { key: ' ', value: 'value', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true },
    ]),
    {
      Authorization: 'Bearer token',
      'Content-Type': 'application/json',
    }
  );
});

test('buildRequestUrl replaces path parameters and appends query parameters', () => {
  const parameters: RequestParameter[] = [
    { name: 'id', in: 'path' },
    { name: 'expand', in: 'query' },
  ];

  const url = buildRequestUrl(
    'https://api.example.com/users/{id}',
    parameters,
    { id: '42', expand: 'true' },
    'https://fallback.example.com'
  );

  assert.equal(url, 'https://api.example.com/users/42?expand=true');
});

test('buildRequestUrl falls back to base origin when pathUrl is relative', () => {
  const url = buildRequestUrl('/users', [], {}, 'https://fallback.example.com');

  assert.equal(url, 'https://fallback.example.com/users');
});

test('buildRequestUrl encodes path parameter values', () => {
  const parameters: RequestParameter[] = [{ name: 'slug', in: 'path' }];

  const url = buildRequestUrl('/items/{slug}', parameters, { slug: 'hello world' }, 'https://api.example.com');

  assert.equal(url, 'https://api.example.com/items/hello%20world');
});

test('placeholderFor uses example, default, then type defaults', () => {
  assert.equal(placeholderFor({ example: 'demo' }), 'demo');
  assert.equal(placeholderFor({ default: 'fallback' }), 'fallback');
  assert.equal(placeholderFor({ type: 'integer' }), '0');
  assert.equal(placeholderFor({ type: 'boolean' }), 'true');
  assert.equal(placeholderFor({ type: 'string' }), 'Enter value');
  assert.equal(placeholderFor(), 'Enter value');
});

test('sampleValue generates sample data by schema type', () => {
  assert.equal(sampleValue({ type: 'string' }), '');
  assert.equal(sampleValue({ type: 'integer' }), 0);
  assert.equal(sampleValue({ type: 'boolean' }), false);
  assert.equal(sampleValue({ enum: ['a', 'b'] }), 'a');
  assert.deepEqual(sampleValue({ type: 'array', items: { type: 'integer' } }), [0]);
  assert.deepEqual(sampleValue({ type: 'object', properties: { name: { type: 'string' } } }), { name: '' });
});

test('createBodyValue returns JSON object from schema properties', () => {
  const json = createBodyValue({
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'integer' },
      admin: { type: 'boolean' },
      readonly: { type: 'string', readOnly: true },
    },
  });

  assert.equal(json, JSON.stringify({ name: '', age: 0, admin: false }, null, 2));
});

test('createBodyValue returns empty object for missing schema', () => {
  assert.equal(createBodyValue(), '{}');
});

test('jsonValidationError returns undefined for valid JSON', () => {
  assert.equal(jsonValidationError('{"a":1}'), undefined);
});

test('jsonValidationError returns message for invalid JSON', () => {
  assert.equal(jsonValidationError('{invalid'), 'Request body must be valid JSON.');
});
