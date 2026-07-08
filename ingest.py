import re
from datetime import datetime


def parse_airep(message):

    try:

        # ----------------------------------------
        # CLEAN LINES
        # ----------------------------------------

        lines = [

            line.strip()

            for line in message.splitlines()

            if line.strip()

        ]

        if len(lines) < 2:

            return None

        # ----------------------------------------
        # HEADER
        # Example:
        # UAIN01 VECC 051740
        # ----------------------------------------

        header = re.split(r"\s+", lines[0])

        if len(header) < 3:

            return None

        date_token = header[-1]

        if len(date_token) != 6:

            return None

        day = int(date_token[:2])

        # ----------------------------------------
        # CURRENT UTC MONTH/YEAR
        # ----------------------------------------

        now = datetime.utcnow()

        parsed_date = datetime(

            now.year,

            now.month,

            day

        ).strftime("%Y-%m-%d")

        # ----------------------------------------
        # CONTENT
        # Example:
        # BAW16 1510N08850E 1740 F340 MS37 350/19KT=
        # ----------------------------------------

        parts = re.split(r"\s+", lines[1])

        if len(parts) < 6:

            return None

        aircraft = parts[0]

        location = parts[1]

        observation_time = parts[2]

        flight_level = parts[3]

        temperature = parts[4]

        wind = parts[5]

        # ----------------------------------------
        # UTC TIME
        # ----------------------------------------

        parsed_time = (

            observation_time[:2]

            + ":"

            + observation_time[2:]

            + ":00"

        )

        # ----------------------------------------
        # LATITUDE
        # ----------------------------------------

        lat_deg = int(location[0:2])

        lat_min = int(location[2:4])

        lat_dir = location[4]

        latitude = lat_deg + lat_min / 60

        if lat_dir == "S":

            latitude *= -1

        # ----------------------------------------
        # LONGITUDE
        # ----------------------------------------

        lon_deg = int(location[5:8])

        lon_min = int(location[8:10])

        lon_dir = location[10]

        longitude = lon_deg + lon_min / 60

        if lon_dir == "W":

            longitude *= -1

        lat_long = f"{latitude:.5f},{longitude:.5f}"

        # ----------------------------------------
        # FLIGHT LEVEL
        # ----------------------------------------

        flight_level_ft = int(

            flight_level.replace("F", "")

        ) * 100

        # ----------------------------------------
        # TEMPERATURE
        # ----------------------------------------

        if temperature.startswith("MS"):

            temperature_c = -int(

                temperature.replace("MS", "")

            )

        else:

            temperature_c = int(temperature)

        # ----------------------------------------
        # WIND
        # ----------------------------------------

        wind = wind.replace("KT=", "").replace("KT", "")

        wind_dir_text, wind_speed_text = wind.split("/")

        wind_direction = int(wind_dir_text)

        if wind_speed_text == "P99":

            wind_speed = 100

        else:

            wind_speed = int(

                re.sub(r"\D", "", wind_speed_text)

            )

        # ----------------------------------------
        # RETURN
        # ----------------------------------------

        return (

            "AIREP",

            parsed_date,

            aircraft,

            lat_long,

            parsed_time,

            flight_level_ft,

            temperature_c,

            wind_direction,

            wind_speed,

            lines[1],

            message

        )

    except Exception as e:

        print(f"[PARSE ERROR] {e}")

        return None


if __name__ == "__main__":

    print("Run auto_ingest.py")