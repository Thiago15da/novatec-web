import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const files = ['index.html', 'contacto.html', 'portafolio.html', 'software.html', 'hardware.html', 'web-para-constructoras.html', 'desarrollo-web-empresas.html'];
const scriptFiles = ['js/main.js', 'js/cotizador.js', 'js/script.js'];
const read = (path) => readFileSync(path, 'utf8');

for (const file of scriptFiles) {
  new Script(read(file), { filename: file });
  console.log('✓ JavaScript:', file);
}
for (const file of files) {
  const page = read(file);
  assert.match(page, /<html\s+lang="es"/, file + ' must declare Spanish language');
  assert.match(page, /<meta\s+name="viewport"/, file + ' must have mobile viewport');
  assert.match(page, /<link\s+rel="canonical"/, file + ' must declare canonical URL');

  const structuredData = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  for (const match of page.matchAll(structuredData)) {
    JSON.parse(match[1]);
  }
  const inline = /<script(?![^>]*\bsrc=|[^>]*\btype="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;
  for (const match of page.matchAll(inline)) {
    if (match[1].trim()) new Script(match[1], { filename: file + ':inline' });
  }
  const links = /(?:src|href)="([^"]+)"/g;
  for (const match of page.matchAll(links)) {
    const url = match[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) continue;
    const localFile = url.split(/[?#]/)[0].replace(/^\.\//, '');
    if (localFile) assert.ok(existsSync(localFile), file + ' references missing local file: ' + localFile);
  }
  console.log('✓ HTML, structured data, local links:', file);
}
const home = read('index.html');
const contact = read('contacto.html');
const quote = read('js/cotizador.js');
assert.ok(!/data-count="(?:50|100|5)"/.test(home), 'Unverified home statistics remain');
assert.ok(!/USD|\$300 - \$12000/.test(quote), 'Outdated USD price calculator remains');
assert.match(home, /Constructoras y arquitectura/, 'Business sector positioning missing');
assert.match(contact, /id="quoter-body"/, 'B2B lead form placeholder missing');
assert.match(quote, /'s-dot'/, 'Quiz must use the existing CSS step classes');
assert.match(quote, /name="empresa" required/, 'Company qualification field is required');
assert.match(read('js/main.js'), /NovaTecLeadAttribution/, 'Lead attribution helper missing');
// Commercial SEO smoke tests: metadata, service schema and sector conversion paths.
for (const file of ['index.html','software.html','portafolio.html','contacto.html','hardware.html','web-para-constructoras.html','desarrollo-web-empresas.html']) {
  const html = read(file);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
  assert.ok(title.length > 20 && title.length <= 60, file + ': title should be descriptive and under 61 characters');
  assert.ok(description.length >= 90 && description.length <= 160, file + ': meta description should be useful and under 161 characters');
  assert.ok(!/recibí un estimado en minutos/i.test(html), file + ': obsolete instant quote claim');
}
for (const file of ['software.html','portafolio.html','contacto.html','hardware.html','web-para-constructoras.html','desarrollo-web-empresas.html']) {
  assert.match(read(file), /"logo"\s*:\s*\{/, file + ': organization logo schema missing');
}
const businessWeb = read('desarrollo-web-empresas.html');
assert.match(businessWeb, /<h1[^>]*>/, 'Business web landing needs a primary heading');
assert.ok(businessWeb.includes('contacto.html?servicio=web'), 'Business web leads must preselect the web service');
assert.ok(businessWeb.includes('rdconstrucciones.com.py'), 'Business landing must link to real work');
for (const file of ['rd-construcciones.png','caceres-alvarez.png','power-gym.png','gmi-uris.png']) {
  assert.ok(existsSync('img/portfolio/' + file), 'Portfolio screenshot missing: ' + file);
  assert.ok(businessWeb.includes('img/portfolio/' + file), 'Carousel screenshot not referenced: ' + file);
}
assert.match(businessWeb, /id="portfolio-slider-viewport"/, 'Accessible portfolio carousel viewport is required');
assert.match(businessWeb, /id="portfolio-next"/, 'Carousel next control is required');
assert.match(businessWeb, /id="portfolio-prev"/, 'Carousel previous control is required');
assert.match(home, /href="desarrollo-web-empresas.html"/, 'Home must link to the new business landing');
assert.match(read('portafolio.html'), /href="desarrollo-web-empresas.html"/, 'Portfolio must link to the new business landing');
assert.ok(read('sitemap.xml').includes('https://novatec.com.py/desarrollo-web-empresas.html'), 'Sitemap must include business web landing');
assert.match(read('software.html'), /href="web-para-constructoras.html"/, 'Software page must link to contractor service');
assert.match(read('portafolio.html'), /href="web-para-constructoras.html"/, 'Portfolio must link to contractor service');
assert.match(read('web-para-constructoras.html'), /Hablar por WhatsApp/, 'Construction landing must offer a direct contact option');
assert.match(read('web-para-constructoras.html'), /contacto\.html\?servicio=web&amp;sector=construccion/, 'Construction leads should preserve their sector in contact links');
assert.match(quote, /sector_de_consulta/, 'Lead wizard should include sector qualification');
assert.match(read('js/main.js'), /sector_de_consulta/, 'Quick contact form should include sector qualification');
assert.ok(!/menos de 24hs/.test(read('js/main.js')), 'Do not make unverified reply-time promises');
console.log('All NovaTec static checks passed.');
