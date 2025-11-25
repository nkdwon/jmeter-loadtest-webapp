# 📚 Explicação Completa: Testes de Performance e JMeter

## 🎯 O que o Desafio MAD Pede

O desafio solicita que você:

1. **Desenvolva uma aplicação web** (✅ Feito - sistema de e-commerce de produtos)
2. **Realize testes não funcionais de performance** usando Apache JMeter
3. **Simule 3 cenários diferentes de carga:**
   - **Carga Esparsa**: Poucos usuários simultâneos (situação normal)
   - **Carga Crescente**: Aumento gradual de usuários (crescimento orgânico)
   - **Rajada de Carga**: Pico súbito de acessos (Black Friday, promoções)
4. **Construa e analise tabelas e gráficos** sobre o desempenho da aplicação

---

## 🔬 Os 4 Testes de Performance da Aplicação

Sua aplicação possui **4 endpoints especiais** criados especificamente para estressar diferentes aspectos do sistema:

### 1. 🔥 Teste de CPU Pesado (`/heavy-cpu`)

**O que faz:**
```javascript
let x = 0
for (let i = 0; i < 50_000_000; i++) {
  x += Math.sqrt(i)
}
```

**Objetivo:**
- Simula processamento matemático intensivo
- Faz 50 milhões de iterações calculando raiz quadrada
- **Testa**: Capacidade de processamento da CPU do servidor

**Quando usar no JMeter:**
- Para verificar como o servidor se comporta com operações computacionalmente caras
- Simular processamento de dados, cálculos complexos, algoritmos pesados

**Cenário Real:**
- Processar relatórios complexos
- Fazer cálculos financeiros
- Aplicar algoritmos de machine learning
- Compressão/descompressão de dados

**O que observar:**
- ⏱️ Tempo de resposta aumenta muito com muitos usuários simultâneos
- 🔥 Uso de CPU do servidor vai a 100%
- 📉 Throughput (requisições/segundo) diminui drasticamente
- ⚠️ Servidor pode começar a rejeitar conexões (erros 5xx)

---

### 2. ⏱️ Teste de I/O Pesado (`/heavy-io`)

**O que faz:**
```javascript
setTimeout(() => {
  res.json({ message: 'I/O concluído' })
}, 3000) // Espera 3 segundos
```

**Objetivo:**
- Simula operações de Input/Output bloqueantes
- Cada requisição trava por 3 segundos antes de responder
- **Testa**: Capacidade de lidar com operações de I/O lentas

**Quando usar no JMeter:**
- Para verificar comportamento com operações de banco de dados lentas
- Simular consultas SQL complexas, leitura de arquivos grandes

**Cenário Real:**
- Consulta em banco de dados não otimizado
- Leitura de arquivos grandes do disco
- Chamadas a APIs externas lentas
- Upload/download de arquivos

**O que observar:**
- ⏳ Tempo de resposta: sempre ~3 segundos por requisição
- 🔢 Número máximo de conexões simultâneas é limitado
- 🚫 Com muitos usuários, servidor pode atingir limite de conexões
- ⚠️ Erros de timeout podem aparecer

---

### 3. 🎲 Teste de Delay Aleatório (`/random-delay`)

**O que faz:**
```javascript
const delay = Math.floor(Math.random() * 4000) + 1000 // 1-5 segundos
setTimeout(() => {
  res.json({ delay })
}, delay)
```

**Objetivo:**
- Simula latência variável e imprevisível
- Cada requisição demora entre 1 e 5 segundos aleatoriamente
- **Testa**: Como a aplicação lida com tempos de resposta inconsistentes

**Quando usar no JMeter:**
- Para verificar comportamento com serviços externos instáveis
- Simular condições de rede variáveis

**Cenário Real:**
- APIs de terceiros com latência variável
- Serviços de pagamento online
- Consultas a APIs de redes sociais
- Chamadas a microsserviços com carga variável

**O que observar:**
- 📊 Grande variação (desvio padrão alto) nos tempos de resposta
- 📈 Mediana vs Média: valores muito diferentes
- 🎯 Percentis (90%, 95%, 99%) revelam outliers
- ⚠️ Difícil prever comportamento do sistema

---

### 4. 📊 Teste de Transferência de Dados (`/many-items`)

**O que faz:**
```javascript
const items = []
for (let i = 0; i < 50000; i++) {
  items.push({ id: i, name: 'Item ' + i })
}
res.json(items)
```

