# tokx

JWT decode, encode, verify from your terminal.

## Install

```bash
cargo binstall tokx-bin
```

Or download directly from [GitHub Releases](https://github.com/hammadxcm/tokx/releases).

## Usage

```bash
tokx decode <token>
tokx encode --secret <secret> --payload '{"sub":"123"}'
tokx verify <token> --secret <secret>
tokx libs --language Python
```

## License

MIT
