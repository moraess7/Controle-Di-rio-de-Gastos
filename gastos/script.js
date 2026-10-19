// ============================================================
// Controle Diário de Gastos - Strings Delimitadas (sem JSON!)
// Padrão de armazenamento no localStorage:
//   "descricao:valor:data||descricao:valor:data||..."
// ============================================================

// ----- Seleção dos elementos da página -----
const inputDescricao  = document.querySelector('#descricao');
const inputValor      = document.querySelector('#valor');
const inputData       = document.querySelector('#data');
const filtroData      = document.querySelector('#filtroData');
const corpoTabela     = document.querySelector('#corpoTabela');
const elemTotal       = document.querySelector('#total');   // agora é um <p>, não <div>
const btnAdicionar    = document.querySelector('#btnAdicionar');
const btnVerTodas     = document.querySelector('#btnVerTodas');
const btnExcluirTodas = document.querySelector('#btnExcluirTodas');

// ============================================================
// 1. ADICIONAR DESPESA - Serialização Delimitada
// ============================================================
btnAdicionar.addEventListener('click', function () {

    const descricao = inputDescricao.value.trim();
    const valor     = inputValor.value;
    const data      = inputData.value;

    // ----- Validação: nenhum campo pode ficar vazio -----
    if (descricao === '' || valor === '' || data === '') {
        alert('Preencha todos os campos (Descrição, Valor e Data)!');
        return;
    }

    // ----- Validação: o valor deve ser numérico e positivo -----
    if (isNaN(Number(valor)) || Number(valor) <= 0) {
        alert('Informe um valor válido e maior que zero!');
        return;
    }

    // ----- Monta a string no formato: descricao:valor:data -----
    const novoRegistro = descricao + ':' + valor + ':' + data;

    // ----- Recupera o que já existe e concatena com "||" -----
    let textoBruto = localStorage.getItem('despesas');

    if (textoBruto === null || textoBruto === '') {
        // Primeiro registro: salva direto
        localStorage.setItem('despesas', novoRegistro);
    } else {
        // Já existem dados: concatena separando por "||"
        localStorage.setItem('despesas', textoBruto + '||' + novoRegistro);
    }

    // ----- Limpa os campos do formulário -----
    inputDescricao.value = '';
    inputValor.value = '';
    inputData.value = '';

    renderizar(); // Atualiza a tela
});

// ============================================================
// 2. RENDERIZAÇÃO - Leitura, Processamento em Laço e Filtro
// ============================================================
function renderizar() {

    // ----- Recupera o texto bruto do localStorage -----
    let textoBruto = localStorage.getItem('despesas');
    let htmlLinhas = '';
    let total = 0;

    // ----- Caso não haja dados: mensagem e total zerado -----
    if (textoBruto === null || textoBruto === '') {
        corpoTabela.innerHTML = '<tr><td colspan="3">Nenhuma despesa gravada</td></tr>';
        elemTotal.innerHTML = 'Total R$ 0.00';
        return;
    }

    // ----- Converte o texto bruto em um vetor com split("||") -----
    const vetorDespesas = textoBruto.split('||');

    // ----- Percorre o vetor com for...of -----
    for (const item of vetorDespesas) {

        // ----- Isole os campos com split(":") -----
        const partes = item.split(':');
        const descricao = partes[0];
        const valor     = partes[1];
        const data      = partes[2];

        // ----- FILTRO: se houver data no filtro e for diferente,
        //       usa "continue" para ignorar o registro -----
        if (filtroData.value !== '' && data !== filtroData.value) {
            continue;
        }

        // ----- Acumula no total (convertendo para Number) -----
        total += Number(valor);

        // ----- Monta a linha HTML da tabela -----
        htmlLinhas += '<tr>';
        htmlLinhas += '<td>' + data + '</td>';
        htmlLinhas += '<td>' + descricao + '</td>';
        htmlLinhas += '<td>' + valor + '</td>';
        htmlLinhas += '</tr>';
    }

    // ----- Se após o filtro não sobrou nenhuma linha -----
    if (htmlLinhas === '') {
        corpoTabela.innerHTML = '<tr><td colspan="3">Nenhuma despesa gravada</td></tr>';
    } else {
        corpoTabela.innerHTML = htmlLinhas;
    }

    // ----- Exibe o total formatado com 2 casas decimais -----
    elemTotal.innerHTML = 'Total R$ ' + total.toFixed(2);
}

// ============================================================
// 3. EVENTOS DE FILTRO E GERENCIAMENTO DE ESTADOS
// ============================================================

// ----- Filtragem instantânea ao mudar a data -----
filtroData.addEventListener('change', function () {
    renderizar();
});

// ----- Botão "Ver Todas": limpa o filtro e reexibe tudo -----
btnVerTodas.addEventListener('click', function () {
    filtroData.value = '';
    renderizar();
});

// ----- Botão "Excluir Todas": expurga os dados do cliente -----
btnExcluirTodas.addEventListener('click', function () {

    if (confirm('Deseja realmente excluir TODAS as despesas?')) {
        localStorage.removeItem('despesas'); // Remove a chave por completo
        filtroData.value = '';               // Limpa também o filtro
        renderizar();                        // Renderiza novamente a interface
    }
});

// ----- Inicializa a interface ao carregar a página -----
renderizar();