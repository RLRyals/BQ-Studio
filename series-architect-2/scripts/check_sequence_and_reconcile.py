#!/usr/bin/env python3
"""
Check if characters/world docs predate the series framework and create a reconcile report.
No in-place edits to creative content; produces outputs/reconcile_report.md with findings.
"""
from __future__ import annotations
import os
import datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'outputs')
FRAMEWORK = os.path.join(OUT_DIR, 'series_framework.md')
REPORT = os.path.join(OUT_DIR, 'reconcile_report.md')


def mtime(path: str) -> float:
    try:
        return os.path.getmtime(path)
    except OSError:
        return 0.0


def list_character_files():
    chars = []
    for name in os.listdir(OUT_DIR):
        if name.startswith('couple_') and name.endswith('.md'):
            chars.append(os.path.join(OUT_DIR, name))
    return sorted(chars)


def main():
    fw_time = mtime(FRAMEWORK)
    char_files = list_character_files()
    world_path = os.path.join(OUT_DIR, 'worldbuilding_guide.md')
    world_time = mtime(world_path)

    issues = []
    for p in char_files:
        if mtime(p) < fw_time and fw_time > 0:
            issues.append((p, 'Character created before framework'))
    if world_time < fw_time and world_time > 0 and fw_time > 0:
        issues.append((world_path, 'Worldbuilding guide created before framework'))

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(REPORT, 'w', encoding='utf-8') as f:
        f.write('# Reconcile Report\n\n')
        f.write(f'Generated: {dt.datetime.now().isoformat()}\n\n')
        if not os.path.exists(FRAMEWORK):
            f.write('- series_framework.md not found; no checks performed.\n')
            return
        if not issues:
            f.write('- No out-of-sequence documents detected relative to series_framework.md.\n')
        else:
            f.write('The following documents predate the framework and may require integration/delta review:\n\n')
            for p, msg in issues:
                rel = os.path.relpath(p, OUT_DIR)
                f.write(f'- {rel}: {msg}\n')
            f.write('\nSuggested next actions:\n')
            f.write('- Summarize deltas from listed docs and append as notes to series_framework.md.\n')
            f.write('- Update memory.json with a reconciliation entry.\n')

    print(f"Wrote {REPORT}")


if __name__ == '__main__':
    main()

