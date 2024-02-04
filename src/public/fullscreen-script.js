let selectedId = "img-1";
// Get the reset button element
let resetButton;
let previousSeconds = "";
let previousMinutes = "";
let previousHours = "";

function pause() {
    hours.paused = true;
    minutes.paused = true;
    seconds.paused = true;
    hours.animate();
    minutes.animate();
    seconds.animate();
}

function resume() {
    hours.paused = false;
    hours.started = true;
    hours.field.each(d => {
        d.previous = undefined;
    });
    hours.path.transition()
        .ease("elastic")
        .duration(500)
        .attrTween("d", hours.arcTween(hours.width));
    hours.animate();
    hours.update(true);
    minutes.paused = false;
    minutes.started = true;
    minutes.field.each(d => {
        d.previous = undefined;
    });
    minutes.path.transition()
        .ease("elastic")
        .duration(500)
        .attrTween("d", minutes.arcTween(minutes.width));
    minutes.animate();
    minutes.update(true);
    seconds.paused = false;
    seconds.started = true;
    seconds.field.each(d => {
        d.previous = undefined;
    });
    seconds.path.transition()
        .ease("elastic")
        .duration(500)
        .attrTween("d", seconds.arcTween(seconds.width));
    seconds.animate();
    seconds.update();
}

function toggle() { // Get's called when the button is clicked
    if (hours.paused) {
        resumeTimer(timerId);
        resume();
        document.getElementById("toggleTimer").classList.add('active');
    } else {
        pauseTimer(timerId);
        pause();
        document.getElementById("toggleTimer").classList.remove('active');
    }
}

// Function to resume a timer
function resumeTimer(timerId) {
    // Before resuming it we need to start it if is not already started
    let url;
    if (!seconds.started){
        url = `/auth/startTimer/${timerId}`;

        fetch(url, {
                method: 'PUT', // PUT request to resume the timer
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to resume timer');
                }
            })
            .catch(error => {
                console.error('Error resuming timer:', error);
                alert('Failed to resume timer');
            });
    }

    url = `/auth/resumeTimer/${timerId}`;

    fetch(url, {
            method: 'PUT', // PUT request to resume the timer
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to resume timer');
            }
        })
        .catch(error => {
            console.error('Error resuming timer:', error);
            alert('Failed to resume timer');
        });
}

// Function to pause a timer
function pauseTimer(timerId) {
    const url = `/auth/pauseTimer/${timerId}`;

    fetch(url, {
            method: 'PUT', // PUT request to pause the timer
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT token for authentication
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to pause timer');
            }
        })
        .catch(error => {
            console.error('Error pausing timer:', error);
            alert('Failed to pause timer');
        });
}

function toggleSound() {  // Get's called when the button to toggle the sound is clicked
    document.getElementById("toggleSound").classList.toggle('active');
}

function toggleTheme() {  // Get's called when the button to toggle the theme is clicked
    let list = document.getElementById("toggleTheme").classList;
    list.toggle('active');
    localStorage.setItem("theme", list.contains('active'));
    if (list.contains('active')){
        document.getElementById("body").classList.add('darkTheme');
    }
    else{
        document.getElementById("body").classList.remove('darkTheme');
    }
}


function share() {
    // Get the current page URL
    var urlToCopy = window.location.href;

    // Copy the URL to the clipboard
    navigator.clipboard.writeText(urlToCopy)
        .then(function() {
            // Success callback
            console.log("URL copied to clipboard successfully!");
            // Show a notification message
            showNotification("URL copied to clipboard!");
        })
        .catch(function(error) {
            // Error callback
            console.error("Unable to copy URL to clipboard: ", error);
            // Show a notification message
            showNotification("Failed to copy URL to clipboard", true);
        });

    // Add and remove the 'active' class with animation
    document.getElementById("share-icon").classList.add('active');
    animationTimeout = setInterval(function() {
        document.getElementById("share-icon").classList.remove('active');
    }, 100);
}

function showNotification(message, isError = false) {
    var notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');
    if (isError) {
        notification.classList.add('error');
    }
    document.body.appendChild(notification);
    setTimeout(function() {
        notification.remove();
    }, 2000);
}


