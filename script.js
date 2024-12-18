let letrasProblema = []; 
let palavra1, palavra2, palavra3;  
let mapaLetras = {};       

function processarPalavras() {
    const p1 = document.getElementById('word1').value.toUpperCase().trim();
    const p2 = document.getElementById('word2').value.toUpperCase().trim();
    const p3 = document.getElementById('word3').value.toUpperCase().trim();

    if (!p1 || !p2 || !p3) {
        exibirErro("Por favor, insira as três palavras.");
        return null;
    }

    const regex = /^[A-Z]+$/;
    if (!regex.test(p1) || !regex.test(p2) || !regex.test(p3)) {
        exibirErro("As palavras devem conter apenas letras (A-Z).");
        return null;
    }

    const conjuntoTotalLetras = new Set(p1 + p2 + p3);
    if (conjuntoTotalLetras.size > 10) {
        exibirErro("O problema possui mais de 10 letras únicas. Não é possível resolver com dígitos 0-9.");
        return null;
    }

    const arrLetras = Array.from(conjuntoTotalLetras);
    mapaLetras = {};
    arrLetras.forEach((letra, indice)=>{
        mapaLetras[letra]=indice; 
    });

    palavra1 = p1;
    palavra2 = p2;
    palavra3 = p3;
    letrasProblema = arrLetras;

    exibirErro("");
    return true;
}

function exibirErro(msg) {
    document.getElementById('wordError').textContent = msg;
}

function palavraParaNumero(palavra, individuo) {
    let numero = 0;
    for (let i=0; i<palavra.length; i++) {
        const L = palavra[i];
        const idx = mapaLetras[L];
        const digito = individuo[idx];
        numero = numero*10 + digito;
    }
    return numero;
}

function avaliarIndividuo(individuo) {
    const val1 = palavraParaNumero(palavra1, individuo);
    const val2 = palavraParaNumero(palavra2, individuo);
    const val3 = palavraParaNumero(palavra3, individuo);
    return Math.abs((val1 + val2) - val3);
}

let conjuntoDigitos = []; 

function gerarPopulacao(tamanhoPop) {
    const populacao = [];
    for (let i=0; i<tamanhoPop; i++) {
        let ind;
        do {
            ind = embaralhar(conjuntoDigitos.slice());
        } while(!individuoValido(ind)); // Garante indivíduo válido
        populacao.push(ind);
    }
    return populacao;
}

function embaralhar(arr) {
    for (let i=arr.length-1; i>0; i--) {
        const j=Math.floor(Math.random()*(i+1));
        [arr[i], arr[j]]=[arr[j], arr[i]];
    }
    return arr;
}

// Verifica se o indivíduo é válido, por exemplo, impedindo que a primeira letra de cada palavra seja zero.
function individuoValido(individuo) {
    const letrasIniciais = [palavra1[0], palavra2[0], palavra3[0]];
    for (let L of letrasIniciais) {
        if (individuo[mapaLetras[L]] === 0) return false;
    }
    return true;
}

function selecaoTorneio(populacao, aptidoes, numPais, tamTorneio=3) {
    const pais=[];
    for (let i=0; i<numPais; i++) {
        let melhor=null;
        let melhorApt=Number.MAX_SAFE_INTEGER;
        for (let k=0; k<tamTorneio; k++) {
            const r=Math.floor(Math.random()*populacao.length);
            if (aptidoes[r]<melhorApt) {
                melhorApt=aptidoes[r];
                melhor=populacao[r];
            }
        }
        pais.push(melhor);
    }
    return pais;
}

function selecaoRoleta(populacao, aptidoes, numPais) {
    const pontuacoes = aptidoes.map(f=>1/(1+f));
    const somaPontuacoes = pontuacoes.reduce((a,b)=>a+b,0);
    const normalizadas = pontuacoes.map(s=>s/somaPontuacoes);
    const pais=[];
    for (let i=0; i<numPais; i++) {
        const r=Math.random();
        let acc=0;
        for (let j=0;j<populacao.length;j++){
            acc+=normalizadas[j];
            if (acc>=r){
                pais.push(populacao[j]);
                break;
            }
        }
    }
    return pais;
}

