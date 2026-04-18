// ===== DOM Elements =====
const startBtn = document.querySelector("#start");
const stopBtn  = document.querySelector("#stop");
const speakBtn = document.querySelector("#speak");
const statusIndicator = document.querySelector("#status");
const visualFeedback  = document.querySelector("#visual-feedback");
const setup    = document.querySelector(".nikk_setup");
const avatar   = document.querySelector("#avatar");
const voiceBar = document.querySelector("#voice-bar");

// ===== Avatar Animation =====
function setAvatarState(state) {
    avatar.classList.remove('talking', 'idle');
    if (state) avatar.classList.add(state);
}

// ===== Visual Feedback =====
function updateVisualFeedback(isListening) {
    if (isListening) {
        visualFeedback.classList.add('listening');
        statusIndicator.textContent = '● Listening...';
        statusIndicator.classList.add('listening');
        voiceBar.classList.add('active');
    } else {
        visualFeedback.classList.remove('listening');
        statusIndicator.textContent = '● Ready';
        statusIndicator.classList.remove('listening');
        voiceBar.classList.remove('active');
        voiceBar.style.width = '0%';
    }
}

// ===== Kelvin to Celsius =====
function ktc(k) { return (k - 273.15).toFixed(1); }

// ===== Weather =====
function getData(location) {
    const weatherCont = document.querySelector(".temp").querySelectorAll("*");
    const city = location?.trim();
    if (!city) { weatherCont[0].textContent = "Please enter a valid location."; return; }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=48ddfe8c9cf29f95b7d0e54d6e171008`;

    fetch(url)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => {
            weatherCont[0].textContent = `Location : ${data.name}`;
            weatherCont[1].textContent = `Country : ${data.sys.country}`;
            weatherCont[2].textContent = `Weather type : ${data.weather[0].main}`;
            weatherCont[3].textContent = `Weather description : ${data.weather[0].description}`;
            weatherCont[4].src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            weatherCont[4].alt = data.weather[0].description;
            weatherCont[5].textContent = `Original Temperature : ${ktc(data.main.temp)}°C`;
            weatherCont[6].textContent = `But it feels like ${ktc(data.main.feels_like)}°C`;
            weatherCont[7].textContent = `Min temperature ${ktc(data.main.temp_min)}°C`;
            weatherCont[8].textContent = `Max temperature ${ktc(data.main.temp_max)}°C`;
        })
        .catch(() => { weatherCont[0].textContent = "Weather info not found. Check the location."; });
}

// ===== User Info =====
function userInfo() {
    let inputs = setup.querySelectorAll("input");
    let setupInfo = {
        name:      inputs[0].value,
        bio:       inputs[1].value,
        location:  inputs[2].value,
        instagram: inputs[3].value,
        Github:    inputs[4].value
    };
    if (Array.from(inputs).some(e => e.value === '')) {
        readout("Your information is not complete. Please fill all fields.");
    } else {
        localStorage.clear();
        localStorage.setItem("nikk_setup", JSON.stringify(setupInfo));
        setup.style.display = "none";
        getData(setupInfo.location);
        readout(`Welcome ${setupInfo.name}! I'm ready to assist you.`);
        addToChatHistory("nikk", `Welcome ${setupInfo.name}! 🎉 How can I help?`);
    }
}

