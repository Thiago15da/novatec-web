import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const files = ['index.html', 'contacto.html', 'portafolio.html', 'software.html', 'hardware.html', 'web-para-constructoras.html'];
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

  const title = page.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = page.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && title.length <= 60, file + ' must have an informative title of up to 60 characters');
  assert.ok(description && description.length <= 160, file + ' must have a meta description of up to 160 characters');
  const structuredData = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  for (const match of page.matchAll(structuredData)) {
    const schema = JSON.parse(match[1]);
    const visit = (value) => {
      if (!value || typeof value !== 'object') return;
      if (value['@type'] === 'Organization') {
        assert.ok(value.logo, file + ' Organization schema should reference the NovaTec logo');
      }
      for (const nested of Object.values(value)) visit(nested);
    };
    visit(schema);
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
assert.match(quote, /sector_de_consulta/, 'Sector-specific leads should keep context');
assert.match(read('web-para-constructoras.html'), /Consultar por WhatsApp/, 'Construction landing must offer direct contact');
assert.match(read('js/main.js'), /NovaTecLeadAttribution/, 'Lead attribution helper missing');
console.log('All NovaTec static checks passed.');