// Crossover Cíclico
function crossoverCiclico(p1, p2) {
    const tamanho=p1.length;
    const c1=new Array(tamanho).fill(null);
    const c2=new Array(tamanho).fill(null);

    let inicio=0;
    let indice=inicio;
    let ciclo=true;
    while(ciclo){
        c1[indice]=p1[indice];
        c2[indice]=p2[indice];
        const proxValor=p2[indice];
        indice=p1.indexOf(proxValor);
        if (indice===inicio){
            ciclo=false;
        }
    }

    for (let i=0;i<tamanho;i++){
        if(c1[i]===null)c1[i]=p2[i];
        if(c2[i]===null)c2[i]=p1[i];
    }
    return [c1,c2];
}

// Crossover PMX
function crossoverPMX(p1, p2) {
    const tamanho = p1.length;
    const c1 = new Array(tamanho).fill(null);
    const c2 = new Array(tamanho).fill(null);

    const inicio = Math.floor(Math.random()*tamanho);
    const fim = Math.floor(Math.random()*tamanho);
    const min = Math.min(inicio, fim);
    const max = Math.max(inicio, fim);

    // Copiar segmento intermediário
    for (let i = min; i <= max; i++) {
        c1[i] = p1[i];
        c2[i] = p2[i];
    }

    // Preencher c1
    for (let i = min; i <= max; i++) {
        let val = p2[i];
        if (!c1.includes(val)) {
            let pos = p1.indexOf(val);
            while (pos >= min && pos <= max) {
                val = p2[pos];
                pos = p1.indexOf(val);
            }
            c1[pos] = val;
        }
    }

    // Preencher c2
    for (let i = min; i <= max; i++) {
        let val = p1[i];
        if (!c2.includes(val)) {
            let pos = p2.indexOf(val);
            while (pos >= min && pos <= max) {
                val = p1[pos];
                pos = p2.indexOf(val);
            }
            c2[pos] = val;
        }
    }

    // Preencher nulos de c1
    const usadosC1 = new Set(c1.filter(v=>v!==null));
    for (let i = 0; i < tamanho; i++) {
        if (c1[i] === null) {
            for (let val of p2) {
                if (!usadosC1.has(val)) {
                    c1[i] = val;
                    usadosC1.add(val);
                    break;
                }
            }
        }
    }

    // Preencher nulos de c2
    const usadosC2 = new Set(c2.filter(v=>v!==null));
    for (let i = 0; i < tamanho; i++) {
        if (c2[i] === null) {
            for (let val of p1) {
                if (!usadosC2.has(val)) {
                    c2[i] = val;
                    usadosC2.add(val);
                    break;
                }
            }
        }
    }

    return [c1, c2];
}

function mutar(individuo) {
    let tentativas = 0;
    do {
        const i=Math.floor(Math.random()*individuo.length);
        const j=Math.floor(Math.random()*individuo.length);
        [individuo[i], individuo[j]]=[individuo[j], individuo[i]];
        tentativas++;
        if(tentativas>50) break; // Evita loop infinito
    } while(!individuoValido(individuo));
}

function reinserirR1(populacaoAntiga, aptidoesAntigas, novaPopulacao, novasAptidoes) {
    const combinada=populacaoAntiga.concat(novaPopulacao);
    const combinadaApt=aptidoesAntigas.concat(novasAptidoes);
    const indicesOrdenados=combinadaApt.map((f,i)=>[f,i]).sort((a,b)=>a[0]-b[0]);
    const tamanhoPop=populacaoAntiga.length;
    const novaPop=[];
    const novasApt=[];
    for(let i=0;i<tamanhoPop;i++){
        const idx=indicesOrdenados[i][1];
        novaPop.push(combinada[idx]);
        novasApt.push(combinadaApt[idx]);
    }
    return {pop:novaPop,fits:novasApt};
}

