#!/usr/bin/env python3
"""
Add YAML frontmatter to Markdown files in outputs/ for richer auto-indexing.
Idempotent: skips files that already start with a frontmatter block.
"""
from __future__ import annotations
import os
import re
import sys
import datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'outputs')
NOW_ISO = dt.datetime.now().date().isoformat()
VERSION = '2.0'


def load_text(path: str) -> str:
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def save_text(path: str, text: str) -> None:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


def get_project_name() -> str:
    # Prefer intake_form.md
    intake = os.path.join(OUT, 'intake_form.md')
    if os.path.exists(intake):
        t = load_text(intake)
        m = re.search(r'^\*\*Series Title:\*\*\s*(.+)$', t, re.M)
        if m:
            return m.group(1).strip()
    # Fallback to series_framework.md
    sf = os.path.join(OUT, 'series_framework.md')
    if os.path.exists(sf):
        t = load_text(sf)
        m = re.search(r'^#\s*Series Framework:\s*(.+)$', t, re.M)
        if m:
            return m.group(1).strip()
        m = re.search(r'^\*\*Project:\*\*\s*(.+)$', t, re.M)
        if m:
            return m.group(1).strip()
    return 'Unknown Project'


def infer_type_stage(path: str, text: str) -> tuple[str, int|None]:
    name = os.path.basename(path).lower()
    if name == 'intake_form.md':
        return 'session', 1
    if re.match(r'mm_.*_market_research\.md$', name):
        return 'research', 2
    if name == 'series_framework.md':
        return 'framework', 3
    if name == 'series_romance_beats.md':
        return 'beats', 3
    if name == 'worldbuilding_guide.md':
        return 'world', 3
    if name.startswith('couple_'):
        return 'character', 3
    if os.path.sep in path and os.path.basename(os.path.dirname(path)).startswith('book_'):
        if name.endswith('complete_story_guide.md') or name.endswith('dossier.md'):
            return 'book_dossier', 5
        if name.startswith('book_') and 'act_' in name and 'chapter_outlines' in name:
            return 'chapter_outlines', 5
        return 'book_dossier', 5
    if name == 'index.md':
        return 'index', 6
    return 'other', None


def infer_book_number(path: str, text: str) -> str|None:
    # from folder name like book_1_bound_by_blood
    parts = os.path.normpath(path).split(os.path.sep)
    for p in parts:
        m = re.match(r'book_(\d+)_', p.lower())
        if m:
            return m.group(1)
    # from text pattern (Book N)
    m = re.search(r'\(Book\s*(\d+)\b', text)
    if m:
        return m.group(1)
    return None


def extract_title(text: str, fallback: str) -> str:
    m = re.match(r'^#\s+(.+)$', text.strip().splitlines()[0])
    if m:
        return m.group(1).strip()
    # fallback: transform filename-like
    return fallback


def extract_dates(text: str, path: str) -> tuple[str, str]:
    # created
    for pat in [r'^\*\*Date Created:\*\*\s*(\d{4}-\d{2}-\d{2})$',
                r'^\*\*Created:\*\*\s*(\d{4}-\d{2}-\d{2})$',
                r'^\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})$']:
        m = re.search(pat, text, re.M)
        if m:
            created = m.group(1)
            break
    else:
        created = dt.date.fromtimestamp(os.path.getmtime(path)).isoformat()

    # updated
    for pat in [r'^\*\*Last Updated:\*\*\s*(\d{4}-\d{2}-\d{2})$',
                r'^\*\*Updated:\*\*\s*(\d{4}-\d{2}-\d{2})$']:
        m = re.search(pat, text, re.M)
        if m:
            updated = m.group(1)
            break
    else:
        updated = NOW_ISO

    return created, updated


def add_frontmatter(path: str, project: str) -> bool:
    text = load_text(path)
    if text.startswith('---\n'):
        return False
    bname = os.path.basename(path)
    inferred_title = re.sub(r'[_-]+', ' ', os.path.splitext(bname)[0]).title()
    title = extract_title(text, inferred_title)
    typ, stage = infer_type_stage(path, text)
    book = infer_book_number(path, text)
    created, updated = extract_dates(text, path)

    fm = [
        '---',
        f'title: {title}',
        f'project: {project}',
        f'type: {typ}',
        f'stage: {stage if stage is not None else ""}'.rstrip(),
        f'book: {book if book is not None else "null"}',
        f'created: {created}',
        f'updated: {updated}',
        f'version: {VERSION}',
        '---',
        '',
    ]
    new_text = '\n'.join(fm) + text
    save_text(path, new_text)
    return True


def main():
    project = get_project_name()
    changed = []
    for root, dirs, files in os.walk(OUT):
        for name in files:
            if not name.endswith('.md'):
                continue
            if name.lower() in ('index.md',):
                continue
            # Skip transient reports
            if name.lower() in ('reconcile_report.md',):
                continue
            p = os.path.join(root, name)
            if add_frontmatter(p, project):
                changed.append(os.path.relpath(p, ROOT))
    print(f"Frontmatter added to {len(changed)} file(s).")
    for p in changed:
        print(f" - {p}")


if __name__ == '__main__':
    sys.exit(main())

