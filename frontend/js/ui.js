// frontend/js/ui.js
// Views do Basck Law (Dashboard, Casos, Prazos, Tarefas, Financeiro, Clientes, Documentos, Config)
(function (global) {
  const { useState, useEffect, useMemo } = React;
  const M = window.BasckModals;

  function fmtData(s) {
    if (!s) return '—';
    const iso = String(s).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return s;
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  function fmtMoeda(n) {
    const v = Number(n || 0);
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function fmtBytes(b) {
    if (!b) return '0 B';
    const u = ['B', 'KB', 'MB', 'GB'];
    let i = 0; let n = b;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
  }
  function diasAte(s) {
    if (!s) return null;
    const d = new Date(String(s).slice(0, 10) + 'T00:00:00');
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return Math.round((d - hoje) / 86400000);
  }
  function statusBadge(prazo) {
    if (prazo.status === 'concluido') return <span className="badge ok">Concluído</span>;
    if (prazo.status === 'cancelado') return <span className="badge muted">Cancelado</span>;
    const d = diasAte(prazo.data_vencimento);
    if (d == null) return <span className="badge muted">Sem data</span>;
    if (d < 0) return <span className="badge danger">Atrasado {Math.abs(d)}d</span>;
    if (d === 0) return <span className="badge danger">Hoje</span>;
    if (d <= 3) return <span className="badge danger">{d}d restantes</span>;
    if (d <= 7) return <span className="badge warn">{d}d restantes</span>;
    return <span className="badge info">{d}d restantes</span>;
  }
  function ehCritico(p) {
    if (!p) return false;
    if (p.status !== 'pendente') return false;
    const d = diasAte(p.data_vencimento);
    return d != null && d <= 3;
  }
  function prioridadeBadge(p) {
    const map = { baixa: 'muted', normal: 'info', alta: 'warn', urgente: 'danger' };
    return <span className={`badge ${map[p] || 'muted'}`}>{p || 'normal'}</span>;
  }
  function casoStatusBadge(s) {
    const map = { em_andamento: 'info', concluido: 'ok', suspenso: 'warn', arquivado: 'muted' };
    const label = { em_andamento: 'Em andamento', concluido: 'Concluído', suspenso: 'Suspenso', arquivado: 'Arquivado' };
    return <span className={`badge ${map[s] || 'muted'}`}>{label[s] || s}</span>;
  }
  function finStatusBadge(s) {
    const map = { pendente: 'warn', pago: 'ok', cancelado: 'muted' };
    return <span className={`badge ${map[s] || 'muted'}`}>{s}</span>;
  }
  function Empty({ texto = 'Nada por aqui ainda', acao = null }) {
    return (
      <div className="empty">
        <div className="ico">∅</div>
        <div>{texto}</div>
        {acao && <div className="mt-4">{acao}</div>}
      </div>
    );
  }
  function Loading() {
    return <div className="loading"><div className="spinner" />Carregando...</div>;
  }

  // ============ DASHBOARD ============
  function DashboardView({ irPara, toast }) {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    useEffect(() => {
      Promise.all([
        BasckApi.casos.estatisticas(),
        BasckApi.prazos.proximos(30),
        BasckApi.financeiro.resumo(),
        BasckApi.casos.listar()
      ]).then(([stats, prazos, fin, casos]) => {
        setDados({ stats, prazos: prazos.itens || [], fin, casos: casos.itens || [] });
      }).catch((e) => toast(e.message, 'error'))
        .finally(() => setCarregando(false));
    }, []);

    if (carregando) return <Loading />;
    if (!dados) return <Empty texto="Sem dados" />;

    const { stats, prazos, fin, casos } = dados;
    const atrasados = prazos.filter((p) => p.status === 'pendente' && diasAte(p.data_vencimento) < 0);
    const hoje = prazos.filter((p) => p.status === 'pendente' && diasAte(p.data_vencimento) === 0);
    const proximos = prazos.filter((p) => p.status === 'pendente' && diasAte(p.data_vencimento) > 0).slice(0, 6);

    return (
      <div>
        <div className="grid grid-4 mb-4">
          <div className="card kpi">
            <div className="label">Casos ativos</div>
            <div className="value">{stats.em_andamento}</div>
            <div className="muted tiny">{stats.total} no total</div>
          </div>
          <div className="card kpi">
            <div className="label">Prazos críticos</div>
            <div className="value">{atrasados.length + hoje.length}</div>
            <div className="muted tiny">{atrasados.length} atrasados · {hoje.length} hoje</div>
          </div>
          <div className="card kpi">
            <div className="label">Recebido</div>
            <div className="value gold">{fmtMoeda(fin.recebido)}</div>
            <div className="muted tiny">de honorários e despesas</div>
          </div>
          <div className="card kpi">
            <div className="label">Pendente</div>
            <div className="value">{fmtMoeda(fin.pendente)}</div>
            <div className="muted tiny">{fin.atrasados.quantidade} atrasado(s)</div>
          </div>
        </div>

        <div className="grid grid-2 mb-4">
          <div className="card">
            <h3>Prazos críticos</h3>
            <div className="sub">Vencendo nos próximos 30 dias</div>
            {prazos.length === 0 ? <Empty texto="Nenhum prazo pendente" /> : (
              <table className="table">
                <thead><tr><th>Prazo</th><th>Tipo</th><th>Vence</th><th>Status</th></tr></thead>
                <tbody>
                  {prazos.slice(0, 8).map((p) => (
                    <tr key={p.id} className={'prazo-item' + (ehCritico(p) ? ' critico' : '')}>
                      <td><div style={{ fontWeight: 500 }}>{p.titulo}</div><div className="tiny">{p.caso_titulo || '—'}</div></td>
                      <td className="muted tiny">{p.tipo_dias}</td>
                      <td className="muted tiny">{fmtData(p.data_vencimento)}</td>
                      <td>{statusBadge(p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-2">
              <button className="btn sm" onClick={() => irPara('prazos')}>Ver todos</button>
            </div>
          </div>

          <div className="card">
            <h3>Casos recentes</h3>
            <div className="sub">Últimos casos atualizados</div>
            {casos.length === 0 ? <Empty texto="Nenhum caso cadastrado" acao={<button className="btn primary" onClick={() => irPara('casos')}>Cadastrar primeiro caso</button>} /> : (
              <table className="table">
                <thead><tr><th>Caso</th><th>Cliente</th><th>Status</th></tr></thead>
                <tbody>
                  {casos.slice(0, 6).map((c) => (
                    <tr key={c.id}>
                      <td><div style={{ fontWeight: 500 }}>{c.titulo}</div><div className="tiny">{c.area || '—'}</div></td>
                      <td className="muted tiny">{c.cliente_nome || '—'}</td>
                      <td>{casoStatusBadge(c.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ CASOS ============
  function CasosView({ toast }) {
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');
    const [statusFiltro, setStatusFiltro] = useState('');
    const [modal, setModal] = useState(null);
    const [detalhe, setDetalhe] = useState(null);

    function carregar() {
      setCarregando(true);
      BasckApi.casos.listar({ status: statusFiltro || null, q: busca || null })
        .then((r) => setItens(r.itens || []))
        .catch((e) => toast(e.message, 'error'))
        .finally(() => setCarregando(false));
    }
    useEffect(carregar, [statusFiltro, busca]);

    function salvar(caso) {
      setModal(null);
      toast(caso.id ? 'Caso atualizado' : 'Caso criado', 'success');
      carregar();
    }
    async function remover(c) {
      if (!confirm(`Remover o caso "${c.titulo}"?`)) return;
      try {
        await BasckApi.casos.remover(c.id);
        toast('Caso removido', 'success');
        carregar();
      } catch (e) { toast(e.message, 'error'); }
    }

    return (
      <div>
        <div className="card mb-4">
          <div className="flex between center gap-3">
            <div className="flex gap-2" style={{ flex: 1 }}>
              <input placeholder="Buscar por título ou número..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 6, color: 'var(--ink)' }} />
              <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 6, color: 'var(--ink)' }}>
                <option value="">Todos status</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
                <option value="suspenso">Suspenso</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>
            <button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>+ Novo caso</button>
          </div>
        </div>

        <div className="card">
          <h3>Seus casos</h3>
          <div className="sub">{itens.length} caso(s) encontrado(s)</div>
          {carregando ? <Loading /> :
            itens.length === 0 ? <Empty texto="Nenhum caso cadastrado" acao={<button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>Cadastrar caso</button>} /> : (
              <table className="table">
                <thead><tr><th>Título</th><th>Cliente</th><th>Área</th><th>Nº processo</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {itens.map((c) => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setDetalhe(c)}>
                      <td><div style={{ fontWeight: 500 }}>{c.titulo}</div><div className="tiny">{c.tribunal || '—'}</div></td>
                      <td className="muted">{c.cliente_nome || '—'}</td>
                      <td className="muted">{c.area || '—'}</td>
                      <td className="tiny muted">{c.numero_processo || '—'}</td>
                      <td>{casoStatusBadge(c.status)}</td>
                      <td className="actions" onClick={(e) => e.stopPropagation()}>
                        <button className="btn sm" onClick={() => setModal({ tipo: 'editar', caso: c })}>Editar</button>
                        <button className="btn sm danger" onClick={() => remover(c)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {modal && (
          <M.Modal titulo={modal.tipo === 'editar' ? 'Editar caso' : 'Novo caso'} onClose={() => setModal(null)}>
            <M.CasoForm inicial={modal.caso} onSalvar={salvar} onCancelar={() => setModal(null)} />
          </M.Modal>
        )}
      </div>
    );
  }

  // ============ PRAZOS ============
  function PrazosView({ toast }) {
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [statusFiltro, setStatusFiltro] = useState('pendente');
    const [modal, setModal] = useState(null);

    function carregar() {
      setCarregando(true);
      BasckApi.prazos.listar({ status: statusFiltro || null })
        .then((r) => setItens(r.itens || []))
        .catch((e) => toast(e.message, 'error'))
        .finally(() => setCarregando(false));
    }
    useEffect(carregar, [statusFiltro]);

    async function toggle(p) {
      try {
        if (p.status === 'pendente') await BasckApi.prazos.concluir(p.id);
        else await BasckApi.prazos.reabrir(p.id);
        toast('Atualizado', 'success');
        carregar();
      } catch (e) { toast(e.message, 'error'); }
    }
    async function remover(p) {
      if (!confirm(`Remover prazo "${p.titulo}"?`)) return;
      try { await BasckApi.prazos.remover(p.id); carregar(); toast('Removido', 'success'); }
      catch (e) { toast(e.message, 'error'); }
    }

    return (
      <div>
        <div className="card mb-4">
          <div className="flex between center">
            <div className="flex gap-2">
              {[{ v: 'pendente', l: 'Pendentes' }, { v: 'concluido', l: 'Concluídos' }, { v: '', l: 'Todos' }].map((o) => (
                <button key={o.v} className={'btn ' + (statusFiltro === o.v ? 'primary' : '')} onClick={() => setStatusFiltro(o.v)}>{o.l}</button>
              ))}
            </div>
            <button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>+ Novo prazo</button>
          </div>
        </div>

        <div className="card">
          <h3>Prazos</h3>
          <div className="sub">{itens.length} prazo(s)</div>
          {carregando ? <Loading /> :
            itens.length === 0 ? <Empty texto="Nenhum prazo" acao={<button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>Cadastrar prazo</button>} /> : (
              <table className="table">
                <thead><tr><th>Prazo</th><th>Caso</th><th>Tipo</th><th>Início</th><th>Vencimento</th><th>Prioridade</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {itens.map((p) => (
                    <tr key={p.id} className={'prazo-item' + (ehCritico(p) ? ' critico' : '')}>
                      <td style={{ fontWeight: 500 }}>{p.titulo}</td>
                      <td className="muted tiny">{p.caso_titulo || '—'}</td>
                      <td className="muted tiny">{p.tipo_dias}</td>
                      <td className="muted tiny">{fmtData(p.data_inicio)}</td>
                      <td className="muted tiny">{fmtData(p.data_vencimento)}</td>
                      <td>{prioridadeBadge(p.prioridade)}</td>
                      <td>{statusBadge(p)}</td>
                      <td className="actions">
                        <button className="btn sm" onClick={() => toggle(p)}>{p.status === 'pendente' ? 'Concluir' : 'Reabrir'}</button>
                        <button className="btn sm danger" onClick={() => remover(p)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {modal && (
          <M.Modal titulo={modal.tipo === 'editar' ? 'Editar prazo' : 'Novo prazo'} onClose={() => setModal(null)}>
            <M.PrazoForm inicial={modal.prazo} onSalvar={(p) => { setModal(null); toast('Salvo', 'success'); carregar(); }} onCancelar={() => setModal(null)} />
          </M.Modal>
        )}
      </div>
    );
  }

  // ============ TAREFAS ============
  function TarefasView({ toast }) {
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [statusFiltro, setStatusFiltro] = useState('pendente');
    const [modal, setModal] = useState(null);

    function carregar() {
      setCarregando(true);
      BasckApi.tarefas.listar({ status: statusFiltro || null })
        .then((r) => setItens(r.itens || []))
        .catch((e) => toast(e.message, 'error'))
        .finally(() => setCarregando(false));
    }
    useEffect(carregar, [statusFiltro]);

    async function toggle(t) {
      try {
        if (t.status === 'pendente') await BasckApi.tarefas.concluir(t.id);
        else await BasckApi.tarefas.atualizar(t.id, { ...t, status: 'pendente', concluido_em: null });
        carregar();
        toast('Atualizado', 'success');
      } catch (e) { toast(e.message, 'error'); }
    }
    async function remover(t) {
      if (!confirm(`Remover tarefa "${t.titulo}"?`)) return;
      try { await BasckApi.tarefas.remover(t.id); carregar(); }
      catch (e) { toast(e.message, 'error'); }
    }

    return (
      <div>
        <div className="card mb-4">
          <div className="flex between center">
            <div className="flex gap-2">
              {[{ v: 'pendente', l: 'Pendentes' }, { v: 'concluida', l: 'Concluídas' }, { v: '', l: 'Todas' }].map((o) => (
                <button key={o.v} className={'btn ' + (statusFiltro === o.v ? 'primary' : '')} onClick={() => setStatusFiltro(o.v)}>{o.l}</button>
              ))}
            </div>
            <button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>+ Nova tarefa</button>
          </div>
        </div>

        <div className="card">
          <h3>Tarefas</h3>
          <div className="sub">{itens.length} tarefa(s)</div>
          {carregando ? <Loading /> :
            itens.length === 0 ? <Empty texto="Nenhuma tarefa" acao={<button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>Criar tarefa</button>} /> : (
              <table className="table">
                <thead><tr><th></th><th>Tarefa</th><th>Caso</th><th>Vencimento</th><th>Prioridade</th><th></th></tr></thead>
                <tbody>
                  {itens.map((t) => (
                    <tr key={t.id}>
                      <td style={{ width: 40 }}>
                        <input type="checkbox" checked={t.status !== 'pendente'} onChange={() => toggle(t)} />
                      </td>
                      <td style={{ fontWeight: 500, textDecoration: t.status !== 'pendente' ? 'line-through' : 'none', opacity: t.status !== 'pendente' ? 0.6 : 1 }}>{t.titulo}</td>
                      <td className="muted tiny">{t.caso_titulo || '—'}</td>
                      <td className="muted tiny">{fmtData(t.data_vencimento)}</td>
                      <td>{prioridadeBadge(t.prioridade)}</td>
                      <td className="actions">
                        <button className="btn sm danger" onClick={() => remover(t)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {modal && (
          <M.Modal titulo="Nova tarefa" onClose={() => setModal(null)}>
            <M.TarefaForm onSalvar={() => { setModal(null); carregar(); toast('Criada', 'success'); }} onCancelar={() => setModal(null)} />
          </M.Modal>
        )}
      </div>
    );
  }

  // ============ CLIENTES ============
  function ClientesView({ toast }) {
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');
    const [modal, setModal] = useState(null);

    function carregar() {
      setCarregando(true);
      BasckApi.clientes.listar()
        .then((r) => setItens(r.itens || []))
        .catch((e) => toast(e.message, 'error'))
        .finally(() => setCarregando(false));
    }
    useEffect(carregar, []);

    async function remover(c) {
      if (!confirm(`Remover cliente "${c.nome}"? Os casos vinculados também serão removidos.`)) return;
      try { await BasckApi.clientes.remover(c.id); carregar(); toast('Removido', 'success'); }
      catch (e) { toast(e.message, 'error'); }
    }
    const filtrados = itens.filter((c) => !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || (c.documento || '').includes(busca));

    return (
      <div>
        <div className="card mb-4">
          <div className="flex between center">
            <input placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 6, color: 'var(--ink)' }} />
            <button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>+ Novo cliente</button>
          </div>
        </div>

        <div className="card">
          <h3>Clientes</h3>
          <div className="sub">{filtrados.length} cliente(s)</div>
          {carregando ? <Loading /> :
            filtrados.length === 0 ? <Empty texto="Nenhum cliente" acao={<button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>Cadastrar cliente</button>} /> : (
              <table className="table">
                <thead><tr><th>Nome</th><th>Documento</th><th>Contato</th><th>Endereço</th><th></th></tr></thead>
                <tbody>
                  {filtrados.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.nome}</td>
                      <td className="muted tiny">{c.documento || '—'}</td>
                      <td className="muted tiny">
                        {c.email && <div>{c.email}</div>}
                        {c.telefone && <div>{c.telefone}</div>}
                      </td>
                      <td className="muted tiny">{c.endereco || '—'}</td>
                      <td className="actions">
                        <button className="btn sm" onClick={() => setModal({ tipo: 'editar', cliente: c })}>Editar</button>
                        <button className="btn sm danger" onClick={() => remover(c)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {modal && (
          <M.Modal titulo={modal.tipo === 'editar' ? 'Editar cliente' : 'Novo cliente'} onClose={() => setModal(null)}>
            <M.ClienteForm inicial={modal.cliente} onSalvar={() => { setModal(null); carregar(); toast('Salvo', 'success'); }} onCancelar={() => setModal(null)} />
          </M.Modal>
        )}
      </div>
    );
  }

  // ============ FINANCEIRO ============
  function FinanceiroView({ toast }) {
    const [itens, setItens] = useState([]);
    const [resumo, setResumo] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [tipo, setTipo] = useState('');
    const [status, setStatus] = useState('');
    const [modal, setModal] = useState(null);

    function carregar() {
      setCarregando(true);
      Promise.all([
        BasckApi.financeiro.listar({ tipo: tipo || null, status: status || null }),
        BasckApi.financeiro.resumo()
      ]).then(([r, s]) => { setItens(r.itens || []); setResumo(s); })
        .catch((e) => toast(e.message, 'error'))
        .finally(() => setCarregando(false));
    }
    useEffect(carregar, [tipo, status]);

    async function marcarPago(l) {
      try {
        await BasckApi.financeiro.marcarPago(l.id, {});
        carregar();
        toast('Marcado como pago', 'success');
      } catch (e) { toast(e.message, 'error'); }
    }
    async function remover(l) {
      if (!confirm('Remover este lançamento?')) return;
      try { await BasckApi.financeiro.remover(l.id); carregar(); }
      catch (e) { toast(e.message, 'error'); }
    }

    return (
      <div>
        {resumo && (
          <div className="grid grid-4 mb-4">
            <div className="card kpi"><div className="label">Recebido total</div><div className="value gold">{fmtMoeda(resumo.recebido)}</div></div>
            <div className="card kpi"><div className="label">Pendente</div><div className="value">{fmtMoeda(resumo.pendente)}</div></div>
            <div className="card kpi"><div className="label">Honorários pendentes</div><div className="value">{fmtMoeda(resumo.pendenteHonorarios)}</div></div>
            <div className="card kpi"><div className="label">Atrasados</div><div className="value">{fmtMoeda(resumo.atrasados.valor)}</div><div className="muted tiny">{resumo.atrasados.quantidade} item(ns)</div></div>
          </div>
        )}

        <div className="card mb-4">
          <div className="flex between center">
            <div className="flex gap-2">
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 6, color: 'var(--ink)' }}>
                <option value="">Todos tipos</option>
                <option value="honorario">Honorários</option>
                <option value="despesa">Despesas</option>
                <option value="reembolso">Reembolsos</option>
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 6, color: 'var(--ink)' }}>
                <option value="">Todos status</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <a className="btn" href={BasckApi.financeiro.csvUrl()}>Exportar CSV</a>
            </div>
            <button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>+ Novo lançamento</button>
          </div>
        </div>

        <div className="card">
          <h3>Lançamentos</h3>
          <div className="sub">{itens.length} item(ns)</div>
          {carregando ? <Loading /> :
            itens.length === 0 ? <Empty texto="Nenhum lançamento" acao={<button className="btn primary" onClick={() => setModal({ tipo: 'novo' })}>Criar lançamento</button>} /> : (
              <table className="table">
                <thead><tr><th>Descrição</th><th>Tipo</th><th>Cliente/Caso</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {itens.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.descricao}</td>
                      <td className="muted tiny">{l.tipo}</td>
                      <td className="muted tiny">{l.cliente_nome || '—'}{l.caso_titulo && <div>{l.caso_titulo}</div>}</td>
                      <td className="muted tiny">{fmtData(l.data_vencimento)}</td>
                      <td className="right" style={{ fontWeight: 500 }}>{fmtMoeda(l.valor)}</td>
                      <td>{finStatusBadge(l.status)}</td>
                      <td className="actions">
                        {l.status === 'pendente' && <button className="btn sm" onClick={() => marcarPago(l)}>Marcar pago</button>}
                        <button className="btn sm" onClick={() => setModal({ tipo: 'editar', lancamento: l })}>Editar</button>
                        <button className="btn sm danger" onClick={() => remover(l)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {modal && (
          <M.Modal titulo={modal.tipo === 'editar' ? 'Editar lançamento' : 'Novo lançamento'} onClose={() => setModal(null)}>
            <M.LancamentoForm inicial={modal.lancamento} onSalvar={() => { setModal(null); carregar(); toast('Salvo', 'success'); }} onCancelar={() => setModal(null)} />
          </M.Modal>
        )}
      </div>
    );
  }

  // ============ DOCUMENTOS ============
  function DocumentosView({ toast }) {
    const [itens, setItens] = useState([]);
    const [espaco, setEspaco] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [modal, setModal] = useState(false);

    function carregar() {
      setCarregando(true);
      Promise.all([BasckApi.documentos.listar(), BasckApi.documentos.espaco()])
        .then(([r, e]) => { setItens(r.itens || []); setEspaco(e.bytes || 0); })
        .catch((er) => toast(er.message, 'error'))
        .finally(() => setCarregando(false));
    }
    useEffect(carregar, []);

    function token() { return BasckApi.getToken(); }
    async function remover(d) {
      if (!confirm(`Remover "${d.titulo}"?`)) return;
      try { await BasckApi.documentos.remover(d.id); carregar(); }
      catch (e) { toast(e.message, 'error'); }
    }
    const LIMITE = 200 * 1024 * 1024; // 200 MB de exemplo
    const pct = Math.min(100, (espaco / LIMITE) * 100);

    return (
      <div>
        <div className="card mb-4">
          <h3>Armazenamento</h3>
          <div className="sub">Uso de espaço em nuvem</div>
          <div style={{ height: 8, background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden', marginTop: 12 }}>
            <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--gold-2))', transition: 'width 0.3s' }} />
          </div>
          <div className="tiny muted mt-2">{fmtBytes(espaco)} de {fmtBytes(LIMITE)} ({pct.toFixed(1)}%)</div>
        </div>

        <div className="card">
          <div className="flex between center mb-4">
            <div>
              <h3>Documentos</h3>
              <div className="sub">{itens.length} arquivo(s)</div>
            </div>
            <button className="btn primary" onClick={() => setModal(true)}>+ Enviar documento</button>
          </div>
          {carregando ? <Loading /> :
            itens.length === 0 ? <Empty texto="Nenhum documento enviado" acao={<button className="btn primary" onClick={() => setModal(true)}>Enviar primeiro</button>} /> : (
              <table className="table">
                <thead><tr><th>Título</th><th>Arquivo</th><th>Caso</th><th>Tamanho</th><th>Data</th><th></th></tr></thead>
                <tbody>
                  {itens.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500 }}>{d.titulo}</td>
                      <td className="muted tiny">{d.nome_arquivo}</td>
                      <td className="muted tiny">{d.caso_titulo || '—'}</td>
                      <td className="muted tiny">{fmtBytes(d.tamanho_bytes)}</td>
                      <td className="muted tiny">{fmtData(d.criado_em)}</td>
                      <td className="actions">
                        <a className="btn sm" href={BasckApi.documentos.downloadUrl(d.id) + '?token=' + token()} target="_blank" rel="noreferrer">Baixar</a>
                        <button className="btn sm danger" onClick={() => remover(d)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>

        {modal && (
          <M.Modal titulo="Enviar documento" onClose={() => setModal(false)}>
            <M.DocumentoForm onSalvar={() => { setModal(false); carregar(); toast('Enviado', 'success'); }} onCancelar={() => setModal(false)} />
          </M.Modal>
        )}
      </div>
    );
  }

  // ============ CONFIGURAÇÕES ============
  function ConfiguracoesView({ usuario, onAtualizar, toast }) {
    const [dados, setDados] = useState(usuario || {});
    function set(c, v) { setDados({ ...dados, [c]: v }); }
    async function salvar(e) {
      e.preventDefault();
      try {
        const r = await BasckApi.auth.atualizarPerfil(dados);
        onAtualizar(r.usuario);
        toast('Perfil atualizado', 'success');
      } catch (er) { toast(er.message, 'error'); }
    }
    return (
      <div className="grid grid-2">
        <div className="card">
          <h3>Perfil</h3>
          <div className="sub">Suas informações pessoais e profissionais</div>
          <form onSubmit={salvar}>
            <div className="form-field"><label>Nome</label><input value={dados.nome || ''} onChange={(e) => set('nome', e.target.value)} required /></div>
            <div className="form-field"><label>E-mail</label><input type="email" value={dados.email || ''} onChange={(e) => set('email', e.target.value)} required /></div>
            <div className="form-row">
              <div className="form-field"><label>OAB</label><input value={dados.oab || ''} onChange={(e) => set('oab', e.target.value)} /></div>
              <div className="form-field"><label>Telefone</label><input value={dados.telefone || ''} onChange={(e) => set('telefone', e.target.value)} /></div>
            </div>
            <div className="form-field"><label>Plano</label>
              <select value={dados.plano || 'autonomo'} onChange={(e) => set('plano', e.target.value)}>
                <option value="autonomo">Autônomo</option>
                <option value="escritorio">Escritório</option>
                <option value="boutique">Boutique</option>
              </select>
            </div>
            <button type="submit" className="btn primary">Salvar perfil</button>
          </form>
        </div>
        <div className="card">
          <h3>Conta</h3>
          <div className="sub">Informações da sua assinatura</div>
          <div style={{ padding: 16, background: 'var(--bg-3)', borderRadius: 8, marginTop: 12 }}>
            <div className="muted tiny">PLANO ATUAL</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, marginTop: 4, textTransform: 'capitalize' }}>{dados.plano || 'autônomo'}</div>
            <div className="muted tiny mt-2">Conta criada em {fmtData(dados.criado_em)}</div>
          </div>
          <div className="muted mt-4 tiny">
            Em breve: gestão de equipe multi-usuário, integrações externas (Google Calendar, WhatsApp, DJEn) e módulo de IA jurídica para cálculo automático de prazos.
          </div>
        </div>
      </div>
    );
  }

  // =================== COMPROMISSOS ===================
  function CompromissosView({ toast }) {
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [filtro, setFiltro] = useState('proximos');
    const [edit, setEdit] = useState(null);

    async function carregar() {
      setCarregando(true);
      try {
        // Traduz o filtro do chip em parametros que o backend entende.
        // Backend recebe: status, de, ate. Calculamos de/ate conforme o filtro.
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
        const fmtIso = (d) => d.toISOString().slice(0, 10);
        const params = {};
        const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
        if (filtro === 'hoje') {
          params.de = fmtIso(hoje) + 'T00:00:00';
          params.ate = fmtIso(amanha) + 'T00:00:00';
        } else if (filtro === 'atrasados') {
          params.ate = fmtIso(hoje) + 'T00:00:00';
          params.status = 'agendado';
        } else if (filtro === 'proximos') {
          params.de = fmtIso(hoje) + 'T00:00:00';
          params.ate = fmtIso(new Date(hoje.getTime() + 30 * 86400000)) + 'T23:59:59';
          params.status = 'agendado';
        } else if (filtro === 'concluidos') {
          params.status = 'concluido';
        }
        const r = await BasckApi.compromissos.listar(params);
        let itens = r.itens || [];
        // Filtra concluidos tambem pelo "filtro" se a UI pedir.
        if (filtro === 'atrasados') {
          itens = itens.filter((c) => c.data_hora < fmtIso(hoje));
        }
        setItens(itens);
      } catch (e) { toast(e.message, 'error'); }
      finally { setCarregando(false); }
    }

    useEffect(() => { carregar(); }, [filtro]);

    async function remover(id) {
      if (!confirm('Remover este compromisso?')) return;
      try { await BasckApi.compromissos.remover(id); toast('Removido', 'success'); carregar(); }
      catch (e) { toast(e.message, 'error'); }
    }

    const tipoIcon = { audiencia: '⚖', reuniao: '🤝', prazo_judicial: '◷', sessao: '▦', diligencia: '🚗', outro: '◌' };
    const tipoLabel = { audiencia: 'Audiência', reuniao: 'Reunião', prazo_judicial: 'Prazo judicial', sessao: 'Sessão', diligencia: 'Diligência', outro: 'Outro' };

    return (
      <div>
        <div className="toolbar">
          <div className="toolbar-grupo">
            <button className={'chip' + (filtro === 'proximos' ? ' active' : '')} onClick={() => setFiltro('proximos')}>Próximos</button>
            <button className={'chip' + (filtro === 'hoje' ? ' active' : '')} onClick={() => setFiltro('hoje')}>Hoje</button>
            <button className={'chip' + (filtro === 'atrasados' ? ' active' : '')} onClick={() => setFiltro('atrasados')}>Atrasados</button>
            <button className={'chip' + (filtro === 'concluidos' ? ' active' : '')} onClick={() => setFiltro('concluidos')}>Concluídos</button>
            <button className={'chip' + (filtro === 'todos' ? ' active' : '')} onClick={() => setFiltro('todos')}>Todos</button>
          </div>
          <button className="btn primary" onClick={() => setEdit({})}>+ Novo compromisso</button>
        </div>

        {carregando ? <div className="muted">Carregando...</div> :
         itens.length === 0 ? <div className="empty">Nenhum compromisso neste filtro.</div> :
         <div className="compromissos-grid">
           {itens.map((c) => (
             <div key={c.id} className="compromisso-card">
               <div className="compromisso-tipo tipo-{c.tipo}">{tipoIcon[c.tipo] || '◌'} {tipoLabel[c.tipo] || c.tipo}</div>
               <div className="compromisso-titulo">{c.titulo}</div>
               <div className="compromisso-data">{c.data_hora_fmt || c.data_hora}</div>
               {c.caso_titulo && <div className="compromisso-caso">📁 {c.caso_titulo}</div>}
               {c.local && <div className="compromisso-local">📍 {c.local}</div>}
               {c.observacoes && <div className="compromisso-obs">{c.observacoes}</div>}
               <div className="compromisso-acoes">
                 <button className="btn ghost" onClick={() => setEdit(c)}>Editar</button>
                 <button className="btn ghost danger" onClick={() => remover(c.id)}>Excluir</button>
               </div>
             </div>
           ))}
         </div>}

        {edit !== null && (
          <BasckModals.CompromissoForm
            inicial={edit.id ? edit : null}
            onSalvar={() => { setEdit(null); carregar(); toast('Salvo', 'success'); }}
            onCancelar={() => setEdit(null)}
          />
        )}
      </div>
    );
  }

  // =================== KANBAN ===================
  const COLUNAS = [
    { id: 'a_fazer', label: 'A fazer', cor: '#6b7280' },
    { id: 'em_andamento', label: 'Em andamento', cor: '#3b82f6' },
    { id: 'em_revisao', label: 'Em revisão', cor: '#f59e0b' },
    { id: 'concluido', label: 'Concluído', cor: '#10b981' }
  ];

  function KanbanView({ toast }) {
    const [cartoes, setCartoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [arrastando, setArrastando] = useState(null);
    const [edit, setEdit] = useState(null);

    async function carregar() {
      setCarregando(true);
      try {
        const r = await BasckApi.kanban.listar();
        setCartoes(r.itens || []);
      } catch (e) { toast(e.message, 'error'); }
      finally { setCarregando(false); }
    }

    useEffect(() => { carregar(); }, []);

    async function mover(cartaoId, novaColuna) {
      const anterior = cartoes;
      // otimista
      setCartoes((cs) => cs.map((c) => c.id === cartaoId ? { ...c, coluna: novaColuna } : c));
      try {
        await BasckApi.kanban.mover(cartaoId, { coluna: novaColuna });
      } catch (e) {
        toast(e.message, 'error');
        setCartoes(anterior);
      }
    }

    async function remover(id) {
      if (!confirm('Excluir este cartão?')) return;
      try { await BasckApi.kanban.remover(id); toast('Removido', 'success'); carregar(); }
      catch (e) { toast(e.message, 'error'); }
    }

    function onDragStart(c) { setArrastando(c.id); }
    function onDragOver(e) { e.preventDefault(); }
    async function onDrop(coluna) {
      if (arrastando) {
        await mover(arrastando, coluna);
        setArrastando(null);
      }
    }

    return (
      <div>
        <div className="toolbar">
          <div className="toolbar-grupo"><span className="muted">{cartoes.length} cartão(ões)</span></div>
          <button className="btn primary" onClick={() => setEdit({})}>+ Nova tarefa</button>
        </div>

        {carregando ? <div className="muted">Carregando...</div> :
         <div className="kanban-board">
           {COLUNAS.map((col) => (
             <div key={col.id} className="kanban-coluna" onDragOver={onDragOver} onDrop={() => onDrop(col.id)}>
               <div className="kanban-coluna-head" style={{ borderColor: col.cor }}>
                 <span style={{ color: col.cor }}>●</span> {col.label}
                 <span className="badge">{cartoes.filter((c) => c.coluna === col.id).length}</span>
               </div>
               <div className="kanban-coluna-body">
                 {cartoes.filter((c) => c.coluna === col.id).map((c) => (
                   <div key={c.id} className="kanban-cartao" draggable onDragStart={() => onDragStart(c)}>
                     {c.caso_titulo && <div className="kanban-cartao-caso">📁 {c.caso_titulo}</div>}
                     <div className="kanban-cartao-titulo">{c.titulo}</div>
                     {c.descricao && <div className="kanban-cartao-desc">{c.descricao}</div>}
                     <div className="kanban-cartao-acoes">
                       <button className="btn ghost tiny" onClick={() => setEdit(c)}>✎</button>
                       <button className="btn ghost tiny danger" onClick={() => remover(c.id)}>✕</button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           ))}
         </div>}

        {edit !== null && (
          <BasckModals.KanbanForm
            inicial={edit.id ? edit : null}
            onSalvar={() => { setEdit(null); carregar(); toast('Salvo', 'success'); }}
            onCancelar={() => setEdit(null)}
          />
        )}
      </div>
    );
  }

  // =================== INTEGRAÇÕES ===================
  function IntegracoesView({ toast }) {
    const [integracoes, setIntegracoes] = useState([]);
    const [oabs, setOabs] = useState([]);
    const [tribunais, setTribunais] = useState([]);
    const [monitoramento, setMonitoramento] = useState({ oabs: [], casos: [] });
    const [carregando, setCarregando] = useState(true);
    const [edit, setEdit] = useState(null);
    const [editOab, setEditOab] = useState(null);
    const [resultado, setResultado] = useState(null);

    async function carregar() {
      setCarregando(true);
      try {
        const [i, o, t, m] = await Promise.all([
          BasckApi.integracoes.listar(),
          BasckApi.integracoes.oab.listar(),
          BasckApi.integracoes.tribunais(),
          BasckApi.integracoes.monitoramento().catch(() => ({ oabs: [], casos: [] }))
        ]);
        setIntegracoes(i.itens || []);
        setOabs(o.itens || []);
        setTribunais(t.tribunais || t.itens || []);
        setMonitoramento({ oabs: m.oabs || [], casos: m.casos || [] });
      } catch (e) { toast(e.message, 'error'); }
      finally { setCarregando(false); }
    }

    useEffect(() => { carregar(); }, []);

    async function remover(id) {
      if (!confirm('Remover esta integração?')) return;
      try { await BasckApi.integracoes.remover(id); toast('Removido', 'success'); carregar(); }
      catch (e) { toast(e.message, 'error'); }
    }
    async function removerOab(id) {
      if (!confirm('Remover esta OAB?')) return;
      try { await BasckApi.integracoes.oab.remover(id); toast('Removido', 'success'); carregar(); }
      catch (e) { toast(e.message, 'error'); }
    }

    async function consultar(intId) {
      try {
        const r = await BasckApi.integracoes.consultar(intId);
        const dados = r.resultado || r;
        setResultado(dados);
        toast(dados.sucesso ? 'Consulta realizada' : 'Consulta concluída', dados.sucesso ? 'success' : 'info');
        if (dados.sucesso) carregar();
      } catch (e) { toast(e.message, 'error'); }
    }

    async function verificarOab(oabId) {
      try {
        const r = await BasckApi.integracoes.oab.verificar(oabId);
        const dados = r.item || r;
        setResultado({ oab: true, ...dados });
        toast('Verificação realizada', 'success');
        carregar();
      } catch (e) { toast(e.message, 'error'); }
    }

    return (
      <div>
        <div className="banner-info">
          <strong>DataJud (CNJ)</strong> — Solicite uma API Key gratuita em <a href="https://datajud.cnj.jus.br" target="_blank" rel="noopener">datajud.cnj.jus.br</a> para consultar processos em tribunais reais. As credenciais são criptografadas com AES-256-GCM.
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Credenciais de tribunais</h3>
            <button className="btn primary" onClick={() => setEdit({})}>+ Nova integração</button>
          </div>
          {carregando ? <div className="muted">Carregando...</div> :
           integracoes.length === 0 ? <div className="empty">Nenhuma integração cadastrada.</div> :
           <table className="table">
             <thead><tr><th>Tribunal</th><th>Identificador</th><th>Última consulta</th><th></th></tr></thead>
             <tbody>
               {integracoes.map((i) => (
                 <tr key={i.id}>
                   <td>{i.tribunal_nome} <span className="badge-tiny">🔒 criptografado</span></td>
                   <td><code>{i.identificador}</code></td>
                   <td className="muted">{i.ultima_consulta || '—'}</td>
                   <td className="acoes">
                     <button className="btn ghost tiny" onClick={() => consultar(i.id)}>Consultar</button>
                     <button className="btn ghost tiny" onClick={() => setEdit(i)}>Editar</button>
                     <button className="btn ghost tiny danger" onClick={() => remover(i.id)}>Excluir</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>}
        </div>

        <div className="card mt-3">
          <div className="card-head">
            <h3>Monitoramento de OAB</h3>
            <button className="btn primary" onClick={() => setEditOab({})}>+ Monitorar OAB</button>
          </div>
          {oabs.length === 0 ? <div className="empty">Nenhuma OAB monitorada.</div> :
           <table className="table">
             <thead><tr><th>Número</th><th>Nome</th><th>Situação</th><th>Última verificação</th><th></th></tr></thead>
             <tbody>
               {oabs.map((o) => (
                 <tr key={o.id}>
                   <td><code>{o.numero_oab || o.numero}</code>{o.uf ? ' / ' + o.uf : ''}</td>
                   <td>{o.nome || '—'}</td>
                   <td><span className={'badge-situacao sit-' + (o.situacao || 'desconhecida')}>{o.situacao || 'desconhecida'}</span></td>
                   <td className="muted">{o.ultima_verificacao || '—'}</td>
                   <td className="acoes">
                     <button className="btn ghost tiny" onClick={() => verificarOab(o.id)}>Verificar agora</button>
                     <button className="btn ghost tiny danger" onClick={() => removerOab(o.id)}>Excluir</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>}
        </div>

        {edit !== null && (
          <BasckModals.IntegracaoForm
            inicial={edit.id ? edit : null}
            tribunais={tribunais}
            onSalvar={() => { setEdit(null); carregar(); toast('Salvo', 'success'); }}
            onCancelar={() => setEdit(null)}
          />
        )}

        {editOab !== null && (
          <BasckModals.OabForm
            inicial={editOab.id ? editOab : null}
            onSalvar={() => { setEditOab(null); carregar(); toast('Salvo', 'success'); }}
            onCancelar={() => setEditOab(null)}
          />
        )}

        <div className="card mt-3">
          <div className="card-head">
            <h3>Processos monitorados</h3>
            <span className="muted tiny">{monitoramento.casos.length} caso(s) vinculado(s) a {monitoramento.oabs.length} OAB(s)</span>
          </div>
          {monitoramento.casos.length === 0 ? <div className="empty">Nenhum caso vinculado a uma OAB monitorada ainda. Crie um caso que esteja associado a uma OAB monitorada para que apareca aqui automaticamente.</div> :
           <table className="table">
             <thead><tr><th>Caso</th><th>Numero do processo</th><th>Tribunal</th><th>Cliente</th><th>Vinculado a OAB</th><th>Status</th></tr></thead>
             <tbody>
               {monitoramento.casos.map((c) => (
                 <tr key={c.id}>
                   <td>{c.titulo}</td>
                   <td><code>{c.numero_processo || '—'}</code></td>
                   <td className="muted">{c.tribunal || '—'}</td>
                   <td>{c.cliente_nome || '—'}</td>
                   <td><code>{c.numero_oab || '—'}</code>{c.oab_uf ? ' / ' + c.oab_uf : ''}</td>
                   <td><span className={'badge-situacao sit-' + (c.status || 'desconhecido')}>{c.status || 'desconhecido'}</span></td>
                 </tr>
               ))}
             </tbody>
           </table>}
        </div>

        {resultado && (
          <BasckModals.Modal titulo="Resultado da consulta" onClose={() => setResultado(null)} lg>
            <div className="modal-body">
              <pre className="resultado-json">{JSON.stringify(resultado, null, 2)}</pre>
            </div>
          </BasckModals.Modal>
        )}
      </div>
    );
  }

  window.BasckUI = { DashboardView, CasosView, PrazosView, TarefasView, ClientesView, FinanceiroView, DocumentosView, ConfiguracoesView, CompromissosView, KanbanView, IntegracoesView };
})(window);
