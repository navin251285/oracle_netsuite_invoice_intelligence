# PDF Intelligence Engine Frontend

Minimal React UI for PDF -> JSON -> NetSuite workflow with clear stage separation.

## Stack

- React (functional components)
- Vite (fast setup, npm start)
- Plain CSS (no UI libraries)

## Run

1. Install dependencies:
	npm install

2. Start app:
	npm start

3. Open:
	http://127.0.0.1:5173

## Backend API

Default endpoint used by UI:
/api/process-invoice (via Vite proxy)

Default proxy target:
http://127.0.0.1:8000

If your backend runs on a different origin/port, set proxy target before start:
VITE_BACKEND_ORIGIN=http://127.0.0.1:7777 npm start

If you want to bypass proxy and call backend directly from browser, set:
VITE_API_URL=http://127.0.0.1:8000/process-invoice npm start

## Features

- Drag-and-drop PDF upload
- Processing states:
  - Extracting PDF data...
  - Sending to NetSuite...
- Separate stage rendering:
  - Extracted PDF Data
  - NetSuite Response
- NetSuite verdict card with success/error highlighting
- Raw JSON copy to clipboard
- Expand/collapse output sections
