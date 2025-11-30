# 🚀 JMeter Load Test - Web Application

Aplicação Node.js/Express desenvolvida para **testes de carga não-funcionais** usando Apache JMeter.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-orange)](https://www.sqlite.org/)
[![JMeter](https://img.shields.io/badge/JMeter-5.6.3-red)](https://jmeter.apache.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📊 Sobre o Projeto

Este projeto foi desenvolvido como parte do **Desafio MAD (Modelagem e Avaliação de Desempenho)** da PUC, com o objetivo de:

- ✅ Avaliar performance e escalabilidade de aplicações web
- ✅ Identificar gargalos de sistema sob diferentes cargas
- ✅ Testar comportamento em cenários realistas (carga esparsa, crescente e picos)
- ✅ Praticar testes não-funcionais com Apache JMeter

### 🎯 Resultados Obtidos

Foram realizados **3 testes de carga** que revelaram:

| Teste | Usuários | Taxa de Erro | Tempo Médio | Throughput |
|-------|----------|--------------|-------------|------------|
| **Teste 1** (Carga Esparsa) | 10 | 0.00% ✅ | 1ms | 7.42 req/s |
| **Teste 2** (Carga Crescente) | 500 | 25.52% ⚠️ | 12.292ms | 18.69 req/s |
| **Teste 3** (Rajada de Carga) | 1.000 | 39.27% 🔴 | 2.968ms | 122.26 req/s |

**Conclusão**: Sistema suporta até ~500 usuários simultâneos antes de degradação crítica.

📄 **[Análise completa dos resultados →](docs/README.md)**

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** v20.14.0 - Runtime JavaScript
- **Express** 4.18.2 - Framework web minimalista
- **SQLite3** 5.1.6 - Banco de dados leve e rápido

### Bibliotecas
- **cors** 2.8.5 - Habilitar CORS
- **multer** 1.4.5 - Upload de arquivos
- **body-parser** 1.20.2 - Parse de requisições
- **cookie-parser** 1.4.6 - Parse de cookies

### Testes
- **Apache JMeter** 5.6.3 - Ferramenta de testes de carga
- **Python** 3.12+ (matplotlib, pandas, seaborn) - Geração de gráficos

---

## 🚀 Como Rodar o Projeto

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/nkdwon/jmeter-loadtest-webapp.git
cd jmeter-loadtest-webapp
```

### 2️⃣ Instalar Dependências

```bash
npm install
```

### 3️⃣ Popular Banco de Dados

```bash
npm run seed
```

Este comando cria um banco SQLite com **5.000 produtos** para testes realistas.

### 4️⃣ Iniciar Servidor

```bash
npm start
```

O servidor estará disponível em **http://localhost:3000**

### 5️⃣ Testar Endpoints

Abra o navegador ou use `curl`:

```bash
# Listar produtos
curl http://localhost:3000/products

# Status da aplicação
curl http://localhost:3000/status

# Interface web
open http://localhost:3000
```

---

## 📂 Estrutura do Projeto

```
jmeter-loadtest-webapp/
├── 📄 server.js              # Servidor Express com rotas
├── 📄 db.js                  # Configuração do SQLite
├── 📄 seed.js                # Popular banco (5.000 produtos)
├── 📄 package.json           # Dependências do projeto
│
├── 📁 public/                # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── product.html
│   ├── css/styles.css
│   └── js/script.js
│
├── 📁 docs/                  # 📊 Análise completa dos testes
│   └── README.md             ⭐ Resultados, insights, estrutura LaTeX
│
└── 📁 jmeter/                # 🧪 Testes JMeter
    ├── README.md             ⭐ Como executar testes
    ├── config/
    │   └── plano-testes-basico.jmx
    └── test-results/
        ├── teste1-carga-esparsa/
        ├── teste2-carga-crescente/
        ├── teste3-rajada-carga/
        └── analysis/
            └── graficos/
```

### 📖 Documentação

- **[docs/README.md](docs/README.md)** - Análise completa dos resultados, insights técnicos e estrutura para relatório
- **[jmeter/README.md](jmeter/README.md)** - Como rodar testes JMeter, configurações e scripts Python

---

## 🧪 Endpoints Disponíveis

### API REST (Produtos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/products` | Lista todos os produtos |
| `GET` | `/products/:id` | Busca produto por ID |
| `POST` | `/products` | Cria novo produto |
| `PUT` | `/products/:id` | Atualiza produto |
| `DELETE` | `/products/:id` | Remove produto |

### Endpoints de Teste de Carga

| Endpoint | Descrição | Uso no Teste |
|----------|-----------|--------------|
| `GET /heavy-cpu` | 50M iterações | Testar CPU |
| `GET /heavy-io` | Delay de 3s | Testar I/O |
| `GET /many-items` | Retorna 50k itens | Testar transferência |
| `GET /random-delay` | Delay 1-5s | Testar latência |
| `POST /upload` | Upload de arquivo | Testar multipart |
| `GET /status` | Status do servidor | Health check |

---

## 🧪 Executar Testes de Carga

### Pré-requisito: Instalar JMeter

Baixe e instale o Apache JMeter 5.6.3:  
**https://jmeter.apache.org/download_jmeter.cgi**

### Executar Testes

#### Via Interface Gráfica (Recomendado para visualizar)

```bash
# Windows
jmeter.bat

# Linux/Mac
./jmeter.sh
```

1. Abrir arquivo: `jmeter/config/plano-testes-basico.jmx`
2. Clicar em ▶️ (Start) para executar
3. Visualizar resultados nos listeners

#### Via Linha de Comando (Recomendado para performance)

```bash
cd jmeter

# Teste 1: Carga Esparsa (10 usuários)
jmeter -n -t config/plano-testes-basico.jmx -l teste1.jtl

# Teste 2: Carga Crescente (500 usuários)
jmeter -n -t config/plano-testes-basico.jmx -l teste2.jtl

# Teste 3: Rajada (1000 usuários)
jmeter -n -t config/plano-testes-basico.jmx -l teste3.jtl
```

### Gerar Gráficos Comparativos

```bash
cd jmeter/test-results/analysis
pip install matplotlib pandas seaborn numpy
python gerar_graficos.py
```

**Saída**: 4 gráficos PNG em `graficos/`

📊 **[Ver documentação completa dos testes →](jmeter/README.md)**

---

## 📈 Principais Descobertas

### 🔍 Gargalos Identificados

| Gargalo | Impacto | Teste Afetado |
|---------|---------|---------------|
| **Conexões Simultâneas** | 39% erro | Teste 3 (1000 usuários) |
| **CPU Single-Thread** | 31.84% erro | Teste 2 (/heavy-cpu) |
| **SQLite Escrita Concorrente** | 19.44% erro | Teste 2 (POST /products) |

### 💡 Insights Principais

1. **Comportamento Não-Linear**: Tempo aumentou 12.000x de 10 para 500 usuários
2. **Gargalos Múltiplos**: CPU em carga crescente, conexões em rajadas
3. **Alta Eficiência, Baixa Disponibilidade**: 122 req/s mas 39% erro
4. **Rede Não é Gargalo**: 50k itens (2-3MB) em apenas 1.3s
5. **Capacidade Estimada**: ~500 usuários antes de falha crítica

### 🛠️ Recomendações Técnicas

- 🔴 **Crítico**: Aumentar limite de conexões, implementar clustering, migrar para PostgreSQL
- 🟠 **Alto**: Adicionar Redis cache, load balancer Nginx, otimizar /heavy-cpu
- 🟡 **Médio**: Rate limiting, circuit breaker pattern

📄 **[Análise detalhada e recomendações →](docs/README.md)**

---

## 📦 Scripts NPM

```bash
npm start          # Iniciar servidor (porta 3000)
npm run seed       # Popular banco de dados (5.000 produtos)
```

---

## 🤝 Contribuindo

Este projeto é acadêmico, mas contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

**Felipe** - [GitHub](https://github.com/nkdwon)

Desenvolvido como parte do **Desafio MAD** - PUC Faculdade - Semestre IV

---

## 📚 Referências

- [Apache JMeter Documentation](https://jmeter.apache.org/usermanual/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

## 🎓 Contexto Acadêmico

### Disciplina
**MAD - Metodologias Ágeis e DevOps**  
PUC Faculdade - Semestre IV - 2024

### Objetivos do Desafio
- ✅ Implementar aplicação web funcional
- ✅ Realizar testes de carga não-funcionais
- ✅ Identificar gargalos e limitações
- ✅ Propor melhorias técnicas
- ✅ Documentar resultados e análises

### Material para Relatório
📄 Todo o material para escrever o relatório acadêmico está em **[docs/README.md](docs/README.md)**

Inclui:
- Resultados detalhados dos 3 testes
- Explicações técnicas de cada métrica
- Insights e análises comparativas
- Estrutura LaTeX completa
- Tabelas e gráficos prontos

---

<div align="center">

**Feito com ❤️ para aprendizado de testes de performance**

⭐ Se este projeto ajudou você, considere dar uma estrela!

</div>
