import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    TextField,
    Alert,
    CircularProgress,
} from '@mui/material';
import api from '../services/api';
import type { Questionario, RespostaQuestao } from '../types';

interface NovaRespostaQuestao {
    questaoId: number;
    texto: string;
}

const ResponderQuestionario: React.FC = () => {
    const { chave } = useParams<{ chave: string }>();
    const navigate = useNavigate();
    const [questionario, setQuestionario] = useState<Questionario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [respostas, setRespostas] = useState<{ [key: number]: string }>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const validarChave = async () => {
            try {
                const response = await api.get(`/ConviteQuestionario/validar/${chave}`);
                if (response.data.respondido) {
                    setError('Este questionário já foi respondido.');
                    return;
                }
                const questionarioResponse = await api.get(`/Questionario/${response.data.questionarioId}`);
                setQuestionario(questionarioResponse.data);
            } catch (err) {
                setError('Chave inválida ou questionário não encontrado.');
            } finally {
                setLoading(false);
            }
        };

        validarChave();
    }, [chave]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const respostasQuestoes: NovaRespostaQuestao[] = Object.entries(respostas).map(
                ([questaoId, valor]) => ({
                    questaoId: parseInt(questaoId),
                    texto: valor,
                })
            );

            await api.post('/Resposta', {
                questionarioId: questionario?.id,
                respostasQuestoes,
            });

            navigate('/obrigado');
        } catch (err) {
            setError('Erro ao enviar respostas. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {questionario?.titulo}
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                    Por favor, responda todas as questões com atenção. Suas respostas são muito importantes para nós.
                </Typography>
                <Typography variant="body1" paragraph>
                    {questionario?.descricao}
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    {questionario?.questoes.map((questaoQuestionario) => (
                        <FormControl
                            key={questaoQuestionario.id}
                            component="fieldset"
                            sx={{ mb: 3, width: '100%' }}
                        >
                            <FormLabel component="legend">
                                {questaoQuestionario.questao.texto}
                            </FormLabel>
                            {questaoQuestionario.questao.tipo === 'MULTIPLA_ESCOLHA' ? (
                                <RadioGroup
                                    value={respostas[questaoQuestionario.questaoId] || ''}
                                    onChange={(e) =>
                                        setRespostas({
                                            ...respostas,
                                            [questaoQuestionario.questaoId]: e.target.value,
                                        })
                                    }
                                >
                                    {questaoQuestionario.questao.opcoes.map((opcao) => (
                                        <FormControlLabel
                                            key={opcao.id}
                                            value={opcao.texto}
                                            control={<Radio />}
                                            label={opcao.texto}
                                        />
                                    ))}
                                </RadioGroup>
                            ) : (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={respostas[questaoQuestionario.questaoId] || ''}
                                    onChange={(e) =>
                                        setRespostas({
                                            ...respostas,
                                            [questaoQuestionario.questaoId]: e.target.value,
                                        })
                                    }
                                />
                            )}
                        </FormControl>
                    ))}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        disabled={submitting}
                    >
                        {submitting ? 'Enviando...' : 'Enviar Respostas'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ResponderQuestionario; 