import os
import json
from pathlib import Path
from datetime import datetime

ROOT = Path(".").resolve()
OUTPUT_FILE = ROOT / "PROJECT_SUMMARY.md"

INCLUDE_DIRS = {"src", "scripts", "public", "functions"}
EXCLUDE_DIRS = {"node_modules", ".git", ".next", "dist", "build", "__pycache__"}

summary = {
    "project_name": None,
    "next_version": None,
    "dependencies": {},
    "dev_dependencies": {},
    "routes": [],
    "api_routes": [],
    "components": [],
    "hooks": [],
    "contexts": [],
    "layouts": [],
    "scripts_files": [],
    "public_assets": [],
    "functions_files": [],
}

# -------------------------
# PACKAGE.JSON
# -------------------------
pkg_file = ROOT / "package.json"
if pkg_file.exists():
    with open(pkg_file) as f:
        pkg = json.load(f)
        summary["project_name"] = pkg.get("name")
        summary["dependencies"] = pkg.get("dependencies", {})
        summary["dev_dependencies"] = pkg.get("devDependencies", {})
        summary["next_version"] = summary["dependencies"].get("next")

# -------------------------
# FILE SCAN
# -------------------------
def should_scan(path: Path):
    return (
        not any(part in EXCLUDE_DIRS for part in path.parts)
        and any(part in INCLUDE_DIRS for part in path.parts)
    )

for root, dirs, files in os.walk(ROOT):
    root_path = Path(root)

    if not should_scan(root_path):
        continue

    for file in files:
        path = root_path / file
        rel = path.relative_to(ROOT)

        # Routes (App Router)
        if "app" in rel.parts and file in ["page.tsx", "page.jsx"]:
            summary["routes"].append(str(rel.parent))

        # Routes (Pages Router)
        if "pages" in rel.parts and file.endswith((".tsx", ".jsx")) and "api" not in rel.parts:
            summary["routes"].append(str(rel))

        # API routes
        if "api" in rel.parts and file.endswith((".ts", ".js")):
            summary["api_routes"].append(str(rel))

        # Components
        if "components" in rel.parts and file.endswith((".tsx", ".jsx")):
            summary["components"].append(str(rel))

        # Hooks
        if file.startswith("use") and file.endswith((".ts", ".tsx", ".js")):
            summary["hooks"].append(str(rel))

        # Context
        if "context" in file.lower():
            summary["contexts"].append(str(rel))

        # Layout
        if file.startswith("layout.") and file.endswith((".tsx", ".jsx")):
            summary["layouts"].append(str(rel))

        # Scripts
        if "scripts" in rel.parts:
            summary["scripts_files"].append(str(rel))

        # Public
        if "public" in rel.parts:
            summary["public_assets"].append(str(rel))

        # Functions (serverless etc.)
        if "functions" in rel.parts:
            summary["functions_files"].append(str(rel))

# -------------------------
# MARKDOWN GENERATION
# -------------------------
md = []
md.append(f"# Project Summary — {summary['project_name']}\n")
md.append(f"_Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}_\n")

md.append("## ⚙️ Stack\n")
md.append(f"- **Next.js version**: {summary['next_version']}\n")

md.append("### Dependencies\n")
for k, v in summary["dependencies"].items():
    md.append(f"- {k}: `{v}`")

md.append("\n### Dev Dependencies\n")
for k, v in summary["dev_dependencies"].items():
    md.append(f"- {k}: `{v}`")

def section(title, items):
    md.append(f"\n## {title}\n")
    if items:
        for i in sorted(set(items)):
            md.append(f"- {i}")
    else:
        md.append("_None found_")

section("🛣 Routes", summary["routes"])
section("🔌 API Routes", summary["api_routes"])
section("🧩 Components", summary["components"])
section("🪝 Hooks", summary["hooks"])
section("🧠 Contexts", summary["contexts"])
section("📐 Layouts", summary["layouts"])
section("🛠 Scripts Folder", summary["scripts_files"])
section("🖼 Public Assets", summary["public_assets"])
section("☁️ Functions Folder", summary["functions_files"])

md.append("\n---\n")
md.append("### 📊 Stats\n")
md.append(f"- Total Routes: {len(set(summary['routes']))}")
md.append(f"- API Routes: {len(set(summary['api_routes']))}")
md.append(f"- Components: {len(set(summary['components']))}")
md.append(f"- Hooks: {len(set(summary['hooks']))}")
md.append(f"- Contexts: {len(set(summary['contexts']))}")
md.append(f"- Layouts: {len(set(summary['layouts']))}")

# Write file
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(md))

print(f"\n✅ Markdown summary generated: {OUTPUT_FILE}\n")
