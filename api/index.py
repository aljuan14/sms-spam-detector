from main import app
import sys
import os

# Tambahkan folder 'backend' ke path python agar bisa di-import
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import app dari backend/main.py
