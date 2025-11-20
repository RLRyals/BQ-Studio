#!/usr/bin/env python3
"""
Evaluate person/place names to avoid cliché and on-the-nose patterns.
Bootstraps a names registry from existing character files and generates a report.

Rules implemented (subset of protocol):
- Cliché morpheme penalties from references/names/cliche_morphemes.txt
- Root duplication detection across major names
- Initial letter distribution (warn if any initial > 30% of majors)
- Simple syllable estimation for diversity stats

Outputs:
- outputs/names_registry.json (merged with existing if present)
- outputs/names_evaluation_report.md
"""
from __future__ import annotations
import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'outputs')
NAMES_DIR = os.path.join(ROOT, 'series-architect', 'references', 'names')
ClichePath = os.path.join(NAMES_DIR, 'cliche_morphemes.txt')
RegistryPath = os.path.join(OUT, 'names_registry.json')
ReportPath = os.path.join(OUT, 'names_evaluation_report.md')


def read_text(path: str) -> str:
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def list_character_files() -> list[str]:
    files = []
    for name in os.listdir(OUT):
        if name.startswith('couple_') and name.endswith('.md'):
            files.append(os.path.join(OUT, name))
    return sorted(files)


def strip_frontmatter(text: str) -> str:
    if text.startswith('---\n'):
        end = text.find('\n---', 4)
        if end != -1:
            return text[end + 4:].lstrip('\n')
    return text


def extract_title(text: str) -> str:
    # first non-frontmatter heading line
    body = strip_frontmatter(text)
    for line in body.splitlines():
        if line.startswith('# '):
            return line[2:].strip()
    return ''


def parse_character_name_from_title(title: str) -> str | None:
    # Expect: "Character Architecture - Name (Role ...)"
    m = re.search(r'-\s+([^\(\)]+?)\s*(?:\(|$)', title)
    if m:
        return m.group(1).strip()
    return None


def role_from_title(title: str) -> str | None:
    t = title.lower()
    if ' mc' in t:
        return 'MC'
    if ' li' in t or 'love interest' in t:
        return 'LI'
    return None


def tokenize_name(name: str) -> list[str]:
    return re.findall(r"[a-zA-Z]+", name.lower())


def syllables_estimate(name: str) -> int:
    # naive: count groups of vowels in full name
    s = re.sub(r"[^a-z]", "", name.lower())
    groups = re.findall(r"[aeiouy]+", s)
    return max(1, len(groups))


def load_cliche_morphemes() -> set[str]:
    toks = set()
    if os.path.exists(ClichePath):
        for line in read_text(ClichePath).splitlines():
            line = line.strip().lower()
            if not line or line.startswith('#'):
                continue
            toks.add(line)
    return toks


def load_registry() -> dict:
    try:
        return json.load(open(RegistryPath, 'r', encoding='utf-8'))
    except Exception:
        return {"entries": [], "stats": {}}


def save_registry(reg: dict):
    os.makedirs(OUT, exist_ok=True)
    with open(RegistryPath, 'w', encoding='utf-8') as f:
        json.dump(reg, f, indent=2)


def merge_entry(reg: dict, entry: dict):
    names = {e['name'] for e in reg.get('entries', [])}
    if entry['name'] not in names:
        reg.setdefault('entries', []).append(entry)


def build_registry_from_outputs() -> dict:
    reg = load_registry()
    for path in list_character_files():
        txt = read_text(path)
        title = extract_title(txt) or ''
        name = parse_character_name_from_title(title)
        if not name:
            continue
        role = role_from_title(title)
        entry = {
            "name": name,
            "type": "person",
            "role": role,
            "origin": None,
            "pronunciation": None,
            "era": None,
            "variants": [],
            "morphemes": tokenize_name(name),
            "related": [],
        }
        merge_entry(reg, entry)
    return reg


