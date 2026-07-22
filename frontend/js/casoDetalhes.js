// frontend/js/casoDetalhes.js
// v1.4.0 — Tela de detalhes do caso (timeline de andamentos + abas internas)

(function (global) {
  const { useState, useEffect } = React;

  function CasoDetalhesView({ casoId, onVoltar, toast }) {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [aba, setAba] = useState('andamentos');
    const [modalAnd, setModalAnd] = useState(false);
    const [novoAnd, setNovoAnd] = useState({ data: new Date().toISOString().slice(0, 10), descricao: '', tipo: '' });

    function carregar() {
      setCarregando(true);
      BasckApi.casos.detalhes(casoId)
        .then((r) => setDados(r))
        .catch((e) => { toast(e.message, 'error'); onVoltar(); })
        .finally(() => setCarregando(false));
    }

    useEffect(carregar, [casoId]);

    async function adicionarAndamento(e) {
      e.preventDefault();
      if (!novoAnd.descricao.trim()) return;
      try {
        await BasckApi.casos.andamentos.criar(casoId, novoAnd);
        setModalAnd(false);
        setNovoAnd({ data: new Date().toISOString().slice(0, 10), descricao: '', tipo: '' });
        carregar();
        toast('Andamento registrado', 'success');
      } catch (err) { toast(err.message, 'error'); }
    }

    async function removerAndamento(id) {
      if (!confirm('Remover este andamento?')) return;
      try {
        await BasckApi.casos.andamentos.remover(casoId, id);
        carregar();
        toast('Removido', 'success');
      } catch (err) { toast(err.message, 'error'); }
    }

    async function consultarDatajud() {
      try {
        toast('Consultando DataJud...', 'info');
        const c = dados.caso;
        const int = await BasckApi.integracoes.listar();
        const integ = (int.integracoes || []).find((x) => x.tribunal && c.tribunal && x.tribunal.toLowerCase() === c.tribunal.toLowerCase());
        if (!integ) {
          toast('Sem credencial para ' + c.tribunal + ' — cadastre em Integrações', 'error');
          return;
        }
        const r = await BasckApi.integracoes.consultar(integ.id, { numero: c.numero_processo });
        const movimentos = r.resultado && r.resultado.hits && r.resultado.hits.hits ? r.resultado.hits.hits.flatMap((h) => (h._source && h._source.movimentos) || []) : [];
        if (movimentos.length === 0) {
          toast('Nenhum movimento novo no DataJud', 'info');
          return;
        }
        const andamentos = movimentos.map((m) => ({
          data: (m.dataHora || new Date().toISOString()).slice(0, 10),
          descricao: m.nome || m.descricao || 'Movimento processual',
          tipo: m.tipo || null,
          origem: 'datajud',
          fonte_externa_id: String(m.codigo || m.dataHora || Math.random())
        }));
        await BasckApi.casos.andamentos.criar(casoId, { andamentos });
        carregar();
        toast(andamentos.length + ' andamentos importados do DataJud', 'success');
      } catch (err) { toast(err.message, 'error'); }
    }

    if (carregando) return <div className="loading"><div className="spinner" />Carregando caso...</div>;
    if (!dados) return null;
    const { caso, andamentos, prazos, tarefas, compromissos, documentos } = dados;
    const cPrazos = prazos.filter((p) => p.status === 'pendente');
    const cTarefas = tarefas.filter((t) => t.status !== 'concluida');
    const cCompromissos = compromissos.filter((c) => c.status === 'agendado');

    return (
      <div>
        <div className="card mb-4">
          <div className="flex between center gap-3">
            <div style={{ flex: 1 }}>
              <button className="btn sm ghost" onClick={onVoltar}>← Voltar aos casos</button>
              <h2 style={{ marginTop: 8 }}>{caso.titulo}</h2>
              <div className="muted tiny">
                {caso.cliente_nome && <span>Cliente: <strong>{caso.cliente_nome}</strong> · </span>}
                {caso.numero_processo && <span>Nº proc: <code>{caso.numero_processo}</code> · </span>}
                {caso.tribunal && <span>Tribunal: {caso.tribunal} · </span>}
                {caso.area && <span>Área: {caso.area} · </span>}
                {caso.status && <span>Status: {caso.status}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {caso.numero_processo && (
                <button className="btn" onClick={consultarDatajud} title="Importar andamentos do DataJud">⌬ Atualizar via DataJud</button>
              )}
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="flex gap-2" style={{ borderBottom: '1px solid var(--line-2)', paddingBottom: 0 }}>
            {[
              { v: 'andamentos', l: 'Andamentos', n: andamentos.length },
              { v: 'prazos', l: 'Prazos', n: prazos.length },
              { v: 'tarefas', l: 'Tarefas', n: tarefas.length },
              { v: 'compromissos', l: 'Compromissos', n: compromissos.length },
              { v: 'documentos', l: 'Documentos', n: documentos.length },
              { v: 'info', l: 'Dados', n: null }
            ].map((t) => (
              <button key={t.v} className={'btn sm' + (aba === t.v ? ' primary' : '')} onClick={() => setAba(t.v)} style={{ borderRadius: '6px 6px 0 0' }}>
                {t.l}{t.n != null ? ` (${t.n})` : ''}
              </button>
            ))}
          </div>
        </div>

        {aba === 'andamentos' && (
          <div className="card">
            <div className="flex between center mb-3">
              <div>
                <h3>Timeline de andamentos</h3>
                <div className="sub">{andamentos.length} andamento(s) registrado(s)</div>
              </div>
              <button className="btn primary" onClick={() => setModalAnd(true)}>+ Novo andamento</button>
            </div>
            {andamentos.length === 0 ? (
              <div className="empty-state">
                <p className="muted">Nenhum andamento registrado. Use "Atualizar via DataJud" para importar ou adicione manualmente.</p>
              </div>
            ) : (
              <div className="timeline">
                {andamentos.map((a) => (
                  <div key={a.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="flex between center">
                        <div>
                          <span className="timeline-date">{a.data}</span>
                          {a.tipo && <span className="badge" style={{ marginLeft: 8 }}>{a.tipo}</span>}
                          {a.origem && a.origem !== 'manual' && <span className="badge" style={{ marginLeft: 4, background: 'var(--gold-dim)' }}>{a.origem}</span>}
                        </div>
                        <button className="btn sm danger" onClick={() => removerAndamento(a.id)}>×</button>
                      </div>
                      <div className="timeline-desc">{a.descricao}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aba === 'prazos' && (
          <div className="card">
            <h3>Prazos vinculados</h3>
            <div className="sub">{cPrazos.length} pendente(s) · {prazos.length - cPrazos.length} concluído(s)</div>
            {prazos.length === 0 ? <p className="muted">Nenhum prazo vinculado a este caso.</p> : (
              <table className="table">
                <thead><tr><th>Título</th><th>Tipo</th><th>Vencimento</th><th>Status</th></tr></thead>
                <tbody>
                  {prazos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.titulo}</td>
                      <td className="muted tiny">{p.tipo_dias}</td>
                      <td className="muted tiny">{p.data_vencimento}</td>
                      <td>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {aba === 'tarefas' && (
          <div className="card">
            <h3>Tarefas vinculadas</h3>
            <div className="sub">{cTarefas.length} pendente(s) · {tarefas.length - cTarefas.length} concluída(s)</div>
            {tarefas.length === 0 ? <p className="muted">Nenhuma tarefa vinculada.</p> : (
              <table className="table">
                <thead><tr><th>Título</th><th>Vencimento</th><th>Prioridade</th><th>Status</th></tr></thead>
                <tbody>
                  {tarefas.map((t) => (
                    <tr key={t.id}>
                      <td>{t.titulo}</td>
                      <td className="muted tiny">{t.data_vencimento || '—'}</td>
                      <td className="muted tiny">{t.prioridade || '—'}</td>
                      <td>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {aba === 'compromissos' && (
          <div className="card">
            <h3>Compromissos vinculados</h3>
            <div className="sub">{cCompromissos.length} agendado(s) · {compromissos.length - cCompromissos.length} realizado(s)/cancelado(s)</div>
            {compromissos.length === 0 ? <p className="muted">Nenhum compromisso vinculado.</p> : (
              <table className="table">
                <thead><tr><th>Título</th><th>Data/hora</th><th>Tipo</th><th>Status</th></tr></thead>
                <tbody>
                  {compromissos.map((c) => (
                    <tr key={c.id}>
                      <td>{c.titulo}</td>
                      <td className="muted tiny">{c.data_hora}</td>
                      <td className="muted tiny">{c.tipo || '—'}</td>
                      <td>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {aba === 'documentos' && (
          <div className="card">
            <h3>Documentos</h3>
            {documentos.length === 0 ? <p className="muted">Nenhum documento vinculado. Anexe arquivos na área de Documentos.</p> : (
              <table className="table">
                <thead><tr><th>Arquivo</th><th>Tipo</th><th>Enviado em</th></tr></thead>
                <tbody>
                  {documentos.map((d) => (
                    <tr key={d.id}>
                      <td>{d.nome || d.titulo}</td>
                      <td className="muted tiny">{d.tipo || '—'}</td>
                      <td className="muted tiny">{d.criado_em || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {aba === 'info' && (
          <div className="card">
            <h3>Dados do caso</h3>
            <div className="grid grid-2 mt-3">
              <div><strong>Título:</strong> {caso.titulo}</div>
              <div><strong>Cliente:</strong> {caso.cliente_nome || '—'}</div>
              <div><strong>Número do processo:</strong> {caso.numero_processo || '—'}</div>
              <div><strong>Tribunal:</strong> {caso.tribunal || '—'}</div>
              <div><strong>Área:</strong> {caso.area || '—'}</div>
              <div><strong>Instância:</strong> {caso.instancia || '—'}</div>
              <div><strong>Status:</strong> {caso.status}</div>
              <div><strong>Valor da causa:</strong> {caso.valor_causa ? 'R$ ' + Number(caso.valor_causa).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}</div>
              <div><strong>Data de início:</strong> {caso.data_inicio || '—'}</div>
              <div><strong>Data fim:</strong> {caso.data_fim || '—'}</div>
            </div>
            {caso.descricao && (
              <div className="mt-3">
                <strong>Descrição:</strong>
                <p className="muted">{caso.descricao}</p>
              </div>
            )}
          </div>
        )}

        {modalAnd && (
          <BasckModals.Modal titulo="Novo andamento" onClose={() => setModalAnd(false)}>
            <form onSubmit={adicionarAndamento}>
              <div className="form-group">
                <label>Data</label>
                <input type="date" value={novoAnd.data} onChange={(e) => setNovoAnd({ ...novoAnd, data: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Tipo (opcional)</label>
                <input value={novoAnd.tipo} onChange={(e) => setNovoAnd({ ...novoAnd, tipo: e.target.value })} placeholder="ex: Despacho, Sentença, Audiência..." />
              </div>
              <div className="form-group">
                <label>Descrição *</label>
                <textarea value={novoAnd.descricao} onChange={(e) => setNovoAnd({ ...novoAnd, descricao: e.target.value })} required rows={4} placeholder="Descreva o andamento processual..." />
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" className="btn primary">Salvar</button>
                <button type="button" className="btn" onClick={() => setModalAnd(false)}>Cancelar</button>
              </div>
            </form>
          </BasckModals.Modal>
        )}
      </div>
    );
  }

  global.BasckCasoDetalhes = { CasoDetalhesView };
})(window);
