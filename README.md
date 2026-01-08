# Gadoapp Web (Frontend)

Aplicação Web Progressiva (PWA) para gestão de gado, focada em funcionamento Offline-First.

## 🚀 Tecnologias

- **React + TypeScript** (Vite)
- **TailwindCSS** (Estilização)
- **Axios** (Comunicação HTTP)
- **Dexie.js** (Banco de Dados Local / IndexedDB)
- **Context API** (Gerenciamento de Estado Global)

## ⚙️ Como Rodar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:5173`

## 📱 Funcionalidades

- **Autenticação:** Login e Cadastro integrados com a API Java.
- **Gestão de Rebanhos:** Criar, Listar, Editar e Excluir (CRUD).
- **Offline-First (Em desenvolvimento):**
  - Os dados são salvos localmente no IndexedDB.
  - Sincronização automática com o servidor quando houver internet.

## 🎨 Estrutura de Pastas

- `src/pages`: Telas do sistema (Login, Herds, etc).
- `src/contexts`: Estados globais (AuthContext).
- `src/lib`: Configurações de bibliotecas (Axios).
- `src/db`: Configuração do banco local (Dexie).
