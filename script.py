import torch
from transformers import pipeline, Wav2Vec2Processor, Wav2Vec2ForCTC
import soundfile as sf
import numpy as np


def load_audio(file_path, target_sample_rate=16000):
    """Load and preprocess audio file"""
    waveform, sample_rate = sf.read(file_path)
    if len(waveform.shape) > 1:
        waveform = waveform.mean(axis=1)

    if sample_rate != target_sample_rate:
        import librosa

        waveform = librosa.resample(
            waveform, orig_sr=sample_rate, target_sr=target_sample_rate
        )

    waveform = waveform / np.max(np.abs(waveform))
    return waveform, target_sample_rate


def get_extended_phoneme_map():
    """Create a comprehensive mapping for phonemes"""
    return {
        # Kazakh-specific phonemes
        "ә": "æ",  # Front open unrounded vowel
        "і": "ɪ",  # Near-close front unrounded vowel
        "ң": "ŋ",  # Velar nasal
        "ғ": "ɣ",  # Voiced velar fricative
        "ү": "y",  # Close front rounded vowel
        "ұ": "ʊ",  # Near-close back rounded vowel
        "қ": "q",  # Voiceless uvular stop
        "ө": "ø",  # Close-mid front rounded vowel
        "һ": "h",  # Voiceless glottal fricative
        # Russian Cyrillic phonemes
        "а": "ɑ",  # Open back unrounded vowel
        "б": "b",  # Voiced bilabial plosive
        "в": "v",  # Voiced labiodental fricative
        "г": "ɡ",  # Voiced velar plosive
        "д": "d",  # Voiced alveolar plosive
        "е": "jɛ",  # Yotated open-mid front unrounded vowel
        "ж": "ʒ",  # Voiced postalveolar fricative
        "з": "z",  # Voiced alveolar fricative
        "и": "i",  # Close front unrounded vowel
        "й": "j",  # Palatal approximant
        "к": "k",  # Voiceless velar plosive
        "л": "l",  # Alveolar lateral approximant
        "м": "m",  # Bilabial nasal
        "н": "n",  # Alveolar nasal
        "о": "ɔ",  # Open-mid back rounded vowel
        "п": "p",  # Voiceless bilabial plosive
        "р": "r",  # Alveolar trill
        "с": "s",  # Voiceless alveolar fricative
        "т": "t",  # Voiceless alveolar plosive
        "у": "u",  # Close back rounded vowel
        "ф": "f",  # Voiceless labiodental fricative
        "х": "x",  # Voiceless velar fricative
        "ц": "ts",  # Voiceless alveolar affricate
        "ч": "tʃ",  # Voiceless postalveolar affricate
        "ш": "ʃ",  # Voiceless postalveolar fricative
        "щ": "ʃtɕ",  # Voiceless postalveolar-palatal affricate
        "ъ": "",  # Hard sign (modifier)
        "ы": "ɨ",  # Close central unrounded vowel
        "ь": "",  # Soft sign (modifier)
        "э": "ɛ",  # Open-mid front unrounded vowel
        "ю": "ju",  # Yotated close back rounded vowel
        "я": "jɑ",  # Yotated open back unrounded vowel
    }


def analyze_phoneme_accuracy(reference_text, predicted_text):
    """Comprehensive phoneme-level analysis"""
    phoneme_map = get_extended_phoneme_map()
    analysis = {
        "total_phonemes": 0,
        "correct_phonemes": 0,
        "incorrect_phonemes": 0,
        "phoneme_details": [],
    }

    ref_text = reference_text.lower()
    pred_text = predicted_text.lower()

    for char in ref_text:
        if char in phoneme_map:
            analysis["total_phonemes"] += 1
            is_correct = char in pred_text

            phoneme_detail = {
                "phoneme": char,
                "ipa": phoneme_map[char],
                "correct": is_correct,
            }

            analysis["phoneme_details"].append(phoneme_detail)

            if is_correct:
                analysis["correct_phonemes"] += 1
            else:
                analysis["incorrect_phonemes"] += 1

    return analysis


def main():
    try:
        # Initialize both pipeline and direct model access
        print("Loading models...")
        model_name = "adilism/wav2vec2-large-xlsr-kazakh"

        # Pipeline approach
        asr_pipeline = pipeline("automatic-speech-recognition", model=model_name)

        # Direct model access
        processor = Wav2Vec2Processor.from_pretrained(model_name)
        model = Wav2Vec2ForCTC.from_pretrained(model_name)

        # Load audio and text
        print("Loading audio...")
        audio_path = "tenge.wav"
        waveform, sample_rate = load_audio(audio_path)

        with open("tenge.txt", "r", encoding="utf-8") as f:
            reference_text = f.read().strip()

        # Get transcription using pipeline
        print("Processing audio with pipeline...")
        pipeline_result = asr_pipeline(audio_path)
        pipeline_text = pipeline_result["text"]

        # Get transcription using direct model access
        print("Processing audio with direct model access...")
        inputs = processor(
            waveform, sampling_rate=sample_rate, return_tensors="pt", padding=True
        )

        with torch.no_grad():
            logits = model(inputs.input_values).logits
        predicted_ids = torch.argmax(logits, dim=-1)
        model_text = processor.batch_decode(predicted_ids)[0]

        # Analyze pronunciations
        comprehensive_analysis = analyze_phoneme_accuracy(reference_text, pipeline_text)

        print("\nComprehensive Phoneme Analysis:")
        print("-" * 50)
        print(f"Total Phonemes: {comprehensive_analysis['total_phonemes']}")
        print(
            f"Correctly Pronounced: {comprehensive_analysis['correct_phonemes']} ({comprehensive_analysis['correct_phonemes']/comprehensive_analysis['total_phonemes']*100:.2f}%)"
        )
        print(
            f"Incorrectly Pronounced: {comprehensive_analysis['incorrect_phonemes']} ({comprehensive_analysis['incorrect_phonemes']/comprehensive_analysis['total_phonemes']*100:.2f}%)"
        )

        print("\nDetailed Phoneme Breakdown:")
        for detail in comprehensive_analysis["phoneme_details"]:
            status = "✓" if detail["correct"] else "✗"
            print(f"{status} Phoneme '{detail['phoneme']}' (IPA: {detail['ipa']})")

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
