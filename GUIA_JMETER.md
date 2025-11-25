# Guia de Configuração do JMeter para Testes de Carga

## 📋 Objetivo

Este guia ajuda a configurar o Apache JMeter para testar a aplicação web com diferentes cenários de carga.

## 🔧 Instalação do JMeter

1. Baixe o Apache JMeter: https://jmeter.apache.org/download_jmeter.cgi
2. Extraia o arquivo ZIP
3. Execute `bin/jmeter.bat` (Windows) ou `bin/jmeter.sh` (Linux/Mac)

## 🎯 Cenários de Teste

### Cenário 1: Carga Esparsa (Baseline)

**Objetivo**: Estabelecer baseline de performance com baixa carga

**Configuração**:
```
Thread Group
├── Number of Threads: 10
├── Ramp-Up Period: 30 segundos
└── Loop Count: 10
```

**Requisições**:
- GET /products
- GET /status
- GET /products/1

**Métricas Esperadas**:
- Tempo médio: < 100ms
- Taxa de erro: 0%
- Throughput: ~3-5 req/s

### Cenário 2: Carga Crescente

**Objetivo**: Testar escalabilidade com aumento gradual de usuários

**Configuração**:
```
Thread Group
├── Number of Threads: 500
├── Ramp-Up Period: 120 segundos
└── Loop Count: 5
```

**Requisições**:
- 40% GET /products
- 20% POST /products
- 20% PUT /products/${id}
- 10% DELETE /products/${id}
- 10% GET /heavy-cpu

**Métricas Esperadas**:
- Tempo médio: < 500ms
- Taxa de erro: < 5%
- Throughput: 30-50 req/s

### Cenário 3: Rajada de Carga (Spike Test)

**Objetivo**: Testar comportamento sob pico súbito

**Configuração**:
```
Thread Group
├── Number of Threads: 1000
├── Ramp-Up Period: 10 segundos
└── Loop Count: 1
```

**Requisições**:
- 50% GET /products
- 30% GET /many-items
- 20% GET /heavy-io

**Métricas Esperadas**:
- Tempo médio: variável (pode degradar)
- Taxa de erro: monitorar
- Throughput: máximo do servidor

## 📊 Estrutura do Plano de Teste JMeter

```
Test Plan
│
├── Thread Group: Carga Esparsa
│   ├── HTTP Request Defaults
│   │   ├── Server: localhost
│   │   └── Port: 3000
│   ├── HTTP Request: GET /products
│   ├── HTTP Request: GET /status
│   └── Listeners
│       ├── View Results Tree
│       ├── Summary Report
│       └── Graph Results
│
├── Thread Group: Carga Crescente
│   └── [mesma estrutura]
│
└── Thread Group: Rajada de Carga
    └── [mesma estrutura]
```

## 🛠️ Elementos Importantes do JMeter

### 1. HTTP Request Defaults

Configura valores padrão para todas as requisições:
```
Server Name or IP: localhost
Port Number: 3000
Protocol: http
```

### 2. HTTP Header Manager

Adiciona headers necessários:
```
Content-Type: application/json
Accept: application/json
```

### 3. CSV Data Set Config (para testes com dados)

Criar arquivo `data.csv`:
```csv
id,name,description,price
1,Produto A,Descrição A,10.50
2,Produto B,Descrição B,20.00
3,Produto C,Descrição C,15.75
```

Configuração:
```
Filename: data.csv
Variable Names: id,name,description,price
Delimiter: ,
Recycle on EOF: True
```

### 4. JSON Extractor

Para extrair IDs de produtos criados:
```
Names of created variables: productId
JSON Path expressions: $.id
```

### 5. Listeners (Ouvintes)

**View Results Tree**: Ver detalhes de cada requisição

**Summary Report**: Estatísticas gerais
- # Samples
- Average (ms)
- Min/Max
- Std. Dev.
- Error %
- Throughput

**Aggregate Report**: Métricas detalhadas incluindo percentis

**Response Time Graph**: Gráfico de tempo de resposta

**Active Threads Over Time**: Threads ativas ao longo do tempo

## 📈 Exemplo de Requisição POST

