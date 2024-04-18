const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios'); // Import Axios for making HTTP requests


const app = express();
const server = http.createServer(app);

app.use(cors()); // Enable CORS for all routes

// Setup Socket.IO with the server instance
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'] // Adjust as needed
  }
});

app.use(express.json());

// Route to handle webhook events from RandomPay
app.post('/randompay/webhook', async (req, res) => {
    try {
        const event = req.body;
        console.log('Received webhook event:', event);

        // Process payment-related events
        if (event.type === 'payment_success' || event.type === 'payment_failure') {
            const { paymentId, type } = event;
            const success = type === 'payment_success';

            // Emit payment status update to Socket.IO clients
            io.emit('paymentStatus', { paymentId, success , message : 'Payment status updated' });
            console.log('Payment status updated frm webhook', {  success , message : 'Payment status updated' });
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error processing webhook event:', error);
        io.emit('paymentStatus', {  success : false , message : 'Payment status updated failed' });
        res.sendStatus(500);
    }
});

// Route to initiate a payment request
app.post('/randompay/pay', async (req, res) => {
    try {
        const { paymentId, amount, userName } = req.body;

        // Simulate processing payment asynchronously
        await processPayment(paymentId, amount);

        // Call the /randompay/webhook endpoint
        await axios.post('http://localhost:8080/randompay/webhook', {
            type: 'payment_success', // or 'payment_failure' depending on the outcome of the payment
            paymentId: paymentId
        });

        // Emit event to the client indicating payment success
        io.to(userName).emit('paymentSuccess', { paymentId });
        res.status(200).send('Payment successful');
    } catch (error) {
        await axios.post('http://localhost:8080/randompay/webhook', {
            type: 'payment_failure',
        })
        // Emit event to the client indicating payment failure
        res.status(400).send('Payment failed');
    }
});

// Simulated function to process payment request
function processPayment(paymentId, amount) {
    return new Promise((resolve, reject) => {
        // Simulate processing time
        setTimeout(() => {
            // Simulate success or failure randomly
            const success = Math.random() < 0.8; // 80% chance of success
            if (success) {
                resolve(); // Payment successful
            } else {
                reject(new Error('Payment failed'));
            }
        }, 3000); // Simulate 3 seconds processing time
    });
}

// Socket.IO connection handler
io.on('connection', socket => {
    const userName = socket.handshake.query.userName;
    console.log(`User connected: ${userName}`);

    // Join a room based on userName if needed
    if (userName) {
        socket.join(userName);

        // Handle disconnect event
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userName}`);
        });
    } else {
        console.log(`User disconnected due to missing userName`);
        socket.disconnect(true); // Disconnect socket if userName is missing
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
