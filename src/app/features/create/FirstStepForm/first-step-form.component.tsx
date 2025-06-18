import { Box, Button, Heading, Input, VStack, Checkbox } from "@chakra-ui/react";
import { FirstStepFormValues } from "./validationSchema";
import React from 'react';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';

export const FirstStepForm = ({
  onSubmit,
  register,
  handleSubmit,
  setValue,
  watch,
  errors
}: {
  onSubmit: (data: FirstStepFormValues) => void,
  register: any,
  handleSubmit: any,
  setValue: any,
  watch: any,
  errors: any
}) => {
  const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());
  const [editorConvite, setEditorConvite] = React.useState(() => EditorState.createEmpty());
  const [editorLembrete, setEditorLembrete] = React.useState(() => EditorState.createEmpty());

  React.useEffect(() => {
    register("textoBoasVindas");
    register("templateEmailConvite");
    register("templateEmailLembrete");
    // Se já houver valor salvo, inicializa o editor com ele
    const html = watch("textoBoasVindas");
    if (html) {
      const blocksFromHtml = convertFromHTML(html);
      if (blocksFromHtml.contentBlocks) {
        setEditorState(EditorState.createWithContent(ContentState.createFromBlockArray(blocksFromHtml.contentBlocks)));
      }
    }
  }, [register, watch]);

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    setValue("textoBoasVindas", html);
  };

  const handleEditorConviteChange = (state: EditorState) => {
    setEditorConvite(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    setValue("templateEmailConvite", html);
  };

  const handleEditorLembreteChange = (state: EditorState) => {
    setEditorLembrete(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    setValue("templateEmailLembrete", html);
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Criar novo formulário
      </Heading>

      <form onSubmit={e => e.preventDefault()}>
        <VStack align="stretch">
          <Box mb={2}>
            <label htmlFor="titulo">Nome do formulário</label>
            <Input id="titulo" placeholder="Digite o titulo" {...register("titulo")}/>
            {errors.titulo && (
              <Box color="red.500" fontSize="sm">{errors.titulo.message}</Box>
            )}
          </Box>

          <Box mb={2}>
            <label htmlFor="descricao">Descrição do formulário</label>
            <Input id="descricao" placeholder="Digite a descrição" {...register("descricao")}/>
            {errors.descricao && (
              <Box color="red.500" fontSize="sm">{errors.descricao.message}</Box>
            )}
          </Box>

          <Box mb={2}>
            <label htmlFor="dataInicio">Data de início</label>
            <Input id="dataInicio" type="date" {...register("dataInicio")}/>
            {errors.dataInicio && (
              <Box color="red.500" fontSize="sm">{errors.dataInicio.message}</Box>
            )}
          </Box>

          <Box mb={2}>
            <label htmlFor="dataFim">Data de fim</label>
            <Input id="dataFim" type="date" {...register("dataFim")}/>
            {errors.dataFim && (
              <Box color="red.500" fontSize="sm">{errors.dataFim.message}</Box>
            )}
          </Box>

          <Box mb={2}>
            <label>Texto de boas-vindas (aceita HTML)</label>
            <Editor
              editorState={editorState}
              onEditorStateChange={handleEditorChange}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
              }}
            />
          </Box>

          <Box mb={2}>
            <label>Template de e-mail de convite (aceita HTML)</label>
            <Editor
              editorState={editorConvite}
              onEditorStateChange={handleEditorConviteChange}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
              }}
            />
          </Box>

          <Box mb={2}>
            <label>Template de e-mail de lembrete (aceita HTML)</label>
            <Editor
              editorState={editorLembrete}
              onEditorStateChange={handleEditorLembreteChange}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
              }}
            />
          </Box>

          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
            <input
              id="ordemAleatoria"
              type="checkbox"
              {...register("ordemAleatoria")}
              style={{ marginRight: 8 }}
            />
            <label htmlFor="ordemAleatoria">Ordem Aleatória</label>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="lembrarACadaXDias">Lembrar a cada X dias</label>
            <input
              id="lembrarACadaXDias"
              type="number"
              {...register("lembrarACadaXDias")}
              style={{ width: 120, padding: 8, marginLeft: 8 }}
            />
          </div>

          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
            <input
              id="enviarLembreteAutomatico"
              type="checkbox"
              {...register("enviarLembreteAutomatico")}
              style={{ marginRight: 8 }}
            />
            <label htmlFor="enviarLembreteAutomatico">Enviar lembrete automático</label>
          </div>

          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
            <input
              id="enviarLembreteParaTodos"
              type="checkbox"
              {...register("enviarLembreteParaTodos")}
              style={{ marginRight: 8 }}
            />
            <label htmlFor="enviarLembreteParaTodos">Enviar lembrete para todos</label>
          </div>

          <Button
            type="button"
            colorScheme="teal"
            alignSelf="flex-end"
            onClick={() => onSubmit({} as any)}
          >
            Próximo
          </Button>
        </VStack>
      </form>
    </Box>
  );
};
