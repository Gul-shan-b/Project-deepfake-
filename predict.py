from transformers import pipeline

classifier = pipeline("text-classification", model="roberta-base-openai-detector")

def predict(text):
    result = classifier(text)[0]

    return {
        "ai_generated": True if result["label"] == "Fake" else False,
        "confidence": float(result["score"])
    }