function reinserirR2(populacaoAntiga, aptidoesAntigas, novaPopulacao, novasAptidoes, elitismo=0.1) {
    const tamanhoPop=populacaoAntiga.length;
    const qtdElite=Math.floor(tamanhoPop*elitismo);

    const ordenadaAntiga=aptidoesAntigas.map((f,i)=>[f,i]).sort((a,b)=>a[0]-b[0]);
    const elites=[];
    const elitesApt=[];
    for(let i=0;i<qtdElite;i++){
        const idx=ordenadaAntiga[i][1];
        elites.push(populacaoAntiga[idx]);
        elitesApt.push(aptidoesAntigas[idx]);
    }

    // Ordenar novaPop também e pegar os melhores
    const ordenadaNova=novasAptidesOrdenadas(novaPopulacao, novasAptidoes);
    const necessario=tamanhoPop-qtdElite;
    const novaEscolha=ordenadaNova.slice(0,necessario).map(x=>x[0]);
    const novaEscolhaApt=ordenadaNova.slice(0,necessario).map(x=>x[1]);

    const popFinal=elites.concat(novaEscolha);
    const aptFinal=elitesApt.concat(novaEscolhaApt);
    return {pop:popFinal, fits:aptFinal};
}

function novasAptidesOrdenadas(pop, fits) {
    return fits.map((f,i)=>[pop[i],f]).sort((a,b)=>a[1]-b[1]);
}

function introduzirImigrantes(populacao, aptidoes, num=5) {
    for(let i=0;i<num;i++){
        let ind;
        do {
            ind = embaralhar(conjuntoDigitos.slice());
        } while(!individuoValido(ind));
        // Substitui um dos piores
        let maxApt=-1;
        let maxIndex=-1;
        for(let j=0;j<populacao.length;j++){
            if(aptidoes[j]>maxApt){
                maxApt=aptidoes[j];
                maxIndex=j;
            }
        }
        populacao[maxIndex]=ind;
        aptidoes[maxIndex]=avaliarIndividuo(ind);
    }
}

