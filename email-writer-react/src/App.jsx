import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Container, TextField, Typography, Box, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/email/generate', {emailContent, tone});
      setGeneratedReply(response?.data || JSON.stringify(response?.data));
    } catch (error) {
      setError("error occurred !");
      console.log(error);
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant='h3' component='h1' gutterBottom>
        Email Reply generator
      </Typography>

      <Box sx={{ mx: 3 }}>
        <TextField fullWidth multiline rows={6} variant='outlined' value={emailContent || ''} label={'Original email content'}
          onChange={(e) => setEmailContent(e.target.value)} sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>
            Tone
          </InputLabel>
          <Select
            value={tone}
            label={'Tone of email'}
            onChange={(e) => setTone(e.target.value)}>
            <MenuItem value="">None</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
            <MenuItem value="funny">Funny</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!emailContent || loading}
          fullWidth>
          {loading ? <CircularProgress size={24} /> : "generate Reply"}
        </Button>
      </Box>

      {error ?
        <Typography color='error' sx={{mb:2}}>
          {error}
        </Typography>
        :
        null}

        {generatedReply && (
          <Box>
          <Typography variant='h6' gutterBottom>
           Generated Reply
          </Typography> 
          <TextField
            fullWidth
            multiline
            rows={6}
            value={generatedReply || ""}
            variant='outlined'
            inputProps={{readOnly: true}}
          />
          <Button
          variant='outlined'
          sx={{mt: 2}}
          onClick={() => navigator.clipboard.writeText(generatedReply)}>
            Copy to clipboard
          </Button>

          </Box>

        )}

    </Container>
  )
}

export default App
