const repositorioDAO = require("../models/repositorio.dao");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const instituicoesDAO = require("../models/instituicoes.dao");
const medalhasDAO = require("../models/medalhas.dao");
const aiSuggestionService = require('../services/aiSuggestion.service');

const repositorioController = {

     async home(req, res) {
  try {
    const user = req.session.user;

    let cursos = [];
    let cursoSelecionado = null;

    if (user.tipo === 'aluno') {
      if (user.curso_id) {
        cursoSelecionado = await instituicoesDAO.findCursoById(user.curso_id);

        if (cursoSelecionado && cursoSelecionado.instituicao_id === user.instituicao_id) {
          cursos = [cursoSelecionado];
        }
      }
    } 
    
    else {
      cursos = await instituicoesDAO.findCursoByInstituicaoID(user.instituicao_id);

      if (user.curso_id) {
        cursoSelecionado = cursos.find(c => c.id === user.curso_id) || null;
      }
    }

    const semestresPorCurso = {};

    for (const c of cursos) {
      const disciplinas = await repositorioDAO.findDisciplinasByCurso(c.id);
      const semestresCurso = {};

      for (let i = 1; i <= c.semestres; i++) {
        semestresCurso[i] = [];
      }

      disciplinas.forEach(d => {
        if (!semestresCurso[d.semestre]) semestresCurso[d.semestre] = [];
        semestresCurso[d.semestre].push(d);
      });

      semestresPorCurso[c.id] = semestresCurso;
    }

    res.render("repositorio/repositorio", {
      user,
      cursos,
      curso: cursoSelecionado,
      semestresPorCurso,
    });

  } catch (error) {
    console.error("Erro ao carregar home:", error);
    res.status(500).send("Erro interno ao carregar home.");
  }
},

async mostrarCadastroDisciplina(req, res) {
  try {
    const user = req.session.user;

    const cursoId = req.params.id;
    const curso = await instituicoesDAO.findCursoById(cursoId);

    if (!curso) {
      return res.status(404).send("Curso não encontrado");
    }

    res.render("repositorio/cadastrarDisciplina", {
      user,
      curso,
      error: null,
      formData: null
    });
  } catch (error) {
    console.error("Erro ao exibir página de cadastro de disciplina:", error);
    res.status(500).send("Erro interno ao carregar página de cadastro.");
  }
},

async mostrarCadastroMateria(req, res) {
  try {
    const disciplina_id = req.params.id;
    
    res.render("repositorio/cadastrarMateria", {
      disciplina_id,
      error: null,
      formData: null
    });

  } catch (error) {
    console.error("Erro ao exibir página de cadastro de Materia:", error);
    res.status(500).send("Erro interno ao carregar página de cadastro.");
  }
},

async mostrarCadastroConteudo(req, res) {
  try {
    const materia_id = req.params.id;
    
    res.render("repositorio/cadastrarConteudo", {
      materia_id,
      error: null,
      formData: null
    });

  } catch (error) {
    console.error("Erro ao exibir página de cadastro de Conteudo:", error);
    res.status(500).send("Erro interno ao carregar página de cadastro.");
  }
},

async mostrarCadastroTarefa(req, res) {
  try {
    const materia_id = req.params.id;
    
    res.render("repositorio/cadastrarTarefa", {
      materia_id,
      error: null,
      formData: null
    });

  } catch (error) {
    console.error("Erro ao exibir página de cadastro de Tarefa:", error);
    res.status(500).send("Erro interno ao carregar página de cadastro.");
  }
},

async cadastrarDisciplina(req, res) {
    try {
      const user = req.session.user;

      const disciplina = req.body;

      const { curso_id } = req.body;

      disciplina.semestre = parseInt(disciplina.semestre)

      if (!disciplina.nome || !disciplina.semestre || !disciplina.curso_id) {
        return res.render("repositorio/cadastrarDisciplina", {
          user,
          curso: await instituicoesDAO.findCursoById(curso_id),
          error: "Preencha todos os campos.",
          formData: req.body
        });
      }

      disciplina.id = crypto.randomUUID();

      await repositorioDAO.cadastraDisciplina(disciplina);

      res.redirect("/repo");

    } catch (error) {
      console.error("Erro ao cadastrar disciplina:", error);
      const curso = await instituicoesDAO.findCursoById(curso_id);

      res.render("repositorio/cadastrarDisciplina", {
        user: req.session.user,
        curso,
        error: "Erro ao cadastrar disciplina.",
        formData: req.body
      });
    }
  },

  async cadastrarMateria(req, res) {
    try {

      const materia = req.body;

      if (!materia.nome || !materia.disciplina_id) {
        return res.render("repositorio/cadastrarMateria", {
          disciplina_id: materia.disciplina_id,
          error: "Preencha todos os campos.",
          formData: req.body
        });
      }

      materia.id = crypto.randomUUID();

      await repositorioDAO.cadastraMateria(materia);

      res.redirect("/repo/disciplina/"+materia.disciplina_id);

    } catch (error) {
      console.error("Erro ao cadastrar Materia:", error);

      res.render("repositorio/cadastrarMateria", {
        disciplina_id: materia.disciplina_id,
        error: "Preencha todos os campos.",
        formData: req.body
      });
    }
  },

  async cadastrarTarefa(req, res) {
  try {
    const user = req.session.user;
    const tarefa = req.body;

    const {tipo, link} = req.body;

    const arquivo = tipo === 'link' ? link : (req.file ? req.file.filename : null);

    if (!tarefa.titulo || !tarefa.descricao || !tarefa.data_entrega || !tarefa.valor || !tarefa.materia_id) {
      return res.render("repositorio/cadastrarTarefa", {
        materia_id: tarefa.materia_id,
        error: "Preencha todos os campos.",
        formData: req.body
      });
    }

    tarefa.arquivo = arquivo;
    tarefa.valor = parseFloat(tarefa.valor);
    tarefa.id = crypto.randomUUID();

    await repositorioDAO.cadastraTarefa(tarefa);

    res.redirect(`/repo/tarefa/${tarefa.id}`);

  } catch (error) {
    console.error("Erro ao cadastrar tarefa:", error);

    res.render("repositorio/cadastrarTarefa", {
      materia_id: req.body.materia_id,
      error: "Erro ao cadastrar tarefa.",
      formData: req.body
    });
  }
},


   async mostrarDisciplina(req, res) {
    try {
      const user = req.session.user;
      const disciplina_id = req.params.id;

      const disciplina = await repositorioDAO.findDisciplinaById(disciplina_id);
      if (!disciplina) return res.status(404).send("Disciplina não encontrada");

      const materias = await repositorioDAO.findMateriasByDisciplina(disciplina_id);

      const materiasDetalhadas = [];
      for (const m of materias) {
        const conteudos = await repositorioDAO.findConteudosByMateria(m.id);
        const tarefas = await repositorioDAO.findTarefasByMateria(m.id);
        materiasDetalhadas.push({
          ...m,
          conteudos,
          tarefas,
        });
      }

      res.render("repositorio/disciplina", {
        user,
        disciplina,
        materias: materiasDetalhadas,
      });
    } catch (error) {
      console.error("Erro ao exibir disciplina:", error);
      res.status(500).send("Erro interno ao carregar disciplina.");
    }
  },

  async cadastrarConteudo(req, res) {
  try {
    const { nome, descricao, tipo, link, materia_id } = req.body;

    const arquivo = tipo === 'link' ? link : (req.file ? req.file.filename : null);

    if (!nome || !tipo || !materia_id || !arquivo) {
      return res.render("repositorio/cadastrarConteudo"+materia_id, {
        materia_id,
        error: "Preencha todos os campos corretamente.",
        formData: req.body
      });
    }

    const conteudo = {
      id: crypto.randomUUID(),
      nome,
      descricao,
      tipo,
      arquivo,
      materia_id
    };

    await repositorioDAO.cadastraConteudo(conteudo);

    const disciplina = await repositorioDAO.findDisciplinaByMateria(materia_id)

    res.redirect(`/repo/disciplina/${disciplina.disciplina_id}`);

  } catch (error) {
    console.error("Erro ao cadastrar conteúdo:", error);
    res.render("repositorio/cadastrarConteudo"+req.body.materia_id, {
      materia_id: req.body.materia_id,
      error: "Erro ao cadastrar conteúdo.",
      formData: req.body
    });
  }
},

async deletarConteudo(req, res) {
  try {
    const conteudoId = req.params.id;
    
    const conteudo = await repositorioDAO.findConteudoById(conteudoId);

    if (!conteudo) return res.status(404).send("Conteúdo não encontrado");

    const disciplina = await repositorioDAO.findDisciplinaByMateria(conteudo.materia_id);

    if (conteudo.tipo !== 'link' && conteudo.arquivo) {
      const filePath = path.join(__dirname, '../../uploads/conteudos', disciplina.curso_id, conteudo.arquivo);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Arquivo deletado: ${filePath}`);
      } else {
        console.warn(`Arquivo não encontrado: ${filePath}`);
      }
    }

    await repositorioDAO.deletaConteudo(conteudoId);

    res.redirect(`/repo/disciplina/${disciplina.disciplina_id}`);
  } catch (error) {
    console.error("Erro ao excluir conteúdo:", error);
    res.status(500).send("Erro ao excluir conteúdo.");
  }
},

async mostrarTarefa(req, res) {
  try {
    const user = req.session.user;
    const tarefa_id = req.params.id;

    const tarefa = await repositorioDAO.findTarefaById(tarefa_id);
    if (!tarefa) return res.status(404).send("Tarefa não encontrada.");

    let envios = [];
    let jaEnviou = null;

    if (user.tipo === 'aluno') {
      jaEnviou = await repositorioDAO.findEnvioAluno(tarefa_id, user.id);
    } else {
      envios = await repositorioDAO.findEnviosByTarefa(tarefa_id);
    }

    res.render("repositorio/tarefa", {
      user,
      tarefa,
      envios,
      jaEnviou,
      error: req.session.error || null
    });
req.session.error = null;

  } catch (error) {
    console.error("Erro ao carregar tarefa:", error);
    res.status(500).send("Erro interno ao carregar a página da tarefa.");
  }
},

async enviarTarefa(req, res) {
  try {
    const user = req.session.user;
    const tarefa_id = req.params.id;

    const tarefa = await repositorioDAO.findTarefaById(tarefa_id);
    if (!tarefa) return res.status(404).send("Tarefa não encontrada.");

    if (user.tipo !== 'aluno') {
      return res.status(403).send("Apenas alunos podem enviar tarefas.");
    }

    const jaEnviou = await repositorioDAO.findEnvioAluno(tarefa_id, user.id);
    if (jaEnviou) {
      return res.render("repositorio/tarefa", {
        user,
        tarefa,
        jaEnviou,
        envios: [],
        error: "Você já enviou esta tarefa."
      });
    }

    if (!req.file) {
      return res.render("repositorio/tarefa", {
        user,
        tarefa,
        jaEnviou: null,
        envios: [],
        error: "Selecione um arquivo para enviar."
      });
    }

    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const envio = {
      id: crypto.randomUUID(),
      tarefa_id,
      aluno_id: user.id,
      arquivo: req.file.filename,
      nome_original: Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    };

    await repositorioDAO.registrarEnvio(envio);

    const pontos = {
      id: crypto.randomUUID(),
      tipo: 'tarefa',
      quantidade_pontos: 5,
      user_id: user.id
    }

    await medalhasDAO.inserirPontos(pontos);

    res.redirect(`/repo/tarefa/${tarefa_id}`);

  } catch (error) {
    console.error("Erro ao enviar tarefa:", error);
    res.status(500).send("Erro ao enviar tarefa.");
  }
},

async avaliarTarefa(req, res) {
  try {
    const { id, envioId } = req.params;
    const { nota, feedback } = req.body;

    const tarefa = await repositorioDAO.findTarefaById(id);
    if (!tarefa) {
      return res.status(404).send("Tarefa não encontrada.");
    }

    const notaNum = parseFloat(nota);

    if (notaNum < 0 || notaNum > tarefa.valor) {
      req.session.error = `A nota deve estar entre 0 e ${tarefa.valor}.`;
      return res.redirect(`/repo/tarefa/${id}`);
    }

    await repositorioDAO.atualizarNotaEFeedback(envioId, notaNum, feedback);

    res.redirect(`/repo/tarefa/${id}`);
  } catch (error) {
    console.error("Erro ao avaliar tarefa:", error);
    res.status(500).send("Erro ao salvar avaliação da tarefa.");
  }
},

async lerConteudo (req, res) {
  try {
    const user_id = req.session.user.id;
    const conteudo_id = req.params.id;
    const disciplina_id = req.body['diciplina_id'];
    const id = crypto.randomUUID();

    const conteudo = {id, user_id, conteudo_id};

    await repositorioDAO.leConteudo(conteudo);

    const pontos = {
      id: crypto.randomUUID(),
      tipo: 'conteudo',
      quantidade_pontos: 2,
      user_id: user_id
    }

    await medalhasDAO.inserirPontos(pontos);
    
    res.redirect('/repo/disciplina/'+disciplina_id);
  } catch (error) {
    console.error("Erro ao ler Conteudo:", error);
    res.status(500).send("Erro ao salvar leitura.");
  }
},

async desLerConteudo(req, res) {
  try {
    const user_id = req.session.user.id;
    const conteudo_id = req.params.id;

    await repositorioDAO.desleConteudo(user_id, conteudo_id);

    const pontos = {
      user_id: user_id,
      quantidade_pontos: 2
    }

    await medalhasDAO.deletarPontos(pontos);

    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json({ sucesso: true });
    }

    const disciplina_id = req.body['diciplina_id'];
    res.redirect('/repo/disciplina/' + disciplina_id);
  } catch (error) {
    console.error("Erro ao desler conteúdo:", error);
    res.status(500).json({ sucesso: false, erro: "Erro ao remover leitura." });
  }
},

async sugerirConteudoIA(req, res) {
  try {
    const userId = req.session.user.id;
    const disciplinaId = req.params.disciplinaId;

    const materias = await repositorioDAO.findMateriasByDisciplina(disciplinaId);
    let conteudosLidos = [];
    let conteudosNaoLidos = [];

    for (const m of materias) {
      const conteudos = await repositorioDAO.findConteudosByMateria(m.id);
      for (const c of conteudos) {
        if (c.usuario_id === userId) conteudosLidos.push(c);
        else conteudosNaoLidos.push(c);
      }
    }

    if (conteudosNaoLidos.length === 0) {
      return res.json({ suggestion: "Parabéns! Você já leu todos os conteúdos desta disciplina." });
    }

    const suggestion = await aiSuggestionService.generateSuggestion({
      readContents: conteudosLidos.map(c => ({ name: c.nome, description: c.descricao })),
      unreadContents: conteudosNaoLidos.map(c => ({ name: c.nome, description: c.descricao })),
    });

    res.json({ suggestion });
  } catch (error) {
    console.error("Erro ao gerar sugestão IA:", error);
    res.json({ error: "Erro ao gerar sugestão da IA." });
  }
}




}

module.exports = repositorioController;
