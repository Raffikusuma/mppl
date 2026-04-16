const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./database');
const reservationRoutes = require('./routes/reservations');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi database
initializeDB().then(() => {
    console.log('Database initialized');
}).catch(err => {
    console.error('Failed to initialize database:', err);
});

// Routes
app.use('/api/reservations', reservationRoutes);

// Route untuk admin page
app.get('/admin', (req, res) => {
    res.json({ 
        message: 'Admin API is running. Use frontend/admin.html to manage reservations.' 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log('=================================');
    console.log('✂️  BARBERSHOP RESERVATION SYSTEM');
    console.log('=================================');
    console.log(`📡 Backend: http://localhost:${PORT}`);
    console.log(`📊 API Docs:`);
    console.log(`   GET  /api/reservations     - Get all reservations`);
    console.log(`   POST /api/reservations     - Create reservation`);
    console.log(`   PUT  /api/reservations/:id - Update reservation`);
    console.log(`   DEL  /api/reservations/:id - Delete reservation`);
    console.log(`   GET  /admin                - Admin info`);
    console.log('=================================');
});