**Objetivo:**
- Retorna 50.000 itens em formato JSON
- Gera ~2-3 MB de dados por requisição
- **Testa**: Largura de banda e capacidade de transferência de dados

**Quando usar no JMeter:**
- Para verificar performance com payloads grandes
- Simular transferência de grandes volumes de dados

**Cenário Real:**
- Exportar relatórios grandes
- Listagem completa de produtos/usuários
- Download de logs
- APIs que retornam muitos dados

**O que observar:**
- 🌐 Uso de banda de rede aumenta drasticamente
- ⏱️ Tempo de resposta depende da velocidade da rede
- 📉 Throughput em KB/s ou MB/s (não só req/s)
- 💾 Uso de memória do servidor pode aumentar
- ⚠️ Possível erro de memória em cenários extremos

---

## 🧪 Como Usar o JMeter com Sua Aplicação

### Estrutura do Teste no JMeter

```
Test Plan
│
├── 📋 Thread Group: CARGA ESPARSA
│   │
│   ├── 🔧 HTTP Request Defaults
│   │   ├── Server: localhost
│   │   └── Port: 3000
│   │
│   ├── 📝 Configuração
│   │   ├── Threads (Usuários): 10
│   │   ├── Ramp-Up (Tempo para iniciar todos): 30s
│   │   └── Loop Count (Repetições): 10
│   │
│   ├── 📨 HTTP Requests
│   │   ├── GET /products
│   │   ├── GET /status
│   │   └── GET /products/1
│   │
│   └── 📊 Listeners (Ouvintes)
│       ├── View Results Tree
│       ├── Summary Report
│       ├── Aggregate Report
│       └── Graph Results
│
├── 📋 Thread Group: CARGA CRESCENTE
│   ├── Threads: 500
│   ├── Ramp-Up: 120s
│   └── Requests:
│       ├── 40% GET /products
│       ├── 20% POST /products (criar)
│       ├── 20% PUT /products/{id} (atualizar)
│       ├── 10% DELETE /products/{id} (deletar)
│       └── 10% GET /heavy-cpu
│
└── 📋 Thread Group: RAJADA DE CARGA
    ├── Threads: 1000
    ├── Ramp-Up: 10s
    └── Requests:
        ├── 50% GET /products
        ├── 30% GET /many-items
        └── 20% GET /heavy-io
```

---

## 📋 Passo a Passo: Configurando o JMeter

### 1️⃣ Criar Test Plan Básico

1. Abra o JMeter (`bin/jmeter.bat` no Windows)
2. Clique com botão direito em "Test Plan"
3. Add → Threads (Users) → Thread Group
4. Configure:
   - **Name**: "Carga Esparsa"
   - **Number of Threads**: 10
   - **Ramp-Up Period**: 30
   - **Loop Count**: 10

### 2️⃣ Adicionar HTTP Request Defaults

1. Clique com botão direito no Thread Group
2. Add → Config Element → HTTP Request Defaults
3. Configure:
   - **Server Name**: localhost
   - **Port Number**: 3000
   - **Protocol**: http

### 3️⃣ Adicionar Requisições HTTP

1. Clique com botão direito no Thread Group
2. Add → Sampler → HTTP Request
3. Configure:
   - **Name**: "GET Products"
   - **Method**: GET
   - **Path**: /products

Repita para cada endpoint que quer testar.

### 4️⃣ Adicionar Listeners (Visualizadores)

1. Clique com botão direito no Thread Group
2. Add → Listener → escolha um:
   - **Summary Report**: Visão geral das métricas
   - **View Results Tree**: Detalhes de cada requisição
   - **Aggregate Report**: Estatísticas detalhadas (mediana, percentis)
   - **Graph Results**: Gráfico de tempo de resposta
   - **Response Time Graph**: Gráfico mais detalhado

### 5️⃣ Executar o Teste

1. Salve o Test Plan (Ctrl+S)
2. Clique no botão verde "Start" (▶️)
3. Observe os listeners em tempo real
4. Aguarde conclusão
5. Analise os resultados

---

## 📊 Cenários de Teste Detalhados

### 🟢 Cenário 1: Carga Esparsa (Baseline)

**Objetivo:** Estabelecer a linha base de performance do sistema em condições normais.

