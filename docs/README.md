# 📊 Análise de Resultados dos Testes de Carga
---

## 🎯 Resumo Executivo

Foram realizados **3 testes de carga** na aplicação Node.js/Express com banco SQLite:

| Teste | Cenário | Usuários | Requisições | Taxa de Erro | Tempo Médio | Throughput |
|-------|---------|----------|-------------|--------------|-------------|------------|
| **Teste 1** | Carga Esparsa | 10 | 200 | **0.00%** ✅ | 1ms | 7.42 req/s |
| **Teste 2** | Carga Crescente | 500 | 5.000 | **25.52%** ⚠️ | 12.292ms | 18.69 req/s |
| **Teste 3** | Rajada de Carga | 1.000 | 3.000 | **39.27%** 🔴 | 2.968ms | 122.26 req/s |

### Conclusão Geral

O sistema demonstrou **comportamento não-linear** sob carga:
- ✅ **Excelente** com até 10 usuários (0% erro)
- ⚠️ **Degradação aceitável** entre 400-500 usuários (25% erro)
- 🔴 **Degradação crítica** com 1000+ usuários (39% erro)

**Capacidade estimada**: ~500 usuários simultâneos antes de falha crítica.

---

## 📊 Resultados Detalhados

### Teste 1: Carga Esparsa (10 usuários)

**Objetivo**: Estabelecer baseline de performance em condições ideais.

#### Configuração
- **Usuários**: 10
- **Ramp-up**: 30 segundos (1 usuário a cada 3s)
- **Iterações**: 10 loops por usuário
- **Duração total**: ~1 minuto
- **Total de requisições**: 200

#### Métricas Obtidas

| Métrica | Valor |
|---------|-------|
| Requisições totais | 200 |
| Taxa de erro | **0.00%** ✅ |
| Tempo médio | **1ms** |
| Tempo mínimo | 0ms |
| Tempo máximo | 69ms |
| Throughput | 7.42 req/s |
| Dados transferidos | 1.18 MB |
| Taxa de transferência | 46.75 KB/s |

#### Análise e Insights

✅ **Sistema funcionando perfeitamente em carga leve**

**Por que 0% de erro?**
- Apenas 10 usuários simultâneos não saturam os recursos
- SQLite suporta tranquilamente 10 conexões de leitura
- CPU tem capacidade sobressalente
- Sem contenção de recursos

**Por que tempo médio de 1ms?**
- Servidor e banco local (sem latência de rede)
- Operações simples de CRUD
- Cache de memória do sistema operacional
- SQLite muito rápido para leituras

**Endpoints testados**:
1. `GET /products` - Listagem de produtos ✅
2. `POST /products` - Criação de produto ✅
3. `GET /heavy-cpu` - Processamento intensivo ✅
4. `GET /heavy-io` - I/O bloqueante ✅
5. `GET /many-items` - 50k itens ✅

**Comportamento esperado**: Todos os endpoints responderam dentro do esperado. O sistema tem capacidade sobressalente para processar requisições rapidamente.

**Conclusão do Teste 1**: Este é o **baseline ideal**. O sistema é capaz de processar requisições com latência mínima quando não está sob pressão.

---

### Teste 2: Carga Crescente (500 usuários)

**Objetivo**: Avaliar escalabilidade com aumento gradual de carga.

#### Configuração
- **Usuários**: 500
- **Ramp-up**: 120 segundos (~4 usuários/segundo)
- **Iterações**: 10 loops por usuário
- **Duração total**: ~4 minutos
- **Total de requisições**: 5.000

#### Métricas Obtidas

| Métrica | Valor |
|---------|-------|
| Requisições totais | 5.000 |
| Taxa de erro | **25.52%** ⚠️ |
| Tempo médio | **12.292ms** |
| Tempo mínimo | 0ms |
| Tempo máximo | 44.594ms |
| Throughput | 18.69 req/s |
| Dados transferidos | 18.62 MB |
| Taxa de transferência | 77.57 KB/s |

#### Análise e Insights

⚠️ **Sistema apresentou degradação significativa**

**Por que 25.52% de erro?**