```json
POST /products
Headers:
  Content-Type: application/json

Body:
{
  "name": "${name}",
  "description": "${description}",
  "price": ${price}
}
```

## 📉 Exemplo de Requisição PUT

```json
PUT /products/${productId}
Headers:
  Content-Type: application/json

Body:
{
  "name": "Produto Atualizado",
  "description": "Nova descrição",
  "price": 99.99
}
```

## 🎯 Asserções (Assertions)

Adicionar validações:

**Response Assertion**:
```
Response Code: 200
Response Headers: Content-Type: application/json
```

**JSON Assertion**:
```
$.length() > 0  (para arrays)
$.id exists     (para objetos)
```

## 📊 Métricas para Coletar

### Performance
- **Average Response Time**: Tempo médio de resposta
- **Median**: Valor do meio (50º percentil)
- **90th Percentile**: 90% das requisições foram mais rápidas
- **95th Percentile**: 95% das requisições foram mais rápidas
- **99th Percentile**: 99% das requisições foram mais rápidas
- **Min/Max**: Tempos mínimo e máximo

### Throughput
- **Requests per Second**: Taxa de requisições
- **KB per Second**: Taxa de transferência de dados

### Erros
- **Error Rate %**: Percentual de requisições com erro
- **Error Count**: Número absoluto de erros

### Recursos
- **Active Threads**: Threads ativas simultaneamente
- **Connection Time**: Tempo para estabelecer conexão

## 🔍 Análise de Resultados

### Exemplo de Tabela de Resultados

| Cenário | Threads | Ramp-up | Loops | Avg (ms) | Med (ms) | 90% (ms) | Error % | Throughput |
|---------|---------|---------|-------|----------|----------|----------|---------|------------|
| Esparsa | 10 | 30s | 10 | 45 | 42 | 58 | 0% | 4.2 req/s |
| Crescente | 500 | 120s | 5 | 234 | 198 | 456 | 2.1% | 38.5 req/s |
| Rajada | 1000 | 10s | 1 | 1250 | 987 | 2340 | 15.3% | 52.1 req/s |

### Interpretação

**Carga Esparsa**: Sistema responde muito bem, sem degradação.

**Carga Crescente**: Performance aceitável, pequena taxa de erro pode indicar limite de conexões.

**Rajada**: Sistema sofre com pico súbito, tempo de resposta aumenta significativamente e erros aparecem.

## 💡 Dicas

1. **Sempre execute warm-up**: Faça um teste leve antes para "esquentar" o servidor

2. **Monitore o servidor**: Use `htop` (Linux) ou Task Manager (Windows) para ver CPU/memória

3. **Incremente gradualmente**: Não pule direto para 1000 threads, teste com 100, 200, 500...

4. **Use timers**: Adicione "Constant Timer" entre requisições para simular comportamento real

5. **Salve resultados**: Use "Simple Data Writer" para salvar resultados em CSV

6. **Teste endpoints isoladamente**: Antes de testar tudo junto, teste cada endpoint separadamente

## 🚀 Executando via Linha de Comando (Non-GUI Mode)

Para testes de carga pesados, use modo não-gráfico:

```bash
jmeter -n -t plan.jmx -l results.jtl -e -o ./report
```

Parâmetros:
- `-n`: Non-GUI mode
- `-t`: Test plan file
- `-l`: Log file (resultados)
- `-e`: Generate report
- `-o`: Output folder

## 📝 Checklist Antes de Testar

- [ ] Banco de dados populado (npm run seed)
- [ ] Servidor rodando (npm start)
- [ ] JMeter configurado e testado com 1 thread
- [ ] Listeners adicionados para coletar métricas
- [ ] Arquivo CSV preparado (se usando parametrização)
- [ ] Monitoramento do servidor pronto
- [ ] Espaço em disco para logs

## 🎓 Recursos Adicionais

- [Documentação Oficial JMeter](https://jmeter.apache.org/usermanual/index.html)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Tutorial em Vídeo](https://www.youtube.com/results?search_query=apache+jmeter+tutorial)

---

**Boa sorte com seus testes de carga! 🚀**
