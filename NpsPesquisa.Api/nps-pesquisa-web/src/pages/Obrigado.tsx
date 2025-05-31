import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Obrigado: React.FC = () => {
    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main' }} />
                </Box>
                <Typography variant="h4" gutterBottom>
                    Obrigado!
                </Typography>
                <Typography variant="body1" paragraph>
                    Suas respostas foram registradas com sucesso.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Agradecemos sua participação.
                </Typography>
            </Paper>
        </Container>
    );
};

export default Obrigado; 