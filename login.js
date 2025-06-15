async function login() {
  // 1. Get all input values
  const regNumber = document.getElementById('regNumber').value.trim();
  const fullName = document.getElementById('fullName').value.trim(); // This collects the name
  const department = document.getElementById('department').value.trim();
  const errorMsg = document.getElementById('errorMsg');

  // 2. Validate all fields
  if (!regNumber || !fullName || !department) {
    showError("All fields are required");
    return;
  }

  // 3. Show loading state
  const loginBtn = document.querySelector('button[onclick="login()"]');
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Authenticating...';
  loginBtn.disabled = true;

  try {
    // 4. Send all data to backend
    const response = await fetch('https://backbone-1.onrender.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        regNumber,
        fullName,  // This sends the name
        department
      })
    });

    const result = await response.json();

    // 5. Handle response
    if (response.ok && result.success) {
      // Store ALL user data
      localStorage.setItem('regNumber', regNumber);
      localStorage.setItem('fullName', fullName);  // This stores the name
      localStorage.setItem('department', department);

      window.location.href = 'dashboard.html';
    } else {
      showError(result.message || 'Login failed');
    }
  } catch (err) {
    showError('Network error. Please try again.');
  } finally {
    // Reset button state
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Login';
    loginBtn.disabled = false;
  }

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    errorMsg.classList.add('animate__animated', 'animate__headShake');
    setTimeout(() => errorMsg.classList.remove('animate__animated', 'animate__headShake'), 1000);
  }
}