def evaluate_names(reg: dict, cliche: set[str]) -> dict:
    entries = reg.get('entries', [])
    issues = []
    initials = Counter()
    suffixes = Counter()

    # Precompute morph sets and roots
    morphs = {e['name']: set(e.get('morphemes') or tokenize_name(e['name'])) for e in entries}

    for e in entries:
        name = e['name']
        tokens = morphs[name]
        # Initial
        initials[name[0].upper()] += 1
        # Suffix heuristic: last token ending
        last = re.findall(r"[a-zA-Z]+", name.lower())[-1] if re.findall(r"[a-zA-Z]+", name.lower()) else ''
        suffix = last[-3:] if last else ''
        if suffix:
            suffixes[suffix] += 1

        # Cliché tokens (length gate to avoid spurious matches like 'o')
        cl = sorted({c for tok in tokens for c in cliche if len(tok) >= 4 and len(c) >= 4 and (tok.find(c) >= 0 or c.find(tok) >= 0)})
        if cl:
            issues.append({"name": name, "type": "cliche", "tokens": cl})

        # Root duplication: shared substring >= 4 chars with other names
        roots = {t for t in tokens if len(t) >= 4}
        for other, otoks in morphs.items():
            if other == name:
                continue
            if any(r in ''.join(otoks) for r in roots):
                issues.append({"name": name, "type": "root_duplication", "with": other, "roots": sorted(list(roots))})
                break

        # Record syllables
        e['syllables'] = syllables_estimate(name)

    total = max(1, len(entries))
    # Initial distribution
    init_ratio = {k: v/total for k, v in initials.items()}
    bad_inits = {k: f"{v*100:.1f}%" for k, v in init_ratio.items() if v > 0.30}
    if bad_inits:
        issues.append({"type": "initial_distribution", "over": bad_inits})

    # Suffix repetition
    bad_suffix = {k: v for k, v in suffixes.items() if v >= 3}
    if bad_suffix:
        issues.append({"type": "suffix_repetition", "suffixes": bad_suffix})

    # Stats
    reg['stats'] = {
        "count": total,
        "initials": initials,
        "suffixes": suffixes,
        "generated_at": datetime.now().isoformat(),
    }
    return {"issues": issues, "initials": initials}


def write_report(reg: dict, result: dict):
    lines = []
    lines.append('# Names Evaluation Report')
    lines.append(f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    lines.append('')
    if not reg.get('entries'):
        lines.append('No names found to evaluate.')
    else:
        lines.append('## Summary')
        lines.append(f'- Total names: {len(reg["entries"])}')
        lines.append('')
        if result['issues']:
            lines.append('## Issues & Warnings')
            for issue in result['issues']:
                if issue.get('type') == 'cliche':
                    lines.append(f"- {issue['name']}: contains cliché morphemes {issue['tokens']}")
                elif issue.get('type') == 'root_duplication':
                    lines.append(f"- {issue['name']}: shares roots {issue['roots']} with {issue['with']}")
                elif issue.get('type') == 'initial_distribution':
                    lines.append(f"- Initial letter imbalance (>30%): {issue['over']}")
                elif issue.get('type') == 'suffix_repetition':
                    lines.append(f"- Repeated suffixes (≥3 occurrences): {issue['suffixes']}")
        else:
            lines.append('- No issues detected.')
        lines.append('')
        lines.append('## Entries')
        for e in reg['entries']:
            lines.append(f"- {e['name']} ({e.get('role') or 'role?'}), syllables≈{e.get('syllables')}")
    os.makedirs(OUT, exist_ok=True)
    with open(ReportPath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines).rstrip() + '\n')


def main():
    os.makedirs(OUT, exist_ok=True)
    reg = build_registry_from_outputs()
    cliche = load_cliche_morphemes()
    result = evaluate_names(reg, cliche)
    save_registry(reg)
    write_report(reg, result)
    print(f"Wrote {RegistryPath} and {ReportPath}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