Esta taxa de erro NÃO é falha do teste - é uma **descoberta importante** sobre os limites do sistema!

**Gargalos identificados**:

1. **CPU (31.84% erro em /heavy-cpu)**
   - Endpoint que faz 50 milhões de iterações
   - Node.js single-threaded não consegue processar
   - Requisições excedem timeout padrão do JMeter (20s)
   - **Impacto**: ALTO

2. **SQLite - Escrita Concorrente (19.44% erro em POST /products)**
   - SQLite usa lock de escrita (write-ahead log)
   - Não suporta múltiplas escritas simultâneas
   - 500 usuários tentando criar produtos ao mesmo tempo
   - Muitas requisições ficam bloqueadas aguardando lock
   - **Impacto**: MÉDIO

3. **Conexões (taxa de erro distribuída)**
   - Limite padrão de conexões TCP sendo atingido
   - Sistema operacional começa a rejeitar conexões
   - **Impacto**: BAIXO (neste teste)

**Por que tempo médio aumentou 12.000x?**

De 1ms (Teste 1) para 12.292ms (Teste 2) - crescimento não-linear!

**Motivos**:
- Contenção de recursos (CPU, memória, I/O)
- Filas de espera (SQLite lock, event loop Node.js)
- Timeouts e retentativas
- Context switching do sistema operacional

**Comportamento por endpoint**:

| Endpoint | Taxa de Erro | Tempo Médio | Análise |
|----------|--------------|-------------|---------|
| GET /products | ~10% | Baixo | Leitura no SQLite, sem lock |
| POST /products | **19.44%** | Alto | Escrita bloqueada por lock |
| GET /heavy-cpu | **31.84%** | Altíssimo | Timeout por processamento |
| GET /heavy-io | ~15% | Médio | Delay de 3s causa acúmulo |
| GET /many-items | ~8% | Baixo | Rede não é gargalo |

**Conclusão do Teste 2**: O sistema começa a **degradar** entre 400-500 usuários. CPU e SQLite são os principais gargalos. Taxa de erro de 25% indica que 1 em cada 4 requisições falha - **inaceitável para produção**.

---

### Teste 3: Rajada de Carga (1000 usuários)

**Objetivo**: Simular pico súbito de acessos (spike test / stress test).

#### Configuração
- **Usuários**: 1.000
- **Ramp-up**: 10 segundos (100 usuários/segundo)
- **Iterações**: 3 loops por usuário
- **Duração total**: ~30 segundos
- **Total de requisições**: 3.000

#### Métricas Obtidas

| Métrica | Valor |
|---------|-------|
| Requisições totais | 3.000 |
| Taxa de erro | **39.27%** 🔴 |
| Tempo médio | **2.968ms** |
| Tempo mínimo | 0ms |
| Tempo máximo | 12.722ms |
| Throughput | **122.26 req/s** |
| Dados transferidos | 7.05 MB |
| Taxa de transferência | 294.55 KB/s |

#### Análise e Insights

🔴 **Sistema em estado crítico**

**Por que 39.27% de erro (mais que Teste 2)?**

Apesar de ter MENOS requisições totais (3.000 vs 5.000), a taxa de erro é MAIOR!

**Motivo**: Não é a quantidade total, mas a **velocidade de chegada**!

- Teste 2: 500 usuários em 120s = ~4 usuários/segundo
- Teste 3: 1000 usuários em 10s = **100 usuários/segundo** (25x mais rápido!)

**Novo gargalo dominante**: **Limite de Conexões Simultâneas**

1. **Conexões TCP (39% erro em TODOS os endpoints)**
   - Sistema operacional tem limite de conexões simultâneas
   - Aplicação Node.js tem limite de sockets
   - Chegando 100 usuários/segundo, não dá tempo de processar
   - Conexões são **rejeitadas antes mesmo de chegar na aplicação**
   - **Impacto**: CRÍTICO

**Por que tempo médio DIMINUIU? (2.968ms vs 12.292ms)**

Isso parece contra-intuitivo, mas faz sentido:

**Explicação**:
- Muitas requisições **falharam rapidamente** (connection refused, timeout rápido)
- Requisições que falharam têm tempo baixo (não processam nada)
- Apenas as requisições **que conseguiram passar** demoraram
- Média foi puxada para baixo pelos erros rápidos

