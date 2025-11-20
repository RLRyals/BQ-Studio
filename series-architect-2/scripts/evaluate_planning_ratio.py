#!/usr/bin/env python3
"""
Evaluate planning-to-prose ratio for each book and score it.

Definitions:
- Expected prose words: parsed from the book's compiled guide/dossier, or from intake_form (Total words per book, or chapters * words per chapter).
- Planning words: wordcount of either the compiled story guide (default) or the main dossier, configurable via --planning-source.

Output: prints a summary and, if --write-report, writes outputs/planning_ratio_report.md

Scoring bands:
- < 5%  : speed/flex; risk drift.
- 5–12% : sweet spot; high fidelity.
- > 15% : locked style/multi-model; overhead.
- 12–15%: borderline zone; call out explicitly.
"""
from __future__ import annotations
import argparse
import os
import re
from typing import Optional, Tuple
import datetime as dt

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


def wordcount_text(text: str) -> int:
    body = strip_frontmatter(text)
    # remove code fences and tables minimalistically to avoid inflating counts
    body = re.sub(r"```[\s\S]*?```", " ", body)
    # collapse markdown formatting
    body = re.sub(r"[#*_`>\-]+", " ", body)
    words = re.findall(r"\b\w[\w'’-]*\b", body)
    return len(words)


def parse_expected_words_from_text(text: str) -> Optional[int]:
    # Try patterns like: Total Word Count Target: 30,000 words
    m = re.search(r"Total\s+Word\s+Count\s+Target:\s*([0-9,]+)", text, re.I)
    if m:
        return int(m.group(1).replace(',', ''))
    # Intake-style: Total words per book: 30,000
    m = re.search(r"Total\s+words\s+per\s+book:\s*([0-9,]+)", text, re.I)
    if m:
        return int(m.group(1).replace(',', ''))
    # Chapters per book and Words per chapter
    m1 = re.search(r"Chapters\s+per\s+book:\s*(\d+)", text, re.I)
    m2 = re.search(r"Words\s+per\s+chapter:\s*([0-9,]+)", text, re.I)
    if m1 and m2:
        return int(m1.group(1)) * int(m2.group(1).replace(',', ''))
    return None


def infer_expected_words(book_dir: str) -> Optional[int]:
    # Prefer compiled guide, then dossier, then intake_form
    compiled = None
    dossier = None
    for name in os.listdir(book_dir):
        if name.endswith('complete_story_guide.md'):
            compiled = os.path.join(book_dir, name)
        elif name.endswith('_dossier.md'):
            dossier = os.path.join(book_dir, name)
    for p in (compiled, dossier):
        if p and os.path.exists(p):
            n = parse_expected_words_from_text(read_text(p))
            if n:
                return n
    intake = os.path.join(OUT, 'intake_form.md')
    if os.path.exists(intake):
        n = parse_expected_words_from_text(read_text(intake))
        if n:
            return n
    return None


def detect_books() -> list[str]:
    books = []
    for name in os.listdir(OUT):
        p = os.path.join(OUT, name)
        if os.path.isdir(p) and name.lower().startswith('book_'):
            books.append(p)
    return sorted(books)


def choose_planning_file(book_dir: str, planning_source: str) -> Optional[str]:
    compiled = None
    dossier = None
    for name in os.listdir(book_dir):
        if name.endswith('complete_story_guide.md'):
            compiled = os.path.join(book_dir, name)
        elif name.endswith('_dossier.md'):
            dossier = os.path.join(book_dir, name)
    if planning_source == 'compiled':
        return compiled or dossier
    else:
        return dossier or compiled


def score_ratio(ratio: float) -> Tuple[str, list[str]]:
    pct = ratio * 100.0
    if pct < 5.0:
        return (
            'Under 5% (speed/flexibility)',
            [
                'Good for speed and flexibility; AI improvises more.',
                'Risk: tone drift or inconsistent beats.',
            ],
        )
    if 5.0 <= pct <= 12.0:
        return (
            '5–12% (sweet spot)',
            [
                'Balanced control vs creativity; AI outputs high fidelity drafts.',
            ],
        )
    if pct > 15.0:
        return (
            'Over 15% (locked style)',
            [
                'Great for “locked” style or multi-model pipelines (dev → prose → line edit).',
                'But adds overhead.',
            ],
        )
    # 12–15% borderline
    return (
        '12–15% (borderline zone)',
        [
            'Close to locked; consider whether overhead is justified by constraints.',
        ],
    )