let animationTimeout;
function reset(fromUser=false){
    if (fromUser){
        if (animationTimeout){
            clearTimeout(animationTimeout);
        }
        if (canModifyTimer){
            previousHours = document.getElementById("hoursInput").value;
            previousMinutes = document.getElementById("minutesInput").value;
            previousSeconds = document.getElementById("secondsInput").value;
        }
        document.getElementById("toggleTimer").classList.remove('active');
        document.getElementById("reset-icon").classList.add('active');
        document.getElementById("reset-button").classList.remove('click-to-update');
        animationTimeout = setInterval(function() {
            document.getElementById("reset-icon").classList.remove('active');
        }, 100);
        // Create particles
        createParticles();
    }
    // Reset all the timers
    hours.reset();
    minutes.reset();
    seconds.reset();
    if (canModifyTimer){
        // Set the new time values from the user input
        let hoursInput = parseInt(document.getElementById("hoursInput").value);
        let minutesInput = parseInt(document.getElementById("minutesInput").value);
        let secondsInput = parseInt(document.getElementById("secondsInput").value);
        hours.timePassed = hours.maxTime-hoursInput-1;
        minutes.timePassed = minutes.maxTime-minutesInput-1;
        seconds.timePassed = seconds.maxTime-secondsInput-1;
    }
    // Update timer visually
    hours.update(false);
    minutes.update(false);
    seconds.update(false);
    hours.animate();
    minutes.animate();
    seconds.animate();
}

// Function to create particles
function createParticles() {
    const particleContainer = document.getElementById("particle-container");
    const resetButton = document.getElementById("reset-button");

    resetButton.disabled = true;
    
    // Get the position and dimensions of the reset button
    const resetButtonRect = resetButton.getBoundingClientRect();

    // Calculate the center coordinates
    const centerX = resetButtonRect.left + resetButtonRect.width / 2;
    const centerY = resetButtonRect.top + resetButtonRect.height / 2;

    // Create particles
    const addedParticles = [];
    for (let i = 0; i < 15; i++) { // Increased number of particles
        const particle = document.createElement("span");
        particle.classList.add("particle");

        // Generate random angle (in radians) for initial velocity direction
        const angle = Math.random() * Math.PI * 2; // Random angle between 0 and 2*PI
        const speed = Math.random() * 20; // Random speed between 0 and 10 pixels per frame

        // Calculate initial velocity components
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;

        // Set initial position (DOM) (centered at explosion point)
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;

        // Set initial velocity
        particle.dataset.vx = velocityX;
        particle.dataset.vy = velocityY;
        // Set initial position (dataset)
        particle.dataset.x = centerX;
        particle.dataset.y = centerY;

        particleContainer.appendChild(particle);
        addedParticles.push(particle); // Store the added particles
    }

    // Animate particles
    animateParticles(addedParticles);

    // Remove added particles after animation
    setTimeout(() => {
        addedParticles.forEach(particle => {
            particle.remove(); // Remove each added particle
        });

        // Check if the particle container has no child items
        if (particleContainer.childNodes.length === 0) {
            resetButton.disabled = false;
        }
    }, 1000); // Adjusted timing to match gravity animation duration
}

// Function to animate particles
function animateParticles(particles) {
    const duration = 1000; // Duration of the animation in milliseconds
    const gravity = 0.55; // Gravity force
    const startTime = performance.now(); // Start time

    // Function to handle animation for each frame
    function animate(currentTime) {
        // Calculate elapsed time since animation start
        const elapsedTime = (currentTime - startTime) / 1000;

        // Loop through each particle to update its position
        particles.forEach((particle, index) => {
            // Get current velocity components
            let vx = parseFloat(particle.dataset.vx);
            let vy = parseFloat(particle.dataset.vy);

            // Apply deceleration
            vx *= Math.exp(-0.01 * elapsedTime); // Reduce velocity in x-direction
            vy *= Math.exp(-0.01 * elapsedTime); // Reduce velocity in y-direction

            // Apply gravity
            vy += gravity * elapsedTime; // Increase velocity in y-direction due to gravity

            // Update position based on velocity
            let newX = parseInt(particle.dataset.x) + vx * elapsedTime;
            let newY = parseInt(particle.dataset.y) + vy * elapsedTime;

            // Check boundaries
            newX = newX;
            newY = newY;

            // Remove particle if out of screen
            if (newY > document.documentElement.clientHeight) {
                particle.remove(); // Remove from DOM
                particles.splice(index, 1); // Remove from array
            } else {
                // Update position if still in screen
                particle.style.left = `${newX}px`;
                particle.style.top = `${newY}px`;

                // Update dataset with new position
                particle.dataset.x = newX;
                particle.dataset.y = newY;

                // Update velocity data attributes
                particle.dataset.vx = vx;
                particle.dataset.vy = vy;
            }
        });

        // Continue animation until duration is reached or no particles left
        if (elapsedTime < duration && particles.length > 0) {
            requestAnimationFrame(animate); // Request next animation frame
        }
    }

    // Start animation loop
    requestAnimationFrame(animate); // Initial call to start the animation
}


