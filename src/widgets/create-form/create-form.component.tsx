import React, { useState, ChangeEvent } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface CreateFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
  };
  isEditing?: boolean;
}

export const CreateForm: React.FC<CreateFormProps> = ({ 
  initialData,
  isEditing = false 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Edit Form' : 'Create New Form'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Form Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              {isEditing ? 'Save Changes' : 'Create Form'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}; 