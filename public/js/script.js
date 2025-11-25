// Estado global
let allProducts = []
let currentPage = 1
const itemsPerPage = 10

// Funções de notificação
function showNotification(message, type = 'success') {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <strong>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</strong>
    <span>${message}</span>
  `
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease reverse'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Carregar produtos
async function loadProducts() {
  const limit = document.getElementById('productLimit').value
  const btn = event.target
  const originalText = btn.innerHTML
  btn.innerHTML = '<span class="loading"></span> Carregando...'
  btn.disabled = true

  try {
    const res = await fetch('/products')
    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error('Dados inválidos recebidos')
    }

    allProducts = data.slice(0, parseInt(limit))
    currentPage = 1

    // Atualizar o max do input para o total de produtos disponíveis
    const totalAvailable = data.length
    document.getElementById('productLimit').max = totalAvailable
    
    // Mostrar botão de refresh
    document.getElementById('refreshBtn').style.display = 'inline-flex'

    updateStats(allProducts)
    renderProducts()
    showNotification(
      `${allProducts.length} de ${totalAvailable} produtos carregados com sucesso!`,
      'success'
    )
  } catch (error) {
    showNotification('Erro ao carregar produtos: ' + error.message, 'error')
    document.getElementById('productsTableContainer').innerHTML = `
      <div class="empty-state">
        <p style="color: var(--danger)">❌ Erro ao carregar produtos</p>
      </div>
    `
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
}

// Atualizar tabela mantendo a mesma quantidade
async function refreshTable() {
  const btn = document.getElementById('refreshBtn')
  const originalText = btn.innerHTML
  btn.innerHTML = '<span class="loading"></span> Atualizando...'
  btn.disabled = true

  try {
    const currentLimit = allProducts.length || document.getElementById('productLimit').value
    const res = await fetch('/products')
    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error('Dados inválidos recebidos')
    }

    allProducts = data.slice(0, parseInt(currentLimit))
    
    // Ajustar página atual se necessário
    const totalPages = Math.ceil(allProducts.length / itemsPerPage)
    if (currentPage > totalPages) {
      currentPage = Math.max(1, totalPages)
    }

    updateStats(allProducts)
    renderProducts()
    showNotification('Tabela atualizada com sucesso!', 'success')
  } catch (error) {
    showNotification('Erro ao atualizar tabela: ' + error.message, 'error')
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
}

// Atualizar estatísticas
function updateStats(products) {
  const total = products.length
  const avgPrice =
    products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / total || 0
  const prices = products.map(p => parseFloat(p.price || 0)).filter(p => p > 0)
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)

  document.getElementById('productsStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total de Produtos</div>
      <div class="stat-value">${total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Preço Médio</div>
      <div class="stat-value">R$ ${avgPrice.toFixed(2)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Preço Máximo</div>
      <div class="stat-value">R$ ${maxPrice.toFixed(2)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Preço Mínimo</div>
      <div class="stat-value">R$ ${minPrice.toFixed(2)}</div>
    </div>
  `
}

// Renderizar tabela de produtos
function renderProducts() {
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const paginatedProducts = allProducts.slice(start, end)

  const tableHtml = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Preço</th>
          <th style="text-align: center">Ações</th>
        </tr>
      </thead>
      <tbody>
        ${paginatedProducts
          .map(
            p => `
          <tr>
            <td><strong>#${p.id}</strong></td>
            <td>${p.name}</td>
            <td>${p.description.substring(0, 50)}${
              p.description.length > 50 ? '...' : ''
            }</td>
            <td><strong>R$ ${parseFloat(p.price).toFixed(2)}</strong></td>
            <td>
              <div class="actions" style="justify-content: center">
                <button class="btn-primary btn-sm" onclick="viewProduct(${
                  p.id
                })">👁️ Ver</button>
                <button class="btn-secondary btn-sm" onclick="editProduct(${
                  p.id
                })">✏️ Editar</button>
                <button class="btn-danger btn-sm" onclick="deleteProduct(${
                  p.id
                })">🗑️ Deletar</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `

  document.getElementById('productsTableContainer').innerHTML = tableHtml
  renderPagination()
}

// Renderizar paginação
function renderPagination() {
  const totalPages = Math.ceil(allProducts.length / itemsPerPage)
  let paginationHtml = ''

  if (totalPages > 1) {
    paginationHtml += `<button class="btn-secondary btn-sm" onclick="changePage(${
      currentPage - 1
    })" ${currentPage === 1 ? 'disabled' : ''}>« Anterior</button>`

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        paginationHtml += `<button class="btn-secondary btn-sm ${
          i === currentPage ? 'active' : ''
        }" onclick="changePage(${i})">${i}</button>`
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationHtml += `<span>...</span>`
      }
    }

    paginationHtml += `<button class="btn-secondary btn-sm" onclick="changePage(${
      currentPage + 1
    })" ${currentPage === totalPages ? 'disabled' : ''}>Próximo »</button>`
  }

  document.getElementById('pagination').innerHTML = paginationHtml
}

