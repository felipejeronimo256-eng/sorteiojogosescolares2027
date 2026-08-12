/**
 * config.js
 * -----------------------------------------------------------------------
 * FONTE ÚNICA DA VERDADE do sistema de sorteio dos jogos escolares.
 * Tanto a página de CADASTRO (online) quanto a página de SORTEIO (local)
 * carregam este arquivo. Para adicionar/remover modalidade, naipe ou
 * categoria, mexa SOMENTE aqui — as duas páginas se atualizam sozinhas.
 * -----------------------------------------------------------------------
 */

// ------------------------------------------------------------------
// 1) Credenciais do Firebase
//    Preencha com os dados do seu projeto (Firebase Console > Configurações
//    do projeto > Seus apps > Config do SDK).
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCAFgYg5CAJfeZTUHlJKZoSgJAIJfL9MV8",
  authDomain: "sorteio-jogos-escolares-2027.firebaseapp.com",
  projectId: "sorteio-jogos-escolares-2027",
  storageBucket: "sorteio-jogos-escolares-2027.firebasestorage.app",
  messagingSenderId: "657472040054",
  appId: "1:657472040054:web:8829f39b8f2efaec820357"
};

// ------------------------------------------------------------------
// 2) Nomes das coleções no Firestore
// ------------------------------------------------------------------
const COLLECTIONS = {
  inscricoes: "inscricoes", // cadastro.html grava aqui
  sorteios: "sorteios"      // sorteio.html grava o resultado aqui
};

// ------------------------------------------------------------------
// 3) Escolas participantes
//    Lista fixa selecionável no cadastro (em vez de campo livre, pra
//    evitar erro de digitação/duplicidade nas chaves). Para adicionar
//    uma nova escola, é só incluir mais um item aqui.
// ------------------------------------------------------------------
const ESCOLAS = [
 "Centro de Educação Infantil Afrânio Samuel",
  "Centro de Educação Infantil Monte Belo",
  "Centro Social Educacional Almir Tavares",
  "Centro Educ. Arco-Íris",
  "Creche Casulo Tia Luiza",
  "Creche Clotilde Wanderley",
  "Creche Maria de Lourdes Monteiro Pontes",
  "Centro Educ. Mãos de Luz",
  "Escola Mun. Alfredo Gomes",
  "Escola Mun. Comunidade Cristã",
  "Escola Mun. Dr Benjamin Azevedo",
  "Escola Mun. Jacy Estelita",
  "Escola Mun. José Rufino",
  "Escola Mun. Juvenato Padre Guedes",
  "Escola Mun. Luiz Maranhão",
  "Escola Mun. Luiza Coutinho",
  "Escola Mun. Manoel de Oliveira",
  "Escola Mun. Maria de Lourdes Pedrosa",
  "Escola Mun. Maria José Monteiro",
  "Escola Mun. Napoleão Xavier de Morais",
  "Escola Mun. Urbano Ramos",
  "Grupo Escolar Carlos Pessoa Guerra",
  "Instituto Sagrado Coração de Jesus",
  "Instituto São Tarcísio",
  "EREM Padre Guedes",
  "EREM Dr. Joaquim Correia",
  // adicione novas escolas aqui, uma por linha, entre aspas e com vírgula
];

// ------------------------------------------------------------------
// 4) Modalidades disponíveis
//    id   -> usado internamente (chave, não muda depois de já ter dados)
//    nome -> exibido na tela
// ------------------------------------------------------------------
const MODALIDADES = [
  { id: "futsal",   nome: "Futsal" },
  { id: "volei",    nome: "Vôlei" },
  { id: "handbol",  nome: "Handbol" },
  { id: "basquete", nome: "Basquete" },
  { id: "futebol",  nome: "Futebol" }
];

// ------------------------------------------------------------------
// 5) Naipes disponíveis
// ------------------------------------------------------------------
const NAIPES = [
  { id: "masculino", nome: "Masculino" },
  { id: "feminino",  nome: "Feminino" }
];

// ------------------------------------------------------------------
// 6) Categorias (faixa etária) disponíveis
//    Lista padrão de torneios escolares — ajuste nomes/faixas à vontade,
//    o "id" é só a chave interna e não precisa mudar.
// ------------------------------------------------------------------
const CATEGORIAS = [
  { id: "mamadeira",      nome: "Mamadeira",      faixa: "4 a 6 anos" },
  { id: "chupetinha",     nome: "Chupetinha",     faixa: "6 a 8 anos" },
  { id: "fraldinha",      nome: "Fraldinha",      faixa: "8 a 10 anos" },
  { id: "pedagogico",     nome: "Pedagógico",     faixa: "9 a 12 anos"},
  { id: "mirim",          nome: "Mirim",          faixa: "12 a 14 anos"},
  { id: "infantil",       nome: "Infantil",       faixa: "15 a 17 anos" },
  { id: "juvenil",        nome: "Juvenil",        faixa: "15 a 19 anos" },
];

// ------------------------------------------------------------------
// 7) Regra de fechamento de grupos (usada no sorteio)
//    - Grupos "cheios" têm 3 times, jogando todos contra todos.
//    - Se sobrar 1 time fora dos grupos de 3, ele é anexado ao último
//      grupo, que vira um grupo de 4 (todos contra todos).
//    - Se sobrarem 2 times, eles formam um grupo de 2 (jogo único).
//    Isso já está implementado em sorteio.js; deixado documentado aqui
//    para quem for mexer no código futuramente.
// ------------------------------------------------------------------
const TAMANHO_GRUPO_PADRAO = 3;
