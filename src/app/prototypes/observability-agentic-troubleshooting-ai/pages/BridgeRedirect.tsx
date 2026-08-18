/**
 * BridgeRedirect — retires alternate Agentic runs entry paths in favour of the
 * canonical sidebar URL. Substitutes route params and preserves/injects query
 * (`?perspective=`) in a single replace navigation.
 */
import React from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import {
  buildPrototypeHref,
  DEFAULT_PROTOTYPE_PERSPECTIVE,
  readPerspectiveFromSearch,
} from '../prototypePerspectiveUrl';

export const BridgeRedirect: React.FC<{ to: string }> = ({ to }) => {
  const params = useParams();
  const [searchParams] = useSearchParams();

  let target = to;
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      target = target.replace(`:${key}`, value);
    }
  });

  const merged = new URLSearchParams(searchParams);
  const perspective =
    readPerspectiveFromSearch(merged) ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
  const href = buildPrototypeHref(target, perspective, merged);

  return <Navigate to={href} replace />;
};
