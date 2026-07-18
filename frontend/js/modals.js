// frontend/js/modals.js
// Modais de criação/edição (clientes, casos, prazos, tarefas, financeiro, documentos)
(function (global) {
  const { useState, useEffect, useRef } = React;

  function Modal({ titulo, onClose, children, footer, lg }) {
    useEffect(() => {
      const h = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, [onClose]);
    return (
      <div className="modal-bg" onClick={onClose}>
        <div className={'modal' + (lg ? ' lg' : '')} onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h2 className="serif">{titulo}</h2>
            <button className="btn ghost" onClick={onClose}>✕</button>
          </div>
          {children}
          {footer && <div className="modal-foot">{footer}</div>}
        </div>
      </div>
    );
  }

  function useClientesOptions() {
    const [opts, setOpts] = useState([]);
    useEffect(() => {
      BasckApi.clientes.listar().then((r) => setOpts(r.itens || [])).catch(() => {});
    }, []);
    return opts;
  }

  function useCasosOptions() {
    const [opts, setOpts] = useState([]);
    useEffect(() => {
      BasckApi.casos.listar().then((r) => setOpts(r.itens || [])).catch(() => {});
    }, []);
    return opts;
  }

  function Field({ label, children }) {
    return (
      <div className="form-field">
        <label>{label}</label>
        {children}
      </div>
    );
  }

  function ClienteForm({ inicial, onSalvar, onCancelar }) {
    const [dados, setDados] = useState(inicial || { nome: '', documento: '', email: '', telefone: '', endereco: '', observacoes: '' });
    function set(c, v) { setDados({ ...dados, [c]: v }); }
    async function submit(e) {
      e.preventDefault();
      try {
        const r = inicial && inicial.id
          ? await BasckApi.clientes.atualizar(inicial.id, dados)
          : await BasckApi.clientes.criar(dados);
        onSalvar(r.cliente);
      } catch (err) { alert(err.message); }
    }
    return (
      <form onSubmit={submit}>
        <div className="modal-body">
          <Field label="Nome *"><input required value={dados.nome} onChange={(e) => set('nome', e.target.value)} maxLength={160} /></Field>
          <div className="form-row">
            <Field label="CPF/CNPJ"><input value={dados.documento || ''} onChange={(e) => set('documento', e.target.value)} maxLength={20} /></Field>
            <Field label="Telefone"><input value={dados.telefone || ''} onChange={(e) => set('telefone', e.target.value)} maxLength={30} /></Field>
          </div>
          <Field label="E-mail"><input type="email" value={dados.email || ''} onChange={(e) => set('email', e.target.value)} maxLength={120} /></Field>
          <Field label="Endereço"><input value={dados.endereco || ''} onChange={(e) => set('endereco', e.target.value)} maxLength={200} /></Field>
          <Field label="Observações"><textarea value={dados.observacoes || ''} onChange={(e) => set('observacoes', e.target.value)} /></Field>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn primary">{inicial && inicial.id ? 'Salvar alterações' : 'Criar cliente'}</button>
        </div>
      </form>
    );
  }

  function CasoForm({ inicial, onSalvar, onCancelar }) {
    const clientes = useClientesOptions();
    const [dados, setDados] = useState(inicial || {
      cliente_id: clientes[0]?.id || '', titulo: '', numero_processo: '', area: '',
      tribunal: '', instancia: '', valor_causa: '', status: 'em_andamento', descricao: '', data_inicio: ''
    });
    useEffect(() => {
      if (!inicial && clientes.length && !dados.cliente_id) {
        setDados({ ...dados, cliente_id: clientes[0].id });
      }
    }, [clientes]);
    function set(c, v) { setDados({ ...dados, [c]: v }); }
    async function submit(e) {
      e.preventDefault();
      try {
        const payload = { ...dados, valor_causa: dados.valor_causa ? Number(dados.valor_causa) : null };
        const r = inicial && inicial.id
          ? await BasckApi.casos.atualizar(inicial.id, payload)
          : await BasckApi.casos.criar(payload);
        onSalvar(r.caso);
      } catch (err) { alert(err.message); }
    }
    return (
      <form onSubmit={submit}>
        <div className="modal-body">
          <Field label="Cliente *">
            <select required value={dados.cliente_id} onChange={(e) => set('cliente_id', e.target.value)}>
              <option value="">Selecione...</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Field>
          <Field label="Título do caso *"><input required value={dados.titulo} onChange={(e) => set('titulo', e.target.value)} maxLength={200} /></Field>
          <div className="form-row">
            <Field label="Número do processo"><input value={dados.numero_processo || ''} onChange={(e) => set('numero_processo', e.target.value)} maxLength={40} /></Field>
            <Field label="Área"><input value={dados.area || ''} onChange={(e) => set('area', e.target.value)} placeholder="Cível, Trabalhista..." maxLength={60} /></Field>
          </div>
          <div className="form-row">
            <Field label="Tribunal"><input value={dados.tribunal || ''} onChange={(e) => set('tribunal', e.target.value)} maxLength={60} /></Field>
            <Field label="Instância"><input value={dados.instancia || ''} onChange={(e) => set('instancia', e.target.value)} maxLength={40} /></Field>
          </div>
          <div className="form-row">
            <Field label="Valor da causa (R$)"><input type="number" step="0.01" min="0" value={dados.valor_causa || ''} onChange={(e) => set('valor_causa', e.target.value)} /></Field>
            <Field label="Data de início"><input type="date" value={dados.data_inicio || ''} onChange={(e) => set('data_inicio', e.target.value)} /></Field>
          </div>
          <Field label="Status">
            <select value={dados.status} onChange={(e) => set('status', e.target.value)}>
              <option value="em_andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
              <option value="suspenso">Suspenso</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </Field>
          <Field label="Descrição"><textarea value={dados.descricao || ''} onChange={(e) => set('descricao', e.target.value)} /></Field>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn primary">{inicial && inicial.id ? 'Salvar alterações' : 'Criar caso'}</button>
        </div>
      </form>
    );
  }

  function PrazoForm({ inicial, onSalvar, onCancelar, casoIdFixo = null }) {
    const casos = useCasosOptions();
    const [dados, setDados] = useState(inicial || {
      caso_id: casoIdFixo || casos[0]?.id || '',
      titulo: '', descricao: '',
      data_inicio: new Date().toISOString().slice(0, 10),
      data_vencimento: '',
      tipo_dias: 'uteis', prioridade: 'normal', status: 'pendente'
    });
    useEffect(() => {
      if (!inicial && casoIdFixo) setDados({ ...dados, caso_id: casoIdFixo });
      if (!inicial && !casoIdFixo && casos.length && !dados.caso_id) {
        setDados({ ...dados, caso_id: casos[0].id });
      }
    }, [casos, casoIdFixo]);
    function set(c, v) { setDados({ ...dados, [c]: v }); }
    async function submit(e) {
      e.preventDefault();
      try {
        const r = inicial && inicial.id
          ? await BasckApi.prazos.atualizar(inicial.id, dados)
          : await BasckApi.prazos.criar(dados);
        onSalvar(r.prazo);
      } catch (err) { alert(err.message); }
    }
    return (
      <form onSubmit={submit}>
        <div className="modal-body">
          {!casoIdFixo && (
            <Field label="Caso *">
              <select required value={dados.caso_id} onChange={(e) => set('caso_id', e.target.value)}>
                <option value="">Selecione...</option>
                {casos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>
            </Field>
          )}
          <Field label="Título *"><input required value={dados.titulo} onChange={(e) => set('titulo', e.target.value)} maxLength={200} /></Field>
          <Field label="Descrição"><textarea value={dados.descricao || ''} onChange={(e) => set('descricao', e.target.value)} /></Field>
          <div className="form-row">
            <Field label="Data de início *"><input type="date" required value={dados.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} /></Field>
            <Field label="Data de vencimento *"><input type="date" required value={dados.data_vencimento} onChange={(e) => set('data_vencimento', e.target.value)} /></Field>
          </div>
          <div className="form-row">
            <Field label="Contagem">
              <select value={dados.tipo_dias} onChange={(e) => set('tipo_dias', e.target.value)}>
                <option value="uteis">Dias úteis</option>
                <option value="corridos">Dias corridos</option>
              </select>
            </Field>
            <Field label="Prioridade">
              <select value={dados.prioridade} onChange={(e) => set('prioridade', e.target.value)}>
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </Field>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn primary">{inicial && inicial.id ? 'Salvar' : 'Criar prazo'}</button>
        </div>
      </form>
    );
  }

  function TarefaForm({ inicial, onSalvar, onCancelar }) {
    const casos = useCasosOptions();
    const [dados, setDados] = useState(inicial || {
      titulo: '', descricao: '', data_vencimento: '', prioridade: 'normal', status: 'pendente', caso_id: ''
    });
    function set(c, v) { setDados({ ...dados, [c]: v }); }
    async function submit(e) {
      e.preventDefault();
      try {
        const payload = { ...dados, caso_id: dados.caso_id ? Number(dados.caso_id) : null };
        const r = inicial && inicial.id
          ? await BasckApi.tarefas.atualizar(inicial.id, payload)
          : await BasckApi.tarefas.criar(payload);
        onSalvar(r.tarefa);
      } catch (err) { alert(err.message); }
    }
    return (
      <form onSubmit={submit}>
        <div className="modal-body">
          <Field label="Título *"><input required value={dados.titulo} onChange={(e) => set('titulo', e.target.value)} maxLength={200} /></Field>
          <Field label="Descrição"><textarea value={dados.descricao || ''} onChange={(e) => set('descricao', e.target.value)} /></Field>
          <div className="form-row">
            <Field label="Vencimento"><input type="date" value={dados.data_vencimento || ''} onChange={(e) => set('data_vencimento', e.target.value)} /></Field>
            <Field label="Prioridade">
              <select value={dados.prioridade} onChange={(e) => set('prioridade', e.target.value)}>
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </Field>
          </div>
          <Field label="Vincular a caso (opcional)">
            <select value={dados.caso_id || ''} onChange={(e) => set('caso_id', e.target.value)}>
              <option value="">Sem caso</option>
              {casos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
          </Field>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn primary">{inicial && inicial.id ? 'Salvar' : 'Criar tarefa'}</button>
        </div>
      </form>
    );
  }

  function LancamentoForm({ inicial, onSalvar, onCancelar }) {
    const clientes = useClientesOptions();
    const casos = useCasosOptions();
    const [dados, setDados] = useState(inicial || {
      tipo: 'honorario', descricao: '', valor: '',
      data_vencimento: '', data_pagamento: '', forma_pagamento: '',
      status: 'pendente', caso_id: '', cliente_id: '', observacoes: ''
    });
    function set(c, v) { setDados({ ...dados, [c]: v }); }
    async function submit(e) {
      e.preventDefault();
      try {
        const payload = {
          ...dados,
          valor: Number(dados.valor),
          caso_id: dados.caso_id ? Number(dados.caso_id) : null,
          cliente_id: dados.cliente_id ? Number(dados.cliente_id) : null
        };
        const r = inicial && inicial.id
          ? await BasckApi.financeiro.atualizar(inicial.id, payload)
          : await BasckApi.financeiro.criar(payload);
        onSalvar(r.lancamento);
      } catch (err) { alert(err.message); }
    }
    return (
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="form-row">
            <Field label="Tipo *">
              <select value={dados.tipo} onChange={(e) => set('tipo', e.target.value)}>
                <option value="honorario">Honorário</option>
                <option value="despesa">Despesa</option>
                <option value="reembolso">Reembolso</option>
              </select>
            </Field>
            <Field label="Valor (R$) *"><input type="number" step="0.01" min="0" required value={dados.valor} onChange={(e) => set('valor', e.target.value)} /></Field>
          </div>
          <Field label="Descrição *"><input required value={dados.descricao} onChange={(e) => set('descricao', e.target.value)} maxLength={200} /></Field>
          <div className="form-row">
            <Field label="Cliente">
              <select value={dados.cliente_id || ''} onChange={(e) => set('cliente_id', e.target.value)}>
                <option value="">Sem cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Field>
            <Field label="Caso">
              <select value={dados.caso_id || ''} onChange={(e) => set('caso_id', e.target.value)}>
                <option value="">Sem caso</option>
                {casos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>
            </Field>
          </div>
          <div className="form-row">
            <Field label="Vencimento"><input type="date" value={dados.data_vencimento || ''} onChange={(e) => set('data_vencimento', e.target.value)} /></Field>
            <Field label="Data do pagamento"><input type="date" value={dados.data_pagamento || ''} onChange={(e) => set('data_pagamento', e.target.value)} /></Field>
          </div>
          <div className="form-row">
            <Field label="Forma">
              <select value={dados.forma_pagamento || ''} onChange={(e) => set('forma_pagamento', e.target.value)}>
                <option value="">—</option>
                <option value="pix">Pix</option>
                <option value="boleto">Boleto</option>
                <option value="cartao">Cartão</option>
                <option value="transferencia">Transferência</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={dados.status} onChange={(e) => set('status', e.target.value)}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Field>
          </div>
          <Field label="Observações"><textarea value={dados.observacoes || ''} onChange={(e) => set('observacoes', e.target.value)} /></Field>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn primary">{inicial && inicial.id ? 'Salvar' : 'Criar lançamento'}</button>
        </div>
      </form>
    );
  }

  function DocumentoForm({ onSalvar, onCancelar }) {
    const casos = useCasosOptions();
    const [titulo, setTitulo] = useState('');
    const [casoId, setCasoId] = useState('');
    const [descricao, setDescricao] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const fileRef = useRef(null);
    async function submit(e) {
      e.preventDefault();
      if (!arquivo) { alert('Selecione um arquivo'); return; }
      setEnviando(true);
      try {
        const fd = new FormData();
        fd.append('arquivo', arquivo);
        fd.append('titulo', titulo);
        if (casoId) fd.append('caso_id', casoId);
        if (descricao) fd.append('descricao', descricao);
        const r = await BasckApi.documentos.upload(fd);
        onSalvar(r.documento);
      } catch (err) { alert(err.message); }
      finally { setEnviando(false); }
    }
    return (
      <form onSubmit={submit}>
        <div className="modal-body">
          <Field label="Título do documento *"><input required value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={200} /></Field>
          <Field label="Vincular a caso (opcional)">
            <select value={casoId} onChange={(e) => setCasoId(e.target.value)}>
              <option value="">Sem caso</option>
              {casos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
            </select>
          </Field>
          <Field label="Descrição (opcional)"><textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} /></Field>
          <Field label="Arquivo *">
            <input ref={fileRef} type="file" required onChange={(e) => {
              const f = e.target.files[0];
              if (f) { setArquivo(f); if (!titulo) setTitulo(f.name.replace(/\.[^.]+$/, '')); }
            }} />
          </Field>
          {arquivo && <div className="tiny">Tamanho: {(arquivo.size / 1024).toFixed(1)} KB · {arquivo.type || 'tipo desconhecido'}</div>}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn primary" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar documento'}</button>
        </div>
      </form>
    );
  }

  global.BasckModals = { Modal, ClienteForm, CasoForm, PrazoForm, TarefaForm, LancamentoForm, DocumentoForm };
})(window);
