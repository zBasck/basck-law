// frontend/js/datepicker.js
// Widget DateInput: campo de data com calendário popover, aceita digitacao dd/mm/aaaa.
// Substitui inputs type="date" mantendo compatibilidade (devolve string ISO aaaa-mm-dd).
// Componente compartilhado exposto via window.BasckDateInput.
(function (global) {
  const { useState, useEffect, useRef } = React;

  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Converte "aaaa-mm-dd" para "dd/mm/aaaa" (exibicao) e vice-versa
  function isoToBr(iso) {
    if (!iso || typeof iso !== 'string') return '';
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    return m[3] + '/' + m[2] + '/' + m[1];
  }
  function brToIso(br) {
    if (!br) return '';
    const limpo = br.replace(/[^\d]/g, '').slice(0, 8);
    if (limpo.length !== 8) return '';
    const dd = limpo.slice(0, 2);
    const mm = limpo.slice(2, 4);
    const aaaa = limpo.slice(4, 8);
    if (+mm < 1 || +mm > 12 || +dd < 1 || +dd > 31) return '';
    return aaaa + '-' + mm + '-' + dd;
  }

  function parseIso(iso) {
    if (!iso) return null;
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }

  function DateInput({ value, onChange, required, min, max, placeholder, className, name }) {
    const [texto, setTexto] = useState(isoToBr(value || ''));
    const [aberto, setAberto] = useState(false);
    const [view, setView] = useState(() => parseIso(value) || new Date());
    const [hover, setHover] = useState(null);
    const ref = useRef(null);
    const popRef = useRef(null);

    useEffect(() => { setTexto(isoToBr(value || '')); }, [value]);

    useEffect(() => {
      if (!aberto) return;
      function onClick(e) {
        if (ref.current && ref.current.contains(e.target)) return;
        if (popRef.current && popRef.current.contains(e.target)) return;
        setAberto(false);
      }
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }, [aberto]);

    function commit(iso) {
      setTexto(isoToBr(iso));
      onChange && onChange(iso);
      setAberto(false);
    }

    function onTexto(e) {
      let v = e.target.value;
      // Auto-insere barras conforme digita
      v = v.replace(/[^\d/]/g, '');
      if (v.length === 2 && texto.length === 1 && !v.includes('/')) v = v + '/';
      if (v.length === 5 && texto.length === 4 && v.charAt(2) === '/' && !v.slice(3).includes('/')) v = v + '/';
      setTexto(v);
      const iso = brToIso(v);
      if (iso) {
        onChange && onChange(iso);
        const d = parseIso(iso);
        if (d) setView(d);
      }
    }

    function diaClicavel(d) {
      const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (min && iso < min) return null;
      if (max && iso > max) return null;
      return iso;
    }

    // Constroi o grid do mes
    const ano = view.getFullYear();
    const mes = view.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const inicio = new Date(primeiro);
    inicio.setDate(1 - primeiro.getDay());
    const celulas = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      celulas.push(d);
    }

    const hoje = new Date();
    const selecionado = parseIso(value);
    const minD = min ? parseIso(min) : null;
    const maxD = max ? parseIso(max) : null;

    return (
      <div className="bk-date" ref={ref}>
        <input
          type="text"
          className={className || ''}
          name={name || ''}
          value={texto}
          onChange={onTexto}
          onFocus={() => setAberto(true)}
          placeholder={placeholder || 'dd/mm/aaaa'}
          required={required || false}
          autoComplete="off"
          inputMode="numeric"
          maxLength={10}
        />
        <button
          type="button"
          className="bk-date-btn"
          onClick={() => setAberto(!aberto)}
          tabIndex={-1}
          aria-label="Abrir calendário"
        >⌟</button>
        {aberto && (
          <div className="bk-date-pop" ref={popRef} onClick={(e) => e.stopPropagation()}>
            <div className="bk-date-nav">
              <button type="button" onClick={() => setView(new Date(ano, mes - 1, 1))} aria-label="Mês anterior">‹</button>
              <div className="bk-date-mes">{MESES[mes]} {ano}</div>
              <button type="button" onClick={() => setView(new Date(ano, mes + 1, 1))} aria-label="Próximo mês">›</button>
            </div>
            <div className="bk-date-grid">
              {DIAS.map((d, i) => <div key={i} className="bk-date-dh">{d}</div>)}
              {celulas.map((d, i) => {
                const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                const fora = d.getMonth() !== mes;
                const ehHoje = d.toDateString() === hoje.toDateString();
                const ehSel = selecionado && d.toDateString() === selecionado.toDateString();
                const ehHover = hover && d.toDateString() === hover.toDateString();
                const bloqueado = (minD && d < minD) || (maxD && d > maxD);
                return (
                  <button
                    type="button"
                    key={i}
                    className={'bk-date-d' + (fora ? ' fora' : '') + (ehHoje ? ' hoje' : '') + (ehSel ? ' sel' : '') + (ehHover ? ' hover' : '')}
                    onClick={() => { const r = diaClicavel(d); if (r) commit(r); }}
                    onMouseEnter={() => setHover(d)}
                    disabled={bloqueado}
                  >{d.getDate()}</button>
                );
              })}
            </div>
            <div className="bk-date-foot">
              <button type="button" onClick={() => {
                const iso = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
                commit(iso);
              }}>Hoje</button>
              <button type="button" onClick={() => { setTexto(''); onChange && onChange(''); setAberto(false); }}>Limpar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  window.BasckDateInput = { DateInput };
})(window);
