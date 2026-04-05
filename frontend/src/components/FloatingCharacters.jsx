import { useState, useEffect } from 'react';

const LEFT_MESSAGES = [
  { jp: '今日の単語', detail: '嬉しい', en: '(うれしい) — happy / glad' },
  { jp: '〜ば形を\n練習しよう！', en: 'Practice the ば form!' },
  { jp: '条件形は\n４つある', en: 'There are 4 conditional forms' },
  { jp: '毎日少しずつ', en: 'A little every day' },
  { jp: '今日の単語', detail: '難しい', en: '(むずかしい) — difficult' },
  { jp: '復習は\n大切だよ！', en: 'Reviewing is important!' },
  { jp: '今日の単語', detail: '楽しい', en: '(たのしい) — fun / enjoyable' },
  { jp: '〜たら形も\n忘れずに！', en: "Don't forget the たら form!" },
];

const RIGHT_MESSAGES = [
  { jp: '頑張って！', en: 'Do your best!' },
  { jp: 'すごい\n進歩だ！', en: 'Amazing progress!' },
  { jp: '継続は\n力なり', en: 'Persistence is power' },
  { jp: 'もう少しで\nN4！', en: "You're almost at N4!" },
  { jp: '上手に\nなってきた！', en: "You're getting really good!" },
  { jp: 'えらい！', en: 'Well done!' },
  { jp: '日本語、\n楽しい？', en: 'Is Japanese fun?' },
  { jp: 'あきらめ\nないで！', en: "Don't give up!" },
];

function SpeechBubble({ messages, offset = 0 }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % messages.length);
        setVisible(true);
      }, 350);
    }, 5000 + offset);
    return () => clearInterval(id);
  }, [messages.length, offset]);

  const msg = messages[idx];

  return (
    <div className="relative">
      <div
        className={`bg-white border border-slate-200 rounded-2xl px-3 py-2.5 shadow-lg text-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: '120px' }}
      >
        <p className="text-xs font-jp font-semibold text-slate-600 whitespace-pre-line leading-snug">
          {msg.jp}
        </p>
        {msg.detail && (
          <p className="text-base font-jp font-bold text-indigo-600 mt-0.5 leading-tight">
            {msg.detail}
          </p>
        )}
        <p className="text-[10px] text-slate-400 mt-1 leading-tight">{msg.en}</p>
      </div>

      {/* Bubble tail — downward pointing */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '-11px', width: 0, height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: '11px solid #e2e8f0',
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: '-9px', width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '10px solid white',
        }}
      />
    </div>
  );
}

export default function FloatingCharacters() {
  return (
    <>
      {/* Left character — cat sensei */}
      <div
        className="hidden xl:flex fixed flex-col items-center gap-4 z-0 select-none pointer-events-none"
        style={{ left: 'calc(50% - 576px)', top: '50%', transform: 'translateY(-50%)', animation: 'floatChar 4s ease-in-out infinite' }}
      >
        <SpeechBubble messages={LEFT_MESSAGES} offset={0} />
        <span style={{ fontSize: '3rem', lineHeight: 1, animation: 'floatChar 4s ease-in-out infinite 0.3s' }}>
          🐱
        </span>
      </div>

      {/* Right character — kitsune */}
      <div
        className="hidden xl:flex fixed flex-col items-center gap-4 z-0 select-none pointer-events-none"
        style={{ right: 'calc(50% - 576px)', top: '50%', transform: 'translateY(-50%)', animation: 'floatChar 4s ease-in-out infinite 1.2s' }}
      >
        <SpeechBubble messages={RIGHT_MESSAGES} offset={2500} />
        <span style={{ fontSize: '3rem', lineHeight: 1, transform: 'scaleX(-1)', display: 'inline-block', animation: 'floatChar 4s ease-in-out infinite 1.5s' }}>
          🦊
        </span>
      </div>
    </>
  );
}
