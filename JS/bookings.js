function logincredentialscheck() {
  if (!localStorage.getItem('loginChecked')) {
    if (localStorage.getItem('logininfo')) {
      alert("Successfully Logged In");
      // Stay on this page
    } else {
      alert("User not found. Please login first.");
      window.location.href = "index.html";
    }
    localStorage.setItem('loginChecked', true);
  }
}

// Pre-fill flight info from URL params
const urlParams = new URLSearchParams(window.location.search);
document.getElementById('departure-city').value = urlParams.get('departurecity') || '';
document.getElementById('arrival-city').value = urlParams.get('arrivalcity') || '';
document.getElementById('flight-number').value = urlParams.get('flightid') || '';

// DOM references
const form = document.getElementById('booking-form');
const addPassengerButton = document.getElementById('add-passenger');
const passengerInfoContainer = document.getElementById('passenger-info');
const adultsInput = document.getElementById('adults');
const childrenInput = document.getElementById('children');

let passengerCount = 0;

// Add passenger fields
addPassengerButton.addEventListener('click', () => {
  passengerInfoContainer.innerHTML = '';
  const totalPassengers = parseInt(adultsInput.value) + parseInt(childrenInput.value);
  passengerCount = totalPassengers;

  for (let i = 1; i <= totalPassengers; i++) {
    const passengerHTML = `
      <div class="passenger">
        <label>Passenger ${i} First Name:</label>
        <input type="text" id="first-name-${i}" required><br>

        <label>Passenger ${i} Last Name:</label>
        <input type="text" id="last-name-${i}" required><br>

        <label>Passenger ${i} Age:</label>
        <input type="number" id="age-${i}" required><br><br>
      </div>
    `;
    passengerInfoContainer.innerHTML += passengerHTML;
  }
});

// Form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const departureCity = document.getElementById('departure-city').value;
  const arrivalCity = document.getElementById('arrival-city').value;
  const departureDate = document.getElementById('departure-date').value;
  const flightNumber = document.getElementById('flight-number').value;
  const loginInfo = JSON.parse(localStorage.getItem('logininfo') || '{}');
  const userEmail = loginInfo.email || 'anonymous@example.com';

  if (!departureDate) {
    alert('Please enter the departure date');
    return;
  }

  const passengers = [];
  for (let i = 1; i <= passengerCount; i++) {
    const firstName = document.getElementById(`first-name-${i}`).value;
    const lastName = document.getElementById(`last-name-${i}`).value;
    const age = document.getElementById(`age-${i}`).value;

    if (!firstName || !lastName || !age) {
      alert('Please fill all passenger fields');
      return;
    }

    passengers.push({ firstName, lastName, age });
  }

  // Display ticket
  const ticketHTML = `
    <h1 style="color:red;text-align:center;">-- TICKET --</h1>
    <h2>Flight Details</h2>
    <p>Flight Number: ${flightNumber}</p>
    <p>Departure City: ${departureCity}</p>
    <p>Arrival City: ${arrivalCity}</p>
    <p>Departure Date: ${departureDate}</p>
    <h3>Passengers:</h3>
    <ul type="none">
      ${passengers.map((p, i) => `<li>Passenger ${i + 1}: ${p.firstName} ${p.lastName} (Age: ${p.age})</li>`).join('')}
    </ul>
    <p>Email: ${userEmail}</p>
  `;

  document.getElementById('booking-form').style.display = 'none';
  const ticketContainer = document.getElementById('ticket-container');
  const ticketContainerMain = document.getElementById('ticket-container-main');
  ticketContainer.innerHTML = ticketHTML;
  ticketContainerMain.style.display = 'block';

  // Hide ticket after 5 seconds


  // Send booking to backend
  fetch('http://localhost:3000/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      departureCity,
      arrivalCity,
      departureDate,
      flightNumber,
      passengers,
      userEmail
    })
  })
    .then(res => res.json())
    .then(data => console.log('Booking submitted:', data))
    .catch(err => console.error('Booking error:', err));
});
