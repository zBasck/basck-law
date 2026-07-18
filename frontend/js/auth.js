// frontend/js/auth.js
// Tela de autenticação
(function (global) {
  const { useState } = React;

  function LoginView({ onAuth }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
    const [nome, setNome] = useState('');
    const [oab, setOab] = useState('');

    async function submit(e) {
      e.preventDefault();
      setErro('');
      setCarregando(true);
      try {
        const fn = modo === 'login' ? BasckApi.auth.login : BasckApi.auth.cadastrar;
        const body = modo === 'login'
          ? { email, senha }
          : { nome, email, senha, oab };
        const data = await fn(body);
        BasckApi.setSession(data);
        onAuth(data.usuario);
      } catch (err) {
        setErro(err.message || 'Falha na autenticação');
      } finally {
        setCarregando(false);
      }
    }

    return (
      <div className="auth-shell">
        <div className="auth-side">
          <div className="brand">
            <div className="mark">B</div>
            <div className="name">Basck <span>Law</span></div>
          </div>
          <div>
            <div className="quote">
              Advocacia <em>inteligente</em><br />
              começa com uma <em>única</em> plataforma.
            </div>
            <div className="cite">— Centralize casos, prazos, clientes e honorários em um só lugar.</div>
          </div>
          <div className="footer-meta">© 2026 Basck Law · Gestão jurídica potencializada por IA</div>
        </div>
        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={submit}>
            <h1 className="serif">{modo === 'login' ? 'Entrar' : 'Criar conta'}</h1>
            <div className="sub">{modo === 'login' ? 'Acesse seu escritório jurídico digital' : 'Comece a usar o Basck Law em segundos'}</div>

            {erro && <div className="err">{erro}</div>}

            {modo === 'cadastro' && (
              <>
                <div className="field">
                  <label>Nome completo</label>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={120} />
                </div>
                <div className="field">
                  <label>OAB (opcional)</label>
                  <input value={oab} onChange={(e) => setOab(e.target.value)} placeholder="Ex: SP123456" maxLength={20} />
                </div>
              </>
            )}
            <div className="field">
              <label>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
            </div>
            <button className="submit" type="submit" disabled={carregando}>
              {carregando ? 'Aguarde...' : (modo === 'login' ? 'Entrar' : 'Criar conta')}
            </button>
            <div className="switch">
              {modo === 'login' ? (
                <>Ainda não tem conta? <button type="button" onClick={() => { setErro(''); setModo('cadastro'); }}>Cadastre-se</button></>
              ) : (
                <>Já tem conta? <button type="button" onClick={() => { setErro(''); setModo('login'); }}>Entrar</button></>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  global.BasckAuth = { LoginView };
})(window);
