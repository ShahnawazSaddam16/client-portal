import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;

async function proxyRequest(request, { params }) {
  const { path } = await params;
  const targetUrl = `${API_ORIGIN}/${path.join('/')}`;

  // Read the client_token from the portal-domain cookie jar (server-side)
  const cookieStore = await cookies();
  const clientToken = cookieStore.get('client_token');

  // Forward original headers, inject the cookie for the backend
  const forwardHeaders = new Headers();
  forwardHeaders.set('Content-Type', 'application/json');
  if (clientToken?.value) {
    forwardHeaders.set('Cookie', `client_token=${clientToken.value}`);
  }

  const options = {
    method: request.method,
    headers: forwardHeaders,
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    try {
      const body = await request.text();
      if (body) options.body = body;
    } catch {
      // no body
    }
  }

  let res;
  try {
    res = await fetch(targetUrl, options);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Backend unreachable' },
      { status: 502 }
    );
  }

  // Parse response body
  const contentType = res.headers.get('content-type') || '';
  let data;
  try {
    data = contentType.includes('application/json')
      ? await res.json()
      : await res.text();
  } catch {
    data = { success: false, message: 'Invalid backend response' };
  }

  const response = NextResponse.json(data, { status: res.status });

  // Forward any Set-Cookie headers from the backend back to the browser
  // This handles login (setting cookie) and logout (clearing cookie)
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      response.headers.append('Set-Cookie', value);
    }
  });

  return response;
}

export const GET    = proxyRequest;
export const POST   = proxyRequest;
export const PUT    = proxyRequest;
export const PATCH  = proxyRequest;
export const DELETE = proxyRequest;
