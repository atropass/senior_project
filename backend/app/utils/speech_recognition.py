from app.utils.pronunciation_analysis import setup_analyzer
import os
import tempfile
import librosa
import requests

analyzer = None

def init_speech_model():
    """Initialize speech recognition and analysis models once at application startup"""
    global analyzer
    
    try:
        # Initialize the pronunciation analyzer
        analyzer = setup_analyzer()
        
        print("Speech recognition models initialized successfully")
    except Exception as e:
        print(f"Error initializing speech models: {str(e)}")
        raise

def analyze_audio(audio_file, reference_text):
    """Analyze audio pronunciation against reference text using pre-initialized models"""
    # Ensure models are initialized
    if analyzer is None:
        raise RuntimeError("Speech recognition models are not initialized")
    
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
        temp_path = temp_file.name
        audio_file.save(temp_path)

    try:
        # Load audio for analysis
        waveform, sample_rate = librosa.load(temp_path, sr=16000)

        files = {
            "audio": open(temp_path, "rb"),
        }
        # Get ASR result first
        result = requests.post(
            url="http://34.80.244.180:5000/transcribe",
            files=files,
        )
        if result.status_code != 200:
            raise RuntimeError("ASR service failed to process the audio")
        files["audio"].close()
        # Parse the ASR result
        result = result.json()
        predicted_text = result["transcription"]

        # Get pronunciation analysis with both waveform and predicted text
        pronunciation_analysis = analyzer.analyze_pronunciation(
            waveform=waveform,
            sample_rate=sample_rate,
            reference_text=reference_text,
            predicted_text=predicted_text,
        )

        # Combine the analyses
        response = {
            "predicted_text": predicted_text,
            "reference_text": reference_text,
            "phoneme_analysis": pronunciation_analysis["phoneme_analysis"],
            "pronunciation_score": pronunciation_analysis["pronunciation_score"],
            "rhythm_metrics": pronunciation_analysis["rhythm_metrics"],
            "detailed_feedback": pronunciation_analysis["detailed_feedback"],
        }

        return response
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        raise
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)