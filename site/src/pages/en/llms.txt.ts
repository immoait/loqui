import type { APIRoute } from 'astro';
import { llms } from '../../lib/llms';
export const GET: APIRoute = () => llms('en');
