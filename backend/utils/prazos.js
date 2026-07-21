// backend/utils/prazos.js
// Cálculo de prazos processuais em dias úteis/corridos, conforme CPC art. 219.

const FERIADOS_NACIONAIS = [
  { dia: 1, mes: 1, nome: 'Confraternização Universal' },
  { dia: 21, mes: 4, nome: 'Tiradentes' },
  { dia: 1, mes: 5, nome: 'Dia do Trabalho' },
  { dia: 7, mes: 9, nome: 'Independência' },
  { dia: 12, mes: 10, nome: 'N. Sra. Aparecida' },
  { dia: 2, mes: 11, nome: 'Finados' },
  { dia: 15, mes: 11, nome: 'Proclamação da República' },
  { dia: 25, mes: 12, nome: 'Natal' }
];

function pascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function adicionarDias(data, dias) {
  const d = new Date(data.getTime());
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

function fmtIsoUTC(d) {
  return d.toISOString().slice(0, 10);
}

function isoValido(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function montarFeriados(ano, extras = []) {
  const out = new Map();
  for (const f of FERIADOS_NACIONAIS) {
    out.set(`${ano}-${String(f.mes).padStart(2, '0')}-${String(f.dia).padStart(2, '0')}`, f.nome);
  }
  const p = pascoa(ano);
  const sexSanta = adicionarDias(p, -2);
  const carnaval = adicionarDias(p, -47);
  const corpusChristi = adicionarDias(p, 60);
  for (const d of [carnaval, sexSanta, p, corpusChristi]) {
    let nome;
    if (d.getTime() === p.getTime()) nome = 'Pascoa';
    else if (d.getTime() === sexSanta.getTime()) nome = 'Sexta-feira Santa';
    else if (d.getTime() === carnaval.getTime()) nome = 'Carnaval';
    else nome = 'Corpus Christi';
    out.set(fmtIsoUTC(d), nome);
  }
  for (const e of extras) {
    if (isoValido(e)) out.set(e, 'Recesso/feriado local');
  }
  return out;
}

function ehFimDeSemana(d) {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

const DIAS_SEMANA_NOMES = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado'];
function diaSemana(d) { return DIAS_SEMANA_NOMES[d.getUTCDay()]; }

function calcularPrazo({ dataInicio, dias, tipo = 'uteis', feriadosExtras = [] } = {}) {
  if (!isoValido(dataInicio)) {
    const e = new Error('dataInicio invalida (use YYYY-MM-DD)');
    e.status = 400; throw e;
  }
  const n = Number(dias);
  if (!Number.isInteger(n) || n < 1 || n > 3650) {
    const e = new Error('dias deve ser inteiro entre 1 e 3650');
    e.status = 400; throw e;
  }
  if (tipo !== 'uteis' && tipo !== 'corridos') {
    const e = new Error('tipo deve ser "uteis" ou "corridos"');
    e.status = 400; throw e;
  }

  const inicio = new Date(dataInicio + 'T00:00:00Z');
  const passos = [];
  passos.push({ passo: 1, descricao: 'Inicio: ' + dataInicio + ' (' + diaSemana(inicio) + ')' });

  if (tipo === 'corridos') {
    const fim = adicionarDias(inicio, n);
    passos.push({ passo: 2, descricao: 'Soma de ' + n + ' dias corridos' });
    passos.push({ passo: 3, descricao: 'Data final: ' + fmtIsoUTC(fim) + ' (' + diaSemana(fim) + ')' });
    return {
      dataFinal: fmtIsoUTC(fim),
      totalDias: n,
      diasUteis: contarUteis(inicio, fim),
      diasCorridos: n,
      passos,
      regra: 'CPC art. 219 — contagem em dias corridos',
      tipo: 'corridos'
    };
  }

  const feriados = new Map();
  const anoInicio = inicio.getUTCFullYear();
  for (let a = anoInicio; a <= anoInicio + 2; a++) {
    const f = montarFeriados(a, feriadosExtras);
    for (const [k, v] of f) feriados.set(k, v);
  }

  const diasContados = [];
  let cursor = adicionarDias(inicio, 1);
  let i = 0;
  while (diasContados.length < n) {
    const iso = fmtIsoUTC(cursor);
    const fds = ehFimDeSemana(cursor);
    const feriado = feriados.get(iso);
    if (!fds && !feriado) {
      diasContados.push({ data: iso, dia: diaSemana(cursor) });
    }
    cursor = adicionarDias(cursor, 1);
    i++;
    if (i > n * 5 + 30) break;
  }
  const dataFinal = diasContados[diasContados.length - 1].data;
  const final = new Date(dataFinal + 'T00:00:00Z');

  passos.push({ passo: 2, descricao: 'CPC art. 219: o dia do inicio nao se conta; conta-se a partir do 1o dia util subsequente' });
  passos.push({ passo: 3, descricao: 'Iterando dias corridos, pulando fim de semana e feriados' });
  passos.push({ passo: 4, descricao: 'Dias contados: ' + diasContados.length + '/' + n });
  passos.push({ passo: 5, descricao: 'Dias pulados: ' + (i - diasContados.length) + ' (fins de semana e/ou feriados)' });
  passos.push({ passo: 6, descricao: 'Data final: ' + dataFinal + ' (' + diaSemana(final) + ')' });

  return {
    dataFinal,
    totalDias: n,
    diasUteis: diasContados.length,
    diasCorridos: i,
    passos,
    regra: 'CPC art. 219 — contagem em dias uteis (exclui sabados, domingos e feriados)',
    tipo: 'uteis',
    diasContados
  };
}

function contarUteis(inicio, fim) {
  let c = 0;
  const cur = new Date(inicio.getTime());
  while (cur <= fim) {
    if (!ehFimDeSemana(cur)) c++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return c;
}

module.exports = { calcularPrazo, FERIADOS_NACIONAIS, montarFeriados, diaSemana };
