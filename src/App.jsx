import { useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://sih-vernacular-education-backend.onrender.com";

const API = {
  login: `${API_URL}/login`,
  register: `${API_URL}/register`,
  dashboard: `${API_URL}/dashboard`,
  achievements: `${API_URL}/achievements/me`,
  certificates: `${API_URL}/certificates/me`,
  subjects: `${API_URL}/subjects`,
  lessons: `${API_URL}/lessons`,
  languages: `${API_URL}/languages`,
  translate: `${API_URL}/translate`,
  quizAttempt: `${API_URL}/quiz/attempt`,
  quizSubmit: `${API_URL}/quiz/submit`,
};

function getToken() {
  return localStorage.getItem("access_token");
}

function authHeaders(token = getToken()) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  return await response.text();
}

function clampPercentage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, number));
}

function getErrorMessage(data, fallback) {
  if (typeof data === "object" && data?.detail) {
    if (Array.isArray(data.detail)) {
      return (
        data.detail
          .map(
            (item) =>
              item?.msg || "Invalid input."
          )
          .join(", ") || fallback
      );
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }
  }

  return fallback;
}

function App() {
  // =========================================================
  // AUTH MODE
  // =========================================================

  const [authMode, setAuthMode] =
    useState("login");

  // =========================================================
  // LOGIN
  // =========================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  // =========================================================
  // REGISTER
  // =========================================================

  const [registerName, setRegisterName] =
    useState("");

  const [registerEmail, setRegisterEmail] =
    useState("");

  const [
    registerPassword,
    setRegisterPassword,
  ] = useState("");

  const [
    registerLanguage,
    setRegisterLanguage,
  ] = useState("Hindi");

  // =========================================================
  // AUTH LOADING / MESSAGE
  // =========================================================

  const [loading, setLoading] =
    useState(false);

  const [
    registerLoading,
    setRegisterLoading,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("error");

  // =========================================================
  // DASHBOARD
  // =========================================================

  const [dashboard, setDashboard] =
    useState(null);

  // =========================================================
  // ACHIEVEMENTS
  // =========================================================

  const [achievements, setAchievements] =
    useState(null);

  const [
    achievementsLoading,
    setAchievementsLoading,
  ] = useState(false);

  const [
    showAchievements,
    setShowAchievements,
  ] = useState(false);

  // =========================================================
  // CERTIFICATES
  // =========================================================

  const [certificates, setCertificates] =
    useState(null);

  const [
    certificatesLoading,
    setCertificatesLoading,
  ] = useState(false);

  const [
    showCertificates,
    setShowCertificates,
  ] = useState(false);

  // =========================================================
  // SUBJECTS
  // =========================================================

  const [subjects, setSubjects] =
    useState(null);

  const [
    subjectsLoading,
    setSubjectsLoading,
  ] = useState(false);

  // =========================================================
  // LESSONS
  // =========================================================

  const [lessons, setLessons] =
    useState(null);

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState(null);

  const [
    lessonsLoading,
    setLessonsLoading,
  ] = useState(false);

  // =========================================================
  // SELECTED LESSON
  // =========================================================

  const [
    selectedLesson,
    setSelectedLesson,
  ] = useState(null);

  // =========================================================
  // QUIZ
  // =========================================================

  const [
    quizQuestions,
    setQuizQuestions,
  ] = useState(null);

  const [
    quizAnswers,
    setQuizAnswers,
  ] = useState({});

  const [
    quizLoading,
    setQuizLoading,
  ] = useState(false);

  const [
    quizSubmitting,
    setQuizSubmitting,
  ] = useState(false);

  const [
    quizResult,
    setQuizResult,
  ] = useState(null);

  // =========================================================
  // TRANSLATION
  // =========================================================

  const [
    translationOpen,
    setTranslationOpen,
  ] = useState(false);

  const [languages, setLanguages] =
    useState([]);

  const [
    languagesLoading,
    setLanguagesLoading,
  ] = useState(false);

  const [
    sourceLanguage,
    setSourceLanguage,
  ] = useState("en-IN");

  const [
    targetLanguage,
    setTargetLanguage,
  ] = useState("hi-IN");

  const [
    translationText,
    setTranslationText,
  ] = useState("");

  const [
    translationResult,
    setTranslationResult,
  ] = useState("");

  const [
    translationLoading,
    setTranslationLoading,
  ] = useState(false);

  // =========================================================
  // AUTH MESSAGE HELPERS
  // =========================================================

  const showError = (text) => {
    setMessage(text);
    setMessageType("error");
  };

  const showSuccess = (text) => {
    setMessage(text);
    setMessageType("success");
  };

  // =========================================================
  // SWITCH TO LOGIN
  // =========================================================

  const switchToLogin = () => {
    setAuthMode("login");
    setMessage("");
    setMessageType("error");

    if (registerEmail.trim()) {
      setEmail(registerEmail.trim());
    }

    setPassword("");
  };

  // =========================================================
  // SWITCH TO REGISTER
  // =========================================================

  const switchToRegister = () => {
    setAuthMode("register");
    setMessage("");
    setMessageType("error");

    if (email.trim()) {
      setRegisterEmail(email.trim());
    }

    setRegisterPassword("");
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async () => {
    const name = registerName.trim();
    const registrationEmail =
      registerEmail.trim();

    if (!name) {
      showError("Please enter your full name.");
      return;
    }

    if (!registrationEmail) {
      showError("Please enter your email address.");
      return;
    }

    if (!registerPassword) {
      showError("Please create a password.");
      return;
    }

    if (registerPassword.length < 6) {
      showError(
        "Password should contain at least 6 characters."
      );
      return;
    }

    setRegisterLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        API.register,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email: registrationEmail,
            password: registerPassword,
            language: registerLanguage,
          }),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        showError(
          getErrorMessage(
            data,
            "Registration failed. Please try again."
          )
        );
        return;
      }

      // Automatically prepare login form.
      setEmail(registrationEmail);
      setPassword("");

      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterLanguage("Hindi");

      setAuthMode("login");

      showSuccess(
        "Account created successfully. You can now sign in."
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      showError(
        "Backend server se connection nahi ho pa raha."
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showError(
        "Please enter email and password."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData =
        new URLSearchParams();

      formData.append(
        "username",
        email.trim()
      );

      formData.append(
        "password",
        password
      );

      const response = await fetch(
        API.login,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        showError(
          getErrorMessage(
            data,
            "Login failed."
          )
        );
        return;
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      const dashboardResponse =
        await fetch(
          API.dashboard,
          {
            method: "GET",
            headers: authHeaders(
              data.access_token
            ),
          }
        );

      const dashboardData =
        await parseResponse(
          dashboardResponse
        );

      if (!dashboardResponse.ok) {
        localStorage.removeItem(
          "access_token"
        );

        showError(
          getErrorMessage(
            dashboardData,
            "Dashboard load nahi ho pa raha."
          )
        );

        return;
      }

      setDashboard(dashboardData);
      setMessage("");
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      showError(
        "Backend server se connection nahi ho pa raha."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DASHBOARD REFRESH
  // =========================================================

  const refreshDashboard = async () => {
    const token = getToken();

    if (!token) {
      showError("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        API.dashboard,
        {
          method: "GET",
          headers: authHeaders(token),
        }
      );

      const data =
        await parseResponse(response);

      if (response.ok) {
        setDashboard(data);
      } else if (
        typeof data === "object" &&
        data?.detail
      ) {
        showError(data.detail);
      }
    } catch (error) {
      console.error(
        "Dashboard refresh error:",
        error
      );
    }
  };

  // =========================================================
  // ACHIEVEMENTS
  // =========================================================

  const loadAchievements = async () => {
    const token = getToken();

    if (!token) {
      showError("Please login again.");
      return;
    }

    setAchievementsLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          API.achievements,
          {
            method: "GET",
            headers: authHeaders(token),
          }
        );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        showError(
          getErrorMessage(
            data,
            "Achievements load nahi ho pa rahe."
          )
        );
        return;
      }

      setAchievements(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Achievements error:",
        error
      );

      showError(
        "Achievements load karte time error aa gaya."
      );
    } finally {
      setAchievementsLoading(
        false
      );
    }
  };

  const openAchievements =
    async () => {
      setShowAchievements(true);
      setMessage("");
      await loadAchievements();
    };

  const closeAchievements = () => {
    setShowAchievements(false);
    setMessage("");
  };

  // =========================================================
  // CERTIFICATES
  // =========================================================

  const loadCertificates = async () => {
    const token = getToken();

    if (!token) {
      showError("Please login again.");
      return;
    }

    setCertificatesLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          API.certificates,
          {
            method: "GET",
            headers: authHeaders(token),
          }
        );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        showError(
          getErrorMessage(
            data,
            "Certificates load nahi ho pa rahe."
          )
        );
        return;
      }

      setCertificates(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Certificates error:",
        error
      );

      showError(
        "Certificates load karte time error aa gaya."
      );
    } finally {
      setCertificatesLoading(
        false
      );
    }
  };

  const openCertificates =
    async () => {
      setShowCertificates(true);
      setMessage("");
      await loadCertificates();
    };

  const closeCertificates = () => {
    setShowCertificates(false);
    setMessage("");
  };

  // =========================================================
  // CERTIFICATE PDF DOWNLOAD
  // =========================================================

  const handleDownloadCertificate =
    async (certificate) => {
      const token = getToken();

      if (!token) {
        showError("Please login again.");
        return;
      }

      if (!certificate?.certificate_id) {
        showError(
          "Certificate ID nahi mila."
        );
        return;
      }

      try {
        setMessage("");

        const response =
          await fetch(
            `${API_URL}/certificates/${certificate.certificate_id}/download`,
            {
              method: "GET",
              headers: authHeaders(token),
            }
          );

        if (!response.ok) {
          let errorMessage =
            "Certificate download nahi ho pa raha.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData.detail ||
              errorMessage;
          } catch {
            // Keep default message.
          }

          showError(errorMessage);
          return;
        }

        const pdfBlob =
          await response.blob();

        const pdfUrl =
          window.URL.createObjectURL(
            pdfBlob
          );

        const link =
          document.createElement("a");

        link.href = pdfUrl;

        link.download =
          `${certificate.certificate_id}.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          pdfUrl
        );
      } catch (error) {
        console.error(
          "Certificate download error:",
          error
        );

        showError(
          "Certificate download karte time error aa gaya."
        );
      }
    };

  // =========================================================
  // SUBJECTS
  // =========================================================

  const loadSubjects = async () => {
    const token = getToken();

    if (!token) {
      showError("Please login again.");
      return;
    }

    setSubjectsLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          API.subjects,
          {
            method: "GET",
            headers: authHeaders(token),
          }
        );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        showError(
          getErrorMessage(
            data,
            "Subjects load nahi ho pa rahe."
          )
        );
        return;
      }

      setSubjects(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Subjects error:",
        error
      );

      showError(
        "Subjects load karte time error aa gaya."
      );
    } finally {
      setSubjectsLoading(false);
    }
  };

  // =========================================================
  // LESSONS
  // =========================================================

  const loadLessons = async (
    subject
  ) => {
    const token = getToken();

    if (!token) {
      showError("Please login again.");
      return;
    }

    setLessonsLoading(true);
    setMessage("");

    setSelectedLesson(null);
    setSelectedSubject(subject);

    setQuizQuestions(null);
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const response =
        await fetch(
          API.lessons,
          {
            method: "GET",
            headers: authHeaders(token),
          }
        );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        showError(
          getErrorMessage(
            data,
            "Lessons load nahi ho pa rahe."
          )
        );
        return;
      }

      const subjectLessons =
        Array.isArray(data)
          ? data.filter(
              (lesson) =>
                Number(
                  lesson.subject_id
                ) ===
                Number(subject.id)
            )
          : [];

      setLessons(subjectLessons);
    } catch (error) {
      console.error(
        "Lessons error:",
        error
      );

      showError(
        "Lessons load karte time error aa gaya."
      );
    } finally {
      setLessonsLoading(false);
    }
  };

  // =========================================================
  // OPEN LESSON
  // =========================================================

  const openLesson = (
    lesson
  ) => {
    setSelectedLesson(lesson);
    setQuizQuestions(null);
    setQuizAnswers({});
    setQuizResult(null);
    setMessage("");
  };

  // =========================================================
  // START QUIZ
  // =========================================================

  const startQuiz = async () => {
    if (!selectedLesson) {
      return;
    }

    const token = getToken();

    if (!token) {
      showError("Please login again.");
      return;
    }

    setQuizLoading(true);
    setQuizQuestions(null);
    setQuizAnswers({});
    setQuizResult(null);
    setMessage("");

    try {
      const attemptResponse =
        await fetch(
          API.quizAttempt,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              ...authHeaders(token),
            },
            body: JSON.stringify({
              lesson_id:
                selectedLesson.id,
            }),
          }
        );

      const attemptData =
        await parseResponse(
          attemptResponse
        );

      if (!attemptResponse.ok) {
        showError(
          getErrorMessage(
            attemptData,
            "Quiz start nahi ho pa raha."
          )
        );
        return;
      }

      const questionResponse =
        await fetch(
          `${API_URL}/quiz/lesson/${selectedLesson.id}`,
          {
            method: "GET",
            headers: authHeaders(token),
          }
        );

      const questionData =
        await parseResponse(
          questionResponse
        );

      if (!questionResponse.ok) {
        showError(
          getErrorMessage(
            questionData,
            "Quiz questions load nahi ho rahe."
          )
        );
        return;
      }

      if (
        !Array.isArray(
          questionData
        ) ||
        questionData.length === 0
      ) {
        showError(
          "Is lesson ke liye abhi koi quiz available nahi hai."
        );
        return;
      }

      setQuizQuestions(
        questionData
      );
    } catch (error) {
      console.error(
        "Quiz loading error:",
        error
      );

      showError(
        "Quiz load karte time error aa gaya."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // =========================================================
  // SELECT ANSWER
  // =========================================================

  const selectAnswer = (
    questionId,
    answer
  ) => {
    setQuizAnswers(
      (previous) => ({
        ...previous,
        [questionId]: answer,
      })
    );
  };

  // =========================================================
  // SUBMIT QUIZ
  // =========================================================

  const submitQuiz = async () => {
    if (
      !selectedLesson ||
      !quizQuestions
    ) {
      return;
    }

    const unansweredQuestions =
      quizQuestions.filter(
        (question) =>
          !quizAnswers[
            question.id
          ]
      );

    if (
      unansweredQuestions.length >
      0
    ) {
      showError(
        `Please answer all questions first. ${unansweredQuestions.length} question(s) remaining.`
      );
      return;
    }

    const token = getToken();

    if (!token) {
      showError("Please login again.");
      return;
    }

    setQuizSubmitting(true);
    setMessage("");

    try {
      const answers =
        quizQuestions.map(
          (question) => ({
            question_id:
              question.id,
            selected_answer:
              quizAnswers[
                question.id
              ],
          })
        );

      const response =
        await fetch(
          API.quizSubmit,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              ...authHeaders(token),
            },
            body: JSON.stringify({
              lesson_id:
                selectedLesson.id,
              answers,
            }),
          }
        );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        showError(
          getErrorMessage(
            data,
            "Quiz submit nahi ho pa raha."
          )
        );
        return;
      }

      setQuizResult(data);

      await refreshDashboard();
    } catch (error) {
      console.error(
        "Quiz submit error:",
        error
      );

      showError(
        "Quiz submit karte time error aa gaya."
      );
    } finally {
      setQuizSubmitting(false);
    }
  };

  // =========================================================
  // EXIT QUIZ
  // =========================================================

  const exitQuiz = () => {
    setQuizQuestions(null);
    setQuizAnswers({});
    setQuizResult(null);
    setMessage("");
  };

  // =========================================================
  // LANGUAGES
  // =========================================================

  const loadLanguages = async () => {
    setLanguagesLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          API.languages
        );

      const data =
        await parseResponse(
          response
        );

      if (!response.ok) {
        showError(
          getErrorMessage(
            data,
            "Languages load nahi ho rahi hain."
          )
        );
        return;
      }

      setLanguages(
        Array.isArray(
          data.languages
        )
          ? data.languages
          : []
      );
    } catch (error) {
      console.error(
        "Languages error:",
        error
      );

      showError(
        "Languages load karte time error aa gaya."
      );
    } finally {
      setLanguagesLoading(
        false
      );
    }
  };

  // =========================================================
  // OPEN TRANSLATION
  // =========================================================

  const openTranslation = () => {
    setTranslationOpen(true);
    setTranslationResult("");
    setTranslationText("");
    setMessage("");

    if (languages.length === 0) {
      loadLanguages();
    }
  };

  // =========================================================
  // TRANSLATE
  // =========================================================

  const handleTranslate =
    async () => {
      if (!translationText.trim()) {
        showError(
          "Please enter some text to translate."
        );
        return;
      }

      if (
        sourceLanguage ===
        targetLanguage
      ) {
        setTranslationResult(
          translationText.trim()
        );

        setMessage("");
        return;
      }

      setTranslationLoading(true);
      setTranslationResult("");
      setMessage("");

      try {
        const response =
          await fetch(
            API.translate,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                text: translationText,
                source_language:
                  sourceLanguage,
                target_language:
                  targetLanguage,
              }),
            }
          );

        const data =
          await parseResponse(
            response
          );

        if (!response.ok) {
          showError(
            getErrorMessage(
              data,
              "Translation failed."
            )
          );
          return;
        }

        setTranslationResult(
          data.translated_text ||
            ""
        );
      } catch (error) {
        console.error(
          "Translation error:",
          error
        );

        showError(
          "Translation service se connection nahi ho pa raha."
        );
      } finally {
        setTranslationLoading(
          false
        );
      }
    };

  // =========================================================
  // SWAP LANGUAGES
  // =========================================================

  const swapLanguages = () => {
    setSourceLanguage(
      targetLanguage
    );

    setTargetLanguage(
      sourceLanguage
    );

    if (translationResult) {
      setTranslationText(
        translationResult
      );

      setTranslationResult("");
    }
  };

  // =========================================================
  // CLOSE TRANSLATION
  // =========================================================

  const closeTranslation = () => {
    setTranslationOpen(false);
    setTranslationText("");
    setTranslationResult("");
    setMessage("");
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    setDashboard(null);

    setAchievements(null);
    setShowAchievements(false);

    setCertificates(null);
    setShowCertificates(false);

    setSubjects(null);
    setLessons(null);

    setSelectedSubject(null);
    setSelectedLesson(null);

    setQuizQuestions(null);
    setQuizAnswers({});
    setQuizResult(null);

    setTranslationOpen(false);
    setTranslationText("");
    setTranslationResult("");

    setEmail("");
    setPassword("");

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterLanguage("Hindi");

    setAuthMode("login");

    setMessage("");
    setMessageType("error");
  };

  // =========================================================
  // ACHIEVEMENTS SCREEN
  // =========================================================

  if (
    dashboard &&
    showAchievements
  ) {
    return (
      <AppShell
        dashboard={dashboard}
        active="achievements"
        onDashboard={
          closeAchievements
        }
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <PageHeader
          eyebrow="LEARNING MILESTONES"
          title="My Achievements"
          description="Track the milestones you have unlocked through lessons and quizzes."
          icon="🏆"
        />

        {achievementsLoading ? (
          <LoadingCard
            icon="🏆"
            title="Loading achievements..."
          />
        ) : Array.isArray(
            achievements
          ) &&
          achievements.length > 0 ? (
          <div className="achievement-grid">
            {achievements.map(
              (achievement) => (
                <article
                  className="achievement-card"
                  key={achievement.id}
                >
                  <div className="achievement-icon">
                    🏆
                  </div>

                  <div className="achievement-content">
                    <span className="status-pill success">
                      Unlocked
                    </span>

                    <h3>
                      {achievement.title ||
                        achievement.name ||
                        "Learning Achievement"}
                    </h3>

                    <p>
                      {achievement.description ||
                        "Learning achievement unlocked."}
                    </p>

                    {achievement.earned_at && (
                      <span className="meta-text">
                        Earned{" "}
                        {new Date(
                          achievement.earned_at
                        ).toLocaleDateString()}
                      </span>
                    )}

                    {!achievement.earned_at &&
                      achievement.unlocked_at && (
                        <span className="meta-text">
                          Unlocked{" "}
                          {new Date(
                            achievement.unlocked_at
                          ).toLocaleDateString()}
                        </span>
                      )}
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <EmptyState
            icon="🏆"
            title="No achievements yet"
            text="Complete lessons and pass quizzes with a score of 50% or more to unlock achievements."
          />
        )}

        {message && (
          <Alert
            type={
              messageType
            }
          >
            {message}
          </Alert>
        )}
      </AppShell>
    );
  }

  // =========================================================
  // CERTIFICATES SCREEN
  // =========================================================

  if (
    dashboard &&
    showCertificates
  ) {
    return (
      <AppShell
        dashboard={dashboard}
        active="certificates"
        onDashboard={
          closeCertificates
        }
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <PageHeader
          eyebrow="YOUR CREDENTIALS"
          title="My Certificates"
          description="Download and keep your verified course completion certificates."
          icon="🎓"
        />

        {certificatesLoading ? (
          <LoadingCard
            icon="🎓"
            title="Loading certificates..."
          />
        ) : Array.isArray(
            certificates
          ) &&
          certificates.length > 0 ? (
          <div className="certificate-grid">
            {certificates.map(
              (certificate) => (
                <article
                  className="certificate-card"
                  key={
                    certificate.id ||
                    certificate.certificate_id
                  }
                >
                  <div className="certificate-ribbon">
                    VERNACULAR EDUCATION
                  </div>

                  <div className="certificate-emblem">
                    🎓
                  </div>

                  <span className="status-pill success">
                    Certificate Earned
                  </span>

                  <h3>
                    {certificate.title ||
                      "Certificate of Completion"}
                  </h3>

                  <p className="certificate-description">
                    {certificate.description ||
                      "Certificate earned after successfully completing the lesson quiz."}
                  </p>

                  <div className="certificate-info">
                    <div>
                      <span>
                        Certificate ID
                      </span>

                      <strong>
                        {certificate.certificate_id ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Quiz Score
                      </span>

                      <strong>
                        {certificate.score ??
                          0}
                        %
                      </strong>
                    </div>

                    <div>
                      <span>
                        Issued
                      </span>

                      <strong>
                        {certificate.issued_at
                          ? new Date(
                              certificate.issued_at
                            ).toLocaleDateString()
                          : "—"}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={() =>
                      handleDownloadCertificate(
                        certificate
                      )
                    }
                  >
                    📥 Download Certificate PDF
                  </button>
                </article>
              )
            )}
          </div>
        ) : (
          <EmptyState
            icon="🎓"
            title="No certificates yet"
            text="Pass a lesson quiz with a score of 50% or more to earn a certificate."
          />
        )}

        {message && (
          <Alert
            type={
              messageType
            }
          >
            {message}
          </Alert>
        )}
      </AppShell>
    );
  }

  // =========================================================
  // TRANSLATION SCREEN
  // =========================================================

  if (
    dashboard &&
    translationOpen
  ) {
    return (
      <AppShell
        dashboard={dashboard}
        active="translation"
        onDashboard={
          closeTranslation
        }
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <PageHeader
          eyebrow="AI LANGUAGE TOOL"
          title="Real-Time Translation"
          description="Translate learning content across supported languages for mother-tongue learning."
          icon="🌐"
        />

        <section className="translation-workspace">
          <div className="translation-toolbar">
            <div className="language-select-group">
              <label>
                From language
              </label>

              <select
                value={
                  sourceLanguage
                }
                onChange={(event) =>
                  setSourceLanguage(
                    event.target.value
                  )
                }
                disabled={
                  languagesLoading
                }
              >
                {languages.map(
                  (language) => (
                    <option
                      key={
                        language.code
                      }
                      value={
                        language.code
                      }
                    >
                      {
                        language.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              type="button"
              className="swap-button"
              onClick={
                swapLanguages
              }
              title="Swap languages"
            >
              ⇄
            </button>

            <div className="language-select-group">
              <label>
                To language
              </label>

              <select
                value={
                  targetLanguage
                }
                onChange={(event) =>
                  setTargetLanguage(
                    event.target.value
                  )
                }
                disabled={
                  languagesLoading
                }
              >
                {languages.map(
                  (language) => (
                    <option
                      key={
                        language.code
                      }
                      value={
                        language.code
                      }
                    >
                      {
                        language.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {languagesLoading ? (
            <LoadingCard
              icon="🌐"
              title="Loading supported languages..."
            />
          ) : (
            <div className="translation-panels">
              <div className="translation-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-kicker">
                      SOURCE
                    </span>

                    <h3>
                      Enter learning content
                    </h3>
                  </div>

                  <span className="panel-badge">
                    ✎
                  </span>
                </div>

                <textarea
                  value={
                    translationText
                  }
                  onChange={(event) =>
                    setTranslationText(
                      event.target.value
                    )
                  }
                  placeholder="Type a sentence, lesson content, or learning material..."
                />

                <div className="character-count">
                  {
                    translationText.length
                  }{" "}
                  characters
                </div>
              </div>

              <div className="translation-panel result-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-kicker">
                      TRANSLATED OUTPUT
                    </span>

                    <h3>
                      Learning-ready result
                    </h3>
                  </div>

                  <span className="panel-badge result">
                    ✓
                  </span>
                </div>

                <div className="translation-result">
                  {translationResult ||
                    "Your translated content will appear here..."}
                </div>
              </div>
            </div>
          )}

          {message && (
            <Alert
              type={
                messageType
              }
            >
              {message}
            </Alert>
          )}

          <button
            type="button"
            className="btn btn-success btn-large"
            onClick={
              handleTranslate
            }
            disabled={
              translationLoading ||
              languagesLoading
            }
          >
            {translationLoading
              ? "Translating..."
              : "🌐 Translate Content"}
          </button>
        </section>
      </AppShell>
    );
  }

  // =========================================================
  // QUIZ RESULT SCREEN
  // =========================================================

  if (
    selectedLesson &&
    quizResult
  ) {
    const totalQuestions =
      Math.max(
        0,
        Number(
          quizResult.total_questions ??
            0
        )
      );

    const correctAnswers =
      Math.max(
        0,
        Number(
          quizResult.correct_answers ??
            0
        )
      );

    const calculatedScore =
      totalQuestions > 0
        ? Math.round(
            (correctAnswers /
              totalQuestions) *
              100
          )
        : 0;

    const score =
      clampPercentage(
        quizResult.score ??
          calculatedScore
      );

    const passed = score >= 50;

    const incorrectAnswers =
      Math.max(
        0,
        totalQuestions -
          correctAnswers
      );

    return (
      <AppShell
        dashboard={dashboard}
        active="subjects"
        onDashboard={exitQuiz}
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <section className="result-page">
          <div
            className={`result-card ${
              passed
                ? "passed"
                : "needs-work"
            }`}
          >
            <div className="result-icon">
              {passed
                ? "🎉"
                : "📚"}
            </div>

            <span
              className={`status-pill ${
                passed
                  ? "success"
                  : "warning"
              }`}
            >
              {passed
                ? "Quiz Passed"
                : "Keep Learning"}
            </span>

            <h1>
              {passed
                ? "Quiz Completed!"
                : "Quiz Completed"}
            </h1>

            <p className="result-subtitle">
              {selectedLesson.title}
            </p>

            <ScoreRing
              score={score}
              passed={passed}
            />

            <div className="result-stats">
              <div>
                <strong>
                  {totalQuestions}
                </strong>

                <span>
                  Total Questions
                </span>
              </div>

              <div>
                <strong>
                  {correctAnswers}
                </strong>

                <span>
                  Correct Answers
                </span>
              </div>

              <div>
                <strong>
                  {incorrectAnswers}
                </strong>

                <span>
                  Incorrect
                </span>
              </div>
            </div>

            <div
              className={`result-message ${
                passed
                  ? "success"
                  : "warning"
              }`}
            >
              <strong>
                {passed
                  ? "🏆 Congratulations!"
                  : "📖 Keep practicing!"}
              </strong>

              <p>
                {passed
                  ? "Your progress, achievement and certificate have been processed by the platform."
                  : "A score of 50% or more is required to pass this lesson quiz."}
              </p>
            </div>

            <div className="result-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={
                  exitQuiz
                }
              >
                ← Back to Lesson
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setQuizResult(
                    null
                  );
                  startQuiz();
                }}
              >
                🔄 Retake Quiz
              </button>

              {passed && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={
                    openCertificates
                  }
                >
                  🎓 View Certificate
                </button>
              )}
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  // =========================================================
  // QUIZ SCREEN
  // =========================================================

  if (
    selectedLesson &&
    quizQuestions !== null
  ) {
    const answeredCount =
      quizQuestions.filter(
        (question) =>
          quizAnswers[
            question.id
          ]
      ).length;

    const progress =
      quizQuestions.length > 0
        ? Math.round(
            (answeredCount /
              quizQuestions.length) *
              100
          )
        : 0;

    return (
      <AppShell
        dashboard={dashboard}
        active="subjects"
        onDashboard={exitQuiz}
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <div className="quiz-shell">
          <div className="quiz-top-card">
            <div>
              <span className="panel-kicker">
                KNOWLEDGE CHECK
              </span>

              <h1>
                📝{" "}
                {
                  selectedLesson.title
                }{" "}
                Quiz
              </h1>

              <p>
                Answer all questions and
                submit when you are ready.
              </p>
            </div>

            <div className="quiz-progress-summary">
              <strong>
                {answeredCount}/
                {
                  quizQuestions.length
                }
              </strong>

              <span>
                Answered
              </span>
            </div>
          </div>

          <div className="quiz-progress-bar">
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {quizQuestions.map(
            (question, index) => {
              const selectedAnswer =
                quizAnswers[
                  question.id
                ];

              const options = [
                {
                  key: "A",
                  text: question.option_a,
                },
                {
                  key: "B",
                  text: question.option_b,
                },
                {
                  key: "C",
                  text: question.option_c,
                },
                {
                  key: "D",
                  text: question.option_d,
                },
              ];

              return (
                <article
                  className="question-card"
                  key={
                    question.id
                  }
                >
                  <div className="question-number">
                    Q{index + 1}
                  </div>

                  <div className="question-body">
                    <h2>
                      {
                        question.question
                      }
                    </h2>

                    <div className="quiz-options">
                      {options.map(
                        (option) => {
                          const selected =
                            selectedAnswer ===
                            option.key;

                          return (
                            <button
                              type="button"
                              className={`quiz-option ${
                                selected
                                  ? "selected"
                                  : ""
                              }`}
                              key={
                                option.key
                              }
                              onClick={() =>
                                selectAnswer(
                                  question.id,
                                  option.key
                                )
                              }
                            >
                              <span className="option-key">
                                {
                                  option.key
                                }
                              </span>

                              <span>
                                {
                                  option.text
                                }
                              </span>

                              {selected && (
                                <span className="option-check">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}

          {message && (
            <Alert
              type={
                messageType
              }
            >
              {message}
            </Alert>
          )}

          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={
              submitQuiz
            }
            disabled={
              quizSubmitting
            }
          >
            {quizSubmitting
              ? "Submitting Quiz..."
              : "Submit Quiz ✓"}
          </button>
        </div>
      </AppShell>
    );
  }

  // =========================================================
  // LESSON DETAIL
  // =========================================================

  if (selectedLesson) {
    return (
      <AppShell
        dashboard={dashboard}
        active="subjects"
        onDashboard={() => {
          setSelectedLesson(
            null
          );

          setMessage("");

          setQuizQuestions(null);
          setQuizAnswers({});
          setQuizResult(null);
        }}
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <section className="lesson-detail">
          <div className="lesson-detail-header">
            <div className="lesson-cover-icon">
              📖
            </div>

            <div>
              <span className="panel-kicker">
                LESSON
              </span>

              <h1>
                {selectedLesson.title}
              </h1>

              <p>
                {selectedLesson.description ||
                  "Continue your learning journey with this lesson."}
              </p>
            </div>
          </div>

          <div className="lesson-meta-row">
            <span>
              🌐{" "}
              {selectedLesson.language ||
                "Mother Tongue"}
            </span>

            <span>
              📚{" "}
              {selectedSubject?.name ||
                "Learning"}
            </span>

            <span>
              ✓ Quiz available
            </span>
          </div>

          <article className="lesson-content-card">
            <div className="content-label">
              LESSON CONTENT
            </div>

            <div className="lesson-content">
              {selectedLesson.content ||
                "Lesson content abhi available nahi hai."}
            </div>
          </article>

          <div className="lesson-action-card">
            <div>
              <strong>
                Ready to check your
                understanding?
              </strong>

              <p>
                Complete the quiz to track
                progress and unlock
                achievements and
                certificates.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={
                startQuiz
              }
              disabled={
                quizLoading
              }
            >
              {quizLoading
                ? "Loading Quiz..."
                : "📝 Start Quiz"}
            </button>
          </div>

          {message && (
            <Alert
              type={
                messageType
              }
            >
              {message}
            </Alert>
          )}
        </section>
      </AppShell>
    );
  }

  // =========================================================
  // LESSONS SCREEN
  // =========================================================

  if (lessons !== null) {
    return (
      <AppShell
        dashboard={dashboard}
        active="subjects"
        onDashboard={() =>
          setLessons(null)
        }
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <PageHeader
          eyebrow="LEARNING PATH"
          title={
            selectedSubject
              ? selectedSubject.name
              : "Lessons"
          }
          description="Choose a lesson and continue learning at your own pace."
          icon="📚"
        />

        {lessonsLoading ? (
          <LoadingCard
            icon="📚"
            title="Loading lessons..."
          />
        ) : lessons.length > 0 ? (
          <div className="lesson-grid">
            {lessons.map(
              (lesson, index) => (
                <article
                  className="lesson-card"
                  key={lesson.id}
                >
                  <div className="lesson-card-top">
                    <span className="lesson-index">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    <span className="lesson-language">
                      🌐{" "}
                      {lesson.language ||
                        "Hindi"}
                    </span>
                  </div>

                  <h3>
                    {lesson.title}
                  </h3>

                  <p>
                    {lesson.description ||
                      "Start learning this lesson."}
                  </p>

                  <div className="card-footer">
                    <span>
                      Interactive lesson
                    </span>

                    <button
                      type="button"
                      className="btn btn-primary btn-small"
                      onClick={() =>
                        openLesson(
                          lesson
                        )
                      }
                    >
                      Open Lesson →
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <EmptyState
            icon="📖"
            title="No lessons found"
            text="There are no lessons available for this subject yet."
          />
        )}

        {message && (
          <Alert
            type={
              messageType
            }
          >
            {message}
          </Alert>
        )}
      </AppShell>
    );
  }

  // =========================================================
  // SUBJECTS SCREEN
  // =========================================================

  if (subjects !== null) {
    return (
      <AppShell
        dashboard={dashboard}
        active="subjects"
        onDashboard={() =>
          setSubjects(null)
        }
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <PageHeader
          eyebrow="EXPLORE CURRICULUM"
          title="Subjects"
          description="Select a subject to explore lessons designed for mother-tongue learning."
          icon="📚"
        />

        {subjectsLoading ? (
          <LoadingCard
            icon="📚"
            title="Loading subjects..."
          />
        ) : Array.isArray(
            subjects
          ) &&
          subjects.length > 0 ? (
          <div className="subject-grid">
            {subjects.map(
              (subject, index) => (
                <article
                  className="subject-card"
                  key={subject.id}
                >
                  <div className="subject-icon">
                    {index % 3 ===
                    0
                      ? "📐"
                      : index % 3 ===
                        1
                      ? "🔬"
                      : "📖"}
                  </div>

                  <span className="subject-number">
                    SUBJECT{" "}
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <h3>
                    {subject.name}
                  </h3>

                  <p>
                    {subject.description ||
                      "Start learning this subject."}
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={() =>
                      loadLessons(
                        subject
                      )
                    }
                    disabled={
                      lessonsLoading
                    }
                  >
                    {lessonsLoading
                      ? "Loading..."
                      : "View Lessons →"}
                  </button>
                </article>
              )
            )}
          </div>
        ) : (
          <EmptyState
            icon="📚"
            title="No subjects available"
            text="Add learning subjects from the backend to start building the curriculum."
          />
        )}

        {message && (
          <Alert
            type={
              messageType
            }
          >
            {message}
          </Alert>
        )}
      </AppShell>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  if (dashboard) {
    const firstName = (
      dashboard.name ||
      "Learner"
    ).split(" ")[0];

    const progress =
      clampPercentage(
        dashboard.overall_progress
      );

    const averageQuizScore =
      clampPercentage(
        dashboard.average_quiz_score
      );

    return (
      <AppShell
        dashboard={dashboard}
        active="dashboard"
        onDashboard={() => {}}
        onSubjects={loadSubjects}
        onTranslation={
          openTranslation
        }
        onAchievements={
          openAchievements
        }
        onCertificates={
          openCertificates
        }
        onLogout={handleLogout}
      >
        <section className="hero-card">
          <div className="hero-content">
            <span className="hero-kicker">
              AI-POWERED VERNACULAR
              LEARNING
            </span>

            <h1>
              Welcome back,{" "}
              {firstName}! 👋
            </h1>

            <p>
              Learn concepts in your
              preferred language, practice
              with quizzes, and build
              measurable progress.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={
                  loadSubjects
                }
              >
                📚 Explore Subjects
              </button>

              <button
                type="button"
                className="btn btn-ghost-light"
                onClick={
                  openTranslation
                }
              >
                🌐 Translate Content
              </button>
            </div>
          </div>

          <div
            className="hero-orbit"
            aria-hidden="true"
          >
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />

            <div className="hero-orbit-center">
              🌐
            </div>

            <span className="orbit-dot dot-one">
              अ
            </span>

            <span className="orbit-dot dot-two">
              A
            </span>

            <span className="orbit-dot dot-three">
              क
            </span>
          </div>
        </section>

        <section className="stat-grid">
          <StatCard
            icon="📚"
            label="Total Lessons"
            value={
              dashboard.total_lessons
            }
            tone="blue"
          />

          <StatCard
            icon="✓"
            label="Completed Lessons"
            value={
              dashboard.completed_lessons
            }
            tone="green"
          />

          <StatCard
            icon="🎯"
            label="Quiz Attempts"
            value={
              dashboard.total_quiz_attempts
            }
            tone="orange"
          />

          <StatCard
            icon="🏆"
            label="Achievements"
            value={
              dashboard.total_achievements
            }
            tone="purple"
            clickable
            onClick={
              openAchievements
            }
          />
        </section>

        <section className="dashboard-main-grid">
          <article className="panel progress-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">
                  YOUR LEARNING JOURNEY
                </span>

                <h2>
                  Overall Progress
                </h2>
              </div>

              <span className="progress-percentage">
                {progress}%
              </span>
            </div>

            <div className="large-progress">
              <span
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="progress-details">
              <span>
                {
                  dashboard.completed_lessons
                }{" "}
                of{" "}
                {
                  dashboard.total_lessons
                }{" "}
                lessons completed
              </span>

              <span>
                {progress === 100
                  ? "All lessons completed"
                  : "Keep going — you are making progress"}
              </span>
            </div>

            <div className="mini-metrics">
              <div>
                <span>
                  Average Quiz Score
                </span>

                <strong>
                  {
                    dashboard.average_quiz_score
                  }
                  %
                </strong>
              </div>

              <div>
                <span>
                  Certificates
                </span>

                <strong>
                  {
                    dashboard.total_certificates
                  }
                </strong>
              </div>
            </div>
          </article>

          <article className="panel quick-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">
                  QUICK ACCESS
                </span>

                <h2>
                  Continue Learning
                </h2>
              </div>
            </div>

            <button
              type="button"
              className="quick-action"
              onClick={
                loadSubjects
              }
            >
              <span className="quick-icon blue">
                📚
              </span>

              <span>
                <strong>
                  Explore Subjects
                </strong>

                <small>
                  Find your next lesson
                </small>
              </span>

              <b>→</b>
            </button>

            <button
              type="button"
              className="quick-action"
              onClick={
                openTranslation
              }
            >
              <span className="quick-icon green">
                🌐
              </span>

              <span>
                <strong>
                  Translation Tool
                </strong>

                <small>
                  Translate learning
                  content
                </small>
              </span>

              <b>→</b>
            </button>

            <button
              type="button"
              className="quick-action"
              onClick={
                openCertificates
              }
            >
              <span className="quick-icon purple">
                🎓
              </span>

              <span>
                <strong>
                  My Certificates
                </strong>

                <small>
                  {
                    dashboard.total_certificates
                  }{" "}
                  certificate
                  {dashboard.total_certificates ===
                  1
                    ? ""
                    : "s"}{" "}
                  earned
                </small>
              </span>

              <b>→</b>
            </button>
          </article>
        </section>

        <section className="dashboard-bottom-grid">
          <article className="panel performance-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">
                  PERFORMANCE
                </span>

                <h2>
                  Quiz Performance
                </h2>
              </div>

              <span className="performance-icon">
                🎯
              </span>
            </div>

            <div className="performance-score">
              {
                dashboard.average_quiz_score
              }
              <span>%</span>
            </div>

            <p>
              Average score across your
              quiz attempts.
            </p>

            <div className="score-bar">
              <span
                style={{
                  width: `${averageQuizScore}%`,
                }}
              />
            </div>

            <button
              type="button"
              className="text-button"
              onClick={
                loadSubjects
              }
            >
              Practice more →
            </button>
          </article>

          <button
            type="button"
            className="panel credential-panel"
            onClick={
              openAchievements
            }
          >
            <div className="credential-icon">
              🏆
            </div>

            <div>
              <span className="panel-kicker">
                MILESTONES
              </span>

              <h2>
                Achievements
              </h2>

              <p>
                {
                  dashboard.total_achievements
                }{" "}
                achievement
                {dashboard.total_achievements ===
                1
                  ? ""
                  : "s"}{" "}
                unlocked.
              </p>
            </div>

            <span className="credential-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="panel credential-panel"
            onClick={
              openCertificates
            }
          >
            <div className="credential-icon certificate">
              🎓
            </div>

            <div>
              <span className="panel-kicker">
                CREDENTIALS
              </span>

              <h2>
                Certificates
              </h2>

              <p>
                {
                  dashboard.total_certificates
                }{" "}
                certificate
                {dashboard.total_certificates ===
                1
                  ? ""
                  : "s"}{" "}
                available to
                download.
              </p>
            </div>

            <span className="credential-arrow">
              →
            </span>
          </button>
        </section>

        <section className="profile-strip">
          <div className="profile-avatar">
            {(dashboard.name ||
              "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-details">
            <span className="panel-kicker">
              LEARNER PROFILE
            </span>

            <strong>
              {dashboard.name}
            </strong>

            <span>
              {dashboard.email}
            </span>
          </div>

          <div className="profile-language">
            <span>
              Preferred Language
            </span>

            <strong>
              🌐{" "}
              {dashboard.language}
            </strong>
          </div>
        </section>

        {message && (
          <Alert
            type={
              messageType
            }
          >
            {message}
          </Alert>
        )}
      </AppShell>
    );
  }

  // =========================================================
  // AUTH SCREEN
  // =========================================================

  const isRegister =
    authMode === "register";

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-brand-mark">
          VE
        </div>

        <span className="login-kicker">
          SIH26042 • SMART EDUCATION
        </span>

        <h1>
          Learning should speak your
          language.
        </h1>

        <p>
          AI-powered vernacular
          education designed to make
          primary learning more
          accessible, interactive and
          measurable.
        </p>

        <div className="login-feature-list">
          <span>
            ✓ Mother-tongue learning
          </span>

          <span>
            ✓ Real-time translation
          </span>

          <span>
            ✓ Interactive quizzes
          </span>

          <span>
            ✓ Progress & certificates
          </span>
        </div>
      </div>

      <div className="login-panel">
        <div
          className={`login-card ${
            isRegister
              ? "register-card"
              : ""
          }`}
        >
          <div className="login-card-header">
            <div className="logo-circle">
              VE
            </div>

            <span className="login-small-label">
              {isRegister
                ? "JOIN THE CLASSROOM"
                : "WELCOME BACK"}
            </span>

            <h2>
              {isRegister
                ? "Create your account"
                : "Sign in to your classroom"}
            </h2>

            <p>
              {isRegister
                ? "Start your vernacular learning journey today."
                : "Continue your vernacular learning journey."}
            </p>
          </div>

          {isRegister ? (
            <>
              <div className="form-group">
                <label>
                  Full name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={
                    registerName
                  }
                  onChange={(
                    event
                  ) =>
                    setRegisterName(
                      event.target.value
                    )
                  }
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label>
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={
                    registerEmail
                  }
                  onChange={(
                    event
                  ) =>
                    setRegisterEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={
                    registerPassword
                  }
                  onChange={(
                    event
                  ) =>
                    setRegisterPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      handleRegister();
                    }
                  }}
                />

                <small className="field-hint">
                  Minimum 6 characters
                </small>
              </div>

              <div className="form-group">
                <label>
                  Preferred language
                </label>

                <select
                  value={
                    registerLanguage
                  }
                  onChange={(
                    event
                  ) =>
                    setRegisterLanguage(
                      event.target.value
                    )
                  }
                >
                  <option value="Hindi">
                    Hindi
                  </option>

                  <option value="English">
                    English
                  </option>

                  <option value="Bengali">
                    Bengali
                  </option>

                  <option value="Odia">
                    Odia
                  </option>

                  <option value="Santali">
                    Santali
                  </option>
                </select>
              </div>

              <button
                type="button"
                className="login-button"
                disabled={
                  registerLoading
                }
                onClick={
                  handleRegister
                }
              >
                {registerLoading
                  ? "Creating account..."
                  : "Create Account →"}
              </button>

              {message && (
                <div
                  className={`login-message ${
                    messageType
                  }`}
                >
                  <span>
                    {messageType ===
                    "error"
                      ? "⚠"
                      : "✓"}
                  </span>

                  <span>
                    {message}
                  </span>
                </div>
              )}

              <div className="auth-switch">
                <span>
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={
                    switchToLogin
                  }
                >
                  Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      handleLogin();
                    }
                  }}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      handleLogin();
                    }
                  }}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="button"
                className="login-button"
                disabled={loading}
                onClick={
                  handleLogin
                }
              >
                {loading
                  ? "Signing in..."
                  : "Sign In →"}
              </button>

              {message && (
                <div
                  className={`login-message ${
                    messageType
                  }`}
                >
                  <span>
                    {messageType ===
                    "error"
                      ? "⚠"
                      : "✓"}
                  </span>

                  <span>
                    {message}
                  </span>
                </div>
              )}

              <div className="auth-switch">
                <span>
                  Don't have an account?
                </span>

                <button
                  type="button"
                  onClick={
                    switchToRegister
                  }
                >
                  Create Account
                </button>
              </div>
            </>
          )}

          <div className="login-footer">
            AI-Powered Vernacular
            Education Platform{" "}
            <span>•</span>{" "}
            SIH26042
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// PROFESSIONAL SCORE RING
// =========================================================

function ScoreRing({
  score,
  passed,
}) {
  const safeScore =
    clampPercentage(score);

  const size = 210;
  const strokeWidth = 18;
  const center = size / 2;

  const radius =
    (size - strokeWidth) / 2;

  const circumference =
    2 * Math.PI * radius;

  const progressLength =
    (safeScore / 100) *
    circumference;

  const remainingLength =
    circumference -
    progressLength;

  return (
    <div
      className={`score-ring ${
        passed
          ? "score-ring-passed"
          : "score-ring-failed"
      }`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Quiz score ${safeScore}%`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(15, 23, 42, 0.09)"
          strokeWidth={
            strokeWidth
          }
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={
            passed
              ? "#5b3df5"
              : "#f59e0b"
          }
          strokeWidth={
            strokeWidth
          }
          strokeLinecap="round"
          strokeDasharray={`${progressLength} ${remainingLength}`}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition:
              "stroke-dasharray 900ms ease",
          }}
        />
      </svg>

      <div className="score-ring-content">
        <strong>
          {safeScore}%
        </strong>

        <span>
          Score
        </span>
      </div>
    </div>
  );
}

