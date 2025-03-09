from app.utils.pronunciation_analysis import setup_analyzer
import os
import tempfile
from transformers import pipeline
import librosa

model_name = "adilism/wav2vec2-large-xlsr-kazakh"
asr_pipeline = None
analyzer = None

def init_speech_model():
    """Initialize speech recognition and analysis models once at application startup"""
    global asr_pipeline, analyzer
    
    try:
        print("Initializing speech recognition models...")
        # Initialize the ASR pipeline
        asr_pipeline = pipeline("automatic-speech-recognition", model=model_name)
        
        # Initialize the pronunciation analyzer
        analyzer = setup_analyzer(model_name)
        
        print("Speech recognition models initialized successfully")
    except Exception as e:
        print(f"Error initializing speech models: {str(e)}")
        raise

def analyze_audio(audio_file, reference_text):
    """Analyze audio pronunciation against reference text using pre-initialized models"""
    # Ensure models are initialized
    if asr_pipeline is None or analyzer is None:
        raise RuntimeError("Speech recognition models are not initialized")
    
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
        temp_path = temp_file.name
        audio_file.save(temp_path)

    try:
        # Load audio for analysis
        waveform, sample_rate = librosa.load(temp_path, sr=16000)

        # Get ASR result first
        result = asr_pipeline(temp_path)
        predicted_text = result["text"]

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
            "confidence": pronunciation_analysis["confidence"],
            "timing_scores": pronunciation_analysis["timing_scores"],
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