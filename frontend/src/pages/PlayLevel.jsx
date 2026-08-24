import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/reusable/Button';
import Card from '../components/reusable/Card';
import QuestionRenderer from '../components/quiz/QuestionRenderer';
import ResultModal from '../components/reusable/ResultModal';
import { fetchLevelQuestions, submitLevel } from '../services/levelService';

function getErrorMessage(error) {
  if (error?.status === 400) {
    return error.data?.message || 'Validation failed.';
  }

  if (error?.status === 401) {
    return 'Your session expired. Please log in again.';
  }

  if (error?.status === 403) {
    return error.data?.message || 'You do not have permission to access this level.';
  }

  if (error?.status === 404) {
    return 'Level not found.';
  }

  if (error?.status === 500) {
    return error.message || 'Server error. Please try again later.';
  }

  return error?.message || 'There was a problem with your request.';
}

export default function PlayLevel({ user, onLogout }) {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetchLevelQuestions(levelId);
      setLevel(response.level);
      setQuestions(response.questions || []);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);

      if (err?.status === 401) {
        onLogout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [levelId]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      setError('');
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const response = await submitLevel(levelId, answersArray);
      setResult(response);
      setShowResult(true);
    } catch (err) {
      setError(getErrorMessage(err));
      if (err?.status === 401) {
        onLogout();
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResult(null);
    setAnswers({});
    loadQuestions();
  };

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/todos');
  };

  const handleBackToHome = () => {
    setShowResult(false);
    setResult(null);
    setAnswers({});
    navigate('/todos');
  };

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              English Quiz
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {level ? `Level ${level.order}` : 'Loading...'}
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBack}>
              Quay lại
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              Loading questions...
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="p-5">
                  <div className="mb-2 text-sm font-medium text-slate-500">
                    Question {index + 1} of {questions.length}
                  </div>
                  <QuestionRenderer
                    question={question}
                    onAnswer={(answer) => handleAnswer(question.id, answer)}
                    selectedAnswer={answers[question.id]}
                  />
                </Card>
              ))}

              {questions.length > 0 && (
                <Card className="p-5">
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                    className="w-full"
                  >
                    {submitting ? 'Submitting...' : 'Nộp bài'}
                  </Button>
                  {!allAnswered && (
                    <p className="mt-2 text-center text-sm text-slate-500">
                      Please answer all questions before submitting.
                    </p>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>

        <ResultModal isOpen={showResult} onClose={handleCloseResult} onBackToHome={handleBackToHome} result={result} />
      </div>
    </div>
  );
}
