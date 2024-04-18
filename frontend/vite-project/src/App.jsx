import { useState, useEffect } from 'react';

function App() {
  const [paymentStatus, setPaymentStatus] = useState('');
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
    newSocket.on('paymentStatus', ({ paymentId, success }) => {
      // Check if the received paymentId matches the current paymentId
      if (paymentId === paymentId) {
        setPaymentStatus(success ? 'Payment Successful' : 'Payment Failed');
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
      .then(response => {
        if (!response.ok) {
          setPaymentStatus('Payment Failed');
        }
      })
      .catch(error => {
        console.error('Error making payment:', error);
        setPaymentStatus('Payment Failed');
      })
      .finally(() => {
        // Turn off the socket connection after receiving the response
        newSocket.disconnect();
        setSocket(null); // Clear socket state
      });
  };
  // Function to handle input change for username
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Welcome to RandomPay</h1>
      <button style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={handlePayment}>Make Payment</button>
      {paymentStatus && <p style={{ fontSize: '16px', marginTop: '20px', color: paymentStatus === 'Payment Successful' ? 'green' : 'red' }}>{paymentStatus}</p>}
    </div>

  );
}

export default App;
