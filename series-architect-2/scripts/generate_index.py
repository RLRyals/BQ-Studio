#!/usr/bin/env python3
from __future__ import annotations
import os
import re
import datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'outputs')
INDEX_PATH = os.path.join(OUT, 'INDEX.md')


def list_outputs():
    files = []
    for root, dirs, filenames in os.walk(OUT):
        for name in filenames:
            if name.startswith('.'):
                continue
            if name.lower() == 'index.md':
                continue
            files.append(os.path.relpath(os.path.join(root, name), OUT))
    return sorted(files)


def read_frontmatter(path: str) -> dict:
    meta = {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
        if text.startswith('---\n'):
            end = text.find('\n---', 4)
            if end != -1:
                for line in text[4:end].splitlines():
                    if ':' in line:
                        k, v = line.split(':', 1)
                        meta[k.strip()] = v.strip()
    except Exception:
        pass
    return meta


def detect_project(files):
    for f in files:
        if os.path.basename(f) in ('series_framework.md', 'intake_form.md'):
            fm = read_frontmatter(os.path.join(OUT, f))
            if fm.get('project'):
                return fm['project']
    return None


def group_files(files):
    groups = {
        'planning': [], 'world': [], 'characters': [], 'books': {}, 'session': [], 'reports': [], 'other': []
    }
    for f in files:
        low = f.lower()
        if low in ('intake_form.md', 'memory.json'):
            groups['session'].append(f)
        elif re.match(r"mm_.*market_research\.md$", low):
            groups['planning'].append(f)
        elif low in ('series_framework.md', 'series_romance_beats.md'):
            groups['planning'].append(f)
        elif low == 'worldbuilding_guide.md':
            groups['world'].append(f)
        elif low.startswith('couple_') and low.endswith('.md'):
            groups['characters'].append(f)
        elif low.startswith('book_') and os.path.sep in f:
            book_dir = f.split(os.path.sep)[0]
            groups['books'].setdefault(book_dir, []).append(f)
        elif low in ('planning_ratio_report.md', 'reconcile_report.md', 'names_evaluation_report.md', 'outline_size_report.md'):
            groups['reports'].append(f)
        else:
            groups['other'].append(f)
    for k in groups['books']:
        groups['books'][k] = sorted(groups['books'][k])
    for k in ('planning','world','characters','session','reports','other'):
        groups[k] = sorted(groups[k])
    return groups


def write_index(groups):
    now = dt.datetime.now().strftime('%B %d, %Y')
    lines = []
    lines.append('# Series Architect Output Index')
    lines.append('')
    files = []
    for k, v in groups.items():
        if k == 'books':
            for arr in v.values():
                files.extend(arr)
        else:
            files.extend(v)
    project = detect_project(files)
    if project:
        lines.append(f'Project: {project}')
    lines.append(f'Generated: {now}')
    lines.append('Workflow Version: 2.0')
    lines.append('')
    lines.append('---')
    lines.append('')
    lines.append('## Quick Navigation by Type')
    lines.append('')
    if groups['planning']:
        lines.append('### Planning & Strategy')
        for f in groups['planning']:
            lines.append(f'- [{os.path.basename(f)}]({f})')
        lines.append('')
    if groups['world']:
        lines.append('### Worldbuilding & Structure')
        for f in groups['world']:
            lines.append(f'- [{os.path.basename(f)}]({f})')
        lines.append('')
    if groups['characters']:
        lines.append('### Characters')
        for f in groups['characters']:
            lines.append(f'- [{os.path.basename(f)}]({f})')
        lines.append('')
    for book_dir in sorted(groups['books']):
        lines.append(f'### {book_dir.replace("_", " ").title()}')
        for f in groups['books'][book_dir]:
            lines.append(f'- [{os.path.basename(f)}]({f})')
        lines.append('')
    if groups['session']:
        lines.append('### Session Management')
        for f in groups['session']:
            lines.append(f'- [{os.path.basename(f)}]({f})')
        lines.append('')
    if groups['reports']:
        lines.append('### Reports & Metrics')
        for f in groups['reports']:
            lines.append(f'- [{os.path.basename(f)}]({f})')
        lines.append('')
    if groups['other']:
        lines.append('### Other')
        for f in groups['other']:
            lines.append(f'- [{os.path.basename(f)}]({f})')
        lines.append('')

    lines.append('---')
    lines.append('')
    lines.append('## File Statistics')
    all_files = []
    for k, v in groups.items():
        if k == 'books':
            for arr in v.values():
                all_files.extend(arr)
        else:
            all_files.extend(v)
    lines.append(f'- Total Files: {len(all_files)}')
    lines.append(f'- Book Directories: {len(groups["books"])})'.rstrip(')'))
    lines.append('')
    lines.append('---')
    lines.append('')
    lines.append(f'Last Updated: {now}')

    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines).rstrip() + '\n')


def main():
    files = list_outputs()
    groups = group_files(files)
    write_index(groups)
    print(f"Wrote {INDEX_PATH}")


if __name__ == '__main__':
    main()
