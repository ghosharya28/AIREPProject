# 🌍 AIREP Dashboard

A web-based dashboard for the visualization, management, and analysis of Aircraft Reports (AIREPs). This application parses meteorological AIREP messages, stores them in a MySQL database, and provides an interactive geographic interface for data visualization and filtering.

---

## 📌 Overview

The AIREP Dashboard was developed to facilitate the analysis of Aircraft Reports by providing:

- Interactive map visualization
- Advanced filtering of meteorological parameters
- Flight-level analysis
- Wind visualization
- Statistical summaries
- Automatic data ingestion
- Database management

The application is built using Flask and is intended for deployment on local or institutional servers.

---

## ✨ Features

- 📍 Interactive map using Leaflet.js
- 🛩️ Aircraft report visualization
- 🌡️ Temperature filtering
- 💨 Wind speed filtering
- ✈️ Flight level filtering
- 📅 Date and time filtering
- 📊 Histogram-based analysis
- 📌 Popup information for every aircraft report
- 🔄 Automatic data ingestion from AIREP text files
- 💾 MySQL database backend

---

## 🛠️ Technology Stack

### Backend

- Python
- Flask
- MySQL
- SQLAlchemy (if applicable)

### Frontend

- HTML5
- CSS3
- JavaScript
- Leaflet.js
- Chart.js (if used)

### Database

- MySQL

### Development Environment

- XAMPP
- Visual Studio Code

---

## 📂 Project Structure

```
AIREP-Dashboard/
│
├── app.py
├── config.py
├── requirements.txt
├── database.sql
│
├── templates/
│
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
├── scripts/
│
├── data/
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/AIREP-Dashboard.git
```

---

### 2. Navigate into the project

```bash
cd AIREP-Dashboard
```

---

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Create the MySQL database

Import

```
database.sql
```

using phpMyAdmin or MySQL Workbench.

---

### 5. Update database configuration

Modify

```
config.py
```

or

```
app.py
```

with your MySQL credentials.

Example

```python
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""
MYSQL_DB = "airep"
```

---

### 6. Run the application

```bash
python app.py
```

---

### 7. Open in browser

```
http://127.0.0.1:5000
```

---

## 📊 Dashboard Functions

- Aircraft position visualization
- Popup display of complete AIREP information
- Wind speed statistics
- Flight level analysis
- Temperature distribution
- Date-based filtering
- Interactive map navigation

---

## 📁 Input Data

The application accepts AIREP messages in text format.

Example:

```
ARP B737 N2230 E08815 FL350 MS45 PS12
```

These messages are automatically parsed and inserted into the database.

---

## 📸 Screenshots

*(Add screenshots here after uploading them.)*

Example:

```
screenshots/dashboard.png
screenshots/map.png
screenshots/filter.png
```

---

## 🔮 Future Improvements

- User authentication
- Live AIREP feed
- Automatic METAR integration
- Weather overlay
- Flight path visualization
- Data export (CSV/PDF)
- Analytics dashboard
- REST API support

---

## 👨‍💻 Author

**Tun**

Electronics and Communication Engineering

---

## 📄 License

This project is intended for educational and research purposes.
