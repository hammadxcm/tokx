# tokx

JWT decode, encode, verify from your terminal.

## Install

```bash
pip install tokx
```

## Usage

```bash
tokx decode <token>
tokx encode --secret <secret> --payload '{"sub":"123"}'
tokx verify <token> --secret <secret>
tokx libs --language Go
```

On first run, the binary will be downloaded automatically for your platform.

## License

MIT
