#!/usr/bin/env python3
"""
Series Architect Skill Integrity Validator

Checks for:
- Missing files referenced in workflows
- Broken internal references
- Required files present
- Template completeness
- Beat sheet library integrity
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict

class SkillValidator:
    def __init__(self, skill_root="."):
        self.skill_root = Path(skill_root)
        self.errors = []
        self.warnings = []
        self.info = []
        self.file_references = defaultdict(list)

    def validate_all(self):
        """Run all validation checks"""
        print("🔍 Series Architect Skill Integrity Validation\n")

        self.check_required_files()
        self.check_workflow_files()
        self.check_file_references()
        self.check_template_integrity()
        self.check_beat_sheet_library()
        self.check_schemas()
        self.check_python_scripts()

        self.print_report()
        return len(self.errors) == 0

    def check_required_files(self):
        """Check that core required files exist"""
        print("📋 Checking required files...")

        required = [
            "SKILL.md",
            "QUICKSTART.md",
            "references/workflows/workflow_principles.md",
            "references/workflows/stage_1_intake.md",
            "references/workflows/stage_2_research.md",
            "references/workflows/stage_3_framework.md",
            "references/workflows/stage_4_dossier.md",
            "references/workflows/stage_5_development.md",
            "references/workflows/stage_6_output.md",
            "references/workflows/recommendation_protocol.md",
            "references/workflows/session_management.md",
            "references/workflows/document_separation.md",
            "references/workflows/stage_transition_checklist.md",
            "references/beat_sheets.md",
            "references/universal_fantasies.md",
            "references/names/protocol.md",
            "references/names/cliche_morphemes.txt",
        ]

        for file_path in required:
            full_path = self.skill_root / file_path
            if not full_path.exists():
                self.errors.append(f"Required file missing: {file_path}")
            elif full_path.stat().st_size == 0:
                self.errors.append(f"Required file is empty: {file_path}")
            else:
                self.info.append(f"✓ {file_path}")

    def check_workflow_files(self):
        """Check workflow directory completeness"""
        print("\n📂 Checking workflow files...")

        workflow_dir = self.skill_root / "references" / "workflows"
        if not workflow_dir.exists():
            self.errors.append("Workflow directory missing: references/workflows/")
            return

        workflow_files = list(workflow_dir.glob("*.md"))
        expected_count = 15  # Approximate, based on analysis

        if len(workflow_files) < expected_count:
            self.warnings.append(f"Only {len(workflow_files)} workflow files found, expected ~{expected_count}")

        self.info.append(f"Found {len(workflow_files)} workflow files")

    def check_file_references(self):
        """Check for broken file references in markdown files"""
        print("\n🔗 Checking file references...")

        # Patterns to find file references
        patterns = [
            r'`([^`]+\.(md|json|txt|py))`',  # Inline code: `filename.md`
            r'\(([^)]+\.(md|json|txt|py))\)',  # Links: (filename.md)
            r'Load[:\s]+`?([^`\n]+\.md)`?',  # Load: filename.md
            r'See `([^`]+\.md)`',  # See `filename.md`
        ]

        md_files = list(self.skill_root.glob("**/*.md"))

        for md_file in md_files:
            try:
                content = md_file.read_text()
                for pattern in patterns:
                    matches = re.findall(pattern, content, re.MULTILINE)
                    for match in matches:
                        # Extract just the filename (remove tuple if present)
                        ref_file = match[0] if isinstance(match, tuple) else match
                        ref_file = ref_file.strip()

                        # Skip URLs
                        if ref_file.startswith(('http://', 'https://')):
                            continue

                        # Try to resolve relative to markdown file location
                        possible_paths = [
                            self.skill_root / ref_file,
                            md_file.parent / ref_file,
                            self.skill_root / "references" / ref_file,
                            self.skill_root / "templates" / ref_file,
                            self.skill_root / "outputs" / ref_file,
                        ]

                        found = False
                        for path in possible_paths:
                            if path.exists():
                                found = True
                                break

                        if not found:
                            self.file_references[str(md_file.relative_to(self.skill_root))].append(ref_file)
            except Exception as e:
                self.warnings.append(f"Could not read {md_file}: {e}")

        # Report broken references
        for source, refs in self.file_references.items():
            for ref in refs:
                # Special handling for outputs/ - expected not to exist yet
                if ref.startswith('outputs/'):
                    self.info.append(f"Reference to output file (OK): {source} → {ref}")
                else:
                    self.warnings.append(f"Broken reference: {source} → {ref}")

    def check_template_integrity(self):
        """Check template files"""
        print("\n📝 Checking templates...")

        template_dir = self.skill_root / "templates"
        if not template_dir.exists():
            self.errors.append("Template directory missing")
            return

        templates = list(template_dir.glob("*.md"))

        if len(templates) < 10:
            self.warnings.append(f"Only {len(templates)} templates found, expected 15+")
        else:
            self.info.append(f"✓ Found {len(templates)} templates")

        # Check for key templates
        key_templates = [
            "intake_form_template.md",
            "character_architecture_template.md",
            "worldbuilding_template.md",
            "book_dossier_template.md",
        ]

        for template in key_templates:
            template_path = template_dir / template
            if not template_path.exists():
                self.warnings.append(f"Key template missing: {template}")

    def check_beat_sheet_library(self):
        """Check beat sheet library"""
        print("\n🎵 Checking beat sheet library...")

        beat_dir = self.skill_root / "beat_sheet_library"
        if not beat_dir.exists():
            self.errors.append("Beat sheet library directory missing")
            return

        beat_sheets = list(beat_dir.glob("*.md"))

        if len(beat_sheets) < 8:
            self.warnings.append(f"Only {len(beat_sheets)} beat sheets found, expected 10+")
        else:
            self.info.append(f"✓ Found {len(beat_sheets)} beat sheets")

        # Check for key beat sheets mentioned in documentation
        key_beats = [
            "three_act_structure.md",
            "romance_beat_sheet.md",
            "A_MutualTrauma_Bonding.md",
            "B_Protector_Wounded.md",
        ]

        for beat in key_beats:
            beat_path = beat_dir / beat
            if not beat_path.exists():
                self.errors.append(f"Key beat sheet missing: {beat}")

    def check_schemas(self):
        """Check JSON schema files"""
        print("\n🔧 Checking schemas...")

        schema_dir = self.skill_root / "schemas"
        if not schema_dir.exists():
            self.warnings.append("Schema directory missing")
            return

        schemas = list(schema_dir.glob("*.json"))

        for schema_file in schemas:
            try:
                with open(schema_file) as f:
                    json.load(f)
                self.info.append(f"✓ Valid JSON: {schema_file.name}")
            except json.JSONDecodeError as e:
                self.errors.append(f"Invalid JSON in {schema_file.name}: {e}")

    def check_python_scripts(self):
        """Check Python helper scripts"""
        print("\n🐍 Checking Python scripts...")

        scripts_dir = self.skill_root / "scripts"
        if not scripts_dir.exists():
            self.warnings.append("Scripts directory missing")
            return

        scripts = list(scripts_dir.glob("*.py"))

        if len(scripts) < 5:
            self.warnings.append(f"Only {len(scripts)} Python scripts found")
        else:
            self.info.append(f"✓ Found {len(scripts)} Python scripts")

        # Check for syntax errors
        for script in scripts:
            try:
                with open(script) as f:
                    compile(f.read(), script.name, 'exec')
                self.info.append(f"✓ Valid syntax: {script.name}")
            except SyntaxError as e:
                self.errors.append(f"Syntax error in {script.name}: {e}")

    def print_report(self):
        """Print validation report"""
        print("\n" + "="*60)
        print("VALIDATION REPORT")
        print("="*60)

        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"  • {error}")

        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  • {warning}")

        if not self.errors and not self.warnings:
            print("\n✅ All checks passed! Skill integrity validated.")

        print(f"\nSummary:")
        print(f"  Errors:   {len(self.errors)}")
        print(f"  Warnings: {len(self.warnings)}")
        print(f"  Info:     {len(self.info)}")

        if self.errors:
            print("\n🔴 Validation FAILED - fix errors before using skill")
            return False
        elif self.warnings:
            print("\n🟡 Validation PASSED with warnings - skill usable but improvements recommended")
            return True
        else:
            print("\n🟢 Validation PASSED - skill is fully operational")
            return True


def main():
    """Main entry point"""
    import sys

    # Determine skill root
    if len(sys.argv) > 1:
        skill_root = sys.argv[1]
    else:
        # Assume script is in scripts/ directory
        script_dir = Path(__file__).parent
        skill_root = script_dir.parent

    validator = SkillValidator(skill_root)
    success = validator.validate_all()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
