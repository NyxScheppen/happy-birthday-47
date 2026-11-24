import { useEffect, useRef, useState } from 'react';
import Sunburst from './Sunburst.jsx';
import { createCelebration } from './celebration.js';
import { useMicrophone } from './useMicrophone.js';

const microphoneMessages = {
  idle: '许个愿吧，准备好后吹灭蜡烛。',
  asking: '请在浏览器中允许使用麦克风。',
  listening: '麦克风已开启，对着它吹一下。',
  closed: '麦克风已关闭。你可以重新开启，或点击吹灭。',
  unavailable: '当前浏览器无法开启麦克风，可以点击吹灭。',
  denied: '麦克风未能开启，可以点击吹灭。',
  disconnected: '麦克风已断开，可以点击吹灭。',
};

export default function App() {
  const [state, setState] = useState('ready');
  const stageRef = useRef(null);
  const cakeRef = useRef(null);
  const primaryRef = useRef(null);
  const blowRef = useRef(null);
  const partyLayerRef = useRef(null);
  const celebrationRef = useRef(null);
  const { microphoneState, toggleMicrophone, stopMicrophone } = useMicrophone(stageRef, blowOut);
  const lit = state === 'lit';
  const done = state === 'done';

  useEffect(() => {
    const celebration = createCelebration(partyLayerRef.current);
    celebrationRef.current = celebration;
    return () => celebration.dispose();
  }, []);

  function blowOut() {
    if (document.activeElement === blowRef.current) primaryRef.current.focus();
    stopMicrophone();
    setState('done');
    celebrationRef.current?.celebrate(cakeRef.current);
  }

  function lightCandles() {
    celebrationRef.current?.clear();
    setState('lit');
  }

  let status = '点亮蛋糕上的蜡烛，许个愿再吹灭。';
  let primaryLabel = '点亮蜡烛';
  if (lit) {
    status = microphoneMessages[microphoneState];
    primaryLabel = {
      asking: '取消开启',
      listening: '关闭麦克风',
    }[microphoneState] ?? '用麦克风吹';
  } else if (done) {
    status = '蜡烛吹灭了，愿你的愿望成真。';
    primaryLabel = '再点一次';
  }

  return (
    <>
      <main className="page">
        <section
          ref={stageRef}
          className={microphoneState === 'listening' ? 'stage is-listening' : 'stage'}
          data-state={state}
          aria-labelledby="birthday-title"
        >
          <div className="copy">
            <p className="birthday-label"><span lang="en">DAD / 47</span></p>
            <h1 id="birthday-title"><span>爸，</span><span id="greeting">{done ? '生日快乐！' : '许个愿吧。'}</span></h1>
          </div>

          <div className="scene">
            <Sunburst />
            <button
              ref={cakeRef}
              className="cake"
              type="button"
              aria-label={lit ? '吹灭生日蜡烛' : '点亮蛋糕上的 47 岁蜡烛'}
              onClick={lit ? blowOut : lightCandles}
            >
              <span className="plinth" aria-hidden="true" />
              <span className="tier tier-lower" aria-hidden="true" />
              <span className="tier tier-upper" aria-hidden="true" />
              <span className="candle-pair" aria-hidden="true">
                {['4', '7'].map((digit) => (
                  <span className="candle" key={digit}>
                    <span className="digit">{digit}</span>
                    <span className="wick"><span className="flame" /></span>
                  </span>
                ))}
              </span>
            </button>
          </div>

          <div className="controls">
            <p className="status" id="wish-status" role="status">{status}</p>
            <div className="actions">
              <button
                ref={primaryRef}
                className="action action-primary"
                id="main-action"
                type="button"
                onClick={lit ? toggleMicrophone : lightCandles}
              >
                <span id="main-label">{primaryLabel}</span><span className="action-icon" aria-hidden="true">✦</span>
              </button>
              <button
                ref={blowRef}
                className="action"
                id="blow-action"
                type="button"
                hidden={!lit}
                onClick={blowOut}
              >
                点击吹灭
              </button>
            </div>
          </div>
        </section>
      </main>
      <div ref={partyLayerRef} className="burst" aria-hidden="true" />
    </>
  );
}