// Mudar página
function changePage(page) {
  const totalPages = Math.ceil(allProducts.length / itemsPerPage)
  if (page >= 1 && page <= totalPages) {
    currentPage = page
    renderProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Visualizar produto
async function viewProduct(id) {
  try {
    const res = await fetch(`/products/${id}`)
    const product = await res.json()

    document.getElementById('productDetails').innerHTML = `
      <div class="form-group">
        <label>ID:</label>
        <p><strong>#${product.id}</strong></p>
      </div>
      <div class="form-group">
        <label>Nome:</label>
        <p>${product.name}</p>
      </div>
      <div class="form-group">
        <label>Descrição:</label>
        <p>${product.description}</p>
      </div>
      <div class="form-group">
        <label>Preço:</label>
        <p><strong style="color: var(--success); font-size: 1.5rem">R$ ${parseFloat(
          product.price
        ).toFixed(2)}</strong></p>
      </div>
    `

    document.getElementById('viewProductModal').classList.add('active')
  } catch (error) {
    showNotification('Erro ao carregar produto: ' + error.message, 'error')
  }
}

// Fechar modal de visualização
function closeViewModal() {
  document.getElementById('viewProductModal').classList.remove('active')
}

// Abrir modal de criação
function openCreateModal() {
  document.getElementById('modalTitle').textContent = 'Novo Produto'
  document.getElementById('productForm').reset()
  document.getElementById('productId').value = ''
  document.getElementById('productModal').classList.add('active')
}

// Editar produto
async function editProduct(id) {
  try {
    const res = await fetch(`/products/${id}`)
    const product = await res.json()

    document.getElementById('modalTitle').textContent = 'Editar Produto'
    document.getElementById('productId').value = product.id
    document.getElementById('productName').value = product.name
    document.getElementById('productDescription').value = product.description
    document.getElementById('productPrice').value = product.price

    document.getElementById('productModal').classList.add('active')
  } catch (error) {
    showNotification('Erro ao carregar produto: ' + error.message, 'error')
  }
}

// Fechar modal
function closeModal() {
  document.getElementById('productModal').classList.remove('active')
}

// Salvar produto (criar ou atualizar)
document.getElementById('productForm').addEventListener('submit', async e => {
  e.preventDefault()

  const id = document.getElementById('productId').value
  const name = document.getElementById('productName').value
  const description = document.getElementById('productDescription').value
  const price = document.getElementById('productPrice').value

  const data = { name, description, price: parseFloat(price) }

  try {
    const url = id ? `/products/${id}` : '/products'
    const method = id ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new Error('Erro ao salvar produto')

    showNotification(
      `Produto ${id ? 'atualizado' : 'criado'} com sucesso! Use "♻️ Atualizar Tabela" para ver as mudanças.`,
      'success'
    )
    closeModal()

    // Mostrar botão de refresh se produtos já estiverem carregados
    if (allProducts.length > 0) {
      document.getElementById('refreshBtn').style.display = 'inline-flex'
    }
  } catch (error) {
    showNotification('Erro ao salvar produto: ' + error.message, 'error')
  }
})

// Deletar produto
async function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja deletar este produto?')) return

  try {
    const res = await fetch(`/products/${id}`, { method: 'DELETE' })

    if (!res.ok) throw new Error('Erro ao deletar produto')

    showNotification('Produto deletado com sucesso! Use "♻️ Atualizar Tabela" para ver as mudanças.', 'success')

    // Remover da lista local e re-renderizar
    allProducts = allProducts.filter(p => p.id !== id)
    if (allProducts.length === 0) {
      document.getElementById('productsTableContainer').innerHTML = `
        <div class="empty-state">
          <p>Nenhum produto para exibir. Clique em "♻️ Atualizar Tabela" ou "🔄 Carregar Produtos".</p>
        </div>
      `
      document.getElementById('refreshBtn').style.display = 'inline-flex'
    } else {
      // Ajustar página atual se necessário após deletar
      const totalPages = Math.ceil(allProducts.length / itemsPerPage)
      if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages)
      }
      renderProducts()
      updateStats(allProducts)
    }
  } catch (error) {
    showNotification('Erro ao deletar produto: ' + error.message, 'error')
  }
}

