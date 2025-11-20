#!/usr/bin/env python3
"""
Scan template and beat sheet directories and write outputs/resource_manifest.json.
"""
from __future__ import annotations
import os
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES_DIR = os.path.join(ROOT, 'templates')
BEATS_DIR = os.path.join(ROOT, 'beat_sheet_library')
OUT = os.path.join(ROOT, 'outputs', 'resource_manifest.json')

ALLOWED_EXT = {'.md', '.markdown', '.json', '.yaml', '.yml', '.txt'}


def gather(path: str):
    result = []
    if not os.path.isdir(path):
        return result
    for root, dirs, files in os.walk(path):
        for name in files:
            ext = os.path.splitext(name)[1].lower()
            if ext in ALLOWED_EXT and not name.startswith('.'):
                rel = os.path.relpath(os.path.join(root, name), path)
                result.append(rel)
    result.sort()
    return result


def main():
    data = {
        'templates_root': os.path.relpath(TEMPLATES_DIR, ROOT),
        'beat_sheets_root': os.path.relpath(BEATS_DIR, ROOT),
        'templates': gather(TEMPLATES_DIR),
        'beat_sheets': gather(BEATS_DIR),
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {OUT}")


if __name__ == '__main__':
    main()

