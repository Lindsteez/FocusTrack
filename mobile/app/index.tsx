import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatTimer(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${pad2(hours)}.${pad2(minutes)}.${pad2(secs)}`;
}

export default function Index() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  function start() {
    setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
  }

  function stop() {
    setIsRunning(false);
    setSeconds(0);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTimer(seconds)}</Text>

      <Text style={styles.status}>
        {isRunning ? "Timer is running" : "Timer is paused"}
      </Text>

      <View style={styles.buttonGroup}>
        <Pressable style={styles.button} onPress={start}>
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={pause}>
          <Text style={styles.buttonText}>Pause</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={stop}>
          <Text style={styles.buttonText}>Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  time: {
    fontSize: 42,
    fontWeight: "700",
    color: "#fff",
  },
  status: {
    marginTop: 20,
    marginBottom: 20,
    color: "#fff",
    fontSize: 16,
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  button: {
    backgroundColor: "#222",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});