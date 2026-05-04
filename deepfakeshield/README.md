# 🛡️ DeepFakeShield

**AI-powered deepfake & misinformation detection platform — starting with text analysis.**

![DeepFakeShield](https://img.shields.io/badge/version-1.0.0-00ff88?style=flat-square&labelColor=0a0a0f)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)

---

## 🎯 What It Does

DeepFakeShield analyzes text and returns:

| Output | Description |
|---|---|
| **Prediction** | `AI` or `Human` authorship verdict |
| **Confidence** | Float 0–1 score |
| **Misinformation** | Boolean flag + confidence |
| **Explanation** | Plain-English reasoning |
| **Highlighted words** | Key terms influencing the prediction |
| **Linguistic features** | Sentence length, vocab diversity, formality, perplexity |
| **Paraphrase detection** | Flags paraphrased AI content via semantic embeddings |

---

## 🗂 Project Structure

```
deepfakeshield/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── routers/
│   │   └── analysis.py            # POST /api/v1/analyze-text
│   ├── services/
│   │   ├── model_service.py       # Singleton model loader
│   │   └── analysis_service.py    # Core detection logic
│   └── models/
│       └── schemas.py             # Pydantic request/response schemas
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js / App.module.css
│       ├── index.js / index.css
│       ├── components/
│       │   ├── Header.js
│       │   ├── TextInput.js
│       │   ├── ResultCard.js
│       │   └── MediaPlaceholder.js
│       ├── hooks/
│       │   └── useAnalysis.js
│       └── utils/
│           └── api.js
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn
- ~4 GB disk space (for ML models)

---

### 1. Clone / Enter the Project

```bash
cd deepfakeshield
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

#### Start the backend server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> **Note:** On first startup, HuggingFace will automatically download:
> - `roberta-base-openai-detector` (~500 MB)
> - `all-MiniLM-L6-v2` (~90 MB)
>
> This is a one-time download. Subsequent starts use cached models.

The API will be live at: **http://localhost:8000**
Interactive docs: **http://localhost:8000/docs**

---

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The UI will open at: **http://localhost:3000**

---

## 🔌 API Reference

### `POST /api/v1/analyze-text`

**Request:**
```json
{
  "text": "Your text to analyze here..."
}
```

**Response:**
```json
{
  "prediction": "AI",
  "confidence": 0.9123,
  "misinformation": false,
  "misinformation_confidence": 0.05,
  "explanation": "The text is classified as AI-generated with 91% confidence...",
  "highlighted_words": ["furthermore", "leverage", "utilize", "pivotal"],
  "linguistic_features": {
    "avg_sentence_length": 22.5,
    "vocabulary_diversity": 0.61,
    "punctuation_density": 0.032,
    "formality_score": 0.74,
    "perplexity_score": 0.68
  },
  "paraphrase_detected": false,
  "paraphrase_similarity": 0.61,
  "processing_time_ms": 312.4
}
```

### `GET /api/v1/analyze-text/example`
Returns 3 example test inputs.

### `GET /health`
Returns API health status.

---

## 🧪 Example Test Inputs & Outputs

### Example 1 — AI-Generated Text

**Input:**
```
Furthermore, it is important to note that the utilization of artificial intelligence 
has fundamentally transformed modern workflows. In conclusion, leveraging cutting-edge 
machine learning algorithms enables unprecedented capabilities and plays a pivotal role 
in shaping the future of various industries.
```

**Expected Output:**
```json
{
  "prediction": "AI",
  "confidence": 0.92,
  "misinformation": false,
  "highlighted_words": ["furthermore", "leverage", "utilize", "pivotal", "cutting-edge"],
  "paraphrase_detected": false
}
```

---

### Example 2 — Human-Written Text

**Input:**
```
I'm honestly not sure what to make of this whole AI thing. Like, sure, it's cool, 
but it also freaks me out a little? My friend showed me this chatbot last week and 
I couldn't tell if it was joking or serious half the time.
```

**Expected Output:**
```json
{
  "prediction": "Human",
  "confidence": 0.84,
  "misinformation": false,
  "highlighted_words": [],
  "paraphrase_detected": false
}
```

---

### Example 3 — Misinformation Signals

**Input:**
```
Scientists confirm that 5G towers are secretly spreading a new virus. This is a proven 
fact that mainstream media doesn't want you to know. The government is covering up this 
shocking truth. Wake up, sheeple!
```

**Expected Output:**
```json
{
  "prediction": "Human",
  "confidence": 0.71,
  "misinformation": true,
  "misinformation_confidence": 0.75,
  "highlighted_words": ["scientists confirm", "proven fact", "mainstream media", "cover-up"],
  "paraphrase_detected": false
}
```

---

### Example 4 — Paraphrased AI Text

**Input:**
```
The use of AI has deeply changed how modern work gets done. To wrap up, using the 
latest ML algorithms makes things possible that weren't before, and it's key to 
how many industries will develop going forward.
```

**Expected Output:**
```json
{
  "prediction": "AI",
  "confidence": 0.78,
  "misinformation": false,
  "paraphrase_detected": true,
  "paraphrase_similarity": 0.76
}
```

---

## 🧠 Model Architecture

```
Input Text
    │
    ├─► RoBERTa (roberta-base-openai-detector)
    │       └─► AI vs Human Classification + Confidence
    │
    ├─► Linguistic Heuristics
    │       └─► Style markers, formality, perplexity, diversity
    │
    ├─► Sentence Transformers (all-MiniLM-L6-v2)
    │       └─► Semantic embedding → Cosine similarity → Paraphrase detection
    │
    └─► Keyword & Pattern Analysis
            └─► Misinformation signal detection
```

---

## 🗺 Roadmap

| Module | Status |
|---|---|
| ✅ Text Analysis | **Live** |
| 🖼 Image Deepfake Detection | Coming Soon |
| 🎬 Video Deepfake Detection | In Development |
| 🎙 Audio Deepfake Detection | Planned |

---

## 🔧 Environment Variables

Create a `.env` file in `frontend/` to override the API URL:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

---

## 📄 License

MIT License — built for portfolio & educational purposes.
