(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var require_stage = __commonJS({
    "frontend/dist/_stage.jsx"() {
      (function() {
        const { useState, useRef, useEffect } = React;
        function DateInput2(props) {
          const { value, onChange, name, placeholder = "dd/mm/aaaa", disabled = false, className = "" } = props;
          const [open, setOpen] = useState(false);
          const [typed, setTyped] = useState(value ? formatBR(value) : "");
          const [vy, setVy] = useState(value ? Number(value.slice(0, 4)) : (/* @__PURE__ */ new Date()).getFullYear());
          const [vm, setVm] = useState(value ? Number(value.slice(5, 7)) - 1 : (/* @__PURE__ */ new Date()).getMonth());
          const ref = useRef(null);
          function formatBR(iso) {
            if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
            const [y, m, d] = iso.split("-");
            return `${d}/${m}/${y}`;
          }
          function toISO(br) {
            if (!br) return "";
            const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            if (!m) return null;
            const [, dd, mm, yy] = m;
            const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
            if (d.getFullYear() !== Number(yy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
            return `${yy}-${mm}-${dd}`;
          }
          function handleTyped(e) {
            let v = e.target.value.replace(/[^0-9/]/g, "").slice(0, 10);
            if (v.length === 2 && typed.length === 1 && !v.includes("/")) v = v + "/";
            if (v.length === 5 && typed.length === 4 && !v.slice(5).includes("/")) v = v + "/";
            setTyped(v);
            const iso = toISO(v);
            if (iso && onChange) onChange({ target: { name, value: iso } });
          }
          useEffect(() => {
            setTyped(value ? formatBR(value) : "");
          }, [value]);
          useEffect(() => {
            function onDoc(e) {
              if (ref.current && !ref.current.contains(e.target)) setOpen(false);
            }
            document.addEventListener("mousedown", onDoc);
            return () => document.removeEventListener("mousedown", onDoc);
          }, []);
          useEffect(() => {
            if (open) {
              setVy(value ? Number(value.slice(0, 4)) : (/* @__PURE__ */ new Date()).getFullYear());
              setVm(value ? Number(value.slice(5, 7)) - 1 : (/* @__PURE__ */ new Date()).getMonth());
            }
          }, [open]);
          const monthName = ["Janeiro", "Fevereiro", "Mar\xE7o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][vm];
          const firstDow = new Date(vy, vm, 1).getDay();
          const daysInMonth = new Date(vy, vm + 1, 0).getDate();
          const cells = [];
          for (let i = 0; i < firstDow; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          function pick(d) {
            const iso = `${vy}-${String(vm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            setOpen(false);
            if (onChange) onChange({ target: { name, value: iso } });
          }
          const today = /* @__PURE__ */ new Date();
          const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          return React.createElement(
            "div",
            { ref, className: "date-input " + className },
            React.createElement("input", { type: "text", inputMode: "numeric", value: typed, onChange: handleTyped, onFocus: () => setOpen(true), placeholder, disabled, autoComplete: "off", className: "date-input-typed" }),
            React.createElement("button", { type: "button", className: "date-input-btn", onClick: () => setOpen((o) => !o), disabled, "aria-label": "Abrir calend\xE1rio" }, "\u{1F4C5}"),
            open ? React.createElement(
              "div",
              { className: "date-picker-pop", onMouseDown: (e) => e.preventDefault() },
              React.createElement(
                "div",
                { className: "date-picker-nav" },
                React.createElement("button", { type: "button", onClick: () => {
                  if (vm === 0) {
                    setVm(11);
                    setVy(vy - 1);
                  } else setVm(vm - 1);
                } }, "\u2039"),
                React.createElement("div", { className: "date-picker-label" }, monthName + " " + vy),
                React.createElement("button", { type: "button", onClick: () => {
                  if (vm === 11) {
                    setVm(0);
                    setVy(vy + 1);
                  } else setVm(vm + 1);
                } }, "\u203A")
              ),
              React.createElement(
                "div",
                { className: "date-picker-grid" },
                ["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => React.createElement("div", { key: "dow" + i, className: "date-picker-dow" }, d)),
                cells.map((d, i) => {
                  if (!d) return React.createElement("div", { key: "e" + i, className: "date-picker-day empty" });
                  const iso = `${vy}-${String(vm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const isSel = iso === value;
                  const isToday = iso === todayIso;
                  return React.createElement("button", { type: "button", key: "d" + d, className: "date-picker-day" + (isSel ? " sel" : "") + (isToday ? " today" : ""), onClick: () => pick(d) }, d);
                })
              ),
              React.createElement(
                "div",
                { className: "date-picker-foot" },
                React.createElement("button", { type: "button", onClick: () => {
                  const t = /* @__PURE__ */ new Date();
                  setVy(t.getFullYear());
                  setVm(t.getMonth());
                  pick(t.getDate());
                } }, "Hoje"),
                React.createElement("button", { type: "button", onClick: () => {
                  if (onChange) onChange({ target: { name, value: "" } });
                  setOpen(false);
                } }, "Limpar")
              )
            ) : null,
            React.createElement("input", { type: "hidden", name, value: value || "" })
          );
        }
        global.BasckDateInput = DateInput2;
      })();
      (function() {
        (function(global2) {
          const STORAGE_KEY = "basck-law-auth";
          function getToken() {
            try {
              const raw = localStorage.getItem(STORAGE_KEY);
              if (!raw) return null;
              return JSON.parse(raw).token || null;
            } catch (_) {
              return null;
            }
          }
          function setSession(data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
          function clearSession() {
            localStorage.removeItem(STORAGE_KEY);
          }
          function getSession() {
            try {
              const raw = localStorage.getItem(STORAGE_KEY);
              return raw ? JSON.parse(raw) : null;
            } catch (_) {
              return null;
            }
          }
          async function request(path, { method = "GET", body = null, isForm = false } = {}) {
            const headers = {};
            const token = getToken();
            if (token) headers["Authorization"] = "Bearer " + token;
            let payload;
            if (isForm) {
              payload = body;
            } else if (body) {
              headers["Content-Type"] = "application/json";
              payload = JSON.stringify(body);
            }
            const res = await fetch(path, { method, headers, body: payload });
            const text = await res.text();
            let data;
            try {
              data = text ? JSON.parse(text) : null;
            } catch (_) {
              data = { erro: text };
            }
            if (!res.ok) {
              if (res.status === 401) {
                clearSession();
                if (global2.location && global2.location.pathname !== "/") global2.location.href = "/";
              }
              const erro = new Error(data && data.erro || `Erro ${res.status}`);
              erro.status = res.status;
              erro.data = data;
              throw erro;
            }
            return data;
          }
          const api = {
            getToken,
            setSession,
            clearSession,
            getSession,
            saude: () => request("/api/saude"),
            auth: {
              cadastrar: (d) => request("/api/auth/cadastro", { method: "POST", body: d }),
              login: (d) => request("/api/auth/login", { method: "POST", body: d }),
              perfil: () => request("/api/auth/perfil"),
              atualizarPerfil: (d) => request("/api/auth/perfil", { method: "PUT", body: d })
            },
            clientes: {
              listar: () => request("/api/clientes"),
              buscar: (id) => request(`/api/clientes/${id}`),
              criar: (d) => request("/api/clientes", { method: "POST", body: d }),
              atualizar: (id, d) => request(`/api/clientes/${id}`, { method: "PUT", body: d }),
              remover: (id) => request(`/api/clientes/${id}`, { method: "DELETE" })
            },
            casos: {
              listar: (params = {}) => {
                const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== "")).toString();
                return request("/api/casos" + (q ? "?" + q : ""));
              },
              estatisticas: () => request("/api/casos/estatisticas"),
              buscar: (id) => request(`/api/casos/${id}`),
              criar: (d) => request("/api/casos", { method: "POST", body: d }),
              atualizar: (id, d) => request(`/api/casos/${id}`, { method: "PUT", body: d }),
              remover: (id) => request(`/api/casos/${id}`, { method: "DELETE" })
            },
            prazos: {
              listar: (params = {}) => {
                const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== "")).toString();
                return request("/api/prazos" + (q ? "?" + q : ""));
              },
              proximos: (dias = 7) => request(`/api/prazos/proximos?dias=${dias}`),
              criar: (d) => request("/api/prazos", { method: "POST", body: d }),
              atualizar: (id, d) => request(`/api/prazos/${id}`, { method: "PUT", body: d }),
              concluir: (id) => request(`/api/prazos/${id}/concluir`, { method: "POST" }),
              reabrir: (id) => request(`/api/prazos/${id}/reabrir`, { method: "POST" }),
              remover: (id) => request(`/api/prazos/${id}`, { method: "DELETE" })
            },
            tarefas: {
              listar: (params = {}) => {
                const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== "")).toString();
                return request("/api/tarefas" + (q ? "?" + q : ""));
              },
              criar: (d) => request("/api/tarefas", { method: "POST", body: d }),
              atualizar: (id, d) => request(`/api/tarefas/${id}`, { method: "PUT", body: d }),
              concluir: (id) => request(`/api/tarefas/${id}/concluir`, { method: "POST" }),
              remover: (id) => request(`/api/tarefas/${id}`, { method: "DELETE" })
            },
            documentos: {
              listar: (caso_id = null) => request("/api/documentos" + (caso_id ? `?caso_id=${caso_id}` : "")),
              espaco: () => request("/api/documentos/espaco"),
              upload: (formData) => request("/api/documentos", { method: "POST", body: formData, isForm: true }),
              downloadUrl: (id) => "/api/documentos/" + id + "/download",
              remover: (id) => request(`/api/documentos/${id}`, { method: "DELETE" })
            },
            busca: (q) => request("/api/busca?q=" + encodeURIComponent(q)),
            financeiro: {
              listar: (params = {}) => {
                const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== "")).toString();
                return request("/api/financeiro" + (q ? "?" + q : ""));
              },
              resumo: () => request("/api/financeiro/resumo"),
              criar: (d) => request("/api/financeiro", { method: "POST", body: d }),
              atualizar: (id, d) => request(`/api/financeiro/${id}`, { method: "PUT", body: d }),
              marcarPago: (id, d) => request(`/api/financeiro/${id}/marcar-pago`, { method: "POST", body: d }),
              remover: (id) => request(`/api/financeiro/${id}`, { method: "DELETE" }),
              csvUrl: () => "/api/financeiro/exportar.csv"
            },
            compromissos: {
              listar: (params = {}) => {
                const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== "")).toString();
                return request("/api/compromissos" + (q ? "?" + q : ""));
              },
              proximos: (dias = 7) => request("/api/compromissos/proximos?dias=" + dias),
              buscar: (id) => request("/api/compromissos/" + id),
              criar: (d) => request("/api/compromissos", { method: "POST", body: d }),
              atualizar: (id, d) => request("/api/compromissos/" + id, { method: "PUT", body: d }),
              remover: (id) => request("/api/compromissos/" + id, { method: "DELETE" })
            },
            kanban: {
              listar: () => request("/api/kanban"),
              criar: (d) => request("/api/kanban", { method: "POST", body: d }),
              mover: (id, coluna, posicao = 0) => request("/api/kanban/" + id + "/mover", { method: "PUT", body: { coluna, posicao } }),
              remover: (id) => request("/api/kanban/" + id, { method: "DELETE" })
            },
            integracoes: {
              tribunaisSuportados: () => request("/api/integracoes/tribunais"),
              listar: () => request("/api/integracoes"),
              buscar: (id) => request("/api/integracoes/" + id),
              criar: (d) => request("/api/integracoes", { method: "POST", body: d }),
              atualizar: (id, d) => request("/api/integracoes/" + id, { method: "PUT", body: d }),
              remover: (id) => request("/api/integracoes/" + id, { method: "DELETE" }),
              consultar: (id) => request("/api/integracoes/" + id + "/consultar", { method: "POST" }),
              oab: {
                listar: () => request("/api/integracoes/oab/listar"),
                adicionar: (d) => request("/api/integracoes/oab", { method: "POST", body: d }),
                remover: (id) => request("/api/integracoes/oab/" + id, { method: "DELETE" }),
                verificar: () => request("/api/integracoes/oab/verificar", { method: "POST" })
              }
            }
          };
          global2.BasckApi = api;
        })(window);
      })();
      (function() {
        (function(global2) {
          const { useState } = React;
          function LoginView({ onAuth }) {
            const [email, setEmail] = useState("");
            const [senha, setSenha] = useState("");
            const [erro, setErro] = useState("");
            const [carregando, setCarregando] = useState(false);
            const [modo, setModo] = useState("login");
            const [nome, setNome] = useState("");
            const [oab, setOab] = useState("");
            async function submit(e) {
              e.preventDefault();
              setErro("");
              setCarregando(true);
              try {
                const fn = modo === "login" ? BasckApi.auth.login : BasckApi.auth.cadastrar;
                const body = modo === "login" ? { email, senha } : { nome, email, senha, oab };
                const data = await fn(body);
                BasckApi.setSession(data);
                onAuth(data.usuario);
              } catch (err) {
                setErro(err.message || "Falha na autentica\xE7\xE3o");
              } finally {
                setCarregando(false);
              }
            }
            return /* @__PURE__ */ React.createElement("div", { className: "auth-shell" }, /* @__PURE__ */ React.createElement("div", { className: "auth-side" }, /* @__PURE__ */ React.createElement("div", { className: "brand" }, /* @__PURE__ */ React.createElement("div", { className: "mark" }, "B"), /* @__PURE__ */ React.createElement("div", { className: "name" }, "Basck ", /* @__PURE__ */ React.createElement("span", null, "Law"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "quote" }, "Advocacia ", /* @__PURE__ */ React.createElement("em", null, "inteligente"), /* @__PURE__ */ React.createElement("br", null), "come\xE7a com uma ", /* @__PURE__ */ React.createElement("em", null, "\xFAnica"), " plataforma."), /* @__PURE__ */ React.createElement("div", { className: "cite" }, "\u2014 Centralize casos, prazos, clientes e honor\xE1rios em um s\xF3 lugar.")), /* @__PURE__ */ React.createElement("div", { className: "footer-meta" }, "\xA9 2026 Basck Law \xB7 Gest\xE3o jur\xEDdica potencializada por IA")), /* @__PURE__ */ React.createElement("div", { className: "auth-form-wrap" }, /* @__PURE__ */ React.createElement("form", { className: "auth-form", onSubmit: submit }, /* @__PURE__ */ React.createElement("h1", { className: "serif" }, modo === "login" ? "Entrar" : "Criar conta"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, modo === "login" ? "Acesse seu escrit\xF3rio jur\xEDdico digital" : "Comece a usar o Basck Law em segundos"), erro && /* @__PURE__ */ React.createElement("div", { className: "err" }, erro), modo === "cadastro" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "Nome completo"), /* @__PURE__ */ React.createElement("input", { value: nome, onChange: (e) => setNome(e.target.value), required: true, maxLength: 120 })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "OAB (opcional)"), /* @__PURE__ */ React.createElement("input", { value: oab, onChange: (e) => setOab(e.target.value), placeholder: "Ex: SP123456", maxLength: 20 }))), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "E-mail"), /* @__PURE__ */ React.createElement("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "Senha"), /* @__PURE__ */ React.createElement("input", { type: "password", value: senha, onChange: (e) => setSenha(e.target.value), required: true, minLength: 6 })), /* @__PURE__ */ React.createElement("button", { className: "submit", type: "submit", disabled: carregando }, carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"), /* @__PURE__ */ React.createElement("div", { className: "switch" }, modo === "login" ? /* @__PURE__ */ React.createElement(React.Fragment, null, "Ainda n\xE3o tem conta? ", /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
              setErro("");
              setModo("cadastro");
            } }, "Cadastre-se")) : /* @__PURE__ */ React.createElement(React.Fragment, null, "J\xE1 tem conta? ", /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
              setErro("");
              setModo("login");
            } }, "Entrar"))))));
          }
          global2.BasckAuth = { LoginView };
        })(window);
      })();
      (function() {
        (function(global2) {
          const { useState, useEffect, useRef } = React;
          function Modal({ titulo, onClose, children, footer, lg }) {
            useEffect(() => {
              const h = (e) => {
                if (e.key === "Escape") onClose();
              };
              window.addEventListener("keydown", h);
              return () => window.removeEventListener("keydown", h);
            }, [onClose]);
            return /* @__PURE__ */ React.createElement("div", { className: "modal-bg", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "modal" + (lg ? " lg" : ""), onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement("h2", { className: "serif" }, titulo), /* @__PURE__ */ React.createElement("button", { className: "btn ghost", onClick: onClose }, "\u2715")), children, footer && /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, footer)));
          }
          function useClientesOptions() {
            const [opts, setOpts] = useState([]);
            useEffect(() => {
              BasckApi.clientes.listar().then((r) => setOpts(r.itens || [])).catch(() => {
              });
            }, []);
            return opts;
          }
          function useCasosOptions() {
            const [opts, setOpts] = useState([]);
            useEffect(() => {
              BasckApi.casos.listar().then((r) => setOpts(r.itens || [])).catch(() => {
              });
            }, []);
            return opts;
          }
          function Field({ label, children }) {
            return /* @__PURE__ */ React.createElement("div", { className: "form-field" }, /* @__PURE__ */ React.createElement("label", null, label), children);
          }
          function ClienteForm({ inicial, onSalvar, onCancelar }) {
            const [dados, setDados] = useState(inicial || { nome: "", documento: "", email: "", telefone: "", endereco: "", observacoes: "" });
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function submit(e) {
              e.preventDefault();
              try {
                const r = inicial && inicial.id ? await BasckApi.clientes.atualizar(inicial.id, dados) : await BasckApi.clientes.criar(dados);
                onSalvar(r.cliente);
              } catch (err) {
                alert(err.message);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(Field, { label: "Nome *" }, /* @__PURE__ */ React.createElement("input", { required: true, value: dados.nome, onChange: (e) => set("nome", e.target.value), maxLength: 160 })), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "CPF/CNPJ" }, /* @__PURE__ */ React.createElement("input", { value: dados.documento || "", onChange: (e) => set("documento", e.target.value), maxLength: 20 })), /* @__PURE__ */ React.createElement(Field, { label: "Telefone" }, /* @__PURE__ */ React.createElement("input", { value: dados.telefone || "", onChange: (e) => set("telefone", e.target.value), maxLength: 30 }))), /* @__PURE__ */ React.createElement(Field, { label: "E-mail" }, /* @__PURE__ */ React.createElement("input", { type: "email", value: dados.email || "", onChange: (e) => set("email", e.target.value), maxLength: 120 })), /* @__PURE__ */ React.createElement(Field, { label: "Endere\xE7o" }, /* @__PURE__ */ React.createElement("input", { value: dados.endereco || "", onChange: (e) => set("endereco", e.target.value), maxLength: 200 })), /* @__PURE__ */ React.createElement(Field, { label: "Observa\xE7\xF5es" }, /* @__PURE__ */ React.createElement("textarea", { value: dados.observacoes || "", onChange: (e) => set("observacoes", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, inicial && inicial.id ? "Salvar altera\xE7\xF5es" : "Criar cliente")));
          }
          function CasoForm({ inicial, onSalvar, onCancelar }) {
            var _a;
            const clientes = useClientesOptions();
            const [dados, setDados] = useState(inicial || {
              cliente_id: ((_a = clientes[0]) == null ? void 0 : _a.id) || "",
              titulo: "",
              numero_processo: "",
              area: "",
              tribunal: "",
              instancia: "",
              valor_causa: "",
              status: "em_andamento",
              descricao: "",
              data_inicio: ""
            });
            useEffect(() => {
              if (!inicial && clientes.length && !dados.cliente_id) {
                setDados({ ...dados, cliente_id: clientes[0].id });
              }
            }, [clientes]);
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function submit(e) {
              e.preventDefault();
              try {
                const payload = { ...dados, valor_causa: dados.valor_causa ? Number(dados.valor_causa) : null };
                const r = inicial && inicial.id ? await BasckApi.casos.atualizar(inicial.id, payload) : await BasckApi.casos.criar(payload);
                onSalvar(r.caso);
              } catch (err) {
                alert(err.message);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(Field, { label: "Cliente *" }, /* @__PURE__ */ React.createElement("select", { required: true, value: dados.cliente_id, onChange: (e) => set("cliente_id", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione..."), clientes.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.nome)))), /* @__PURE__ */ React.createElement(Field, { label: "T\xEDtulo do caso *" }, /* @__PURE__ */ React.createElement("input", { required: true, value: dados.titulo, onChange: (e) => set("titulo", e.target.value), maxLength: 200 })), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "N\xFAmero do processo" }, /* @__PURE__ */ React.createElement("input", { value: dados.numero_processo || "", onChange: (e) => set("numero_processo", e.target.value), maxLength: 40 })), /* @__PURE__ */ React.createElement(Field, { label: "\xC1rea" }, /* @__PURE__ */ React.createElement("input", { value: dados.area || "", onChange: (e) => set("area", e.target.value), placeholder: "C\xEDvel, Trabalhista...", maxLength: 60 }))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Tribunal" }, /* @__PURE__ */ React.createElement("input", { value: dados.tribunal || "", onChange: (e) => set("tribunal", e.target.value), maxLength: 60 })), /* @__PURE__ */ React.createElement(Field, { label: "Inst\xE2ncia" }, /* @__PURE__ */ React.createElement("input", { value: dados.instancia || "", onChange: (e) => set("instancia", e.target.value), maxLength: 40 }))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Valor da causa (R$)" }, /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.01", min: "0", value: dados.valor_causa || "", onChange: (e) => set("valor_causa", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Data de in\xEDcio" }, /* @__PURE__ */ React.createElement(DateInput, { value: dados.data_inicio || "", onChange: (e) => set("data_inicio", e.target.value) }))), /* @__PURE__ */ React.createElement(Field, { label: "Status" }, /* @__PURE__ */ React.createElement("select", { value: dados.status, onChange: (e) => set("status", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "em_andamento" }, "Em andamento"), /* @__PURE__ */ React.createElement("option", { value: "concluido" }, "Conclu\xEDdo"), /* @__PURE__ */ React.createElement("option", { value: "suspenso" }, "Suspenso"), /* @__PURE__ */ React.createElement("option", { value: "arquivado" }, "Arquivado"))), /* @__PURE__ */ React.createElement(Field, { label: "Descri\xE7\xE3o" }, /* @__PURE__ */ React.createElement("textarea", { value: dados.descricao || "", onChange: (e) => set("descricao", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, inicial && inicial.id ? "Salvar altera\xE7\xF5es" : "Criar caso")));
          }
          function PrazoForm({ inicial, onSalvar, onCancelar, casoIdFixo = null }) {
            var _a;
            const casos = useCasosOptions();
            const [dados, setDados] = useState(inicial || {
              caso_id: casoIdFixo || ((_a = casos[0]) == null ? void 0 : _a.id) || "",
              titulo: "",
              descricao: "",
              data_inicio: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
              data_vencimento: "",
              tipo_dias: "uteis",
              prioridade: "normal",
              status: "pendente"
            });
            useEffect(() => {
              if (!inicial && casoIdFixo) setDados({ ...dados, caso_id: casoIdFixo });
              if (!inicial && !casoIdFixo && casos.length && !dados.caso_id) {
                setDados({ ...dados, caso_id: casos[0].id });
              }
            }, [casos, casoIdFixo]);
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function submit(e) {
              e.preventDefault();
              try {
                const r = inicial && inicial.id ? await BasckApi.prazos.atualizar(inicial.id, dados) : await BasckApi.prazos.criar(dados);
                onSalvar(r.prazo);
              } catch (err) {
                alert(err.message);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, !casoIdFixo && /* @__PURE__ */ React.createElement(Field, { label: "Caso *" }, /* @__PURE__ */ React.createElement("select", { required: true, value: dados.caso_id, onChange: (e) => set("caso_id", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione..."), casos.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.titulo)))), /* @__PURE__ */ React.createElement(Field, { label: "T\xEDtulo *" }, /* @__PURE__ */ React.createElement("input", { required: true, value: dados.titulo, onChange: (e) => set("titulo", e.target.value), maxLength: 200 })), /* @__PURE__ */ React.createElement(Field, { label: "Descri\xE7\xE3o" }, /* @__PURE__ */ React.createElement("textarea", { value: dados.descricao || "", onChange: (e) => set("descricao", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Data de in\xEDcio *" }, /* @__PURE__ */ React.createElement(DateInput, { value: dados.data_inicio, onChange: (e) => set("data_inicio", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Data de vencimento *" }, /* @__PURE__ */ React.createElement(DateInput, { value: dados.data_vencimento, onChange: (e) => set("data_vencimento", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Contagem" }, /* @__PURE__ */ React.createElement("select", { value: dados.tipo_dias, onChange: (e) => set("tipo_dias", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "uteis" }, "Dias \xFAteis"), /* @__PURE__ */ React.createElement("option", { value: "corridos" }, "Dias corridos"))), /* @__PURE__ */ React.createElement(Field, { label: "Prioridade" }, /* @__PURE__ */ React.createElement("select", { value: dados.prioridade, onChange: (e) => set("prioridade", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "baixa" }, "Baixa"), /* @__PURE__ */ React.createElement("option", { value: "normal" }, "Normal"), /* @__PURE__ */ React.createElement("option", { value: "alta" }, "Alta"), /* @__PURE__ */ React.createElement("option", { value: "urgente" }, "Urgente"))))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, inicial && inicial.id ? "Salvar" : "Criar prazo")));
          }
          function TarefaForm({ inicial, onSalvar, onCancelar }) {
            const casos = useCasosOptions();
            const [dados, setDados] = useState(inicial || {
              titulo: "",
              descricao: "",
              data_vencimento: "",
              prioridade: "normal",
              status: "pendente",
              caso_id: ""
            });
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function submit(e) {
              e.preventDefault();
              try {
                const payload = { ...dados, caso_id: dados.caso_id ? Number(dados.caso_id) : null };
                const r = inicial && inicial.id ? await BasckApi.tarefas.atualizar(inicial.id, payload) : await BasckApi.tarefas.criar(payload);
                onSalvar(r.tarefa);
              } catch (err) {
                alert(err.message);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(Field, { label: "T\xEDtulo *" }, /* @__PURE__ */ React.createElement("input", { required: true, value: dados.titulo, onChange: (e) => set("titulo", e.target.value), maxLength: 200 })), /* @__PURE__ */ React.createElement(Field, { label: "Descri\xE7\xE3o" }, /* @__PURE__ */ React.createElement("textarea", { value: dados.descricao || "", onChange: (e) => set("descricao", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Vencimento" }, /* @__PURE__ */ React.createElement(DateInput, { value: dados.data_vencimento || "", onChange: (e) => set("data_vencimento", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Prioridade" }, /* @__PURE__ */ React.createElement("select", { value: dados.prioridade, onChange: (e) => set("prioridade", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "baixa" }, "Baixa"), /* @__PURE__ */ React.createElement("option", { value: "normal" }, "Normal"), /* @__PURE__ */ React.createElement("option", { value: "alta" }, "Alta"), /* @__PURE__ */ React.createElement("option", { value: "urgente" }, "Urgente")))), /* @__PURE__ */ React.createElement(Field, { label: "Vincular a caso (opcional)" }, /* @__PURE__ */ React.createElement("select", { value: dados.caso_id || "", onChange: (e) => set("caso_id", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Sem caso"), casos.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.titulo))))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, inicial && inicial.id ? "Salvar" : "Criar tarefa")));
          }
          function LancamentoForm({ inicial, onSalvar, onCancelar }) {
            const clientes = useClientesOptions();
            const casos = useCasosOptions();
            const [dados, setDados] = useState(inicial || {
              tipo: "honorario",
              descricao: "",
              valor: "",
              data_vencimento: "",
              data_pagamento: "",
              forma_pagamento: "",
              status: "pendente",
              caso_id: "",
              cliente_id: "",
              observacoes: ""
            });
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function submit(e) {
              e.preventDefault();
              try {
                const payload = {
                  ...dados,
                  valor: Number(dados.valor),
                  caso_id: dados.caso_id ? Number(dados.caso_id) : null,
                  cliente_id: dados.cliente_id ? Number(dados.cliente_id) : null
                };
                const r = inicial && inicial.id ? await BasckApi.financeiro.atualizar(inicial.id, payload) : await BasckApi.financeiro.criar(payload);
                onSalvar(r.lancamento);
              } catch (err) {
                alert(err.message);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Tipo *" }, /* @__PURE__ */ React.createElement("select", { value: dados.tipo, onChange: (e) => set("tipo", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "honorario" }, "Honor\xE1rio"), /* @__PURE__ */ React.createElement("option", { value: "despesa" }, "Despesa"), /* @__PURE__ */ React.createElement("option", { value: "reembolso" }, "Reembolso"))), /* @__PURE__ */ React.createElement(Field, { label: "Valor (R$) *" }, /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.01", min: "0", required: true, value: dados.valor, onChange: (e) => set("valor", e.target.value) }))), /* @__PURE__ */ React.createElement(Field, { label: "Descri\xE7\xE3o *" }, /* @__PURE__ */ React.createElement("input", { required: true, value: dados.descricao, onChange: (e) => set("descricao", e.target.value), maxLength: 200 })), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Cliente" }, /* @__PURE__ */ React.createElement("select", { value: dados.cliente_id || "", onChange: (e) => set("cliente_id", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Sem cliente"), clientes.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.nome)))), /* @__PURE__ */ React.createElement(Field, { label: "Caso" }, /* @__PURE__ */ React.createElement("select", { value: dados.caso_id || "", onChange: (e) => set("caso_id", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Sem caso"), casos.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.titulo))))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Vencimento" }, /* @__PURE__ */ React.createElement(DateInput, { value: dados.data_vencimento || "", onChange: (e) => set("data_vencimento", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Data do pagamento" }, /* @__PURE__ */ React.createElement(DateInput, { value: dados.data_pagamento || "", onChange: (e) => set("data_pagamento", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Forma" }, /* @__PURE__ */ React.createElement("select", { value: dados.forma_pagamento || "", onChange: (e) => set("forma_pagamento", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014"), /* @__PURE__ */ React.createElement("option", { value: "pix" }, "Pix"), /* @__PURE__ */ React.createElement("option", { value: "boleto" }, "Boleto"), /* @__PURE__ */ React.createElement("option", { value: "cartao" }, "Cart\xE3o"), /* @__PURE__ */ React.createElement("option", { value: "transferencia" }, "Transfer\xEAncia"), /* @__PURE__ */ React.createElement("option", { value: "dinheiro" }, "Dinheiro"))), /* @__PURE__ */ React.createElement(Field, { label: "Status" }, /* @__PURE__ */ React.createElement("select", { value: dados.status, onChange: (e) => set("status", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "pendente" }, "Pendente"), /* @__PURE__ */ React.createElement("option", { value: "pago" }, "Pago"), /* @__PURE__ */ React.createElement("option", { value: "cancelado" }, "Cancelado")))), /* @__PURE__ */ React.createElement(Field, { label: "Observa\xE7\xF5es" }, /* @__PURE__ */ React.createElement("textarea", { value: dados.observacoes || "", onChange: (e) => set("observacoes", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, inicial && inicial.id ? "Salvar" : "Criar lan\xE7amento")));
          }
          function DocumentoForm({ onSalvar, onCancelar }) {
            const casos = useCasosOptions();
            const [titulo, setTitulo] = useState("");
            const [casoId, setCasoId] = useState("");
            const [descricao, setDescricao] = useState("");
            const [arquivo, setArquivo] = useState(null);
            const [enviando, setEnviando] = useState(false);
            const fileRef = useRef(null);
            async function submit(e) {
              e.preventDefault();
              if (!arquivo) {
                alert("Selecione um arquivo");
                return;
              }
              setEnviando(true);
              try {
                const fd = new FormData();
                fd.append("arquivo", arquivo);
                fd.append("titulo", titulo);
                if (casoId) fd.append("caso_id", casoId);
                if (descricao) fd.append("descricao", descricao);
                const r = await BasckApi.documentos.upload(fd);
                onSalvar(r.documento);
              } catch (err) {
                alert(err.message);
              } finally {
                setEnviando(false);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(Field, { label: "T\xEDtulo do documento *" }, /* @__PURE__ */ React.createElement("input", { required: true, value: titulo, onChange: (e) => setTitulo(e.target.value), maxLength: 200 })), /* @__PURE__ */ React.createElement(Field, { label: "Vincular a caso (opcional)" }, /* @__PURE__ */ React.createElement("select", { value: casoId, onChange: (e) => setCasoId(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Sem caso"), casos.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.titulo)))), /* @__PURE__ */ React.createElement(Field, { label: "Descri\xE7\xE3o (opcional)" }, /* @__PURE__ */ React.createElement("textarea", { value: descricao, onChange: (e) => setDescricao(e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Arquivo *" }, /* @__PURE__ */ React.createElement("input", { ref: fileRef, type: "file", required: true, onChange: (e) => {
              const f = e.target.files[0];
              if (f) {
                setArquivo(f);
                if (!titulo) setTitulo(f.name.replace(/\.[^.]+$/, ""));
              }
            } })), arquivo && /* @__PURE__ */ React.createElement("div", { className: "tiny" }, "Tamanho: ", (arquivo.size / 1024).toFixed(1), " KB \xB7 ", arquivo.type || "tipo desconhecido")), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary", disabled: enviando }, enviando ? "Enviando..." : "Enviar documento")));
          }
          function CalculadoraPrazo({ casoId, aoCalcular }) {
            const [dataInicio, setDataInicio] = useState((/* @__PURE__ */ new Date()).toISOString().substring(0, 10));
            const [dias, setDias] = useState(5);
            const [uteis, setUteis] = useState(true);
            const [resultado, setResultado] = useState(null);
            const [erro, setErro] = useState("");
            async function calcular() {
              setErro("");
              try {
                const r = await BasckApi.prazos.calcular({
                  data_inicio: dataInicio,
                  dias: Number(dias),
                  tipo_dias: uteis ? "uteis" : "corridos",
                  caso_id: casoId
                });
                setResultado(r);
                if (aoCalcular) aoCalcular(r);
              } catch (e) {
                setErro(e.message || "Erro ao calcular");
              }
            }
            useEffect(() => {
              calcular();
            }, []);
            return /* @__PURE__ */ React.createElement("div", { className: "calc-prazo" }, /* @__PURE__ */ React.createElement("div", { className: "calc-row" }, /* @__PURE__ */ React.createElement(Field, { label: "Data inicial" }, /* @__PURE__ */ React.createElement(DateInput, { value: dataInicio, onChange: (e) => setDataInicio(e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Dias" }, /* @__PURE__ */ React.createElement("input", { type: "number", min: "1", max: "365", value: dias, onChange: (e) => setDias(e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Tipo" }, /* @__PURE__ */ React.createElement("select", { value: uteis ? "uteis" : "corridos", onChange: (e) => setUteis(e.target.value === "uteis") }, /* @__PURE__ */ React.createElement("option", { value: "uteis" }, "Uteis"), /* @__PURE__ */ React.createElement("option", { value: "corridos" }, "Corridos")))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost sm", onClick: calcular }, "Calcular"), erro && /* @__PURE__ */ React.createElement("div", { className: "erro-msg" }, erro), resultado && !erro && /* @__PURE__ */ React.createElement("div", { className: "calc-resultado" }, /* @__PURE__ */ React.createElement("div", { className: "calc-resultado-data" }, /* @__PURE__ */ React.createElement("span", { className: "tiny" }, "Vencimento:"), /* @__PURE__ */ React.createElement("strong", null, (/* @__PURE__ */ new Date(resultado.data_vencimento + "T12:00:00")).toLocaleDateString("pt-BR"))), resultado.dias_corridos && /* @__PURE__ */ React.createElement("div", { className: "tiny" }, resultado.dias_corridos, " dias corridos, ", resultado.dias_uteis, " dias uteis", resultado.feriados > 0 && ", " + resultado.feriados + " feriado(s)"), resultado.observacao && /* @__PURE__ */ React.createElement("div", { className: "tiny" }, resultado.observacao)));
          }
          function CompromissoForm({ inicial, onSalvar, onCancelar }) {
            const casos = useCasosOptions();
            const [dados, setDados] = useState(inicial || {
              titulo: "",
              tipo: "audiencia",
              data_hora: "",
              duracao_minutos: 60,
              local: "",
              tribunal: "",
              sala: "",
              observacoes: "",
              caso_id: ""
            });
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function submit(e) {
              e.preventDefault();
              try {
                const payload = { ...dados };
                if (!payload.caso_id) payload.caso_id = null;
                else payload.caso_id = Number(payload.caso_id);
                payload.duracao_minutos = Number(payload.duracao_minutos);
                const r = inicial && inicial.id ? await BasckApi.compromissos.atualizar(inicial.id, payload) : await BasckApi.compromissos.criar(payload);
                onSalvar(r.compromisso);
              } catch (err) {
                alert(err.message);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(Field, { label: "Titulo *" }, /* @__PURE__ */ React.createElement("input", { required: true, value: dados.titulo, onChange: (e) => set("titulo", e.target.value), maxLength: 200 })), /* @__PURE__ */ React.createElement("div", { className: "grid-2" }, /* @__PURE__ */ React.createElement(Field, { label: "Tipo" }, /* @__PURE__ */ React.createElement("select", { value: dados.tipo, onChange: (e) => set("tipo", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "audiencia" }, "Audiencia"), /* @__PURE__ */ React.createElement("option", { value: "reuniao" }, "Reuniao"), /* @__PURE__ */ React.createElement("option", { value: "prazo_judicial" }, "Prazo judicial"), /* @__PURE__ */ React.createElement("option", { value: "sessao" }, "Sessao"), /* @__PURE__ */ React.createElement("option", { value: "diligencia" }, "Diligencia"), /* @__PURE__ */ React.createElement("option", { value: "outro" }, "Outro"))), /* @__PURE__ */ React.createElement(Field, { label: "Data e hora *" }, /* @__PURE__ */ React.createElement("input", { required: true, type: "datetime-local", value: dados.data_hora, onChange: (e) => set("data_hora", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "grid-2" }, /* @__PURE__ */ React.createElement(Field, { label: "Duracao (min)" }, /* @__PURE__ */ React.createElement("input", { type: "number", min: "15", step: "15", value: dados.duracao_minutos, onChange: (e) => set("duracao_minutos", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Caso (opcional)" }, /* @__PURE__ */ React.createElement("select", { value: dados.caso_id || "", onChange: (e) => set("caso_id", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Sem caso"), casos.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.titulo))))), /* @__PURE__ */ React.createElement("div", { className: "grid-2" }, /* @__PURE__ */ React.createElement(Field, { label: "Local" }, /* @__PURE__ */ React.createElement("input", { value: dados.local || "", onChange: (e) => set("local", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Tribunal" }, /* @__PURE__ */ React.createElement("input", { value: dados.tribunal || "", onChange: (e) => set("tribunal", e.target.value) }))), /* @__PURE__ */ React.createElement(Field, { label: "Sala" }, /* @__PURE__ */ React.createElement("input", { value: dados.sala || "", onChange: (e) => set("sala", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Observacoes" }, /* @__PURE__ */ React.createElement("textarea", { value: dados.observacoes || "", onChange: (e) => set("observacoes", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, "Salvar compromisso")));
          }
          function IntegracaoForm({ inicial, onSalvar, onCancelar }) {
            const [tribunais, setTribunais] = useState([]);
            const [dados, setDados] = useState(inicial || {
              tribunal: "",
              tipo_credencial: "login_senha",
              identificador: "",
              segredo: "",
              apelido: ""
            });
            useEffect(() => {
              BasckApi.integracoes.tribunaisSuportados().then((r) => setTribunais(r.tribunais || [])).catch(() => {
              });
            }, []);
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function submit(e) {
              e.preventDefault();
              try {
                const r = inicial && inicial.id ? await BasckApi.integracoes.atualizar(inicial.id, dados) : await BasckApi.integracoes.criar(dados);
                onSalvar(r.integracao);
              } catch (err) {
                alert(err.message);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(Field, { label: "Tribunal *" }, /* @__PURE__ */ React.createElement("select", { required: true, value: dados.tribunal, onChange: (e) => set("tribunal", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Selecione..."), tribunais.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.nome)))), /* @__PURE__ */ React.createElement("div", { className: "grid-2" }, /* @__PURE__ */ React.createElement(Field, { label: "Apelido (opcional)" }, /* @__PURE__ */ React.createElement("input", { value: dados.apelido || "", onChange: (e) => set("apelido", e.target.value), placeholder: "Ex: Conta principal" })), /* @__PURE__ */ React.createElement(Field, { label: "Tipo de credencial *" }, /* @__PURE__ */ React.createElement("select", { value: dados.tipo_credencial, onChange: (e) => set("tipo_credencial", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "login_senha" }, "Login e senha"), /* @__PURE__ */ React.createElement("option", { value: "certificado_digital" }, "Certificado digital"), /* @__PURE__ */ React.createElement("option", { value: "oauth" }, "OAuth"), /* @__PURE__ */ React.createElement("option", { value: "api_key" }, "API key")))), /* @__PURE__ */ React.createElement(Field, { label: "Identificador * (CPF/OAB/login)" }, /* @__PURE__ */ React.createElement("input", { required: true, value: dados.identificador, onChange: (e) => set("identificador", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Segredo (criptografado antes de salvar)" }, /* @__PURE__ */ React.createElement("input", { type: "password", value: dados.segredo || "", onChange: (e) => set("segredo", e.target.value), placeholder: inicial ? "Deixe em branco para manter" : "" }))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, "Salvar integracao")));
          }
          function OabForm({ onSalvar, onCancelar }) {
            const [dados, setDados] = useState({ numero_oab: "", uf: "SP" });
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function submit(e) {
              e.preventDefault();
              try {
                const r = await BasckApi.integracoes.oab.adicionar(dados);
                onSalvar(r.oab);
              } catch (err) {
                alert(err.message);
              }
            }
            return /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { className: "grid-2" }, /* @__PURE__ */ React.createElement(Field, { label: "Numero da OAB *" }, /* @__PURE__ */ React.createElement("input", { required: true, value: dados.numero_oab, onChange: (e) => set("numero_oab", e.target.value), placeholder: "123456" })), /* @__PURE__ */ React.createElement(Field, { label: "UF *" }, /* @__PURE__ */ React.createElement("select", { value: dados.uf, onChange: (e) => set("uf", e.target.value) }, ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map((u) => /* @__PURE__ */ React.createElement("option", { key: u, value: u }, u)))))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn ghost", onClick: onCancelar }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, "Adicionar para monitoramento")));
          }
          function KanbanForm(props) {
            const { onClose } = props;
            const [titulo, setTitulo] = useState("");
            const [descricao, setDescricao] = useState("");
            const [coluna, setColuna] = useState("a_fazer");
            const [casoId, setCasoId] = useState("");
            const [casos, setCasos] = useState([]);
            const [erro, setErro] = useState("");
            const [salvando, setSalvando] = useState(false);
            useEffect(() => {
              BasckApi.casos.listar().then((r) => setCasos(r.itens || [])).catch(() => {
              });
            }, []);
            async function salvar(e) {
              e.preventDefault();
              setErro("");
              if (!titulo.trim()) {
                setErro("T\xEDtulo \xE9 obrigat\xF3rio");
                return;
              }
              setSalvando(true);
              try {
                await BasckApi.kanban.criar({
                  titulo: titulo.trim(),
                  descricao: descricao.trim() || null,
                  coluna,
                  caso_id: casoId ? Number(casoId) : null
                });
                onClose(true);
              } catch (e2) {
                setErro(e2.message);
              } finally {
                setSalvando(false);
              }
            }
            return Modal({
              title: "Nova tarefa no Kanban",
              onClose: () => onClose(false),
              children: React.createElement(
                "form",
                { onSubmit: salvar, className: "form-grid" },
                erro && React.createElement("div", { className: "form-error" }, erro),
                React.createElement(
                  Field,
                  { label: "T\xEDtulo *" },
                  React.createElement("input", { value: titulo, onChange: (e) => setTitulo(e.target.value), required: true, autoFocus: true })
                ),
                React.createElement(
                  Field,
                  { label: "Descri\xE7\xE3o" },
                  React.createElement("textarea", { value: descricao, onChange: (e) => setDescricao(e.target.value), rows: 3 })
                ),
                React.createElement(
                  Field,
                  { label: "Coluna inicial" },
                  React.createElement(
                    "select",
                    { value: coluna, onChange: (e) => setColuna(e.target.value) },
                    React.createElement("option", { value: "a_fazer" }, "A fazer"),
                    React.createElement("option", { value: "em_andamento" }, "Em andamento"),
                    React.createElement("option", { value: "revisao" }, "Em revis\xE3o"),
                    React.createElement("option", { value: "concluido" }, "Conclu\xEDdo")
                  )
                ),
                React.createElement(
                  Field,
                  { label: "Vincular a caso (opcional)" },
                  React.createElement(
                    "select",
                    { value: casoId, onChange: (e) => setCasoId(e.target.value) },
                    React.createElement("option", { value: "" }, "\u2014 Nenhum \u2014"),
                    casos.map((c) => React.createElement("option", { key: c.id, value: c.id }, c.titulo || c.numero_processo || "Caso #" + c.id))
                  )
                ),
                React.createElement(
                  "div",
                  { className: "form-actions" },
                  React.createElement("button", { type: "button", className: "btn", onClick: () => onClose(false) }, "Cancelar"),
                  React.createElement("button", { type: "submit", className: "btn btn-primary", disabled: salvando }, salvando ? "Salvando..." : "Criar")
                )
              )
            });
          }
          global2.BasckModals = {
            Modal,
            ClienteForm,
            CasoForm,
            PrazoForm,
            TarefaForm,
            LancamentoForm,
            DocumentoForm,
            CompromissoForm,
            IntegracaoForm,
            OabForm,
            CalculadoraPrazo,
            KanbanForm
          };
        })(window);
      })();
      (function() {
        (function(global2) {
          const { useState, useEffect, useMemo } = React;
          const M = global2.BasckModals;
          function fmtData(s) {
            if (!s) return "\u2014";
            const iso = String(s).slice(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return s;
            const [y, m, d] = iso.split("-");
            return `${d}/${m}/${y}`;
          }
          function fmtMoeda(n) {
            const v = Number(n || 0);
            return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
          }
          function fmtBytes(b) {
            if (!b) return "0 B";
            const u = ["B", "KB", "MB", "GB"];
            let i = 0;
            let n = b;
            while (n >= 1024 && i < u.length - 1) {
              n /= 1024;
              i++;
            }
            return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
          }
          function diasAte(s) {
            if (!s) return null;
            const d = /* @__PURE__ */ new Date(String(s).slice(0, 10) + "T00:00:00");
            const hoje = /* @__PURE__ */ new Date();
            hoje.setHours(0, 0, 0, 0);
            return Math.round((d - hoje) / 864e5);
          }
          function statusBadge(prazo) {
            if (prazo.status === "concluido") return /* @__PURE__ */ React.createElement("span", { className: "badge ok" }, "Conclu\xEDdo");
            if (prazo.status === "cancelado") return /* @__PURE__ */ React.createElement("span", { className: "badge muted" }, "Cancelado");
            const d = diasAte(prazo.data_vencimento);
            if (d == null) return /* @__PURE__ */ React.createElement("span", { className: "badge muted" }, "Sem data");
            if (d < 0) return /* @__PURE__ */ React.createElement("span", { className: "badge danger" }, "Atrasado ", Math.abs(d), "d");
            if (d === 0) return /* @__PURE__ */ React.createElement("span", { className: "badge danger" }, "Hoje");
            if (d <= 3) return /* @__PURE__ */ React.createElement("span", { className: "badge danger" }, d, "d restantes");
            if (d <= 7) return /* @__PURE__ */ React.createElement("span", { className: "badge warn" }, d, "d restantes");
            return /* @__PURE__ */ React.createElement("span", { className: "badge info" }, d, "d restantes");
          }
          function ehCritico(p) {
            if (!p) return false;
            if (p.status !== "pendente") return false;
            const d = diasAte(p.data_vencimento);
            return d != null && d <= 3;
          }
          function prioridadeBadge(p) {
            const map = { baixa: "muted", normal: "info", alta: "warn", urgente: "danger" };
            return /* @__PURE__ */ React.createElement("span", { className: `badge ${map[p] || "muted"}` }, p || "normal");
          }
          function casoStatusBadge(s) {
            const map = { em_andamento: "info", concluido: "ok", suspenso: "warn", arquivado: "muted" };
            const label = { em_andamento: "Em andamento", concluido: "Conclu\xEDdo", suspenso: "Suspenso", arquivado: "Arquivado" };
            return /* @__PURE__ */ React.createElement("span", { className: `badge ${map[s] || "muted"}` }, label[s] || s);
          }
          function finStatusBadge(s) {
            const map = { pendente: "warn", pago: "ok", cancelado: "muted" };
            return /* @__PURE__ */ React.createElement("span", { className: `badge ${map[s] || "muted"}` }, s);
          }
          function Empty({ texto = "Nada por aqui ainda", acao = null }) {
            return /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement("div", { className: "ico" }, "\u2205"), /* @__PURE__ */ React.createElement("div", null, texto), acao && /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, acao));
          }
          function Loading() {
            return /* @__PURE__ */ React.createElement("div", { className: "loading" }, /* @__PURE__ */ React.createElement("div", { className: "spinner" }), "Carregando...");
          }
          function DashboardView({ irPara, toast }) {
            const [dados, setDados] = useState(null);
            const [carregando, setCarregando] = useState(true);
            useEffect(() => {
              Promise.all([
                BasckApi.casos.estatisticas(),
                BasckApi.prazos.proximos(30),
                BasckApi.financeiro.resumo(),
                BasckApi.casos.listar()
              ]).then(([stats2, prazos2, fin2, casos2]) => {
                setDados({ stats: stats2, prazos: prazos2.itens || [], fin: fin2, casos: casos2.itens || [] });
              }).catch((e) => toast(e.message, "error")).finally(() => setCarregando(false));
            }, []);
            if (carregando) return /* @__PURE__ */ React.createElement(Loading, null);
            if (!dados) return /* @__PURE__ */ React.createElement(Empty, { texto: "Sem dados" });
            const { stats, prazos, fin, casos } = dados;
            const atrasados = prazos.filter((p) => p.status === "pendente" && diasAte(p.data_vencimento) < 0);
            const hoje = prazos.filter((p) => p.status === "pendente" && diasAte(p.data_vencimento) === 0);
            const proximos = prazos.filter((p) => p.status === "pendente" && diasAte(p.data_vencimento) > 0).slice(0, 6);
            return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "grid grid-4 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Casos ativos"), /* @__PURE__ */ React.createElement("div", { className: "value" }, stats.em_andamento), /* @__PURE__ */ React.createElement("div", { className: "muted tiny" }, stats.total, " no total")), /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Prazos cr\xEDticos"), /* @__PURE__ */ React.createElement("div", { className: "value" }, atrasados.length + hoje.length), /* @__PURE__ */ React.createElement("div", { className: "muted tiny" }, atrasados.length, " atrasados \xB7 ", hoje.length, " hoje")), /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Recebido"), /* @__PURE__ */ React.createElement("div", { className: "value gold" }, fmtMoeda(fin.recebido)), /* @__PURE__ */ React.createElement("div", { className: "muted tiny" }, "de honor\xE1rios e despesas")), /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Pendente"), /* @__PURE__ */ React.createElement("div", { className: "value" }, fmtMoeda(fin.pendente)), /* @__PURE__ */ React.createElement("div", { className: "muted tiny" }, fin.atrasados.quantidade, " atrasado(s)"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-2 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Prazos cr\xEDticos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Vencendo nos pr\xF3ximos 30 dias"), prazos.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { texto: "Nenhum prazo pendente" }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Prazo"), /* @__PURE__ */ React.createElement("th", null, "Tipo"), /* @__PURE__ */ React.createElement("th", null, "Vence"), /* @__PURE__ */ React.createElement("th", null, "Status"))), /* @__PURE__ */ React.createElement("tbody", null, prazos.slice(0, 8).map((p) => /* @__PURE__ */ React.createElement("tr", { key: p.id, className: "prazo-item" + (ehCritico(p) ? " critico" : "") }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, p.titulo), /* @__PURE__ */ React.createElement("div", { className: "tiny" }, p.caso_titulo || "\u2014")), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, p.tipo_dias), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, fmtData(p.data_vencimento)), /* @__PURE__ */ React.createElement("td", null, statusBadge(p)))))), /* @__PURE__ */ React.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: () => irPara("prazos") }, "Ver todos"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Casos recentes"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "\xDAltimos casos atualizados"), casos.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { texto: "Nenhum caso cadastrado", acao: /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => irPara("casos") }, "Cadastrar primeiro caso") }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Caso"), /* @__PURE__ */ React.createElement("th", null, "Cliente"), /* @__PURE__ */ React.createElement("th", null, "Status"))), /* @__PURE__ */ React.createElement("tbody", null, casos.slice(0, 6).map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, c.titulo), /* @__PURE__ */ React.createElement("div", { className: "tiny" }, c.area || "\u2014")), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, c.cliente_nome || "\u2014"), /* @__PURE__ */ React.createElement("td", null, casoStatusBadge(c.status)))))))));
          }
          function CasosView({ toast }) {
            const [itens, setItens] = useState([]);
            const [carregando, setCarregando] = useState(true);
            const [busca, setBusca] = useState("");
            const [statusFiltro, setStatusFiltro] = useState("");
            const [modal, setModal] = useState(null);
            const [detalhe, setDetalhe] = useState(null);
            function carregar() {
              setCarregando(true);
              BasckApi.casos.listar({ status: statusFiltro || null, q: busca || null }).then((r) => setItens(r.itens || [])).catch((e) => toast(e.message, "error")).finally(() => setCarregando(false));
            }
            useEffect(carregar, [statusFiltro, busca]);
            function salvar(caso) {
              setModal(null);
              toast(caso.id ? "Caso atualizado" : "Caso criado", "success");
              carregar();
            }
            async function remover(c) {
              if (!confirm(`Remover o caso "${c.titulo}"?`)) return;
              try {
                await BasckApi.casos.remover(c.id);
                toast("Caso removido", "success");
                carregar();
              } catch (e) {
                toast(e.message, "error");
              }
            }
            return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex between center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2", style: { flex: 1 } }, /* @__PURE__ */ React.createElement("input", { placeholder: "Buscar por t\xEDtulo ou n\xFAmero...", value: busca, onChange: (e) => setBusca(e.target.value), style: { flex: 1, padding: "8px 12px", background: "var(--bg-3)", border: "1px solid var(--line-2)", borderRadius: 6, color: "var(--ink)" } }), /* @__PURE__ */ React.createElement("select", { value: statusFiltro, onChange: (e) => setStatusFiltro(e.target.value), style: { padding: "8px 12px", background: "var(--bg-3)", border: "1px solid var(--line-2)", borderRadius: 6, color: "var(--ink)" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Todos status"), /* @__PURE__ */ React.createElement("option", { value: "em_andamento" }, "Em andamento"), /* @__PURE__ */ React.createElement("option", { value: "concluido" }, "Conclu\xEDdo"), /* @__PURE__ */ React.createElement("option", { value: "suspenso" }, "Suspenso"), /* @__PURE__ */ React.createElement("option", { value: "arquivado" }, "Arquivado"))), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "+ Novo caso"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Seus casos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, itens.length, " caso(s) encontrado(s)"), carregando ? /* @__PURE__ */ React.createElement(Loading, null) : itens.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { texto: "Nenhum caso cadastrado", acao: /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "Cadastrar caso") }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "T\xEDtulo"), /* @__PURE__ */ React.createElement("th", null, "Cliente"), /* @__PURE__ */ React.createElement("th", null, "\xC1rea"), /* @__PURE__ */ React.createElement("th", null, "N\xBA processo"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, itens.map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.id, style: { cursor: "pointer" }, onClick: () => setDetalhe(c) }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 500 } }, c.titulo), /* @__PURE__ */ React.createElement("div", { className: "tiny" }, c.tribunal || "\u2014")), /* @__PURE__ */ React.createElement("td", { className: "muted" }, c.cliente_nome || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted" }, c.area || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "tiny muted" }, c.numero_processo || "\u2014"), /* @__PURE__ */ React.createElement("td", null, casoStatusBadge(c.status)), /* @__PURE__ */ React.createElement("td", { className: "actions", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: () => setModal({ tipo: "editar", caso: c }) }, "Editar"), /* @__PURE__ */ React.createElement("button", { className: "btn sm danger", onClick: () => remover(c) }, "Excluir"))))))), modal && /* @__PURE__ */ React.createElement(M.Modal, { titulo: modal.tipo === "editar" ? "Editar caso" : "Novo caso", onClose: () => setModal(null) }, /* @__PURE__ */ React.createElement(M.CasoForm, { inicial: modal.caso, onSalvar: salvar, onCancelar: () => setModal(null) })));
          }
          function PrazosView({ toast }) {
            const [itens, setItens] = useState([]);
            const [carregando, setCarregando] = useState(true);
            const [statusFiltro, setStatusFiltro] = useState("pendente");
            const [modal, setModal] = useState(null);
            function carregar() {
              setCarregando(true);
              BasckApi.prazos.listar({ status: statusFiltro || null }).then((r) => setItens(r.itens || [])).catch((e) => toast(e.message, "error")).finally(() => setCarregando(false));
            }
            useEffect(carregar, [statusFiltro]);
            async function toggle(p) {
              try {
                if (p.status === "pendente") await BasckApi.prazos.concluir(p.id);
                else await BasckApi.prazos.reabrir(p.id);
                toast("Atualizado", "success");
                carregar();
              } catch (e) {
                toast(e.message, "error");
              }
            }
            async function remover(p) {
              if (!confirm(`Remover prazo "${p.titulo}"?`)) return;
              try {
                await BasckApi.prazos.remover(p.id);
                carregar();
                toast("Removido", "success");
              } catch (e) {
                toast(e.message, "error");
              }
            }
            return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex between center" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, [{ v: "pendente", l: "Pendentes" }, { v: "concluido", l: "Conclu\xEDdos" }, { v: "", l: "Todos" }].map((o) => /* @__PURE__ */ React.createElement("button", { key: o.v, className: "btn " + (statusFiltro === o.v ? "primary" : ""), onClick: () => setStatusFiltro(o.v) }, o.l))), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "+ Novo prazo"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Prazos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, itens.length, " prazo(s)"), carregando ? /* @__PURE__ */ React.createElement(Loading, null) : itens.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { texto: "Nenhum prazo", acao: /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "Cadastrar prazo") }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Prazo"), /* @__PURE__ */ React.createElement("th", null, "Caso"), /* @__PURE__ */ React.createElement("th", null, "Tipo"), /* @__PURE__ */ React.createElement("th", null, "In\xEDcio"), /* @__PURE__ */ React.createElement("th", null, "Vencimento"), /* @__PURE__ */ React.createElement("th", null, "Prioridade"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, itens.map((p) => /* @__PURE__ */ React.createElement("tr", { key: p.id, className: "prazo-item" + (ehCritico(p) ? " critico" : "") }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 500 } }, p.titulo), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, p.caso_titulo || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, p.tipo_dias), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, fmtData(p.data_inicio)), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, fmtData(p.data_vencimento)), /* @__PURE__ */ React.createElement("td", null, prioridadeBadge(p.prioridade)), /* @__PURE__ */ React.createElement("td", null, statusBadge(p)), /* @__PURE__ */ React.createElement("td", { className: "actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: () => toggle(p) }, p.status === "pendente" ? "Concluir" : "Reabrir"), /* @__PURE__ */ React.createElement("button", { className: "btn sm danger", onClick: () => remover(p) }, "Excluir"))))))), modal && /* @__PURE__ */ React.createElement(M.Modal, { titulo: modal.tipo === "editar" ? "Editar prazo" : "Novo prazo", onClose: () => setModal(null) }, /* @__PURE__ */ React.createElement(M.PrazoForm, { inicial: modal.prazo, onSalvar: (p) => {
              setModal(null);
              toast("Salvo", "success");
              carregar();
            }, onCancelar: () => setModal(null) })));
          }
          function TarefasView({ toast }) {
            const [itens, setItens] = useState([]);
            const [carregando, setCarregando] = useState(true);
            const [statusFiltro, setStatusFiltro] = useState("pendente");
            const [modal, setModal] = useState(null);
            function carregar() {
              setCarregando(true);
              BasckApi.tarefas.listar({ status: statusFiltro || null }).then((r) => setItens(r.itens || [])).catch((e) => toast(e.message, "error")).finally(() => setCarregando(false));
            }
            useEffect(carregar, [statusFiltro]);
            async function toggle(t) {
              try {
                if (t.status === "pendente") await BasckApi.tarefas.concluir(t.id);
                else await BasckApi.tarefas.atualizar(t.id, { ...t, status: "pendente", concluido_em: null });
                carregar();
                toast("Atualizado", "success");
              } catch (e) {
                toast(e.message, "error");
              }
            }
            async function remover(t) {
              if (!confirm(`Remover tarefa "${t.titulo}"?`)) return;
              try {
                await BasckApi.tarefas.remover(t.id);
                carregar();
              } catch (e) {
                toast(e.message, "error");
              }
            }
            return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex between center" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, [{ v: "pendente", l: "Pendentes" }, { v: "concluida", l: "Conclu\xEDdas" }, { v: "", l: "Todas" }].map((o) => /* @__PURE__ */ React.createElement("button", { key: o.v, className: "btn " + (statusFiltro === o.v ? "primary" : ""), onClick: () => setStatusFiltro(o.v) }, o.l))), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "+ Nova tarefa"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Tarefas"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, itens.length, " tarefa(s)"), carregando ? /* @__PURE__ */ React.createElement(Loading, null) : itens.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { texto: "Nenhuma tarefa", acao: /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "Criar tarefa") }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null), /* @__PURE__ */ React.createElement("th", null, "Tarefa"), /* @__PURE__ */ React.createElement("th", null, "Caso"), /* @__PURE__ */ React.createElement("th", null, "Vencimento"), /* @__PURE__ */ React.createElement("th", null, "Prioridade"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, itens.map((t) => /* @__PURE__ */ React.createElement("tr", { key: t.id }, /* @__PURE__ */ React.createElement("td", { style: { width: 40 } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: t.status !== "pendente", onChange: () => toggle(t) })), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 500, textDecoration: t.status !== "pendente" ? "line-through" : "none", opacity: t.status !== "pendente" ? 0.6 : 1 } }, t.titulo), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, t.caso_titulo || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, fmtData(t.data_vencimento)), /* @__PURE__ */ React.createElement("td", null, prioridadeBadge(t.prioridade)), /* @__PURE__ */ React.createElement("td", { className: "actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn sm danger", onClick: () => remover(t) }, "Excluir"))))))), modal && /* @__PURE__ */ React.createElement(M.Modal, { titulo: "Nova tarefa", onClose: () => setModal(null) }, /* @__PURE__ */ React.createElement(M.TarefaForm, { onSalvar: () => {
              setModal(null);
              carregar();
              toast("Criada", "success");
            }, onCancelar: () => setModal(null) })));
          }
          function ClientesView({ toast }) {
            const [itens, setItens] = useState([]);
            const [carregando, setCarregando] = useState(true);
            const [busca, setBusca] = useState("");
            const [modal, setModal] = useState(null);
            function carregar() {
              setCarregando(true);
              BasckApi.clientes.listar().then((r) => setItens(r.itens || [])).catch((e) => toast(e.message, "error")).finally(() => setCarregando(false));
            }
            useEffect(carregar, []);
            async function remover(c) {
              if (!confirm(`Remover cliente "${c.nome}"? Os casos vinculados tamb\xE9m ser\xE3o removidos.`)) return;
              try {
                await BasckApi.clientes.remover(c.id);
                carregar();
                toast("Removido", "success");
              } catch (e) {
                toast(e.message, "error");
              }
            }
            const filtrados = itens.filter((c) => !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || (c.documento || "").includes(busca));
            return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex between center" }, /* @__PURE__ */ React.createElement("input", { placeholder: "Buscar cliente...", value: busca, onChange: (e) => setBusca(e.target.value), style: { flex: 1, padding: "8px 12px", background: "var(--bg-3)", border: "1px solid var(--line-2)", borderRadius: 6, color: "var(--ink)" } }), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "+ Novo cliente"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Clientes"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, filtrados.length, " cliente(s)"), carregando ? /* @__PURE__ */ React.createElement(Loading, null) : filtrados.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { texto: "Nenhum cliente", acao: /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "Cadastrar cliente") }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Nome"), /* @__PURE__ */ React.createElement("th", null, "Documento"), /* @__PURE__ */ React.createElement("th", null, "Contato"), /* @__PURE__ */ React.createElement("th", null, "Endere\xE7o"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, filtrados.map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 500 } }, c.nome), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, c.documento || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, c.email && /* @__PURE__ */ React.createElement("div", null, c.email), c.telefone && /* @__PURE__ */ React.createElement("div", null, c.telefone)), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, c.endereco || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: () => setModal({ tipo: "editar", cliente: c }) }, "Editar"), /* @__PURE__ */ React.createElement("button", { className: "btn sm danger", onClick: () => remover(c) }, "Excluir"))))))), modal && /* @__PURE__ */ React.createElement(M.Modal, { titulo: modal.tipo === "editar" ? "Editar cliente" : "Novo cliente", onClose: () => setModal(null) }, /* @__PURE__ */ React.createElement(M.ClienteForm, { inicial: modal.cliente, onSalvar: () => {
              setModal(null);
              carregar();
              toast("Salvo", "success");
            }, onCancelar: () => setModal(null) })));
          }
          function FinanceiroView({ toast }) {
            const [itens, setItens] = useState([]);
            const [resumo, setResumo] = useState(null);
            const [carregando, setCarregando] = useState(true);
            const [tipo, setTipo] = useState("");
            const [status, setStatus] = useState("");
            const [modal, setModal] = useState(null);
            function carregar() {
              setCarregando(true);
              Promise.all([
                BasckApi.financeiro.listar({ tipo: tipo || null, status: status || null }),
                BasckApi.financeiro.resumo()
              ]).then(([r, s]) => {
                setItens(r.itens || []);
                setResumo(s);
              }).catch((e) => toast(e.message, "error")).finally(() => setCarregando(false));
            }
            useEffect(carregar, [tipo, status]);
            async function marcarPago(l) {
              try {
                await BasckApi.financeiro.marcarPago(l.id, {});
                carregar();
                toast("Marcado como pago", "success");
              } catch (e) {
                toast(e.message, "error");
              }
            }
            async function remover(l) {
              if (!confirm("Remover este lan\xE7amento?")) return;
              try {
                await BasckApi.financeiro.remover(l.id);
                carregar();
              } catch (e) {
                toast(e.message, "error");
              }
            }
            return /* @__PURE__ */ React.createElement("div", null, resumo && /* @__PURE__ */ React.createElement("div", { className: "grid grid-4 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Recebido total"), /* @__PURE__ */ React.createElement("div", { className: "value gold" }, fmtMoeda(resumo.recebido))), /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Pendente"), /* @__PURE__ */ React.createElement("div", { className: "value" }, fmtMoeda(resumo.pendente))), /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Honor\xE1rios pendentes"), /* @__PURE__ */ React.createElement("div", { className: "value" }, fmtMoeda(resumo.pendenteHonorarios))), /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Atrasados"), /* @__PURE__ */ React.createElement("div", { className: "value" }, fmtMoeda(resumo.atrasados.valor)), /* @__PURE__ */ React.createElement("div", { className: "muted tiny" }, resumo.atrasados.quantidade, " item(ns)"))), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex between center" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("select", { value: tipo, onChange: (e) => setTipo(e.target.value), style: { padding: "8px 12px", background: "var(--bg-3)", border: "1px solid var(--line-2)", borderRadius: 6, color: "var(--ink)" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Todos tipos"), /* @__PURE__ */ React.createElement("option", { value: "honorario" }, "Honor\xE1rios"), /* @__PURE__ */ React.createElement("option", { value: "despesa" }, "Despesas"), /* @__PURE__ */ React.createElement("option", { value: "reembolso" }, "Reembolsos")), /* @__PURE__ */ React.createElement("select", { value: status, onChange: (e) => setStatus(e.target.value), style: { padding: "8px 12px", background: "var(--bg-3)", border: "1px solid var(--line-2)", borderRadius: 6, color: "var(--ink)" } }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Todos status"), /* @__PURE__ */ React.createElement("option", { value: "pendente" }, "Pendente"), /* @__PURE__ */ React.createElement("option", { value: "pago" }, "Pago"), /* @__PURE__ */ React.createElement("option", { value: "cancelado" }, "Cancelado")), /* @__PURE__ */ React.createElement("a", { className: "btn", href: BasckApi.financeiro.csvUrl() }, "Exportar CSV")), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "+ Novo lan\xE7amento"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Lan\xE7amentos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, itens.length, " item(ns)"), carregando ? /* @__PURE__ */ React.createElement(Loading, null) : itens.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { texto: "Nenhum lan\xE7amento", acao: /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({ tipo: "novo" }) }, "Criar lan\xE7amento") }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Descri\xE7\xE3o"), /* @__PURE__ */ React.createElement("th", null, "Tipo"), /* @__PURE__ */ React.createElement("th", null, "Cliente/Caso"), /* @__PURE__ */ React.createElement("th", null, "Vencimento"), /* @__PURE__ */ React.createElement("th", null, "Valor"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, itens.map((l) => /* @__PURE__ */ React.createElement("tr", { key: l.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 500 } }, l.descricao), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, l.tipo), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, l.cliente_nome || "\u2014", l.caso_titulo && /* @__PURE__ */ React.createElement("div", null, l.caso_titulo)), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, fmtData(l.data_vencimento)), /* @__PURE__ */ React.createElement("td", { className: "right", style: { fontWeight: 500 } }, fmtMoeda(l.valor)), /* @__PURE__ */ React.createElement("td", null, finStatusBadge(l.status)), /* @__PURE__ */ React.createElement("td", { className: "actions" }, l.status === "pendente" && /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: () => marcarPago(l) }, "Marcar pago"), /* @__PURE__ */ React.createElement("button", { className: "btn sm", onClick: () => setModal({ tipo: "editar", lancamento: l }) }, "Editar"), /* @__PURE__ */ React.createElement("button", { className: "btn sm danger", onClick: () => remover(l) }, "Excluir"))))))), modal && /* @__PURE__ */ React.createElement(M.Modal, { titulo: modal.tipo === "editar" ? "Editar lan\xE7amento" : "Novo lan\xE7amento", onClose: () => setModal(null) }, /* @__PURE__ */ React.createElement(M.LancamentoForm, { inicial: modal.lancamento, onSalvar: () => {
              setModal(null);
              carregar();
              toast("Salvo", "success");
            }, onCancelar: () => setModal(null) })));
          }
          function DocumentosView({ toast }) {
            const [itens, setItens] = useState([]);
            const [espaco, setEspaco] = useState(0);
            const [carregando, setCarregando] = useState(true);
            const [modal, setModal] = useState(false);
            function carregar() {
              setCarregando(true);
              Promise.all([BasckApi.documentos.listar(), BasckApi.documentos.espaco()]).then(([r, e]) => {
                setItens(r.itens || []);
                setEspaco(e.bytes || 0);
              }).catch((er) => toast(er.message, "error")).finally(() => setCarregando(false));
            }
            useEffect(carregar, []);
            function token() {
              return BasckApi.getToken();
            }
            async function remover(d) {
              if (!confirm(`Remover "${d.titulo}"?`)) return;
              try {
                await BasckApi.documentos.remover(d.id);
                carregar();
              } catch (e) {
                toast(e.message, "error");
              }
            }
            const LIMITE = 200 * 1024 * 1024;
            const pct = Math.min(100, espaco / LIMITE * 100);
            return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("h3", null, "Armazenamento"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Uso de espa\xE7o em nuvem"), /* @__PURE__ */ React.createElement("div", { style: { height: 8, background: "var(--bg-3)", borderRadius: 4, overflow: "hidden", marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: pct + "%", height: "100%", background: "linear-gradient(90deg, var(--gold), var(--gold-2))", transition: "width 0.3s" } })), /* @__PURE__ */ React.createElement("div", { className: "tiny muted mt-2" }, fmtBytes(espaco), " de ", fmtBytes(LIMITE), " (", pct.toFixed(1), "%)")), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "flex between center mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, "Documentos"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, itens.length, " arquivo(s)")), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal(true) }, "+ Enviar documento")), carregando ? /* @__PURE__ */ React.createElement(Loading, null) : itens.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { texto: "Nenhum documento enviado", acao: /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal(true) }, "Enviar primeiro") }) : /* @__PURE__ */ React.createElement("table", { className: "table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "T\xEDtulo"), /* @__PURE__ */ React.createElement("th", null, "Arquivo"), /* @__PURE__ */ React.createElement("th", null, "Caso"), /* @__PURE__ */ React.createElement("th", null, "Tamanho"), /* @__PURE__ */ React.createElement("th", null, "Data"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, itens.map((d) => /* @__PURE__ */ React.createElement("tr", { key: d.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 500 } }, d.titulo), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, d.nome_arquivo), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, d.caso_titulo || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, fmtBytes(d.tamanho_bytes)), /* @__PURE__ */ React.createElement("td", { className: "muted tiny" }, fmtData(d.criado_em)), /* @__PURE__ */ React.createElement("td", { className: "actions" }, /* @__PURE__ */ React.createElement("a", { className: "btn sm", href: BasckApi.documentos.downloadUrl(d.id) + "?token=" + token(), target: "_blank", rel: "noreferrer" }, "Baixar"), /* @__PURE__ */ React.createElement("button", { className: "btn sm danger", onClick: () => remover(d) }, "Excluir"))))))), modal && /* @__PURE__ */ React.createElement(M.Modal, { titulo: "Enviar documento", onClose: () => setModal(false) }, /* @__PURE__ */ React.createElement(M.DocumentoForm, { onSalvar: () => {
              setModal(false);
              carregar();
              toast("Enviado", "success");
            }, onCancelar: () => setModal(false) })));
          }
          function ConfiguracoesView({ usuario, onAtualizar, toast }) {
            const [dados, setDados] = useState(usuario || {});
            function set(c, v) {
              setDados({ ...dados, [c]: v });
            }
            async function salvar(e) {
              e.preventDefault();
              try {
                const r = await BasckApi.auth.atualizarPerfil(dados);
                onAtualizar(r.usuario);
                toast("Perfil atualizado", "success");
              } catch (er) {
                toast(er.message, "error");
              }
            }
            return /* @__PURE__ */ React.createElement("div", { className: "grid grid-2" }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Perfil"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Suas informa\xE7\xF5es pessoais e profissionais"), /* @__PURE__ */ React.createElement("form", { onSubmit: salvar }, /* @__PURE__ */ React.createElement("div", { className: "form-field" }, /* @__PURE__ */ React.createElement("label", null, "Nome"), /* @__PURE__ */ React.createElement("input", { value: dados.nome || "", onChange: (e) => set("nome", e.target.value), required: true })), /* @__PURE__ */ React.createElement("div", { className: "form-field" }, /* @__PURE__ */ React.createElement("label", null, "E-mail"), /* @__PURE__ */ React.createElement("input", { type: "email", value: dados.email || "", onChange: (e) => set("email", e.target.value), required: true })), /* @__PURE__ */ React.createElement("div", { className: "form-row" }, /* @__PURE__ */ React.createElement("div", { className: "form-field" }, /* @__PURE__ */ React.createElement("label", null, "OAB"), /* @__PURE__ */ React.createElement("input", { value: dados.oab || "", onChange: (e) => set("oab", e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "form-field" }, /* @__PURE__ */ React.createElement("label", null, "Telefone"), /* @__PURE__ */ React.createElement("input", { value: dados.telefone || "", onChange: (e) => set("telefone", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { className: "form-field" }, /* @__PURE__ */ React.createElement("label", null, "Plano"), /* @__PURE__ */ React.createElement("select", { value: dados.plano || "autonomo", onChange: (e) => set("plano", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "autonomo" }, "Aut\xF4nomo"), /* @__PURE__ */ React.createElement("option", { value: "escritorio" }, "Escrit\xF3rio"), /* @__PURE__ */ React.createElement("option", { value: "boutique" }, "Boutique"))), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn primary" }, "Salvar perfil"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Conta"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Informa\xE7\xF5es da sua assinatura"), /* @__PURE__ */ React.createElement("div", { style: { padding: 16, background: "var(--bg-3)", borderRadius: 8, marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "muted tiny" }, "PLANO ATUAL"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--serif)", fontSize: 28, fontWeight: 600, marginTop: 4, textTransform: "capitalize" } }, dados.plano || "aut\xF4nomo"), /* @__PURE__ */ React.createElement("div", { className: "muted tiny mt-2" }, "Conta criada em ", fmtData(dados.criado_em))), /* @__PURE__ */ React.createElement("div", { className: "muted mt-4 tiny" }, "Em breve: gest\xE3o de equipe multi-usu\xE1rio, integra\xE7\xF5es externas (Google Calendar, WhatsApp, DJEn) e m\xF3dulo de IA jur\xEDdica para c\xE1lculo autom\xE1tico de prazos.")));
          }
          function CompromissosView() {
            const [itens, setItens] = useState([]);
            const [casos, setCasos] = useState([]);
            const [filtro, setFiltro] = useState("proximos");
            const [modal, setModal] = useState(null);
            function carregar() {
              Promise.all([BasckApi.compromissos.listar(), BasckApi.casos.listar()]).then(([a, b]) => {
                setItens(a.itens || []);
                setCasos(b.itens || []);
              }).catch(() => {
              });
            }
            useEffect(carregar, []);
            const hoje = (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
            const filtrados = itens.filter((c) => {
              if (c.status !== "agendado") return filtro === "todos";
              const d = c.data_hora.substring(0, 10);
              if (filtro === "proximos") return d >= hoje;
              if (filtro === "hoje") return d === hoje;
              if (filtro === "atrasados") return d < hoje;
              return true;
            });
            function casosMap() {
              const m = {};
              casos.forEach((c) => m[c.id] = c.titulo);
              return m;
            }
            function tipoIcon(t) {
              return { audiencia: "\u2696\uFE0F", reuniao: "\u{1F465}", prazo_judicial: "\u23F0", sessao: "\u{1F3DB}\uFE0F", diligencia: "\u{1F4CB}", outro: "\u{1F4CC}" }[t] || "\u{1F4CC}";
            }
            return /* @__PURE__ */ React.createElement("div", { className: "view" }, /* @__PURE__ */ React.createElement("div", { className: "view-head" }, /* @__PURE__ */ React.createElement("h1", { className: "serif" }, "Compromissos"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({}) }, "+ Novo compromisso")), /* @__PURE__ */ React.createElement("div", { className: "filtros" }, ["proximos", "hoje", "atrasados", "todos"].map((f) => /* @__PURE__ */ React.createElement("button", { key: f, className: "chip" + (filtro === f ? " active" : ""), onClick: () => setFiltro(f) }, { proximos: "Pr\xF3ximos", hoje: "Hoje", atrasados: "Atrasados", todos: "Todos" }[f]))), /* @__PURE__ */ React.createElement("div", { className: "grid-cards" }, filtrados.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "empty" }, "Nenhum compromisso nesta categoria."), filtrados.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.id, className: "compromisso-card" + (c.data_hora.substring(0, 10) < hoje ? " atrasado" : "") }, /* @__PURE__ */ React.createElement("div", { className: "cc-head" }, /* @__PURE__ */ React.createElement("span", { className: "cc-icon" }, tipoIcon(c.tipo)), /* @__PURE__ */ React.createElement("div", { className: "cc-titulo" }, c.titulo)), /* @__PURE__ */ React.createElement("div", { className: "cc-data" }, new Date(c.data_hora).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })), c.local && /* @__PURE__ */ React.createElement("div", { className: "cc-local" }, "\u{1F4CD} ", c.local, c.sala ? " \xB7 Sala " + c.sala : ""), c.caso_id && /* @__PURE__ */ React.createElement("div", { className: "cc-caso" }, "\u{1F4C1} ", casosMap()[c.caso_id] || "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "cc-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => setModal(c) }, "Editar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: async () => {
              if (!confirm("Remover este compromisso?")) return;
              await BasckApi.compromissos.remover(c.id);
              carregar();
            } }, "Remover"))))), modal && /* @__PURE__ */ React.createElement(BasckModals.Modal, { titulo: modal.id ? "Editar compromisso" : "Novo compromisso", onClose: () => setModal(null), lg: true }, /* @__PURE__ */ React.createElement(BasckModals.CompromissoForm, { inicial: modal, onSalvar: () => {
              setModal(null);
              carregar();
            }, onCancelar: () => setModal(null) })));
          }
          function KanbanView() {
            const [cartoes, setCartoes] = useState([]);
            const [colunas, setColunas] = useState(["a_fazer", "em_andamento", "revisao", "concluido"]);
            const [dragId, setDragId] = useState(null);
            const [novaTarefa, setNovaTarefa] = useState(false);
            function carregar() {
              BasckApi.kanban.listar().then((r) => {
                setCartoes(r.itens || []);
                if (r.colunas) setColunas(r.colunas);
              }).catch(() => {
              });
            }
            useEffect(carregar, []);
            const labels = { a_fazer: "A fazer", em_andamento: "Em andamento", revisao: "Em revis\xE3o", concluido: "Conclu\xEDdo" };
            async function mover(cartaoId, colunaNova) {
              const antes = cartoes;
              setCartoes(cartoes.map((c) => c.id === cartaoId ? { ...c, coluna: colunaNova } : c));
              try {
                await BasckApi.kanban.mover(cartaoId, colunaNova);
                carregar();
              } catch (e) {
                alert(e.message);
                setCartoes(antes);
              }
            }
            function cartoesDaColuna(col) {
              return cartoes.filter((c) => c.coluna === col);
            }
            async function excluir(id) {
              if (!confirm("Excluir este cartao?")) return;
              try {
                await BasckApi.kanban.excluir(id);
                carregar();
              } catch (e) {
                alert(e.message);
              }
            }
            return /* @__PURE__ */ React.createElement("div", { className: "view kanban-view" }, /* @__PURE__ */ React.createElement("div", { className: "view-head" }, /* @__PURE__ */ React.createElement("h1", { className: "serif" }, "Kanban"), /* @__PURE__ */ React.createElement("div", { className: "view-head-actions" }, /* @__PURE__ */ React.createElement("span", { className: "muted tiny" }, cartoes.length, " cartoes"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-sm", onClick: () => setNovaTarefa(true) }, "+ Nova tarefa"))), /* @__PURE__ */ React.createElement("div", { className: "kanban-board" }, colunas.map((col) => {
              const lista = cartoesDaColuna(col);
              return /* @__PURE__ */ React.createElement(
                "div",
                {
                  key: col,
                  className: "kanban-coluna kanban-col-" + col,
                  onDragOver: (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("drag-over");
                  },
                  onDragLeave: (e) => e.currentTarget.classList.remove("drag-over"),
                  onDrop: (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("drag-over");
                    if (dragId) {
                      mover(dragId, col);
                      setDragId(null);
                    }
                  }
                },
                /* @__PURE__ */ React.createElement("div", { className: "kanban-col-head" }, /* @__PURE__ */ React.createElement("span", { className: "kanban-col-titulo" }, labels[col] || col), /* @__PURE__ */ React.createElement("span", { className: "kanban-col-count" }, lista.length)),
                /* @__PURE__ */ React.createElement("div", { className: "kanban-col-body" }, lista.map((c) => /* @__PURE__ */ React.createElement(
                  "div",
                  {
                    key: c.id,
                    className: "kanban-cartao",
                    draggable: true,
                    onDragStart: () => setDragId(c.id),
                    onDragEnd: () => setDragId(null)
                  },
                  /* @__PURE__ */ React.createElement("button", { className: "kanban-cartao-x", title: "Excluir", onClick: () => excluir(c.id) }, "\xD7"),
                  /* @__PURE__ */ React.createElement("div", { className: "kanban-cartao-titulo" }, c.titulo || "\u2014"),
                  c.caso && /* @__PURE__ */ React.createElement("div", { className: "kanban-cartao-meta" }, c.caso.area && /* @__PURE__ */ React.createElement("span", { className: "chip tiny" }, c.caso.area), c.caso.tribunal && /* @__PURE__ */ React.createElement("span", { className: "chip tiny" }, c.caso.tribunal)),
                  c.prazo && /* @__PURE__ */ React.createElement("div", { className: "kanban-cartao-prazo tiny" }, "\u23F0 ", c.prazo)
                )))
              );
            })), novaTarefa && /* @__PURE__ */ React.createElement(
              BasckModals.KanbanForm,
              {
                onClose: (atualizou) => {
                  setNovaTarefa(false);
                  if (atualizou) carregar();
                }
              }
            ));
          }
          function IntegracoesView() {
            const [itens, setItens] = useState([]);
            const [oabs, setOabs] = useState([]);
            const [modal, setModal] = useState(null);
            const [modalOab, setModalOab] = useState(false);
            const [resultado, setResultado] = useState(null);
            function carregar() {
              Promise.all([BasckApi.integracoes.listar(), BasckApi.integracoes.oab.listar()]).then(([a, b]) => {
                setItens(a.itens || []);
                setOabs(b.itens || []);
              }).catch(() => {
              });
            }
            useEffect(carregar, []);
            async function consultar(id) {
              try {
                const r = await BasckApi.integracoes.consultar(id);
                setResultado(r.resultado);
                carregar();
              } catch (e) {
                alert(e.message);
              }
            }
            async function verificarOabs() {
              try {
                const r = await BasckApi.integracoes.oab.verificar();
                setOabs(r.itens || []);
              } catch (e) {
                alert(e.message);
              }
            }
            return /* @__PURE__ */ React.createElement("div", { className: "view" }, /* @__PURE__ */ React.createElement("div", { className: "view-head" }, /* @__PURE__ */ React.createElement("h1", { className: "serif" }, "Integra\xE7\xF5es com Tribunais"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", { className: "btn ghost", onClick: () => setModalOab(true), style: { marginRight: 8 } }, "+ Monitorar OAB"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: () => setModal({}) }, "+ Nova integra\xE7\xE3o"))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("h3", null, "Integra\xE7\xF5es cadastradas"), /* @__PURE__ */ React.createElement("p", { className: "muted tiny" }, "As credenciais s\xE3o criptografadas com AES-256-GCM antes de salvar."), itens.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "empty" }, "Nenhuma integra\xE7\xE3o cadastrada."), /* @__PURE__ */ React.createElement("div", { className: "grid-cards" }, itens.map((i) => /* @__PURE__ */ React.createElement("div", { key: i.id, className: "card-mini" + (i.ativo ? "" : " desativado") }, /* @__PURE__ */ React.createElement("div", { className: "card-mini-titulo" }, i.apelido || i.identificador), /* @__PURE__ */ React.createElement("div", { className: "tiny muted" }, i.tribunal, " \xB7 ", i.tipo_credencial), /* @__PURE__ */ React.createElement("div", { className: "tiny muted" }, "ID: ", i.identificador), i.ultima_consulta && /* @__PURE__ */ React.createElement("div", { className: "tiny" }, "\xDAltima consulta: ", new Date(i.ultima_consulta).toLocaleString("pt-BR")), /* @__PURE__ */ React.createElement("div", { className: "cc-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", disabled: !i.ativo, onClick: () => consultar(i.id) }, "Consultar agora"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: () => setModal(i) }, "Editar"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: async () => {
              if (!confirm("Remover esta integra\xE7\xE3o?")) return;
              await BasckApi.integracoes.remover(i.id);
              carregar();
            } }, "Remover")))))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("h3", null, "Monitoramento de OAB"), /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: verificarOabs }, "Verificar agora")), oabs.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "empty" }, "Nenhuma OAB cadastrada para monitoramento."), /* @__PURE__ */ React.createElement("table", { className: "tabela" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "N\xFAmero"), /* @__PURE__ */ React.createElement("th", null, "UF"), /* @__PURE__ */ React.createElement("th", null, "Situa\xE7\xE3o"), /* @__PURE__ */ React.createElement("th", null, "\xDAltima verifica\xE7\xE3o"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, oabs.map((o) => /* @__PURE__ */ React.createElement("tr", { key: o.id }, /* @__PURE__ */ React.createElement("td", null, o.numero_oab), /* @__PURE__ */ React.createElement("td", null, o.uf), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "chip " + (o.situacao === "regular" ? "ok" : "warn") }, o.situacao || "pendente")), /* @__PURE__ */ React.createElement("td", null, o.ultima_verificacao ? new Date(o.ultima_verificacao).toLocaleString("pt-BR") : "\u2014"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { className: "btn ghost sm", onClick: async () => {
              if (!confirm("Remover esta OAB do monitoramento?")) return;
              await BasckApi.integracoes.oab.remover(o.id);
              carregar();
            } }, "Remover"))))))), modal && /* @__PURE__ */ React.createElement(BasckModals.Modal, { titulo: modal.id ? "Editar integra\xE7\xE3o" : "Nova integra\xE7\xE3o", onClose: () => {
              setModal(null);
              setResultado(null);
            }, lg: true }, /* @__PURE__ */ React.createElement(BasckModals.IntegracaoForm, { inicial: modal, onSalvar: () => {
              setModal(null);
              carregar();
            }, onCancelar: () => setModal(null) })), modalOab && /* @__PURE__ */ React.createElement(BasckModals.Modal, { titulo: "Monitorar OAB", onClose: () => setModalOab(false) }, /* @__PURE__ */ React.createElement(BasckModals.OabForm, { onSalvar: () => {
              setModalOab(false);
              carregar();
            }, onCancelar: () => setModalOab(false) })), resultado && /* @__PURE__ */ React.createElement(BasckModals.Modal, { titulo: "Resultado da consulta", onClose: () => setResultado(null) }, /* @__PURE__ */ React.createElement("pre", { style: { background: "var(--bg-3)", padding: 16, borderRadius: 8, overflow: "auto", maxHeight: 400, fontSize: 12 } }, JSON.stringify(resultado, null, 2))));
          }
          global2.BasckUI = {
            DashboardView,
            CasosView,
            PrazosView,
            TarefasView,
            ClientesView,
            FinanceiroView,
            DocumentosView,
            ConfiguracoesView,
            CompromissosView,
            KanbanView,
            IntegracoesView
          };
        })(window);
      })();
      (function() {
        (function(global2) {
          const { useState, useEffect, useRef, useCallback } = React;
          function fmtData(s) {
            if (!s) return "";
            const iso = String(s).slice(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return s;
            const [y, m, d] = iso.split("-");
            return d + "/" + m + "/" + y;
          }
          function BuscaModal({ aberto, onFechar, onResultado }) {
            const [q, setQ] = useState("");
            const [resultados, setResultados] = useState(null);
            const [carregando, setCarregando] = useState(false);
            const [selecionado, setSelecionado] = useState(0);
            const inputRef = useRef(null);
            const listaRef = useRef([]);
            useEffect(() => {
              if (aberto) {
                setQ("");
                setResultados(null);
                setSelecionado(0);
                setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
              }
            }, [aberto]);
            useEffect(() => {
              if (!aberto) return;
              if (q.length < 2) {
                setResultados(null);
                return;
              }
              setCarregando(true);
              const t = setTimeout(() => {
                BasckApi.busca(q).then((r) => {
                  setResultados(r);
                  setSelecionado(0);
                }).catch(() => setResultados({ grupos: { clientes: [], casos: [], prazos: [], tarefas: [] }, total: 0 })).finally(() => setCarregando(false));
              }, 200);
              return () => clearTimeout(t);
            }, [q, aberto]);
            const itensFlat = useCallback(() => {
              if (!resultados) return [];
              const out = [];
              const g = resultados.grupos;
              g.clientes.forEach((c) => out.push({ tipo: "cliente", id: c.id, label: c.nome, sub: c.email || c.documento || "" }));
              g.casos.forEach((c) => out.push({ tipo: "caso", id: c.id, label: c.titulo, sub: c.numero_processo || c.area || "" }));
              g.prazos.forEach((p) => out.push({ tipo: "prazo", id: p.id, label: p.titulo, sub: "Vence " + fmtData(p.data_vencimento) + " \xB7 " + (p.caso_titulo || "") }));
              g.tarefas.forEach((t) => out.push({ tipo: "tarefa", id: t.id, label: t.titulo, sub: t.caso_titulo || "" }));
              return out;
            }, [resultados]);
            function navegar(item) {
              onFechar();
              const map = { cliente: "clientes", caso: "casos", prazo: "prazos", tarefa: "tarefas" };
              onResultado(map[item.tipo], item.id);
            }
            function onKeyDown(e) {
              const itens2 = itensFlat();
              if (e.key === "Escape") {
                onFechar();
                return;
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelecionado((s) => Math.min(itens2.length - 1, s + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelecionado((s) => Math.max(0, s - 1));
              }
              if (e.key === "Enter" && itens2[selecionado]) {
                e.preventDefault();
                navegar(itens2[selecionado]);
              }
            }
            const itens = itensFlat();
            let idxFlat = 0;
            if (!aberto) return null;
            return /* @__PURE__ */ React.createElement("div", { className: "busca-overlay", onClick: onFechar }, /* @__PURE__ */ React.createElement("div", { className: "busca-modal", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "busca-input" }, /* @__PURE__ */ React.createElement("span", { className: "busca-ico" }, "\u2315"), /* @__PURE__ */ React.createElement(
              "input",
              {
                ref: inputRef,
                value: q,
                onChange: (e) => setQ(e.target.value),
                onKeyDown,
                placeholder: "Buscar clientes, casos, prazos, tarefas...",
                autoComplete: "off"
              }
            ), /* @__PURE__ */ React.createElement("kbd", null, "esc")), /* @__PURE__ */ React.createElement("div", { className: "busca-resultados" }, !q && /* @__PURE__ */ React.createElement("div", { className: "busca-vazio" }, "Digite ao menos 2 caracteres para buscar."), q && q.length < 2 && /* @__PURE__ */ React.createElement("div", { className: "busca-vazio" }, "Continuar digitando..."), q && q.length >= 2 && carregando && /* @__PURE__ */ React.createElement("div", { className: "busca-vazio" }, "Buscando..."), q && q.length >= 2 && !carregando && resultados && resultados.total === 0 && /* @__PURE__ */ React.createElement("div", { className: "busca-vazio" }, 'Nenhum resultado para "', /* @__PURE__ */ React.createElement("b", null, q), '".'), resultados && resultados.total > 0 && /* @__PURE__ */ React.createElement("div", { className: "busca-grupos" }, resultados.grupos.clientes.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "busca-grupo" }, /* @__PURE__ */ React.createElement("div", { className: "busca-grupo-titulo" }, "Clientes (", resultados.grupos.clientes.length, ")"), resultados.grupos.clientes.map((c) => {
              const i = idxFlat++;
              return /* @__PURE__ */ React.createElement("button", { key: "c" + c.id, className: "busca-item" + (i === selecionado ? " active" : ""), onClick: () => navegar({ tipo: "cliente", id: c.id }) }, /* @__PURE__ */ React.createElement("span", { className: "busca-item-tipo" }, "cliente"), /* @__PURE__ */ React.createElement("span", { className: "busca-item-label" }, c.nome), /* @__PURE__ */ React.createElement("span", { className: "busca-item-sub" }, c.email || c.documento || ""));
            })), resultados.grupos.casos.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "busca-grupo" }, /* @__PURE__ */ React.createElement("div", { className: "busca-grupo-titulo" }, "Casos (", resultados.grupos.casos.length, ")"), resultados.grupos.casos.map((c) => {
              const i = idxFlat++;
              return /* @__PURE__ */ React.createElement("button", { key: "c" + c.id, className: "busca-item" + (i === selecionado ? " active" : ""), onClick: () => navegar({ tipo: "caso", id: c.id }) }, /* @__PURE__ */ React.createElement("span", { className: "busca-item-tipo" }, "caso"), /* @__PURE__ */ React.createElement("span", { className: "busca-item-label" }, c.titulo), /* @__PURE__ */ React.createElement("span", { className: "busca-item-sub" }, c.numero_processo || c.area || ""));
            })), resultados.grupos.prazos.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "busca-grupo" }, /* @__PURE__ */ React.createElement("div", { className: "busca-grupo-titulo" }, "Prazos (", resultados.grupos.prazos.length, ")"), resultados.grupos.prazos.map((p) => {
              const i = idxFlat++;
              return /* @__PURE__ */ React.createElement("button", { key: "p" + p.id, className: "busca-item" + (i === selecionado ? " active" : ""), onClick: () => navegar({ tipo: "prazo", id: p.id }) }, /* @__PURE__ */ React.createElement("span", { className: "busca-item-tipo" }, "prazo"), /* @__PURE__ */ React.createElement("span", { className: "busca-item-label" }, p.titulo), /* @__PURE__ */ React.createElement("span", { className: "busca-item-sub" }, "Vence ", fmtData(p.data_vencimento), " \xB7 ", p.caso_titulo || ""));
            })), resultados.grupos.tarefas.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "busca-grupo" }, /* @__PURE__ */ React.createElement("div", { className: "busca-grupo-titulo" }, "Tarefas (", resultados.grupos.tarefas.length, ")"), resultados.grupos.tarefas.map((t) => {
              const i = idxFlat++;
              return /* @__PURE__ */ React.createElement("button", { key: "t" + t.id, className: "busca-item" + (i === selecionado ? " active" : ""), onClick: () => navegar({ tipo: "tarefa", id: t.id }) }, /* @__PURE__ */ React.createElement("span", { className: "busca-item-tipo" }, "tarefa"), /* @__PURE__ */ React.createElement("span", { className: "busca-item-label" }, t.titulo), /* @__PURE__ */ React.createElement("span", { className: "busca-item-sub" }, t.caso_titulo || ""));
            })))), /* @__PURE__ */ React.createElement("div", { className: "busca-footer" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("kbd", null, "\u2191"), /* @__PURE__ */ React.createElement("kbd", null, "\u2193"), " navegar"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("kbd", null, "\u23CE"), " abrir"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("kbd", null, "esc"), " fechar"))));
          }
          global2.BasckBusca = { BuscaModal };
        })(window);
      })();
      (function() {
        const { useState, useEffect, useCallback } = React;
        function App() {
          const [usuario, setUsuario] = useState(null);
          const [verificando, setVerificando] = useState(true);
          const [view, setView] = useState("dashboard");
          const [toasts, setToasts] = useState([]);
          const [menuAberto, setMenuAberto] = useState(false);
          const [buscaAberta, setBuscaAberta] = useState(false);
          const [versao, setVersao] = useState("");
          const toast = useCallback((msg, tipo = "info") => {
            const id = Date.now() + Math.random();
            setToasts((t) => [...t, { id, msg, tipo }]);
            setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
          }, []);
          useEffect(() => {
            const sess = BasckApi.getSession();
            if (sess && sess.token && sess.usuario) {
              BasckApi.auth.perfil().then((r) => setUsuario(r.usuario)).catch(() => {
                BasckApi.clearSession();
                setUsuario(null);
              }).finally(() => setVerificando(false));
            } else {
              setVerificando(false);
            }
            BasckApi.saude().then((r) => setVersao(r.versao || "")).catch(() => {
            });
          }, []);
          useEffect(() => {
            function onKey(e) {
              if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
                e.preventDefault();
                setBuscaAberta((b) => !b);
              }
            }
            window.addEventListener("keydown", onKey);
            return () => window.removeEventListener("keydown", onKey);
          }, []);
          function logout() {
            BasckApi.clearSession();
            setUsuario(null);
          }
          if (verificando) {
            return /* @__PURE__ */ React.createElement("div", { className: "loading", style: { height: "100vh" } }, /* @__PURE__ */ React.createElement("div", { className: "spinner" }), "Carregando Basck Law...");
          }
          if (!usuario) {
            return /* @__PURE__ */ React.createElement(BasckAuth.LoginView, { onAuth: setUsuario });
          }
          const nav = [
            { id: "dashboard", label: "Dashboard", icon: "\u2302" },
            { id: "casos", label: "Casos", icon: "\xA7" },
            { id: "prazos", label: "Prazos", icon: "\u25F7" },
            { id: "tarefas", label: "Tarefas", icon: "\u2713" },
            { id: "clientes", label: "Clientes", icon: "\u2609" },
            { id: "documentos", label: "Documentos", icon: "\u229F" },
            { id: "financeiro", label: "Financeiro", icon: "\u232C" },
            { id: "compromissos", label: "Compromissos", icon: "\u2696" },
            { id: "kanban", label: "Kanban", icon: "\u25A6" },
            { id: "integracoes", label: "Integra\xE7\xF5es", icon: "\u232C" },
            { id: "configuracoes", label: "Configura\xE7\xF5es", icon: "\u2699" }
          ];
          const titulos = {
            dashboard: { t: "Dashboard", s: "Vis\xE3o geral do seu escrit\xF3rio" },
            casos: { t: "Casos", s: "Processos e pastas digitais" },
            prazos: { t: "Prazos", s: "Compromissos e contagens processuais" },
            tarefas: { t: "Tarefas", s: "Atividades do dia a dia" },
            clientes: { t: "Clientes", s: "Sua carteira de clientes" },
            documentos: { t: "Documentos", s: "Arquivos e uploads" },
            financeiro: { t: "Financeiro", s: "Honor\xE1rios, cobran\xE7as e relat\xF3rios" },
            compromissos: { t: "Compromissos", s: "Audi\xEAncias, prazos e reuni\xF5es" },
            kanban: { t: "Kanban", s: "Gest\xE3o visual de casos em colunas" },
            integracoes: { t: "Integra\xE7\xF5es", s: "Tribunais e monitoramento de OAB" },
            configuracoes: { t: "Configura\xE7\xF5es", s: "Perfil e conta" }
          };
          function renderView() {
            const props = { toast };
            switch (view) {
              case "dashboard":
                return /* @__PURE__ */ React.createElement(BasckUI.DashboardView, { irPara: setView, ...props });
              case "casos":
                return /* @__PURE__ */ React.createElement(BasckUI.CasosView, { ...props });
              case "prazos":
                return /* @__PURE__ */ React.createElement(BasckUI.PrazosView, { ...props });
              case "tarefas":
                return /* @__PURE__ */ React.createElement(BasckUI.TarefasView, { ...props });
              case "clientes":
                return /* @__PURE__ */ React.createElement(BasckUI.ClientesView, { ...props });
              case "documentos":
                return /* @__PURE__ */ React.createElement(BasckUI.DocumentosView, { ...props });
              case "financeiro":
                return /* @__PURE__ */ React.createElement(BasckUI.FinanceiroView, { ...props });
              case "compromissos":
                return /* @__PURE__ */ React.createElement(BasckUI.CompromissosView, { ...props });
              case "kanban":
                return /* @__PURE__ */ React.createElement(BasckUI.KanbanView, { ...props });
              case "integracoes":
                return /* @__PURE__ */ React.createElement(BasckUI.IntegracoesView, { ...props });
              case "configuracoes":
                return /* @__PURE__ */ React.createElement(BasckUI.ConfiguracoesView, { usuario, onAtualizar: setUsuario, ...props });
              default:
                return null;
            }
          }
          const meta = titulos[view] || { t: "Basck Law", s: "" };
          const iniciais = (usuario.nome || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
          function irParaResultado(viewDestino, id) {
            setView(viewDestino);
          }
          return /* @__PURE__ */ React.createElement("div", { className: "app" }, /* @__PURE__ */ React.createElement("aside", { className: "sidebar" + (menuAberto ? " open" : "") }, /* @__PURE__ */ React.createElement("div", { className: "brand" }, /* @__PURE__ */ React.createElement("div", { className: "mark" }, "B"), /* @__PURE__ */ React.createElement("div", { className: "name" }, "Basck ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--gold)" } }, "Law"))), /* @__PURE__ */ React.createElement("nav", { className: "nav" }, nav.map((n) => /* @__PURE__ */ React.createElement("button", { key: n.id, className: "nav-item" + (view === n.id ? " active" : ""), onClick: () => {
            setView(n.id);
            setMenuAberto(false);
          } }, /* @__PURE__ */ React.createElement("span", { className: "ico" }, n.icon), n.label))), /* @__PURE__ */ React.createElement("div", { className: "user-card" }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, iniciais), /* @__PURE__ */ React.createElement("div", { className: "info" }, /* @__PURE__ */ React.createElement("div", { className: "name" }, usuario.nome), /* @__PURE__ */ React.createElement("div", { className: "email" }, usuario.email)), /* @__PURE__ */ React.createElement("button", { className: "logout", onClick: logout, title: "Sair" }, "\u238B"))), /* @__PURE__ */ React.createElement("main", { className: "main" }, /* @__PURE__ */ React.createElement("div", { className: "topbar" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "title serif" }, meta.t), /* @__PURE__ */ React.createElement("div", { className: "sub" }, meta.s)), /* @__PURE__ */ React.createElement("div", { className: "actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", onClick: () => setBuscaAberta(true), title: "Buscar (Ctrl+K)" }, /* @__PURE__ */ React.createElement("span", { style: { marginRight: 6 } }, "\u2315"), " Buscar ", /* @__PURE__ */ React.createElement("kbd", { className: "kbd-inline" }, "Ctrl+K")), /* @__PURE__ */ React.createElement("button", { className: "menu-btn btn", onClick: () => setMenuAberto(!menuAberto) }, "\u2630"))), renderView(), versao && /* @__PURE__ */ React.createElement("div", { className: "versao" }, "Basck Law v", versao)), /* @__PURE__ */ React.createElement(BasckBusca.BuscaModal, { aberto: buscaAberta, onFechar: () => setBuscaAberta(false), onResultado: irParaResultado }), /* @__PURE__ */ React.createElement("div", { className: "toast-area" }, toasts.map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "toast " + (t.tipo === "error" ? "error" : t.tipo === "success" ? "success" : "") }, t.msg))));
        }
        const root = ReactDOM.createRoot(document.getElementById("root"));
        root.render(/* @__PURE__ */ React.createElement(App, null));
      })();
    }
  });
  require_stage();
})();
