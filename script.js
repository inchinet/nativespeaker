document.addEventListener('DOMContentLoaded', async () => {
    // --- UI Element References ---
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const ttsInput = document.getElementById('tts-input');
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const ttsStatus = document.getElementById('tts-status');

    // Removed: voicerssKeyInput

    const recordBtn = document.getElementById('record-btn');
    const downloadBtn = document.getElementById('download-btn');
    const sttOutput = document.getElementById('stt-output');
    const sttStatus = document.getElementById('stt-status');

    // --- Global State ---
    let currentUtterance = null; // To keep track of current playing audio

    // --- Feature Detection for STT (Browser's Web Speech API) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    let isRecording = false;

    // --- TTS (Browser's SpeechSynthesis) Implementation ---

    async function speak(text) {
        if (text.trim() === '') {
            ttsStatus.textContent = 'Please enter some text to speak.';
            return;
        }

        ttsStatus.textContent = 'Translating text...';
        playBtn.disabled = true;

        try {
            // Step 1: Translate the text to Chinese for the Cantonese voice model
            const translatedText = await translateText(text, 'zh-HK');
            ttsStatus.textContent = 'Generating audio...';

            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(translatedText);
                utterance.lang = 'zh-HK'; // Attempt to use Cantonese

                // Optional: Try to find a suitable Cantonese voice
                const voices = window.speechSynthesis.getVoices();
                const cantoneseVoice = voices.find(voice => voice.lang === 'zh-HK' || voice.lang === 'yue-HK' || voice.name.includes('Cantonese'));
                if (cantoneseVoice) {
                    utterance.voice = cantoneseVoice;
                } else {
                    console.warn('No specific Cantonese voice found, using default for zh-HK or first available.');
                }

                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
                currentUtterance = utterance;
                window.speechSynthesis.speak(utterance);

                ttsStatus.textContent = 'Speaking...';
                utterance.onend = () => {
                    ttsStatus.textContent = 'Ready.';
                    playBtn.disabled = false;
                    currentUtterance = null;
                };
                utterance.onerror = (event) => {
                    ttsStatus.textContent = `Error playing audio: ${event.error}.`;
                    console.error('SpeechSynthesis error:', event);
                    playBtn.disabled = false;
                    currentUtterance = null;
                };
            } else {
                ttsStatus.textContent = 'SpeechSynthesis not supported in this browser.';
                console.error('SpeechSynthesis not supported.');
                playBtn.disabled = false;
            }

        } catch (error) {
            ttsStatus.textContent = `Error: ${error.message}`;
            console.error('TTS Error:', error);
            playBtn.disabled = false;
        }
    }

    stopBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // Stop all speech
            if (currentUtterance) {
                currentUtterance.onend = null; // Prevent onend from firing after cancel
                currentUtterance.onerror = null;
                currentUtterance = null;
            }
            ttsStatus.textContent = 'Ready.';
            playBtn.disabled = false;
        }
    });

    playBtn.addEventListener('click', () => {
        const text = ttsInput.value.trim();
        if (text) {
             speak(text);
        } else {
            ttsStatus.textContent = 'Please enter some text to speak.';
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        fileNameDisplay.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (event) => ttsInput.value = event.target.result;
        reader.readAsText(file);

        // FIX: Clear the file input value to allow re-uploading the same file
        e.target.value = null;
    });

    // --- Speech-to-Text (STT) Implementation remains the same ---
    if (recognition) {
        // ... (STT code from previous version is unchanged)
        recognition.continuous = false;
        recognition.lang = 'yue-Hant-HK';
        recognition.interimResults = false;
        recognition.onstart = () => { isRecording = true; recordBtn.textContent = 'Stop'; recordBtn.classList.add('recording'); sttStatus.textContent = 'Listening...'; };
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            sttOutput.value = `Original (Cantonese): ${transcript}\n\nTranslating...`;
            const translatedText = await translateText(transcript, 'zh-TW');
            sttOutput.value = translatedText;
            sttStatus.textContent = '';
        };
        recognition.onerror = (event) => { sttStatus.textContent = `Error: ${event.error}.`; console.error('SpeechRecognition error:', event.error); };
        recognition.onend = () => { isRecording = false; recordBtn.textContent = 'Record'; recordBtn.classList.remove('recording'); if (sttStatus.textContent === 'Listening...') { sttStatus.textContent = ''; } };
        recordBtn.addEventListener('click', () => { if (isRecording) { recognition.stop(); } else { sttOutput.value = ''; sttStatus.textContent = ''; recognition.start(); } });
    } else {
        sttStatus.textContent = "Speech Recognition is not supported by your browser. Please try Google Chrome.";
        recordBtn.disabled = true;
    }

    // --- Translation Helper remains the same ---
    async function translateText(text, targetLang) {
        // ... (Translation code from previous version is unchanged)
        if (!text) return '';
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data[0].map(item => item[0]).join('');
        } catch (error) {
            console.error('Translation error:', error);
            return 'Translation failed.';
        }
    }
    
    // --- Download Button remains the same ---
     downloadBtn.addEventListener('click', () => {
        // ... (Download code from previous version is unchanged)
        const text = sttOutput.value;
        if (text) {
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transcription.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('Nothing to download.');
        }
    });

    // Initial status update
    ttsStatus.textContent = 'Ready.';
});
