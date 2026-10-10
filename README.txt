# PeerLoop — Peer Review System for Online Learning

## Run the project
1. Extract `PeerLoop_Project.zip`.
2. Open the `peer_review_system` folder.
3. Double-click `index.html` (Chrome or Edge recommended).
4. Try the sample assignments and reviews. Submit a new assignment to test the form.
5. Use the **Switch** button to change demo student and test reviewing/feedback.

No installation is needed.

## Features
- Dashboard counts for submissions, reviews, and feedback.
- Assignment submission (title, subject, text).
- Peer review with 1–5 rating, strengths, and suggestions.
- Feedback page showing reviews received.
- Responsive layout for desktop and mobile.
- Saves demo information in the current browser using localStorage.

## Files
- `index.html`: page structure and forms.
- `style.css`: layout, colours, spacing, and responsive design.
- `script.js`: button actions, form validation, reviews, dashboard counts, and browser storage.

## Important project limitation
This is a front-end classroom prototype. Browser `localStorage` is local to one browser/device and is not a secure account system or shared online database. The **Switch** button is only for demonstrating different students on one device. For real multi-device use, add a backend/database (for example, Firebase or a Node.js API) and proper authentication. Do not enter private information.

## Team division (3 members)
1. **Member 1 — HTML and pages:** explain `index.html`, forms, labels, navigation, and semantic structure.
2. **Member 2 — CSS and UI:** explain `style.css`, colour scheme, cards, responsive media queries, and usability.
3. **Member 3 — JavaScript and testing:** explain `script.js`, form validation, `localStorage`, review submission, and testing.
All members should run the app and understand the overall workflow before the viva.

## Demo flow for presentation
1. Open Dashboard and explain the three counts.
2. Open Assignments and submit a title, subject, and short assignment.
3. Click Switch to change demo student.
4. Open Peer reviews, select the assignment, rate it, and write constructive feedback.
5. Switch back to the assignment owner and open My feedback.
6. Explain that the current prototype stores information in the browser only.
