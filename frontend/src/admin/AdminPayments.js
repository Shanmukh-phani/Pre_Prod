import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Typography,
  Box,
  Chip,
  Skeleton,
  AppBar,
  IconButton,
  InputAdornment,
  TextField,
  Tabs,
  Tab,
  ListItem,
  List
} from '@mui/material';
// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/system';
import { ArrowBack } from '@mui/icons-material';
import profileImage from '../assets/buddie.jpg';
import { useNavigate } from 'react-router-dom';
import Header_sub from '../Header_sub';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import UnpaidBuddiesList from './UnpaidBuddies';
import CloseIcon from '@mui/icons-material/Close';
import notFound from '../assets/notFound.png';
import AddPaymentPage from './AddPayment';
import Avatar from 'react-avatar';
// import { DataTable, Column } from 'primereact/datatable';


const HeaderContainer = styled(Box)({


  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 4,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  padding: '14px 16px',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  zIndex: 1000,
});

const StayText = styled(Typography)({
  fontFamily: '"Sofia", sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'orange',
});

const BuddieText = styled(Typography)({
  fontFamily: '"Sofia", sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
});

const ProfileIcon = styled(IconButton)({
  borderRadius: '50%',
  backgroundColor: '#ddd',
  width: '40px',
  height: '40px',
});

const LocationChip1 = styled(Chip)({

  // marginTop: '15px',
  fontFamily: 'Anta',
  fontSize: '18px',
  textAlign: 'center',
  // backgroundColor:'#f0c674'
});


const statusColors = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
};

