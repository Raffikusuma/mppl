const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, 'data.json');

// Data awal
const initialData = {
    reservations: [
        {
            id: 1,
            name: "John Doe",
            phone: "08123456789",
            email: "john@example.com",
            service: "Haircut",
            date: "2024-01-15",
            time: "10:00",
            notes: "Potong pendek",
            status: "confirmed",
            createdAt: "2024-01-10T08:30:00Z"
        }
    ],
    services: [
        { id: 1, name: "Haircut", price: 50000, duration: "30 min" },
        { id: 2, name: "Beard Trim", price: 30000, duration: "20 min" },
        { id: 3, name: "Hair Wash", price: 25000, duration: "15 min" },
        { id: 4, name: "Premium Package", price: 100000, duration: "60 min" }
    ]
};

// Inisialisasi database
async function initializeDB() {
    try {
        await fs.access(dbPath);
        console.log('Database file exists');
    } catch {
        console.log('Creating new database file...');
        await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2));
    }
}

// Baca database
async function readDB() {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return initialData;
    }
}

// Tulis database
async function writeDB(data) {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// CRUD Operations untuk Reservations
const db = {
    // CREATE - Tambah reservasi baru
    async createReservation(reservationData) {
        const db = await readDB();
        const newId = db.reservations.length > 0 
            ? Math.max(...db.reservations.map(r => r.id)) + 1 
            : 1;
        
        const newReservation = {
            id: newId,
            ...reservationData,
            status: reservationData.status || 'pending',
            createdAt: new Date().toISOString()
        };
        
        db.reservations.push(newReservation);
        await writeDB(db);
        return newReservation;
    },

    // READ - Ambil semua reservasi
    async getAllReservations() {
        const db = await readDB();
        return db.reservations;
    },

    // READ - Ambil reservasi by ID
    async getReservationById(id) {
        const db = await readDB();
        return db.reservations.find(r => r.id === parseInt(id));
    },

    // UPDATE - Update reservasi
    async updateReservation(id, updateData) {
        const db = await readDB();
        const index = db.reservations.findIndex(r => r.id === parseInt(id));
        
        if (index === -1) return null;
        
        db.reservations[index] = {
            ...db.reservations[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        await writeDB(db);
        return db.reservations[index];
    },

    // DELETE - Hapus reservasi
    async deleteReservation(id) {
        const db = await readDB();
        const initialLength = db.reservations.length;
        
        db.reservations = db.reservations.filter(r => r.id !== parseInt(id));
        
        if (db.reservations.length < initialLength) {
            await writeDB(db);
            return true;
        }
        return false;
    },

    // Ambil semua services
    async getAllServices() {
        const db = await readDB();
        return db.services;
    }
};

module.exports = { initializeDB, db };