function updateTimerValues(){
    if (canModifyTimer){
        let hoursInput = parseInt(document.getElementById("hoursInput").value);
        let minutesInput = parseInt(document.getElementById("minutesInput").value);
        let secondsInput = parseInt(document.getElementById("secondsInput").value);
        let changedSeconds = seconds.timeLimit - seconds.timePassed != secondsInput;
        let changedMinutes = minutes.timeLimit - minutes.timePassed != minutesInput;
        let changedHours = hours.timeLimit - hours.timePassed != hoursInput;
        
        if (!seconds.started){
            seconds.label.text(d => secondsInput);
            seconds.label.classed("changed", changedSeconds);
        }
        else{
            seconds.label.classed("changed", false);
        }
        if (!minutes.started){
            minutes.label.text(d => minutesInput);
            minutes.label.classed("changed", changedMinutes);
        }
        else{
            minutes.label.classed("changed", false);
        }
        if (!hours.started){
            hours.label.text(d => hoursInput);
            hours.label.classed("changed", changedHours);
        }
        else{
            hours.label.classed("changed", false);
        }
        if (hours.paused){
            hours.timerName.classed("paused", true);
        }
        if (minutes.paused){
            minutes.timerName.classed("paused", true);
        }
        if (seconds.paused){
            seconds.timerName.classed("paused", true);
        }
        setTimeout(updateTimerValues, 100);
    }
}

function flashInputRed(input) {
    // Start the "animation"
    input.classList.add('out-of-range');
    // Remove the "animation" class after a small amount of time to show a red box
    setInterval(
        function () {
            input.classList.remove('out-of-range');
        },
        250
    )
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
        // If the "animation" didn't get removed correctly remove it
        input.classList.remove('out-of-range');
    }
    // To be sure the timer has not all inputs set to 0: 0h 0m 0s we do an additional check and call the validate seconds function
    // To be sure that the call is not recursive tho we will add a check to not call it if the input is the seconds input
    if (previousSeconds != document.getElementById("secondsInput").value ||
        previousMinutes != document.getElementById("minutesInput").value ||
        previousHours != document.getElementById("hoursInput").value){
        document.getElementById("reset-button").classList.add('click-to-update')
    }
    else {
        document.getElementById("reset-button").classList.remove('click-to-update')
    }
    if (input.id != "secondsInput") {
        validateSeconds(document.getElementById("secondsInput"));
    }

    // Check for bigger values then 48hs
    // Get the input values
    let hours = parseInt(document.getElementById("hoursInput").value);
    let minutes = parseInt(document.getElementById("minutesInput").value);
    let seconds = parseInt(document.getElementById("secondsInput").value);

    // Calculate total time in seconds
    let totalTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

    // Check if total time exceeds 48 hours (48 * 3600 seconds)
    if (totalTimeInSeconds > 48 * 3600) {
        // Flash input fields red and set time to 48 hours
        flashInputRed(document.getElementById("hoursInput"));
        flashInputRed(document.getElementById("minutesInput"));
        flashInputRed(document.getElementById("secondsInput"));

        // Set the time to 48 hours
        document.getElementById("hoursInput").value = 48;
        document.getElementById("minutesInput").value = 0;
        document.getElementById("secondsInput").value = 0;
    }
}

function validateSeconds() {
    input = document.getElementById("secondsInput");
    validateNumber(input);
    // If hours and minutes are 0 then don't allow a timer with 0h 0m 0s but set seconds to at least 1s
    if (parseInt(document.getElementById("hoursInput").value) <= 0 && parseInt(document.getElementById("minutesInput").value) <= 0 && parseInt(input.value) <= 0){
        input.value = parseInt(input.min)+1+"";
        flashInputRed(input);
    } 
}