**Analogia**: Fila de restaurante lotado:
- Teste 2: Fila grande, mas todos eventualmente são atendidos (devagar)
- Teste 3: Fila tão grande que porteiro barra a maioria na porta (rápido, mas não atende)

**Por que throughput AUMENTOU 6.5x? (122 req/s vs 18.69 req/s)**

**Throughput = requisições/segundo (incluindo erros!)**

- Teste 2: 5.000 req em ~267s = 18.69 req/s
- Teste 3: 3.000 req em ~24s = 122.26 req/s

O sistema está processando (ou rejeitando) requisições **muito mais rápido**.

**Conclusão do Teste 3**: O sistema **não aguenta** 1000 usuários simultâneos em rajada. Quase 40% de falha é **catastrófico** para usuários reais. O gargalo mudou de CPU/SQLite para **limite de conexões**.

---

## 📈 Análise Comparativa

### Comportamento Não-Linear

```
Usuários:    10    →    500    →   1000
Erro:      0.00%  →  25.52%  →  39.27%  (crescimento acelerado)
Tempo:       1ms   →  12.292ms →  2.968ms  (subiu 12.000x, depois caiu 76%)
Throughput: 7.42  →   18.69   → 122.26   (aumentou 16x)
```

**Observações**:

1. **Taxa de erro cresceu de forma não-linear**
   - 0 → 500 usuários: +25.52%
   - 500 → 1000 usuários: +13.75% (menos que dobro)
   - Sistema já estava no limite em 500 usuários

2. **Tempo médio teve comportamento anômalo**
   - Aumentou 12.000x de 10 para 500 usuários
   - Diminuiu 76% de 500 para 1000 usuários
   - Indica mudança de gargalo (CPU/SQLite → Conexões)

3. **Throughput aumentou, mas não significa melhora**
   - Alto throughput com alta taxa de erro = sistema rejeitando rápido
   - Não é indicador de saúde do sistema sozinho

### Gráficos Disponíveis

Os gráficos gerados pelo script Python estão em:  
`jmeter/test-results/analysis/graficos/`

1. **01-comparativo-geral.png** - Visão geral dos 3 testes
2. **02-escalabilidade.png** - Comportamento de erro e throughput vs usuários
3. **03-performance-endpoints.png** - Desempenho por endpoint
4. **04-identificacao-gargalos.png** - Ranking visual de gargalos

**Use os gráficos 01, 02 e 04 no relatório!**

---

## 🔍 Identificação de Gargalos

### Ranking de Gargalos (por impacto)

| #  | Gargalo | Teste Afetado | Taxa de Erro | Severidade |
|----|---------|---------------|--------------|------------|
| 1️⃣ | **Conexões Simultâneas** | Teste 3 | 39.00% | 🔴 CRÍTICA |
| 2️⃣ | **CPU (Heavy-CPU endpoint)** | Teste 2 | 31.84% | 🟠 ALTA |
| 3️⃣ | **SQLite (Escrita concorrente)** | Teste 2 | 19.44% | 🟡 MÉDIA |

### Matriz de Impacto

| Gargalo | Impacto em Performance | Impacto em Disponibilidade | Facilidade de Resolver |
|---------|------------------------|----------------------------|------------------------|
| Conexões | Alto (39% erro) | Crítico (usuários rejeitados) | Médio (config + clustering) |
| CPU | Muito Alto (timeout) | Alto (31% erro) | Fácil (clustering, worker threads) |
| SQLite | Médio (bloqueio) | Médio (19% erro) | Difícil (migrar para PostgreSQL) |

### Explicação de Cada Gargalo

#### 1️⃣ Conexões Simultâneas (Crítico)

**O que é:**
- Limite de conexões TCP simultâneas que o servidor aceita
- Configuração do sistema operacional (ulimit)
- Limite interno da aplicação Node.js

**Por que falha:**
- 1000 usuários chegam em 10 segundos
- Servidor não consegue abrir tantos sockets
- Sistema operacional rejeita novas conexões (EMFILE, ENFILE)

