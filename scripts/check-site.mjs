import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const pages = [
  'index.html', 'contacto.html', 'portafolio.html', 'software.html',
  'web-para-constructoras.html', 'desarrollo-web-empresas.html'
];
const scriptFiles = ['js/main.js', 'js/cotizador.js', 'js/script.js', 'js/cinematic.js'];
const read = (path) => readFileSync(path, 'utf8');

for (const file of scriptFiles) {
  new Script(read(file), { filename: file });
  console.log('✓ JavaScript:', file);
}

for (const file of pages) {
  const html = read(file);
  assert.match(html, /<html\s+lang="es(?:-[a-zA-Z]+)?"/, file + ': Spanish document language');
  assert.match(html, /<meta\s+name="viewport"/, file + ': mobile viewport');
  assert.match(html, /<link\s+rel="canonical"/, file + ': canonical URL');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, file + ': exactly one H1');
  assert.match(html, /novatec-horizontal\.svg/, file + ': NovaTec brand asset');

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
  assert.ok(title.length > 20 && title.length <= 60, file + ': descriptive SEO title (up to 60 characters)');
  assert.ok(description.length >= 90 && description.length <= 160, file + ': meta description (90–160 characters)');

  // This company no longer markets repair or physical hardware services.
  assert.ok(!/hardware\.html|servicio t[eé]cnico|hardware corporativo|reparaci[oó]n de equipos/i.test(html),
    file + ': outdated physical-service offer remains');
  assert.ok(!/recibí un estimado en minutos/i.test(html), file + ': obsolete instant estimate promise');

  const structuredData = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  for (const match of html.matchAll(structuredData)) JSON.parse(match[1]);

  const inline = /<script(?![^>]*\bsrc=|[^>]*\btype="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;
  for (const match of html.matchAll(inline)) if (match[1].trim()) new Script(match[1], { filename: file + ':inline' });

  const links = /(?:src|href)="([^"]+)"/g;
  for (const match of html.matchAll(links)) {
    const url = match[1];
    if (/^(https?:|mailto:|tel:|#|data:|\/)/.test(url)) continue;
    const localFile = url.split(/[?#]/)[0].replace(/^\.\//, '');
    if (localFile) assert.ok(existsSync(localFile), file + ': missing local file ' + localFile);
  }
  if (file === 'index.html') {
    assert.match(html, /home-corporate\.css/, 'Home corporate stylesheet missing');
    assert.match(html, /cinematic-home\.css/, 'Home cinematic stylesheet missing');
  } else {
    assert.match(html, /corporate-v2\.css/, file + ': corporate stylesheet missing');
    assert.match(html, /cinematic-inner\.css/, file + ': cinematic stylesheet missing');
  }
  console.log('✓ SEO, HTML, schema, JS, links:', file);
}

const home = read('index.html');
const contact = read('contacto.html');
const quote = read('js/cotizador.js');
const businessWeb = read('desarrollo-web-empresas.html');
const sitemap = read('sitemap.xml');
const retired = read('hardware.html');

assert.match(home, /constructoras/i, 'Business sector positioning missing');
assert.match(home, /href="desarrollo-web-empresas\.html"/, 'Home business web link missing');
assert.match(home, /href="software\.html"/, 'Home software link missing');
assert.match(home, /href="web-para-constructoras\.html"/, 'Home construction sector link missing');
assert.ok(!/data-count="(?:50|100|5)"/.test(home), 'Unverified home statistics remain');
assert.match(home, /sistemas a medida/i, 'Software specialization missing');
assert.match(home, /class="hero hero-cinema"/, 'Cinematic hero missing');
assert.match(home, /class="showcase-stack"/, 'Editorial projects showcase missing');
assert.match(home, /img\/portfolio\/rd-construcciones\.png/, 'Real portfolio screenshot missing from home');
for (const page of pages) assert.match(read(page), /js\/cinematic\.js/, page + ': cinematic controller missing');
assert.match(read('js/cinematic.js'), /prefers-reduced-motion/, 'Reduced motion accessibility support missing');
assert.match(read('js/cinematic.js'), /IntersectionObserver/, 'Scroll reveal fallback missing');
assert.match(contact, /id="quoter-body"/, 'B2B lead form placeholder missing');
assert.ok(!/value="(?:hardware|tecnico)"/.test(contact), 'Retired contact form categories remain');
assert.match(quote, /'s-dot'/, 'Quotation flow needs the existing CSS steps');
assert.match(quote, /name="empresa" required/, 'Quotation flow should qualify company');
assert.match(quote, /sector_de_consulta/, 'Quotation flow should qualify sector');
assert.ok(!/USD|\$300 - \$12000/.test(quote), 'Outdated USD price calculator remains');
assert.match(read('js/main.js'), /NovaTecLeadAttribution/, 'Lead attribution helper missing');
assert.match(read('js/main.js'), /sector_de_consulta/, 'Quick contact sector qualification missing');
assert.ok(!/menos de 24hs/.test(read('js/main.js')), 'Unverified reply time promise');

for (const f of ['software.html','portafolio.html','contacto.html','web-para-constructoras.html','desarrollo-web-empresas.html']) {
  assert.match(read(f), /"logo"\s*:\s*\{/, f + ': organization logo schema missing');
}
assert.ok(businessWeb.includes('contacto.html?servicio=web'), 'Business landing web lead tracking missing');
assert.ok(businessWeb.includes('rdconstrucciones.com.py'), 'Business landing projects must link to actual work');
for (const img of ['rd-construcciones.png','caceres-alvarez.png','power-gym.png','gmi-uris.png']) {
  assert.ok(existsSync('img/portfolio/' + img), 'Missing project screenshot: ' + img);
  assert.ok(businessWeb.includes('img/portfolio/' + img), 'Carousel missing screenshot: ' + img);
}
assert.match(businessWeb, /id="portfolio-slider-viewport"/, 'Accessible portfolio carousel missing');
assert.match(businessWeb, /id="portfolio-next"/, 'Carousel next button missing');
assert.match(businessWeb, /id="portfolio-prev"/, 'Carousel previous button missing');
assert.match(read('portafolio.html'), /href="web-para-constructoras\.html"/, 'Portfolio constructoras link missing');
assert.match(read('software.html'), /href="web-para-constructoras\.html"/, 'Software constructoras link missing');
assert.match(read('web-para-constructoras.html'), /Hablar por WhatsApp/, 'Construction direct contact missing');
assert.match(read('web-para-constructoras.html'), /contacto\.html\?servicio=web&amp;sector=construccion/, 'Construction sector attribution missing');
assert.ok(sitemap.includes('https://novatec.com.py/desarrollo-web-empresas.html'), 'Sitemap missing business landing');
assert.ok(!sitemap.includes('hardware.html'), 'Sitemap includes retired physical hardware page');
assert.match(retired, /name="robots" content="noindex/, 'Retired URL must be noindex');
assert.match(retired, /http-equiv="refresh"/, 'Retired URL should redirect to current software service');

console.log('All NovaTec static checks passed.');
