"""
Script para gerar gráficos comparativos dos testes de carga
Autor: Análise automatizada para Desafio MAD
Data: 2025-11-25
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from pathlib import Path

# Configurações de estilo
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)
plt.rcParams['font.size'] = 10

# Dados dos testes (extraídos dos CSVs)
dados_testes = {
    'Teste 1 (10 usuários)': {
        'usuarios': 10,
        'requisicoes': 200,
        'tempo_medio': 1,  # ms
        'tempo_max': 69,
        'erro_percent': 0.00,
        'throughput': 7.42,
        'endpoints': {
            'GET /products': {'tempo': 1, 'erro': 0.0},
            'GET /status': {'tempo': 0, 'erro': 0.0}
        }
    },
    'Teste 2 (500 usuários)': {
        'usuarios': 500,
        'requisicoes': 5000,
        'tempo_medio': 12292,  # ms
        'tempo_max': 44594,
        'erro_percent': 25.52,
        'throughput': 18.69,
        'endpoints': {
            'GET /products': {'tempo': 15275, 'erro': 19.20},
            'GET /heavy-cpu': {'tempo': 9310, 'erro': 31.84}
        }
    },
    'Teste 3 (1000 usuários)': {
        'usuarios': 1000,
        'requisicoes': 3000,
        'tempo_medio': 2968,  # ms
        'tempo_max': 12722,
        'erro_percent': 39.27,
        'throughput': 122.26,
        'endpoints': {
            'GET /products': {'tempo': 4186, 'erro': 39.30},
            'GET /many-items': {'tempo': 1300, 'erro': 39.30},
            'GET /heavy-io': {'tempo': 3417, 'erro': 39.20}
        }
    }
}

def gerar_grafico_comparativo_geral():
    """Gráfico comparativo de métricas principais"""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('Comparativo Geral dos Testes de Carga', fontsize=16, fontweight='bold')
    
    testes = list(dados_testes.keys())
    usuarios = [dados_testes[t]['usuarios'] for t in testes]
    
    # 1. Taxa de Erro
    erros = [dados_testes[t]['erro_percent'] for t in testes]
    axes[0, 0].bar(testes, erros, color=['green', 'orange', 'red'])
    axes[0, 0].set_title('Taxa de Erro (%)', fontweight='bold')
    axes[0, 0].set_ylabel('Erro (%)')
    axes[0, 0].set_ylim(0, max(erros) * 1.2)
    for i, v in enumerate(erros):
        axes[0, 0].text(i, v + 1, f'{v:.2f}%', ha='center', fontweight='bold')
    
    # 2. Tempo Médio de Resposta
    tempos = [dados_testes[t]['tempo_medio'] for t in testes]
    axes[0, 1].bar(testes, tempos, color=['green', 'red', 'orange'])
    axes[0, 1].set_title('Tempo Médio de Resposta (ms)', fontweight='bold')
    axes[0, 1].set_ylabel('Tempo (ms)')
    for i, v in enumerate(tempos):
        axes[0, 1].text(i, v + max(tempos)*0.02, f'{v}ms', ha='center', fontweight='bold')
    
    # 3. Throughput
    throughputs = [dados_testes[t]['throughput'] for t in testes]
    axes[1, 0].bar(testes, throughputs, color=['orange', 'yellow', 'green'])
    axes[1, 0].set_title('Throughput (requisições/segundo)', fontweight='bold')
    axes[1, 0].set_ylabel('req/s')
    for i, v in enumerate(throughputs):
        axes[1, 0].text(i, v + 2, f'{v:.1f}', ha='center', fontweight='bold')
    
    # 4. Número de Requisições
    requisicoes = [dados_testes[t]['requisicoes'] for t in testes]
    axes[1, 1].bar(testes, requisicoes, color=['blue', 'purple', 'navy'])
    axes[1, 1].set_title('Total de Requisições Executadas', fontweight='bold')
    axes[1, 1].set_ylabel('Requisições')
    for i, v in enumerate(requisicoes):
        axes[1, 1].text(i, v + max(requisicoes)*0.02, f'{v}', ha='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('graficos/01-comparativo-geral.png', dpi=300, bbox_inches='tight')
    print("✅ Gráfico 1: Comparativo Geral criado")

def gerar_grafico_escalabilidade():
    """Gráfico de escalabilidade (usuários vs métricas)"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle('Análise de Escalabilidade', fontsize=16, fontweight='bold')
    
    usuarios = [10, 500, 1000]
    erros = [0.00, 25.52, 39.27]
    throughputs = [7.42, 18.69, 122.26]
    
    # Erro vs Usuários
    axes[0].plot(usuarios, erros, marker='o', color='red', linewidth=2, markersize=10)
    axes[0].set_title('Taxa de Erro vs Usuários Simultâneos', fontweight='bold')
    axes[0].set_xlabel('Usuários Simultâneos')
    axes[0].set_ylabel('Taxa de Erro (%)')
    axes[0].grid(True, alpha=0.3)
    for i, (x, y) in enumerate(zip(usuarios, erros)):
        axes[0].annotate(f'{y}%', (x, y), textcoords="offset points", xytext=(0,10), ha='center', fontweight='bold')
    
    # Throughput vs Usuários
    axes[1].plot(usuarios, throughputs, marker='s', color='green', linewidth=2, markersize=10)
    axes[1].set_title('Throughput vs Usuários Simultâneos', fontweight='bold')
    axes[1].set_xlabel('Usuários Simultâneos')
    axes[1].set_ylabel('Throughput (req/s)')
    axes[1].grid(True, alpha=0.3)
    for i, (x, y) in enumerate(zip(usuarios, throughputs)):
        axes[1].annotate(f'{y:.1f}', (x, y), textcoords="offset points", xytext=(0,10), ha='center', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('graficos/02-escalabilidade.png', dpi=300, bbox_inches='tight')
    print("✅ Gráfico 2: Escalabilidade criado")

def gerar_grafico_endpoints():
    """Comparação de performance por endpoint"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle('Performance por Endpoint', fontsize=16, fontweight='bold')
    
    # Teste 2 - Endpoints
    endpoints_t2 = ['GET /products', 'GET /heavy-cpu']
    tempos_t2 = [15275, 9310]
    erros_t2 = [19.20, 31.84]
    
    x_t2 = np.arange(len(endpoints_t2))
    width = 0.35
    
    axes[0].bar(x_t2 - width/2, tempos_t2, width, label='Tempo (ms)', color='steelblue')
    axes[0].set_ylabel('Tempo (ms)', color='steelblue')
    axes[0].set_title('Teste 2: 500 Usuários', fontweight='bold')
    axes[0].set_xticks(x_t2)
    axes[0].set_xticklabels(endpoints_t2, rotation=15, ha='right')
    axes[0].tick_params(axis='y', labelcolor='steelblue')
    
    ax2 = axes[0].twinx()
    ax2.bar(x_t2 + width/2, erros_t2, width, label='Erro (%)', color='red', alpha=0.7)
    ax2.set_ylabel('Taxa de Erro (%)', color='red')
    ax2.tick_params(axis='y', labelcolor='red')
    
    # Teste 3 - Endpoints
    endpoints_t3 = ['GET /products', 'GET /many-items', 'GET /heavy-io']
    tempos_t3 = [4186, 1300, 3417]
    erros_t3 = [39.30, 39.30, 39.20]
    
    x_t3 = np.arange(len(endpoints_t3))
    
    axes[1].bar(x_t3 - width/2, tempos_t3, width, label='Tempo (ms)', color='steelblue')
    axes[1].set_ylabel('Tempo (ms)', color='steelblue')
    axes[1].set_title('Teste 3: 1000 Usuários (Rajada)', fontweight='bold')
    axes[1].set_xticks(x_t3)
    axes[1].set_xticklabels(endpoints_t3, rotation=15, ha='right')
    axes[1].tick_params(axis='y', labelcolor='steelblue')
    
    ax3 = axes[1].twinx()
    ax3.bar(x_t3 + width/2, erros_t3, width, label='Erro (%)', color='red', alpha=0.7)
    ax3.set_ylabel('Taxa de Erro (%)', color='red')
    ax3.tick_params(axis='y', labelcolor='red')
    
    plt.tight_layout()
    plt.savefig('graficos/03-performance-endpoints.png', dpi=300, bbox_inches='tight')
    print("✅ Gráfico 3: Performance por Endpoint criado")

def gerar_grafico_gargalos():
    """Identificação de gargalos"""
    fig, ax = plt.subplots(figsize=(10, 6))
    
    categorias = ['CPU\n(heavy-cpu)', 'Banco de Dados\n(/products)', 'I/O\n(heavy-io)', 'Transferência\n(many-items)']
    erros = [31.84, 19.20, 39.20, 39.30]
    cores = ['red', 'orange', 'darkred', 'darkred']
    
    bars = ax.barh(categorias, erros, color=cores)
    ax.set_xlabel('Taxa de Erro (%)', fontweight='bold')
    ax.set_title('Identificação de Gargalos por Tipo de Recurso', fontsize=14, fontweight='bold')
    ax.set_xlim(0, max(erros) * 1.1)
    
    for i, (bar, val) in enumerate(zip(bars, erros)):
        ax.text(val + 1, i, f'{val}%', va='center', fontweight='bold')
    
    # Linha de referência
    ax.axvline(x=30, color='gray', linestyle='--', alpha=0.5, label='Limiar crítico (30%)')
    ax.legend()
    
    plt.tight_layout()
    plt.savefig('graficos/04-identificacao-gargalos.png', dpi=300, bbox_inches='tight')
    print("✅ Gráfico 4: Identificação de Gargalos criado")

def gerar_tabela_resumo():
    """Cria tabela resumo em formato texto"""
    print("\n" + "="*80)
    print("TABELA RESUMO DOS TESTES".center(80))
    print("="*80)
    print(f"{'Métrica':<25} {'Teste 1 (10u)':<20} {'Teste 2 (500u)':<20} {'Teste 3 (1000u)':<20}")
    print("-"*80)
    print(f"{'Usuários Simultâneos':<25} {10:<20} {500:<20} {1000:<20}")
    print(f"{'Total de Requisições':<25} {200:<20} {5000:<20} {3000:<20}")
    print(f"{'Tempo Médio (ms)':<25} {1:<20} {12292:<20} {2968:<20}")
    print(f"{'Tempo Máximo (ms)':<25} {69:<20} {44594:<20} {12722:<20}")
    print(f"{'Taxa de Erro (%)':<25} {0.00:<20} {25.52:<20} {39.27:<20}")
    print(f"{'Throughput (req/s)':<25} {7.42:<20} {18.69:<20} {122.26:<20}")
    print("="*80)

if __name__ == '__main__':
    print("🚀 Gerando gráficos comparativos dos testes de carga...\n")
    
    # Criar diretório de gráficos
    Path('graficos').mkdir(exist_ok=True)
    
    # Gerar todos os gráficos
    gerar_grafico_comparativo_geral()
    gerar_grafico_escalabilidade()
    gerar_grafico_endpoints()
    gerar_grafico_gargalos()
    
    # Exibir tabela resumo
    gerar_tabela_resumo()
    
    print("\n✅ Todos os gráficos foram gerados com sucesso!")
    print("📁 Arquivos salvos em: analise-resultados/graficos/")
    print("\n📊 Gráficos disponíveis:")
    print("   1. 01-comparativo-geral.png")
    print("   2. 02-escalabilidade.png")
    print("   3. 03-performance-endpoints.png")
    print("   4. 04-identificacao-gargalos.png")
