import handlers from '../scanner-api/_common/registry.js';

export default async function sentinelApi(request, response) {
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', process.env.API_CORS_ORIGIN || '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return response.status(204).end();
  }

  const routeParam = request.query?.route;
  const route = Array.isArray(routeParam) ? routeParam.join('/') : routeParam;
  const handler = handlers[route];

  if (!handler) {
    return response.status(404).json({ error: `Unknown Sentinel check: ${route || 'missing'}` });
  }

  // Keep the same request contract that each upstream middleware-wrapped handler already uses.
  const { route: _route, ...query } = request.query || {};
  request.query = query;
  return handler(request, response);
}