// Status da aplicação
async function loadStatus() {
  const btn = event.target
  const originalText = btn.innerHTML
  btn.innerHTML = '<span class="loading"></span> Atualizando...'
  btn.disabled = true

  try {
    const res = await fetch('/status')
    const data = await res.json()
    document.getElementById('statusBox').innerText = JSON.stringify(
      data,
      null,
      2
    )
    showNotification('Status atualizado!', 'info')
  } catch (error) {
    showNotification('Erro ao obter status: ' + error.message, 'error')
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
}

// Upload de arquivo
document.getElementById('uploadForm').addEventListener('submit', async e => {
  e.preventDefault()

  const formData = new FormData(e.target)
  const btn = e.target.querySelector('button')
  const originalText = btn.innerHTML
  btn.innerHTML = '<span class="loading"></span> Enviando...'
  btn.disabled = true

  try {
    const res = await fetch('/upload', { method: 'POST', body: formData })
    const data = await res.json()

    document.getElementById('uploadStatus').innerHTML = `
      <div class="notification success" style="position: static; margin-top: 15px">
        <strong>✅</strong> <span>${data.message}</span>
      </div>
    `
    e.target.reset()
    showNotification(data.message, 'success')
  } catch (error) {
    showNotification('Erro no upload: ' + error.message, 'error')
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
})

// Testes de performance
async function cpuTest() {
  const resultBox = document.getElementById('cpuResult')
  const btn = event.target
  const originalText = btn.innerHTML

  btn.innerHTML = '<span class="loading"></span> Processando...'
  btn.disabled = true
  resultBox.style.display = 'block'
  resultBox.innerText = 'Executando teste de CPU...'

  const start = performance.now()

  try {
    const res = await fetch('/heavy-cpu')
    const data = await res.json()
    const duration = ((performance.now() - start) / 1000).toFixed(2)

    resultBox.innerText = `✅ Teste concluído!\n\nResultado: ${data.result.toFixed(
      2
    )}\nTempo decorrido: ${duration}s`
    showNotification(`Teste de CPU concluído em ${duration}s`, 'success')
  } catch (error) {
    resultBox.innerText = '❌ Erro: ' + error.message
    showNotification('Erro no teste de CPU: ' + error.message, 'error')
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
}

async function ioTest() {
  const resultBox = document.getElementById('ioResult')
  const btn = event.target
  const originalText = btn.innerHTML

  btn.innerHTML = '<span class="loading"></span> Aguardando...'
  btn.disabled = true
  resultBox.style.display = 'block'
  resultBox.innerText = 'Executando teste de I/O (aguarde 3s)...'

  const start = performance.now()

  try {
    const res = await fetch('/heavy-io')
    const data = await res.json()
    const duration = ((performance.now() - start) / 1000).toFixed(2)

    resultBox.innerText = `✅ ${data.message}\nTempo decorrido: ${duration}s`
    showNotification(`Teste de I/O concluído em ${duration}s`, 'success')
  } catch (error) {
    resultBox.innerText = '❌ Erro: ' + error.message
    showNotification('Erro no teste de I/O: ' + error.message, 'error')
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
}

async function delayTest() {
  const resultBox = document.getElementById('delayResult')
  const btn = event.target
  const originalText = btn.innerHTML

  btn.innerHTML = '<span class="loading"></span> Aguardando...'
  btn.disabled = true
  resultBox.style.display = 'block'
  resultBox.innerText = 'Executando teste de delay aleatório...'

  const start = performance.now()

  try {
    const res = await fetch('/random-delay')
    const data = await res.json()
    const duration = ((performance.now() - start) / 1000).toFixed(2)

    resultBox.innerText = `✅ Delay aplicado: ${data.delay}ms\nTempo total: ${duration}s`
    showNotification(`Teste de delay concluído (${data.delay}ms)`, 'success')
  } catch (error) {
    resultBox.innerText = '❌ Erro: ' + error.message
    showNotification('Erro no teste de delay: ' + error.message, 'error')
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
}

async function manyItemsTest() {
  const resultBox = document.getElementById('manyItemsResult')
  const btn = event.target
  const originalText = btn.innerHTML

  btn.innerHTML = '<span class="loading"></span> Baixando...'
  btn.disabled = true
  resultBox.style.display = 'block'
  resultBox.innerText = 'Baixando 50.000 itens...'

  const start = performance.now()

  try {
    const res = await fetch('/many-items')
    const data = await res.json()
    const duration = ((performance.now() - start) / 1000).toFixed(2)
    const sizeKB = (JSON.stringify(data).length / 1024).toFixed(2)

    resultBox.innerText = `✅ Recebidos ${data.length} itens\nTamanho: ${sizeKB} KB\nTempo: ${duration}s\nVelocidade: ${(
      sizeKB / duration
    ).toFixed(2)} KB/s`
    showNotification(
      `${data.length} itens recebidos em ${duration}s`,
      'success'
    )
  } catch (error) {
    resultBox.innerText = '❌ Erro: ' + error.message
    showNotification('Erro no teste de itens: ' + error.message, 'error')
  } finally {
    btn.innerHTML = originalText
    btn.disabled = false
  }
}

// Fechar modais ao clicar fora
window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active')
  }
}
