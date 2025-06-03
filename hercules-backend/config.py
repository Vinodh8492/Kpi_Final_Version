import os
from sqlalchemy.engine.url import URL
from sqlalchemy import create_engine

class Config:
    SQLALCHEMY_DATABASE_URI = (
        # "SQLALCHEMY_DATABASE_URI",
        # "mssql+pyodbc://AppUser:AppUser%40123@192.168.1.13:1433/ASMREPORTING?driver=ODBC+Driver+17+for+SQL+Server"
        "mysql+pymysql://root:0000@localhost:3306/hercules_kpi"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

# if __name__ == "__main__":
#     engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
#     try:
#         with engine.connect() as connection:
#             result = connection.execute("SELECT * FROM dbo.BatchMaterials")
#             for row in result:
#                 print(row)
#     except Exception as e:
#         print(f"Error: {e}")