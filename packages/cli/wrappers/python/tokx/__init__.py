"""tokx — JWT decode, encode, verify from your terminal.

This is a thin wrapper that downloads and runs the tokx binary.
The actual binary is distributed via GitHub Releases.
"""

import os
import platform
import stat
import subprocess
import sys
import urllib.request
from pathlib import Path

VERSION = "0.0.1"
GITHUB_RELEASE = f"https://github.com/hammadxcm/tokx/releases/download/v{VERSION}"

PLATFORM_MAP = {
    ("Darwin", "x86_64"): "tokx-darwin-x64.tar.gz",
    ("Darwin", "arm64"): "tokx-darwin-arm64.tar.gz",
    ("Linux", "x86_64"): "tokx-linux-x64.tar.gz",
    ("Linux", "aarch64"): "tokx-linux-arm64.tar.gz",
    ("Windows", "AMD64"): "tokx-win-x64.zip",
}


def _get_binary_path() -> Path:
    """Get the path where the tokx binary should be installed."""
    cache_dir = Path.home() / ".cache" / "tokx" / VERSION
    cache_dir.mkdir(parents=True, exist_ok=True)
    name = "tokx.exe" if platform.system() == "Windows" else "tokx"
    return cache_dir / name


def _download_binary(dest: Path) -> None:
    """Download the tokx binary for the current platform."""
    system = platform.system()
    machine = platform.machine()
    key = (system, machine)

    if key not in PLATFORM_MAP:
        print(f"Unsupported platform: {system} {machine}", file=sys.stderr)
        sys.exit(1)

    archive = PLATFORM_MAP[key]
    url = f"{GITHUB_RELEASE}/{archive}"

    print(f"Downloading tokx v{VERSION} for {system} {machine}...", file=sys.stderr)

    import tempfile
    import tarfile
    import zipfile

    with tempfile.NamedTemporaryFile(delete=False, suffix=archive) as tmp:
        urllib.request.urlretrieve(url, tmp.name)
        tmp_path = tmp.name

    try:
        if archive.endswith(".tar.gz"):
            with tarfile.open(tmp_path, "r:gz") as tar:
                for member in tar.getmembers():
                    if member.name.endswith("tokx") or member.name.endswith("tokx.exe"):
                        f = tar.extractfile(member)
                        if f:
                            dest.write_bytes(f.read())
                            break
        elif archive.endswith(".zip"):
            with zipfile.ZipFile(tmp_path) as zf:
                for name in zf.namelist():
                    if name.endswith("tokx.exe"):
                        dest.write_bytes(zf.read(name))
                        break
    finally:
        os.unlink(tmp_path)

    # Make executable
    if platform.system() != "Windows":
        dest.chmod(dest.stat().st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)


def main():
    """Entry point — download binary if needed, then delegate."""
    binary = _get_binary_path()

    if not binary.exists():
        _download_binary(binary)

    result = subprocess.run([str(binary)] + sys.argv[1:])
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
