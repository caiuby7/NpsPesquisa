import { Heading } from "@chakra-ui/react";
import { FirstStepFormValues } from "./validationSchema";
import React from "react";

export const FirstStepForm = ({
  onSubmit,
  register,
  handleSubmit,
  errors
}: {
  onSubmit: (data: FirstStepFormValues) => void,
  register: any,
  handleSubmit: any,
  errors: any
}) => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, background: 'rgba(255,255,255,0.95)', borderRadius: 12 }}>
      <Heading as="h2" size="lg" style={{ marginBottom: 24 }}>
        Criar novo formulário
      </Heading>
      <form onSubmit={handleSubmit((data: FirstStepFormValues) => { console.log('Submit do FirstStepForm chamado', data); onSubmit(data); })}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="titulo">Nome do formulário</label>
          <input id="titulo" type="text" {...register("titulo", { required: true })} style={{ width: '100%', padding: 8, marginTop: 4 }} />
          {errors.titulo && <span style={{ color: 'red' }}>Campo obrigatório</span>}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="descricao">Descrição do formulário</label>
          <input id="descricao" type="text" {...register("descricao")} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="dataInicio">Data de início</label>
          <input id="dataInicio" type="date" {...register("dataInicio", { required: true })} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="dataFim">Data de fim</label>
          <input id="dataFim" type="date" {...register("dataFim", { required: true })} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="textoBoasVindas">Texto de boas-vindas (aceita HTML)</label>
          <textarea
            id="textoBoasVindas"
            {...register("textoBoasVindas", { required: true })}
            style={{ width: '100%', minHeight: 120, padding: 8, marginTop: 4, resize: 'vertical' }}
          />
          {errors.textoBoasVindas && <span style={{ color: 'red' }}>Campo obrigatório</span>}
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Você pode usar HTML para formatar o texto. Exemplo: <code>&lt;b&gt;negrito&lt;/b&gt;</code>, <code>&lt;br/&gt;</code> para quebra de linha.
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="templateEmailConvite">Template do e-mail de convite (aceita HTML)</label>
          <textarea
            id="templateEmailConvite"
            {...register("templateEmailConvite", { required: true })}
            style={{ width: '100%', minHeight: 120, padding: 8, marginTop: 4, resize: 'vertical' }}
          />
          {errors.templateEmailConvite && <span style={{ color: 'red' }}>Campo obrigatório</span>}
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Use as tags <code>&#123;&#123;nome&#125;&#125;</code>, <code>&#123;&#123;titulo&#125;&#125;</code> e <code>&#123;&#123;link&#125;&#125;</code> para personalizar o e-mail.<br/>
            Exemplo de HTML: <code>&lt;b&gt;Olá, &#123;&#123;nome&#125;&#125;!&lt;/b&gt;&lt;br/&gt;Clique no link: &#123;&#123;link&#125;&#125;</code>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="templateEmailLembrete">Template do e-mail de lembrete (aceita HTML)</label>
          <textarea
            id="templateEmailLembrete"
            {...register("templateEmailLembrete", { required: true })}
            style={{ width: '100%', minHeight: 120, padding: 8, marginTop: 4, resize: 'vertical' }}
          />
          {errors.templateEmailLembrete && <span style={{ color: 'red' }}>Campo obrigatório</span>}
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Use as tags <code>&#123;&#123;nome&#125;&#125;</code>, <code>&#123;&#123;titulo&#125;&#125;</code> e <code>&#123;&#123;link&#125;&#125;</code> para personalizar o e-mail.<br/>
            Exemplo de HTML: <code>&lt;b&gt;Olá, &#123;&#123;nome&#125;&#125;!&lt;/b&gt;&lt;br/&gt;Clique no link: &#123;&#123;link&#125;&#125;</code>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="lembrarACadaXDias">Lembrar a cada X dias</label>
          <input id="lembrarACadaXDias" type="number" {...register("lembrarACadaXDias")} style={{ width: 120, padding: 8, marginLeft: 8 }} />
        </div>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <input id="enviarLembreteAutomatico" type="checkbox" {...register("enviarLembreteAutomatico")} style={{ marginRight: 8 }} />
          <label htmlFor="enviarLembreteAutomatico">Enviar lembrete automático</label>
        </div>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <input id="enviarLembreteParaTodos" type="checkbox" {...register("enviarLembreteParaTodos")} style={{ marginRight: 8 }} />
          <label htmlFor="enviarLembreteParaTodos">Enviar lembrete para todos</label>
        </div>
        <button type="submit" style={{ padding: '10px 24px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
          Próximo
        </button>
      </form>
    </div>
  );
};
