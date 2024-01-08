import * as React from 'react'
import { useState, useContext } from 'react';
import { Alert, Button, CssBaseline, TextField, Link, Grid, 
         Box, Typography, Container } from '@mui/material'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { auth } from '../api/Firebase'; 
import '../components/Main.css';

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const {setUser, currentUser} = useContext(AuthContext);
  const loggedIn = localStorage.getItem('loggedIn');

  const handleSignIn = async (e) => {
    e.preventDefault()

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      if (user) {
        setUser(user);
        localStorage.setItem('loggedIn', 'true');
      }
    } 
    catch (error) {
      setError(error.message)
      localStorage.setItem('loggedIn', 'false')
    }


  }

  if (currentUser && loggedIn === 'true') {
    return <Navigate to="/Home" />
  }

  return (
    <div className="white-outline-form">
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }} 
        >
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {error && <Alert severity='error'>{error}</Alert>}
          <Box component="form" onSubmit={handleSignIn} noValidate sx={{ mt: 1 }}>
            <TextField
              sx={{ input: { color: 'white'},}}
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              sx={{ input: { color: 'white'},}}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/Forgot_password" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/Sign_up" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </div>
  )
}

export default SignIn