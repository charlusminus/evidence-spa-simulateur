// robots.txt : fermé tant que le site est une maquette, ouvert (moteurs et moteurs génératifs nommés) à la mise en ligne.
import { absolu, EN_LIGNE } from '../lib/chemins';
export function GET() {
  const ia = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot'];
  const corps = EN_LIGNE
    ? `User-agent: *\nAllow: /\nDisallow: /simulateur/app/\n\n${ia.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}\n\nSitemap: ${absolu('/sitemap.xml')}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(corps, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
