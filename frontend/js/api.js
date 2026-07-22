// frontend/js/api.js
// Cliente HTTP para a API do Basck Law
(function (global) {
  const STORAGE_KEY = 'basck-law-auth';

  function getToken() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw).token || null;
    } catch (_) { return null; }
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
    } catch (_) { return null; }
  }

  async function request(path, { method = 'GET', body = null, isForm = false } = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    let payload;
    if (isForm) {
      payload = body;
    } else if (body) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    const res = await fetch(path, { method, headers, body: payload });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = { erro: text }; }

    if (!res.ok) {
      if (res.status === 401) {
        clearSession();
        if (global.location && global.location.pathname !== '/') global.location.href = '/';
      }
      const erro = new Error((data && data.erro) || `Erro ${res.status}`);
      erro.status = res.status;
      erro.data = data;
      throw erro;
    }
    return data;
  }

  const api = {
    getToken, setSession, clearSession, getSession,

    saude: () => request('/api/saude'),

    auth: {
      cadastrar: (d) => request('/api/auth/cadastro', { method: 'POST', body: d }),
      login: (d) => request('/api/auth/login', { method: 'POST', body: d }),
      perfil: () => request('/api/auth/perfil'),
      atualizarPerfil: (d) => request('/api/auth/perfil', { method: 'PUT', body: d })
    },

    clientes: {
      listar: () => request('/api/clientes'),
      buscar: (id) => request(`/api/clientes/${id}`),
      criar: (d) => request('/api/clientes', { method: 'POST', body: d }),
      atualizar: (id, d) => request(`/api/clientes/${id}`, { method: 'PUT', body: d }),
      remover: (id) => request(`/api/clientes/${id}`, { method: 'DELETE' })
    },

    casos: {
      listar: (params = {}) => {
        const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== '')).toString();
        return request('/api/casos' + (q ? '?' + q : ''));
      },
      estatisticas: () => request('/api/casos/estatisticas'),
      buscar: (id) => request(`/api/casos/${id}`),
      detalhes: (id) => request(`/api/casos/${id}/detalhes`),
      criar: (d) => request('/api/casos', { method: 'POST', body: d }),
      atualizar: (id, d) => request(`/api/casos/${id}`, { method: 'PUT', body: d }),
      remover: (id) => request(`/api/casos/${id}`, { method: 'DELETE' }),
      andamentos: {
        listar: (casoId) => request(`/api/casos/${casoId}/andamentos`),
        criar: (casoId, d) => request(`/api/casos/${casoId}/andamentos`, { method: 'POST', body: d }),
        remover: (casoId, andamentoId) => request(`/api/casos/${casoId}/andamentos/${andamentoId}`, { method: 'DELETE' })
      }
    },

    prazos: {
      listar: (params = {}) => {
        const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== '')).toString();
        return request('/api/prazos' + (q ? '?' + q : ''));
      },
      proximos: (dias = 7) => request(`/api/prazos/proximos?dias=${dias}`),
      criar: (d) => request('/api/prazos', { method: 'POST', body: d }),
      atualizar: (id, d) => request(`/api/prazos/${id}`, { method: 'PUT', body: d }),
      concluir: (id) => request(`/api/prazos/${id}/concluir`, { method: 'POST' }),
      reabrir: (id) => request(`/api/prazos/${id}/reabrir`, { method: 'POST' }),
      remover: (id) => request(`/api/prazos/${id}`, { method: 'DELETE' })
    },

    tarefas: {
      listar: (params = {}) => {
        const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== '')).toString();
        return request('/api/tarefas' + (q ? '?' + q : ''));
      },
      criar: (d) => request('/api/tarefas', { method: 'POST', body: d }),
      atualizar: (id, d) => request(`/api/tarefas/${id}`, { method: 'PUT', body: d }),
      concluir: (id) => request(`/api/tarefas/${id}/concluir`, { method: 'POST' }),
      remover: (id) => request(`/api/tarefas/${id}`, { method: 'DELETE' })
    },

    documentos: {
      listar: (caso_id = null) => request('/api/documentos' + (caso_id ? `?caso_id=${caso_id}` : '')),
      espaco: () => request('/api/documentos/espaco'),
      upload: (formData) => request('/api/documentos', { method: 'POST', body: formData, isForm: true }),
      downloadUrl: (id) => '/api/documentos/' + id + '/download',
      remover: (id) => request(`/api/documentos/${id}`, { method: 'DELETE' })
    },

    busca: (q) => request("/api/busca?q=" + encodeURIComponent(q)),

    financeiro: {
      listar: (params = {}) => {
        const q = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null && v !== '')).toString();
        return request('/api/financeiro' + (q ? '?' + q : ''));
      },
      resumo: () => request('/api/financeiro/resumo'),
      criar: (d) => request('/api/financeiro', { method: 'POST', body: d }),
      atualizar: (id, d) => request(`/api/financeiro/${id}`, { method: 'PUT', body: d }),
      marcarPago: (id, d) => request(`/api/financeiro/${id}/marcar-pago`, { method: 'POST', body: d }),
      remover: (id) => request(`/api/financeiro/${id}`, { method: 'DELETE' }),
      csvUrl: () => '/api/financeiro/exportar.csv'
    }
  };

  global.BasckApi = api;
})(window);
