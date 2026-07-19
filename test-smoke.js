// test-smoke.js — smoke test end-to-end do Basck Law v1.1.0
// Sobe o servidor em porta aleatoria, exercita os endpoints, encerra.
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const http = require('node:http');

const PORT = 20000 + Math.floor(Math.random() * 10000);
const DB = path.join(os.tmpdir(), 'basck-smoke-' + Date.now() + '.db');
process.env.PORT = String(PORT);
process.env.DB_PATH = DB;
process.env.JWT_SECRET = 'smoke-secret-12345';
process.env.NODE_ENV = 'test';

console.log('[smoke] PORT=' + PORT + ' DB=' + DB);

const server = spawn(process.execPath, ['backend/server.js'], {
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; process.stdout.write('[srv] ' + d); });
server.stderr.on('data', (d) => { serverLog += d; process.stderr.write('[srvE] ' + d); });

function request(method, urlPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1', port: PORT, path: urlPath, method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let buf = '';
      res.on('data', (c) => buf += c);
      res.on('end', () => {
        let parsed;
        try { parsed = buf ? JSON.parse(buf) : null; } catch (_) { parsed = buf; }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function esperar() {
  for (let i = 0; i < 50; i++) {
    try { const r = await request('GET', '/api/saude'); if (r.status === 200) return r.body; } catch (_) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('servidor nao subiu');
}

let total = 0, ok = 0, falhas = [];
function check(nome, cond, extra) {
  total++;
  if (cond) { ok++; console.log('  ✓ ' + nome); }
  else { falhas.push(nome + ' ' + (extra || '')); console.log('  ✗ ' + nome + ' ' + (extra || '')); }
}

(async () => {
  try {
    const saude = await esperar();
    check('GET /api/saude', saude && saude.ok && saude.versao === '1.1.0', JSON.stringify(saude));

    // Cadastro
    const email = 'adv_' + Date.now() + '@basck.law';
    const c1 = await request('POST', '/api/auth/cadastro', { nome: 'Dr. Smoke Test', email, senha: 'Senha@123', oab: 'OAB/SP 000000' });
    check('POST /api/auth/cadastro 201', c1.status === 201 && c1.body && c1.body.token);
    const token = c1.body.token;

    // Login
    const l1 = await request('POST', '/api/auth/login', { email, senha: 'Senha@123' });
    check('POST /api/auth/login 200', l1.status === 200 && l1.body.token);

    // Cliente
    const cli = await request('POST', '/api/clientes', { nome: 'Cliente Teste', documento: '123.456.789-00', email: 'cliente@x.com' }, token);
    check('POST /api/clientes 201', cli.status === 201);
    const clienteId = cli.body.cliente.id;

    // Caso
    const caso = await request('POST', '/api/casos', { cliente_id: clienteId, titulo: 'Caso XYZ', area: 'Cível', numero_processo: '0001234-56.2026.8.26.0001' }, token);
    check('POST /api/casos 201', caso.status === 201);
    const casoId = caso.body.caso.id;

    // NOVO: calculo de prazo
    const calc = await request('POST', '/api/prazos/calcular', { dataInicio: '2026-07-13', dias: 5, tipo: 'uteis' }, token);
    check('POST /api/prazos/calcular 200', calc.status === 200 && calc.body.resultado && calc.body.resultado.dataFinal === '2026-07-20', JSON.stringify(calc.body.resultado));

    // NOVO: calculo + salvar
    const calcSalvar = await request('POST', '/api/prazos/calcular', { dataInicio: '2026-07-13', dias: 10, tipo: 'uteis', salvar: true, caso_id: casoId, titulo: 'Prazo teste' }, token);
    check('POST /api/prazos/calcular+salvar 200', calcSalvar.status === 200 && calcSalvar.body.prazo && calcSalvar.body.prazo.calculo_detalhes);
    const prazoId = calcSalvar.body.prazo.id;

    // Listar prazos
    const prazos = await request('GET', '/api/prazos', null, token);
    check('GET /api/prazos', prazos.status === 200 && Array.isArray(prazos.body.itens) && prazos.body.itens.length >= 1);

    // NOVO: busca
    const busca = await request('GET', '/api/busca?q=Cliente', null, token);
    check('GET /api/busca?q=Cliente', busca.status === 200 && busca.body.grupos.clientes.length >= 1, 'total=' + busca.body.total);
    const busca2 = await request('GET', '/api/busca?q=Caso', null, token);
    check('GET /api/busca?q=Caso', busca2.status === 200 && busca2.body.grupos.casos.length >= 1);

    // Lançamento financeiro
    const fin = await request('POST', '/api/financeiro', { tipo: 'honorario', descricao: 'Honorários iniciais', valor: 1500, data_vencimento: '2026-08-01' }, token);
    check('POST /api/financeiro 201', fin.status === 201);
    const resumo = await request('GET', '/api/financeiro/resumo', null, token);
    check('GET /api/financeiro/resumo', resumo.status === 200 && Number(resumo.body.recebido) >= 0, JSON.stringify(resumo.body));

    // NOVO: rate limit login (6 tentativas rapidas, 6a deve dar 429)
    let bloqueou = false;
    for (let i = 0; i < 7; i++) {
      const r = await request('POST', '/api/auth/login', { email, senha: 'Errada' + i });
      if (r.status === 429) { bloqueou = true; break; }
    }
    check('rate limit login (429 apos 5 tentativas)', bloqueou);

    // Tarefa
    const tar = await request('POST', '/api/tarefas', { titulo: 'Revisar docs', caso_id: casoId }, token);
    check('POST /api/tarefas 201', tar.status === 201);

    // Concluir prazo
    const conc = await request('POST', '/api/prazos/' + prazoId + '/concluir', null, token);
    check('POST /api/prazos/:id/concluir', conc.status === 200 && conc.body.prazo.status === 'concluido');

    // Resumo final
    console.log('\n=== ' + ok + '/' + total + ' testes passaram ===');
    if (falhas.length) {
      console.log('FALHAS:');
      for (const f of falhas) console.log('  - ' + f);
    }
    server.kill('SIGTERM');
    try { fs.unlinkSync(DB); } catch (_) {}
    setTimeout(() => process.exit(falhas.length > 0 ? 1 : 0), 500);
  } catch (err) {
    console.error('FATAL:', err);
    server.kill('SIGTERM');
    process.exit(1);
  }
})();
