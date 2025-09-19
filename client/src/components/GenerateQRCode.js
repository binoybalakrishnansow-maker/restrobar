// src/components/MenuQRCode.js
import React, { Component } from "react";
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import { withNavigation } from './withNavigation';
import { blockBrowserBack } from "./BackButtonHelper";

class MenuQRCode extends Component {
  cleanupBackBlock = null;
  constructor(props) {
    super(props);
    this.state = {
      // menuItems: [
      //   { id: 1, name: "Pasta Alfredo", price: 250 },
      //   { id: 2, name: "Chicken Burger", price: 180 },
      //   { id: 3, name: "Margherita Pizza", price: 300 },
      // ],
      menuItems: [],
      showQR: false,
    };
  }

    componentDidMount() {
      debugger;
    axios.get('http://localhost:5000/api/data')
      .then(response => {
        const menuItems = response.data;
        this.setState({ menuItems });
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
        this.cleanupBackBlock = blockBrowserBack(() => {
            // alert("You can't go back from the Dashboard!");
        });
  }

  generateQR = () => {
    this.setState({ showQR: true });
  };

  goBack = () => {
     this.props.navigate("/dashboard");
  };


  render() {

    const { menuItems, showQR } = this.state;
    console.log('Menu Items:',menuItems)
    const qrData = JSON.stringify(menuItems); // Convert table data to JSON

    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Menu Table with QR Code
          </Typography>

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Item ID</b></TableCell>
                <TableCell><b>Item Name</b></TableCell>
                <TableCell><b>Price (₹)</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.ItemID}>
                  <TableCell>{item.ItemID}</TableCell>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item.Price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Generate QR Button */}
                                      <Box sx={{ mt: 5 }}>
                                      
                                         <Button
                                          variant="contained"
                                          color="primary"
                                          onClick={this.generateQR}
                                          style={{ marginLeft: 8 }}
                                        >
                                          Generate QR Code
                                        </Button>
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          onClick={this.goBack}
                                          style={{ marginLeft: 8 }}
                                        >
                                          Back
                                        </Button>
                                      </Box>

          {/* QR Code Display */}
          {showQR && (
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="subtitle1" gutterBottom>
                Scan this QR Code to view menu data:
              </Typography>
              <QRCodeCanvas value={qrData} size={256} />
            </Box>
          )}
        </Paper>
      </Container>
    );
  }
}

export default withNavigation(MenuQRCode);
