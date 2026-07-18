// frontend/js/app.js
// App principal: roteamento entre views, sidebar, toasts
const { useState, useEffect, useCallback } = React;

function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [view, setView] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  const toast = useCallback((msg, tipo = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, tipo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    const sess = BasckApi.getSession();
    if (sess && sess.token && sess.usuario) {
      // Valida token em background (silencioso se der erro)
      BasckApi.auth.perfil()
        .then((r) => setUsuario(r.usuario))
        .catch(() => { BasckApi.clearSession(); setUsuario(null); })
        .finally(() => setVerificando(false));
    } else {
      setVerificando(false);
    }
  }, []);

  function logout() {
    BasckApi.clearSession();
    setUsuario(null);
  }

  if (verificando) {
    return <div className="loading" style={{ height: '100vh' }}><div className="spinner" />Carregando Basck Law...</div>;
  }

  if (!usuario) {
    return <BasckAuth.LoginView onAuth={setUsuario} />;
  }

  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'casos', label: 'Casos', icon: '§' },
    { id: 'prazos', label: 'Prazos', icon: '◷' },
    { id: 'tarefas', label: 'Tarefas', icon: '✓' },
    { id: 'clientes', label: 'Clientes', icon: '☉' },
    { id: 'documentos', label: 'Documentos', icon: '⊟' },
    { id: 'financeiro', label: 'Financeiro', icon: '⌬' },
    { id: 'configuracoes', label: 'Configurações', icon: '⚙' }
  ];

  const titulos = {
    dashboard: { t: 'Dashboard', s: 'Visão geral do seu escritório' },
    casos: { t: 'Casos', s: 'Processos e pastas digitais' },
    prazos: { t: 'Prazos', s: 'Compromissos e contagens processuais' },
    tarefas: { t: 'Tarefas', s: 'Atividades do dia a dia' },
    clientes: { t: 'Clientes', s: 'Sua carteira de clientes' },
    documentos: { t: 'Documentos', s: 'Arquivos e uploads' },
    financeiro: { t: 'Financeiro', s: 'Honorários, cobranças e relatórios' },
    configuracoes: { t: 'Configurações', s: 'Perfil e conta' }
  };

  function renderView() {
    const props = { toast };
    switch (view) {
      case 'dashboard': return <BasckUI.DashboardView irPara={setView} {...props} />;
      case 'casos': return <BasckUI.CasosView {...props} />;
      case 'prazos': return <BasckUI.PrazosView {...props} />;
      case 'tarefas': return <BasckUI.TarefasView {...props} />;
      case 'clientes': return <BasckUI.ClientesView {...props} />;
      case 'documentos': return <BasckUI.DocumentosView {...props} />;
      case 'financeiro': return <BasckUI.FinanceiroView {...props} />;
      case 'configuracoes': return <BasckUI.ConfiguracoesView usuario={usuario} onAtualizar={setUsuario} {...props} />;
      default: return null;
    }
  }

  const meta = titulos[view] || { t: 'Basck Law', s: '' };
  const iniciais = (usuario.nome || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="app">
      <aside className={'sidebar' + (menuAberto ? ' open' : '')}>
        <div className="brand">
          <div className="mark">B</div>
          <div className="name">Basck <span style={{ color: 'var(--gold)' }}>Law</span></div>
        </div>
        <nav className="nav">
          {nav.map((n) => (
            <button key={n.id} className={'nav-item' + (view === n.id ? ' active' : '')} onClick={() => { setView(n.id); setMenuAberto(false); }}>
              <span className="ico">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="user-card">
          <div className="avatar">{iniciais}</div>
          <div className="info">
            <div className="name">{usuario.nome}</div>
            <div className="email">{usuario.email}</div>
          </div>
          <button className="logout" onClick={logout} title="Sair">⎋</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="title serif">{meta.t}</div>
            <div className="sub">{meta.s}</div>
          </div>
          <div className="actions">
            <button className="menu-btn btn" onClick={() => setMenuAberto(!menuAberto)}>☰</button>
          </div>
        </div>
        {renderView()}
      </main>

      <div className="toast-area">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + (t.tipo === 'error' ? 'error' : t.tipo === 'success' ? 'success' : '')}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
