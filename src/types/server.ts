import type { NextApiRequest, NextApiResponse } from 'next';

export interface ServerRequest extends NextApiRequest {
  cookies: { [key: string]: string };
}

export interface ServerResponse extends NextApiResponse {}
