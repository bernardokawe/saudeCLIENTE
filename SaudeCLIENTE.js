// app.js - versão robusta para o protótipo de fila/painel
// Carrega após o DOM estar pronto para evitar problemas de "elemento não encontrado"
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'sus_proto_fila_v1';

  // Estado inicial
  let state = {
    ultimaSenhaSeq: 0,
    fila: []
  };

  // DOM
  const form = document.getElementById('formCadastro');
  const proxSenhaEl = document.getElementById('proxSenha');
  const filaPublica = document.getElementById('filaPublica');
  const painelProxima = document.getElementById('painel_proxima');
  const tempoEstimadoEl = document.getElementById('tempoEstimado');

  // Funções de storage
  function carregarEstado() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      // validações simples
      if (parsed && typeof parsed === 'object') {
        state = {
          ultimaSenhaSeq: Number(parsed.ultimaSenhaSeq) || 0,
          fila: Array.isArray(parsed.fila) ? parsed.fila : []
        };
      }
    } catch (err) {
      console.warn('Erro ao parsear localStorage:', err);
    }
  }

  function salvarEstado() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Erro ao salvar localStorage:', err);
    }
  }

  // Formatação de senha
  function formatarSenha(seq) {
    return 'A-' + String(seq).padStart(3, '0');
  }

  function atualizarProxSenha() {
    if (proxSenhaEl) proxSenhaEl.textContent = formatarSenha(state.ultimaSenhaSeq + 1);
  }

  // Render fila pública
  function renderFila() {
    if (!filaPublica) return;
    filaPublica.innerHTML = '';
    if (!state.fila.length) {
      filaPublica.innerHTML = '<div class="small">Nenhum paciente na fila</div>';
      return;
    }

    state.fila.forEach((p, idx) => {
      const div = document.createElement('div');
      div.className = 'queue-item';
      const nome = p.nome || '—';
      const servico = p.servico || '';
      const idade = p.idade !== undefined ? `${p.idade} anos` : '';
      div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700">${p.senha} — ${nome}</div>
          <div class="small">${servico} • ${idade}</div>
        </div>
        <div class="small">Posição: ${idx + 1}</div>
      </div>`;
      filaPublica.appendChild(div);
    });
  }

  // Estimativa simples por serviço
  const tempoMedioPorServico = { consulta: 12, enfermagem: 8, odontologia: 18, vacina: 6 };
  function calcularTempoEstimado() {
    if (state.fila.length === 0) return '0 min';
    let total = 0;
    state.fila.forEach(p => {
      total += (tempoMedioPorServico[p.servico] || 10);
    });
    const avg = Math.round(total / state.fila.length);
    return `${avg} min (média)`;
  }

  function atualizarPainel() {
    if (painelProxima) painelProxima.textContent = state.fila.length ? state.fila[0].senha : '—';
    if (tempoEstimadoEl) tempoEstimadoEl.textContent = calcularTempoEstimado();
  }

  function atualizarUI() {
    atualizarProxSenha();
    renderFila();
    atualizarPainel();
    salvarEstado();
  }

  // Evento de submit (cadastro)
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();

      const nome = (document.getElementById('nome')?.value || '').trim();
      const idade = document.getElementById('idade')?.value || '';
      const servico = document.getElementById('servico')?.value || 'consulta';
      const observacao = document.getElementById('observacao')?.value || '';

      if (!nome) {
        alert('Por favor, preencha o nome do paciente.');
        return;
      }

      state.ultimaSenhaSeq = Number(state.ultimaSenhaSeq || 0) + 1;
      const senha = formatarSenha(state.ultimaSenhaSeq);

      const paciente = {
        senha,
        nome,
        idade,
        servico,
        observacao,
        timestamp: Date.now()
      };

      state.fila.push(paciente);
      // limpa campos do formulário
      form.reset();
      atualizarUI();

      // feedback
      try {
        // usar alert apenas no protótipo, em produção substitua por uma notificação visual
        alert('Senha emitida: ' + senha + '\\nPosição atual na fila: ' + state.fila.length);
      } catch (e) {
        console.log('Senha emitida:', senha);
      }
    });
  } else {
    console.warn('Formulário (id=formCadastro) não encontrado no DOM.');
  }

  // Inicialização
  carregarEstado();
  atualizarUI();

  // Atualiza painel periodicamente (caso queira ver mudanças em tempo real)
  setInterval(() => { atualizarPainel(); }, 6000);
});
