// Full working app.js with all fixes and improvements applied

// DOM Elements
const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");
const speakBtn = document.querySelector("#speak");
const statusIndicator = document.querySelector("#status");
const responseContainer = document.querySelector("#response");
const visualFeedback = document.querySelector("#visual-feedback");
const setup = document.querySelector(".nikk_setup");

// Typing effect
function typeText(text, element) {
    element.textContent = '';
    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
        }
    }, 50);
}

// Visual feedback for voice recognition
function updateVisualFeedback(isListening) {
    if (isListening) {
        visualFeedback.classList.add('listening');
        statusIndicator.textContent = 'Listening...';
        statusIndicator.style.color = '#4CAF50';
    } else {
        visualFeedback.classList.remove('listening');
        statusIndicator.textContent = 'Ready';
        statusIndicator.style.color = '#666';
    }
}

// Convert Kelvin to Celsius
function ktc(k) {
    return (k - 273.15).toFixed(2);
}

// Fetch weather data
function getData(location) {
    const weatherCont = document.querySelector(".temp").querySelectorAll("*");
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=48ddfe8c9cf29f95b7d0e54d6e171008`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
        if (this.status === 200) {
            let data = JSON.parse(this.responseText);
            weatherCont[0].textContent = `Location : ${data.name}`;
            weatherCont[1].textContent = `Country : ${data.sys.country}`;
            weatherCont[2].textContent = `Weather type : ${data.weather[0].main}`;
            weatherCont[3].textContent = `Weather description : ${data.weather[0].description}`;
            weatherCont[4].src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            weatherCont[5].textContent = `Original Temperature : ${ktc(data.main.temp)}`;
            weatherCont[6].textContent = `But it feels like ${ktc(data.main.feels_like)}`;
            weatherCont[7].textContent = `Min temperature ${ktc(data.main.temp_min)}`;
            weatherCont[8].textContent = `Max temperature ${ktc(data.main.temp_max)}`;
        } else {
            weatherCont[0].textContent = "weather info not found";
        }
    };
    xhr.send();
}

// Save user info
function userInfo() {
    let setupInfo = {
        name: setup.querySelectorAll("input")[0].value,
        bio: setup.querySelectorAll("input")[1].value,
        location: setup.querySelectorAll("input")[2].value,
        instagram: setup.querySelectorAll("input")[3].value,
        Github: setup.querySelectorAll("input")[4].value
    };

    let testArr = Array.from(setup.querySelectorAll("input")).map(e => e.value);

    if (testArr.includes("")) {
        readout("Your Information is not complete. Check your information");
    } else {
        localStorage.clear();
        localStorage.setItem("nikk_setup", JSON.stringify(setupInfo));
        setup.style.display = "none";
        getData(setupInfo.location);
    }
}

// Chat history
function addToChatHistory(sender, message) {
    const chatContainer = document.getElementById('chat-history');
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', sender);
    bubble.textContent = message;
    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Speech synthesis
function readout(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
}

// Voice recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.onstart = () => updateVisualFeedback(true);
recognition.onend = () => updateVisualFeedback(false);

recognition.onresult = function (event) {
    let transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
    addToChatHistory("user", transcript);
    const userdata = localStorage.getItem("nikk_setup") ? JSON.parse(localStorage.getItem("nikk_setup")) : {};

    const openUrl = url => {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) readout("Please allow pop-ups for this website.");
    };

    
    if (transcript.includes("hi nikk") || transcript.includes("hello nikk")) {
        readout("Hello sir, how can I help you today?");
        addToChatHistory("nikk", "Hello sir, how can I help you today?");
    
    
    } else if (transcript.includes("open youtube")) {
        readout("Opening YouTube in a new tab");
        addToChatHistory("nikk", "Opening YouTube in a new tab");
        openUrl("https://www.youtube.com/");
    
    
    } else if (transcript.includes("open google")) {
        readout("Opening Google in a new tab");
        addToChatHistory("nikk", "Opening Google in a new tab");
        openUrl("https://www.google.com/");
    
    
    } else if (transcript.includes("open instagram")) {
        readout("Opening Instagram in a new tab");
        addToChatHistory("nikk", "Opening Instagram in a new tab");
        openUrl("https://www.instagram.com/");

    
    
    } else if (transcript.includes("search")) {
    let query = transcript.toLowerCase();

    // YouTube
    if (query.includes("on youtube")) {
        let search = query.replace("search", "").replace("on youtube", "").trim();
        readout(`Searching YouTube for ${search}`);
        addToChatHistory("nikk", `Searching YouTube for ${search}`);
        openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`);
    }

     // Default: Google
    else {
        query = query.replace("search", "").replace("in google", "").replace("on google", "").trim();
        if (query.length > 0) {
            readout(`Searching Google for ${query}`);
            addToChatHistory("nikk", `Searching Google for ${query}`);
            openUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        } else {
            readout("What do you want me to search?");
            addToChatHistory("nikk", "What do you want me to search?");
        }
    }


    } else if (transcript.includes("open github")) {
        readout("Opening GitHub in a new tab");
        addToChatHistory("nikk", "Opening GitHub in a new tab");
        openUrl("https://github.com/");
    } else if (transcript.includes("my github")) {
        if (userdata.Github) {
            readout("Opening your GitHub profile in a new tab");
            openUrl(`https://github.com/${userdata.Github}`);
        } else {
            readout("Please set up your GitHub username first");
        }
    } else if (transcript.includes("weather in")) {
        const location = transcript.split("weather in")[1]?.trim();
        if (location) {
            readout(`Fetching weather for ${location}`);
            getData(location);
        } else {
            readout("Please specify a location");
        }
    } else if (transcript.includes("what's the weather") || transcript.includes("weather")) {
        readout("Fetching weather information for your current location");
        getData(userdata.location || "London");
    } else {
        readout("I didn't understand that command.");
        addToChatHistory("nikk", "Try: open YouTube, open Google, search something, or ask about the weather.");
    }
};

startBtn.addEventListener("click", () => recognition.start());
stopBtn.addEventListener("click", () => recognition.stop());
speakBtn.addEventListener("click", () => readout("It's my first AI and my AI name is Nikk"));

// Initial setup check
window.onload = () => {
    const savedData = localStorage.getItem("nikk_setup");
    if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.location) {
            getData(parsed.location);
        }
    } else {
        setup.style.display = "block";
        setup.querySelector("button").addEventListener("click", userInfo);
    }
};

// Dark mode toggle
const toggleBtn = document.getElementById('toggle-theme');
function updateThemeButton(isDark) {
    toggleBtn.innerHTML = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}
const darkPref = localStorage.getItem('dark-mode') === 'true';
if (darkPref) document.body.classList.add('dark');
updateThemeButton(darkPref);
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('dark-mode', isDark);
    updateThemeButton(isDark);
});
