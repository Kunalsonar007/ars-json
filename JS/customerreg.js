function logincredentialscheck() {
  if (!localStorage.getItem('loginChecked')) {
    if (localStorage.getItem('logininfo')) {
      // If data exists, redirect to protected page
      window.location.href = 'customerreg.html';
      alert("Successfully Logged In");
    } else {
      alert("User not found, login first");
      document.location.href = "index.html";
    }
    // Set the flag to indicate that the function has been executed
    localStorage.setItem('loginChecked', true);
  }
}

const customerreg = () => {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const password = document.getElementById('password').value;

  const customerData = {
    name,
    email,
    phone,
    address,
    password
  };

  const url = "https://flight-booking-json-l-git-cea0dd-abhay-dixits-projects-4f073080.vercel.app/customers";

  const method = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(customerData)
  };

  fetch(url, method)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to register customer.");
      }
      alert("Customer successfully registered!");
      document.getElementById("customer-form").reset();
    })
    .catch(error => {
      alert("Error: " + error.message);
    });

  return false; // Prevent form submission
};
