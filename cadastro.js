/**
 * cadastro.js
 * -----------------------------------------------------------------------
 * Página pública de inscrição. Monta a árvore de seleção em 3 níveis
 * a partir do config.js:
 *   Categoria  ->  Modalidade  ->  Naipe
 * Marca a categoria, abre o submenu de modalidades; marca a modalidade,
 * abre o submenu de naipe (1 ou os 2). Grava a inscrição no Firestore.
 * Não faz sorteio nenhum — só liga a escola às combinações em que ela
 * vai competir.
 * -----------------------------------------------------------------------
 */

// ------------------------------------------------------------------
// Inicializa Firebase
// ------------------------------------------------------------------
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
// ------------------------------------------------------------------
// Popula o select de escolas a partir da lista fixa em config.js
// ------------------------------------------------------------------
const campoEscola = document.getElementById('escola');
ESCOLAS.forEach(nomeEscola => {
  const opt = document.createElement('option');
  opt.value = nomeEscola;
  opt.textContent = nomeEscola;
  campoEscola.appendChild(opt);
});

// ------------------------------------------------------------------
// Monta a árvore Categoria -> Modalidade -> Naipe
// ------------------------------------------------------------------
const listaCategorias = document.getElementById('lista-categorias');

listaCategorias.innerHTML = CATEGORIAS.map(cat => `
  <div class="categoria-bloco" data-categoria="${cat.id}">
    <label class="linha-categoria">
      <input type="checkbox" class="check-categoria" value="${cat.id}">
      <span class="nome-categoria">${cat.nome}${cat.faixa ? ` <span class="faixa-categoria">(${cat.faixa})</span>` : ''}</span>
      <span class="seta">▼</span>
    </label>
    <div class="submenu-modalidade">
      <span class="submenu-titulo">Modalidades em ${cat.nome}</span>
      <div class="lista-modalidades-sub">
        ${MODALIDADES.map(mod => `
          <div class="modalidade-bloco" data-modalidade="${mod.id}">
            <label class="linha-modalidade">
              <input type="checkbox" class="check-modalidade" value="${mod.id}">
              <span class="nome-modalidade">${mod.nome}</span>
              <span class="seta">▼</span>
            </label>
            <div class="submenu-naipe">
              <span class="submenu-titulo">Naipe em ${mod.nome} — marque 1 ou os 2</span>
              <div class="chips-naipe-sub">
                ${NAIPES.map(n => `
                  <label class="chip naipe-sub">
                    <input type="checkbox" class="check-naipe-sub" value="${n.id}">
                    <span class="rotulo">${n.nome}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
`).join('');

// ------------------------------------------------------------------
// Cascata de abrir/fechar submenus
// ------------------------------------------------------------------

// Nível 1: categoria abre/fecha o submenu de modalidades
listaCategorias.querySelectorAll('.check-categoria').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const blocoCategoria = checkbox.closest('.categoria-bloco');
    blocoCategoria.classList.toggle('selecionada', checkbox.checked);
    if (!checkbox.checked) {
      // desmarca tudo que está dentro dessa categoria (modalidades e naipes)
      blocoCategoria.querySelectorAll('.check-modalidade, .check-naipe-sub').forEach(el => { el.checked = false; });
      blocoCategoria.querySelectorAll('.modalidade-bloco.selecionada').forEach(el => el.classList.remove('selecionada'));
      blocoCategoria.querySelectorAll('.submenu-naipe.invalido').forEach(el => el.classList.remove('invalido'));
      blocoCategoria.querySelector('.lista-modalidades-sub')?.classList.remove('invalido');
    }
  });
});

// Nível 2: modalidade abre/fecha o submenu de naipe
listaCategorias.querySelectorAll('.check-modalidade').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const blocoModalidade = checkbox.closest('.modalidade-bloco');
    blocoModalidade.classList.toggle('selecionada', checkbox.checked);
    if (!checkbox.checked) {
      blocoModalidade.querySelectorAll('.check-naipe-sub').forEach(n => { n.checked = false; });
      blocoModalidade.querySelector('.submenu-naipe').classList.remove('invalido');
    }
  });
});

// ------------------------------------------------------------------
// Lê a árvore de seleção e monta o array plano de combinações
// ex: [{ categoria: 'infantil', modalidade: 'futsal', naipes: ['masculino','feminino'] }, ...]
// ------------------------------------------------------------------
function coletarCombinacoes() {
  const combinacoes = [];

  listaCategorias.querySelectorAll('.categoria-bloco').forEach(blocoCategoria => {
    const checkCategoria = blocoCategoria.querySelector('.check-categoria');
    if (!checkCategoria.checked) return;

    blocoCategoria.querySelectorAll('.modalidade-bloco').forEach(blocoModalidade => {
      const checkModalidade = blocoModalidade.querySelector('.check-modalidade');
      if (!checkModalidade.checked) return;

      const naipesMarcados = [...blocoModalidade.querySelectorAll('.check-naipe-sub:checked')].map(el => el.value);
      combinacoes.push({
        categoria: checkCategoria.value,
        modalidade: checkModalidade.value,
        naipes: naipesMarcados
      });
    });
  });

  return combinacoes;
}

