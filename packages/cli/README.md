# tokx

JWT decode, encode, verify from your terminal.

## Install

```bash
npm install -g tokx-cli
```

## Commands

### Decode

```bash
tokx decode <token>
tokx decode <token> --json
```

Pretty-prints header + payload with color-coded JWT parts, claim status icons, and relative expiry time.

### Encode

```bash
tokx encode --secret <secret> --payload '{"sub":"123"}'
tokx encode --secret <secret> --payload '{"sub":"123"}' --algorithm HS512 --expires 3600
tokx encode --secret <secret> --payload '{"sub":"123"}' --json
```

### Verify

```bash
tokx verify <token> --secret <secret>
tokx verify <token> --secret <secret> --json
```

Auto-detects algorithm from token header. Shows a verification badge.

### Libraries

```bash
tokx libs
tokx libs --language Python
tokx libs --algorithm EdDSA
tokx libs --json
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Invalid input |
| 2 | Verification failed |
| 3 | Internal error |

## Features

- Color-coded JWT parts (header=red, payload=purple, signature=cyan)
- Box-framed output for decoded header/payload
- Spinner for async operations
- `--json` flag on all commands for machine-readable output
- Respects `NO_COLOR` environment variable

## License

MIT
