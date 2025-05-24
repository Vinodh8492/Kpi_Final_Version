# from flask import Blueprint, request, jsonify, current_app
# from extensions import db
# from models.kpi import KPI
# from models.kpi_material import KPIMaterial
# from datetime import datetime
# import traceback

# kpi_bp = Blueprint("kpi", __name__)

# # 🟢 Route to Insert KPI Data
# @kpi_bp.route("/kpi", methods=["POST"])
# def add_kpi():
#     try:
#         data = request.get_json()
#         new_kpi = KPI(
#             batch_guid=data.get("batch_guid"),
#             batch_name=data.get("batch_name"),
#             product_name=data.get("product_name"),
#             batch_act_start=datetime.strptime(data.get("batch_act_start"), "%Y-%m-%d %H:%M:%S"),
#         )
#         db.session.add(new_kpi)
#         db.session.commit()
#         return jsonify({"message": "KPI added successfully"}), 201
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400


# # 🟢 Route to Get All KPI Data
# @kpi_bp.route("/kpi", methods=["GET"])
# def get_kpis():
#     try:
#         current_app.logger.info("➡️ [KPI GET] Request received")

#         page = request.args.get("page", 1, type=int)
#         limit = request.args.get("limit", 1000, type=int)
#         current_app.logger.info(f"📄 Pagination params - page: {page}, limit: {limit}")

#         pagination = KPIMaterial.query.order_by(KPIMaterial.Batch_Act_Start.desc()).paginate(
#             page=page, per_page=limit, error_out=False
#         )
#         materials = pagination.items
#         current_app.logger.info(f"✅ Retrieved {len(materials)} materials")

#         kpi_list = []
#         for index, mat in enumerate(materials):
#             current_app.logger.debug(f"🔍 Material #{index + 1}: {mat.__dict__}")
#             kpi_list.append({
#                 "Batch GUID": mat.Batch_GUID,
#                 "Batch Name": mat.Batch_Name,
#                 "Product Name": mat.Product_Name,
#                 "Batch Act Start": mat.Batch_Act_Start.strftime("%Y-%m-%d %H:%M:%S") if mat.Batch_Act_Start else None,
#                 "Batch Act End": mat.Batch_Act_End.strftime("%Y-%m-%d %H:%M:%S") if mat.Batch_Act_End else None,
#                 "Quantity": mat.Quantity,
#                 "Material Name": mat.Material_Name,
#                 "Material Code": mat.Material_Code,
#                 "SetPoint Float": mat.SetPoint_Float,
#                 "Actual Value Float": mat.Actual_Value_Float,
#                 "Source Server": mat.Source_Server,
#                 "ROOTGUID": mat.ROOTGUID,
#                 "OrderId": mat.OrderId,
#                 "EventID": mat.EventID,
#                 "Batch Transfer Time": mat.Batch_Transfer_Time,
#                 "FormulaCategoryName": mat.FormulaCategoryName
#             })

#         current_app.logger.info("📦 Returning KPI response")
#         return jsonify({
#             "data": kpi_list,
#             "page": pagination.page,
#             "pages": pagination.pages,
#             "total": pagination.total
#         }), 200

#     except Exception as e:
#         current_app.logger.error("❌ Exception occurred in /kpi GET route")
#         current_app.logger.error(traceback.format_exc())
#         return jsonify({"error": str(e)}), 500

from flask import Blueprint, request, jsonify
from extensions import db
from models.kpi import KPI
from models.kpi_material import KPIMaterial
from datetime import datetime
from pathlib import Path
import pandas as pd
import os

kpi_bp = Blueprint("kpi", __name__)

# 🟢 **Route to Insert KPI Data**
@kpi_bp.route("/kpi", methods=["POST"])
def add_kpi():
    try:
        data = request.get_json()
        new_kpi = KPI(
            batch_guid=data.get("batch_guid"),
            batch_name=data.get("batch_name"),
            product_name=data.get("product_name"),
            batch_act_start=datetime.strptime(data.get("batch_act_start"), "%Y-%m-%d %H:%M:%S"),
        )
        db.session.add(new_kpi)
        db.session.commit()
        return jsonify({"message": "KPI added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# 🟢 **Route to Get All KPI Data**
@kpi_bp.route("/kpi", methods=["GET"])
def get_kpis():
    try:
        # Step 1: Get page and limit
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 1000, type=int)

        # Step 2: Apply pagination
        pagination = KPIMaterial.query.paginate(page=page, per_page=limit, error_out=False)
        materials = pagination.items

        # Step 3: Convert to list of dicts
        kpi_list = []
        for mat in materials:
            kpi_list.append({
                "Batch GUID": mat.batch_guid,
                "Batch Name": mat.batch_name,
                "Product Name": mat.product_name,
                # Ensure batch_act_start is a datetime before calling strftime
                "Batch Act Start": mat.batch_act_start.strftime("%Y-%m-%d %H:%M:%S") if isinstance(mat.batch_act_start, datetime) else mat.batch_act_start,
                "Batch Act End": mat.batch_act_end.strftime("%Y-%m-%d %H:%M:%S") if isinstance(mat.batch_act_end, datetime) else mat.batch_act_end,
                "Quantity": mat.quantity,
                "Material Name": mat.material_name,
                "Material Code": mat.material_code,
                "SetPoint Float": mat.setpoint_float,
                "Actual Value Float": mat.actual_value_float,
                "Source Server": mat.source_server,
                "ROOTGUID": mat.rootguid,
                "OrderId": mat.order_id,
                "EventID": mat.event_id,
                # Ensure batch_transfer_time is a datetime before calling strftime
                "Batch Transfer Time": mat.batch_transfer_time.strftime("%Y-%m-%d %H:%M:%S") if isinstance(mat.batch_transfer_time, datetime) else mat.batch_transfer_time,
                "FormulaCategoryName": mat.formula_category_name
            })

        # Step 4: Return paginated response
        return jsonify({
            "data": kpi_list,
            "page": pagination.page,
            "pages": pagination.pages,
            "total": pagination.total
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500