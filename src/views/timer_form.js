// timer_form.js

document.getElementById('timerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const timerValue = document.getElementById('timerValue').value;

    try {
        const response = await fetch('/auth/timer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ timerValue })
        });

        const data = await response.json();
        document.getElementById('timerLink').innerText = `Timer created! Link: ${data.timerLink}`;
    } catch (error) {
        console.error('Error creating timer:', error);
        document.getElementById('timerLink').innerText = 'Error creating timer';
    }
});
