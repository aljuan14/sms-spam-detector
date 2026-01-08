import os
from pathlib import Path

# --- KONFIGURASI ---
ROOT_DIR = '.'

# 1. DAFTAR FOLDER YANG DIABAIKAN
IGNORE_DIRS = {
    # System / IDE
    '.git', '.vscode', '.idea', '.github',

    # Python / FastAPI / Virtual Env
    '__pycache__',
    '.pytest_cache',
    '.mypy_cache',
    'venv', '.venv', 'env',  # Folder environment kamu
    'Lib', 'Include', 'Scripts',  # Biasanya ada di dalam venv windows jika salah path

    # React / Node.js
    'node_modules',
    'dist',       # Build folder (Vite)
    'build',      # Build folder (CRA)
    '.next',      # Build folder (Next.js)
    'coverage',   # Test coverage
    '.npm'
}

# 2. DAFTAR FILE SPESIFIK YANG DIABAIKAN (Agar tree lebih ringkas)
IGNORE_FILES = {
    '.DS_Store', 'Thumbs.db',       # Metadata OS
    # Config ignore (opsional, bisa dihapus jika ingin lihat)
    '.gitignore', '.dockerignore',

    # Lock files (Seringkali barisnya ribuan dan mengganggu view struktur utama)
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'poetry.lock',
    'Pipfile.lock'
}

# 3. EKSTENSI FILE YANG DIABAIKAN
IGNORE_EXTENSIONS = {
    '.pyc',   # Python compiled
    '.log',   # Log files
    '.map'    # Source map js
}


def should_ignore(item):
    """Cek apakah item harus di-skip berdasarkan konfigurasi di atas"""
    # Cek nama folder/file exact match
    if item.name in IGNORE_DIRS or item.name in IGNORE_FILES:
        return True
    # Cek ekstensi (hanya untuk file)
    if item.is_file() and item.suffix in IGNORE_EXTENSIONS:
        return True
    return False


def generate_tree(directory, prefix=''):
    path = Path(directory)

    try:
        # Ambil semua item dan urutkan abjad
        items = sorted([x for x in path.iterdir()])
    except PermissionError:
        return

    # Filter item: hanya ambil yang TIDAK ada di daftar ignore
    items = [item for item in items if not should_ignore(item)]

    total_items = len(items)

    for index, item in enumerate(items):
        connector = '└── ' if index == total_items - 1 else '├── '

        print(f"{prefix}{connector}{item.name}")

        if item.is_dir():
            extension = '    ' if index == total_items - 1 else '│   '
            generate_tree(item, prefix + extension)


if __name__ == '__main__':
    print(f"Project Tree: {os.path.abspath(ROOT_DIR)}\n")
    print(f"(Note: Mengabaikan folder environment, node_modules, dan file cache)\n")
    generate_tree(ROOT_DIR)