**Configuração JMeter:**
```
Threads: 10 usuários
Ramp-Up: 30 segundos (1 usuário a cada 3 segundos)
Loop Count: 10 vezes cada
Duração: ~5 minutos
```

**Endpoints a testar:**
- GET /products (listagem)
- GET /status (health check)
- GET /products/{id} (detalhes)

**Resultados Esperados:**
- ✅ Tempo médio: < 100ms
- ✅ Taxa de erro: 0%
- ✅ Throughput: 3-5 req/s
- ✅ CPU: < 30%
- ✅ Memória: Estável

**Para o relatório:** Use este cenário como **referência** para comparar os outros.

---

### 🟡 Cenário 2: Carga Crescente

**Objetivo:** Testar escalabilidade com crescimento gradual de usuários (simula crescimento de negócio).

**Configuração JMeter:**
```
Threads: 500 usuários
Ramp-Up: 120 segundos (4 usuários por segundo)
Loop Count: 5 vezes cada
Duração: ~10-15 minutos
```

**Distribuição de Requisições:**
- 40% GET /products (leitura é mais comum)
- 20% POST /products (criar)
- 20% PUT /products/{id} (atualizar)
- 10% DELETE /products/{id} (deletar)
- 10% GET /heavy-cpu (operações pesadas)

**Resultados Esperados:**
- ⚠️ Tempo médio: 200-500ms
- ⚠️ Taxa de erro: < 5%
- ⚠️ Throughput: 30-50 req/s
- ⚠️ CPU: 60-80%
- ⚠️ Memória: Aumenta gradualmente

**Para o relatório:** Identifique em que momento o sistema começa a degradar.

---

### 🔴 Cenário 3: Rajada de Carga (Spike Test)

**Objetivo:** Testar comportamento sob pico súbito de acessos (simula Black Friday, promoção viral).

**Configuração JMeter:**
```
Threads: 1000 usuários
Ramp-Up: 10 segundos (100 usuários por segundo!)
Loop Count: 1 vez
Duração: ~2-3 minutos (pico intenso e curto)
```

**Distribuição de Requisições:**
- 50% GET /products (usuários navegando)
- 30% GET /many-items (carregamento pesado)
- 20% GET /heavy-io (operações lentas)

**Resultados Esperados:**
- ❌ Tempo médio: 1-3 segundos (ou mais)
- ❌ Taxa de erro: 10-30% (esperado!)
- ❌ Throughput: Varia muito
- ❌ CPU: 100%
- ❌ Memória: Pico alto
- ❌ Possíveis timeouts e conexões recusadas

**Para o relatório:** Documente os limites do sistema e pontos de falha.

---

## 📈 Métricas Importantes para o Relatório

### Métricas Básicas

| Métrica | Descrição | Como Interpretar |
|---------|-----------|------------------|
| **Average** | Tempo médio de resposta | Quanto menor, melhor |
| **Median** | Valor do meio (50% percentil) | Representa experiência "típica" |
| **90% Line** | 90º percentil | 90% dos usuários tiveram resposta mais rápida |
| **95% Line** | 95º percentil | Importante para SLA |
| **99% Line** | 99º percentil | Identifica outliers |
| **Min/Max** | Tempo mínimo e máximo | Mostra variação |
| **Error %** | Percentual de erros | Deve ser < 1% idealmente |
| **Throughput** | Requisições por segundo | Quantas req/s o servidor aguenta |
| **KB/sec** | Dados transferidos por segundo | Importante para /many-items |

### Métricas Avançadas

- **Desvio Padrão**: Mede consistência (baixo = consistente, alto = variável)
- **Latência de Conexão**: Tempo para estabelecer conexão TCP
- **Tempo de Primeira Resposta**: Time To First Byte (TTFB)

---

## 📊 Tabelas e Gráficos para o Relatório

### Tabela 1: Comparação de Cenários

```
| Cenário       | Threads | Tempo Médio | Mediana | 90% | Erro% | Throughput |
|---------------|---------|-------------|---------|-----|-------|------------|
| Esparsa       | 10      | 45ms       | 42ms    | 58ms| 0%    | 4.2 req/s  |
| Crescente     | 500     | 234ms      | 198ms   | 456ms| 2.1%  | 38.5 req/s |
| Rajada        | 1000    | 1250ms     | 987ms   | 2340ms| 15.3% | 52.1 req/s |
```

### Tabela 2: Análise por Endpoint

