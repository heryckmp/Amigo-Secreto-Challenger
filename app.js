// DOM Elements
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const addPhotoLabel = document.getElementById('addPhotoLabel');
const nameInput = document.getElementById('nameInput');
const addBtn = document.getElementById('addBtn');
const participantsList = document.getElementById('participantsList');
const participantsCount = document.getElementById('participantsCount');
const drawBtn = document.getElementById('drawBtn');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');
const resultName = document.getElementById('resultName');
const closeResultBtn = document.getElementById('closeResultBtn');
const avatarCircle = document.getElementById('avatarCircle');

// Icons in base64
const cameraIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNhbWVyYSI+PHBhdGggZD0iTTEgOGEyIDIgMCAwIDEgMi0yaC4wOWEyIDIgMCAwIDAgMS40Mi0uNTlsMi41OS0yLjZhMiAyIDAgMCAxIDEuNDItLjU4aDRhMiAyIDAgMCAxIDEuNDIuNThsMi41OSAyLjZhMiAyIDAgMCAwIDEuNDIuNTlIMS44QTIgMiAwIDAgMSAxIDh6Ii8+PHBhdGggZD0iTTIgOHYxMGEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJWOCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTMiIHI9IjMiLz48L3N2Zz4=';
const trashIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0zIDZoMThNMTkgNnYxNGEyIDIgMCAwMS0yIDJIN2EyIDIgMCAwMS0yLTJWNm0zIDBWNGEyIDIgMCAwMTItMmg0YTIgMiAwIDAxMiAydjIiLz48cGF0aCBkPSJNMTAgMTF2NiIvPjxwYXRoIGQ9Ik0xNCAxMXY2Ii8+PC9zdmc+';

// Global Variables
let participants = [];
let results = {};
let selectedParticipant = null;
let fireworksActive = false;
let fireworksAnimationId = null;

// Fireworks variables
let canvas, ctx;
let particles = [];
let fireworks = [];

// Initialize the application
function init() {
    // Setup event listeners
    photoInput.addEventListener('change', handlePhotoUpload);
    photoPreview.addEventListener('click', triggerPhotoUpload);
    nameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addParticipant();
        }
    });
    addBtn.addEventListener('click', addParticipant);
    drawBtn.addEventListener('click', drawNames);
    closeResultBtn.addEventListener('click', hideResults);
    
    // Check for a participant ID in the URL (for sharing)
    checkForSharedResult();
    
    // Set camera icon
    addPhotoLabel.style.backgroundImage = `url(${cameraIcon})`;
    
    // Initialize fireworks canvas
    initFireworks();
}

// Function to check if there's a shared result in the URL
function checkForSharedResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const participantId = urlParams.get('id');
    
    if (participantId) {
        try {
            // Try to retrieve the participant data from localStorage
            const storedResults = localStorage.getItem('amigoSecreto_results');
            const storedParticipants = localStorage.getItem('amigoSecreto_participants');
            
            if (storedResults && storedParticipants) {
                results = JSON.parse(storedResults);
                participants = JSON.parse(storedParticipants);
                
                // Find the participant by ID
                const participant = participants.find(p => p.id === participantId);
                
                if (participant && results[participantId]) {
                    // Display the result for this participant
                    const friendId = results[participantId];
                    const friend = participants.find(p => p.id === friendId);
                    
                    if (friend) {
                        selectedParticipant = participant;
                        showResultFor(participant, friend);
                        
                        // Make sure the canvas is visible before starting the animation
                        document.querySelector('.fireworks-canvas').style.display = 'block';
                        startFireworks();
                    }
                }
            }
        } catch (error) {
            console.error('Error retrieving shared result:', error);
        }
    }
}

// Trigger photo upload when clicking on the preview
function triggerPhotoUpload() {
    photoInput.click();
}

// Handle photo upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Update the preview with the uploaded photo
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            addPhotoLabel.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Add a participant to the list
function addParticipant() {
    const name = nameInput.value.trim();
    if (name) {
        // Generate a unique ID
        const id = 'participant_' + Date.now();
        
        // Get the current photo if any
        let photo = null;
        const photoImg = photoPreview.querySelector('img');
        if (photoImg) {
            photo = photoImg.src;
        }
        
        // Create the participant object
        const participant = {
            id,
            name,
            photo
        };
        
        // Add to the array
        participants.push(participant);
        
        // Update the UI
        renderParticipants();
        
        // Save to localStorage
        saveParticipants();
        
        // Reset the form
        nameInput.value = '';
        photoPreview.innerHTML = '';
        addPhotoLabel.style.display = 'block';
        nameInput.focus();
        
        // Update the Draw button state
        updateDrawButtonState();
    }
}

