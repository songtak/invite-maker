import React, { useState, useEffect } from "react";

type LottoResult = {
  numbers: number[];
  bonus: number;
  createdAt: string;
};

const generateLottoNumbers = (): LottoResult => {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const picked: number[] = [];

  while (picked.length < 7) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }

  const bonus = picked.pop() as number; // 마지막 하나를 보너스로
  const numbers = picked.sort((a, b) => a - b);

  return {
    numbers,
    bonus,
    createdAt: new Date().toISOString(),
  };
};

const LottoPage: React.FC = () => {
  const [result, setResult] = useState<LottoResult | null>(null);
  const [history, setHistory] = useState<LottoResult[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("lotto_history");
    if (raw) setHistory(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("lotto_history", JSON.stringify(history));
  }, [history]);

  const handleGenerate = (count = 1) => {
    if (count === 1) {
      const r = generateLottoNumbers();
      setResult(r);
      setHistory((prev) => [r, ...prev].slice(0, 20));
    } else {
      const generated = Array.from({ length: count }, () =>
        generateLottoNumbers()
      );
      setHistory((prev) => [...generated, ...prev].slice(0, 50));
      setResult(generated[0]);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `${result.numbers.join(", ")} + bonus ${result.bonus}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("복사되었습니다: " + text);
    } catch (e) {
      alert("복사에 실패했습니다.");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const text = `Lotto: ${result.numbers.join(", ")} + bonus ${
      result.bonus
    }\n생성일: ${result.createdAt}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lotto-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (!confirm("정말 기록을 삭제하시겠어요?")) return;
    setHistory([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>로또 번호 생성기</h2>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => handleGenerate(1)} style={{ marginRight: 8 }}>
          1세트 생성
        </button>
        <button onClick={() => handleGenerate(5)} style={{ marginRight: 8 }}>
          5세트 생성
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>마지막 결과:</strong>
        {result ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {result.numbers.map((n) => (
                <div
                  key={n}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    background: "#ffdd57",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {n}
                </div>
              ))}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: "#d0d0d0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                +{result.bonus}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button onClick={handleCopy} style={{ marginRight: 8 }}>
                복사
              </button>
              <button onClick={handleDownload} style={{ marginRight: 8 }}>
                다운로드 (.txt)
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>아직 생성된 번호가 없습니다.</div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>생성 기록 (최대 50개)</strong>
          <button onClick={handleClearHistory} style={{ fontSize: 12 }}>
            기록 삭제
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {history.length === 0 && <div>기록이 없습니다.</div>}
          {history.map((h, idx) => (
            <div
              key={h.createdAt + idx}
              style={{
                marginBottom: 8,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                {h.numbers.map((n) => (
                  <span
                    key={n}
                    style={{
                      padding: "6px 8px",
                      background: "#eee",
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    {n}
                  </span>
                ))}
                <span
                  style={{
                    padding: "6px 8px",
                    background: "#ddd",
                    borderRadius: 6,
                    fontWeight: 700,
                  }}
                >
                  +{h.bonus}
                </span>
              </div>
              <div style={{ color: "#888", fontSize: 12 }}>
                {new Date(h.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LottoPage;
