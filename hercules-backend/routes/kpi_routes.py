from flask import Blueprint, request, jsonify
from extensions import db
from models.kpi import KPI
from models.kpi_material import KPIMaterial
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd
import os
from extensions import cache  # ✅ instead of `from app import cache`
import time  # ✅ Add this line to fix the error
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


@kpi_bp.route("/kpi", methods=["GET"])
@cache.cached(timeout=60, query_string=True)  # 🔁 Cache for 60 seconds per unique query
def get_kpis():
    start_time = time.time()

    try:
        start_date_str = request.args.get("startDate")
        end_date_str = request.args.get("endDate")
        batch_filters = request.args.getlist("batch")
        product_filters = request.args.getlist("product")
        material_filters = request.args.getlist("material")

        date_filter = []
        if start_date_str and end_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
                end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
            except Exception:
                try:
                    start_date = datetime.strptime(start_date_str, "%Y-%m-%d %H:%M:%S")
                    end_date = datetime.strptime(end_date_str, "%Y-%m-%d %H:%M:%S")
                except Exception:
                    start_date = datetime.strptime(start_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
                    end_date = datetime.strptime(end_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")

            print(f"Filtering by date: {start_date} to {end_date}")
            date_filter = [KPIMaterial.batch_act_start >= start_date, KPIMaterial.batch_act_start <= end_date]

        page = request.args.get("page", 1, type=int)
        if page == "all":
            page = 1

        limit = request.args.get("limit", 300000, type=int)
        if limit == "none":
            limit = 300000

        query = KPIMaterial.query
        if date_filter:
            query = query.filter(*date_filter)
        if batch_filters:
            query = query.filter(KPIMaterial.batch_name.in_(batch_filters))
        if product_filters:
            query = query.filter(KPIMaterial.product_name.in_(product_filters))
        if material_filters:
            query = query.filter(KPIMaterial.material_name.in_(material_filters))

        query = query.order_by(KPIMaterial.batch_act_start.desc())
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        materials = pagination.items

        kpi_list = []
        for mat in materials:
            kpi_list.append({
                "Batch GUID": mat.batch_guid,
                "Batch Name": mat.batch_name,
                "Product Name": mat.product_name,
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
                "Batch Transfer Time": mat.batch_transfer_time,
                "FormulaCategoryName": mat.formula_category_name
            })

        elapsed = round(time.time() - start_time, 2)
        print(f"✅ KPI API served in {elapsed} seconds (cached: 60s)")

        return jsonify({
            "data": kpi_list,
            "page": pagination.page,
            "pages": pagination.pages,
            "total": pagination.total,
            "elapsed_time_sec": elapsed
        }), 200

    except Exception as e:
        import traceback
        print("Error in KPI API:", str(e))
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# 🟢 **Route to Get Report Data (Daily, Weekly, Monthly)**
@kpi_bp.route("/reports", methods=["GET"])
def get_reports():
    try:
        # Step 1: Get date filters and report type
        start_date_str = request.args.get("startDate")
        end_date_str = request.args.get("endDate")
        report_type = request.args.get("reportType", "daily")  # default to daily
        
        # Get additional filters
        batch_filters = request.args.getlist("batch")
        product_filters = request.args.getlist("product")
        material_filters = request.args.getlist("material")

        # Step 2: Parse dates
        if not start_date_str or not end_date_str:
            return jsonify({"error": "Start date and end date are required"}), 400
            
        # Try parsing ISO format (from JS)
        try:
            start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
            end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        except Exception:
            # Fallback to plain string
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d %H:%M:%S")
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d %H:%M:%S")
            except Exception:
                # Another common format
                try:
                    start_date = datetime.strptime(start_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
                    end_date = datetime.strptime(end_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
                except Exception as e:
                    return jsonify({"error": f"Failed to parse dates: {str(e)}"}), 400
                    
        print(f"Generating {report_type} report for: {start_date} to {end_date}")
        
        # Step 3: Build query with appropriate date range
        query = KPIMaterial.query
        
        # Apply date filter
        date_filter = [KPIMaterial.batch_act_start >= start_date, KPIMaterial.batch_act_start <= end_date]
        query = query.filter(*date_filter)
        
        # Apply additional filters if provided
        if batch_filters:
            query = query.filter(KPIMaterial.batch_name.in_(batch_filters))
        
        if product_filters:
            query = query.filter(KPIMaterial.product_name.in_(product_filters))
        
        if material_filters:
            query = query.filter(KPIMaterial.material_name.in_(material_filters))
            
        # Order by batch start date
        query = query.order_by(KPIMaterial.batch_act_start.desc())
        
        # Step 4: Get page and limit for pagination
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 300000, type=int)  # Use a reasonable default
        
        # Apply pagination
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        materials = pagination.items
        
        # Log query results for debugging
        print(f"Found {pagination.total} records for {report_type} report")

        # Step 5: Convert to list of dicts
        kpi_list = []
        for mat in materials:
            kpi_list.append({
                "Batch GUID": mat.batch_guid,
                "Batch Name": mat.batch_name,
                "Product Name": mat.product_name,
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
                "Batch Transfer Time": mat.batch_transfer_time,
                "FormulaCategoryName": mat.formula_category_name
            })

        # Step 6: Return paginated response
        return jsonify({
            "data": kpi_list,
            "page": pagination.page,
            "pages": pagination.pages,
            "total": pagination.total,
            "reportType": report_type
        }), 200

    except Exception as e:
        import traceback
        print(f"Error in get_reports: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500