async function executarAG() {
    if (!processarPalavras()) {
        return;
    }

    if (letrasProblema.length === 0) {
        exibirErro("Nenhuma letra encontrada.");
        return;
    }

    const taxaCrossover=parseFloat(document.getElementById('crossoverRate').value);
    const taxaMutacaoBase=parseFloat(document.getElementById('mutationRate').value);
    const metodoSelecao=document.getElementById('selectionMethod').value;
    const metodoCrossover=document.getElementById('crossoverMethod').value;
    const metodoReinsercao=document.getElementById('reinsertionMethod').value;

    // Ajustando parâmetros
    const tamanhoPop=100; 
    const geracoes=50;   

    const L = letrasProblema.length;
    conjuntoDigitos = [];
    for (let i=0; i<L; i++) {
        conjuntoDigitos.push(i);
    }

    console.clear();
    console.log("Iniciando AG para resolver: ", palavra1, "+", palavra2, "=", palavra3);
    console.log("Letras:", letrasProblema.join(", "));
    console.log("Parâmetros:");
    console.log(" População:", tamanhoPop);
    console.log(" Gerações:", geracoes);
    console.log(" Taxa Crossover:", taxaCrossover);
    console.log(" Taxa Mutação Base:", taxaMutacaoBase);
    console.log(" Seleção:", metodoSelecao);
    console.log(" Crossover:", metodoCrossover);
    console.log(" Reinserção:", metodoReinsercao);

    let populacao=gerarPopulacao(tamanhoPop);
    let aptidoes=populacao.map(avaliarIndividuo);

    let melhorInd=null;
    let melhorApt=Number.MAX_SAFE_INTEGER;

    for (let g=0; g<geracoes; g++) {
        let melhorGeracao = Number.MAX_SAFE_INTEGER;
        let somaApt=0;
        for (let i=0; i<tamanhoPop; i++) {
            const f=aptidoes[i];
            somaApt+=f;
            if (f<melhorApt) {
                melhorApt=f;
                melhorInd=populacao[i].slice();
            }
            if (f<melhorGeracao) melhorGeracao=f;
        }
        const mediaApt = somaApt/tamanhoPop;

        console.log(`Geração ${g+1}: Melhor da Geração: ${melhorGeracao}, Melhor Global: ${melhorApt}, Aptidão Média: ${mediaApt.toFixed(2)}`);

        // Seleção
        let pais;
        if (metodoSelecao==='roulette') {
            pais=selecaoRoleta(populacao, aptidoes, tamanhoPop);
        } else if (metodoSelecao==='ranking') {
            pais=selecaoRanking(populacao, aptidoes, tamanhoPop);
        } else {
            pais=selecaoTorneio(populacao, aptidoes, tamanhoPop,3);
        }

        // Taxa de mutação adaptativa: diminui ao longo das gerações
        const taxaMutacaoAtual = taxaMutacaoBase * (1 - g/geracoes);

        const descendentes=[];
        for (let i=0;i<tamanhoPop;i+=2) {
            const p1=pais[i];
            const p2=pais[i+1]||pais[0];
            let c1=p1.slice(), c2=p2.slice();
            if(Math.random()<taxaCrossover) {
                if(metodoCrossover==='cycle') {
                    [c1,c2]=crossoverCiclico(p1,p2);
                } else {
                    [c1,c2]=crossoverPMX(p1,p2);
                }
            }
            // Mutação
            if(Math.random()<taxaMutacaoAtual) mutar(c1);
            if(Math.random()<taxaMutacaoAtual) mutar(c2);
            descendentes.push(c1,c2);
        }

        const novasApt=descendentes.map(avaliarIndividuo);

        let resultado;
        if(metodoReinsercao==='r1'){
            resultado=reinserirR1(populacao, aptidoes, descendentes, novasApt);
        } else {
            resultado=reinserirR2(populacao, aptidoes, descendentes, novasApt,0.1);
        }

        populacao=resultado.pop;
        aptidoes=resultado.fits;

        // Introduz imigrantes a cada 50 gerações para manter diversidade
        if ((g+1)%50===0) {
            introduzirImigrantes(populacao, aptidoes, 5);
        }
    }

    for (let i=0;i<tamanhoPop;i++){
        if (aptidoes[i]<melhorApt) {
            melhorApt=aptidoes[i];
            melhorInd=populacao[i].slice();
        }
    }

    console.log("AG finalizado. Melhor fitness encontrado:", melhorApt);
    exibirResultadoAG(melhorInd,melhorApt);
}

function exibirResultadoAG(individuo, aptidao) {
    const divResultado=document.getElementById('agResult');
    if (aptidao===0) {
        let textoMapeamento = "Solução Encontrada (Fitness=0):\n\n";
        for (let L of letrasProblema) {
            textoMapeamento += `${L} = ${individuo[mapaLetras[L]]}\n`;
        }

        const val1=palavraParaNumero(palavra1,individuo);
        const val2=palavraParaNumero(palavra2,individuo);
        const val3=palavraParaNumero(palavra3,individuo);

        textoMapeamento += `\n${palavra1} = ${val1}\n${palavra2} = ${val2}\n${palavra3} = ${val3}\n`;
        divResultado.textContent=textoMapeamento;
        console.log("Solução perfeita encontrada!\n", textoMapeamento);
    } else {
        let textoMapeamento = "Nenhuma solução perfeita encontrada.\nMelhor solução (Fitness="+aptidao+"):\n\n";
        for (let L of letrasProblema) {
            textoMapeamento += `${L} = ${individuo[mapaLetras[L]]}\n`;
        }

        const val1=palavraParaNumero(palavra1,individuo);
        const val2=palavraParaNumero(palavra2,individuo);
        const val3=palavraParaNumero(palavra3,individuo);

        textoMapeamento += `\n${palavra1} = ${val1}\n${palavra2} = ${val2}\n${palavra3} = ${val3}\nDiferença: ${Math.abs((val1+val2)-val3)}`;
        divResultado.textContent=textoMapeamento;
        console.log("Melhor solução encontrada (não perfeita):\n", textoMapeamento);
    }
}

document.getElementById('runAGBtn').addEventListener('click', executarAG);
