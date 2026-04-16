document.addEventListener('DOMContentLoaded', loadBarbers);

async function loadBarbers() {
    try {
        const response = await fetch('http://localhost:3000/api/reservations/barbers');
        const barbers = await response.json();
        
        const container = document.getElementById('barbers-container');
        container.innerHTML = barbers.map(barber => `
            <div class="barber-card">
                <div class="barber-image">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="barber-info">
                    <h3>${barber.name}</h3>
                    <div class="barber-specialty">
                        <i class="fas fa-star"></i>
                        ${barber.specialty}
                    </div>
                    <div class="barber-experience">
                        <i class="fas fa-clock"></i>
                        ${barber.experience} experience
                    </div>
                    <p class="barber-bio">
                        Master barber specializing in ${barber.specialty.toLowerCase()}. 
                        With ${barber.experience} of experience, ${barber.name} brings precision 
                        and artistry to every cut.
                    </p>
                    <div class="book-barber">
                        <a href="reservation.html" class="book-btn" onclick="localStorage.setItem('selectedBarber', '${barber.name}')">
                            <i class="fas fa-calendar-check"></i> Book ${barber.name}
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading barbers:', error);
        document.getElementById('barbers-container').innerHTML = `
            <div style="text-align:center; grid-column:1/-1; padding: 3rem; background: white; border-radius: 10px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h3>Failed to load barbers</h3>
                <p>Please check your connection and try again.</p>
                <button onclick="loadBarbers()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}