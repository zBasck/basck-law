// backend/build-bundle.js
// Concatena os 6 arquivos JSX do frontend em um único bundle
// que o Babel-standalone compila no navegador.
// Chamado automaticamente pelo server.js antes de subir o HTTP.

const fs = require('fs');
const path = require('path');

const FRONTEND_JS_DIR = path.join(__dirname, '..', 'frontend', 'js');
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
const OUT_FILE = path.join(DIST_DIR, 'bundle.jsx');

// Ordem importa: api e auth (sem dependencias) primeiro, depois modais e
// views, e por ultimo o app principal que orquestra tudo.
const FILES = [
  'api.js',
  'auth.js',
  'modals.js',
  'ui.js',
  'busca.js',
  'app.js',
];

function build() {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const header =
    '// frontend/dist/bundle.jsx\n' +
    '// Build gerado automaticamente por backend/build-bundle.js em ' +
    new Date().toISOString() + '\n' +
    '// Nao edite este arquivo diretamente. Edite os arquivos em frontend/js/.\n\n';

  const blocks = FILES.map((name) => {
    const p = path.join(FRONTEND_JS_DIR, name);
    if (!fs.existsSync(p)) {
      throw new Error('Arquivo fonte ausente: ' + p);
    }
    return '// ===== ' + name + ' =====\n' + fs.readFileSync(p, 'utf8') + '\n';
  });

  fs.writeFileSync(OUT_FILE, header + blocks.join('\n'), 'utf8');

  const size = fs.statSync(OUT_FILE).size;
  console.log(
    '[build-bundle] ' +
      FILES.length +
      ' arquivos concatenados em frontend/dist/bundle.jsx (' +
      (size / 1024).toFixed(1) +
      ' KB)'
  );
}

module.exports = { build, OUT_FILE };

// Permite rodar como script: node backend/build-bundle.js
if (require.main === module) {
  try {
    build();
    process.exit(0);
  } catch (err) {
    console.error('[build-bundle] Falha:', err.message);
    process.exit(1);
  }
}