// Render the participants list
function renderParticipants() {
    participantsList.innerHTML = '';
    
    participants.forEach(participant => {
        const li = document.createElement('li');
        
        // Create the participant info section
        const participantInfo = document.createElement('div');
        participantInfo.className = 'participant-info';
        
        // Create thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'participant-thumbnail';
        
        if (participant.photo) {
            thumbnail.innerHTML = `<img src="${participant.photo}" alt="${participant.name}">`;
        } else {
            // Add a placeholder for participants without photo
            thumbnail.style.background = 'linear-gradient(45deg, #8A2BE2, #BA55D3)';
            
            // Add initials
            const initials = document.createElement('span');
            initials.textContent = participant.name.charAt(0).toUpperCase();
            initials.style.color = 'white';
            initials.style.fontWeight = 'bold';
            initials.style.fontSize = '1.2rem';
            initials.style.display = 'flex';
            initials.style.alignItems = 'center';
            initials.style.justifyContent = 'center';
            initials.style.width = '100%';
            initials.style.height = '100%';
            
            thumbnail.appendChild(initials);
        }
        
        participantInfo.appendChild(thumbnail);
        
        // Create name element
        const nameElement = document.createElement('span');
        nameElement.className = 'name-item';
        nameElement.textContent = participant.name;
        participantInfo.appendChild(nameElement);
        
        li.appendChild(participantInfo);
        
        // Create delete button with trash icon
        const deleteButton = document.createElement('div');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = `
            <img src="${trashIcon}" alt="Excluir" class="trash-icon" data-id="${participant.id}">
            <span class="delete-tooltip">Excluir</span>
        `;
        deleteButton.addEventListener('click', () => removeParticipant(participant.id));
        
        li.appendChild(deleteButton);
        participantsList.appendChild(li);
    });
    
    // Update the counter
    participantsCount.textContent = participants.length;
}

// Remove a participant
function removeParticipant(id) {
    participants = participants.filter(participant => participant.id !== id);
    renderParticipants();
    saveParticipants();
    updateDrawButtonState();
}

// Save participants to localStorage
function saveParticipants() {
    localStorage.setItem('amigoSecreto_participants', JSON.stringify(participants));
}

// Enable/disable Draw button based on number of participants
function updateDrawButtonState() {
    drawBtn.disabled = participants.length < 2;
    
    if (participants.length < 2) {
        drawBtn.setAttribute('title', 'Você precisa adicionar pelo menos 2 participantes');
    } else {
        drawBtn.removeAttribute('title');
    }
}

// Draw the names
function drawNames() {
    if (participants.length < 2) {
        alert('Você precisa adicionar pelo menos 2 participantes!');
        return;
    }
    
    // Reset previous results
    results = {};
    
    // Create a copy of the participants array
    const availableFriends = [...participants];
    
    // Shuffle the array to randomize
    shuffle(availableFriends);
    
    // Assign secret friends
    participants.forEach(participant => {
        let friendIndex;
        let attempts = 0;
        
        // Try to find a valid friend (not self)
        do {
            friendIndex = Math.floor(Math.random() * availableFriends.length);
            attempts++;
            
            // Prevent infinite loop
            if (attempts > 100) {
                console.error("Couldn't find a valid match after 100 attempts");
                break;
            }
        } while (
            availableFriends.length > 1 && 
            availableFriends[friendIndex].id === participant.id
        );
        
        // Assign the friend
        const friend = availableFriends.splice(friendIndex, 1)[0];
        results[participant.id] = friend.id;
    });
    
    // Save results to localStorage
    localStorage.setItem('amigoSecreto_results', JSON.stringify(results));
    
    // Show a message
    const resultList = document.createElement('div');
    resultList.className = 'result-list success';
    resultList.textContent = 'Sorteio realizado com sucesso! Clique nos nomes para ver o resultado.';
    
    // Make participant names clickable
    makeNamesClickable();
}