// ------------------------------------------------------------------
// Máscara de CPF (000.000.000-00) enquanto digita
// ------------------------------------------------------------------
const campoCpf = document.getElementById('cpf');
campoCpf.addEventListener('input', () => {
  let v = campoCpf.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  campoCpf.value = v;
});

// ------------------------------------------------------------------
// Validação de CPF (dígitos verificadores)
// ------------------------------------------------------------------
function cpfValido(cpfFormatado) {
  const cpf = cpfFormatado.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos os dígitos iguais

  const calcDigito = (base, pesoInicial) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcDigito(cpf.slice(0, 9), 10);
  const d2 = calcDigito(cpf.slice(0, 10), 11);

  return d1 === parseInt(cpf[9], 10) && d2 === parseInt(cpf[10], 10);
}

// ------------------------------------------------------------------
// Helpers de erro visual
// ------------------------------------------------------------------
function mostrarErro(idCampo, idErro) {
  document.getElementById(idCampo)?.classList.add('invalido');
  document.getElementById(idErro).classList.add('mostrar');
}

function limparErro(idCampo, idErro) {
  document.getElementById(idCampo)?.classList.remove('invalido');
  document.getElementById(idErro).classList.remove('mostrar');
}

function limparTodosErros() {
  ['nome', 'cpf', 'escola'].forEach(id => limparErro(id, `erro-${id}`));
  ['categoria', 'modalidade', 'naipe'].forEach(id => limparErro(null, `erro-${id}`));
  listaCategorias.querySelectorAll('.submenu-naipe.invalido').forEach(el => el.classList.remove('invalido'));
  listaCategorias.querySelectorAll('.lista-modalidades-sub.invalido').forEach(el => el.classList.remove('invalido'));
}

// ------------------------------------------------------------------
// Envio do formulário
// ------------------------------------------------------------------
const form = document.getElementById('form-inscricao');
const btnEnviar = document.getElementById('btn-enviar');
const statusMsg = document.getElementById('status-msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  limparTodosErros();
  statusMsg.className = 'status';

  const nome = document.getElementById('nome').value.trim();
  const cpf = document.getElementById('cpf').value.trim();
  const escola = document.getElementById('escola').value.trim();

  const categoriasMarcadas = [...listaCategorias.querySelectorAll('.check-categoria:checked')].map(el => el.value);
  const combinacoes = coletarCombinacoes();

  let valido = true;

  if (!nome) { mostrarErro('nome', 'erro-nome'); valido = false; }
  if (!cpfValido(cpf)) { mostrarErro('cpf', 'erro-cpf'); valido = false; }
  if (!escola) { mostrarErro('escola', 'erro-escola'); valido = false; }
  if (categoriasMarcadas.length === 0) { mostrarErro(null, 'erro-categoria'); valido = false; }

  // cada categoria marcada precisa de pelo menos 1 modalidade
  categoriasMarcadas.forEach(catId => {
    const temModalidade = combinacoes.some(c => c.categoria === catId);
    if (!temModalidade) {
      mostrarErro(null, 'erro-modalidade');
      listaCategorias.querySelector(`.categoria-bloco[data-categoria="${catId}"] .lista-modalidades-sub`)
        ?.classList.add('invalido');
      valido = false;
    }
  });

  // cada modalidade marcada precisa de pelo menos 1 naipe
  const combinacoesSemNaipe = combinacoes.filter(c => c.naipes.length === 0);
  if (combinacoesSemNaipe.length > 0) {
    mostrarErro(null, 'erro-naipe');
    combinacoesSemNaipe.forEach(c => {
      listaCategorias.querySelector(
        `.categoria-bloco[data-categoria="${c.categoria}"] .modalidade-bloco[data-modalidade="${c.modalidade}"] .submenu-naipe`
      )?.classList.add('invalido');
    });
    valido = false;
  }

  if (!valido) return;

  // remove da lista final as combinações incompletas (sem naipe), pra não gravar lixo
  const combinacoesValidas = combinacoes.filter(c => c.naipes.length > 0);

  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';

  try {
    await db.collection(COLLECTIONS.inscricoes).add({
      nome,
      cpf,
      escola,
      combinacoes: combinacoesValidas, // [{ categoria, modalidade, naipes: [...] }]
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    statusMsg.textContent = `Inscrição de "${escola}" enviada com sucesso!`;
    statusMsg.className = 'status mostrar ok';
    form.reset();
    listaCategorias.querySelectorAll('input:checked').forEach(el => el.checked = false);
    listaCategorias.querySelectorAll('.selecionada').forEach(el => el.classList.remove('selecionada'));
  } catch (err) {
    console.error('Erro ao gravar inscrição:', err);
    statusMsg.textContent = 'Não foi possível enviar a inscrição. Verifique sua conexão e tente novamente.';
    statusMsg.className = 'status mostrar falha';
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar inscrição';
  }
});
