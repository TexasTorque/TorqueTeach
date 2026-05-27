import { useEffect, useState } from "react";
import { saveQuizAttempt } from "../lib/quizAttempts";


function parseQuiz(content: string) {
  const lines = content.split("\n").map((l) => l.trim());

  const questions: any[] = [];
  let current: any = null;

  for (const line of lines) {
    if (!line) continue;

    // Multiple choice
    if (line.startsWith("MC ")) {
      if (current) questions.push(current);

      current = {
        type: "multiple",
        question: line.replace("MC ", ""),
        image: null,
        options: [],
        answer: ""
      };
    }

    // Short answer
    else if (line.startsWith("S ")) {
      if (current) questions.push(current);

      current = {
        type: "short",
        question: line.replace("S ", ""),
        image: null,
        options: [],
        answer: ""
      };
    }

    // Supplementary image
    else if (line.startsWith("IMG ")) {
      if (!current) {
        throw new Error(`IMG found before question`);
      }
      const raw = line.replace("IMG ", "");
      const parts = raw.split("|");

      current.image = {
        src: parts[0].trim(),
        caption: parts[1]?.trim() || ""
      };
    }

    // Image option
    else if (line.startsWith("OPTIONIMG ")) {
      if (!current) {
        throw new Error(`OPTIONIMG found before question`);
      }
      const raw = line.replace("OPTIONIMG ", "");
      const parts = raw.split("|");

      current.options.push({
        type: "image",
        value: parts[0].trim(),
        caption: parts[1]?.trim() || ""
      });
    }

    // Text option
    else if (line.startsWith("- ")) {
      if (!current) {
        throw new Error(`Option found before question`);
      }
      current.options.push({
        type: "text",
        value: line.replace("- ", "")
      });
    }

    // Answer
    else if (line.startsWith("A ")) {
      if (!current) {
        throw new Error(`Answer found before question`);
      }
      current.answer = line.replace("A ", "");
    }
  }

  if (current) questions.push(current);

  return questions;
}

/* -----------------------------
   COMPONENT
------------------------------*/

