const character = document.getElementById("character");
const bodyboard = document.getElementById('bodyboard');
const lamps = document.getElementById('lamps');
const githubOrb = document.getElementById('github-orb');
const linkedinOrb = document.getElementById('linkedin-orb');
const gmailOrb = document.getElementById('gmail-orb');
const radio = document.getElementById('radio');
const computer = document.getElementById('computer');

const screenFill = document.getElementById("screenFill");
const baseContent = document.getElementById("base-content");
// const workContent = document.getElementById("work-content");

var bodyboardWav = new Audio('../assets/sounds/bodyboard.wav');

var userWantsSound = false;

// --- Character control
function switchGifs() {
    // Reset GIF
    character.src = '../assets/images/character_idle_1.png';
    character.src = '../assets/gifs/character_idle_1.gif';

    // After the full GIF has played, switch to the loop GIF
    setTimeout(() => {
        character.src = '../assets/images/character_idle_1.png';

        setTimeout(() => {
            switchGifs();
        }, 2000);
    }, 1000);
}
switchGifs();

// --- Bodyboard control
let bodyboardInteractionTimeout;
bodyboard.addEventListener('mouseover', function() {
    // Reset GIF
    bodyboard.src = '../assets/images/bodyboard.png';
    bodyboard.src = '../assets/gifs/bodyboard_interact.gif';

    if(userWantsSound){
        bodyboardWav.pause();
        bodyboardWav.currentTime = 0;
        bodyboardWav.play();
    }

    // Clear any previous timeouts
    clearTimeout(bodyboardInteractionTimeout);

    // Set new timeout to wait for end of GIF
    bodyboardInteractionTimeout = setTimeout(() => {
        bodyboard.src = '../assets/images/bodyboard.png';

        if(userWantsSound){
            bodyboardWav.pause();
            bodyboardWav.currentTime = 0;
        }
    }, 1000); 
    
});


// --- Lamps control
let lampsInteractionTimeout;
lamps.addEventListener('mouseover', function() {
    // Reset GIF
    lamps.src = '../assets/images/lamps.png';
    lamps.src = '../assets/gifs/lamps_interact.gif';

    // Clear any previous timeouts
    clearTimeout(lampsInteractionTimeout);

    // Set new timeout to wait for end of GIF
    lampsInteractionTimeout = setTimeout(() => {
        lamps.src = '../assets/images/lamps.png';
    }, 1000); 
});

// --- Radio control
let radioInteractionTimeout;
radio.addEventListener('mouseover', function() {
    // Reset GIF
    radio.src = '../assets/images/radio.png';
    radio.src = '../assets/gifs/radio_interact.gif';

    // Clear any previous timeouts
    clearTimeout(radioInteractionTimeout);

    // Set new timeout to wait for end of GIF
    radioInteractionTimeout = setTimeout(() => {
        radio.src = '../assets/images/radio.png';
    }, 1000); 
});
radio.addEventListener('click', function() {
    userWantsSound = !userWantsSound;
});


// --- GitHub Orb control
let githubOrbInteractionTimeout;
githubOrb.addEventListener('mouseover', function() {
    // Reset GIF
    githubOrb.src = '../assets/images/github-orb.png';
    githubOrb.src = '../assets/gifs/github-orb-interact.gif';

    // Clear any previous timeouts
    clearTimeout(githubOrbInteractionTimeout);

    // Set new timeout to wait for end of GIF
    githubOrbInteractionTimeout = setTimeout(() => {
        githubOrb.src = '../assets/images/github-orb.png';
    }, 1000); 
});
githubOrb.addEventListener('click', function(){
    window.open('https://github.com/anamsmartins/', '_blank');
});

// --- LinkedIn Orb control
let linkedinOrbInteractionTimeout;
linkedinOrb.addEventListener('mouseover', function() {
    // Reset GIF
    linkedinOrb.src = '../assets/images/linkedin-orb.png';
    linkedinOrb.src = '../assets/gifs/linkedin-orb-interact.gif';

    // Clear any previous timeouts
    clearTimeout(linkedinOrbInteractionTimeout);

    // Set new timeout to wait for end of GIF
    linkedinOrbInteractionTimeout = setTimeout(() => {
        linkedinOrb.src = '../assets/images/linkedin-orb.png';
    }, 1000); 
});  
linkedinOrb.addEventListener('click', function(){
    window.open('https://www.linkedin.com/in/ana-ms-martins/', '_blank');
});

// --- Gmail Orb control
let gmailOrbInteractionTimeout;
gmailOrb.addEventListener('mouseover', function() {
    // Reset GIF
    gmailOrb.src = '../assets/images/gmail-orb.png';
    gmailOrb.src = '../assets/gifs/gmail-orb-interact.gif';

    // Clear any previous timeouts
    clearTimeout(gmailOrbInteractionTimeout);

    // Set new timeout to wait for end of GIF
    gmailOrbInteractionTimeout = setTimeout(() => {
        gmailOrb.src = '../assets/images/gmail-orb.png';
    }, 1000); 
});  
gmailOrb.addEventListener('click', function(){
    var mailWindow = window.open('mailto:anaritamsmartins@gmail.com');

    // If a new window was created (not blocked), close it immediately
    if (mailWindow) {
        mailWindow.close();
    }
    
});

// Computer control
let computerInteractionTimeout;
computer.addEventListener('mouseover', function() {
    // Reset GIF
    computer.src = '../assets/images/computer.png';
    computer.src = '../assets/gifs/computer-interact.gif';

    // Clear any previous timeouts
    clearTimeout(computerInteractionTimeout);

    // Set new timeout to wait for end of GIF
    computerInteractionTimeout = setTimeout(() => {
        computer.src = '../assets/images/computer-open.png';
    }, 1000); 
});

computer.addEventListener('mouseout', function() {
    // Reset GIF
    computer.src = '../assets/images/computer.png';
});
computer.addEventListener('click', function () {
    // Show overlay with animation
    screenFill.classList.add("active");

    // Simulate loading new content with a delay (e.g., fetching data)
    setTimeout(function () {
        // Re-hide the overlay after the new content is ready
        screenFill.classList.remove("active");
        window.location.href = '/work';
    }, 2000); // Simulate 1 second loading delay

    setTimeout(function () {
        // Replace current content with new content
        baseContent.style.display = 'none';
        // workContent.style.display = 'flex';
    }, 500);
})