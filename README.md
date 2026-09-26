# UPI Repayment Link Generator

A simple website for generating UPI repayment links for multiple customers in India.

## Features

- Add multiple customer entries
- Set your merchant UPI ID once
- Generate UPI deep links automatically
- Copy individual or all links
- Download payment data as JSON
- Works as a static website without a backend

## Quick start

1. Open the project folder in a browser, or run a local server:

```bash
cd upi-repayment-generator
python3 -m http.server 8000
```

2. Visit http://localhost:8000 in the browser.

## Files

- `index.html` — website structure
- `styles.css` — page styling
- `script.js` — UPI link generation logic

## Example generated link

```text
upi://pay?pa=yourname@upi&pn=Amit%20Kumar&am=2500.00&cu=INR&tn=Repayment%20for%20invoice%20102
```

## Notes

- The UPI app must be installed on the device to open the payment link directly.
- Some browsers may not support `upi://` links fully, but the link still works on mobile UPI apps.
- You can customize the merchant UPI ID and payment notes as needed.
