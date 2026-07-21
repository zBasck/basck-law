// frontend/js/busca.js
// Modal de busca global acionado por Ctrl+K / Cmd+K
(function (global) {
  const { useState, useEffect, useRef, useCallback } = React;

  function fmtData(s) {
    if (!s) return '';
    const iso = String(s).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return s;
    const [y, m, d] = iso.split('-');
    return d + '/' + m + '/' + y;
  }

  function BuscaModal({ aberto, onFechar, onResultado }) {
    const [q, setQ] = useState('');
    const [resultados, setResultados] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [selecionado, setSelecionado] = useState(0);
    const inputRef = useRef(null);
    const listaRef = useRef([]);

    useEffect(() => {
      if (aberto) {
        setQ('');
        setResultados(null);
        setSelecionado(0);
        setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
      }
    }, [aberto]);

    useEffect(() => {
      if (!aberto) return;
      if (q.length < 2) { setResultados(null); return; }
      setCarregando(true);
      const t = setTimeout(() => {
        BasckApi.busca(q)
          .then((r) => { setResultados(r); setSelecionado(0); })
          .catch(() => setResultados({ grupos: { clientes: [], casos: [], prazos: [], tarefas: [] }, total: 0 }))
          .finally(() => setCarregando(false));
      }, 200);
      return () => clearTimeout(t);
    }, [q, aberto]);

    const itensFlat = useCallback(() => {
      if (!resultados) return [];
      const out = [];
      const g = resultados.grupos;
      g.clientes.forEach((c) => out.push({ tipo: 'cliente', id: c.id, label: c.nome, sub: c.email || c.documento || '' }));
      g.casos.forEach((c) => out.push({ tipo: 'caso', id: c.id, label: c.titulo, sub: c.numero_processo || c.area || '' }));
      g.prazos.forEach((p) => out.push({ tipo: 'prazo', id: p.id, label: p.titulo, sub: 'Vence ' + fmtData(p.data_vencimento) + ' · ' + (p.caso_titulo || '') }));
      g.tarefas.forEach((t) => out.push({ tipo: 'tarefa', id: t.id, label: t.titulo, sub: t.caso_titulo || '' }));
      return out;
    }, [resultados]);

    function navegar(item) {
      onFechar();
      const map = { cliente: 'clientes', caso: 'casos', prazo: 'prazos', tarefa: 'tarefas' };
      onResultado(map[item.tipo], item.id);
    }

    function onKeyDown(e) {
      const itens = itensFlat();
      if (e.key === 'Escape') { onFechar(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelecionado((s) => Math.min(itens.length - 1, s + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelecionado((s) => Math.max(0, s - 1)); }
      if (e.key === 'Enter' && itens[selecionado]) { e.preventDefault(); navegar(itens[selecionado]); }
    }

    const itens = itensFlat();
    let idxFlat = 0;

    if (!aberto) return null;
    return (
      <div className="busca-overlay" onClick={onFechar}>
        <div className="busca-modal" onClick={(e) => e.stopPropagation()}>
          <div className="busca-input">
            <span className="busca-ico">⌕</span>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Buscar clientes, casos, prazos, tarefas..."
              autoComplete="off"
            />
            <kbd>esc</kbd>
          </div>
          <div className="busca-resultados">
            {!q && <div className="busca-vazio">Digite ao menos 2 caracteres para buscar.</div>}
            {q && q.length < 2 && <div className="busca-vazio">Continuar digitando...</div>}
            {q && q.length >= 2 && carregando && <div className="busca-vazio">Buscando...</div>}
            {q && q.length >= 2 && !carregando && resultados && resultados.total === 0 && (
              <div className="busca-vazio">Nenhum resultado para "<b>{q}</b>".</div>
            )}
            {resultados && resultados.total > 0 && (
              <div className="busca-grupos">
                {resultados.grupos.clientes.length > 0 && (
                  <div className="busca-grupo">
                    <div className="busca-grupo-titulo">Clientes ({resultados.grupos.clientes.length})</div>
                    {resultados.grupos.clientes.map((c) => {
                      const i = idxFlat++;
                      return (
                        <button key={'c' + c.id} className={'busca-item' + (i === selecionado ? ' active' : '')} onClick={() => navegar({ tipo: 'cliente', id: c.id })}>
                          <span className="busca-item-tipo">cliente</span>
                          <span className="busca-item-label">{c.nome}</span>
                          <span className="busca-item-sub">{c.email || c.documento || ''}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {resultados.grupos.casos.length > 0 && (
                  <div className="busca-grupo">
                    <div className="busca-grupo-titulo">Casos ({resultados.grupos.casos.length})</div>
                    {resultados.grupos.casos.map((c) => {
                      const i = idxFlat++;
                      return (
                        <button key={'c' + c.id} className={'busca-item' + (i === selecionado ? ' active' : '')} onClick={() => navegar({ tipo: 'caso', id: c.id })}>
                          <span className="busca-item-tipo">caso</span>
                          <span className="busca-item-label">{c.titulo}</span>
                          <span className="busca-item-sub">{c.numero_processo || c.area || ''}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {resultados.grupos.prazos.length > 0 && (
                  <div className="busca-grupo">
                    <div className="busca-grupo-titulo">Prazos ({resultados.grupos.prazos.length})</div>
                    {resultados.grupos.prazos.map((p) => {
                      const i = idxFlat++;
                      return (
                        <button key={'p' + p.id} className={'busca-item' + (i === selecionado ? ' active' : '')} onClick={() => navegar({ tipo: 'prazo', id: p.id })}>
                          <span className="busca-item-tipo">prazo</span>
                          <span className="busca-item-label">{p.titulo}</span>
                          <span className="busca-item-sub">Vence {fmtData(p.data_vencimento)} · {p.caso_titulo || ''}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {resultados.grupos.tarefas.length > 0 && (
                  <div className="busca-grupo">
                    <div className="busca-grupo-titulo">Tarefas ({resultados.grupos.tarefas.length})</div>
                    {resultados.grupos.tarefas.map((t) => {
                      const i = idxFlat++;
                      return (
                        <button key={'t' + t.id} className={'busca-item' + (i === selecionado ? ' active' : '')} onClick={() => navegar({ tipo: 'tarefa', id: t.id })}>
                          <span className="busca-item-tipo">tarefa</span>
                          <span className="busca-item-label">{t.titulo}</span>
                          <span className="busca-item-sub">{t.caso_titulo || ''}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="busca-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
            <span><kbd>⏎</kbd> abrir</span>
            <span><kbd>esc</kbd> fechar</span>
          </div>
        </div>
      </div>
    );
  }

  window.BasckBusca = { BuscaModal };
})(window);
