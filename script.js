let tempChart;
let windChart;
let flightChart;



// MAIN MAP
const map = L.map('map', {
    zoomControl: false
}).setView([22.5, 88.3], 6);



// DARK MAP
L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);



// MINIMAP
const minimap = L.map('minimap', {

    attributionControl: false,

    zoomControl: false,

    dragging: false,

    scrollWheelZoom: false

}).setView([22.5, 88.3], 3);



L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
).addTo(minimap);



// ZOOM CONTROL
L.control.zoom({
    position: 'topleft'
}).addTo(map);



// DATA STORAGE
let allData = [];



// LAYERS
let pointLayers = [];
let tempLayers = [];
let windLayers = [];



// SLIDERS
const tempSlider =
    document.getElementById('temp-slider');

const windSlider =
    document.getElementById('wind-slider');

const flightSlider =
    document.getElementById('flight-slider');




// INITIAL DATA LOAD
fetch('/api/airep')

    .then(response => response.json())

    .then(data => {

        allData = data;

        initializeSliders();

        renderData();

    });




// MAIN RENDER FUNCTION
function renderData() {

    clearLayers();

    const bounds = map.getBounds();



    // TOGGLES
    const showTemp =
        document.getElementById('toggle-temp').checked;

    const showWind =
        document.getElementById('toggle-wind').checked;

    const showPoints =
        document.getElementById('toggle-points').checked;



    // FILTER VALUES
    const fl =
        flightSlider.noUiSlider.get();

    const temp =
        tempSlider.noUiSlider.get();

    const wind =
        windSlider.noUiSlider.get();



    const flMin = parseFloat(fl[0]);
    const flMax = parseFloat(fl[1]);

    const tempMin = parseFloat(temp[0]);
    const tempMax = parseFloat(temp[1]);

    const windMin = parseFloat(wind[0]);
    const windMax = parseFloat(wind[1]);

    const startDate =
    startInput.value
        ? new Date(startInput.value)
        : null;

    const endDate =
    endInput.value
        ? new Date(endInput.value)
        : null;



    // FILTER DATA
    const filtered = allData.filter(point => {

        const insideViewport =
            bounds.contains([
                point.latitude,
                point.longitude
            ]);



        const pointDate = new Date(
    point.date + "T" + point.time + "Z"
);

const insideDateRange =
    (!startDate || pointDate >= startDate) &&
    (!endDate || pointDate <= endDate);

return (

    insideViewport &&

    insideDateRange &&

    point.flight_level >= flMin &&
    point.flight_level <= flMax &&

    point.temperature >= tempMin &&
    point.temperature <= tempMax &&

    point.wind_speed >= windMin &&
    point.wind_speed <= windMax

);

    });



    updateStatistics(filtered);

    updateCharts(filtered);




    // DRAW AIRCRAFT
    filtered.forEach(point => {

        const latlng = [
            point.latitude,
            point.longitude
        ];



        const color =
            getTemperatureColor(point.temperature);



        // OBSERVATION POINTS
        if(showPoints) {

            const marker = L.circleMarker(latlng, {

                radius:
                    getWindRadius(point.wind_speed),

                fillColor: color,

                color: '#ffffff',

                weight: 1,

                opacity: 1,

                fillOpacity: 0.9

            }).addTo(map);



           marker.bindPopup(`

<div class="airep-popup">

    <div class="popup-title">
        ${point.aircraft}
    </div>

    <div class="popup-row">
        <span class="popup-label">UTC</span>
        <span>${point.time}</span>
    </div>

    <div class="popup-row">
        <span class="popup-label">Latitude</span>
        <span>${point.latitude.toFixed(2)}°</span>
    </div>

    <div class="popup-row">
        <span class="popup-label">Longitude</span>
        <span>${point.longitude.toFixed(2)}°</span>
    </div>

    <div class="popup-row">
        <span class="popup-label">Flight Level</span>
        <span>FL${point.flight_level / 100}</span>
    </div>

    <div class="popup-row">
        <span class="popup-label">Temperature</span>

        <span style="
            color:${color};
            font-weight:bold;
        ">
            ${point.temperature}°C
        </span>
    </div>

    <div class="popup-row">
        <span class="popup-label">Wind</span>
        <span>
            ${point.wind_dir}° /
            ${point.wind_speed}KT
        </span>
    </div>

    <div class="popup-divider"></div>

    <div class="popup-raw">
        ${point.raw_message}
    </div>

</div>

`);



            pointLayers.push(marker);

        }



        // TEMPERATURE LABELS
        if(showTemp) {

            const tempLabel = L.marker(latlng, {

                icon: L.divIcon({

                    className: 'temp-label',

                    html: `
                        <div style="
                            background:${color};
                            color:white;
                            padding:4px 8px;
                            border-radius:6px;
                            font-size:12px;
                            border:1px solid rgba(255,255,255,0.2);
                            box-shadow:0 0 10px rgba(0,0,0,0.5);
                        ">
                            ${point.temperature}°C
                        </div>
                    `

                })

            }).addTo(map);



            tempLayers.push(tempLabel);

        }



        // WIND BARBS
        if(showWind) {

    const windOffsetLat =
    point.latitude + 0.18;

const windOffsetLon =
    point.longitude + 0.18;


const windBarb = L.marker(
    [
        windOffsetLat,
        windOffsetLon
    ],
        {

            icon: L.divIcon({

                className: 'wind-barb',

                html: `
                    <div
                        style="
                            transform:
                            rotate(${point.wind_dir}deg);
                        "
                    >
                        ${createWindBarb(
                            point.wind_speed,
                            color
                        )}
                    </div>
                `,

                iconSize: [60, 60],

                iconAnchor: [15, 30]

            })

        }

    ).addTo(map);


    windLayers.push(windBarb);

}

    });

}




