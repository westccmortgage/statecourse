"""Build the public Netlify tree from explicit browser assets only."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public-dist"
ROOT_FILES = ("index.html", "app.js", "styles.css")
PAGE_DIRS = ("capture", "construction-owner-oversight", "field",
             "film-production", "investors", "security", "studio", "team")
PAGE_SUFFIXES = {".html", ".css", ".js", ".mjs", ".json", ".svg",
                 ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico",
                 ".woff", ".woff2", ".ttf", ".vtt", ".mp4", ".webm"}
ASSET_SUFFIXES = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif",
                  ".ico", ".woff", ".woff2", ".ttf", ".vtt", ".mp4", ".webm"}


def copy_file(source):
    if source.is_symlink():
        raise ValueError(f"Public asset is a symlink: {source.relative_to(ROOT)}")
    destination = OUTPUT / source.relative_to(ROOT)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def build():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for name in ROOT_FILES:
        source = ROOT / name
        if not source.is_file():
            raise FileNotFoundError(f"Required public page missing: {name}")
        copy_file(source)
    for dirname in PAGE_DIRS:
        directory = ROOT / dirname
        if directory.is_symlink():
            raise ValueError(f"Public directory is a symlink: {dirname}")
        if not directory.is_dir():
            continue
        for source in directory.rglob("*"):
            if source.is_symlink():
                raise ValueError(f"Public tree contains symlink: {source.relative_to(ROOT)}")
            if not source.is_file():
                continue
            relative = source.relative_to(ROOT)
            if (any(part.startswith(".") or part == "tests" for part in relative.parts)
                    or relative == Path("studio/measured-decision-run/build-engine.mjs")):
                continue
            if source.suffix.lower() in PAGE_SUFFIXES:
                copy_file(source)
    assets = ROOT / "assets"
    if assets.is_symlink():
        raise ValueError("Public asset directory is a symlink: assets")
    if assets.is_dir():
        for source in assets.rglob("*"):
            if source.is_symlink():
                raise ValueError(f"Public asset tree contains symlink: {source.relative_to(ROOT)}")
            if not source.is_file():
                continue
            relative = source.relative_to(ROOT)
            if any(part.startswith(".") for part in relative.parts):
                continue
            if relative.parts[1] in {"video-parts", "media-b64"}:
                continue
            if source.suffix.lower() in ASSET_SUFFIXES:
                copy_file(source)


if __name__ == "__main__":
    build()
