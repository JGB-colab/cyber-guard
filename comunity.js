// community.js

document.addEventListener('DOMContentLoaded', () => {
    // ========== QUIZ ==========
    const quizData = [
        {
            question: "Qual é uma boa prática para criar senhas seguras?",
            answers: [
                { text: "Usar datas de aniversário", correct: false },
                { text: "Usar uma combinação de letras, números e símbolos", correct: true },
                { text: "Usar a mesma senha para tudo", correct: false },
                { text: "Anotar as senhas no papel", correct: false }
            ]
        },
        {
            question: "O que é phishing?",
            answers: [
                { text: "Um tipo de vírus que destrói arquivos", correct: false },
                { text: "Uma tentativa de enganar para roubar dados pessoais", correct: true },
                { text: "Um firewall para proteger redes", correct: false },
                { text: "Um software antivírus", correct: false }
            ]
        },
        {
            question: "O que significa 2FA (autenticação em dois fatores)?",
            answers: [
                { text: "Usar senha e login diferentes", correct: false },
                { text: "Verificar identidade com dois métodos diferentes", correct: true },
                { text: "Usar duas senhas diferentes", correct: false },
                { text: "Trocar a senha a cada dois dias", correct: false }
            ]
        }
    ];

    const questionEl = document.getElementById('question');
    const answersEl = document.getElementById('answers');
    const nextBtn = document.getElementById('next-btn');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const quizContainer = document.getElementById('quiz-container');
    const restartBtn = document.getElementById('restart-btn');

    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswer = null;

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        selectedAnswer = null;
        if (resultContainer) resultContainer.style.display = 'none';
        if (quizContainer) quizContainer.style.display = 'block';
        if (nextBtn) nextBtn.disabled = true;
        showQuestion();
    }

    function showQuestion() {
        if (!questionEl || !answersEl || !quizData[currentQuestionIndex]) return;
        nextBtn.disabled = true;
        selectedAnswer = null;
        const currentQuestion = quizData[currentQuestionIndex];
        questionEl.innerText = currentQuestion.question;
        answersEl.innerHTML = '';

        currentQuestion.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('answer-btn');
            button.addEventListener('click', () => selectAnswer(button, answer.correct));
            answersEl.appendChild(button);
        });
    }

    function selectAnswer(button, isCorrect) {
        if (selectedAnswer) return;
        selectedAnswer = button;

        if (isCorrect) {
            score++;
            button.classList.add('selected', 'correct');
        } else {
            button.classList.add('selected', 'incorrect');
        }

        Array.from(answersEl.children).forEach(btn => btn.disabled = true);
        nextBtn.disabled = false;
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizData.length) {
                showQuestion();
            } else {
                showResult();
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', startQuiz);
    }

    function showResult() {
        if (!resultText || !resultContainer || !quizContainer) return;

        quizContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultText.innerText = `Você acertou ${score} de ${quizData.length} perguntas.`;

        if (score === quizData.length) {
            resultText.innerText += " Parabéns! Você está muito bem protegido.";
        } else if (score >= quizData.length / 2) {
            resultText.innerText += " Bom trabalho! Mas sempre fique atento às ameaças.";
        } else {
            resultText.innerText += " Recomendamos revisar as dicas e cursos para melhorar sua segurança.";
        }
    }

    if (questionEl && answersEl && nextBtn && resultContainer && resultText && quizContainer && restartBtn) {
        startQuiz();
    }

    // ========== COMUNIDADE ==========
    const communityForm = document.getElementById('community-form');
    const communityList = document.getElementById('community-list');

    function createQuestionItem(userName, userQuestion) {
        const newQuestionItem = document.createElement('li');
        newQuestionItem.innerHTML = `<strong>${userName}:</strong> ${userQuestion}`;
        return newQuestionItem;
    }

    function showTemporaryMessage(msg) {
        let msgEl = document.getElementById('community-msg');
        if (!msgEl) {
            msgEl = document.createElement('p');
            msgEl.id = 'community-msg';
            msgEl.style.color = '#28a745';
            msgEl.style.fontWeight = '600';
            msgEl.style.marginTop = '10px';
            communityForm.parentNode.insertBefore(msgEl, communityForm.nextSibling);
        }
        msgEl.textContent = msg;
        setTimeout(() => {
            msgEl.textContent = '';
        }, 4000);
    }

    function loadQuestions() {
        if (!communityList) return;
        const questions = JSON.parse(localStorage.getItem('communityQuestions')) || [];
        questions.forEach(q => {
            const item = createQuestionItem(q.userName, q.userQuestion);
            communityList.appendChild(item);
        });
    }

    function saveQuestion(userName, userQuestion) {
        const questions = JSON.parse(localStorage.getItem('communityQuestions')) || [];
        questions.unshift({ userName, userQuestion });
        localStorage.setItem('communityQuestions', JSON.stringify(questions));
    }

    if (communityForm && communityList) {
        communityForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const userName = this.querySelector('#user-name').value.trim();
            const userQuestion = this.querySelector('#user-question').value.trim();

            if (!userName || !userQuestion) {
                alert('Por favor, preencha seu nome e a pergunta.');
                return;
            }

            const newQuestionItem = createQuestionItem(userName, userQuestion);
            communityList.appendChild(newQuestionItem);

            saveQuestion(userName, userQuestion);
            this.reset();
            showTemporaryMessage('✅ Obrigado por compartilhar! Em breve alguém da comunidade vai te responder.');
        });

        loadQuestions();
    }
});
