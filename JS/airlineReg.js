let editingId = null;

function logincredentialscheck() {
  if (!localStorage.getItem('loginChecked')) {
    if (localStorage.getItem('logininfo')) {
      alert("Successfully Logged In");
      window.location.href = 'airlineReg.html';
    } else {
      alert("User not found, login first");
      window.location.href = "index.html";
    }
    localStorage.setItem('loginChecked', true);
  }
}

const showAirline = async () => {
  try {
    const response = await fetch('http://localhost:3000/airliness');
    const data = await response.json();
    const airlinesData = document.getElementById('airlines-data');
    airlinesData.innerHTML = '';

    data.forEach(airline => {
      const row = document.createElement('tr');
      row.id = `airline-row-${airline.id}`;
      row.innerHTML = `
        <td>${airline.id}</td>
        <td>${airline.name}</td>
        <td>${airline.iata_code}</td>
        <td>${airline.country}</td>
        <td><button class="btn btn-danger" id="delete-btn-${airline.id}">Delete</button></td>
        <td><button class="btn btn-primary edit-btn" data-id="${airline.id}">Edit</button></td>
      `;
      airlinesData.appendChild(row);

      document.getElementById(`delete-btn-${airline.id}`).addEventListener('click', () => del(airline.id));
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        showEditForm(id);
      });
    });

  } catch (error) {
    console.error(error);
  }
};

const showEditForm = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/airliness/${id}`);
    const airline = await response.json();

    document.getElementById('airline-form').style.display = 'block';
    document.querySelector('.container').style.filter = 'blur(2px)';

    document.getElementById('name').value = airline.name;
    document.getElementById('iata_code').value = airline.iata_code;
    document.getElementById('country').value = airline.country;

    editingId = id;

  } catch (error) {
    console.error(error);
  }
};

function addAirline() {
  editingId = null;
  document.querySelector('.container').style.filter = 'blur(2px)';
  document.getElementById('airline-form').style.display = 'block';

  document.getElementById('name').value = '';
  document.getElementById('iata_code').value = '';
  document.getElementById('country').value = '';
}

function close() {
  document.querySelector('.container').style.filter = 'blur(0px)';
  document.getElementById('airline-form').style.display = 'none';
  editingId = null;
}

document.getElementById('airline-edit-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const iata_code = document.getElementById('iata_code').value;
  const country = document.getElementById('country').value;

  await airlineReg(editingId, name, iata_code, country);
  close();
  showAirline(); // Refresh table
});

const airlineReg = async (id, name, iata_code, country) => {
  try {
    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `http://localhost:3000/airliness/${id}`
      : 'http://localhost:3000/airliness';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, iata_code, country })
    });

    if (!response.ok) {
      throw new Error('Failed to save airline data');
    }
  } catch (error) {
    console.error(error);
  }
};

const del = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/airliness/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      document.getElementById(`airline-row-${id}`).remove();
    } else {
      console.error(`Failed to delete airline with ID ${id}`);
    }
  } catch (error) {
    console.error(error);
  }
};
