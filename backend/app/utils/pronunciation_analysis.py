import numpy as np
from scipy.signal import hilbert, find_peaks
import Levenshtein


class PronunciationAnalyzer:
    def __init__(self):
        self.similar_phonemes = {
            "қ": ["к", "х"],  # Similar sounds to қ
            "ғ": ["г"],  # Similar sounds to ғ
            "ң": ["н", "м"],  # Similar sounds to ң
            "ә": ["а", "е"],  # Similar sounds to ә
            "ө": ["о", "ұ"],  # Similar sounds to ө
            "ү": ["у", "ұ"],  # Similar sounds to ү
            "һ": ["х"],  # Similar sounds to һ
            "і": ["ы", "и"],  # Similar sounds to і
            "ы": ["і", "и"],  # Similar sounds to ы
            "и": ["і", "ы"],  # Similar sounds to и
        }

    def _get_default_analysis(self):
        """Provide default values when analysis fails"""
        return {
            "pronunciation_score": 0.0,
            "confidence": 0.0,
            "phoneme_analysis": {
                "total_phonemes": 0,
                "correct_phonemes": 0,
                "accuracy": 0.0,
                "phoneme_details": [],
            },
            "timing_scores": {
                "timing_score": 0.0,
                "mean_duration": 0.0,
                "std_duration": 0.0,
            },
            "rhythm_metrics": {"speech_rate": 0.0, "rhythm_regularity": 1.0},
            "detailed_feedback": ["Unable to analyze pronunciation. Please try again."],
        }

    def _calculate_phoneme_similarity(self, reference_phoneme, predicted_phoneme):
        """Calculate similarity between two phonemes"""
        if reference_phoneme == predicted_phoneme:
            return 1.0
        elif (
            reference_phoneme in self.similar_phonemes
            and predicted_phoneme in self.similar_phonemes[reference_phoneme]
        ):
            return 0.5
        return 0.0

    def analyze_pronunciation(
        self, waveform, sample_rate, reference_text, predicted_text
    ):
        """Enhanced pronunciation analysis"""
        try:

            # Calculate detailed phoneme analysis
            phoneme_analysis = self._analyze_phonemes(reference_text, predicted_text)

            # Get rhythm and timing metrics
            rhythm_metrics = self.calculate_rhythm_metrics(waveform, sample_rate)

            # Calculate overall score with new weighting
            overall_score = self._calculate_overall_score(
                phoneme_analysis["accuracy"],
                rhythm_metrics["rhythm_regularity"],
            )

            return {
                "pronunciation_score": overall_score,
                "phoneme_analysis": phoneme_analysis,
                "rhythm_metrics": rhythm_metrics,
                "detailed_feedback": self._generate_feedback(
                    overall_score, phoneme_analysis, rhythm_metrics
                ),
            }
        except Exception as e:
            print(f"Error in analyze_pronunciation: {str(e)}")
            return self._get_default_analysis()

    def calculate_rhythm_metrics(self, waveform, sample_rate):
        """Calculate rhythm-related metrics"""
        try:
            analytic_signal = hilbert(waveform)
            envelope = np.abs(analytic_signal)
            peaks, _ = find_peaks(envelope, distance=int(sample_rate * 0.1))

            speech_rate = len(peaks) / (len(waveform) / sample_rate)

            if len(peaks) > 1:
                peak_intervals = np.diff(peaks)
                rhythm_regularity = np.std(peak_intervals) / np.mean(peak_intervals)
            else:
                rhythm_regularity = 0.5

            return {"speech_rate": speech_rate, "rhythm_regularity": rhythm_regularity}
        except Exception as e:
            print(f"Error in calculate_rhythm_metrics: {str(e)}")
            return {"speech_rate": 0.0, "rhythm_regularity": 1.0}

    def _analyze_phonemes(self, reference_text, predicted_text):
        """Enhanced phoneme analysis"""
        analysis = {
            "total_phonemes": len(reference_text),
            "correct_phonemes": 0,
            "phoneme_details": [],
        }

        # Normalize texts
        ref_text = reference_text.lower()
        pred_text = predicted_text.lower()

        # Calculate Levenshtein matrix for alignment
        matrix = Levenshtein.editops(ref_text, pred_text)

        # Analyze each phoneme
        i = 0  # reference text index
        j = 0  # predicted text index

        if not matrix:  # Texts are identical
            for phoneme in ref_text:
                analysis["correct_phonemes"] += 1
                analysis["phoneme_details"].append(
                    {
                        "phoneme": phoneme,
                        "correct": True,
                        "similarity": 1.0,
                        "similar_to": [],
                    }
                )
            analysis["accuracy"] = 100.0
            return analysis
        
        # print(matrix)
        source_modified = set()
        dest_modified = set()

        analysis['correct_phonemes'] = len(ref_text) - len(matrix)
        for op, i, j in matrix:
            if op == "replace":
                source_modified.add(i)
                dest_modified.add(j)
                # Substitution
                ref_phoneme = ref_text[i]
                pred_phoneme = pred_text[j]
                similarity = self._calculate_phoneme_similarity(
                    ref_phoneme, pred_phoneme
                )
                similar_sounds = self.similar_phonemes.get(ref_phoneme, [])
                analysis["phoneme_details"].append(
                    {
                        'error': 'mispronounciation',
                        "phoneme": ref_phoneme,
                        "correct": False,
                        "similarity": similarity,
                        "predicted_as": pred_phoneme,
                        "similar_to": similar_sounds,
                    }
                )
                # i += 1
                # j += 1
            elif op == "delete":
                source_modified.add(i)
                # Deletion
                ref_phoneme = ref_text[i]
                analysis["phoneme_details"].append(
                    {
                        "error": "omitted",
                        "phoneme": ref_phoneme,
                        "correct": False,
                        "similarity": 0.0,
                    }
                )
                # i += 1
            elif op == "insert":
                dest_modified.add(j)
                # Insertion
                pred_phoneme = pred_text[j]
                analysis["phoneme_details"].append(
                    {
                        'error': 'extra sound',
                        "phoneme": "∅",
                        "correct": False,
                        "similarity": 0.0,
                        "extra": pred_phoneme,
                    }
                )
                # j += 1

        equal_phonemes = [i for i in range(len(ref_text)) if i not in source_modified]
        for i in equal_phonemes:
            # Exact match
                phoneme = ref_text[i]
                analysis["phoneme_details"].append(
                    {
                        "phoneme": phoneme,
                        "correct": True,
                        "similarity": 1.0,
                        "similar_to": [],
                    }
                )

        # Need to preserve letter order
        analysis['phoneme_details'] = sorted(analysis['phoneme_details'], key=lambda x: ref_text.index(x['phoneme']))

        # Calculate overall accuracy
        analysis["accuracy"] = (
            analysis["correct_phonemes"] / analysis["total_phonemes"]
        ) * 100

        return analysis

    def _calculate_overall_score(
        self, phoneme_accuracy, rhythm_regularity
    ):
        """Calculate overall pronunciation score with new weighting"""
        weights = {
            "phoneme_accuracy": 0.5,
            "rhythm": 0.5,
        }

        # Convert rhythm_regularity to a score (lower regularity is better)
        rhythm_score = max(0, min(100, (1 - rhythm_regularity) * 100))

        # Calculate weighted score
        overall_score = (
            weights["phoneme_accuracy"] * phoneme_accuracy
            + weights["rhythm"] * rhythm_score
        )

        return max(0, min(100, overall_score))

    def _generate_feedback(
        self, score, phoneme_analysis, rhythm_metrics
    ):
        """Generate detailed feedback"""
        feedback = []

        # Overall assessment
        if score >= 90:
            feedback.append("Excellent pronunciation! Native-like quality.")
        elif score >= 80:
            feedback.append("Very good pronunciation. Minor improvements possible.")
        elif score >= 70:
            feedback.append("Good pronunciation. Some areas need work.")
        else:
            feedback.append(
                "Pronunciation needs improvement. Focus on the following aspects:"
            )

        # Phoneme-specific feedback
        incorrect_phonemes = [
            p for p in phoneme_analysis["phoneme_details"] if not p["correct"]
        ]
        if incorrect_phonemes:
            feedback.append("\nPhoneme Issues:")
            for p in incorrect_phonemes:
                if "predicted_as" in p:
                    feedback.append(
                        f"- '{p['phoneme']}' was pronounced as '{p['predicted_as']}'"
                    )
                    if p["similar_to"]:
                        feedback.append(
                            f"  (Similar acceptable sounds: {', '.join(p['similar_to'])})"
                        )
                elif "error" in p:
                    feedback.append(f"- '{p['phoneme']}' was omitted")
                elif "extra" in p:
                    feedback.append(f"- Extra sound '{p['extra']}' was added")

        # Rhythm feedback
        if rhythm_metrics["speech_rate"] > 4.0:
            feedback.append("\nPace:")
            feedback.append("- Try speaking more slowly and deliberately")
        elif rhythm_metrics["speech_rate"] < 2.0:
            feedback.append("- Try to maintain a more natural speaking pace")

        return feedback


def setup_analyzer():
    return PronunciationAnalyzer()
