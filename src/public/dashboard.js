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
            <button class="btn start-pause">${timer.paused? "Pause": "Resume" }</button>
            <button class="btn remove">Remove</button>
            <button class="btn fullscreen">&#x26F6;</button>
            `;
            addRemoveButtonListeners();
            addFullscreenButtonListeners();
            addStartStopButtonListeners();
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
    window.location.href = `/fullscreen/${user.username}/${timerId}`;
}

// Function to add event listeners for fullscreen buttons
function addFullscreenButtonListeners() {
    const fullscreenButtons = document.querySelectorAll(".fullscreen");

    fullscreenButtons.forEach(button => {
        button.addEventListener("click", () => {
            const timerId = button.parentElement.dataset.timerId; // Get the timer id
            fullscreen(timerId);
        });
    });
}
// Function to start or stop a timer
function startStop(button, timerId) {
    const buttonText = button.innerText.trim(); // Get the trimmed text of the button
    let url = '';
    if (buttonText === 'Resume') {
        url = `/auth/pauseTimer/${timerId}`; // If button text is 'Pause', we want to pause the timer
    } else if (buttonText === 'Pause') {
        url = `/auth/resumeTimer/${timerId}`; // If button text is 'Resume', we want to resume the timer
    } else {
        url = `/auth/resumeTimer/${timerId}`;
    }

    fetch(url, {
            method: 'PUT', // Both requests are PUT requests
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            }
        })
        .then(response => {
            console.log(response);
            if (!response.ok) {
                throw new Error('Failed to start/stop timer');
            }
            // Toggle the button text between 'Start' and 'Stop'
            button.innerText = buttonText === 'Resume' ? 'Pause' : 'Resume';
        })
        .catch(error => {
            console.error('Error starting/stopping timer:', error);
            alert('Failed to start/stop timer');
        });
}


// Function to add event listeners for start and stop buttons
function addStartStopButtonListeners() {
    const startStopButtons = document.querySelectorAll(".start-pause");

    startStopButtons.forEach(button => {
        button.addEventListener("click", () => {
            const timerId = button.parentElement.dataset.timerId; // Get the timer id
            startStop(button, timerId);
            fetchDashboardAndUpdateDOM();
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    addRemoveButtonListeners();
    addFullscreenButtonListeners();
    addStartStopButtonListeners();
});