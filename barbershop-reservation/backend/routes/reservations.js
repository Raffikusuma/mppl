const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET semua reservasi (untuk admin)
router.get('/', async (req, res) => {
    try {
        const reservations = await db.getAllReservations();
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// GET semua services
router.get('/services', async (req, res) => {
    try {
        const services = await db.getAllServices();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET reservasi by ID
router.get('/:id', async (req, res) => {
    try {
        const reservation = await db.getReservationById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reservation' });
    }
});

// POST buat reservasi baru
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, service, date, time, notes } = req.body;
        
        // Validasi input
        if (!name || !phone || !service || !date || !time) {
            return res.status(400).json({ 
                error: 'Name, phone, service, date, and time are required' 
            });
        }

        const newReservation = await db.createReservation({
            name,
            phone,
            email: email || null,
            service,
            date,
            time,
            notes: notes || null,
            status: 'pending'
        });
        
        res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            data: newReservation,
            booking_code: `BRS-${newReservation.id.toString().padStart(3, '0')}`
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// PUT update reservasi
router.put('/:id', async (req, res) => {
    try {
        const updated = await db.updateReservation(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        
        res.json({
            success: true,
            message: 'Reservation updated successfully',
            data: updated
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update reservation' });
    }
});

// DELETE hapus reservasi
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await db.deleteReservation(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        
        res.json({
            success: true,
            message: 'Reservation deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete reservation' });
    }
});

// PATCH update status reservasi
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const updated = await db.updateReservation(req.params.id, { status });
        if (!updated) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        
        res.json({
            success: true,
            message: `Status updated to ${status}`,
            data: updated
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;