const AdminPayments = ({ socket }) => {




  const navigate = useNavigate(); // Initialize navigate function

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  const [search, setSearch] = useState('');


  const [filters, setFilters] = useState({
    global: { value: null, matchMode: 'contains' },
    buddie: { value: null, matchMode: 'contains' },
    amount: { value: null, matchMode: 'contains' },
    status: { value: null, matchMode: 'contains' },
  });


  const [paymentRequests, setPaymentRequests] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [acceptedPayments, setAcceptedPayments] = useState([]);
  const [pagePending, setPagePending] = useState(0);
  const [rowsPerPagePending, setRowsPerPagePending] = useState(3);
  const [pageAccepted, setPageAccepted] = useState(0);
  const [rowsPerPageAccepted, setRowsPerPageAccepted] = useState(3);
  const [loading, setLoading] = useState(true);
  const [buddieNames, setBuddieNames] = useState({}); // Object to store buddie names

  const [value, setValue] = useState(0); // State to control the active tab



  const token = localStorage.getItem('authToken');
  const hostelId = localStorage.getItem('hostel_id');


  // const fetchBuddieName = async (buddieId) => {
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_URL}/admin/buddieName/${buddieId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     return response.data.name;
  //   } catch (error) {
  //     // console.error('Error fetching buddie name:', error);
  //     return 'Unknown'; // Fallback value
  //   }
  // };



  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/admin/payments/hostel/${hostelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payments = response.data;

      setPaymentRequests((prevRequests) => [...prevRequests, payments]);
      // setPaymentRequests(payments);

      // Fetch names for all unique buddie_ids
      // const buddieIds = [...new Set(payments.map(payment => payment.buddie_id))];
      // const names = await Promise.all(
      //   buddieIds.map(async (buddieId) => {
      //     const name = await fetchBuddieName(buddieId);
      //     return { id: buddieId, name };
      //   })
      // );

      // const buddieNameMap = names.reduce((acc, { id, name }) => {
      //   acc[id] = name;
      //   return acc;
      // }, {});

      // setBuddieNames(buddieNameMap);

      setPendingPayments(payments.filter(payment => payment.status === 'pending'));
      setAcceptedPayments(payments.filter(payment => payment.status === 'accepted' || payment.status === 'rejected'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments', error);
      // toast.error('Error fetching payments');
      setLoading(false);
    }
  };
  useEffect(() => {
    if (hostelId && token) {
      fetchPayments();
    }
  }, [hostelId, token]);
  // useEffect(() => {
  //   if (hostelId && token) {
  //     fetchPayments();

  //   }
  // }, [hostelId, token]);

  const acceptPayment = async (paymentId) => {
    try {
      await axios.put(`${process.env.REACT_APP_URL}/admin/payments/${paymentId}/accept`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // toast.success('Payment accepted!');
      fetchPayments(); // Refresh payment requests after acceptance
    } catch (error) {
      console.error('Error accepting payment', error);
      // toast.error('Error accepting payment');
    }
  };


  const rejectPayment = async (paymentId) => {
    try {
      // Send a PUT request to change the payment status to 'rejected'
      await axios.put(`${process.env.REACT_APP_URL}/admin/payments/${paymentId}/reject`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Success message
      // toast.success('Payment rejected successfully!');

      // Refresh the payments list after rejection
      fetchPayments(); // Call your function to fetch updated payments
    } catch (error) {
      console.error('Error rejecting payment:', error);
      // toast.error('Error rejecting payment');
    }
  };

  const handleChangePagePending = (event, newPage) => {
    setPagePending(newPage);
  };

  const handleChangeRowsPerPagePending = (event) => {
    setRowsPerPagePending(parseInt(event.target.value, 10));
    setPagePending(0);
  };

  const handleChangePageAccepted = (event, newPage) => {
    setPageAccepted(newPage);
  };

  const handleChangeRowsPerPageAccepted = (event) => {
    setRowsPerPageAccepted(parseInt(event.target.value, 10));
    setPageAccepted(0);
  };



  const handleOpenSearchPage = () => {
    navigate('/admin/search-payments');
  };




  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };



  // useEffect(() => {
  //   socket?.on("paymentRequest", (data) => {


  //     setPaymentRequests([...paymentRequests, data]);

  //     // Fetch names for all unique buddie_ids
  //     const buddieIds = [...new Set(payments.map(payment => payment.buddie_id))];
  //     const names = await Promise.all(
  //       buddieIds.map(async (buddieId) => {
  //         const name = await fetchBuddieName(buddieId);
  //         return { id: buddieId, name };
  //       })
  //     );

  //     const buddieNameMap = names.reduce((acc, { id, name }) => {
  //       acc[id] = name;
  //       return acc;
  //     }, {});

  //     setBuddieNames(buddieNameMap);

  //     setPendingPayments(payments.filter(payment => payment.status === 'pending'));
  //     setAcceptedPayments(payments.filter(payment => payment.status === 'accepted'));


  //   });
  // }, [socket]);


  useEffect(() => {
    if (socket) {
      socket.on("paymentRequest", async (data) => {
        // Update payment requests state with the new data
        setPaymentRequests((prevRequests) => [...prevRequests, data]);

        // Extract unique buddy IDs from the payments
        const payments = [...paymentRequests, data];
        // const buddieIds = [...new Set(payments.map((payment) => payment.buddie_id))];

        // // Fetch names for all unique buddie_ids
        // const fetchBuddieNames = async (ids) => {
        //   const names = await Promise.all(
        //     ids.map(async (buddieId) => {
        //       const name = await fetchBuddieName(buddieId); // Assume fetchBuddieName is defined elsewhere
        //       return { id: buddieId, name };
        //     })
        //   );
        //   return names.reduce((acc, { id, name }) => {
        //     acc[id] = name;
        //     return acc;
        //   }, {});
        // };

        // const buddieNameMap = await fetchBuddieNames(buddieIds);

        // Update state with buddy names
        // setBuddieNames((prevNames) => ({
        //   ...prevNames,
        //   ...buddieNameMap,
        // }));

        // Separate payments into pending and accepted statuses
        const pending = payments.filter((payment) => payment.status === "pending");
        const accepted = payments.filter((payment) => payment.status === "accepted");

        setPendingPayments(pending);
        setAcceptedPayments(accepted);
      });

      // Cleanup listener on unmount
      return () => {
        socket.off("paymentRequest");
      };
    }
  }, [socket, paymentRequests]);



const handleAddPayment = (payment) => {
  // console.log(payment);
  setAcceptedPayments((prevRequests) => [...prevRequests, payment]);
}


  return (


    <Box p={3}>
      <Header_sub />




      <Box onClick={handleOpenSearchPage} sx={{ cursor: 'pointer', marginTop: '80px' }} >
        <TextField
          fullWidth
          label="Search Payments"
          variant="outlined"
          // disabled
          // onClick={handleOpenSearchPage}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <AddPaymentPage handleAddPayment={handleAddPayment} />



      <Tabs value={value} onChange={handleChangeTab} aria-label="Payment Tabs" centered style={{ marginTop: '50px' }}>
        <Tab label="Requests" />
        <Tab label="Payments" />
      </Tabs>




      <Box role="tabpanel" hidden={value !== 0}>

        <Box sx={{ mb: 4, mt: 3 }}>
          {pendingPayments.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                // height: 300,
              }}
            >
              <img
                src={notFound}
                alt="No Data Found"
                style={{ width: '200px', height: 'auto' }}
              />
              <Typography variant="h6" color="textSecondary">
                No Data Found
              </Typography>
            </Box>
          ) : (
            <List
              sx={{
                bgcolor: 'background.paper',
                // borderRadius: 3,
                // boxShadow: 3,
                overflow: 'hidden',
                p: 0,
              }}
            >
              {pendingPayments.map((payment) => (
                <ListItem
                  key={payment._id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    borderBottom: '1px solid #f0f0f0',
                    p: 2,
                    '&:hover': {
                      backgroundColor: '#f9f9f9',
                    },
                  }}
                >
                  {/* Top Row: Buddie Name */}
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {payment.buddie_name || 'Unknown'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: 12 }}
                    >
                     {new Date(payment.date).toISOString().slice(0, 10)}
                    </Typography>
                  </Box>

                  {/* Middle Row: Payment Details */}
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      ₹{payment.amount} | {payment.month}
                    </Typography>
                    <Chip
                      label={payment.status}
                      size="small"
                      color={statusColors[payment.status]}
                    />
                  </Box>

                  {/* Bottom Row: Actions */}
                  {/* <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => acceptPayment(payment._id)}
                      sx={{
                        backgroundColor: 'green',
                        color: 'white',
                        '&:hover': { backgroundColor: '#FFB300' },
                        boxShadow: 1,
                        
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => rejectPayment(payment._id)}
                      sx={{
                        backgroundColor: 'tomato',
                        color: 'white',
                        '&:hover': { backgroundColor: '#E57373' },
                        boxShadow: 1,
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box> */}

                  <Box
sx={{
  display: 'flex',
  justifyContent: 'center',  // Center the buttons
  gap: 1,
  mt: 1,
  // width: '100%',  // Ensure full width for the container
}}
>
  <IconButton
    onClick={() => acceptPayment(payment._id)}
    sx={{
      backgroundColor: 'green',
      color: 'white',
      '&:hover': { backgroundColor: '#FFB300' },
      boxShadow: 1,
      width: '100%',   // Set width for square shape
      // height: 40,  // Set height for square shape
      borderRadius: 2,  // Optional: rounded corners
    }}
  >
    <CheckIcon />
  </IconButton>
  <IconButton
    onClick={() => rejectPayment(payment._id)}
    sx={{
      backgroundColor: 'tomato',
      color: 'white',
      '&:hover': { backgroundColor: '#E57373' },
      boxShadow: 1,
      width: '100%',   // Set width for square shape
      // height: 40,  // Set height for square shape
      borderRadius: 2,  // Optional: rounded corners
    }}
  >
    <CloseIcon />
  </IconButton>
</Box>



                </ListItem>
              ))}
            </List>
          )}
        </Box>



      </Box>

      <Box role="tabpanel" hidden={value !== 1} mt={2}>

        <Box sx={{ mb: 4, mt: 3 }}>
          {acceptedPayments.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                // height: 300,
              }}
            >
              <img
                src={notFound}
                alt="No Data Found"
                style={{ width: '200px', height: 'auto' }}
              />
              <Typography variant="h6" color="textSecondary">
                No Data Found
              </Typography>
            </Box>
          ) : (
            <List
              sx={{
                bgcolor: 'background.paper',
                // borderRadius: 3,
                // boxShadow: 3,
                overflow: 'hidden',
                p: 0,
              }}
            >
              {acceptedPayments.map((payment) => (
                <ListItem
                  key={payment._id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1,
                    borderBottom: '1px solid #f0f0f0',
                    p: 2,
                    '&:hover': {
                      backgroundColor: '#f9f9f9',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {payment.buddie_name}
                    </Typography>
                    {/* <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: 12 }}
                    >
                      {payment.date}
                    </Typography> */}

{/* <Typography
  variant="body2"
  color="textSecondary"
  sx={{ fontSize: 12 }}
>
  {new Date(payment.date).toISOString().slice(0, 10)}
</Typography> */}

                  </Box>

                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      ₹{payment.amount} | {new Date(payment.date).toISOString().slice(0, 10)}
                    </Typography>
                    <Chip
                      label={payment.status}
                      size="small"
                      color={statusColors[payment.status]}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        






      </Box>

      
    </Box>
  );
};

export default AdminPayments;
