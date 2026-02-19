// =====================================================
// SAFEGAURD AI - PROFESSIONAL SCRIPT
// =====================================================


// =====================================================
// 🗺 MAP + LIVE LOCATION
// =====================================================

let map;
let userMarker;

if (document.getElementById("map")) {

    map = L.map('map').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Heatmap Data (Demo Risk Zones)
    const heatData = [
        [12.9716, 77.5946, 0.9],
        [12.9730, 77.5950, 0.8],
        [12.9700, 77.5900, 0.6],
        [12.9680, 77.6000, 0.4],
        [12.9650, 77.5920, 0.7]
    ];

    L.heatLayer(heatData, {
        radius: 25,
        blur: 20,
        maxZoom: 17,
    }).addTo(map);

    // Example Risk Marker
    L.marker([28.6139, 77.2090])
        .addTo(map)
        .bindPopup("High Risk Area - Delhi");

    // Live Location Tracking
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            map.setView([lat, lng], 15);

            if (!userMarker) {
                userMarker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("📍 You are here")
                    .openPopup();
            } else {
                userMarker.setLatLng([lat, lng]);
            }

            // Send location to backend
            fetch("/update-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat: lat, lng: lng })
            });

        });
    }
}


// =====================================================
// 💓 HEART RATE SIMULATION
// =====================================================

setInterval(() => {

    const heart = document.getElementById("heart");
    if (!heart) return;

    let bpm = Math.floor(Math.random() * 20) + 85;
    heart.innerText = bpm + " bpm";

    if (bpm > 100) {
        heart.style.color = "red";
    } else {
        heart.style.color = "#ff6f91";
    }

}, 4000);


// =====================================================
// 🌸 PARTICLE BACKGROUND
// =====================================================

const canvas = document.getElementById("particles");

if (canvas) {

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3;
            this.speedY = Math.random() * 1 + 0.2;
        }

        update() {
            this.y += this.speedY;
            if (this.y > canvas.height) {
                this.y = 0;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            ctx.fillStyle = "rgba(255,182,193,0.6)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        for (let i = 0; i < 100; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
}


// =====================================================
// 🧠 AI RISK CALCULATION
// =====================================================

function calculateRisk() {

    const heartEl = document.getElementById("heart");
    const stressEl = document.getElementById("stress");
    const fallEl = document.getElementById("fall");

    if (!heartEl || !stressEl || !fallEl) return;

    let heart = Math.floor(Math.random() * 40) + 70;
    let stress = Math.floor(Math.random() * 60) + 20;
    let fall = Math.random() > 0.85 ? "Detected" : "Normal";

    heartEl.innerText = heart + " bpm";
    stressEl.innerText = stress + "%";
    fallEl.innerText = fall;

    let riskScore = (heart - 70) + stress;
    if (fall === "Detected") riskScore += 30;
    if (riskScore > 100) riskScore = 100;

    const riskValue = document.getElementById("riskValue");
    const label = document.getElementById("riskLabel");
    const circle = document.querySelector(".risk-circle");

    if (!riskValue || !label || !circle) return;

    riskValue.innerText = riskScore;

    if (riskScore < 40) {
        label.innerText = "Low Risk";
        label.style.color = "green";
    } else if (riskScore < 75) {
        label.innerText = "Medium Risk";
        label.style.color = "orange";
    } else {
        label.innerText = "High Risk ⚠";
        label.style.color = "red";
        document.getElementById("emergencyModal").style.display = "flex";
    }

    updateChart(riskScore);
}

setInterval(calculateRisk, 4000);


// =====================================================
// 📊 RISK CHART
// =====================================================

let riskHistory = [];
let labels = [];
let chart;

const chartCanvas = document.getElementById('riskChart');

if (chartCanvas) {

    chart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Risk Score',
                data: riskHistory,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: { min: 0, max: 100 }
            }
        }
    });
}

function updateChart(score) {
    if (!chart) return;

    if (riskHistory.length > 10) {
        riskHistory.shift();
        labels.shift();
    }

    riskHistory.push(score);
    labels.push(new Date().toLocaleTimeString());

    chart.update();
}


// =====================================================
// 🎙 VOICE DISTRESS DETECTION
// =====================================================

function startVoiceDetection() {

    const status = document.getElementById("voiceStatus");
    if (!status) return;

    if (!('webkitSpeechRecognition' in window)) {
        status.innerText = "Speech recognition not supported.";
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.start();
    status.innerText = "Listening...";

    recognition.onresult = function(event) {

        const transcript = event.results[0][0].transcript.toLowerCase();
        status.innerText = "Detected: " + transcript;

        if (
            transcript.includes("help") ||
            transcript.includes("emergency") ||
            transcript.includes("save me")
        ) {
            document.getElementById("emergencyModal").style.display = "flex";
        }
    };

    recognition.onerror = function() {
        status.innerText = "Voice detection error.";
    };
}


// =====================================================
// 🚨 SOS BUTTON
// =====================================================

let sosClicked = false;

document.getElementById("sos-btn").addEventListener("click", function () {

    if (sosClicked) return;  // Prevent multiple triggers
    sosClicked = true;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            fetch("/sos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lat: latitude,
                    lng: longitude
                })
            })
            .then(response => response.json())
            .then(data => {
                alert("SOS Sent Successfully!");
                sosClicked = false;
            })
            .catch(error => {
                alert("Error sending SOS!");
                sosClicked = false;
            });

        });
    }
});
// =====================================================
// 🔥 CLOSE MODAL
// =====================================================

function closeModal() {
    const modal = document.getElementById("emergencyModal");
    if (modal) modal.style.display = "none";
}


// =====================================================
// 🧠 FETCH AI STATUS FROM BACKEND
// =====================================================

fetch("/ai-status")
.then(res => res.json())
.then(data => {
    console.log("AI Risk Level:", data.risk_level);
});
function startSafetyTimer(minutes = 1) {

    alert("Safety timer started for " + minutes + " minute.");

    setTimeout(() => {
        alert("Timer expired. Sending SOS.");
        document.getElementById("sosBtn").click();
    }, minutes * 60000);
}
function toggleTheme() {
    document.body.classList.toggle("dark");
}
window.addEventListener("offline", () => alert("You are offline"));
setInterval(() => {
    document.getElementById("liveTime").innerText = new Date().toLocaleTimeString();
}, 1000);

