# 🧪 Testes de Carga com Apache JMeter

Esta pasta contém todos os arquivos relacionados aos testes de carga realizados com Apache JMeter.

---

## 📁 Estrutura de Arquivos

```
jmeter/
├── config/
│   └── plano-testes-basico.jmx    # Plano de testes com 3 cenários configurados
│
└── test-results/
    ├── teste1-carga-esparsa/      # Teste 1: Carga Esparsa (10 usuários)
    │   ├── dados/
    │   │   └── teste1-summary.csv
    │   └── prints/
    │       ├── teste1_summary_report.png
    │       └── teste1_results_table.png
    │       ⚠️  NOTA: Falta teste1_response_time_graph.png
    │
    ├── teste2-carga-crescente/    # Teste 2: Carga Crescente (500 usuários)
    │   ├── dados/
    │   │   └── teste2-summary.csv
    │   └── prints/
    │       ├── teste2_summary_report.png
    │       ├── teste2_response_time_graph.png
    │       ├── teste2_results_table.png
    │       └── teste2_results_table_errors.png
    │
    ├── teste3-rajada-carga/       # Teste 3: Rajada de Carga (1000 usuários)
    │   ├── dados/
    │   │   └── teste3-summary.csv
    │   └── prints/
    │       ├── teste3_summary_report.png
    │       ├── teste3_response_time_graph.png
    │       ├── teste3_results_table.png
    │       └── teste3_results_table_errors.png
    │
    └── analysis/
        ├── gerar_graficos.py      # Script Python para gerar gráficos comparativos
        └── graficos/
            ├── 01-comparativo-geral.png
            ├── 02-escalabilidade.png
            ├── 03-performance-endpoints.png
            └── 04-identificacao-gargalos.png
```

---

## 🚀 Como Executar os Testes

### Pré-requisitos

1. **Apache JMeter instalado**
   - Download: https://jmeter.apache.org/download_jmeter.cgi
   - Versão usada: 5.6.3

2. **Servidor da aplicação rodando**
   ```bash
   npm install
   npm run seed  # Popular banco de dados
   npm start     # Iniciar servidor na porta 3000
   ```

### Executando os Testes

#### Opção 1: Interface Gráfica (GUI Mode)

```bash
# Windows
jmeter.bat

# Linux/Mac
jmeter.sh
```

Depois:
1. Abrir arquivo: `jmeter/config/plano-testes-basico.jmx`
2. Configurar listeners desejados (Summary Report, Graph Results, etc.)
3. Clicar no botão ▶️ (Start) para executar
4. Salvar resultados em CSV
5. Capturar screenshots dos listeners

#### Opção 2: Linha de Comando (Recomendado para testes reais)

```bash
# Teste 1: Carga Esparsa
jmeter -n -t config/plano-testes-basico.jmx -l results/teste1.jtl -e -o results/teste1-report

# Teste 2: Carga Crescente
jmeter -n -t config/plano-testes-basico.jmx -l results/teste2.jtl -e -o results/teste2-report

# Teste 3: Rajada de Carga
jmeter -n -t config/plano-testes-basico.jmx -l results/teste3.jtl -e -o results/teste3-report
```

**Parâmetros:**
- `-n`: Modo non-GUI (sem interface)
- `-t`: Arquivo do plano de testes
- `-l`: Arquivo de log de resultados (.jtl)
- `-e`: Gerar relatório HTML
- `-o`: Pasta de saída do relatório

---

## 📊 Configuração dos Testes

### Plano de Testes: `plano-testes-basico.jmx`

O plano contém **3 Thread Groups** (grupos de usuários):

#### **Teste 1: Carga Esparsa**
- **Usuários**: 10
- **Ramp-up**: 30 segundos (1 usuário a cada 3s)
- **Iterações**: 10 loops
- **Duração**: ~1 minuto
- **Objetivo**: Estabelecer baseline de performance

#### **Teste 2: Carga Crescente**
- **Usuários**: 500
- **Ramp-up**: 120 segundos (~4 usuários/segundo)
- **Iterações**: 10 loops
- **Duração**: ~4 minutos
- **Objetivo**: Testar escalabilidade com carga crescente

#### **Teste 3: Rajada de Carga**
- **Usuários**: 1000
- **Ramp-up**: 10 segundos (100 usuários/segundo)
- **Iterações**: 3 loops
- **Duração**: ~30 segundos
- **Objetivo**: Simular pico súbito de acessos (spike test)

### Endpoints Testados

Cada thread group faz requisições para:

1. **GET /products** - Listagem de produtos
2. **POST /products** - Criação de produto
3. **GET /heavy-cpu** - Processamento intensivo (50M iterações)
4. **GET /heavy-io** - I/O bloqueante (delay 3s)
5. **GET /many-items** - Transferência de dados (50k itens)

