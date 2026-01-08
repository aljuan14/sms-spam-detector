import os
from pathlib import Path

# --- KONFIGURASI ---
# Ganti dengan path project kamu jika script ini tidak ditaruh di root folder
# Menggunakan '.' berarti folder tempat script ini dijalankan
ROOT_DIR = '.'

# Daftar folder/file yang ingin diabaikan agar tree tidak kepanjangan
IGNORE_DIRS = {
    '.git',
    '__pycache__',
    'node_modules',
    '.venv',
    'env',
    '.idea',
    '.vscode',
    'dist',
    'build'
}


def generate_tree(directory, prefix=''):
    path = Path(directory)

    # Ambil semua file dan folder, lalu urutkan abjad
    try:
        items = sorted([x for x in path.iterdir()])
    except PermissionError:
        return  # Skip jika tidak ada akses

    # Filter item yang ada di IGNORE_DIRS
    items = [item for item in items if item.name not in IGNORE_DIRS]

    total_items = len(items)

    for index, item in enumerate(items):
        # Tentukan konektor: └── untuk item terakhir, ├── untuk yang lain
        connector = '└── ' if index == total_items - 1 else '├── '

        print(f"{prefix}{connector}{item.name}")

        if item.is_dir():
            # Jika item adalah folder, panggil fungsi ini lagi (rekursif)
            # Update prefix untuk anak-anaknya
            extension = '    ' if index == total_items - 1 else '│   '
            generate_tree(item, prefix + extension)


if __name__ == '__main__':
    print(f"Project Tree: {os.path.abspath(ROOT_DIR)}\n")
    generate_tree(ROOT_DIR)