export default function Quiz({
  quizId,
  content
}: {
  quizId: string;
  content: string;
}) {
  if (!content) {
    return <p style={{ color: "red" }}>Quiz content missing</p>;
  }

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const parsed = parseQuiz(content);
    setQuestions(parsed);
  }, [content]);

  function setAnswer(i: number, value: string) {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [i]: value
    }));
  }

  async function submit() {
    if (!questions.length) return;

    let correct = 0;

    questions.forEach((q, i) => {
      const user = (answers[i] || "").trim().toLowerCase();

      const correctAnswer = (q.answer || "")
        .trim()
        .toLowerCase();

      if (user === correctAnswer) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);


    try {
      await saveQuizAttempt({
        quizId: quizId,
        score: correct,
        total: questions.length
      });

    } catch(err){

      console.error(err);

    }
  }

  function resetQuiz() {
    setAnswers({});
    setScore(null);
    setSubmitted(false);
  }

  if (!questions.length) {
    return <p>Loading quiz...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}
    >
      {questions.map((q, i) => {
        const userAnswer = answers[i];

        const isCorrect =
          submitted &&
          (userAnswer || "").trim().toLowerCase() ===
            (q.answer || "").trim().toLowerCase();

        return (
          <div
            key={i}
            className="question-box"
            style={{
              padding: "1rem",
              border: "1px solid var(--sl-color-gray-5)",
              borderRadius: "10px",
              transition: "0.2s ease"
            }}
          >
            <p style={{ fontWeight: 600 }}>
              {q.question}

              {submitted && (
                <span
                  className={`result-icon ${
                    isCorrect ? "correct" : "wrong"
                  }`}
                  style={{
                    color: isCorrect
                      ? "#22c55e"
                      : "#ef4444",

                    fontWeight: "bold",
                    marginLeft: "8px"
                  }}
                >
                  {isCorrect ? "✓" : "X"}
                </span>
              )}
            </p>

            {/* Supplementary image */}

            {q.image && (
              <div
                style={{
                  textAlign: "center"
                }}
              >
                <img
                  src={q.image.src}
                  style={{
                    display: "block",
                    width: "90%",
                    maxWidth: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",

                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: "10px",
                    marginBottom: "6px",

                    borderRadius: "10px",
                    border:
                      "0px solid var(--sl-color-gray-5)"
                  }}
                />

                {q.image.caption && (
                  <div
                    style={{
                      fontSize: ".9rem",
                      opacity: .8
                    }}
                  >
                    {q.image.caption}
                  </div>
                )}
              </div>
            )}

            {/* MCQ */}

            {q.type === "multiple" ? (
              q.options.map((opt: any) => {
                const value = opt.value;

                const selected =
                  answers[i] === value;

                const correctAnswer =
                  q.answer
                    ?.trim()
                    .toLowerCase();

                const optCorrect =
                  value
                    .trim()
                    .toLowerCase() ===
                  correctAnswer;

                return (
                  <label
                    key={value}
                    style={{
                      display: "block",
                      marginTop: "8px",
                      padding: "8px",

                      borderRadius: "6px",

                      border:
                        "1px solid var(--sl-color-gray-5)",

                      background:
                        submitted &&
                        optCorrect
                          ? "rgba(0,200,0,.15)"
                          : submitted &&
                            selected &&
                            !optCorrect
                          ? "rgba(255,0,0,.15)"
                          : "transparent"
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      disabled={submitted}
                      checked={selected}
                      onChange={() =>
                        setAnswer(
                          i,
                          value
                        )
                      }
                    />

                    {opt.type ===
                    "text" ? (
                      <span
                        style={{
                          marginLeft:
                            "6px"
                        }}
                      >
                        {value}
                      </span>
                    ) : (
                      <div
                        style={{
                          textAlign:
                            "center"
                        }}
                      >
                        <img
                          src={value}
                          style={{
                            display:
                              "block",

                            width:
                              "75%",

                            maxWidth:
                              "100%",

                            maxHeight:
                              "60vh",

                            objectFit:
                              "contain",

                            marginLeft:
                              "auto",

                            marginRight:
                              "auto",

                            marginTop:
                              "8px",

                            borderRadius:
                              "8px"
                          }}
                        />

                        {opt.caption && (
                          <div
                            style={{
                              marginTop:
                                "6px",

                              fontSize:
                                ".9rem",

                              opacity:
                                .8
                            }}
                          >
                            {
                              opt.caption
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </label>
                );
              })
            ) : (
              <input
                disabled={submitted}
                value={
                  answers[i] || ""
                }
                onChange={(e) =>
                  setAnswer(
                    i,
                    e.target.value
                  )
                }
                style={{
                  marginTop: "6px",
                  padding: "6px",
                  border:
                    "1px solid var(--sl-color-gray-5)",
                  borderRadius:
                    "6px",
                  width: "100%"
                }}
              />
            )}
          </div>
        );
      })}

      <button
        onClick={
          submitted
            ? resetQuiz
            : submit
        }
        style={{
          background:
            "var(--sl-color-accent)",

          color:
            "var(--sl-color-bg)",

          border: "none",

          padding:
            "0.6rem 1rem",

          borderRadius:
            "6px",

          cursor: "pointer",

          fontWeight: 600
        }}
      >
        {submitted
          ? "Try Again"
          : "Submit Quiz"}
      </button>

      {score !== null && (
        <p>
          Score: {score} / {questions.length} (
          {Math.round(
            (score /
              questions.length) *
              100
          )}
          %)
        </p>
      )}

      <style>
        {`
        .result-icon {
          font-weight:bold;
          font-size:1.2rem;
          animation:pop .2s ease;
        }

        @keyframes pop {
          0% {
            transform:scale(.6);
            opacity:0;
          }

          100% {
            transform:scale(1);
            opacity:1;
          }
        }
      `}
      </style>
    </div>
  );
}