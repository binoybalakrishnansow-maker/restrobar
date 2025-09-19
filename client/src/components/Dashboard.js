import { Component } from 'react';
import axios from 'axios';
import {
  Button, Container, Box, TextField,
  Grid, Card, CardContent, Typography,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,TablePagination,TableSortLabel,InputAdornment
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { withNavigation } from './withNavigation';
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { blockBrowserBack } from "./BackButtonHelper";

class Dashboard extends Component {
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
      chartData: [],
      searchQuery: "",
      order: "asc",
      orderBy: "name",
      page: 0,
      rowsPerPage: 5,
      filterGroup: "All",
      
    };
  }

  componentDidMount() {
    axios.get('http://localhost:5000/api/data')
      .then(response => {
        const menuItems = response.data;
        const chartData = this.getChartData(menuItems);
        this.setState({ menuItems, chartData });
        console.log(menuItems);
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });

        this.cleanupBackBlock = blockBrowserBack(() => {
      // alert("You can't go back from the Dashboard!");
    });
  }
   componentWillUnmount() {
    if (this.cleanupBackBlock) this.cleanupBackBlock();
  }
  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      editedRow: {
        ...prevState.editedRow,
        [name]: value
      }
    }));
  };

  getChartData = (menuItems) => {
    if (!Array.isArray(menuItems)) return [];
    return menuItems.map(item => ({
      name: item.Name,
      value: item.Price
    }));
  };

  handleEdit = (row) => {
    this.setState({
      editRowId: row.ItemID,
      editedRow: { ...row }
    });
  };

  handleCancel = () => {
    this.setState({ editRowId: null, editedRow: {} });
  };

  gogenerateQR = () => {
    this.props.navigate("/generateQR");
  };

  goBack = () => {
     this.props.navigate("/admindashboard");
  };

  handleSave = (editRowId) => {
    axios.put(`http://localhost:5000/api/items/${editRowId}`)
      .then(res => {
        alert(res.data.message || 'Item updated successfully');
        this.setState(prevState => {
          const updatedItems = prevState.menuItems.filter(item => item.ItemID !== editRowId);
          return {
            menuItems: updatedItems,
            editRowId: null,
            editedRow: {}
          };
        });
      })
      .catch(err => {
        console.error('Update error:', err);
        alert('Failed to update item.');
      });
  };

  deleteItem = (id) => {
    axios.delete(`http://localhost:5000/api/items/${id}`)
      .then(res => {
        alert(res.data.message || 'Item deleted');
        this.setState(prevState => {
          const filtered = prevState.menuItems.filter(item => item.ItemID !== id);
          return {
            menuItems: filtered,
            chartData: this.getChartData(filtered)
          };
        });
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert("Failed to delete item.");
      });
  };

  handleAddNewItem = () => {
    this.props.navigate('/admindashboard'); // Back to Home
  };
  handleSearchChange = (event) => {
    debugger;
    this.setState({ searchQuery: event.target.value, page: 0 });
  };

  handleFilterChange = (event) => {
    this.setState({ filterGroup: event.target.value, page: 0 });
  };

  handleRequestSort = (property) => {
    const isAsc = this.state.orderBy === property && this.state.order === "asc";
    this.setState({ order: isAsc ? "desc" : "asc", orderBy: property });
  };

  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0 });
  };

  

  getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => this.descendingComparator(a, b, orderBy)
      : (a, b) => -this.descendingComparator(a, b, orderBy);
  };

  descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };
// Inside class Dashboard
getFilteredRows = () => {
  const { menuItems, searchQuery, filterGroup, order, orderBy } = this.state;

  let rows = [...menuItems];

  // 1. Filter by search text
  if (searchQuery.trim()) {
    rows = rows.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }

  // 2. Filter by group
  if (filterGroup !== "All") {
    debugger;
    rows = rows.filter(row => row.Name === filterGroup);
  }

  // 3. Sort
  rows.sort(this.getComparator(order, orderBy));

  return rows;
};

 

  renderTable() {
  const { editRowId, editedRow, order, orderBy, page, rowsPerPage, searchQuery, filterGroup } = this.state;

  const filteredRows = this.getFilteredRows();
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container style={{ marginTop: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Advanced MUI Table (Class Component)
      </Typography>

      {/* Search + Filter */}
      <Grid container spacing={2} style={{ marginBottom: "15px" }}>
        <Grid item xs={12} sm={6}>
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={searchQuery}
            onChange={this.handleSearchChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Filter by Group</InputLabel>
            <Select value={filterGroup} onChange={this.handleFilterChange} label="Filter by Group">
              <MenuItem value="All">All</MenuItem>
              {Array.from(new Set(this.state.menuItems.map(item => item.Name))).map((group, index) => (
                <MenuItem key={index} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'Name'}
                  direction={orderBy === 'Name' ? order : "asc"}
                  onClick={() => this.handleRequestSort('Name')}
                >
                  <strong>Item Name</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'Price'}
                  direction={orderBy === 'Price' ? order : "asc"}
                  onClick={() => this.handleRequestSort('Price')}
                >
                  <strong>Price (₹)</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'Description'}
                  direction={orderBy === 'Description' ? order : "asc"}
                  onClick={() => this.handleRequestSort('Description')}
                >
                  <strong>Description</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow key={row.ItemID} sx={{ backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                <TableCell>
                  {editRowId === row.ItemID ? (
                    <TextField name="Name" value={editedRow.Name || ''} onChange={this.handleChange} size="small" />
                  ) : row.Name}
                </TableCell>
                <TableCell>
                  {editRowId === row.ItemID ? (
                    <TextField name="Price" type="number" value={editedRow.Price || ''} onChange={this.handleChange} size="small" />
                  ) : `₹${row.Price}`}
                </TableCell>
                <TableCell>
                  {editRowId === row.ItemID ? (
                    <TextField name="Description" value={editedRow.Description || ''} onChange={this.handleChange} size="small" />
                  ) : row.Description}
                </TableCell>
                <TableCell>
                  {editRowId === row.ItemID ? (
                    <>
                      <Button variant="contained" color="success" onClick={() => this.handleSave(row.ItemID)} size="small">Save</Button>
                      <Button variant="outlined" onClick={this.handleCancel} size="small" sx={{ ml: 1 }}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="contained" onClick={() => this.handleEdit(row)} size="small" color="primary" sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" /> Edit
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => this.deleteItem(row.ItemID)} size="small">
                        <DeleteIcon fontSize="small" /> Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        onPageChange={this.handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={this.handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Container>
  );
}

  renderBarChart() {
    const { chartData } = this.state;
    return (
      <ResponsiveContainer width={500} height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Price ₹', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#4a90e2" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  render() {
    return (
      <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', py: 5 }}>
        <Container>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
            Restaurant Dashboard
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {this.renderTable()}
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Menu Item Price Bar Chart
                  </Typography>
                  {this.renderBarChart()}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Container maxWidth="sm">
                <Box sx={{ mt: 5 }}>
                            
                               <Button
                                variant="contained"
                                color="primary"
                                onClick={this.goBack}
                                style={{ marginLeft: 8 }}
                              >
                                Back
                              </Button>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={this.gogenerateQR}
                                style={{ marginLeft: 8 }}
                              >
                                Generate QR Code
                              </Button>
                            </Box>
                  
                       
                          </Container>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }
}

export default withNavigation(Dashboard);

