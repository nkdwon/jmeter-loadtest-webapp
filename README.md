# jmeter-loadtest-webapp

Aplicação web desenvolvida para realizar testes de carga com Apache JMeter, simulando diversos cenários de performance e escalabilidade.

## 📋 Descrição do Projeto

Este projeto é uma aplicação web completa construída com Node.js/Express e banco de dados SQLite, desenvolvida especificamente para testes de performance não-funcionais. A aplicação permite avaliar o comportamento do sistema sob diferentes cenários de carga:

- **Carga esparsa**: Poucos usuários simultâneos
- **Carga em crescimento**: Aumento gradual de usuários
- **Rajada de carga**: Pico súbito de acessos simultâneos

## 🚀 Funcionalidades

### CRUD de Produtos
- **GET /products** - Lista todos os produtos (com SQLite)
- **GET /products/:id** - Busca produto por ID
- **POST /products** - Cria novo produto
- **PUT /products/:id** - Atualiza produto existente
- **DELETE /products/:id** - Remove produto

### Endpoints de Teste de Carga
- **GET /heavy-cpu** - Simula processamento intensivo de CPU (50 milhões de iterações)
- **GET /heavy-io** - Simula I/O bloqueante (delay de 3 segundos)
- **GET /random-delay** - Delay aleatório entre 1-5 segundos para testes de latência
- **GET /many-items** - Retorna 50.000 itens para testar transferência de dados
- **POST /upload** - Upload de arquivos (multipart/form-data)
- **GET /status** - Status da aplicação (uptime, timestamp)

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js v14 ou superior
- npm ou yarn
- Apache JMeter (para executar os testes)

### Instalação

1. Clone este repositório:
```bash
git clone <url-do-repositorio>
cd jmeter-loadtest-webapp
```

2. Instale as dependências:
```bash
npm install
```

3. Inicialize o banco de dados com dados de teste:
```bash
npm run seed
```

Este comando cria 5.000 produtos no banco SQLite para testes realistas.

4. Inicie o servidor:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📊 Estrutura do Projeto

```
jmeter-loadtest-webapp/
├── server.js           # Servidor Express com todas as rotas
├── db.js              # Configuração do banco SQLite
├── seed.js            # Script para popular o banco com dados
├── package.json       # Dependências do projeto
├── plan.jmx          # Plano de testes JMeter
├── data.csv          # Dados para parametrização do JMeter
├── public/           # Arquivos estáticos
│   ├── index.html    # Interface web principal
│   ├── product.html  # Página de detalhes do produto
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── script.js # Funções JavaScript do frontend
└── uploads/          # Diretório para arquivos enviados
```

## 🧪 Testando com JMeter

### Cenários de Teste Sugeridos

#### 1. Carga Esparsa (10-50 usuários)
```
Threads: 10-50
Ramp-up: 30 segundos
Loop Count: 10
Endpoints: GET /products, GET /status
```

#### 2. Carga Crescente (100-500 usuários)
```
Threads: 100-500
Ramp-up: 60-120 segundos
Loop Count: 5
Endpoints: GET /products, POST /products, GET /heavy-cpu
```

#### 3. Rajada de Carga (1000+ usuários)
```
Threads: 1000+
Ramp-up: 10 segundos
Loop Count: 1
Endpoints: GET /products, GET /many-items
```

### Métricas para Análise
- **Tempo de resposta** (média, mediana, 90º percentil, 95º percentil, 99º percentil)
- **Taxa de transferência** (requisições/segundo)
- **Taxa de erro** (%)
- **Uso de CPU e memória do servidor**
- **Latência de rede**
- **Tempo de conexão**

## 📦 Dependências

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "sqlite3": "^5.1.6",
  "multer": "1.4.5-lts.1",
  "body-parser": "^1.20.2",
  "cookie-parser": "^1.4.6"
}
```

## 🎯 Objetivos do Desafio MAD

Este projeto atende aos seguintes requisitos do desafio:

✅ Sistema de aplicação web com domínio específico (e-commerce de produtos)  
✅ Testes de performance em diversos cenários de carga  
✅ Simulação de condições realistas (carga esparsa, crescente e rajadas)  
✅ Endpoints específicos para estressar CPU, I/O e rede  
✅ Banco de dados real (SQLite) com 5.000 registros  
✅ Interface web funcional  
✅ Upload de arquivos  
✅ Monitoramento de status do servidor  

## 📈 Análise de Resultados

Após executar os testes com JMeter, crie gráficos e tabelas analisando:

### Gráficos Recomendados
1. **Tempo de Resposta vs Número de Usuários**
2. **Taxa de Transferência (Throughput) ao Longo do Tempo**
3. **Percentuais de Erro vs Carga**
4. **Uso de CPU/Memória Durante os Testes**
5. **Comparação de Latência entre Endpoints**

### Tabelas de Dados
| Cenário | Usuários | Tempo Médio (ms) | Throughput (req/s) | Taxa de Erro (%) |
|---------|----------|------------------|-------------------|------------------|
| Esparsa | 10-50 | - | - | - |
| Crescente | 100-500 | - | - | - |
| Rajada | 1000+ | - | - | - |

## 🔧 Troubleshooting

### Problema: Erro ao conectar ao banco de dados
**Solução**: Execute `npm run seed` para criar o banco de dados

### Problema: Porta 3000 já está em uso
**Solução**: Altere a constante `PORT` em `server.js` ou encerre o processo usando a porta

### Problema: Uploads não funcionam
**Solução**: Verifique se o diretório `uploads/` existe

## 🚀 Próximos Passos

Para expandir o projeto:

1. Adicionar autenticação de usuários
2. Implementar cache (Redis)
3. Adicionar logging estruturado
4. Criar dashboard de métricas em tempo real
5. Implementar rate limiting
6. Adicionar testes unitários e de integração

## 📝 Licença

MIT

## 👥 Autores

Felipe - PUC Faculdade - Desafio MAD

---

**Desenvolvido para o Desafio MAD - Testes Não Funcionais com Apache JMeter**
