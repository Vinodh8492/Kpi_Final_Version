# from extensions import db

# class KPIMaterial(db.Model):
#     __tablename__ = 'kpi_material'
#     # __tablename__ = 'BatchMaterials'
#     # __table_args__ = {'schema': 'dbo'}

#     Batch_GUID = db.Column('Batch GUID', db.String(100), primary_key=True)  # ✅ PRIMARY KEY
#     Batch_Name = db.Column('Batch Name', db.String(255))
#     Product_Name = db.Column('Product Name', db.String(255))
#     Batch_Act_Start = db.Column('Batch Act Start', db.DateTime)
#     Batch_Act_End = db.Column('Batch Act End', db.DateTime)
#     Quantity = db.Column('Quantity', db.Float)
#     Material_Name = db.Column('Material Name', db.String(255))
#     Material_Code = db.Column('Material Code', db.String(100))
#     SetPoint_Float = db.Column('SetPoint Float', db.Float)
#     Actual_Value_Float = db.Column('Actual Value Float', db.Float)
#     Source_Server = db.Column('Source Server', db.String(100))
#     ROOTGUID = db.Column('ROOTGUID', db.String(100))
#     OrderId = db.Column('OrderId', db.String(100))
#     EventID = db.Column('EventID', db.String(100))
#     Batch_Transfer_Time = db.Column('Batch Transfer Time', db.String(100))
#     FormulaCategoryName = db.Column('FormulaCategoryName', db.String(255))

#     def __repr__(self):
#         return f"<KPIMaterial {self.Batch_Name}>"

from extensions import db

class KPIMaterial(db.Model):
    __tablename__ = 'kpi_material'

    id = db.Column(db.Integer, primary_key=True)
    
    batch_guid = db.Column(db.String(100))                  # UUID
    batch_name = db.Column(db.String(255))                  # Text
    product_name = db.Column(db.String(255))                # Text
    batch_act_start = db.Column(db.DateTime)                # Timestamp
    batch_act_end = db.Column(db.DateTime)                  # Timestamp
    quantity = db.Column(db.Float)                          # Numeric
    material_name = db.Column(db.String(255))               # Text
    material_code = db.Column(db.String(100))               # Usually a string of digits
    setpoint_float = db.Column(db.Float)                    # Float
    actual_value_float = db.Column(db.Float)                # Float
    source_server = db.Column(db.String(100))               # Server name
    rootguid = db.Column(db.String(100))                    # UUID
    order_id = db.Column(db.String(100))                    # Order number or ID
    event_id = db.Column(db.String(100))                    # Event identifier
    batch_transfer_time = db.Column(db.String(100))         # Can be datetime or string (nullable)
    formula_category_name = db.Column(db.String(255))       # Category (nullable)

    def __repr__(self):
        return f"<KPIMaterial {self.batch_name}>"