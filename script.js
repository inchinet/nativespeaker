document.addEventListener('DOMContentLoaded', async () => {
    // --- UI Element References ---
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const ttsInput = document.getElementById('tts-input');
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const ttsStatus = document.getElementById('tts-status');

    const voicerssKeyInput = document.getElementById('voicerss-key');

    const recordBtn = document.getElementById('record-btn');
    const downloadBtn = document.getElementById('download-btn');
    const sttOutput = document.getElementById('stt-output');
    const sttStatus = document.getElementById('stt-status');

    // --- Global State ---
    let currentAudio = null; // To keep track of current playing audio

    // --- Feature Detection for STT (Browser's Web Speech API) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    let isRecording = false;

    // --- TTS (VoiceRSS) Implementation ---

    async function speak(text) {
        const voicerssKey = voicerssKeyInput.value.trim();

        if (!voicerssKey) {
            ttsStatus.textContent = 'Please enter your VoiceRSS API Key.';
            return;
        }

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

            const url = `https://api.voicerss.org/?key=${voicerssKey}&src=${encodeURIComponent(translatedText)}&hl=zh-hk&v=Lina&r=0&c=MP3&f=44khz_16bit_stereo`;
            
            // VoiceRSS returns an audio file directly or an error message as plain text
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`VoiceRSS Error: ${response.status} - ${errorText}`);
            }

            // Play the audio
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            currentAudio = new Audio(URL.createObjectURL(await response.blob()));
            currentAudio.play();

            ttsStatus.textContent = 'Speaking...';
            currentAudio.onended = () => {
                ttsStatus.textContent = 'Ready.';
                playBtn.disabled = false;
            };
            currentAudio.onerror = (e) => {
                ttsStatus.textContent = `Error playing audio.`;
                console.error('Audio playback error:', e);
                playBtn.disabled = false;
            };

        } catch (error) {
            ttsStatus.textContent = `Error: ${error.message}`;
            console.error('VoiceRSS TTS Error:', error);
            playBtn.disabled = false;
        }
    }

    stopBtn.addEventListener('click', () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
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