// CLEAR LAYERS
function clearLayers() {

    [
        ...pointLayers,
        ...tempLayers,
        ...windLayers
    ].forEach(layer => {

        map.removeLayer(layer);

    });



    pointLayers = [];
    tempLayers = [];
    windLayers = [];

}




// STATISTICS
function updateStatistics(data) {

    document.getElementById('visible-count')
        .innerText = data.length;



    if(data.length === 0) {

        document.getElementById('avg-temp')
            .innerText = 0;

        document.getElementById('max-wind')
            .innerText = 0;

        return;

    }



    const avgTemp =
        data.reduce(
            (sum, p) => sum + p.temperature,
            0
        ) / data.length;



    const maxWind =
        Math.max(
            ...data.map(p => p.wind_speed)
        );



    document.getElementById('avg-temp')
        .innerText = avgTemp.toFixed(1);

    document.getElementById('max-wind')
        .innerText = maxWind;

}




// HISTOGRAMS
function updateCharts(data) {

    const temps =
        data.map(p => p.temperature);

    const winds =
        data.map(p => p.wind_speed);

    const flights =
        data.map(p => p.flight_level);




    // TEMPERATURE BINS
    const tempBins = [

        temps.filter(t => t <= -60).length,

        temps.filter(t =>
            t > -60 && t <= -40).length,

        temps.filter(t =>
            t > -40 && t <= -20).length,

        temps.filter(t =>
            t > -20 && t <= 0).length,

        temps.filter(t => t > 0).length

    ];




    // WIND BINS
    const windBins = [

        winds.filter(w => w <= 20).length,

        winds.filter(w =>
            w > 20 && w <= 40).length,

        winds.filter(w =>
            w > 40 && w <= 60).length,

        winds.filter(w =>
            w > 60 && w <= 80).length,

        winds.filter(w => w > 80).length

    ];




    // FLIGHT LEVEL BINS
    const flightBins = [

        flights.filter(f => f < 20000).length,

        flights.filter(f =>
            f >= 20000 && f < 30000).length,

        flights.filter(f =>
            f >= 30000 && f < 40000).length,

        flights.filter(f => f >= 40000).length

    ];




    // DESTROY OLD CHARTS
    if(tempChart)
        tempChart.destroy();

    if(windChart)
        windChart.destroy();

    if(flightChart)
        flightChart.destroy();




    // FLIGHT LEVEL CHART
    flightChart = new Chart(

        document.getElementById('flightChart'),

        {

            type: 'bar',

            data: {

                labels: [
                    'FL100-200',
                    'FL200-300',
                    'FL300-400',
                    'FL400+'
                ],

                datasets: [{

                    data: flightBins,

                    backgroundColor: [
                        '#00c853',
                        '#64dd17',
                        '#ffd600',
                        '#ff9800'
                    ]

                }]

            },

            options: chartOptions()

        }

    );




    // TEMPERATURE CHART
    tempChart = new Chart(

        document.getElementById('tempChart'),

        {

            type: 'bar',

            data: {

                labels: [
                    '<-60',
                    '-60 to -40',
                    '-40 to -20',
                    '-20 to 0',
                    '>0'
                ],

                datasets: [{

                    data: tempBins,

                    backgroundColor: [
                        '#0015ff',
                        '#006eff',
                        '#00c8ff',
                        '#00d26a',
                        '#ff1744'
                    ]

                }]

            },

            options: chartOptions()

        }

    );




    // WIND CHART
    windChart = new Chart(

        document.getElementById('windChart'),

        {

            type: 'bar',

            data: {

                labels: [
                    '0-20',
                    '20-40',
                    '40-60',
                    '60-80',
                    '>80'
                ],

                datasets: [{

                    data: windBins,

                    backgroundColor: [
                        '#00d26a',
                        '#00c8ff',
                        '#ffc400',
                        '#ff9800',
                        '#ff1744'
                    ]

                }]

            },

            options: chartOptions()

        }

    );

}