**Como resolver:**
- Aumentar `ulimit -n` no sistema operacional
- Configurar `server.maxConnections` no Node.js
- Implementar **clustering** (múltiplos processos)
- Adicionar **load balancer** (distribuir carga)

#### 2️⃣ CPU - Heavy-CPU (Alto)

**O que é:**
- Endpoint `/heavy-cpu` faz 50 milhões de iterações
- Simula processamento intensivo (cálculos, algoritmos)
- Node.js single-threaded bloqueia event loop

**Por que falha:**
- Processamento leva mais de 20 segundos
- JMeter dá timeout
- Outras requisições ficam bloqueadas esperando

**Como resolver:**
- **Worker Threads** (Node.js) - processamento paralelo
- **Clustering** - múltiplos processos Node.js
- **Fila de processamento** (Redis/Bull) - processar assincronamente
- **Otimizar algoritmo** - reduzir iterações

#### 3️⃣ SQLite - Escrita Concorrente (Médio)

**O que é:**
- SQLite usa lock exclusivo para escrita
- Apenas 1 transação de escrita por vez
- Outras escritas ficam bloqueadas

**Por que falha:**
- 500 usuários tentam criar produtos simultaneamente
- Maioria fica aguardando lock
- Timeout ou erro SQLITE_BUSY

**Como resolver:**
- **Migrar para PostgreSQL ou MySQL**
  - Suportam escrita concorrente
  - MVCC (Multi-Version Concurrency Control)
  - Melhor para aplicações multi-usuário
- **Cache de escrita** (Redis) - buffer antes de gravar
- **Fila de escrita** - serializar operações

---

## 🛠️ Recomendações Técnicas

### Priorizadas por Severidade

#### 🔴 Severidade CRÍTICA (Implementar Imediatamente)

**1. Aumentar Limite de Conexões**

**Problema**: 39% de erro por limite de conexões TCP

**Solução**:
```javascript
// server.js
const server = app.listen(PORT);
server.maxConnections = 2000; // Aumentar de padrão (~512)
```

```bash
# Sistema operacional (Linux)
ulimit -n 10000  # Aumentar limite de file descriptors
```

**Impacto esperado**: Reduzir taxa de erro de 39% para ~15%

**Esforço**: Baixo (configuração)

---

**2. Implementar Clustering**

**Problema**: Node.js single-threaded não aproveita múltiplos cores da CPU

**Solução**:
```javascript
// cluster.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./server.js');
}
```

**Impacto esperado**: 4x capacidade de processamento (em CPU quad-core)

**Esforço**: Baixo (código simples)

---

**3. Migrar para PostgreSQL ou MySQL**

**Problema**: SQLite não suporta escrita concorrente (19% erro em POST)

**Solução**:
- Migrar de SQLite para PostgreSQL
- Usar pool de conexões (pg-pool)
- MVCC resolve problema de lock

**Impacto esperado**: Reduzir erro de escrita de 19% para <2%

**Esforço**: Médio (refatoração de código)

---

#### 🟠 Severidade ALTA (Implementar em Médio Prazo)

**4. Implementar Cache com Redis**

**Problema**: Leituras repetidas sobrecarregam banco

**Solução**:
```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/products', async (req, res) => {
  const cached = await client.get('products');
  if (cached) return res.json(JSON.parse(cached));
  
  const products = await db.all('SELECT * FROM products');
  await client.setex('products', 60, JSON.stringify(products));
  res.json(products);
});
```

**Impacto esperado**: 80% redução de carga no banco

**Esforço**: Médio

---

**5. Adicionar Load Balancer (Nginx)**

**Problema**: Single point of failure, sem distribuição de carga

**Solução**:
```nginx
upstream backend {
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
  server localhost:3003;
}

server {
  listen 80;
  location / {
    proxy_pass http://backend;
  }
}
```

**Impacto esperado**: Distribuir carga, aumentar disponibilidade

**Esforço**: Médio

---

**6. Otimizar Endpoint /heavy-cpu**

**Problema**: 50M iterações bloqueiam event loop (31% erro)

