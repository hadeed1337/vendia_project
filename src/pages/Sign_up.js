import * as React from 'react'
import { useState, useContext, useEffect } from 'react'
import { Button, CssBaseline, TextField, Link, Grid, Box, Typography, 
         Container, Alert, FormLabel, FormControlLabel, FormControl,
         RadioGroup, Radio, Select, MenuItem, InputLabel } from '@mui/material'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { Navigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import { Link as RouterLink } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../api/Firebase';
import '../components/Main.css';



const SignUp = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [org, setOrg] = useState('')
  const [accountType, setAccountType] = useState('Standard');
  const [redirectToHome, setRedirectToHome] = useState(false);
  const {orgs, fetchOrgs} = useContext(DataContext);

  useEffect(() => {
    fetchOrgs();
  } ,[])

  console.log(orgs);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword)  {
      return setError("Passwords do not match")
    }
    if (!email || !password || !firstName || !lastName || !org || !accountType) { 
      return setError("All Fields are Required")
    } 

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        org,
        accountType,
      })

      setRedirectToHome(true);
    }
    catch (error) {
      setError(error.message)
    }
    
  }

  if (redirectToHome) return <Navigate replace to="/Home" />

  const handleAccountTypeChange = (e) => {
    setAccountType(e.target.value);
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
            Sign up
          </Typography>
         {error && <Alert severity='error'>{error}</Alert>}
          <Box component="form" onSubmit={handleSignUp} noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={{ input: { color: 'white'},}}
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={{ input: { color: 'white'},}}
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  sx={{ input: { color: 'white'},}}
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  sx={{ input: { color: 'white'},}}
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  sx={{ input: { color: 'white'},}}
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Organization</InputLabel>
                  <Select
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                  >
                    {orgs.map((orgItem) => (
                      <MenuItem key={orgItem._id} value={orgItem.OrgName}>
                        {orgItem.OrgName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" >
                  <FormLabel component="legend" sx={{ color: 'white', marginRight: 2, alignSelf: 'center' }}>Account Type</FormLabel>
                    <RadioGroup
                      row
                      aria-label="account-type"
                      name="accountType"
                      defaultValue="Standard"
                      value={accountType}
                      onChange={handleAccountTypeChange}
                    >
                      <FormControlLabel value="Admin" control={ <Radio sx={{ color: 'white' }} /> } label="Admin"/>
                      <FormControlLabel value="Standard" control={ <Radio sx={{ color: 'white' }} /> } label="Standard"/>
                    </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 3 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-start">
              <Grid item>
                <Link component={RouterLink} to="/Sign_in" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </div>
  )
}

export default SignUp