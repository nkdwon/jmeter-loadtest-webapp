const express = require('express')
const cors = require('cors')
const { db, init } = require('./db.js')

const app = express()
app.use(express.static('public'))
app.use(express.json())
app.use(cors())

// Inicializar banco de dados
init()

// ===== ROTAS =====

// Listar produtos (GET) com suporte a limit e offset
app.get('/products', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : null
  const offset = req.query.offset ? parseInt(req.query.offset) : 0
  
  let query = 'SELECT * FROM products'
  let params = []
  
  if (limit) {
    query += ' LIMIT ? OFFSET ?'
    params = [limit, offset]
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(rows)
  })
})

// Buscar produto por ID (GET)
app.get('/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!row) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }
    res.json(row)
  })
})

// Criar produto (POST)
app.post('/products', (req, res) => {
  const { name, description, price } = req.body
  db.run(
    'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
    [name, description, price],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.status(201).json({ id: this.lastID, name, description, price })
    }
  )
})

// Atualizar produto (PUT)
app.put('/products/:id', (req, res) => {
  const { name, description, price } = req.body
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?',
    [name, description, price, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' })
      }
      res.json({ id: parseInt(req.params.id), name, description, price })
    }
  )
})

// Remover produto (DELETE)
app.delete('/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }
    res.json({ message: `Produto ${req.params.id} removido` })
  })
})

// ===== SERVIDOR =====
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})

// Simulação de carga pesada de CPU
app.get('/heavy-cpu', (req, res) => {
  let x = 0
  for (let i = 0; i < 50_000_000; i++) {
    x += Math.sqrt(i)
  }
  res.json({ result: x })
})

// Simulação de I/O bloqueante (por ex.: banco de dados lento)
app.get('/heavy-io', (req, res) => {
  setTimeout(() => {
    res.json({ message: 'I/O concluído' })
  }, 3000) // Espera 3 segundos
})

// Delay aleatório para testes de latência
app.get('/random-delay', (req, res) => {
  const delay = Math.floor(Math.random() * 4000) + 1000 // entre 1 e 5s
  setTimeout(() => {
    res.json({ delay })
  }, delay)
})

// Retorna muitos itens para simular transferência grande
app.get('/many-items', (req, res) => {
  const items = []
  for (let i = 0; i < 50000; i++) {
    items.push({ id: i, name: 'Item ' + i })
  }
  res.json(items)
})

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: `Arquivo recebido: ${req.file.originalname}` })
})

app.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})
