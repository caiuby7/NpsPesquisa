import React, { useState, ChangeEvent } from 'react';
import { Box, Button, TextField, Typography, Paper, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface CreateQuestionProps {
  initialData?: {
    id?: string;
    question?: string;
    type?: string;
    required?: boolean;
  };
  isEditing?: boolean;
}

export const CreateQuestion: React.FC<CreateQuestionProps> = ({
  initialData,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const [questionData, setQuestionData] = useState({
    question: initialData?.question || '',
    type: initialData?.type || 'text',
    required: initialData?.required || false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement question submission logic
    console.log('Question submitted:', questionData);
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuestionData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: SelectChangeEvent<string>) => {
    setQuestionData(prev => ({ ...prev, type: e.target.value }));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Edit Question' : 'Create New Question'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Question"
            name="question"
            value={questionData.question}
            onChange={handleTextChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Question Type</InputLabel>
            <Select
              value={questionData.type}
              label="Question Type"
              onChange={handleTypeChange}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="select">Select</MenuItem>
              <MenuItem value="radio">Radio</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              {isEditing ? 'Save Changes' : 'Create Question'}
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

export default CreateQuestion; 