// ===== Chat History =====
function addToChatHistory(sender, message) {
    const chatContainer = document.getElementById('chat-history');
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', sender);
    bubble.textContent = message;
    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ===== Speech Synthesis =====
function readout(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = 1;
    setAvatarState('talking');
    speech.onend = () => setAvatarState('');
    window.speechSynthesis.speak(speech);
}

// ===== Voice Recognition =====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.onstart = () => updateVisualFeedback(true);
recognition.onend   = () => updateVisualFeedback(false);

recognition.onresult = function(event) {
    let transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
    addToChatHistory("user", transcript);
    const userdata = localStorage.getItem("nikk_setup") ? JSON.parse(localStorage.getItem("nikk_setup")) : {};

    const openUrl = url => {
        const w = window.open(url, '_blank');
        if (!w) readout("Please allow pop-ups for this website.");
    };

    const respond = (msg) => { readout(msg); addToChatHistory("nikk", msg); };

    if (transcript.includes("hi nikk") || transcript.includes("hello nikk")) {
        respond(`Hello ${userdata.name || 'sir'}, how can I help you today?`);

    } else if (transcript.includes("open youtube")) {
        respond("Opening YouTube in a new tab.");
        openUrl("https://www.youtube.com/");

    } else if (transcript.includes("open google")) {
        respond("Opening Google in a new tab.");
        openUrl("https://www.google.com/");

    } else if (transcript.includes("open instagram")) {
        respond("Opening Instagram in a new tab.");
        openUrl("https://www.instagram.com/");

    } else if (transcript.includes("open github")) {
        respond("Opening GitHub in a new tab.");
        openUrl("https://github.com/");

    } else if (transcript.includes("my github")) {
        if (userdata.Github) {
            respond("Opening your GitHub profile.");
            openUrl(`https://github.com/${userdata.Github}`);
        } else {
            respond("Please set up your GitHub username first.");
        }

    } else if (transcript.includes("my instagram")) {
        if (userdata.instagram) {
            respond("Opening your Instagram profile.");
            openUrl(`https://www.instagram.com/${userdata.instagram}`);
        } else {
            respond("Please set up your Instagram username first.");
        }

    } else if (transcript.includes("search") && transcript.includes("on youtube")) {
        let search = transcript.replace("search","").replace("on youtube","").trim();
        respond(`Searching YouTube for ${search}`);
        openUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`);

    } else if (transcript.includes("search")) {
        let query = transcript.replace("search","").replace("in google","").replace("on google","").trim();
        if (query.length > 0) {
            respond(`Searching Google for ${query}`);
            openUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        } else {
            respond("What do you want me to search?");
        }

    } else if (transcript.includes("weather in")) {
        const loc = transcript.split("weather in")[1]?.trim();
        if (loc) { respond(`Fetching weather for ${loc}`); getData(loc); }
        else respond("Please specify a location.");

    } else if (transcript.includes("weather")) {
        respond("Fetching weather for your location.");
        getData(userdata.location || "London");

    } else if (transcript.includes("what time") || transcript.includes("current time")) {
        const time = new Date().toLocaleTimeString();
        respond(`The current time is ${time}`);

    } else if (transcript.includes("what date") || transcript.includes("today's date")) {
        const date = new Date().toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
        respond(`Today is ${date}`);

    } else if (transcript.includes("my name")) {
        respond(userdata.name ? `Your name is ${userdata.name}` : "Please set up your profile first.");

    } else if (transcript.includes("stop listening")) {
        recognition.stop();
        respond("Stopping voice recognition.");

    } else {
        respond("I didn't understand that command. Try: open YouTube, search something, or ask about the weather.");
    }
};

// ===== Buttons =====
startBtn.addEventListener("click", () => recognition.start());
stopBtn.addEventListener("click",  () => recognition.stop());
speakBtn.addEventListener("click", () => readout("Hello! I'm Nikk, your personal AI assistant. How can I help you today?"));

// ===== Init =====
window.onload = () => {
    const savedData = localStorage.getItem("nikk_setup");
    if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.location) getData(parsed.location);
        setup.style.display = "none";
    } else {
        setup.style.display = "block";
        setup.querySelector(".btn-submit").addEventListener("click", userInfo);
    }
};

// ===== Dark/Light Mode =====
const toggleBtn = document.getElementById('toggle-theme');
function updateThemeButton(isLight) {
    toggleBtn.innerHTML = isLight ? '🌙' : '☀️';
}
const lightPref = localStorage.getItem('light-mode') === 'true';
if (lightPref) document.body.classList.add('light');
updateThemeButton(lightPref);

toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('light-mode', isLight);
    updateThemeButton(isLight);
});