---

## 📈 Gerando Gráficos Comparativos

### Script Python: `analysis/gerar_graficos.py`

Este script lê os CSVs dos 3 testes e gera 4 gráficos comparativos.

#### Instalação de Dependências

```bash
pip install matplotlib numpy pandas seaborn
```

#### Executando o Script

```bash
cd jmeter/test-results/analysis
python gerar_graficos.py
```

#### Gráficos Gerados

1. **01-comparativo-geral.png**
   - 4 subgráficos comparando os 3 testes
   - Métricas: Taxa de erro, Tempo médio, Throughput, Total de requisições

2. **02-escalabilidade.png**
   - 2 gráficos de linha mostrando escalabilidade
   - Taxa de erro vs Usuários
   - Throughput vs Usuários

3. **03-performance-endpoints.png**
   - Desempenho por endpoint nos Testes 2 e 3
   - Tempo médio vs Taxa de erro

4. **04-identificacao-gargalos.png**
   - Ranking visual dos gargalos identificados
   - Gráfico de barras horizontal

### Saída do Script

```
📊 Gráficos disponíveis:
   1. 01-comparativo-geral.png
   2. 02-escalabilidade.png
   3. 03-performance-endpoints.png
   4. 04-identificacao-gargalos.png

================================================================================
                            TABELA RESUMO DOS TESTES
================================================================================
Métrica                   Teste 1 (10u)        Teste 2 (500u)       Teste 3 (1000u)
--------------------------------------------------------------------------------
Usuários Simultâneos      10                   500                  1000
Total de Requisições      200                  5000                 3000
Tempo Médio (ms)          1                    12292                2968
Taxa de Erro (%)          0.0                  25.52                39.27
Throughput (req/s)        7.42                 18.69                122.26
================================================================================
```

---

## 📋 Listeners Configurados no JMeter

Para cada teste, os seguintes listeners foram usados:

### 1. Summary Report
- Métricas gerais: média, mediana, min, max, erro%
- Screenshot salvo como: `testeX_summary_report.png`

### 2. Graph Results
- Gráfico de tempo de resposta ao longo do tempo
- Screenshot salvo como: `testeX_response_time_graph.png`
- ⚠️ **NOTA**: Falta captura do Teste 1

### 3. View Results in Table
- Tabela detalhada de cada requisição
- Screenshot salvo como: `testeX_results_table.png`

### 4. View Results Tree (apenas Testes 2 e 3)
- Detalhes dos erros encontrados
- Screenshot salvo como: `testeX_results_table_errors.png`

---

## 💾 Exportando Resultados

### Via Interface Gráfica

1. Após executar o teste, clicar com botão direito no listener
2. Selecionar **"Save Table Data"**
3. Escolher formato CSV
4. Salvar com nome descritivo (ex: `teste1-summary.csv`)

### Via Linha de Comando

Os resultados são salvos automaticamente com o parâmetro `-l`:

```bash
jmeter -n -t config/plano-testes-basico.jmx -l teste1-results.jtl
```

---

## 🔧 Dicas de Uso

### Performance do JMeter

- **Modo GUI**: Use apenas para configurar e debug
- **Modo CLI**: Use para testes reais (melhor performance)
- **Memória**: Aumentar heap se necessário: `export JVM_ARGS="-Xms1g -Xmx4g"`

### Métricas Importantes

- **Tempo de Resposta**: Mediana é mais confiável que média
- **Taxa de Erro**: >5% indica problemas sérios
- **Throughput**: Requisições por segundo (quanto maior, melhor)
- **Percentis**: 90º, 95º, 99º percentil mostram experiência do usuário

### Boas Práticas

1. Sempre fazer testes com modo non-GUI para resultados reais
2. Executar múltiplas iterações para média estatística
3. Monitorar recursos do servidor (CPU, memória, I/O)
4. Documentar configuração do ambiente de teste
5. Salvar tanto CSVs quanto screenshots

---

## 📝 Resultados Obtidos

Consulte a pasta `docs/` para análise completa dos resultados, insights e recomendações técnicas.

**Resumo rápido:**

| Teste | Usuários | Requisições | Erro | Tempo Médio | Throughput |
|-------|----------|-------------|------|-------------|------------|
| Teste 1 | 10 | 200 | 0.00% ✅ | 1ms | 7.42 req/s |
| Teste 2 | 500 | 5.000 | 25.52% ⚠️ | 12.292ms | 18.69 req/s |
| Teste 3 | 1.000 | 3.000 | 39.27% 🔴 | 2.968ms | 122.26 req/s |

**Conclusão**: Sistema suporta até ~500 usuários simultâneos antes de degradação crítica.

---

_Para análise detalhada, insights técnicos e estrutura do relatório, consulte `docs/README.md`_
