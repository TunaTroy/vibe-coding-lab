import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BossArena from "../components/boss/BossArena";
import BossCharacter from "../components/boss/BossCharacter";
import BossIntro from "../components/boss/BossIntro";
import BossResult from "../components/boss/BossResult";
import { canConfirmAnswer } from "../components/boss/BattleQuestion";
import { getErrorMessage } from "../services/api";
import { fetchBoss, fetchBossAttempt, startBossAttempt, submitBossAnswer } from "../services/bossService";
import "../components/boss/boss.css";

const storageKey = (bossId) => `boss-attempt:${bossId}`;
const readStoredAttempt = (bossId) => { try { return sessionStorage.getItem(storageKey(bossId)); } catch { return null; } };
const storeAttempt = (bossId, attemptId) => { try { sessionStorage.setItem(storageKey(bossId), attemptId); } catch { /* Resume still works through start endpoint. */ } };
const forgetAttempt = (bossId) => { try { sessionStorage.removeItem(storageKey(bossId)); } catch { /* Storage may be disabled. */ } };

export default function BossBattlePage() {
  const { bossId = "" } = useParams();
  const navigate = useNavigate();
  const [boss, setBoss] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [draft, setDraft] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [hp, setHp] = useState(100);
  const [pose, setPose] = useState("intro");
  const [effect, setEffect] = useState(null);
  const [combo, setCombo] = useState(0);
  const [result, setResult] = useState(null);
  const [misses, setMisses] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const schedule = useCallback((fn, delay) => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const id = setTimeout(fn, reduced ? 0 : delay);
    timers.current.push(id);
  }, []);

  useEffect(() => {
    let mounted = true;
    setPhase("loading");
    setError("");
    setBoss(null);
    setAttempt(null);
    setMisses([]);
    clearTimers();

    async function load() {
      try {
        const metadata = await fetchBoss(bossId);
        if (!mounted) return;
        setBoss(metadata);
        if (!metadata.unlocked) {
          setPhase("locked");
          return;
        }
        const savedId = readStoredAttempt(bossId);
        if (savedId) {
          try {
            const saved = await fetchBossAttempt(savedId);
            if (!mounted) return;
            if (saved.bossId === bossId) {
              setAttempt(saved);
              setHp(saved.bossHp);
              setPose(saved.status === "COMPLETED" ? saved.result?.passed ? "defeated" : "low_hp" : saved.bossHp <= 30 ? "low_hp" : "idle");
              setResult(saved.result);
              setPhase(saved.status === "COMPLETED" ? saved.result?.passed ? "victory" : "retry" : "active");
              return;
            }
          } catch (resumeError) {
            if (!mounted) return;
            if (resumeError?.status === 0) throw resumeError;
            forgetAttempt(bossId);
          }
        }
        setPhase("intro");
      } catch (loadError) {
        if (mounted) {
          setError(getErrorMessage(loadError));
          setPhase("error");
        }
      }
    }
    void load();
    return () => { mounted = false; clearTimers(); };
  }, [bossId, clearTimers]);

  const journeyPath = boss?.tenseId ? `/tenses/${boss.tenseId}/levels` : "/tenses";
  const leave = () => navigate(journeyPath);

  const begin = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const next = await startBossAttempt(bossId);
      storeAttempt(bossId, next.id);
      setAttempt(next);
      setResult(null);
      setMisses([]);
      setDraft(null);
      setFeedback(null);
      setFeedbackReady(false);
      setHp(next.bossHp);
      setPose(next.bossHp <= 30 ? "low_hp" : "idle");
      setEffect(null);
      setCombo(0);
      setPhase("active");
    } catch (startError) {
      setError(getErrorMessage(startError));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    const question = attempt?.currentQuestion;
    if (busy || !question || !canConfirmAnswer(question, draft)) return;
    setBusy(true);
    setError("");
    const submitted = draft;
    try {
      const graded = await submitBossAnswer(attempt.id, question.id, submitted);
      if (!graded.isCorrect && graded.explanation) {
        setMisses((current) => current.some((item) => item.position === graded.questionNumber)
          ? current : [...current, { position: graded.questionNumber, explanation: graded.explanation }]);
      }
      setFeedback(graded);
      setFeedbackReady(false);
      setHp(graded.bossHpBefore);
      setPhase("feedback");
      setCombo((previous) => graded.isCorrect ? previous + 1 : 0);
      schedule(() => {
        setEffect(graded.isCorrect ? "hit" : "attack");
        setPose(graded.isCorrect ? "hit" : "attack");
      }, 90);
      schedule(() => {
        if (graded.result?.passed) {
          setHp(graded.isCorrect ? Math.max(10, graded.bossHpBefore - 10) : graded.bossHpBefore);
        } else {
          setHp(graded.bossHpAfter);
        }
      }, 430);
      schedule(() => {
        setEffect(null);
        setPose(graded.bossHpAfter <= 30 ? "low_hp" : "idle");
        if (!graded.result) setFeedbackReady(true);
      }, 1050);

      if (graded.result) {
        setResult(graded.result);
        if (graded.result.passed) {
          schedule(() => {
            setPhase("finalBlow");
            setEffect("final");
            setPose("low_hp");
          }, 1120);
          schedule(() => { setHp(graded.result.bossHp); setPose("defeated"); }, 1620);
          schedule(() => { setEffect(null); setPhase("victory"); }, 2250);
        } else {
          schedule(() => setPhase("retry"), 1480);
        }
      }
    } catch (submitError) {
      let resynced = false;
      if (submitError?.status === 409) {
        try {
          const latest = await fetchBossAttempt(attempt.id);
          if (latest.status === "COMPLETED") {
            setResult(latest.result);
            setHp(latest.bossHp);
            setPhase(latest.result?.passed ? "victory" : "retry");
            resynced = true;
          } else if (latest.currentQuestion?.id !== question.id) {
            setAttempt(latest);
            setDraft(null);
            setHp(latest.bossHp);
            setPhase("active");
            resynced = true;
          }
        } catch { /* Keep the draft for retry if resync also fails. */ }
      }
      setError(resynced ? "" : getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  };

  const continueQuestion = () => {
    if (!feedback?.nextQuestion || !feedbackReady) return;
    clearTimers();
    setAttempt((current) => ({
      ...current,
      currentQuestion: feedback.nextQuestion,
      currentPosition: feedback.nextQuestion.position,
      correctCount: feedback.correctCount,
      bossHp: feedback.bossHpAfter,
    }));
    setDraft(null);
    setFeedback(null);
    setFeedbackReady(false);
    setError("");
    setEffect(null);
    setPose(feedback.bossHpAfter <= 30 ? "low_hp" : "idle");
    setPhase("active");
  };

  const replay = async () => {
    clearTimers();
    setBusy(true);
    setError("");
    try {
      const next = await startBossAttempt(bossId);
      storeAttempt(bossId, next.id);
      setAttempt(next);
      setResult(null);
      setMisses([]);
      setDraft(null);
      setFeedback(null);
      setFeedbackReady(false);
      setHp(next.bossHp);
      setPose("idle");
      setEffect(null);
      setCombo(0);
      setPhase("active");
    } catch (retryError) {
      setError(getErrorMessage(retryError));
    } finally {
      setBusy(false);
    }
  };

  const journey = () => { if (result) forgetAttempt(bossId); leave(); };
  const active = ["active", "feedback", "finalBlow"].includes(phase);

  return (
    <div className={`battle-root battle-root--${phase}`}>
      <header className="battle-header">
        <button type="button" className="battle-header__back" onClick={leave} aria-label={active ? "Tạm dừng và trở lại hành trình" : "Trở lại hành trình"}>
          <span aria-hidden>←</span><span>{active ? "TẠM DỪNG" : "HÀNH TRÌNH"}</span>
        </button>
        <div className="battle-header__title"><span className="battle-header__emblem" aria-hidden>◆</span><span>BOSS BATTLE</span><small>{boss ? `LEVEL ${boss.sourceStart}–${boss.sourceEnd}` : "HỌC VIỆN TIẾNG ANH"}</small></div>
        <div className="battle-header__progress">{active && attempt?.currentQuestion ? <>CÂU <strong>{attempt.currentQuestion.position}</strong> / {attempt.totalQuestions}</> : <span>TRẬN KIỂM TRA</span>}</div>
      </header>

      {phase === "loading" && <main className="battle-state"><div className="battle-state__art"><BossCharacter pose="intro" /></div><p className="battle-state__eyebrow">ĐANG MỞ CỔNG SÂN ĐẤU</p><h1>Chuẩn bị trận Boss...</h1><p>Đang kiểm tra và nối lại lượt chơi của bạn.</p></main>}

      {(phase === "error" || phase === "locked") && <main className="battle-state"><div className="battle-state__art"><BossCharacter pose="intro" /></div><p className="battle-state__eyebrow">NGƯỜI GÁC NGỮ PHÁP</p><h1>{phase === "locked" ? "Boss chưa mở khóa" : "Chưa vào sân được"}</h1><p role={phase === "error" ? "alert" : undefined}>{phase === "locked" ? `Hãy hoàn thành Level ${boss?.sourceStart}–${boss?.sourceEnd} trước nhé.` : error}</p><div className="battle-state__actions"><button className="battle-action" type="button" onClick={() => window.location.reload()}>THỬ LẠI <span aria-hidden>↻</span></button><button className="battle-text-action" type="button" onClick={leave}>Quay lại hành trình</button></div></main>}

      {phase === "intro" && boss && <BossIntro boss={boss} onStart={begin} onLeave={leave} busy={busy} error={error} />}

      {active && boss && attempt?.currentQuestion && <BossArena boss={boss} attempt={attempt} question={attempt.currentQuestion} selected={draft} onSelect={setDraft} onConfirm={confirm} feedback={feedback} feedbackReady={feedbackReady} onContinue={continueQuestion} submitting={busy || phase === "finalBlow"} error={error} hp={hp} pose={pose} effect={effect} combo={combo} />}

      {(phase === "victory" || phase === "retry") && boss && result && <BossResult boss={boss} result={result} reviewNotes={misses} onJourney={journey} onReplay={replay} busy={busy} error={error} />}
    </div>
  );
}
