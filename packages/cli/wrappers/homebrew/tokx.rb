class Tokx < Formula
  desc "JWT decode, encode, verify from your terminal"
  homepage "https://github.com/hammadxcm/tokx"
  license "MIT"
  version "0.0.1"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/hammadxcm/tokx/releases/download/v#{version}/tokx-darwin-arm64.tar.gz"
      sha256 "PLACEHOLDER_SHA256"
    else
      url "https://github.com/hammadxcm/tokx/releases/download/v#{version}/tokx-darwin-x64.tar.gz"
      sha256 "PLACEHOLDER_SHA256"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/hammadxcm/tokx/releases/download/v#{version}/tokx-linux-arm64.tar.gz"
      sha256 "PLACEHOLDER_SHA256"
    else
      url "https://github.com/hammadxcm/tokx/releases/download/v#{version}/tokx-linux-x64.tar.gz"
      sha256 "PLACEHOLDER_SHA256"
    end
  end

  def install
    bin.install "tokx"
  end

  test do
    assert_match "0.0.1", shell_output("#{bin}/tokx --version")
  end
end
