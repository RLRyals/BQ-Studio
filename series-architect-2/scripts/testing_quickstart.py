#!/usr/bin/env python3
"""
Testing Mode Quickstart

Copies a sample intake form (A–E) into outputs/intake_form.md, marks testing state in
outputs/memory.json, and regenerates outputs/INDEX.md. Use to demo the workflow quickly.

Usage:
  python3 scripts/testing_quickstart.py --sample A
  python3 scripts/testing_quickstart.py --sample B --force
"""
from __future__ import annotations
import argparse
import json
import os
import shutil
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'outputs')
SAMPLES = os.path.join(OUT, 'intake_samples')

MAP = {
    'A': 'intake_A_mutual_trauma_bonding.md',
    'B': 'intake_B_protector_wounded.md',
    'C': 'intake_C_toxic_coping.md',
    'D': 'intake_D_post_trauma_reentry.md',
    'E': 'intake_E_dark_trauma_hybrid.md',
}


def load_json(path: str) -> dict:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def save_json(path: str, data: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


def set_testing_state(memory_path: str) -> None:
    mem = load_json(memory_path)
    mem.setdefault('flags', {})['testing'] = True
    mem['session_mode'] = 'testing'
    mem.setdefault('stages', {})
    mem['stages']['completed'] = list(sorted(set(mem['stages'].get('completed', []) + [1])))
    mem['stages']['current'] = 2
    mem.setdefault('changelog', []).append({
        'ts': datetime.now().isoformat(),
        'event': 'testing_quickstart_applied',
        'details': 'Sample intake staged and Stage 1 marked complete.'
    })
    save_json(memory_path, mem)


def regenerate_index():
    try:
        import subprocess
        subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'generate_index.py')], check=False)
    except Exception:
        pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sample', choices=list(MAP.keys()), required=True, help='Sample code A–E to stage')
    ap.add_argument('--force', action='store_true', help='Overwrite an existing outputs/intake_form.md')
    args = ap.parse_args()

    src = os.path.join(SAMPLES, MAP[args.sample])
    dst = os.path.join(OUT, 'intake_form.md')
    if not os.path.exists(src):
        ap.error(f'Sample not found: {src}')
    if os.path.exists(dst) and not args.force:
        ap.error(f'{dst} already exists. Use --force to overwrite.')

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(src, dst)

    set_testing_state(os.path.join(OUT, 'memory.json'))
    regenerate_index()
    print(f'Staged testing sample {args.sample} into {dst} and updated memory.json')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

