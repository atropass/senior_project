import React, { useState, useRef, useEffect } from "react";
import { ActionIcon, Text, Center, Box, Transition } from "@mantine/core";
import { Mic, StopCircle, RefreshCw } from "lucide-react";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { notifications } from "@mantine/notifications";

export interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: File) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
}) => {
  const [status, setStatus] = useState<
    "idle" | "recording" | "stopped" | "acquiring_media" | "recorder_error"
  >("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      setStatus("acquiring_media");

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize recorder with WAV format
      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1, // mono
        desiredSampRate: 16000, // 16kHz sample rate
        disableLogs: true,
      });

      recorderRef.current = recorder;
      recorder.startRecording();
      setStatus("recording");
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus("recorder_error");
      notifications.show({
        title: "Microphone Error",
        message:
          "Error accessing your microphone. Please check your permissions.",
        color: "red",
        autoClose: 5000,
      });
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current?.getBlob();
        if (blob) {
          // Create audio URL for preview
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          // Create file for submission
          const audioFile = new File([blob], "recording.wav", {
            type: "audio/wav",
          });

          onRecordingComplete(audioFile);

          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }

          setStatus("stopped");
        }
      });
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setStatus("idle");

    if (recorderRef.current) {
      recorderRef.current.reset();
      recorderRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (recorderRef.current) {
        recorderRef.current.reset();
      }
    };
  }, [audioUrl]);

  const isRecording = status === "recording";
  const hasRecording = audioUrl !== null && status === "stopped";

  return (
    <div className="flex flex-col items-center justify-between h-full">
      <Box className="text-center mb-6">
        <Text size="xl" fw={500} className="mb-2">
          Practice Pronunciation
        </Text>
        <Text size="sm" c="dimmed">
          {isRecording
            ? "Recording in progress..."
            : status === "acquiring_media"
            ? "Accessing microphone..."
            : hasRecording
            ? "Recording complete"
            : "Click the microphone to start"}
        </Text>
      </Box>

      <Center className="flex-grow flex-col">
        <Transition
          mounted={true}
          transition="pop"
          duration={300}
          timingFunction="ease"
        >
          {(styles) => (
            <div style={styles}>
              <ActionIcon
                size={100}
                radius={100}
                variant={isRecording ? "filled" : "light"}
                color={isRecording ? "red" : hasRecording ? "green" : "blue"}
                onClick={
                  isRecording
                    ? stopRecording
                    : hasRecording
                    ? clearRecording
                    : startRecording
                }
                disabled={status === "acquiring_media"}
                className="mb-4 shadow-md hover:shadow-lg transition-shadow"
              >
                {isRecording ? (
                  <StopCircle size={50} />
                ) : hasRecording ? (
                  <RefreshCw size={50} />
                ) : (
                  <Mic size={50} />
                )}
              </ActionIcon>
            </div>
          )}
        </Transition>

        <Text size="sm" c="dimmed" className="mt-2">
          {isRecording
            ? "Tap to stop recording"
            : status === "acquiring_media"
            ? "Please wait..."
            : hasRecording
            ? "Tap to record again"
            : "Tap to start recording"}
        </Text>
      </Center>

      {audioUrl && (
        <Box className="w-full mt-auto pt-4">
          <audio className="w-full" controls src={audioUrl} />
        </Box>
      )}
    </div>
  );
};

export default VoiceRecorder;