def evaluate_book(book_dir: str, planning_source: str) -> dict:
    plan_path = choose_planning_file(book_dir, planning_source)
    if not plan_path or not os.path.exists(plan_path):
        raise FileNotFoundError(f"No planning file found in {book_dir}")
    plan_words = wordcount_text(read_text(plan_path))
    expected = infer_expected_words(book_dir)
    if not expected or expected <= 0:
        raise ValueError(f"Unable to infer expected prose words for {book_dir}")
    ratio = plan_words / expected
    category, notes = score_ratio(ratio)
    return {
        'book_dir': os.path.basename(book_dir),
        'planning_source': planning_source,
        'planning_file': os.path.relpath(plan_path, OUT),
        'planning_words': plan_words,
        'expected_prose_words': expected,
        'ratio': ratio,
        'category': category,
        'notes': notes,
    }


def write_report(results: list[dict], warn_over: float | None) -> str:
    path = os.path.join(OUT, 'planning_ratio_report.md')
    lines = []
    lines.append('# Planning-to-Prose Ratio Report')
    lines.append(f'Generated: {dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    if warn_over is not None:
        lines.append(f'Warning threshold: {warn_over:.2f}%')
    lines.append('')
    for r in results:
        lines.append(f'## {r["book_dir"]}')
        lines.append(f'- Planning source: {r["planning_source"]}')
        lines.append(f'- Planning file: `{r["planning_file"]}`')
        lines.append(f'- Planning words: {r["planning_words"]:,}')
        lines.append(f'- Expected prose words: {r["expected_prose_words"]:,}')
        lines.append(f'- Ratio: {r["ratio"]*100:.2f}%')
        if warn_over is not None:
            status = 'WARN' if (r['ratio']*100.0) > warn_over else 'OK'
            lines.append(f'- Status: {status}')
        lines.append('')
        lines.append('⚙️ Optimization Notes for AI Generation')
        for n in r['notes']:
            lines.append(f'- {n}')
        lines.append('')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines).rstrip() + '\n')
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--planning-source', choices=['compiled', 'dossier'], default='compiled', help='Which planning file to count')
    ap.add_argument('--book', help='Book directory name (e.g., book_1_bound_by_blood); if omitted evaluates all')
    ap.add_argument('--write-report', action='store_true', help='Write outputs/planning_ratio_report.md')
    ap.add_argument('--warn-over', type=float, help='Warn if ratio exceeds this percent (e.g., 12 for 12%)')
    ap.add_argument('--fail-on-warn', action='store_true', help='Exit with non-zero code if any warning triggered')
    args = ap.parse_args()

    books = detect_books()
    if args.book:
        bd = os.path.join(OUT, args.book)
        if not os.path.isdir(bd):
            ap.error(f"Book directory not found: {args.book}")
        books = [bd]
    if not books:
        print('No book directories found in outputs/.')
        return 1
    results = []
    for b in books:
        try:
            r = evaluate_book(b, args.planning_source)
            results.append(r)
        except Exception as e:
            print(f"[WARN] {os.path.basename(b)}: {e}")
    # Print summary
    any_warn = False
    for r in results:
        print(f"{r['book_dir']}: planning={r['planning_words']:,} expected={r['expected_prose_words']:,} ratio={r['ratio']*100:.2f}% => {r['category']}")
        print('  ⚙️ Optimization Notes for AI Generation')
        for n in r['notes']:
            print(f'   - {n}')
        if args.warn_over is not None:
            if (r['ratio']*100.0) > args.warn_over:
                any_warn = True
                print(f"  WARNING: Ratio exceeds {args.warn_over:.2f}% threshold")
    if args.write_report and results:
        path = write_report(results, args.warn_over)
        print(f"Report written to {path}")
    if args.fail_on_warn and any_warn:
        return 2
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