// COMMON CHART OPTIONS
function chartOptions() {

    return {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false
            }

        },

        scales: {

            x: {

                ticks: {
                    color: 'white'
                },

                grid: {
                    display: false
                }

            },

            y: {

                ticks: {
                    color: 'white'
                },

                grid: {
                    color:
                        'rgba(255,255,255,0.05)'
                }

            }

        }

    };

}




// TEMPERATURE COLORS
function getTemperatureColor(temp) {

    if(temp <= -60)
        return '#0015ff';

    if(temp <= -40)
        return '#006eff';

    if(temp <= -20)
        return '#00c8ff';

    if(temp <= 0)
        return '#00d26a';

    if(temp <= 20)
        return '#ffc400';

    return '#ff1744';

}




// WIND SIZE
function getWindRadius(speed) {

    if(speed < 20)
        return 5;

    if(speed < 40)
        return 8;

    if(speed < 70)
        return 12;

    return 16;

}

function createWindBarb(speed, color) {

    let svg = `
        <svg width="60" height="60">

            <!-- MAIN SHAFT -->
            <line
                x1="10"
                y1="30"
                x2="45"
                y2="30"
                stroke="${color}"
                stroke-width="3"
            />
    `;


    let x = 45;

    let remaining = speed;


    // 50 KT TRIANGLES
    while(remaining >= 50) {

        svg += `
            <polygon
                points="
                    ${x},30
                    ${x-12},22
                    ${x-12},30
                "
                fill="${color}"
            />
        `;

        x -= 10;

        remaining -= 50;
    }


    // 10 KT BARBS
    while(remaining >= 10) {

        svg += `
            <line
                x1="${x}"
                y1="30"
                x2="${x-10}"
                y2="20"
                stroke="${color}"
                stroke-width="3"
            />
        `;

        x -= 6;

        remaining -= 10;
    }


    // 5 KT HALF BARB
    if(remaining >= 5) {

        svg += `
            <line
                x1="${x}"
                y1="30"
                x2="${x-6}"
                y2="24"
                stroke="${color}"
                stroke-width="3"
            />
        `;
    }


    svg += `</svg>`;


    return svg;
}




