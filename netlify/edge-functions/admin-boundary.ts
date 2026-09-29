// The HTML boundary complements API authorization; neither trusts browser roles.
export default async function (request: Request, context: { next: () => Promise<Response> }) {
  const url = new URL(request.url);
  const privateHeaders = {'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
  try {
    const check = await fetch(new URL('/api/staff/security?check=1', url.origin), {
      headers: {cookie:request.headers.get('cookie') || ''}, redirect:'error',
      signal:AbortSignal.timeout(12000),
    });
    if (check.ok && (await check.json()).ok === true) {
      const response = await context.next();
      for (const [name,value] of Object.entries(privateHeaders)) response.headers.set(name,value);
      for (const cookie of check.headers.getSetCookie()) response.headers.append('set-cookie',cookie);
      return response;
    }
    if (check.status >= 500 || check.status === 429) return new Response('Staff authorization is temporarily unavailable.',
      {status:503,headers:privateHeaders});
    const login = new URL('/staff/sign-in/',url.origin);
    login.searchParams.set('return',url.pathname+url.search);
    return new Response(null,{status:303,headers:{...privateHeaders,location:login.toString()}});
  } catch {
    return new Response('Staff authorization is temporarily unavailable.',{status:503,headers:privateHeaders});
  }
}
export const config = {path:['/admin','/admin/*']};
