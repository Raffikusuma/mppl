const API_URL = 'http://localhost:3000/api/reservations';
let selectedTimeSlot = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadServices();
    generateTimeSlots();
    setupForm();
    setMinDate();
    prefillFromLocalStorage();
});

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    document.getElementById('date').value = today;
}

async function loadServices() {
    try {
        const response = await fetch(`${API_URL}/services`);
        const services = await response.json();
        
        const select = document.getElementById('service');
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.name;
            option.textContent = `${service.name} - Rp ${service.price.toLocaleString()} (${service.duration})`;
            select.appendChild(option);
        });
        
        // Pre-fill jika ada service yang dipilih sebelumnya
        const savedService = localStorage.getItem('selectedService');
        if (savedService) {
            select.value = savedService;
            localStorage.removeItem('selectedService');
        }
    } catch (error) {
        console.error('Error loading services:', error);
        showMessage('Failed to load services. Please refresh the page.', 'error');
    }
}

function prefillFromLocalStorage() {
    const savedName = localStorage.getItem('lastBookingName');
    const savedPhone = localStorage.getItem('lastBookingPhone');
    const savedEmail = localStorage.getItem('lastBookingEmail');
    
    if (savedName) document.getElementById('name').value = savedName;
    if (savedPhone) document.getElementById('phone').value = savedPhone;
    if (savedEmail) document.getElementById('email').value = savedEmail;
}

function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';
    
    const startHour = 9;
    const endHour = 19;
    
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            slot.dataset.time = time;
            
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => {
                    s.classList.remove('selected');
                });
                slot.classList.add('selected');
                selectedTimeSlot = time;
                document.getElementById('time').value = time;
            });
            
            timeSlotsContainer.appendChild(slot);
        }
    }
}

function setupForm() {
    const form = document.getElementById('reservationForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedTimeSlot) {
            showMessage('Please select a time slot.', 'error');
            return;
        }
        
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value || null,
            service: document.getElementById('service').value,
            date: document.getElementById('date').value,
            time: selectedTimeSlot,
            notes: document.getElementById('notes').value || null
        };
        
        // Simpan data untuk prefill next time
        localStorage.setItem('lastBookingName', formData.name);
        localStorage.setItem('lastBookingPhone', formData.phone);
        if (formData.email) {
            localStorage.setItem('lastBookingEmail', formData.email);
        }
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showMessage(`✅ Reservation successful! Your booking code: ${result.booking_code}`, 'success');
                form.reset();
                selectedTimeSlot = null;
                document.querySelectorAll('.time-slot').forEach(s => {
                    s.classList.remove('selected');
                });
                document.getElementById('time').value = '';
                setMinDate();
                
                // Show booking summary
                setTimeout(() => {
                    const summary = `
Booking Confirmed! 📋

📌 Booking Code: ${result.booking_code}
👤 Name: ${formData.name}
📞 Phone: ${formData.phone}
✂️ Service: ${formData.service}
📅 Date: ${formData.date}
⏰ Time: ${formData.time}
📝 Notes: ${formData.notes || 'None'}

Thank you for your reservation!
Please arrive 10 minutes before your appointment.
                    `;
                    alert(summary);
                }, 500);
            } else {
                throw new Error(result.error || 'Failed to create reservation');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(`❌ ${error.message}`, 'error');
        }
    });
}

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `alert ${type}`;
    messageDiv.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 10000);
    }
}