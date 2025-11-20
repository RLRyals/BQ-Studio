#!/usr/bin/env python3
"""
Scan act-level chapter outline files and report chapters that exceed size caps.

Defaults (normal mode):
 - max_words_per_chapter = 180
 - min_events = 6
 - max_events = 10

Output: outputs/outline_size_report.md
"""
from __future__ import annotations
import os
import re
import argparse
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'outputs')


def read_text(path: str) -> str:
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def strip_frontmatter(text: str) -> str:
    if text.startswith('---\n'):
        end = text.find('\n---', 4)
        if end != -1:
            return text[end + 4:].lstrip('\n')
    return text


def find_act_files(book_dir: str) -> list[str]:
    files = []
    if not os.path.isdir(book_dir):
        return files
    for name in os.listdir(book_dir):
        if re.search(r'_act_\d+_chapter_outlines\.md$', name):
            files.append(os.path.join(book_dir, name))
    return sorted(files)


def chapter_sections(text: str) -> list[tuple[str, str]]:
    # Return list of (chapter_title, section_text)
    body = strip_frontmatter(text)
    lines = body.splitlines()
    sections = []
    cur_title = None
    buf = []
    for line in lines:
        if re.match(r'^##\s+Chapter\s+\d+', line):
            if cur_title is not None:
                sections.append((cur_title, '\n'.join(buf).strip()))
            cur_title = line.strip().lstrip('#').strip()
            buf = []
        else:
            buf.append(line)
    if cur_title is not None:
        sections.append((cur_title, '\n'.join(buf).strip()))
    return sections


def word_count(text: str) -> int:
    # Remove code fences and markdown markers
    t = re.sub(r"```[\s\s]*?```", " ", text)
    t = re.sub(r"[#*_>`]+", " ", t)
    words = re.findall(r"\b\w[\w'’-]*\b", t)
    return len(words)


def count_major_events(section: str) -> int | None:
    # Find '### Major Events' block and count list items until next ### or ##
    m = re.search(r"(?s)###\s+Major\s+Events\n(.*?)(\n##|\n###|\Z)", section)
    if not m:
        return None
    block = m.group(1)
    cnt = 0
    for line in block.splitlines():
        if re.match(r"^\s*[-*+]\s+", line) or re.match(r"^\s*\d+\.[ )]", line):
            cnt += 1
    return cnt


def evaluate_book(book_dir: str, max_words: int, min_events: int, max_events: int) -> list[dict]:
    results = []
    for path in find_act_files(book_dir):
        text = read_text(path)
        for title, sec in chapter_sections(text):
            wc = word_count(sec)
            events = count_major_events(sec)
            issues = []
            if wc > max_words:
                issues.append(f"wordcount {wc} > {max_words}")
            if events is not None:
                if events < min_events:
                    issues.append(f"events {events} < {min_events}")
                if events > max_events:
                    issues.append(f"events {events} > {max_events}")
            results.append({
                'file': os.path.relpath(path, OUT),
                'chapter': title,
                'words': wc,
                'events': events,
                'issues': issues,
            })
    return results


def write_report(all_results: list[dict]):
    path = os.path.join(OUT, 'outline_size_report.md')
    lines = []
    lines.append('# Outline Size Report')
    lines.append(f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    lines.append('')
    flagged = [r for r in all_results if r['issues']]
    lines.append(f'Total chapters scanned: {len(all_results)}')
    lines.append(f'Chapters with issues: {len(flagged)}')
    lines.append('')
    for r in flagged:
        lines.append(f"- {r['file']} — {r['chapter']}: {', '.join(r['issues'])}")
    if not flagged:
        lines.append('- No issues detected.')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines).rstrip() + '\n')
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--book', help='Book directory (e.g., outputs/book_1_bound_by_blood). Default: scan all book_* under outputs/')
    ap.add_argument('--max-words', type=int, default=180)
    ap.add_argument('--min-events', type=int, default=6)
    ap.add_argument('--max-events', type=int, default=10)
    args = ap.parse_args()

    book_dirs = []
    if args.book:
        book_dirs = [args.book]
    else:
        for name in os.listdir(OUT):
            p = os.path.join(OUT, name)
            if os.path.isdir(p) and name.startswith('book_'):
                book_dirs.append(p)
    all_results = []
    for bd in sorted(book_dirs):
        all_results.extend(evaluate_book(bd, args.max_words, args.min_events, args.max_events))
    report = write_report(all_results)
    print(f"Wrote {report}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

