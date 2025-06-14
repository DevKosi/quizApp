async function login() {
  const regNumber = document.getElementById('regNumber').value;
  const department = document.getElementById('department').value;
  const errorMsg = document.getElementById('errorMsg');

  // Show loading state
  errorMsg.classList.add('hidden');
  const loginBtn = document.querySelector('button[onclick="login()"]');
  const originalBtnText = loginBtn.innerHTML;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Authenticating...';
  loginBtn.disabled = true;

  const response = await fetch('https://backbone-skry.onrender.com/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ regNumber, department })
  });

  const result = await response.json();

  // Restore button state
  loginBtn.innerHTML = originalBtnText;
  loginBtn.disabled = false;

  if (response.ok && result.success) {
    // Save user data in localStorage
    localStorage.setItem('regNumber', regNumber);
    localStorage.setItem('department', department);
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } else {
    // Show error with animation
    errorMsg.classList.remove('hidden');
    errorMsg.classList.add('animate__animated', 'animate__headShake');
    setTimeout(() => {
      errorMsg.classList.remove('animate__animated', 'animate__headShake');
    }, 1000);
    errorMsg.textContent = result.message || 'Login failed';
  }
}
