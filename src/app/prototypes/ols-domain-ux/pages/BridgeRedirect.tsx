/**
 * BridgeRedirect — retires the legacy, non-versioned "/core/observe/ai-hub/*"
 * and "/core/observe/troubleshooting-plans*" paths now that the v2 (Option A)
 * workspace is the single supported Agentic runs experience.
 *
 * `to` may reference route params via `:paramName` tokens, which are
 * substituted from the current route match. The original query string
 * (e.g. `?perspective=...`) is preserved on the redirect.
 */
import React from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

export const BridgeRedirect: React.FC<{ to: string }> = ({ to }) => {
  const params = useParams();
  const [searchParams] = useSearchParams();

  let target = to;
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      target = target.replace(`:${key}`, value);
    }
  });

  const query = searchParams.toString();
  return <Navigate to={query ? `${target}?${query}` : target} replace />;
};
