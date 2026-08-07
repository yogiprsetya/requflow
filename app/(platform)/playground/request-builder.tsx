'use client';

import { useState } from 'react';
import { Check, ChevronDown, Copy, KeyRound, Play, Plus, Trash2 } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { cn } from '~/lib/css';
import { ApiEndpointDetail, PlaygroundRequest, RequestParameter, SchemaObject } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { methodTextClass } from '../utils';

type KeyValue = { id: number; key: string; value: string; enabled: boolean };

export const RequestBuilder = ({
  endpoint,
  onSend,
}: {
  endpoint: ApiEndpointDetail;
  onSend: (request: PlaygroundRequest) => void;
}) => {
  const queryParams = endpoint.parameters.filter((parameter) => parameter.in === 'query');
  const pathParams = endpoint.parameters.filter((parameter) => parameter.in === 'path');
  const headerParams = endpoint.parameters.filter((parameter) => parameter.in === 'header');
  const cookieParams = endpoint.parameters.filter((parameter) => parameter.in === 'cookie');
  const bodyMediaType = endpoint.requestBody?.content
    ? (Object.keys(endpoint.requestBody.content)[0] ?? 'application/json')
    : 'application/json';

  const [pathUrl, setPathUrl] = useState(`${endpoint.baseUrl ?? ''}${endpoint.path}`);

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      endpoint.parameters.map((parameter) => [
        parameter.name,
        String(parameter.example ?? parameter.schema?.default ?? ''),
      ])
    )
  );
  const [headers, setHeaders] = useState<KeyValue[]>(() =>
    headerParams.map((parameter, index) => ({
      id: index,
      key: parameter.name,
      value: String(parameter.example ?? parameter.schema?.default ?? ''),
      enabled: true,
    }))
  );
  const [body, setBody] = useState(() => createBodyValue(endpoint.requestBody?.content?.[bodyMediaType]?.schema));
  const [copied, setCopied] = useState(false);

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const addHeader = () => {
    setHeaders((current) => [...current, { id: Date.now(), key: '', value: '', enabled: true }]);
  };

  const updateHeader = (id: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    setHeaders((current) => current.map((header) => (header.id === id ? { ...header, [field]: value } : header)));
  };

  const removeHeader = (id: number) => setHeaders((current) => current.filter((header) => header.id !== id));

  const copyUrl = async (copyUrl: string) => {
    await navigator.clipboard?.writeText(copyUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const sendRequest = () => {
    const url = new URL(pathUrl, window.location.origin);

    endpoint.parameters.forEach((parameter) => {
      const value = values[parameter.name];
      if (!value) return;

      if (parameter.in === 'path') {
        url.pathname = url.pathname.replace(`{${parameter.name}}`, encodeURIComponent(value));
      } else if (parameter.in === 'query') {
        url.searchParams.set(parameter.name, value);
      }
    });

    const requestHeaders = Object.fromEntries(
      headers.filter((header) => header.enabled && header.key.trim()).map((header) => [header.key, header.value])
    );

    onSend({
      url: url.toString(),
      method: endpoint.method,
      headers: requestHeaders,
      body: endpoint.requestBody ? body : undefined,
    });
  };

  return (
    <section className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden border border-b-0 border-l-0 shadow-sm">
      <div className="border-b px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn('border-0 px-0 text-xs font-bold uppercase', methodTextClass(endpoint.method))}
          >
            {endpoint.method}
          </Badge>

          <span className="font-mono text-sm font-medium">{endpoint.path}</span>

          {endpoint.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="text-muted-foreground mt-1 text-sm">
          {endpoint.summary ?? endpoint.operationId ?? 'Request builder'}
        </p>
      </div>

      <div className="bg-muted/20 flex items-center gap-2 border-b px-5 py-3">
        <Input
          value={pathUrl}
          onChange={(event) => setPathUrl(event.target.value)}
          className="bg-background h-9 flex-1 font-mono text-xs"
          aria-label="Base URL"
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon-lg" variant="ghost">
                {copied ? <Check /> : <Copy />}
              </Button>
            }
          />

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem aria-label="Copy request endpoint" onClick={() => copyUrl(endpoint.path)}>
                Copy path
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label="Copy request full URL"
                onClick={() => copyUrl(endpoint.baseUrl + endpoint.path)}
              >
                Copy URL
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="h-9 px-4" onClick={sendRequest}>
          <Play data-icon="inline-start" />
          Send
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <Tabs orientation="vertical" className="h-full gap-0">
          <TabsList variant="line" className="h-11 w-full justify-start rounded-none border-b px-5">
            <TabsTrigger value="params" className="flex-none px-3">
              Params{' '}
              <span className="text-muted-foreground ml-1 text-xs">
                {queryParams.length + pathParams.length + cookieParams.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="headers" className="flex-none px-3">
              Headers <span className="text-muted-foreground ml-1 text-xs">{headers.length}</span>
            </TabsTrigger>

            <TabsTrigger value="body" className="flex-none px-3">
              Body
            </TabsTrigger>

            <TabsTrigger value="auth" className="flex-none px-3">
              Auth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="params" className="space-y-5 p-5">
            <ParameterSection
              title="Path parameters"
              parameters={pathParams}
              values={values}
              onChange={updateValue}
            />

            <ParameterSection
              title="Query parameters"
              parameters={queryParams}
              values={values}
              onChange={updateValue}
            />

            <ParameterSection
              title="Cookie parameters"
              parameters={cookieParams}
              values={values}
              onChange={updateValue}
            />

            {pathParams.length + queryParams.length + cookieParams.length === 0 && (
              <EmptySection icon={<ChevronDown />} text="No parameters defined for this endpoint." />
            )}
          </TabsContent>

          <TabsContent value="headers" className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Request headers</h3>
                <p className="text-muted-foreground text-xs">Headers are sent with the request when enabled.</p>
              </div>
              <Button size="sm" variant="outline" onClick={addHeader}>
                <Plus data-icon="inline-start" />
                Add header
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <div className="bg-muted/40 text-muted-foreground grid grid-cols-[28px_1fr_1fr_36px] gap-2 px-3 py-2 text-[11px] font-medium tracking-wider uppercase">
                <span />
                <span>Key</span>
                <span>Value</span>
                <span />
              </div>

              {headers.map((header) => (
                <div
                  key={header.id}
                  className="grid grid-cols-[28px_1fr_1fr_36px] items-center gap-2 border-t px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(event) => updateHeader(header.id, 'enabled', event.target.checked)}
                    aria-label={`Enable ${header.key || 'header'}`}
                  />

                  <Input
                    value={header.key}
                    onChange={(event) => updateHeader(header.id, 'key', event.target.value)}
                    placeholder="Header name"
                  />

                  <Input
                    value={header.value}
                    onChange={(event) => updateHeader(header.id, 'value', event.target.value)}
                    placeholder="Value"
                  />

                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeHeader(header.id)}
                    aria-label={`Remove ${header.key || 'header'}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="body" className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Request body</h3>
                <p className="text-muted-foreground text-xs">Generated from the OpenAPI request body schema.</p>
              </div>
              <Select value={bodyMediaType} onValueChange={() => undefined}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={bodyMediaType}>{bodyMediaType}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {endpoint.requestBody ? (
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-muted/20 min-h-64 w-full resize-y rounded-lg border p-4 font-mono text-xs outline-none focus-visible:ring-3"
                spellCheck={false}
                aria-label="Request body"
              />
            ) : (
              <EmptySection icon={<KeyRound />} text="This endpoint does not define a request body." />
            )}
          </TabsContent>

          <TabsContent value="auth" className="p-5">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <KeyRound className="text-muted-foreground mx-auto mb-2 size-5" />
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Configure an API key or bearer token when authentication is added.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

const ParameterSection = ({
  title,
  parameters,
  values,
  onChange,
}: {
  title: string;
  parameters: RequestParameter[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) => {
  if (!parameters.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="overflow-hidden rounded-lg border">
        {parameters.map((parameter) => (
          <div
            key={`${parameter.in}:${parameter.name}`}
            className="grid gap-3 border-b p-3 last:border-b-0 md:grid-cols-[minmax(140px,0.7fr)_minmax(180px,1fr)_minmax(160px,1fr)] md:items-center"
          >
            <div>
              <Label className="font-mono text-xs">
                {parameter.name}
                {parameter.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              <p className="text-muted-foreground mt-1 text-[11px]">
                {parameter.description ??
                  `${parameter.schema?.type ?? 'string'}${parameter.schema?.format ? ` · ${parameter.schema.format}` : ''}`}
              </p>
            </div>

            <Input
              value={values[parameter.name] ?? ''}
              onChange={(event) => onChange(parameter.name, event.target.value)}
              placeholder={placeholderFor(parameter.schema)}
              aria-label={parameter.name}
            />

            {parameter.schema?.enum?.length ? (
              <Select
                value={values[parameter.name] ?? ''}
                onValueChange={(value) => onChange(parameter.name, value ?? '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>

                <SelectContent>
                  {parameter.schema.enum.map((item) => (
                    <SelectItem key={String(item)} value={String(item)}>
                      {String(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-muted-foreground hidden text-xs md:block">
                {parameter.schema?.type ?? 'string'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptySection = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="text-muted-foreground flex flex-col items-center rounded-lg border border-dashed p-8 text-center text-sm">
    {icon}
    <p className="mt-2">{text}</p>
  </div>
);

const placeholderFor = (schema?: SchemaObject): string => {
  if (!schema) return 'Enter value';
  if (schema.example !== undefined) return String(schema.example);
  if (schema.default !== undefined) return String(schema.default);
  return schema.type === 'integer' || schema.type === 'number'
    ? '0'
    : schema.type === 'boolean'
      ? 'true'
      : 'Enter value';
};

const createBodyValue = (schema?: SchemaObject): string => {
  if (!schema) return '{}';

  const value = Object.fromEntries(
    Object.entries(schema.properties ?? {})
      .filter(([, property]) => !property.readOnly)
      .map(([key, property]) => [key, property.example ?? property.default ?? sampleValue(property)])
  );

  return JSON.stringify(schema.type === 'array' ? [sampleValue(schema.items)] : value, null, 2);
};

const sampleValue = (schema?: SchemaObject): unknown => {
  if (!schema) return '';
  if (schema.enum?.length) return schema.enum[0];
  if (schema.type === 'integer' || schema.type === 'number') return 0;
  if (schema.type === 'boolean') return false;
  if (schema.type === 'array') return [sampleValue(schema.items)];
  if (schema.type === 'object')
    return Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([key, property]) => [key, sampleValue(property)])
    );

  return '';
};
