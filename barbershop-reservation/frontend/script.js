// Load services dari backend
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/reservations/services');
        const services = await response.json();
        
        const container = document.getElementById('services-container');
        container.innerHTML = services.map(service => `
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas ${getServiceIcon(service.name)}"></i>
                </div>
                <h3>${service.name}</h3>
                <div class="price">Rp ${service.price.toLocaleString()}</div>
                <div class="duration">${service.duration}</div>
                <p>Professional ${service.name.toLowerCase()} service</p>
                <button onclick="bookService('${service.name}')" class="btn btn-primary" style="margin-top: 10px; width: 100%;">
                    <i class="fas fa-calendar-plus"></i> Book This Service
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading services:', error);
        document.getElementById('services-container').innerHTML = `
            <div style="text-align:center; grid-column:1/-1; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ffc107; margin-bottom: 1rem;"></i>
                <h3>Services Temporarily Unavailable</h3>
                <p>You can still make reservations by clicking the button below.</p>
                <a href="reservation.html" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-calendar-alt"></i> Make Reservation
                </a>
            </div>
        `;
    }
});

function getServiceIcon(serviceName) {
    const icons = {
        'Haircut': 'fa-scissors',
        'Beard Trim': 'fa-user-check',
        'Hair Wash': 'fa-shower',
        'Premium Package': 'fa-crown'
    };
    return icons[serviceName] || 'fa-spa';
}

function bookService(serviceName) {
    localStorage.setItem('selectedService', serviceName);
    window.location.href = 'reservation.html';
}