function uploadImageClick(){
    // Open the dropdown
    const dropdown = document.getElementById("upload-image-dropdown");
    dropdown.classList.toggle('dropdown-visible');

    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown !== dropdown && openDropdown.classList.contains('dropdown-visible')) {
            openDropdown.classList.remove('dropdown-visible');
        }
        Array.from(openDropdown.children).forEach(element => {
            if (element.tagName != "LABEL"){
                dropdownImage = element.id.replace("dropdown-", "");
                if (localStorage.getItem(dropdownImage) == null){
                    element.querySelector(".element-status").innerText = "---";
                }
                else{
                    element.querySelector(".element-status").innerText = "set";
                }
                element.querySelector(".edit-image").onclick = function () {
                    selectedId = this.parentElement.id.replace("dropdown-", "");
                    // Call to uploadImage
                    document.getElementById("hiddenUpload").click();
                }
                element.querySelector(".delete-image").onclick = function () {
                    imageId = this.parentElement.id.replace("dropdown-", "");
                    localStorage.removeItem(imageId);
                    document.getElementById(imageId).querySelector("img").removeAttribute("src");
                    document.getElementById(imageId).querySelector("img").style.width = "0px";
                    document.getElementById(imageId).querySelector("img").style.height = "0px";
                    closeDropdown();
                }   
            }
        });
    }

    const imagesDiv = document.getElementById("images");
    if (dropdown.classList.contains("dropdown-visible")){
        Array.from(imagesDiv.children).forEach(element => {
            const labelElement = element.querySelector('.image-helper');
            const imgElement = element.querySelector('img');
    
            if (!imgElement.src) {
                labelElement.style.display = 'none';
            }
            else {
                labelElement.style.display = 'inline';
            }
        });
    }
    else {
        Array.from(imagesDiv.children).forEach(element => {
            element.querySelector('.image-helper').style.display = 'none';
        });
    }
}

function imageToString(element) {
    return element.src;
}

function stringToImg(str) {
    const imgElement = document.createElement('img');
    imgElement.src = str;
    return imgElement;
}

function uploadImage(element){
    let reader = new FileReader();
    reader.onload = function(){
        document.getElementById(selectedId).querySelector("img").src = reader.result;
        try{
            localStorage.setItem(selectedId, reader.result);
        }
        catch {
            localStorage.removeItem(selectedId);
        }
    }
    reader.readAsDataURL(element.target.files[0]);
}

window.addEventListener('load', function () {
    //reset();

    // Function to retrieve and apply image information
    function setImageInfo(imageId) {
        const imgElement = document.getElementById(imageId);
        const tmpImage = localStorage.getItem(imageId);
        
        if (tmpImage !== null) {
            imgElement.querySelector("img").src = tmpImage;
            imgElement.style.width = localStorage.getItem(`${imageId}-w`);
            imgElement.style.height = localStorage.getItem(`${imageId}-h`);
        }
        imgElement.style.left = localStorage.getItem(`${imageId}-x`);
        imgElement.style.top = localStorage.getItem(`${imageId}-y`);
    }

    // Apply information for each image
    setImageInfo("img-1");
    setImageInfo("img-2");
    setImageInfo("img-3");
});


function isParentOfElementWithId(element, parentId) {
    let currentElement = element;
    while (currentElement) {
      if (currentElement.id === parentId) {
        return true;
      }
  
      currentElement = currentElement.parentElement;
    }
    return false;
}

function closeDropdown() {
    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('dropdown-visible')) {
            openDropdown.classList.remove('dropdown-visible');
        }
    }

    const imagesDiv = document.getElementById("images");
    Array.from(imagesDiv.children).forEach(element => {
        element.querySelector('.image-helper').style.display = 'none';
    });
}

window.onclick = function(event) {
    if (!isParentOfElementWithId(event.target, 'upload-image-button') && !isParentOfElementWithId(event.target, 'upload-image-dropdown')) {
        closeDropdown();
    }
};

function getDocumentHeight(){
    return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight);
}

function getPadding(element) {
    const computedStyle = window.getComputedStyle(element);

    return parseInt(computedStyle.getPropertyValue('padding'), 10);
}


let isDragging = false;
let isResizing = false;
let resizingDir = "";
let initialHeight = 0;
let initialWidth = 0;
let offsetX;
let offsetY;
let draggedElement;
let body = document.body;
let html = document.documentElement;

