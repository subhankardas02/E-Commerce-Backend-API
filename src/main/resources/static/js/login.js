document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    const payload = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
        rememberMe: document.getElementById('remember').checked
    };

    // UI Loading State
    submitBtn.disabled = true;
    btnText.textContent = 'Authenticating...';
    spinner.classList.remove('hidden');

    try {
        // Adjust the endpoint to match your Spring Boot authentication route (e.g., /api/auth/login)
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await response.text();

        if (response.ok) {
            showToast('Authentication successful! Access granted.', 'success');

            // Note: If using JWT, you would save it here:
            // localStorage.setItem('token', JSON.parse(responseData).token);

            // Redirect after brief delay so user sees the success toast
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
        } else {
            showToast(responseData || 'Invalid security key or email.', 'error');
        }
    } catch (err) {
        console.error('Authentication Error:', err);
        showToast('Server connection failed. Is Spring Boot running?', 'error');
    } finally {
        // Reset UI State
        submitBtn.disabled = false;
        btnText.textContent = 'Authenticate';
        spinner.classList.add('hidden');
    }
});

/**
 * Dynamically displays a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showToast(message, type) {
    const toast = document.getElementById('toast');

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}