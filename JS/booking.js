function loginCredentialsCheck() {
  if (!localStorage.getItem("loginChecked")) {
    if (localStorage.getItem("logininfo")) {
      window.location.href = "booking.html";
      alert("Successfully Logged In");
    } else {
      alert("User not found, login first");
      document.location.href = "index.html";
    }
    localStorage.setItem("loginChecked", true);
  }
}

function logout() {
  localStorage.removeItem("logininfo");
  localStorage.setItem("loginChecked", "false");
}

(async function () {
  try {
    let loginInfo = JSON.parse(localStorage.getItem("logininfo"));
    let url = "http://localhost:3000/bookings";
    let data = await fetch(url);
    let response = await data.json();

    if (response) {
      let filteredBookings = response
        .filter((bookings) => bookings.userEmail === loginInfo.email)
        .map((bookings) => {
          console.log("Booking passengers:", bookings.passengers);
          let passengers = Array.isArray(bookings.passengers)
            ? bookings.passengers.map((passenger) => ({
              name: `${passenger.firstName ?? ''} ${passenger.lastName ?? ''}`,
              age: passenger.age ?? 'N/A',
            }))
            : [];

          return {
            id: bookings.id,
            userEmail: bookings.userEmail,
            departureCity: bookings.departureCity,
            arrivalCity: bookings.arrivalCity,
            departureDate: bookings.departureDate,
            flightNumber: bookings.flightNumber,
            passengers: passengers,
          };
        });

      let showBookingDataElement = document.querySelector("#history");

      if (showBookingDataElement) {
        let historyRows = filteredBookings.map((bookings) => {
          let passengerList = bookings.passengers.length
            ? bookings.passengers
              .map((p) => `${p.name} (${p.age})`)
              .join(", ")
            : "User";
          return `
            <tr data-booking-id="${bookings.id}">
              <td>${bookings.departureCity}</td>
              <td>${bookings.arrivalCity}</td>
              <td>${bookings.departureDate}</td>
              <td>${bookings.flightNumber}</td>
              <td>${passengerList}</td>
              <td>
                <button class="edit-button" data-booking-id="${bookings.id}">Edit</button>
                <button class="delete-button" data-booking-id="${bookings.id}">Delete</button>
              </td>
            </tr>
          `;
        });

        let historyTableHtml = `
          <tr>
            <th>Departure City</th>
            <th>Arrival City</th>
            <th>Flight Date</th>
            <th>Flight Number</th>
            <th>Passenger Details</th>
            <th>Actions</th>
          </tr>
          ${historyRows.join(" ")}
        `;
        showBookingDataElement.innerHTML = historyTableHtml;
      } else {
        console.log("HTML element with id 'history' not found");
      }
    } else {
      console.log("No bookings data available");
    }
  } catch (error) {
    console.error(error);
  }
})();

function handleEditClick(bookingId) {
  let background = document.querySelector(".container");
  background.style.filter = "blur(5px)";

  fetch(`http://localhost:3000/bookings/${bookingId}`)
    .then((response) => response.json())
    .then((bookingData) => {
      const editForm = document.createElement("div");
      editForm.classList.add("edit-form");
      editForm.innerHTML = `
        <h2>Edit Booking</h2>
        <form>
          <label>Departure City:</label>
          <input type="text" value="${bookingData.departureCity}" id="departureCity" /><br />
          <label>Arrival City:</label>
          <input type="text" value="${bookingData.arrivalCity}" id="arrivalCity" /><br />
          <label>Flight Date:</label>
          <input type="date" value="${bookingData.departureDate}" id="departureDate" /><br />
          <label>Flight Number:</label>
          <input type="text" value="${bookingData.flightNumber}" id="flightNumber" /><br />
          <button type="submit">Update Booking</button>
        </form>
      `;

      document.body.appendChild(editForm);

      editForm.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();

        const updatedDepartureCity = document.getElementById("departureCity").value;
        const updatedArrivalCity = document.getElementById("arrivalCity").value;
        const updatedDepartureDate = document.getElementById("departureDate").value;
        const updatedFlightNumber = document.getElementById("flightNumber").value;

        fetch(`http://localhost:3000/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            departureCity: updatedDepartureCity,
            arrivalCity: updatedArrivalCity,
            departureDate: updatedDepartureDate,
            flightNumber: updatedFlightNumber,
          }),
        })
          .then((response) => response.json())
          .then(() => {
            background.style.filter = "blur(0px)";
            editForm.remove();

            const tableRow = document.querySelector(`#history tr[data-booking-id="${bookingId}"]`);
            if (tableRow) {
              tableRow.innerHTML = `
                <td>${updatedDepartureCity}</td>
                <td>${updatedArrivalCity}</td>
                <td>${updatedDepartureDate}</td>
                <td>${updatedFlightNumber}</td>
                <td>Updated (refresh for full details)</td>
                <td>
                  <button class="edit-button" data-booking-id="${bookingId}">Edit</button>
                  <button class="delete-button" data-booking-id="${bookingId}">Delete</button>
                </td>
              `;
            }
          })
          .catch((error) => console.error(error));
      });

      editForm.addEventListener("click", (event) => {
        if (event.target === editForm) {
          background.style.filter = "blur(0px)";
          editForm.remove();
        }
      });
    })
    .catch((error) => console.error(error));
}

function handleDeleteClick(bookingId) {
  deleteBooking(bookingId);
}

async function deleteBooking(bookingId) {
  try {
    const response = await fetch(
      `http://localhost:3000/bookings/${bookingId}`,
      { method: "DELETE" }
    );
    if (response.ok) {
      const tableRow = document.querySelector(`#history tr[data-booking-id="${bookingId}"]`);
      if (tableRow) tableRow.remove();
      alert("Booking deleted successfully!");
    } else {
      alert("Error deleting booking: " + response.statusText);
    }
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("history").addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-button")) {
    const bookingId = event.target.getAttribute("data-booking-id");
    handleEditClick(bookingId);
  } else if (event.target.classList.contains("delete-button")) {
    const bookingId = event.target.getAttribute("data-booking-id");
    handleDeleteClick(bookingId);
  }
});
