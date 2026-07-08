import os
import shutil
import mysql.connector

from ingest import parse_airep

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
# FOLDERS
# ==========================================================

RECEPTION_FOLDER = "reception"
PROCESSED_FOLDER = os.path.join("archive", "processed")
ERROR_FOLDER = os.path.join("archive", "parsing_error")

os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(ERROR_FOLDER, exist_ok=True)

# ==========================================================
# SQL
# ==========================================================

INSERT_SQL = """
INSERT INTO airep_messages
(
file_name,
parsed_message_type,
parsed_date_in_utc,
parsed_aircraft_id,
parsed_lat_long,
parsed_hour_and_min_in_utc,
parsed_flight_level_in_ft,
parsed_temp_in_c,
parsed_wind_dir,
parsed_wind_speed_in_kt,
content_line,
entire_unparsed_message
)
VALUES
(
%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
)
"""

FAILED_SQL = """
INSERT INTO failed_airep_messages
(
file_name,
error_reason,
raw_message
)
VALUES
(
%s,%s,%s
)
"""

# ==========================================================
# CONNECT
# ==========================================================

db = mysql.connector.connect(**DB_CONFIG)
cursor = db.cursor()

# ==========================================================
# GET FILES
# ==========================================================

files = sorted(
    f for f in os.listdir(RECEPTION_FOLDER)
    if f.lower().endswith(".txt")
)

print()
print(f"Found {len(files)} files.")
print()

inserted = 0
failed = 0
duplicates = 0

# ==========================================================
# PROCESS
# ==========================================================

for index, filename in enumerate(files, start=1):

    filepath = os.path.join(RECEPTION_FOLDER, filename)

    print(f"[{index}/{len(files)}] {filename}")

    raw_message = ""

    try:

        # -----------------------------
        # Read file
        # -----------------------------

        with open(filepath, "r", encoding="utf-8") as file:
            raw_message = file.read()

        # File is CLOSED here

        # -----------------------------
        # Parse
        # -----------------------------

        parsed = parse_airep(raw_message)

        if parsed is None:

            print("Parser failed.")

            cursor.execute(
                FAILED_SQL,
                (
                    filename,
                    "Parser returned None",
                    raw_message
                )
            )

            db.commit()

            shutil.move(
                filepath,
                os.path.join(ERROR_FOLDER, filename)
            )

            failed += 1
            continue

        # -----------------------------
        # Duplicate Check
        # -----------------------------

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM airep_messages
            WHERE entire_unparsed_message=%s
            """,
            (raw_message,)
        )

        count = cursor.fetchone()[0]

        if count > 0:

            print("Duplicate skipped.")

            shutil.move(
                filepath,
                os.path.join(PROCESSED_FOLDER, filename)
            )

            duplicates += 1
            continue

        # -----------------------------
        # Insert
        # -----------------------------

        cursor.execute(
            INSERT_SQL,
            (
                filename,
                *parsed
            )
        )

        db.commit()

        shutil.move(
            filepath,
            os.path.join(PROCESSED_FOLDER, filename)
        )

        inserted += 1

        print("Inserted successfully.")

    except Exception as e:

        print("ERROR:")
        print(e)

        try:

            cursor.execute(
                FAILED_SQL,
                (
                    filename,
                    str(e),
                    raw_message
                )
            )

            db.commit()

        except Exception:
            pass

        try:

            if os.path.exists(filepath):

                shutil.move(
                    filepath,
                    os.path.join(ERROR_FOLDER, filename)
                )

        except Exception:
            pass

        failed += 1

# ==========================================================
# CLEANUP
# ==========================================================

cursor.close()
db.close()

print()
print("========================================")
print("IMPORT FINISHED")
print("========================================")
print("Inserted :", inserted)
print("Duplicates :", duplicates)
print("Failed :", failed)
print("========================================")