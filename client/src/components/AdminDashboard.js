import  { Component } from 'react';
import axios from 'axios';
import { Button ,Container,Box,Typography,TextField,
  Snackbar,
  Alert} from '@mui/material';
import { withNavigation } from './withNavigation';
import { blockBrowserBack } from "./BackButtonHelper";


class AdminDashboard extends Component {
    cleanupBackBlock = null;
    constructor(props) {
    super(props);
    this.state = {
    name: '',
    price: '',
    description: '',
    editRowId: null,
    menuItems: [],
    editedRow: {},
    snackbarOpen: false,
    snackbarMessage: "",
    snackbarSeverity: "success"

};

  this.handleSubmit = this.handleSubmit.bind(this);

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



componentDidMount() {
  axios.get('http://localhost:5000/api/data')
     .then(response => {
        this.setState({ menuItems: response.data }); // bind data to state
        console.error('data:', this.state.menuItems);
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
       this.cleanupBackBlock = blockBrowserBack(() => {
        alert("You can't go back from the Dashboard!");
      });
}

  componentWillUnmount() {
      if (this.cleanupBackBlock) this.cleanupBackBlock();
    }


handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

handleSubmit = () => {
if(!this.state.name || !this.state.price){
  alert('Name and Price are required fields.');
  return;
}
axios.post('http://localhost:5000/api/postdata', {
  name: this.state.name,
  price: parseFloat(this.state.price),
  description: this.state.description,
}, 
{
  headers: { 'Content-Type': 'application/json' }
})
 .then((response) => {
      console.log('Submitted successful:', response.data);
      this.showSnackbar('Submission successful!', 'success');
      // Optional: reset form fields
      this.setState({
        name: '',
        description: '',
        price: ''
      });
    })
    .catch((error) => {
      console.error('Submission failed:', error);
      const errMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      this.showSnackbar(errMsg, 'error');
    });
  };


  startEdit = (item) => {
    this.setState({ editingItem: { ...item } });
  };

  handleEditChange = (field, value) => {
    this.setState((prevState) => ({
      editingItem: {
        ...prevState.editingItem,
        [field]: value
      }
    }));
  };

 goBack = () => {
    this.props.navigate('/'); // Back to Home
  };

  goDashboard = () => {
    this.props.navigate('/dashboard'); // Navigate to Dashboard
  };

  cancelEdit = () => {
    this.setState({ editingItem: null });
  };

  render() {
    const { menuItems, newItem, editingItem, loading, error, data,editRowId, editedRow , showPassword, showConfirmPassword, errors, snackbarOpen,
      snackbarMessage,
      snackbarSeverity} = this.state;
  
    return (
     
      <div>
        <Container maxWidth="sm">
          <Box sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>
              📊 Admin Dashboard
            </Typography>
            <TextField
              label="Name"
              name="name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={this.state.name}
              onChange={this.handleChange}
            />
            <TextField
              label="Description"
              name="description"
              variant="outlined"
              fullWidth
              margin="normal"
              value={this.state.description}
              onChange={this.handleChange}
            />
            <TextField
              label="Price"
              name="price"
              variant="outlined"
              fullWidth
              margin="normal"
              type="number"
              value={this.state.price}
              onChange={this.handleChange}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleSubmit}
            >
              Submit
            </Button>
             {/* <Button
              variant="contained"
              color="primary"
              onClick={this.goBack}
              style={{ marginLeft: 8 }}
            >
              Back
            </Button> */}
            <Button
              variant="contained"
              color="primary"
              onClick={this.goDashboard}
              style={{ marginLeft: 8 }}
            >
              Dashboard
            </Button>
          </Box>

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

export default withNavigation(AdminDashboard);