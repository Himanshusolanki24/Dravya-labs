# Dravya Labs 

**"AI-Powered Ayurvedic Wellness, Rooted in Tradition, Powered by Intelligence"**

Dravya Labs is an AI-powered Ayurvedic wellness platform that combines ancient Indian health wisdom with modern AI technology to provide safe, personalized, educational wellness guidance. It determines your natural body type (Prakriti), analyzes current dosha imbalances (Vikriti) based on symptoms, and recommends herbs, dietary habits, and lifestyle changes using verified classical Ayurvedic knowledge.

> **Disclaimer:** This platform provides *educational wellness guidance only*. It is NOT designed to diagnose diseases, replace medical doctors, or prescribe medicines. We ALWAYS recommend professional consultation for serious symptoms.

---

## 🏗️ Core Architecture: Multi-Agent System (A2A)

Dravya Labs does not rely on a single monolithic AI. Instead, an **Agent-to-Agent (A2A)** architecture allows multiple specialized AI agents to collaborate:

1. **Prakriti Agent**: Determines natural body constitution (Vata, Pitta, Kapha) based on physical traits and preferences.
2. **Vikriti Agent**: Detects which dosha is currently imbalanced based on active symptoms using the **Autoimmune**, **Brahma**, and **Diabetes** ML models for precise symptom detection.
3. **Dravya (Herb) Agent**: Decides which herbs are needed using the dedicated **Herbs** ML model to retrieve detailed dosage and properties.
4. **Ahara (Diet) Agent**: Creates a personalized dietary plan of foods to eat and avoid based on doshas and seasons using the **Dietplain** ML model.
5. **Safety Agent**: A critical gatekeeper that validates every recommendation. It blocks dangerous herb combinations or contraindications (e.g., pregnancy-unsafe herbs).
6. **Vaidya AI (Orchestrator)**: The "Head Doctor" that coordinates all other agents and builds the final, safe, and formatted response for the user powered by Mistral Large.

---

## 🧠 Grounded Intelligence: RAG & Special ML Models

To prevent the AI from "hallucinating" (making up incorrect medical advice), Dravya Labs uses strict protocols:

### API Database Constraints
The LLM (Language Model) **thinks**, but it **does not fetch data**. Instead, it talks to backend APIs. 
- The AI requests information (e.g., "Get herbs for Pitta headache").
- The backend queries a verified Postgres database.
- The backend returns only verified, structured JSON data.
- **Result:** The AI builds answers using strictly verified database entries, not imagination.

### Retrieval-Augmented Generation (RAG)
For deeper explanations, the platform taps into classical Ayurvedic texts (like *Charaka Samhita* and *Sushruta Samhita*).
- Texts are embedded as vectors into a **Pinecone database**.
- When a medical query runs, the system searches the database for relevant passages first.
- The AI uses these retrieved passages to formulate a thoroughly grounded response.

---

## 🔄 How the Platform Works: The Data Flow (Input to Output)

Here is a detailed, step-by-step exact look at how input becomes a final output in Dravya Labs:

1. **User Input:** The user submits a prompt with their symptoms (e.g., "I've been having headaches and acid reflux for 3 days").
2. **Encryption:** The backend encrypts the user's health profile (using military-grade XSalsa20-Poly1305 via libsodium). This ensures that data at rest is totally unreadable.
3. **Context Distillation:** To protect privacy, personal identifiers (name, email) are stripped. Only the medical context (e.g., "headache, acid reflux, male, 24") is sent into the AI Core's operational memory.
4. **Agent Reasoning & ML Model Inference:** The **Vaidya AI (Orchestrator)** receives the query and triggers its specialist agents, who query the specific ML models concurrently:
   - *Symptoms Agent* passes the profile through the **Autoimmune, Diabetes, PCOS, Obesity, Skin, and Hair ML Models** to detect disease risk flags.
   - *Vikriti Agent* uses the symptoms and the **Brahma ML Model**'s dosha classification to determine the core Ayurvedic imbalance (e.g., Pitta aggravation).
   - *Herb Agent* maps the imbalance and risks against the **Herbs ML Model** to prescribe specific grounded botanicals.
   - *Diet Agent* evaluates what a Pitta-aggravated diet should exclude using the **Dietplain ML Model**.
5. **Data Integration:** The orchestrator agent aggregates the successful predictions from all 10+ concurrent model validations.
6. **Safety Validation:** ALL generated recommendations and ML flags are sent to the **Safety Agent**. The Safety Agent evaluates the aggregated risk scores and contraindications. Anything unsafe or marked as "critical" risk triggers an emergency medical warning, blocking herbal output.
7. **Final Output Generation:** The **Vaidya AI** orchestrates all the approved data into a comprehensive report. It structures the response into analysis, remedies, herbs, diet, and lifestyle components, injecting mandatory medical disclaimers.
8. **Encrypted Storage:** The session context, ML predictions, and recommendations are encrypted and securely stored to inform future consultations seamlessly.

---

## 🛠️ Tech Stack

- **AI Engine**: Python 3.11+, FastAPI, Mistral Large
- **Vector DB & Embeddings**: Pinecone, sentence-transformers (HF)
- **Encryption**: PyNaCl (libsodium) for XSalsa20-Poly1305 encryption
- **Backend**: TypeScript, Express.js, PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + JWT
- **Frontend**: Next.js 16 (React 19), Tailwind CSS 4, Radix UI, Recharts
