async function submitQuestion() {
    // Get form elements
    const questionInput = document.getElementById('questionInput');
    const optionInputs = document.querySelectorAll('.optionInput');
    const correctAnswerSelect = document.getElementById('correctAnswer');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
    submitBtn.disabled = true;
    messageDiv.className = 'hidden';

    try {
        // Prepare data
        const question = questionInput.value.trim();
        const options = Array.from(optionInputs).map(input => input.value.trim());
        const correctAnswer = correctAnswerSelect.value;

        console.log("Submitting:", { question, options, correctAnswer }); // Debug

        // Send to server
        const response = await fetch('https://backbone-1.onrender.com/api/create-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question,
                options,
                correctAnswer: parseInt(correctAnswer)
            })
        });

        const result = await response.json();
        console.log("Server response:", result); // Debug

        if (!response.ok) {
            throw new Error(result.message || 'Failed to save question');
        }

        // Success
        showMessage('Question saved successfully!', 'success');
        resetForm();

    } catch (error) {
        console.error('Submission error:', error);
        showMessage(error.message || 'Server error while saving question', 'error');

        // Detailed error info for debugging
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Save Question';
        submitBtn.disabled = false;
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `py-2 px-4 rounded-lg text-sm ${type === 'success'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'
        }`;
}

function resetForm() {
    document.getElementById('questionInput').value = '';
    document.querySelectorAll('.optionInput').forEach(input => input.value = '');
    document.getElementById('correctAnswer').value = '';
}