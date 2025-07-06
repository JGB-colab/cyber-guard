// Importa o nome correto da classe para a versão antiga
import { GoogleGenAI } from "@google/genai";

// A configuração do Vite (vite.config.ts) irá injetar a chave de API aqui.
const API_KEY = process.env.GEMINI_API_KEY;

// Type definition (continua a mesma)
interface ScamAnalysis {
    risk: 'Baixo' | 'Medio' | 'Alto';
    summary: string;
    recommendations: string[];
}

document.addEventListener('DOMContentLoaded', () => {
    const scamForm = document.getElementById('scam-form') as HTMLFormElement;
    const scamInput = document.getElementById('scam-input') as HTMLTextAreaElement;
    const resultContainerApi = document.getElementById('detector-result-container') as HTMLDivElement;

    if (!scamForm) return;

    if (!API_KEY) {
        displayError("A chave da API não foi configurada. O detector de golpes está desativado.");
        const submitButton = scamForm.querySelector('button[type="submit"]');
        if (submitButton) submitButton.setAttribute('disabled', 'true');
        if (scamInput) {
            scamInput.setAttribute('disabled', 'true');
            scamInput.placeholder = "Funcionalidade desativada. Configure a API_KEY.";
        }
        return;
    }
    
    // CORREÇÃO 1: O construtor espera um objeto de opções.
    const genAI = new GoogleGenAI({ apiKey: API_KEY });

    scamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputText = scamInput.value.trim();
        if (!inputText) {
            displayError("Por favor, insira um texto para ser analisado.");
            return;
        }
        showLoader();

        try {
            const prompt = `
                Você é um especialista em cibersegurança chamado CyberGuard. Sua tarefa é analisar o texto a seguir em busca de sinais de golpes, phishing ou malware.
                O texto para análise é: "${inputText}".
                
                Responda em formato JSON, seguindo estritamente esta estrutura:
                {
                  "risk": "...", // Avalie o risco como "Baixo", "Medio" ou "Alto"
                  "summary": "...", // Forneça um resumo conciso da sua análise em português.
                  "recommendations": ["...", "..."] // Dê pelo menos duas recomendações claras e práticas em português.
                }
                
                Seja direto e claro. Não adicione nenhuma explicação ou formatação fora do objeto JSON.
            `;

            // CORREÇÃO 2: A chamada é feita em 'genAI.models.generateContent'
            // e 'responseMimeType' vai dentro de um objeto 'config'.
            const result = await genAI.models.generateContent({
                model: "gemini-1.5-flash", 
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                },
            });

            // A resposta nesta versão está diretamente em `result.text`
            const jsonStr = String(result.text);
    
            const analysisResult: ScamAnalysis = JSON.parse(jsonStr);
            displayResult(analysisResult);

        } catch (error) {
            console.error("Erro ao analisar o conteúdo:", error);
            displayError("Não foi possível analisar o conteúdo. A API pode estar indisponível ou a resposta foi inválida. Tente novamente.");
        }
    });

    // Funções auxiliares (sem alteração)
 
    function showLoader() {
        if (resultContainerApi) {
            resultContainerApi.innerHTML = '<div class="loader"></div>';
        }
    }

    function displayError(message: string) {
        if(resultContainerApi) resultContainerApi.innerHTML = `<div class="error-message">${message}</div>`;
    }

    function displayResult(result: ScamAnalysis) {
        if (!result || !result.risk || !result.summary || !result.recommendations) {
            displayError("A resposta da IA não seguiu o formato esperado. Tente novamente.");
            return;
        }
        console.log(result)
        console.log(resultContainerApi)
        const riskLevelClass = `risk-${result.risk.toLowerCase()}`;
        const recommendationsHTML = result.recommendations.map(rec => `<li>${rec}</li>`).join('');
        const resultHTML = `
            <div class="result-card">
                <div class="result-header ${riskLevelClass}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span>Nível de Risco: ${result.risk}</span>
                </div>
                <div class="result-body">
                    <h3>Análise</h3>
                    <p>${result.summary}</p>
                    <h3>Recomendações</h3>
                    <ul>${recommendationsHTML}</ul>
                </div>
            </div>`;
        if(resultContainerApi) resultContainerApi.innerHTML = resultHTML;
    }
});