// dashboard.js
document.getElementById('addTimerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const timerName = formData.get('timerName');
    const hours = parseInt(formData.get('hours'));
    const minutes = parseInt(formData.get('minutes'));
    const seconds = parseInt(formData.get('seconds'));

    const duration = {
        hours,
        minutes,
        seconds
    };

    try {
        const response = await fetch('/auth/addTimer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            },
            body: JSON.stringify({
                name: timerName,
                duration
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add timer');
        }

        fetchDashboardAndUpdateDOM(); // Fetch updated dashboard data without reloading the page
    } catch (error) {
        console.error('Error adding timer:', error.message);
        alert('Failed to add timer, please try to refresh the page or try again later');
    }
});

// Function to fetch updated dashboard data and update DOM
async function fetchDashboardAndUpdateDOM() {
    try {
        const response = await fetch('/dashboard-json', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        // Update the dashboard content with the new data
        const timersContainer = document.querySelector('.timers');
        timersContainer.innerHTML = ''; // Clear existing timers

        data.timers.forEach((timer) => {
            const timerElement = document.createElement('div');
            timerElement.classList.add('timer');
            timerElement.dataset.timerId = timer.id; // Set data attribute for timer id
            timerElement.innerHTML = `
            <h2>${timer.name}</h2>
            <p>Duration: ${timer.duration.hours}h ${timer.duration.minutes}m ${timer.duration.seconds}s</p>
            <p>Paused: ${timer.paused}</p>
            <p>Started: ${timer.started}</p>
            <p>Elapsed Time: ${timer.elapsedTime.hours}h ${timer.elapsedTime.minutes}m ${timer.elapsedTime.seconds}s</p>
            <button class="btn start-pause">${timer.paused? "Pause": "Start" }</button>
            <button class="btn remove">Remove</button>
            <button class="btn fullscreen">&#x26F6;</button>
            `;
            timerElement.addEventListener("click", () => {
                removeTimer(timer.id);
            });
            timersContainer.appendChild(timerElement);
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
    }
}

// Function to remove a timer
function removeTimer(timerId) {
    fetch(`/removeTimer/${timerId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.ok) {
                // Remove the timer element from the DOM
                const timerElement = document.querySelector(`[data-timer-id="${timerId}"]`);
                timerElement.remove();
                const timersContainer = document.querySelector('.timers');
                if (timersContainer.children.length === 0) {
                    timersContainer.innerHTML = '<p class="small-message">No timers to show.</p>';
                }
            } else {
                console.error("Failed to remove timer:", response.statusText);
            }
        })
        .catch(error => {
            console.error("Error removing timer:", error);
        });
}

// Function to add event listeners for remove buttons
function addRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll(".remove");

    removeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const timerId = button.parentElement.dataset.timerId; // Get the timer id
            removeTimer(timerId);
        });
    });
}

function fullscreen(timerId) {
    // Redirect to the fullscreen view URL
    window.location.href = `/fullscreen/${timerId}/${user.username}`;
}

// Function to add event listeners for fullscreen buttons
function addRemoveButtonListeners() {
    const fullscreenButtons = document.querySelectorAll(".fullscreen");

    fullscreenButtons.forEach(button => {
        button.addEventListener("click", () => {
            const timerId = button.parentElement.dataset.timerId; // Get the timer id
            fullscreen(timerId);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    addRemoveButtonListeners();
});