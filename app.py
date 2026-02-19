from flask import Flask, render_template, request, redirect, session, jsonify, url_for
import sqlite3
import datetime
from twilio.rest import Client
from dotenv import load_dotenv
import os
load_dotenv()
app = Flask(__name__)
app.secret_key = "supersecretkey"

# =========================
# DATABASE INIT
# =========================
def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            lat TEXT,
            lng TEXT,
            time TEXT
        )
    """)

    conn.commit()
    conn.close()

init_db()

def connect_db():
    return sqlite3.connect("database.db")

# =========================
# HOME (Landing Page)
# =========================
@app.route("/")
def home():
    return render_template("index.html")

# =========================
# REGISTER
# =========================
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = connect_db()
        cursor = conn.cursor()

        # Check if username already exists
        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        existing_user = cursor.fetchone()
        if existing_user:
            conn.close()
            return "User already exists!"

        # Insert new user with plain password
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)",
                       (username, password))
        conn.commit()
        conn.close()

        return redirect(url_for("login"))

    return render_template("register.html")

# =========================
# LOGIN
# =========================
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        user = cursor.fetchone()
        print("DEBUG:", user)  # Check database record

        if user and user[2] == password:  # Compare plain text
            session["user"] = username
            conn.close()
            return redirect(url_for("dashboard"))
        else:
            conn.close()
            return "Invalid Credentials"

    return render_template("login.html")

# =========================
# DASHBOARD
# =========================
@app.route("/dashboard")
def dashboard():
    if "user" in session:
        return render_template("dashboard.html", username=session["user"])
    return redirect(url_for("login"))

# =========================
# LOGOUT
# =========================
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

# =========================
# SOS
# =========================
@app.route("/sos", methods=["POST"])
def sos():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    lat = data.get("lat")
    lng = data.get("lng")

    # =========================
    # STORE IN DATABASE
    # =========================
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO tracking (username, lat, lng, time) VALUES (?, ?, ?, ?)",
        (session["user"], lat, lng, str(datetime.datetime.now()))
    )

    conn.commit()
    conn.close()

    # =========================
    # TWILIO CONFIGURATION
    # =========================
    account_sid = os.getenv("AC62e0b6ef3121bdcbfbe148782c7c899a")
    auth_token = os.getenv("0888d0c030ed792bdc0f9e971041818e")
    twilio_number = os.getenv("+16613828341")
    emergency_number = os.getenv("+919344758278")

    try:
        client = Client(account_sid, auth_token)

        # SEND SMS
        message = client.messages.create(
            body=f"🚨 EMERGENCY ALERT!\nUser: {session['user']}\nLocation: https://maps.google.com/?q={lat},{lng}",
            from_=twilio_number,
            to=emergency_number
        )

        # MAKE CALL
        call = client.calls.create(
            twiml=f'<Response><Say>Emergency alert! {session["user"]} may be in danger. Please check location immediately.</Say></Response>',
            from_=twilio_number,
            to=emergency_number
        )

        return jsonify({
            "status": "SOS stored, SMS sent, and call initiated"
        })

    except Exception as e:
        print("TWILIO ERROR:", e)
        return jsonify({
            "status": "SOS stored but alert failed",
            "error": str(e)
        })


# =========================
# AI STATUS
# =========================
@app.route("/ai-status")
def ai_status():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 403

    hour = datetime.datetime.now().hour

    if 22 <= hour or hour <= 5:
        risk_score = 80
        risk_level = "HIGH"
    elif 18 <= hour < 22:
        risk_score = 55
        risk_level = "MEDIUM"
    else:
        risk_score = 20
        risk_level = "LOW"

    return jsonify({
        "risk_score": risk_score,
        "risk_level": risk_level
    })
# =========================
# PROFILE PAGE
# =========================
@app.route("/profile")
def profile():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("profile.html", user=session["user"])

# =========================
# HISTORY PAGE
# =========================
@app.route("/history")
def history():
    if "user" not in session:
        return redirect(url_for("login"))

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tracking WHERE username=? ORDER BY id DESC", (session["user"],))
    records = cursor.fetchall()
    conn.close()

    return render_template("history.html", user=session["user"], records=records)

if __name__ == "__main__":
    app.run(debug=True)
