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
├── auto_ingest.py
|---ingest.py
├── requirements.txt
├── database.sql
│
├── templates/
│
├── static/
│   ├── css/
│   ├── js/
│
├── scripts/
│
├── data/
│
└── README.md

---

## 📄 License

This project is intended for educational and research purposes.