// Make participant names clickable to show results
function makeNamesClickable() {
    const nameItems = document.querySelectorAll('.name-item');
    
    nameItems.forEach(nameItem => {
        const li = nameItem.closest('li');
        const participantInfo = li.querySelector('.participant-info');
        
        // Get the participant ID
        const participantId = li.querySelector('.trash-icon').dataset.id;
        
        // Add click event and visual cue
        participantInfo.style.cursor = 'pointer';
        participantInfo.style.transition = 'all 0.2s ease';
        
        // Remove previous event listeners
        const newParticipantInfo = participantInfo.cloneNode(true);
        participantInfo.parentNode.replaceChild(newParticipantInfo, participantInfo);
        
        // Add new event listener
        newParticipantInfo.addEventListener('click', () => {
            // Find the participant and friend
            const participant = participants.find(p => p.id === participantId);
            const friendId = results[participantId];
            const friend = participants.find(p => p.id === friendId);
            
            // Store selected participant for sharing
            selectedParticipant = participant;
            
            // Show the result
            showResultFor(participant, friend);
        });
        
        // Add hover effect
        newParticipantInfo.addEventListener('mouseover', () => {
            newParticipantInfo.style.transform = 'translateX(5px) scale(1.02)';
            newParticipantInfo.style.color = '#BA55D3';
        });
        
        newParticipantInfo.addEventListener('mouseout', () => {
            newParticipantInfo.style.transform = 'translateX(0) scale(1)';
            newParticipantInfo.style.color = '';
        });
    });
    
    // Show instructions
    const resultList = document.querySelector('.result-list');
    if (!resultList) {
        const newResultList = document.createElement('div');
        newResultList.className = 'result-list success';
        newResultList.textContent = 'Sorteio realizado com sucesso! Clique nos nomes para ver o resultado.';
        
        const inputSection = document.querySelector('.input-section');
        inputSection.appendChild(newResultList);
    } else {
        resultList.textContent = 'Sorteio realizado com sucesso! Clique nos nomes para ver o resultado.';
        resultList.className = 'result-list success';
    }
}

// Show the result for a specific participant
function showResultFor(participant, friend) {
    // Update the UI with the friend's name and photo
    resultName.textContent = friend.name;
    
    // Update the avatar
    if (friend.photo) {
        avatarCircle.innerHTML = `<img src="${friend.photo}" alt="${friend.name}">`;
    } else {
        avatarCircle.innerHTML = '';
        avatarCircle.style.background = 'linear-gradient(45deg, #8A2BE2, #BA55D3)';
        
        // Add initials for participants without photo
        const initials = document.createElement('span');
        initials.textContent = friend.name.charAt(0).toUpperCase();
        initials.style.color = 'white';
        initials.style.fontWeight = 'bold';
        initials.style.fontSize = '2.5rem';
        initials.style.display = 'flex';
        initials.style.alignItems = 'center';
        initials.style.justifyContent = 'center';
        initials.style.width = '100%';
        initials.style.height = '100%';
        
        avatarCircle.appendChild(initials);
    }
    
    // Show the result section
    resultSection.classList.add('show');
    resultContent.classList.add('show');
    
    // Disable draw button during result display
    drawBtn.disabled = true;
    
    // Start the fireworks animation
    startFireworks();
}

// Hide the results
function hideResults() {
    resultSection.classList.remove('show');
    resultContent.classList.remove('show');
    
    // Wait for the animation to complete before enabling the draw button
    setTimeout(() => {
        // Stop and clear the fireworks
        stopFireworks();
        clearCanvas();
        
        // Hide the canvas
        const fireworksCanvas = document.querySelector('.fireworks-canvas');
        if (fireworksCanvas) {
            fireworksCanvas.style.display = 'none';
        }
        
        // Re-enable draw button only if we have enough participants
        if (participants.length >= 2) {
            drawBtn.disabled = false;
        }
        
        // Show friendly message
        const resultList = document.querySelector('.result-list');
        if (resultList) {
            resultList.textContent = 'Você pode ver o resultado novamente clicando nos nomes ou realizar um novo sorteio.';
        }
    }, 400);
}

