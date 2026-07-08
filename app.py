from flask import Flask, render_template, jsonify, request
import mysql.connector

app = Flask(__name__)

# ==========================================================
# DATABASE CONFIGURATION
# ==========================================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "airep_system"
}


# ==========================================================
# DATABASE CONNECTION
# ==========================================================

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


# ==========================================================
# MYSQL ROW -> JSON
# ==========================================================

def row_to_json(row):

    try:
        latitude, longitude = row["parsed_lat_long"].split(",")

        latitude = float(latitude)
        longitude = float(longitude)

    except Exception as e:
        print("Bad coordinates:", e)
        return None

    return {

        "aircraft": row["parsed_aircraft_id"],

        "latitude": latitude,

        "longitude": longitude,

        "date": str(row["parsed_date_in_utc"]),

        "time": str(row["parsed_hour_and_min_in_utc"]),

        "flight_level": row["parsed_flight_level_in_ft"],

        "temperature": row["parsed_temp_in_c"],

        "wind_dir": row["parsed_wind_dir"],

        "wind_speed": int(row["parsed_wind_speed_in_kt"]),

        "raw_message": row["content_line"],

        "entire_message": row["entire_unparsed_message"]

    }


# ==========================================================
# HOME
# ==========================================================

@app.route("/")
def home():
    return render_template("index.html")


# ==========================================================
# ALL DATA
# ==========================================================

@app.route("/api/airep")
def airep():

    try:

        db = get_connection()

        cursor = db.cursor(dictionary=True)

        cursor.execute("""

            SELECT *

            FROM airep_messages

            ORDER BY
                parsed_date_in_utc,
                parsed_hour_and_min_in_utc

        """)

        rows = cursor.fetchall()

        result = []

        for row in rows:

            item = row_to_json(row)

            if item is not None:
                result.append(item)

        cursor.close()
        db.close()

        return jsonify(result)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }),500


# ==========================================================
# FILTER
# ==========================================================

@app.route("/api/filter")
def filter_data():

    temp_min=request.args.get("temp_min",-100,type=int)
    temp_max=request.args.get("temp_max",100,type=int)

    fl_min=request.args.get("fl_min",0,type=int)
    fl_max=request.args.get("fl_max",50000,type=int)

    wind_min=request.args.get("wind_min",0,type=int)
    wind_max=request.args.get("wind_max",200,type=int)

    start_date=request.args.get("start_date")
    end_date=request.args.get("end_date")

    if start_date:
        start_date=start_date[:10]

    if end_date:
        end_date=end_date[:10]

    sql="""

    SELECT *

    FROM airep_messages

    WHERE

    parsed_temp_in_c BETWEEN %s AND %s

    AND

    parsed_flight_level_in_ft BETWEEN %s AND %s

    AND

    CAST(parsed_wind_speed_in_kt AS UNSIGNED)

    BETWEEN %s AND %s

    """

    values=[

        temp_min,
        temp_max,

        fl_min,
        fl_max,

        wind_min,
        wind_max

    ]

    # if start_date and end_date:

    #     sql += """

    #     AND

    #     parsed_date_in_utc

    #     BETWEEN %s AND %s

    #     """

    #     values.extend([

    #         start_date,

    #         end_date

    #     ])

    sql += """

    ORDER BY

    parsed_date_in_utc,

    parsed_hour_and_min_in_utc

    """

    try:

        db=get_connection()

        cursor=db.cursor(dictionary=True)

        cursor.execute(sql,values)

        rows=cursor.fetchall()

        print("Rows Returned:",len(rows))

        result=[]

        for row in rows:

            item=row_to_json(row)

            if item is not None:

                result.append(item)

        cursor.close()

        db.close()

        return jsonify(result)

    except Exception as e:

        return jsonify({

            "error":str(e)

        }),500


# ==========================================================
# MAIN
# ==========================================================

if __name__=="__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )