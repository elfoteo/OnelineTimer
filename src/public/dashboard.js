// dashboard.js
document.getElementById('addTimerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // If the timer has not a valid name
    if (!validateTimerName()){
        alert("The timer has an invalid name, the name must be between 4 and 16 characters.");
        return;
    }

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
        if (data.timers.length == 0){
            timersContainer.innerHTML = '<p class="small-message">No timers to show.</p>'
        }
        else{
            data.timers.forEach((timer) => {
                const timerElement = document.createElement('div');
                timerElement.classList.add('timer');
                if (timer.paused){
                    timerElement.classList.add('paused');
                }
                if (!timer.started){
                    timerElement.classList.add('stopped');
                }
                timerElement.dataset.timerId = timer.id; // Set data attribute for timer id
                timerElement.innerHTML = `
                <h2>${timer.name}</h2>
                <p>Duration: ${timer.duration.hours}h ${timer.duration.minutes}m ${timer.duration.seconds}s</p>
                <p>Paused: ${timer.paused}</p>
                <p>Started: ${timer.started}</p>
                <p>Elapsed Time: ${timer.elapsedTime.hours}h ${timer.elapsedTime.minutes}m ${timer.elapsedTime.seconds}s</p>
                <button class="btn start-stop">${timer.started? "Stop": "Start" }</button>
                ${timer.started ? `<button class='btn resume-pause'>${timer.paused ? 'Resume' : 'Pause'}</button>` : ''}
                <button class="btn remove">Remove</button>
                <button class="btn fullscreen">&#x26F6;</button>
                `;
                timerElement.querySelectorAll(".remove").forEach(button => {
                    button.addEventListener("click", () => {
                        const timerId = button.parentElement.dataset.timerId; // Get the timer id
                        removeTimer(timerId);
                    });
                });
                timerElement.querySelectorAll(".fullscreen").forEach(button => {
                    button.addEventListener("click", () => {
                        const timerId = button.parentElement.dataset.timerId; // Get the timer id
                        fullscreen(timerId);
                    });
                });
                timerElement.querySelectorAll(".resume-pause").forEach(button => {
                    button.addEventListener("click", () => {
                        const timerId = button.parentElement.dataset.timerId; // Get the timer id
                        resumePause(button, timerId);
                        fetchDashboardAndUpdateDOM();
                    });
                });
                timerElement.querySelectorAll(".start-stop").forEach(button => {
                    button.addEventListener("click", () => {
                        const timerId = button.parentElement.dataset.timerId; // Get the timer id
                        startStop(button, timerId);
                        fetchDashboardAndUpdateDOM();
                    });
                });
                timersContainer.appendChild(timerElement);
            });
        }
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

// Function to resume or pause a timer
function resumePause(button, timerId) {
    const buttonText = button.innerText.trim(); // Get the trimmed text of the button
    let url = '';
    if (buttonText === 'Resume') {
        url = `/auth/resumeTimer/${timerId}`; // If button text is 'Resume', we want to resume the timer
    } else if (buttonText === 'Pause') {
        url = `/auth/pauseTimer/${timerId}`; // If button text is 'Pause', we want to pause the timer
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
            if (!response.ok) {
                throw new Error('Failed to resume/pause timer');
            }
            // Toggle the button text between 'Start' and 'Stop'
            button.innerText = buttonText === 'Resume' ? 'Pause' : 'Resume';
        })
        .catch(error => {
            console.error('Error resuming/pausing timer:', error);
            alert('Failed to resume/pause timer');
        });
}


// Function to start or stop a timer
function startStop(button, timerId) {
    const buttonText = button.innerText.trim(); // Get the trimmed text of the button
    let url = '';
    if (buttonText === 'Start') {
        url = `/auth/startTimer/${timerId}`; // If button text is 'Resume', we want to resume the timer
    } else if (buttonText === 'Stop') {
        url = `/auth/stopTimer/${timerId}`; // If button text is 'Pause', we want to pause the timer
    } else {
        url = `/auth/startTimer/${timerId}`;
    }

    fetch(url, {
            method: 'PUT', // Both requests are PUT requests
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to start/stop timer');
            }
            // Toggle the button text between 'Start' and 'Stop'
            button.innerText = buttonText === 'Stop' ? 'Start' : 'Stop';
        })
        .catch(error => {
            console.error('Error starting/stopping timer:', error);
            alert('Failed to start/stop timer');
        });
}


