// Package main provides a thin Go wrapper for the tokx CLI.
// It downloads the appropriate binary for the current platform
// from GitHub Releases and delegates all arguments to it.
//
// Install: go install github.com/hammadxcm/tokx-go@latest
package main

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

const version = "0.0.1"

func platformArtifact() (string, error) {
	goos := runtime.GOOS
	goarch := runtime.GOARCH

	switch {
	case goos == "darwin" && goarch == "arm64":
		return "tokx-darwin-arm64.tar.gz", nil
	case goos == "darwin" && goarch == "amd64":
		return "tokx-darwin-x64.tar.gz", nil
	case goos == "linux" && goarch == "amd64":
		return "tokx-linux-x64.tar.gz", nil
	case goos == "linux" && goarch == "arm64":
		return "tokx-linux-arm64.tar.gz", nil
	default:
		return "", fmt.Errorf("unsupported platform: %s/%s", goos, goarch)
	}
}

func binaryPath() string {
	cacheDir, _ := os.UserCacheDir()
	dir := filepath.Join(cacheDir, "tokx", version)
	os.MkdirAll(dir, 0o755)
	return filepath.Join(dir, "tokx")
}

func download(dest string) error {
	artifact, err := platformArtifact()
	if err != nil {
		return err
	}

	url := fmt.Sprintf("https://github.com/hammadxcm/tokx/releases/download/v%s/%s", version, artifact)
	fmt.Fprintf(os.Stderr, "Downloading tokx v%s...\n", version)

	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("download failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("download failed: HTTP %d", resp.StatusCode)
	}

	gz, err := gzip.NewReader(resp.Body)
	if err != nil {
		return fmt.Errorf("decompress failed: %w", err)
	}
	defer gz.Close()

	tr := tar.NewReader(gz)
	for {
		header, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("tar read failed: %w", err)
		}
		if header.Name == "tokx" || filepath.Base(header.Name) == "tokx" {
			f, err := os.OpenFile(dest, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o755)
			if err != nil {
				return err
			}
			if _, err := io.Copy(f, tr); err != nil {
				f.Close()
				return err
			}
			f.Close()
			return nil
		}
	}

	return fmt.Errorf("tokx binary not found in archive")
}

func main() {
	bin := binaryPath()

	if _, err := os.Stat(bin); os.IsNotExist(err) {
		if err := download(bin); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	}

	cmd := exec.Command(bin, os.Args[1:]...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		os.Exit(1)
	}
}
