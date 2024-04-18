import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Cleanup function to disconnect socket when component unmounts
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Function to handle payment request
  const handlePayment = async () => {
    // Dynamically import socket.io-client
    const io = await import('socket.io-client');
    const newSocket = io.default('http://localhost:8080', {
      query: { userName: "Tousif" }
    });
    setSocket(newSocket);

    // Event listener for 'paymentStatus' event
    newSocket.on('paymentStatus', ({  success }) => {
      // Check if the received paymentId matches the current paymentId
       if (success === true) { 
        toast.success('Payment successful');
      } else {
        toast.error('Payment failed');
      }
    });

    // Make the payment request to the backend
    fetch('http://localhost:8080/randompay/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentId: '12345', // Replace with your payment ID
        amount: 100, // Replace with your payment amount
        userName: "Tousif",
      })
    })
      .catch(error => {
        console.error('Error making payment:', error);
      })
      .finally(() => {
        // Turn off the socket connection after receiving the response
        newSocket.disconnect();
        setSocket(null); // Clear socket state
      });
  };
  // Function to handle input change for username
  return (<>
    <ToastContainer />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Welcome to RandomPay</h1>
      <button style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={handlePayment}>Make Payment</button>
    </div></>
  );
}

export default App;