document.querySelectorAll('.image').forEach((element) => {
    element.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            let padding = getPadding(element);
            if (offsetX > padding && offsetX < element.offsetWidth-padding && offsetY > padding && offsetY < element.offsetHeight-padding){
                isDragging = true;
                draggedElement = element;
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
    
                element.classList.add('dragging');
            }
            else {
                isResizing = true;
                draggedElement = element;
                initialHeight = draggedElement.offsetHeight - getPadding(draggedElement) * 2;
                initialWidth = draggedElement.offsetWidth - getPadding(draggedElement) * 2;
            }
        }
    });
});

document.addEventListener('mousemove', (e) => {
   
    if (!isResizing) {
        const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);

        if (hoveredElement.id.startsWith("img-")) {
            let offsetX = e.clientX - hoveredElement.getBoundingClientRect().left;
            let offsetY = e.clientY - hoveredElement.getBoundingClientRect().top;
            let padding = getPadding(hoveredElement);
        
            let cursorStyle = "default"; // Default cursor style
    
            let cursorFound = false;
    
            if (offsetY > padding && offsetY < hoveredElement.offsetHeight - padding) {
                cursorStyle = "e-resize";
                cursorFound = true;
            }
            if (offsetX < hoveredElement.offsetWidth - padding && !cursorFound) {
                cursorStyle = "n-resize";
                cursorFound = true;
            }
            // Prevent resizing from the top and left
            if (offsetX < padding){
                cursorStyle = "default"
            }
            if (offsetY < padding){
                cursorStyle = "default"
            }

        
            hoveredElement.style.cursor = cursorStyle;
            resizingDir = cursorStyle;
        }
    }
    
    
    
    if (isResizing) {
        if (resizingDir == "e-resize"){
            const newWidth = e.clientX - draggedElement.getBoundingClientRect().left;
            const minWidth = parseInt(draggedElement.style.minWidth);
             
            draggedElement.style.height = `${initialHeight}px`;
            draggedElement.style.width = `${Math.max(newWidth, minWidth)-getPadding(draggedElement)}px`;
        }
        else if (resizingDir == "n-resize") {
            const newHeight = e.clientY - draggedElement.getBoundingClientRect().top;
            const minHeight = parseInt(draggedElement.style.minHeight);
            
            draggedElement.style.width = `${initialWidth}px`;
            
            draggedElement.style.height = `${Math.max(newHeight, minHeight)-getPadding(draggedElement)}px`;
        }
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging || !draggedElement) {
        return;
    }

    const x = Math.min(body.clientWidth-draggedElement.offsetWidth-getPadding(draggedElement), Math.max(0, e.clientX - offsetX));
    const y = Math.min(getDocumentHeight()-draggedElement.offsetHeight-getPadding(draggedElement), Math.max(0,e.clientY - offsetY));

    draggedElement.style.left = `${x}px`;
    draggedElement.style.top = `${y}px`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;

    if (draggedElement) {
        localStorage.setItem(draggedElement.id+"-x", draggedElement.style.left)
        localStorage.setItem(draggedElement.id+"-y", draggedElement.style.top)
        localStorage.setItem(draggedElement.id+"-w", draggedElement.style.width)
        localStorage.setItem(draggedElement.id+"-h", draggedElement.style.height)
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
});

window.addEventListener('resize', function(event) {
    document.querySelectorAll('.image').forEach((element) => {
        element.style.top = Math.min(getDocumentHeight()-element.offsetHeight-getPadding(element), Math.max(0, parseInt(element.style.top.replace("px", ""))))+"px";
        element.style.left = Math.min(body.clientWidth-element.offsetWidth-getPadding(element), Math.max(0, parseInt(element.style.left.replace("px", ""))))+"px";
    });
}, true);

window.addEventListener('DOMContentLoaded', function() {
    resetButton = document.getElementById("reset-button");
    if (this.localStorage.getItem("theme") == 'true'){
        document.getElementById("body").classList.add('darkTheme');
    }
    else{
        document.getElementById("toggleTheme").classList.toggle('active');
    }
    this.setTimeout(updateTimerValues, 1);
    if (canModifyTimer){
        previousHours = document.getElementById("hoursInput").value;
        previousMinutes = document.getElementById("minutesInput").value;
        previousSeconds = document.getElementById("secondsInput").value;
    }
})