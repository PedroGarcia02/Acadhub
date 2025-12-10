# AcadHub

O **AcadHub** é um Ambiente Virtual de Aprendizagem (AVA) projetado para integrar, em uma única plataforma, recursos de organização pedagógica, fórum estruturado, repositório permanente de materiais, mecanismos de gamificação e ferramentas de inteligência artificial.  
O projeto nasce como uma **prova de conceito**, buscando demonstrar a viabilidade técnica de um AVA mais flexível, moderno e centrado no engajamento estudantil.

---

## 🚀 Primeiros Passos

### 📦 Pré-requisitos

Antes de iniciar, instale:

- **Git**
- **Node.js** (versão recomendada: LTS)
- **MySQL** (ou MariaDB)
- **NPM** (vem junto com o Node.js)

### 🔧 Instalação

Clone ou baixe o repositório:

```bash
git clone https://github.com/SEU-USUARIO/acadhub.git
cd acadhub
```

Instale as dependências:

```bash
npm install
```

Renomeie o arquivo env.example para .env.
Configure o arquivo `.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=acadhub
OPENAI_API_KEY=coloque_sua_chave_aqui
SESSION_SECRET=sua_chave_de_sessao
```

Execute as migrações (se aplicável) ou importe o script SQL incluído em `/database`.

Inicie o servidor:

```bash
npm start
```

A aplicação estará disponível em:

```
http://localhost:5000
```

---

## 🧭 Uso

Após iniciar o sistema:

- Faça login e navegue pelas seções:
  - Fórum  
  - Repositório de Materiais  
  - Perfil  
  - Tarefas  
  - Sistema de gamificação  
- Utilize a função de resumo automático de discussões (IA).  
- Crie categorias, tópicos e materiais.

---

## 📌 Requisitos e Dependências

Principais dependências utilizadas:

- Node.js  
- Express  
- EJS  
- mysql2  
- Tailwind CSS  
- OpenAI API  
- bcrypt  
- express-session

Variáveis de ambiente obrigatórias:

- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `OPENAI_API_KEY`
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

---

## 📚 Funcionalidades

- 📝 Fórum estruturado por tópicos  
- 📁 Repositório permanente de materiais  
- 🏅 Gamificação (pontos, medalhas)  
- 🤖 Ferramentas de Inteligência Artificial  
  - resumo automático de discussões  
  - recomendação de conteúdos    
- 🔐 Autenticação e controle de permissões  
- 🖼️ Interface com EJS + Tailwind  

---

## 🛠️ Tech Stack

Tecnologias principais:

- Node.js
- Express
- EJS
- Tailwind CSS
- MySQL
- OpenAI API
- JavaScript

---

## 🤝 Contribuição

Contribuições são bem-vindas!

1. Faça um fork do projeto  
2. Crie uma branch de funcionalidade:

```bash
git checkout -b feature/nova-funcionalidade
```

3. Commit e push:

```bash
git commit -m "Descrição da mudança"
git push origin feature/nova-funcionalidade
```

4. Abra um Pull Request  

Por favor, abra issues para:

- Relatar bugs  
- Sugerir melhorias  
- Solicitar novas funcionalidades  

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.  
Você pode utilizá-lo, modificá-lo e distribuí-lo livremente, desde que mantenha o aviso de copyright.

---

## 📬 Contato

Autor: **João Pedro**  
Email: *(pedrogarciaifrs@gmail.com)*  
