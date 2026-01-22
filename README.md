# Native Speaker (Browser TTS)

A simple, lightweight web application for text-to-speech and speech-to-text, leveraging browser-native capabilities for speech generation.
![UI](https://github.com/inchinet/nativespeaker/blob/main/nativespeaker.png)

## Features

*   **Text-to-Speech (Translate to Cantonese):**
    *   Translates input text (e.g., English) into Chinese, then generates high-quality Cantonese speech using your browser's native Text-to-Speech (`speechSynthesis`) capabilities.
    *   Availability and quality of Cantonese voices depend on your browser and operating system.
    *   Supports direct text pasting or uploading simple text files (`.txt`, `.srt`).
    *   Includes Play and Stop controls for audio playback.

*   **Speech-to-Text (STT):**
    *   Uses your browser's built-in speech recognition to transcribe your voice (best supported in Chrome).
    *   Automatically translates the transcribed text into Traditional Chinese using Google Translate's public service.
    *   Allows you to download the final text.

## Technology

*   **Frontend:** HTML5, CSS3, JavaScript
*   **TTS API:** Browser's Web Speech API (`speechSynthesis`)
*   **STT API:** Browser's Web Speech API (`SpeechRecognition`)
*   **Translation API:** Google Translate's public endpoint
*   **Local Server:** Python's built-in `http.server` (for local file access)

## Setup and Installation

### Prerequisites

*   **Python 3:** Needed to run the simple local web server.

### Instructions

1.  **Download the Project:** Ensure you have all the project files in your desired directory.
2.  **Open Command Prompt/Terminal:** Navigate to the `nativespeaker` directory.
3.  **Start the Local Web Server:**
    *   Double-click the **`start-server.bat`** file (on Windows) or run `./start-server.sh` (if created for Linux) and leave the command window open.
    *   This will start a simple web server to correctly serve the application files.
4.  **Access the Application:** Open your web browser and navigate to: **`http://localhost:8001`**

## How to Use

1.  **For Text-to-Speech:**
    *   Enter or upload Cantonese text.
    *   Click the **"Play"** button to hear the speech.
2.  **For Speech-to-Text:**
    *   Click the **"Record"** button and grant microphone permissions.
    *   Speak, then click **"Stop"**. The transcribed and translated text will appear.
3.  **Download Text:** Click the **"Download Text"** button to save the transcribed text.