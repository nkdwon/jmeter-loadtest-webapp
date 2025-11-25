// seed.js
const { db, init } = require('./db')

init()

function randomName(i) {
  const tags = [
    'Alpha',
    'Beta',
    'Gama',
    'Delta',
    'Omega',
    'Prime',
    'Lite',
    'Pro'
  ]
  return `Produto ${i} - ${tags[i % tags.length]}`
}

function randomDesc(i) {
  return `Descrição detalhada do produto ${i}. Texto para testar queries de busca e paginação. Características, especificações e detalhes.`
}

function runSeed() {
  db.serialize(() => {
    const insert = db.prepare(
      'INSERT INTO products (name, description, price) VALUES (?, ?, ?)'
    )
    for (let i = 1; i <= 5000; i++) {
      const name = randomName(i)
      const desc = randomDesc(i)
      const price = (Math.random() * 200).toFixed(2)
      insert.run(name, desc, price)
    }
    insert.finalize(() => {
      console.log('Seed finalizado com 5000 produtos.')
      db.close()
    })
  })
}

runSeed()
