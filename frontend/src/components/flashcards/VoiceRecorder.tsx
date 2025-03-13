import React, { useEffect } from "react";
import { ActionIcon, Text, Center, Box, Transition } from "@mantine/core";
import { Mic, StopCircle, RefreshCw } from "lucide-react";
import { useReactMediaRecorder } from "react-media-recorder";
import { notifications } from "@mantine/notifications";

export interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: File) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
}) => {
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      mediaRecorderOptions: {
        mimeType: "audio/webm",
      },
      onStop: (blobUrl, blob) => {
        const audioFile = new File([blob], "recording.webm", {
          type: "audio/webm",
        });

        onRecordingComplete(audioFile);
      },
    });

  useEffect(() => {
    if (status === "recorder_error") {
      notifications.show({
        title: "Microphone Error",
        message:
          "Error accessing your microphone. Please check your permissions.",
        color: "red",
        autoClose: 5000,
      });
    }
  }, [status]);

  const isRecording = status === "recording";
  const hasRecording = mediaBlobUrl !== null && status === "stopped";

  const handleReset = () => {
    clearBlobUrl();
  };

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
                    ? handleReset
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

      {mediaBlobUrl && (
        <Box className="w-full mt-auto pt-4">
          <audio className="w-full" controls src={mediaBlobUrl} />
        </Box>
      )}
    </div>
  );
};

export default VoiceRecorder;
