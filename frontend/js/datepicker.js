// frontend/js/datepicker.js
const { useState, useRef, useEffect } = React;

function DateInput(props) {
  const { value, onChange, name, placeholder = 'dd/mm/aaaa', disabled = false, className = '' } = props;
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(value ? formatBR(value) : '');
  const [vy, setVy] = useState(value ? Number(value.slice(0, 4)) : new Date().getFullYear());
  const [vm, setVm] = useState(value ? Number(value.slice(5, 7)) - 1 : new Date().getMonth());
  const ref = useRef(null);

  function formatBR(iso) { if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; }
  function toISO(br) {
    if (!br) return '';
    const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const [, dd, mm, yy] = m;
    const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
    if (d.getFullYear() !== Number(yy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
    return `${yy}-${mm}-${dd}`;
  }
  function handleTyped(e) {
    let v = e.target.value.replace(/[^0-9/]/g, '').slice(0, 10);
    if (v.length === 2 && typed.length === 1 && !v.includes('/')) v = v + '/';
    if (v.length === 5 && typed.length === 4 && !v.slice(5).includes('/')) v = v + '/';
    setTyped(v);
    const iso = toISO(v);
    if (iso && onChange) onChange({ target: { name, value: iso } });
  }
  useEffect(() => { setTyped(value ? formatBR(value) : ''); }, [value]);
  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  useEffect(() => {
    if (open) {
      setVy(value ? Number(value.slice(0, 4)) : new Date().getFullYear());
      setVm(value ? Number(value.slice(5, 7)) - 1 : new Date().getMonth());
    }
  }, [open]);

  const monthName = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][vm];
  const firstDow = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function pick(d) {
    const iso = `${vy}-${String(vm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setOpen(false);
    if (onChange) onChange({ target: { name, value: iso } });
  }
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  return (
    React.createElement('div', { ref, className: 'date-input ' + className },
      React.createElement('input', { type: 'text', inputMode: 'numeric', value: typed, onChange: handleTyped, onFocus: () => setOpen(true), placeholder, disabled, autoComplete: 'off', className: 'date-input-typed' }),
      React.createElement('button', { type: 'button', className: 'date-input-btn', onClick: () => setOpen(o => !o), disabled, 'aria-label': 'Abrir calendário' }, '📅'),
      open ? React.createElement('div', { className: 'date-picker-pop', onMouseDown: e => e.preventDefault() },
        React.createElement('div', { className: 'date-picker-nav' },
          React.createElement('button', { type: 'button', onClick: () => { if (vm === 0) { setVm(11); setVy(vy - 1); } else setVm(vm - 1); } }, '‹'),
          React.createElement('div', { className: 'date-picker-label' }, monthName + ' ' + vy),
          React.createElement('button', { type: 'button', onClick: () => { if (vm === 11) { setVm(0); setVy(vy + 1); } else setVm(vm + 1); } }, '›')
        ),
        React.createElement('div', { className: 'date-picker-grid' },
          ['D','S','T','Q','Q','S','S'].map((d, i) => React.createElement('div', { key: 'dow'+i, className: 'date-picker-dow' }, d)),
          cells.map((d, i) => {
            if (!d) return React.createElement('div', { key: 'e'+i, className: 'date-picker-day empty' });
            const iso = `${vy}-${String(vm+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isSel = iso === value;
            const isToday = iso === todayIso;
            return React.createElement('button', { type: 'button', key: 'd'+d, className: 'date-picker-day' + (isSel ? ' sel' : '') + (isToday ? ' today' : ''), onClick: () => pick(d) }, d);
          })
        ),
        React.createElement('div', { className: 'date-picker-foot' },
          React.createElement('button', { type: 'button', onClick: () => { const t = new Date(); setVy(t.getFullYear()); setVm(t.getMonth()); pick(t.getDate()); } }, 'Hoje'),
          React.createElement('button', { type: 'button', onClick: () => { if (onChange) onChange({ target: { name, value: '' } }); setOpen(false); } }, 'Limpar')
        )
      ) : null,
      React.createElement('input', { type: 'hidden', name, value: value || '' })
    )
  );
}

global.BasckDateInput = DateInput;