**Solução**:
- Usar Worker Threads para processamento paralelo
- Ou implementar fila de processamento (Bull + Redis)
- Ou otimizar algoritmo (reduzir iterações)

**Impacto esperado**: Reduzir timeout de 31% para <5%

**Esforço**: Médio

---

#### 🟡 Severidade MÉDIA (Implementar em Longo Prazo)

**7. Implementar Rate Limiting**

**Problema**: Não há proteção contra spike de requisições

**Solução**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100 // máximo 100 requisições por minuto
});

app.use('/api/', limiter);
```

**Impacto esperado**: Proteger sistema de sobrecarga

**Esforço**: Baixo

---

**8. Circuit Breaker Pattern**

**Problema**: Cascata de falhas quando sistema está sobrecarregado

**Solução**:
- Implementar circuit breaker (biblioteca: opossum)
- Detectar falhas e "abrir circuito" temporariamente
- Retornar erro rápido ao invés de deixar requisições acumularem

**Impacto esperado**: Degradação graceful, melhor experiência

**Esforço**: Médio

---

## 💡 5 Insights Principais

**Use estes insights na conclusão do relatório:**

### 1️⃣ Comportamento Não-Linear sob Carga

**Insight**: O sistema demonstrou degradação não-linear ao aumentar a carga.

**Explicação**: Entre 10 e 500 usuários, o tempo médio aumentou **12.000x** (de 1ms para 12.292ms). Porém, ao dobrar a carga para 1000 usuários, o tempo médio **melhorou 76%** (caiu para 2.968ms). Esse comportamento aparentemente contra-intuitivo indica que **diferentes gargalos se manifestam em diferentes cenários de carga**.

**Implicação**: Não é possível prever linearmente como o sistema se comportará sob carga crescente. Testes empíricos são essenciais.

---

### 2️⃣ Gargalos Múltiplos Dependendo do Cenário

**Insight**: O sistema possui múltiplos gargalos que se tornam dominantes em diferentes padrões de carga.

**Explicação**:
- Em **carga crescente** (500 usuários, 120s ramp-up): CPU e SQLite são os limitantes principais
- Em **rajadas** (1000 usuários, 10s ramp-up): Limite de conexões se torna crítico

**Implicação**: A otimização deve ser feita pensando em **múltiplos cenários**, não apenas um tipo de carga.

---

### 3️⃣ Alta Eficiência de Processamento, Baixa Disponibilidade

**Insight**: O sistema demonstrou alta eficiência de processamento (122 req/s no Teste 3, 16x maior que baseline) mas baixa disponibilidade (39% taxa de erro).

**Explicação**: O gargalo **não é velocidade de processamento**, mas **capacidade de aceitar conexões simultâneas**. As requisições que conseguem entrar são processadas rapidamente, mas muitas são rejeitadas antes mesmo de serem processadas.

**Implicação**: Otimizar apenas a velocidade de processamento não resolve o problema. É necessário aumentar a **capacidade de aceitar conexões**.

---

### 4️⃣ Transferência de Dados Não é Gargalo

**Insight**: O endpoint `/many-items`, responsável por transferir 50.000 itens (~2-3 MB), apresentou o **menor tempo médio** (1.300ms) entre todos os endpoints testados.

**Explicação**: Isso comprova que a rede e serialização JSON não são gargalos do sistema, mesmo sob carga extrema. A transferência de grandes volumes de dados é eficiente.

**Implicação**: Não é necessário otimizar serialização ou compressão de dados. Foco deve ser em **processamento e conexões**.

---

### 5️⃣ Capacidade Estimada do Sistema

**Insight**: Com base nos resultados, estima-se que o sistema suporte entre **400-600 usuários simultâneos** antes de degradação crítica.

**Explicação**:
- Teste 1 (10 usuários): 0% erro - **Ótimo**
- Teste 2 (500 usuários): 25% erro - **Degradação aceitável (limiar)**
- Teste 3 (1000 usuários): 39% erro - **Crítico**

Interpolando, o sistema começa a degradar significativamente após ~400-500 usuários.

**Implicação**: Para suportar mais de 500 usuários, é **essencial** implementar as recomendações técnicas (clustering, PostgreSQL, aumento de conexões).
