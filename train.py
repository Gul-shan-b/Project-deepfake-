import torch
import pandas as pd
from transformers import RobertaTokenizer, GPT2LMHeadModel, GPT2TokenizerFast
from torch.utils.data import Dataset, DataLoader
from saved_model.model import LinguaForgeX

# Load dataset
df = pd.read_csv("dataset/combined_augmented.csv")

tokenizer = RobertaTokenizer.from_pretrained("roberta-base")

# Load GPT2 for perplexity
gpt2 = GPT2LMHeadModel.from_pretrained("gpt2")
gpt2_tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")

def get_perplexity(text):
    enc = gpt2_tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        outputs = gpt2(enc.input_ids, labels=enc.input_ids)
    return torch.exp(outputs.loss)

class CustomDataset(Dataset):
    def __init__(self, df):
        self.df = df

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        text = self.df.iloc[idx]['text']

        enc = tokenizer(
            text,
            padding='max_length',
            truncation=True,
            max_length=256,
            return_tensors="pt"
        )

        return {
            "input_ids": enc['input_ids'].squeeze(),
            "attention_mask": enc['attention_mask'].squeeze(),
            "perplexity": get_perplexity(text),
            "ai_label": torch.tensor(self.df.iloc[idx]['ai_label']),
            "misinfo_label": torch.tensor(self.df.iloc[idx]['misinfo_label'])
        }

dataset = CustomDataset(df)
loader = DataLoader(dataset, batch_size=8, shuffle=True)

model = LinguaForgeX()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
loss_fn = torch.nn.CrossEntropyLoss()

print("Training started...")

for epoch in range(3):
    model.train()

    for batch in loader:
        optimizer.zero_grad()

        ai_out, mis_out = model(
            batch['input_ids'].to(device),
            batch['attention_mask'].to(device),
            batch['perplexity'].to(device)
        )

        loss = loss_fn(ai_out, batch['ai_label'].to(device)) + \
               loss_fn(mis_out, batch['misinfo_label'].to(device))

        loss.backward()
        optimizer.step()

    print(f"Epoch {epoch+1} completed")

torch.save(model.state_dict(), "model/linguaforge_x.pth")

print("✅ Training complete. Model saved!")