// INITIALIZE SLIDERS
function initializeSliders() {

    noUiSlider.create(flightSlider, {

        start: [10000, 45000],

        connect: true,

        range: {

            min: 10000,
            max: 45000

        }

    });



    noUiSlider.create(tempSlider, {

        start: [-70, 40],

        connect: true,

        range: {

            min: -70,
            max: 40

        }

    });



    noUiSlider.create(windSlider, {

        start: [0, 120],

        connect: true,

        range: {

            min: 0,
            max: 120

        }

    });



    flightSlider.noUiSlider.on(
        'update',
        loadFilteredData
    );

    tempSlider.noUiSlider.on(
        'update',
        loadFilteredData
    );

    windSlider.noUiSlider.on(
        'update',
        loadFilteredData
    );

}




// RESET FILTERS
function resetFilters() {

    flightSlider.noUiSlider.set([
        10000,
        45000
    ]);

    tempSlider.noUiSlider.set([
        -70,
        40
    ]);

    windSlider.noUiSlider.set([
        0,
        120
    ]);



    loadFilteredData();

}




// MAP EVENTS
map.on('moveend', loadFilteredData);




// TOGGLES
document.getElementById('toggle-temp')
    .addEventListener('change', renderData);

document.getElementById('toggle-wind')
    .addEventListener('change', renderData);

document.getElementById('toggle-points')
    .addEventListener('change', renderData);




// AUTO REFRESH
// AUTO REFRESH
setInterval(loadFilteredData, 10000);

/* ===========================================================
   DATE TIME FILTER
=========================================================== */

const startInput = document.getElementById("start-time");
const endInput   = document.getElementById("end-time");

const quickButtons = document.querySelectorAll(".quick-btn");


function formatDateTimeLocal(date){

    const y = date.getUTCFullYear();

    const m = String(date.getUTCMonth()+1).padStart(2,"0");

    const d = String(date.getUTCDate()).padStart(2,"0");

    const h = String(date.getUTCHours()).padStart(2,"0");

    const min = String(date.getUTCMinutes()).padStart(2,"0");

    return `${y}-${m}-${d}T${h}:${min}`;

}



function applyQuickRange(hours){

    const end = new Date();

    const start = new Date(
        end.getTime() -
        hours*60*60*1000
    );

    startInput.value =
        formatDateTimeLocal(start);

    endInput.value =
        formatDateTimeLocal(end);

    loadFilteredData();

}



quickButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        quickButtons.forEach(
            b=>b.classList.remove("active")
        );

        btn.classList.add("active");

        applyQuickRange(
            parseInt(btn.dataset.hours)
        );

    });

});



startInput.addEventListener(
    "change",
    loadFilteredData
);

endInput.addEventListener(
    "change",
    loadFilteredData
);



async function loadFilteredData(){

    const fl =
        flightSlider.noUiSlider.get();

    const temp =
        tempSlider.noUiSlider.get();

    const wind =
        windSlider.noUiSlider.get();

    const params = new URLSearchParams({

        temp_min: temp[0],
        temp_max: temp[1],

        fl_min: fl[0],
        fl_max: fl[1],

        wind_min: wind[0],
        wind_max: wind[1]

    });



    if(startInput.value && endInput.value){

        params.append(
            "start_date",
            startInput.value.substring(0,10)
        );

        params.append(
            "end_date",
            endInput.value.substring(0,10)
        );

    }



    const response =
        await fetch(
            "/api/filter?" +
            params.toString()
        );

    allData =
        await response.json();

    renderData();

}



applyQuickRange(48);