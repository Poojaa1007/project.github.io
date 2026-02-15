var map = L.map('map').setView([20.5937, 78.9629], 5);
// Simulated historical risk data
var heatData = [
    [12.9716, 77.5946, 0.9],  // High
    [12.9730, 77.5950, 0.8],
    [12.9700, 77.5900, 0.6],  // Medium
    [12.9680, 77.6000, 0.4],  // Low
    [12.9650, 77.5920, 0.7]
];

var heat = L.heatLayer(heatData, {
    radius: 25,
    blur: 20,
    maxZoom: 17,
}).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

L.marker([28.6139, 77.2090]).addTo(map)
    .bindPopup("High Risk Area - Delhi");
// Heartbeat Simulation
setInterval(() => {
    let heart = document.getElementById("heart");
    if (!heart) return;

    let bpm = Math.floor(Math.random() * 20) + 85;
    heart.innerText = bpm + " bpm";

    if (bpm > 100) {
        heart.style.color = "red";
        alert("⚠ High Heart Rate Detected!");
    } else {
        heart.style.color = "#ff6f91";
    }
}, 4000);
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
function calculateRisk() {

    let heart = Math.floor(Math.random() * 40) + 70;
    let stress = Math.floor(Math.random() * 60) + 20;
    let fall = Math.random() > 0.85 ? "Detected" : "Normal";

    document.getElementById("heart").innerText = heart + " bpm";
    document.getElementById("stress").innerText = stress + "%";
    document.getElementById("fall").innerText = fall;

    let riskScore = (heart - 70) + stress;
    if (fall === "Detected") riskScore += 30;

    if (riskScore > 100) riskScore = 100;

    document.getElementById("riskValue").innerText = riskScore;

    let label = document.getElementById("riskLabel");
    let circle = document.querySelector(".risk-circle");

    if (riskScore < 40) {
        label.innerText = "Low Risk";
        label.style.color = "green";
        circle.style.background = "linear-gradient(145deg,#a8e063,#56ab2f)";
    }
    else if (riskScore < 75) {
        label.innerText = "Medium Risk";
        label.style.color = "orange";
        circle.style.background = "linear-gradient(145deg,#f6d365,#fda085)";
    }
    else {
        label.innerText = "High Risk ⚠";
        label.style.color = "red";
        circle.style.background = "linear-gradient(145deg,#ff416c,#ff4b2b)";
        document.getElementById("emergencyModal").style.display = "flex";
    }

}
setInterval(calculateRisk, 4000);
function closeModal() {
    document.getElementById("emergencyModal").style.display = "none";
}
function startVoiceDetection() {

    const status = document.getElementById("voiceStatus");

    if (!('webkitSpeechRecognition' in window)) {
        status.innerText = "Speech recognition not supported in this browser.";
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
            transcript.includes("save me") ||
            transcript.includes("emergency") ||
            transcript.includes("stop") ||
            transcript.includes("please")
        ) {
            document.getElementById("emergencyModal").style.display = "flex";
        }
    };

    recognition.onerror = function() {
        status.innerText = "Voice detection error.";
    };
}
let riskHistory = [];
let labels = [];

const ctx = document.getElementById('riskChart');

if (ctx) {

    const chart = new Chart(ctx, {
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
                y: {
                    min: 0,
                    max: 100
                }
            }
        }
    });

    function updateChart(score) {
        if (riskHistory.length > 10) {
            riskHistory.shift();
            labels.shift();
        }

        riskHistory.push(score);
        labels.push(new Date().toLocaleTimeString());

        chart.update();
    }

    // Modify your calculateRisk function:
    const originalCalculateRisk = calculateRisk;

    calculateRisk = function() {
        originalCalculateRisk();
        let currentScore = parseInt(document.getElementById("riskValue").innerText);
        updateChart(currentScore);
    };
}