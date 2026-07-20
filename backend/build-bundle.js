// backend/build-bundle.js
// Pre-compila o bundle JSX do frontend para JS puro usando esbuild.
// Roda automaticamente antes do servidor subir (chamado pelo server.js).
// Sem este passo, o navegador receberia JSX bruto e quebraria.
//
// Saida: frontend/dist/bundle.js (JS puro, sem type="text/babel", sem Babel no cliente)

const fs = require('node:fs');
const path = require('node:path');

const FRONTEND_JS_DIR = path.join(__dirname, '..', 'frontend', 'js');
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
const STAGE_FILE = path.join(DIST_DIR, '_stage.jsx');
const OUT_FILE = path.join(DIST_DIR, 'bundle.js');

// Ordem importa: api e auth (sem dependencias) primeiro, depois modais,
// views, busca, e por ultimo o app principal que orquestra tudo.
const FILES = [
  'datepicker.js',  // DateInput widget (carrega cedo pq e' usado em modals)
  'api.js',
  'auth.js',
  'modals.js',
  'ui.js',
  'busca.js',
  'app.js',
];

let _esbuild = null;
function loadEsbuild() {
  if (_esbuild) return _esbuild;
  try {
    _esbuild = require('esbuild');
    return _esbuild;
  } catch (err) {
    throw new Error(
      'esbuild nao esta instalado. Rode: npm install\nDetalhe: ' + err.message
    );
  }
}

function build() {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // 1) Concatena os arquivos em um _stage.jsx
  const header =
    '// frontend/dist/_stage.jsx (intermediario, nao commitado)\n' +
    '// Build gerado em ' + new Date().toISOString() + '\n' +
    '// Nao edite este arquivo. Edite os arquivos em frontend/js/.\n\n';

  const blocks = FILES.map(function (name) {
    const p = path.join(FRONTEND_JS_DIR, name);
    if (!fs.existsSync(p)) {
      throw new Error('Arquivo fonte ausente: ' + p);
    }
    return '// ===== ' + name + ' =====\n' +
      '(function(){\n' + fs.readFileSync(p, 'utf8') + '\n})();\n';
  });

  fs.writeFileSync(STAGE_FILE, header + blocks.join('\n'), 'utf8');

  // 2) Compila JSX -> JS puro com esbuild
  const esbuild = loadEsbuild();
  const result = esbuild.buildSync({
    entryPoints: [STAGE_FILE],
    outfile: OUT_FILE,
    bundle: false,
    format: 'iife',
    target: ['es2019'],
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    legalComments: 'none',
    logLevel: 'silent',
    write: true,
  });

  if (result.errors && result.errors.length) {
    const msgs = result.errors.map(function (e) { return e.text; }).join('\n');
    throw new Error('esbuild reportou erros:\n' + msgs);
  }

  // Limpa o arquivo intermediario
  try { fs.unlinkSync(STAGE_FILE); } catch (_) {}

  const size = fs.statSync(OUT_FILE).size;
  console.log(
    '[build-bundle] bundle.js gerado (' + (size / 1024).toFixed(1) + ' KB, esbuild JSX->JS)'
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
