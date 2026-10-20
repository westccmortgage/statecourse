"""A sealed fixture proves the public output list and media assembly."""
import subprocess
import tempfile
import tomllib
import unittest
from pathlib import Path
import shutil

SOURCE = Path(__file__).resolve().parents[1]


class PublicSiteBuildTest(unittest.TestCase):
    def test_only_browser_assets_are_published(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name, content in {
                "index.html": '<script src="/app.js"></script>',
                "app.js": 'import "/studio/entry.js";',
                "styles.css": 'body { color: navy; }',
                "studio/index.html": '<script src="/studio/entry.js"></script>',
                "studio/entry.js": 'export const ready = true;',
                "studio/vendor/pdfjs/pdf.min.mjs": 'export const pdf = true;',
                "studio/tests/private-fixture.js": 'PRIVATE',
                "studio/measured-decision-run/build-engine.mjs": 'PRIVATE',
                "team/index.html": 'Team',
                "team/README.md": 'Internal notes',
                "assets/hero/cover.jpg": 'IMAGE',
                "assets/video-parts/clip.mp4/part-000": 'first',
                "assets/video-parts/clip.mp4/part-001": 'second',
                "workers/core-v2/kernel/contracts.ts": 'PRIVATE',
                "supabase/functions/core-v2-factory/index.ts": 'PRIVATE',
                "docs/owner-plan.md": 'PRIVATE',
                "netlify.toml": 'PRIVATE',
            }.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content)
            scripts = root / "scripts"
            scripts.mkdir()
            shutil.copy2(SOURCE / "scripts/assemble-media.sh", scripts)
            shutil.copy2(SOURCE / "scripts/publish-site.py", scripts)
            (scripts / "patch-main-team.py").write_text("# Fixture: no public changes needed\n")
            subprocess.run(["bash", "scripts/assemble-media.sh"], cwd=root, check=True)
            published = {p.relative_to(root / "public-dist").as_posix()
                         for p in (root / "public-dist").rglob("*") if p.is_file()}
            self.assertEqual(published, {
                "index.html", "app.js", "styles.css", "studio/index.html",
                "studio/entry.js", "studio/vendor/pdfjs/pdf.min.mjs",
                "team/index.html", "assets/hero/cover.jpg", "assets/video/clip.mp4"})
            self.assertEqual((root / "public-dist/assets/video/clip.mp4").read_text(), "firstsecond")
            self.assertFalse((root / "assets/video-parts").exists())
            self.assertEqual(tomllib.loads((SOURCE / "netlify.toml").read_text())["build"]["publish"],
                             "public-dist")

    def test_symlink_in_public_tree_fails_closed(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name in ("index.html", "app.js", "styles.css"):
                (root / name).write_text(name)
            (root / "studio").mkdir()
            (root / "studio/escape.js").symlink_to(root / "index.html")
            scripts = root / "scripts"
            scripts.mkdir()
            shutil.copy2(SOURCE / "scripts/publish-site.py", scripts)
            proc = subprocess.run(["python3", "scripts/publish-site.py"], cwd=root,
                                  capture_output=True, text=True)
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("symlink", proc.stderr)


if __name__ == "__main__":
    unittest.main()
