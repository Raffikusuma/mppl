const API_URL = 'http://localhost:3000/api/reservations';
let allReservations = [];
let filteredReservations = [];

// Load all reservations
async function loadReservations() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch reservations');
        
        allReservations = await response.json();
        filteredReservations = [...allReservations];
        
        updateStats();
        renderReservations();
    } catch (error) {
        console.error('Error loading reservations:', error);
        document.getElementById('reservationsContainer').innerHTML = `
            <div class="no-data">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load reservations</h3>
                <p>${error.message}</p>
                <button onclick="loadReservations()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Update statistics
function updateStats() {
    const total = allReservations.length;
    const pending = allReservations.filter(r => r.status === 'pending').length;
    const confirmed = allReservations.filter(r => r.status === 'confirmed').length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = allReservations.filter(r => r.date === today).length;
    
    document.getElementById('statsContainer').innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${total}</div>
            <div class="stat-label">Total Reservations</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${pending}</div>
            <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${confirmed}</div>
            <div class="stat-label">Confirmed</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${todayCount}</div>
            <div class="stat-label">Today's Bookings</div>
        </div>
    `;
}

// Render reservations table
function renderReservations() {
    const container = document.getElementById('reservationsContainer');
    
    if (filteredReservations.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-calendar-times"></i>
                <h3>No reservations found</h3>
                <p>Try changing your filters or check back later.</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Booking Code</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredReservations.map(reservation => `
                    <tr>
                        <td><strong>BRS-${reservation.id.toString().padStart(3, '0')}</strong></td>
                        <td>${reservation.name}</td>
                        <td>${reservation.phone}</td>
                        <td>${reservation.service}</td>
                        <td>${reservation.date} ${reservation.time}</td>
                        <td><span class="status ${reservation.status}">${reservation.status}</span></td>
                        <td class="actions">
                            <button onclick="viewReservation(${reservation.id})" class="action-btn view-btn">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button onclick="editReservation(${reservation.id})" class="action-btn edit-btn">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="deleteReservation(${reservation.id})" class="action-btn delete-btn">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Filter reservations
function filterReservations() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    
    filteredReservations = allReservations.filter(reservation => {
        // Status filter
        if (statusFilter !== 'all' && reservation.status !== statusFilter) {
            return false;
        }
        
        // Date filter
        if (dateFilter && reservation.date !== dateFilter) {
            return false;
        }
        
        // Search filter
        if (searchFilter) {
            const searchStr = `${reservation.name} ${reservation.phone} ${reservation.service}`.toLowerCase();
            if (!searchStr.includes(searchFilter)) {
                return false;
            }
        }
        
        return true;
    });
    
    renderReservations();
}

// Clear all filters
function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('dateFilter').value = '';
    document.getElementById('searchFilter').value = '';
    filteredReservations = [...allReservations];
    renderReservations();
}

// Refresh reservations
function refreshReservations() {
    document.getElementById('reservationsContainer').innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Refreshing reservations...</p>
        </div>
    `;
    loadReservations();
}

// View reservation details
async function viewReservation(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch reservation');
        
        const reservation = await response.json();
        openModal(reservation, false);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Edit reservation
async function editReservation(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch reservation');
        
        const reservation = await response.json();
        openModal(reservation, true);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Open modal for view/edit
function openModal(reservation, isEdit = false) {
    const modal = document.getElementById('reservationModal');
    const form = document.getElementById('editForm');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = isEdit ? 'Edit Reservation' : 'View Reservation';
    
    // Fill form fields
    document.getElementById('editId').value = reservation.id;
    document.getElementById('editCode').value = `BRS-${reservation.id.toString().padStart(3, '0')}`;
    document.getElementById('editName').value = reservation.name;
    document.getElementById('editPhone').value = reservation.phone;
    document.getElementById('editEmail').value = reservation.email || '';
    document.getElementById('editService').value = reservation.service;
    document.getElementById('editDate').value = reservation.date;
    document.getElementById('editTime').value = reservation.time;
    document.getElementById('editStatus').value = reservation.status;
    document.getElementById('editNotes').value = reservation.notes || '';
    document.getElementById('editCreatedAt').value = new Date(reservation.createdAt).toLocaleString();
    
    // Make fields readonly if not editing
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.id !== 'editStatus') { // Status selalu bisa diubah
            input.readOnly = !isEdit;
        }
        input.disabled = !isEdit && input.id !== 'editStatus';
    });
    
    // Show/hide save button
    const saveButton = form.querySelector('button[type="submit"]');
    saveButton.style.display = isEdit ? 'block' : 'none';
    
    modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('reservationModal').style.display = 'none';
    document.getElementById('editForm').reset();
}

// Update reservation
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const updateData = {
        name: document.getElementById('editName').value,
        phone: document.getElementById('editPhone').value,
        email: document.getElementById('editEmail').value || null,
        service: document.getElementById('editService').value,
        date: document.getElementById('editDate').value,
        time: document.getElementById('editTime').value,
        status: document.getElementById('editStatus').value,
        notes: document.getElementById('editNotes').value || null
    };
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Reservation updated successfully!');
            closeModal();
            refreshReservations();
        } else {
            throw new Error(result.error || 'Failed to update reservation');
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

// Delete reservation
async function deleteReservation(id) {
    if (!confirm('Are you sure you want to delete this reservation? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Reservation deleted successfully!');
            refreshReservations();
        } else {
            throw new Error(result.error || 'Failed to delete reservation');
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadReservations();
    
    // Close modal when clicking outside
    document.getElementById('reservationModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('reservationModal')) {
            closeModal();
        }
    });
});