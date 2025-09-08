import { Box, Button, Heading, Input, VStack, Checkbox, Select, FormControl, FormLabel, FormHelperText } from "@chakra-ui/react";
import React from 'react';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import { QUESTIONARIO_TYPES, ITEM_AVALIADO_TYPES, TipoQuestionarioEnum } from "../../../services/form/form.services.types";
import { CreateFormSchema } from "../../../widgets/create-form/useCreateQuestionForm";

export const FirstStepForm = ({
  onSubmit,
  register,
  handleSubmit,
  setValue,
  watch,
  errors
}: {
  onSubmit: (data: CreateFormSchema) => void,
  register: any,
  handleSubmit: any,
  setValue: any,
  watch: any,
  errors: any
}) => {
  const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());
  const [editorConvite, setEditorConvite] = React.useState(() => EditorState.createEmpty());
  const [editorLembrete, setEditorLembrete] = React.useState(() => EditorState.createEmpty());

  const tipoQuestionario = watch("tipo");

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
        <VStack align="stretch" spacing={4}>
          <FormControl isInvalid={!!errors.titulo}>
            <FormLabel htmlFor="titulo">Nome do formulário *</FormLabel>
            <Input id="titulo" placeholder="Digite o título" {...register("titulo")}/>
            {errors.titulo && (
              <FormHelperText color="red.500">{errors.titulo.message}</FormHelperText>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.descricao}>
            <FormLabel htmlFor="descricao">Descrição do formulário *</FormLabel>
            <Input id="descricao" placeholder="Digite a descrição" {...register("descricao")}/>
            {errors.descricao && (
              <FormHelperText color="red.500">{errors.descricao.message}</FormHelperText>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.tipo}>
            <FormLabel htmlFor="tipo">Tipo de Questionário *</FormLabel>
            <Select 
              id="tipo" 
              placeholder="Selecione o tipo"
              {...register("tipo")}
            >
              {QUESTIONARIO_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            {errors.tipo && (
              <FormHelperText color="red.500">{errors.tipo.message}</FormHelperText>
            )}
          </FormControl>

          {/* Campos específicos para Avaliação Institucional */}
          {tipoQuestionario === TipoQuestionarioEnum.AVALIACAO_INSTITUCIONAL && (
            <>
              <FormControl>
                <FormLabel htmlFor="tipoItemAvaliado">Item a ser Avaliado</FormLabel>
                <Select 
                  id="tipoItemAvaliado" 
                  placeholder="Selecione o tipo de item"
                  {...register("tipoItemAvaliado")}
                >
                  {ITEM_AVALIADO_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="nomeItemEspecifico">Nome Específico do Item</FormLabel>
                <Input 
                  id="nomeItemEspecifico" 
                  placeholder="Ex: Direito, Matemática, etc."
                  {...register("nomeItemEspecifico")}
                />
              </FormControl>
            </>
          )}

          <FormControl isInvalid={!!errors.dataInicio}>
            <FormLabel htmlFor="dataInicio">Data de início *</FormLabel>
            <Input id="dataInicio" type="date" {...register("dataInicio")}/>
            {errors.dataInicio && (
              <FormHelperText color="red.500">{errors.dataInicio.message}</FormHelperText>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.dataFim}>
            <FormLabel htmlFor="dataFim">Data de fim *</FormLabel>
            <Input id="dataFim" type="date" {...register("dataFim")}/>
            {errors.dataFim && (
              <FormHelperText color="red.500">{errors.dataFim.message}</FormHelperText>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Permitir comentários nas questões</FormLabel>
            <Checkbox {...register("permitirComentarios")}>
              Permitir que participantes adicionem comentários
            </Checkbox>
          </FormControl>

          <FormControl>
            <FormLabel>Permitir salvar andamento</FormLabel>
            <Checkbox {...register("permitirSalvarAndamento")}>
              Permitir que participantes salvem o progresso
            </Checkbox>
          </FormControl>

          <FormControl>
            <FormLabel>Texto de boas-vindas (aceita HTML)</FormLabel>
            <Editor
              editorState={editorState}
              onEditorStateChange={handleEditorChange}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Template de e-mail de convite (aceita HTML)</FormLabel>
            <Editor
              editorState={editorConvite}
              onEditorStateChange={handleEditorConviteChange}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Template de e-mail de lembrete (aceita HTML)</FormLabel>
            <Editor
              editorState={editorLembrete}
              onEditorStateChange={handleEditorLembreteChange}
              wrapperClassName="demo-wrapper"
              editorClassName="demo-editor"
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="lembrarACadaXDias">Lembrar a cada X dias</FormLabel>
            <Input
              id="lembrarACadaXDias"
              type="number"
              placeholder="Ex: 7"
              {...register("lembrarACadaXDias")}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Enviar lembrete automático</FormLabel>
            <Checkbox {...register("enviarLembreteAutomatico")}>
              Ativar lembretes automáticos
            </Checkbox>
          </FormControl>

          <FormControl>
            <FormLabel>Enviar lembrete para todos</FormLabel>
            <Checkbox {...register("enviarLembreteParaTodos")}>
              Enviar lembretes para todos os participantes
            </Checkbox>
          </FormControl>

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