```
| Endpoint      | Tempo Médio | Taxa Erro | Observações |
|---------------|-------------|-----------|-------------|
| GET /products | 45ms       | 0%        | Performático |
| POST /products| 67ms       | 0.5%      | Inserts rápidos |
| GET /heavy-cpu| 1850ms     | 3%        | CPU 100% |
| GET /heavy-io | 3002ms     | 5%        | Limite de conexões |
| GET /many-items| 890ms     | 1%        | Muitos dados |
```

### Gráficos Recomendados

1. **Tempo de Resposta vs Número de Usuários**
   - Eixo X: Usuários simultâneos (10, 100, 200, 500, 1000)
   - Eixo Y: Tempo médio de resposta (ms)
   - Mostra degradação com carga

2. **Taxa de Erro vs Carga**
   - Eixo X: Número de threads
   - Eixo Y: Percentual de erros
   - Identifica ponto de ruptura

3. **Throughput ao Longo do Tempo**
   - Eixo X: Tempo (minutos)
   - Eixo Y: Requisições/segundo
   - Mostra estabilidade

4. **Uso de Recursos do Servidor**
   - CPU % ao longo do tempo
   - Memória RAM ao longo do tempo
   - Correlaciona com carga

5. **Distribuição de Tempos de Resposta (Percentis)**
   - Gráfico de barras: 50%, 75%, 90%, 95%, 99%
   - Para cada cenário

---

## 🎯 Análise e Conclusões para o Relatório

### O que escrever:

#### 1. Introdução
- Descrição da aplicação
- Tecnologias utilizadas (Node.js, Express, SQLite)
- Objetivos dos testes

#### 2. Metodologia
- Ferramenta: Apache JMeter
- Ambiente: local/nuvem, configurações de hardware
- Cenários testados (descrever cada um)

#### 3. Resultados
- Apresentar tabelas e gráficos
- Descrever comportamento em cada cenário
- Métricas coletadas

#### 4. Análise
- **Carga Esparsa**: "Sistema respondeu de forma satisfatória, com tempos de resposta baixos e zero erros. Baseline estabelecido em 45ms."
- **Carga Crescente**: "Com 500 usuários, sistema manteve performance aceitável (234ms) mas com 2.1% de erros, indicando limite de conexões."
- **Rajada**: "Sob 1000 usuários simultâneos, sistema sofreu degradação significativa (1250ms médio) com 15.3% erros. Identifica necessidade de escalabilidade."

#### 5. Gargalos Identificados
- CPU: Endpoint /heavy-cpu satura CPU a 100%
- I/O: /heavy-io limitado por conexões simultâneas
- Banda: /many-items consome muita largura de banda
- Banco: SQLite pode ser gargalo (não tem conexões paralelas eficientes)

#### 6. Recomendações
- Implementar cache (Redis) para /products
- Adicionar rate limiting para prevenir sobrecarga
- Usar banco de dados mais robusto (PostgreSQL, MySQL)
- Escalar horizontalmente (múltiplas instâncias)
- Adicionar CDN para conteúdo estático
- Implementar queue system para operações pesadas

#### 7. Conclusão
- Sistema adequado para carga baixa/média
- Necessita melhorias para escalar
- Testes identificaram limites claros
- Próximos passos definidos

---

## 🚀 Dicas para Impressionar no Trabalho

1. **Varie os testes**: Teste cada endpoint isoladamente também
2. **Monitore o servidor**: Use Task Manager/htop durante testes e tire prints
3. **Documente tudo**: Prints do JMeter, gráficos coloridos, tabelas bem formatadas
4. **Compare antes/depois**: Se fizer alguma otimização, mostre a diferença
5. **Seja crítico**: Analise não só os números, mas o **porquê** deles
6. **Proponha soluções**: Mostre que entende como melhorar

---

## ✅ Checklist Final

- [ ] Servidor rodando (`npm start`)
- [ ] Banco populado com 5000 produtos (`npm run seed`)
- [ ] JMeter instalado e testado
- [ ] 3 Thread Groups criados (esparsa, crescente, rajada)
- [ ] Listeners configurados
- [ ] Testes executados e resultados salvos
- [ ] Prints/screenshots capturados
- [ ] Gráficos gerados
- [ ] Tabelas criadas
- [ ] Relatório escrito
- [ ] Análise crítica feita
- [ ] Recomendações propostas

---

**Boa sorte no desafio MAD! 🎓🚀**