// Function to add event listeners for resume and pause buttons
function addResumePauseButtonListeners() {
    const resumePauseButtons = document.querySelectorAll(".resume-pause");

    resumePauseButtons.forEach(button => {
        button.addEventListener("click", () => {
            const timerId = button.parentElement.dataset.timerId; // Get the timer id
            resumePause(button, timerId);
            fetchDashboardAndUpdateDOM();
        });
    });
}

// Function to add event listeners for start and stop buttons
function addStartStopListeners() {
    const startStopButtons = document.querySelectorAll(".start-stop");

    startStopButtons.forEach(button => {
        button.addEventListener("click", () => {
            const timerId = button.parentElement.dataset.timerId; // Get the timer id
            startStop(button, timerId);
            fetchDashboardAndUpdateDOM();
        });
    });
}

let previousSeconds = "";
let previousMinutes = "";
let previousHours = "";
let previousName = "";

function flashInputRed(input) {
    input.classList.add('out-of-range');
}

function flashInputRedAnim(input) {
    input.classList.add('out-of-range');
    setTimeout(function () {
        input.classList.remove('out-of-range')
    }, 250)
}

function validateNumber(input) {
    // Get the entered value
    let enteredValue = parseInt(input.value, 10);
    if (isNaN(enteredValue)) {
        input.value = input.min+"";
    }

    // Check if the value is within the allowed range
    if (enteredValue < parseInt(input.min, 10) || enteredValue > parseInt(input.max, 10)) {
        // If not, set the value to the minimum or maximum
        input.value = Math.min(Math.max(enteredValue, parseInt(input.min, 10)), parseInt(input.max, 10));

        flashInputRed(input);
    } else {
        input.classList.remove('out-of-range');
    }
    // To be sure the timer has not all inputs set to 0: 0h 0m 0s we do an additional check and call the validate seconds function
    // To be sure that the call is not recursive tho we will add a check to not call it if the input is the seconds input
    if (previousSeconds != document.getElementById("seconds").value ||
        previousMinutes != document.getElementById("minutes").value ||
        previousHours != document.getElementById("hours").value){
    }
    if (input.id != "seconds") {
        validateSeconds(document.getElementById("seconds"));
    }

    // Check for bigger values then 48hs
    // Get the input values
    let hours = parseInt(document.getElementById("hours").value);
    let minutes = parseInt(document.getElementById("minutes").value);
    let seconds = parseInt(document.getElementById("seconds").value);

    // Calculate total time in seconds
    let totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

    // Check if total time exceeds 48 hours (48 * 3600 seconds)
    if (totalTimeInSeconds > 48 * 3600) {
        // Flash input fields red and set time to 48 hours
        flashInputRedAnim(document.getElementById("hours"));
        flashInputRedAnim(document.getElementById("minutes"));
        flashInputRedAnim(document.getElementById("seconds"));

        // Set the time to 48 hours
        document.getElementById("hours").value = 48;
        document.getElementById("minutes").value = 0;
        document.getElementById("seconds").value = 0;
    }
}

function validateSeconds() {
    input = document.getElementById("seconds");
    validateNumber(input);
    // If hours and minutes are 0 then don't allow a timer with 0h 0m 0s but set seconds to at least 1s
    if (parseInt(document.getElementById("hours").value) <= 0 && parseInt(document.getElementById("minutes").value) <= 0 && parseInt(input.value) <= 0){
        input.value = parseInt(input.min)+1+"";
        flashInputRed(input);
    }
    else{
        input.classList.remove('out-of-range');
    }
}

function validateTimerName() {
    const nameInput = document.getElementById("timerName");
    const name = nameInput.value.trim(); // Remove leading and trailing whitespace

    if (name.length < 4 || name.length > 16) {
        flashInputRed(nameInput);
        // nameInput.value = previousName
        return false;
    } else {
        previousName = name;
        nameInput.classList.remove('out-of-range');
        return true;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Make the UI interactable
    addRemoveButtonListeners();
    addFullscreenButtonListeners();
    addResumePauseButtonListeners();
    addStartStopListeners();
    // Update each second the UI
    setInterval(function() {
        fetchDashboardAndUpdateDOM()
    }, 1000);
});