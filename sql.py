import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=192.168.1.13;"
    "DATABASE=ASMREPORTING;"
    "UID=AppUser;"
    "PWD=AppUser@123"
)

conn = pyodbc.connect(conn_str)
cursor = conn.cursor()
cursor.execute("SELECT 1")
print(cursor.fetchone())