// =========================================================
// APP SHELL
// =========================================================

function AppShell({
  dashboard,
  active,
  onDashboard,
  onSubjects,
  onTranslation,
  onAchievements,
  onCertificates,
  onLogout,
  children,
}) {
  const initials = (
    dashboard?.name ||
    "User"
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase()
    )
    .join("");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            VE
          </div>

          <div>
            <strong>
              Vernacular
            </strong>

            <span>
              Education
            </span>
          </div>
        </div>

        <div className="sidebar-section-label">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={
              active ===
              "dashboard"
                ? "active"
                : ""
            }
            onClick={
              onDashboard
            }
          >
            ⌂{" "}
            <span>
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className={
              active ===
              "subjects"
                ? "active"
                : ""
            }
            onClick={
              onSubjects
            }
          >
            ▣{" "}
            <span>
              Subjects
            </span>
          </button>

          <button
            type="button"
            className={
              active ===
              "translation"
                ? "active"
                : ""
            }
            onClick={
              onTranslation
            }
          >
            ◎{" "}
            <span>
              Translation
            </span>
          </button>
        </nav>

        <div className="sidebar-section-label">
          ACHIEVEMENTS
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={
              active ===
              "achievements"
                ? "active"
                : ""
            }
            onClick={
              onAchievements
            }
          >
            ♛{" "}
            <span>
              Achievements
            </span>
          </button>

          <button
            type="button"
            className={
              active ===
              "certificates"
                ? "active"
                : ""
            }
            onClick={
              onCertificates
            }
          >
            ◇{" "}
            <span>
              Certificates
            </span>
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {initials || "U"}
          </div>

          <div className="sidebar-user-text">
            <strong>
              {dashboard?.name ||
                "Learner"}
            </strong>

            <span>
              {dashboard?.language ||
                "Hindi"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          ↪{" "}
          <span>
            Logout
          </span>
        </button>

        <div className="sidebar-footer">
          SIH26042 · Smart Education
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-label">
              VERNACULAR EDUCATION
              PLATFORM
            </span>

            <strong>
              Mother-Tongue-Based
              Primary Learning
            </strong>
          </div>

          <div className="topbar-user">
            <div className="topbar-avatar">
              {initials || "U"}
            </div>

            <div>
              <strong>
                {dashboard?.name ||
                  "Learner"}
              </strong>

              <span>
                Student
              </span>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

// =========================================================
// PAGE HEADER
// =========================================================

function PageHeader({
  eyebrow,
  title,
  description,
  icon,
}) {
  return (
    <div className="page-header">
      <div className="page-header-icon">
        {icon}
      </div>

      <div>
        <span className="panel-kicker">
          {eyebrow}
        </span>

        <h1>{title}</h1>

        <p>
          {description}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  label,
  value,
  tone = "blue",
  clickable = false,
  onClick,
}) {
  const content = (
    <>
      <div
        className={`stat-icon ${tone}`}
      >
        {icon}
      </div>

      <div className="stat-copy">
        <span>
          {label}
        </span>

        <strong>
          {value ?? 0}
        </strong>
      </div>

      {clickable && (
        <span className="stat-arrow">
          →
        </span>
      )}
    </>
  );

  return clickable ? (
    <button
      type="button"
      className="stat-card clickable"
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <article className="stat-card">
      {content}
    </article>
  );
}

// =========================================================
// LOADING CARD
// =========================================================

function LoadingCard({
  icon,
  title,
}) {
  return (
    <div className="loading-card">
      <div className="loading-spinner">
        {icon}
      </div>

      <h2>{title}</h2>

      <p>
        Please wait while we load
        your data.
      </p>
    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {icon}
      </div>

      <h2>{title}</h2>

      <p>{text}</p>
    </div>
  );
}

// =========================================================
// ALERT
// =========================================================

function Alert({
  type = "error",
  children,
}) {
  return (
    <div
      className={`alert ${type}`}
      role="alert"
    >
      <span className="alert-icon">
        {type === "error"
          ? "⚠"
          : "✓"}
      </span>

      <span>
        {children}
      </span>
    </div>
  );
}

export default App;