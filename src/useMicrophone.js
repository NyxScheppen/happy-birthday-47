import { useCallback, useEffect, useRef, useState } from 'react';

function detectBlow(session, analyser, onVolume, onBlow) {
  const samples = new Float32Array(analyser.fftSize);
  const started = performance.now();
  let ambient = 0;
  let aboveSince = null;

  function sample(time) {
    analyser.getFloatTimeDomainData(samples);
    let energy = 0;
    for (const value of samples) energy += value * value;
    const volume = Math.sqrt(energy / samples.length);

    if (time - started < 420) {
      ambient = ambient * .9 + volume * .1;
    } else {
      const threshold = Math.max(.036, ambient * 2.6, ambient + .026);
      onVolume(Math.min(1, volume / (.16 + ambient)));
      if (volume > threshold) {
        aboveSince ??= time;
        if (time - aboveSince >= 180) {
          onBlow();
          return;
        }
      } else {
        aboveSince = null;
        ambient = ambient * .994 + volume * .006;
      }
    }
    session.frame = window.requestAnimationFrame(sample);
  }

  session.frame = window.requestAnimationFrame(sample);
}

export function useMicrophone(stageRef, onBlow) {
  const sessionRef = useRef(null);
  const [microphoneState, setMicrophoneState] = useState('idle');

  const release = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    sessionRef.current = null;
    window.cancelAnimationFrame(session.frame);
    session.stream?.getTracks().forEach((track) => track.stop());
    if (session.context.state !== 'closed') session.context.close().catch(() => {});
    stageRef.current?.style.removeProperty('--breath');
  }, [stageRef]);

  function stopMicrophone(nextState = 'idle') {
    release();
    setMicrophoneState(nextState);
  }

  async function toggleMicrophone() {
    if (sessionRef.current) {
      stopMicrophone('closed');
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext || !navigator.mediaDevices?.getUserMedia) {
      setMicrophoneState('unavailable');
      return;
    }

    let session;
    try {
      session = { context: new AudioContext() };
      sessionRef.current = session;
      const ready = session.context.resume();
      // Permission may remain pending after the user cancels. Release any late stream below.
      ready.catch(() => {});
      setMicrophoneState('asking');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (sessionRef.current !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      session.stream = stream;
      await ready;
      if (sessionRef.current !== session) return;
      const [track] = stream.getAudioTracks();
      track.addEventListener('ended', () => {
        if (sessionRef.current === session) stopMicrophone('disconnected');
      });
      const source = session.context.createMediaStreamSource(stream);
      const analyser = session.context.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      setMicrophoneState('listening');
      detectBlow(session, analyser, (volume) => {
        stageRef.current?.style.setProperty('--breath', volume);
      }, onBlow);
    } catch {
      if (!session || sessionRef.current === session) stopMicrophone('denied');
    }
  }

  useEffect(() => {
    function handlePageHide() {
      if (!sessionRef.current) return;
      release();
      setMicrophoneState('closed');
    }

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      release();
    };
  }, [release]);

  return { microphoneState, toggleMicrophone, stopMicrophone };
}
