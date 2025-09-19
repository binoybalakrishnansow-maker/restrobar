import React, { Component } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
  InputAdornment,
  Snackbar,
  Alert
} from "@mui/material";
import { Email, Lock, Phone, VpnKey } from "@mui/icons-material";
import axios from "axios";
import { withNavigation } from "./withNavigation";

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      email: "",
      password: "",
      mobileOrEmail: "",
      otp: "",
      snackbarOpen: false,
      snackbarMessage: "",
      snackbarSeverity: "success",
    };
  }

  handleTabChange = (event, newValue) => {
    this.setState({ tabValue: newValue, otp: "", mobileOrEmail: "" });
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // Normal Login
  handleLogin = () => {
    const { email, password } = this.state;
    fetch('http://localhost:5000/api/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        return data;
      })
      .then((data) => {
        localStorage.setItem("token", data.token);
        this.showSnackbar("Login successful", "success");
        setTimeout(() => {
          this.props.navigate("/admindashboard");
        }, 1000);
      })
      .catch((err) => {
        this.showSnackbar(err.message || "Server error", "error");
      });
  };

  // Request OTP
  requestOtp = async () => {
    debugger;
    try {
      const res = await axios.post('http://localhost:5000/api/requestotp', {
        mobileOrEmail: this.state.mobileOrEmail,
      });
      this.showSnackbar(res.data.message, "success");
    } catch (err) {
      this.showSnackbar("Failed to send OTP", "error");
    }
  };

  // Verify OTP
  verifyOtp = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/verify-otp', {
        mobileOrEmail: this.state.mobileOrEmail,
        otp: this.state.otp,
      });
      this.showSnackbar(res.data.message, "success");
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setTimeout(() => {
          this.props.navigate("/admindashboard");
        }, 1000);
      }
    } catch (err) {
      this.showSnackbar("Invalid OTP", "error");
    }
  };

  handleRegister = () => {
    this.props.navigate("/register");
  };

  showSnackbar = (message, severity) => {
    this.setState({
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity,
    });
  };

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  };

  render() {
    const { email, password, snackbarOpen, snackbarMessage, snackbarSeverity } =
      this.state;

    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 5, p: 2 }}>
          <CardContent>
            <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
              Welcome Back
            </Typography>

            <Tabs
              value={this.state.tabValue}
              onChange={this.handleTabChange}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="Sign In" />
              <Tab label="OTP Login" />
            </Tabs>

            {/* Email/Password Login */}
            {this.state.tabValue === 0 && (
              <Box>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={email}
                  onChange={this.handleChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  name="password"
                  value={password}
                  onChange={this.handleChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, borderRadius: 2 }}
                  onClick={this.handleLogin}
                >
                  Login
                </Button>
              </Box>
            )}

            {/* OTP Login */}
            {this.state.tabValue === 1 && (
              <Box>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Mobile / Email"
                      name="mobileOrEmail"
                      value={this.state.mobileOrEmail}
                      onChange={this.handleChange}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: "gray" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={this.requestOtp}
                      fullWidth
                      size="small"
                      sx={{ height: "40px" }}
                    >
                      Send OTP
                    </Button>
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Enter OTP"
                  name="otp"
                  value={this.state.otp}
                  onChange={this.handleChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKey sx={{ color: "gray" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, borderRadius: 2 }}
                  onClick={this.verifyOtp}
                >
                  Verify OTP
                </Button>
              </Box>
            )}

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, cursor: "pointer", color: "primary.main" }}
              onClick={this.handleRegister}
            >
              Don’t have an account? Register here
            </Typography>
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
    );
  }
}

export default withNavigation(LoginPage);
