from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db, migrate, cache
import pymysql
import os
import logging
from logging.handlers import RotatingFileHandler

# ------------------------------------------------------
# 🔧 Initialize Flask App and Configuration
# ------------------------------------------------------
app = Flask(__name__)
app.config.from_object(Config)

# ✅ Caching Configuration
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 60
cache.init_app(app)

# ------------------------------------------------------
# 📝 Configure Logging
# ------------------------------------------------------
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)

# ------------------------------------------------------
# 🔓 Enable CORS
# ------------------------------------------------------
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:3000"])

# ------------------------------------------------------
# 🗃️ Database Setup with Error Handling
# ------------------------------------------------------
try:
    db.init_app(app)
    migrate.init_app(app, db)
    with app.app_context():
        db.engine.connect()
    app.logger.info("Database connection established successfully")
except Exception as e:
    app.logger.error(f"Database connection failed: {str(e)}")
    raise

# ------------------------------------------------------
# 🔌 Register Blueprints with Error Handling
# ------------------------------------------------------
try:
    from routes.kpi_routes import kpi_bp
    from routes.logo_routes import logo_bp
    from routes.settings import settings_bp
    from routes.report_scheduler import report_bp

    app.register_blueprint(kpi_bp, url_prefix="/api")
    app.register_blueprint(logo_bp, url_prefix="/api")
    app.register_blueprint(settings_bp, url_prefix="/api")
    app.register_blueprint(report_bp, url_prefix="/api")
    app.logger.info("Blueprints registered successfully")
except ImportError as e:
    app.logger.error(f"Failed to import blueprints: {str(e)}")
    raise
except Exception as e:
    app.logger.error(f"Error registering blueprints: {str(e)}")
    raise

# ------------------------------------------------------
# 🏠 Root Route
# ------------------------------------------------------
@app.route("/")
def index():
    return jsonify({
        "message": "Backend API is running!",
        "endpoints": {
            "kpi": "/api/kpi",
            "logo": "/api/logo",
            "settings": "/api/settings",
            "reports": "/api/reports"
        }
    }), 200

# ------------------------------------------------------
# 🛑 Error Handlers
# ------------------------------------------------------
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"Server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

# ------------------------------------------------------
# 🚀 Run the Flask App
# ------------------------------------------------------
if __name__ == "__main__":
    app.logger.info("Starting application...")
    try:
        app.run(debug=True, host="0.0.0.0", port=5000)
    except Exception as e:
        app.logger.error(f"Failed to start application: {str(e)}")
        raise
