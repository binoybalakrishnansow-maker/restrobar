import React, { Component } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from 'axios';
import { withNavigation } from "./withNavigation";
import { blockBrowserBack } from "./BackButtonHelper";


class Registration extends Component {
  cleanupBackBlock = null;
  state = {
    firstName: '',
    lastName: '',
    restaurantName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    errors: {},
    snackbarOpen: false,
    snackbarMessage: "",
    snackbarSeverity: "success"
  };

   componentDidMount() {
    this.cleanupBackBlock = blockBrowserBack(() => {
      alert("You can't go back from the Dashboard!");
    });
  }
   componentWillUnmount() {
    if (this.cleanupBackBlock) this.cleanupBackBlock();
  }

  showSnackbar = (message, severity) => {
    this.setState({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity
    });
  };

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  };


  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  togglePasswordVisibility = (field) => {
    this.setState((prevState) => ({ [field]: !prevState[field] }));
  };

  validateForm = () => {
    const { firstName, lastName, restaurantName, email, mobile, password, confirmPassword } = this.state;
    let errors = {};
    let isValid = true;

    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!restaurantName.trim()) {
      errors.restaurantName = 'Restaurant name is required';
      isValid = false;
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    if (!mobile.trim()) {
      errors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(mobile)) {
      errors.mobile = 'Mobile number must be 10 digits';
      isValid = false;
    }
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  };

  handleBack = () => {
    console.log("Navigating to Login Page...");
    this.props.navigate("/");
  };


  handleRegister = (e) => {
  e.preventDefault();

  if (this.validateForm()) {
    console.log('Form submitted:', this.state);

    axios.post(
      'http://localhost:5000/api/regpostdata',
      {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        restaurantName: this.state.restaurantName,
        email: this.state.email,
        mobile: this.state.mobile,
        password: this.state.password
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
    .then((response) => {
      console.log('Registration successful:', response.data);
      this.showSnackbar('Registration successful!', 'success');
      // Optional: reset form fields
      this.setState({
        firstName: '',
        lastName: '',
        restaurantName: '',
        email: '',
        mobile: '',
        password: ''
      });
    })
    .catch((error) => {
      console.error('Registration failed:', error);
      const errMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      this.showSnackbar(errMsg, 'error');
    });
  }
};


  render() {
    const {
      firstName, lastName, restaurantName, email, mobile,
      password, confirmPassword, showPassword, showConfirmPassword, errors, snackbarOpen,
      snackbarMessage,
      snackbarSeverity
    } = this.state;

    return (
      <div
        style={{
          minHeight: '100vh',
         // background: 'linear-gradient(135deg, #6D5BBA, #8D58BF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              color: '#130202ff',
              p: 2
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ fontWeight: 'bold', mb: 3 }}
              >
                <AppRegistrationIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Restaurant Registration
              </Typography>

              <form onSubmit={this.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={firstName}
                      onChange={this.handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={lastName}
                      onChange={this.handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Restaurant Name"
                      name="restaurantName"
                      value={restaurantName}
                      onChange={this.handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <StoreIcon />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.restaurantName}
                      helperText={errors.restaurantName}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      name="email"
                      value={email}
                      onChange={this.handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.email}
                      helperText={errors.email}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Mobile Number"
                      name="mobile"
                      value={mobile}
                      onChange={this.handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.mobile}
                      helperText={errors.mobile}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={this.handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => this.togglePasswordVisibility('showPassword')} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      error={!!errors.password}
                      helperText={errors.password}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={this.handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => this.togglePasswordVisibility('showConfirmPassword')} edge="end">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid container spacing={2} sx={{ mt: 3 }}>
                 <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                     sx={{
                        background: 'linear-gradient(90deg, #FF512F, #DD2476)',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: 3,
                        '&:hover': {
                          background: 'linear-gradient(90deg, #DD2476, #FF512F)'
                        }
                      }}
                    startIcon={<ArrowBackIcon />}
                    onClick={this.handleBack}
                  >
                    Back
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                     sx={{
                        background: 'linear-gradient(90deg, #FF512F, #DD2476)',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: 3,
                        '&:hover': {
                          background: 'linear-gradient(90deg, #DD2476, #FF512F)'
                        }
                      }}
                    startIcon={<AppRegistrationIcon />}
                    onClick={this.handleRegister}
                  >
                    Register
                  </Button>
                </Grid>
              </Grid>
                  
                </Grid>
              </form>
            </CardContent>
          </Card>

           <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={this.handleSnackbarClose}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  >
                    <Alert
                      onClose={this.handleSnackbarClose}
                      severity={snackbarSeverity}
                      variant="filled"
                    >
                      {snackbarMessage}
                    </Alert>
           </Snackbar>
                  
        </Container>
      </div>
    );
  }
}

export default withNavigation(Registration);
