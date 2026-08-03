document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    // Build payload matching UserRequest DTO exactly
    const payload = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: {
            street: document.getElementById('street').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value.trim(),
            country: document.getElementById('country').value.trim(),
            zip_code: document.getElementById('zip_code').value.trim()
        }
    };

    // UI Loading State
    submitBtn.disabled = true;
    btnText.textContent = 'Processing...';
    spinner.classList.remove('hidden');

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await response.text();

        if (response.ok) {
            // Show success message
            showToast('Identity registered successfully! Rerouting to login...', 'success');
            document.getElementById('registerForm').reset();

            // Redirect to login page after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } else {
            showToast(responseData || 'Failed to register identity.', 'error');

            // Reset UI State on error (we don't reset on success because page will redirect)
            submitBtn.disabled = false;
            btnText.textContent = 'Register Identity';
            spinner.classList.add('hidden');
        }
    } catch (err) {
        console.error('Registration Error:', err);
        showToast('Server connection failed. Is Spring Boot running?', 'error');

        // Reset UI State on error
        submitBtn.disabled = false;
        btnText.textContent = 'Register Identity';
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