// Initialize fireworks canvas
function initFireworks() {
    canvas = document.querySelector('.fireworks-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Hide canvas initially
    canvas.style.display = 'none';
    
    // Update canvas size on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Start fireworks animation
function startFireworks() {
    // Make sure the canvas is visible
    const fireworksCanvas = document.querySelector('.fireworks-canvas');
    if (fireworksCanvas) {
        fireworksCanvas.style.display = 'block';
    }
    
    // Set flag to active
    fireworksActive = true;
    
    // Create first firework
    fireworks.push(createFirework());
    
    // Start animation loop
    animate();
}

// Stop fireworks animation
function stopFireworks() {
    fireworksActive = false;
    
    if (fireworksAnimationId) {
        cancelAnimationFrame(fireworksAnimationId);
        fireworksAnimationId = null;
    }
    
    // Clear arrays
    fireworks = [];
    particles = [];
}

// Clear the canvas
function clearCanvas() {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Animation loop
function animate() {
    // Check if animation should continue
    if (!fireworksActive) return;
    
    // Continue the animation
    fireworksAnimationId = requestAnimationFrame(animate);
    
    // Fade effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    
    // Launch new fireworks periodically
    if (Math.random() < 0.05 && fireworks.length < 5) {
        fireworks.push(createFirework());
    }
    
    // Update and draw fireworks
    updateFireworks();
    drawFireworks();
    
    // Update and draw particles
    updateParticles();
    drawParticles();
}

// Create a new firework
function createFirework() {
    return {
        x: Math.random() * canvas.width,
        y: canvas.height,
        targetY: Math.random() * canvas.height * 0.5,
        color: getRandomColor(),
        speed: 2 + Math.random() * 3,
        size: 4,
        exploded: false
    };
}

// Update fireworks positions
function updateFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        
        // Move firework upward
        firework.y -= firework.speed;
        
        // Check if firework should explode
        if (firework.y <= firework.targetY) {
            // Explosion
            createExplosion(firework);
            
            // Remove the firework
            fireworks.splice(i, 1);
        }
    }
}

// Create explosion particles
function createExplosion(firework) {
    const particleCount = 80 + Math.floor(Math.random() * 50);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1;
        
        particles.push({
            x: firework.x,
            y: firework.y,
            color: firework.color,
            size: Math.random() * 3 + 1,
            angle: angle,
            speed: speed,
            friction: 0.95,
            gravity: 0.1,
            alpha: 1,
            decay: Math.random() * 0.03 + 0.02
        });
    }
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Apply physics
        particle.speed *= particle.friction;
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed + particle.gravity;
        particle.alpha -= particle.decay;
        
        // Remove dead particles
        if (particle.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Draw fireworks
function drawFireworks() {
    fireworks.forEach(firework => {
        ctx.beginPath();
        ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2);
        ctx.fillStyle = firework.color;
        ctx.fill();
        
        // Draw trail
        ctx.beginPath();
        ctx.moveTo(firework.x, firework.y);
        ctx.lineTo(firework.x, firework.y + 10);
        ctx.strokeStyle = firework.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// Draw particles
function drawParticles() {
    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.alpha})`;
        ctx.fill();
    });
}

// Helper function to generate random colors
function getRandomColor() {
    const colors = [
        '#FF0000', // Red
        '#FFFF00', // Yellow
        '#00FF00', // Green
        '#00FFFF', // Cyan
        '#0000FF', // Blue
        '#FF00FF', // Magenta
        '#FF6600', // Orange
        '#FF3399', // Pink
        '#9900FF'  // Purple
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
}

// Helper function to shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Load participants from localStorage on startup
function loadParticipants() {
    const stored = localStorage.getItem('amigoSecreto_participants');
    if (stored) {
        try {
            participants = JSON.parse(stored);
            renderParticipants();
            updateDrawButtonState();
        } catch (error) {
            console.error('Error loading participants:', error);
        }
    }
}

// Load results from localStorage on startup
function loadResults() {
    const stored = localStorage.getItem('amigoSecreto_results');
    if (stored) {
        try {
            results = JSON.parse(stored);
            
            if (Object.keys(results).length > 0) {
                // If we have results, make names clickable
                makeNamesClickable();
            }
        } catch (error) {
            console.error('Error loading results:', error);
        }
    }
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', () => {
    init();
    loadParticipants();
    loadResults();
});