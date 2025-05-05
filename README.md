# Deep Think Chrome Extension

This project provides the Chrome Extension version of the **Deep Think** service — an AI-powered tool for critical reading and media analysis. The extension enables users to analyze web content directly within the page they're viewing, offering sentence-level classification, summary, and author intent detection without switching tabs or copying text.

---

## 🚀 Features

- **One-click analysis** of any webpage without copying or pasting
- **In-page overlays** that highlight sentences based on clarity:

  - 🟩 **Clear sentences**: Objectively interpretable or fact-based
  - 🟪 **Ambiguous sentences**: Subjective, emotional, or open to multiple interpretations

- **summary and author intent** at the top of the page
- **Interactive tooltips** on sentence click, with:

  - Classification explanation
  - Alternative interpretations (if ambiguous)
  - Reference links to external sources (if ambiguous)

- **Popup shortcut** that lets users analyze the current webpage in the full Deep Think web app — no need to copy or paste anything.

---

## 🧭 How to Use

### 🔍 Option 1: In-page Overlay Mode

1. Navigate to any article or webpage.
2. Click the **Deep Think floating button** at the top-right corner of the page.

![image](https://github.com/user-attachments/assets/47e76eb0-e62a-4ba5-ae12-9e5fc7e5d5df)

3. The AI will:

   - Display a **summary and author intent** analysis at the top.
   - Highlight all sentences as clear or ambiguous.
   - Show explanation tooltips when you click on a sentence.

![image](https://github.com/user-attachments/assets/ff0e026f-8d1e-4bcd-9a9f-8bd3bcba9676)

![image](https://github.com/user-attachments/assets/e499d015-ca00-4acc-8df7-7252f2da67f2)



---

### 🔗 Option 2: Open in Web App

1. Click the **Deep Think icon** in the Chrome toolbar.
2. A popup will appear with an option to open the current page inside the Deep Think web app.

![image](https://github.com/user-attachments/assets/29f77012-33d2-44b9-9fd3-105b10416ecd)

3. This launches a full-page version of the analysis with enhanced UI and controls.

![image](https://github.com/user-attachments/assets/014ada03-c5b7-4237-926e-a5e3a02bcb87)


---

## ⚙️ Setup Instructions

To run this extension locally for development:

1. Clone the repo and open `chrome-extension` directory.
2. Run the local build:

   ```
   npm install
   npm run build
   ```

3. Open **chrome://extensions/** in Chrome.
4. Enable **Developer Mode** (top right).
5. Click **“Load unpacked”** and select the `dist/` directory.
   **Important Configuration:**

- In `content.js`, update the `onclick` function to point to your **server address**.
- In `extension.js`, update the `extension` function to point to your **client address**.

---

## 🧑‍💻 Author

This extension is part of the **Deep Think** project — helping users engage with digital content more critically by leveraging explainable AI and in-context feedback.

---

## 📜 License

MIT License
