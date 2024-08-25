import React, { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { increment } from "firebase/firestore";
import Logo from "@/components/Logo";
import { useFirestore } from "@/hooks/useFirestore";
import { Input } from "@/shadcn/components/ui/input";
import { useAuthContext } from "@/hooks/useAuthContext";
import questions from "./questions";

const url =
  "https://us-central1-trading-app-e0773.cloudfunctions.net/createUsername";

export default function Step3() {
  const { user } = useAuthContext();
  const { updateDocument: updateUser } = useFirestore("users");
  const { createDocument: createOnboarding } = useFirestore("onboarding");

  const [username, setUsername] = useState("");
  const [error, setError] = useState({ what: null, message: "" });
  const [isPending, setIsPending] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [allAnswers, setAllAnswers] = useState([]);

  const determineNextQuestion = (currentIndex, selectedAnswer) => {
    const currentQuestionId = questions[currentIndex].id;

    // Se a pergunta atual é "A" e a resposta é "Não", pula para a pergunta "C"
    if (
      currentQuestionId === "A" &&
      selectedAnswer === "Não, não tenho experiência com investimentos"
    ) {
      return questions.findIndex((q) => q.id === "C");
    }

    // Se não houver fluxo específico, avança para a próxima pergunta
    return currentIndex + 1;
  };

  const handleSubmitMultiple = async () => {
    const nextQuestionIndex = determineNextQuestion(currentQuestion, null);

    if (nextQuestionIndex >= questions.length) {
      await createOnboarding(user.uid, {
        id: user.uid,
        answers: allAnswers,
      });
      nextStep(); // Incrementa o onboarding se for a última pergunta
    } else {
      setCurrentQuestion(nextQuestionIndex);
    }
  };

  const selectAnswer = (question, answerObj) => {
    const isMultiple = question.multiple;

    setAllAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];

      // Verifica se já existe uma entrada para a pergunta atual
      const existingAnswers = updatedAnswers[currentQuestion]?.answers || [];

      if (isMultiple) {
        // Se for múltipla escolha, adiciona ou remove a resposta
        const answerIndex = existingAnswers.indexOf(answerObj);
        if (answerIndex > -1) {
          existingAnswers.splice(answerIndex, 1);
        } else {
          existingAnswers.push(answerObj);
        }
      } else {
        // Se não for múltipla escolha, substitui a resposta
        updatedAnswers[currentQuestion] = {
          questionId: question.id, // ou use o ID da pergunta real
          answers: [answerObj],
        };

        // Determina a próxima pergunta com base na resposta
        const nextQuestionIndex = determineNextQuestion(
          currentQuestion,
          answerObj
        );

        if (nextQuestionIndex >= questions.length) {
          nextStep(); // Incrementa o onboarding se for a última pergunta
        } else {
          setCurrentQuestion(nextQuestionIndex);
        }

        console.log(updatedAnswers);

        return updatedAnswers;
      }

      // Atualiza as respostas para a pergunta atual
      updatedAnswers[currentQuestion] = {
        questionId: currentQuestion, // ou use o ID da pergunta real
        answers: existingAnswers,
      };

      console.log(updatedAnswers);

      return updatedAnswers;
    });
  };

  const nextStep = async () => {
    await updateUser(user.uid, {
      onboarding: increment(1),
    });
  };

  return (
    <div className="h-screen w-screen p-2.5 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <Logo />
        <h3 className="text-lg font-semibold">Perfil de Investidor</h3>
      </div>
      <div className="mt-5 flex flex-col items-center w-11/12">
        {questions.map((question, index) => {
          if (index === currentQuestion) {
            return (
              <div key={question.id}>
                <p className="mt-5 mb-2.5 text-center">{question.title}</p>
                {question.multiple ? (
                  <p className="text-center mb-5 text-muted-foreground">
                    Selecione quantas opções quiser.
                  </p>
                ) : (
                  <div className="pt-2.5"></div>
                )}
                <div
                  className={`grid ${
                    question.multiple ? "grid-cols-2" : ""
                  } gap-1.5`}
                >
                  {question.answers.map((answer) => (
                    <Button
                      variant="outline"
                      key={answer}
                      size="lg"
                      className={`justify-start w-full text-left
                      } ${
                        allAnswers[currentQuestion]?.answers.includes(answer)
                          ? "focus:bg-background border border-[#00FFA3]"
                          : "bg-background focus:bg-background"
                      } ${
                        question.multiple
                          ? "h-12"
                          : "h-16 whitespace-break-spaces"
                      }`}
                      onClick={() => selectAnswer(question, answer)}
                    >
                      {answer}
                    </Button>
                  ))}
                </div>
                {question.multiple && (
                  <Button
                    size="lg"
                    className="mt-5 w-full text-md"
                    onClick={handleSubmitMultiple}
                  >
                    Enviar opções selecionadas
                  </Button>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
