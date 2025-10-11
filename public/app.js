const API_URL = 'http://localhost:3000';

let currentPage = 1;
let currentCategoryFilter = '';

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

async function fetchCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const categories = await response.json();

    document.getElementById('categoriesLoading').style.display = 'none';
    document.getElementById('categoriesTable').style.display = 'table';

    const tbody = document.getElementById('categoriesBody');
    tbody.innerHTML = '';

    categories.forEach(category => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${category.name}</td>
        <td class="actions">
          <button class="btn btn-danger btn-small" onclick="deleteCategory('${category.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    const categorySelect = document.getElementById('placeCategory');
    const filterSelect = document.getElementById('filterCategory');
    categorySelect.innerHTML = '<option value="">No Category</option>';
    filterSelect.innerHTML = '<option value="">All Categories</option>';

    categories.forEach(category => {
      categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
      filterSelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
    });

  } catch (error) {
    document.getElementById('categoriesLoading').style.display = 'none';
    document.getElementById('categoriesError').style.display = 'block';
    document.getElementById('categoriesError').textContent = 'Failed to load categories';
  }
}

async function fetchPlaces(page = 1, categoryId = '') {
  try {
    const params = new URLSearchParams({ page, limit: 10 });
    if (categoryId) params.append('categoryId', categoryId);

    const response = await fetch(`${API_URL}/places?${params}`);
    const result = await response.json();

    document.getElementById('placesLoading').style.display = 'none';
    document.getElementById('placesTable').style.display = 'table';
    document.getElementById('placesPagination').style.display = 'flex';

    const tbody = document.getElementById('placesBody');
    tbody.innerHTML = '';

    result.data.forEach(place => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${place.name}</td>
        <td>${place.category ? place.category.name : '-'}</td>
        <td>${place.address}</td>
        <td>${place.images ? place.images.length : 0}</td>
        <td class="actions">
          <button class="btn btn-danger btn-small" onclick="deletePlace('${place.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    const pagination = document.getElementById('placesPagination');
    pagination.innerHTML = `
      <button ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">Previous</button>
      <span>Page ${page} of ${result.pages}</span>
      <button ${page === result.pages ? 'disabled' : ''} onclick="changePage(${page + 1})">Next</button>
    `;

  } catch (error) {
    document.getElementById('placesLoading').style.display = 'none';
    document.getElementById('placesError').style.display = 'block';
    document.getElementById('placesError').textContent = 'Failed to load places';
  }
}

function changePage(page) {
  currentPage = page;
  fetchPlaces(currentPage, currentCategoryFilter);
}

document.getElementById('filterCategory').addEventListener('change', (e) => {
  currentCategoryFilter = e.target.value;
  currentPage = 1;
  fetchPlaces(currentPage, currentCategoryFilter);
});

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('categoryName').value;

  try {
    const response = await fetch(`${API_URL}/admin/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (response.ok) {
      document.getElementById('categoryName').value = '';
      fetchCategories();
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to create category');
    }
  } catch (error) {
    alert('Failed to create category');
  }
});

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;

  try {
    const response = await fetch(`${API_URL}/admin/categories/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchCategories();
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to delete category');
    }
  } catch (error) {
    alert('Failed to delete category');
  }
}

document.getElementById('addImageBtn').addEventListener('click', () => {
  const imageList = document.getElementById('imageInputs');
  const newInput = document.createElement('div');
  newInput.className = 'image-item';
  newInput.innerHTML = `
    <input type="url" placeholder="Image URL" class="image-url">
    <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
  `;
  imageList.appendChild(newInput);
});

document.getElementById('placeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const imageInputs = document.querySelectorAll('.image-url');
  const images = Array.from(imageInputs)
    .map(input => input.value.trim())
    .filter(url => url !== '');

  const data = {
    name: document.getElementById('placeName').value,
    category_id: document.getElementById('placeCategory').value || null,
    address: document.getElementById('placeAddress').value,
    description: document.getElementById('placeDescription').value,
    latitude: parseFloat(document.getElementById('placeLatitude').value) || null,
    longitude: parseFloat(document.getElementById('placeLongitude').value) || null,
    images
  };

  try {
    const response = await fetch(`${API_URL}/admin/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      document.getElementById('placeForm').reset();
      document.getElementById('imageInputs').innerHTML = `
        <div class="image-item">
          <input type="url" placeholder="Image URL" class="image-url">
        </div>
      `;
      fetchPlaces(currentPage, currentCategoryFilter);
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to create place');
    }
  } catch (error) {
    alert('Failed to create place');
  }
});

async function deletePlace(id) {
  if (!confirm('Delete this place?')) return;

  try {
    const response = await fetch(`${API_URL}/admin/places/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchPlaces(currentPage, currentCategoryFilter);
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to delete place');
    }
  } catch (error) {
    alert('Failed to delete place');
  }
}

fetchCategories();
fetchPlaces();
