# APEX V1

APEX V1 is the minimum local MVP for the R1 Meeting Intelligence workflow.

It supports:

- Upload `.txt`, `.md`, and `.docx` meeting materials.
- Create an R1 route run.
- Generate structured meeting intelligence output.
- Edit the generated Markdown.
- Export Markdown.
- Record Failure Cards for quality review.

## Local Setup

```bash
npm install
npm run db:generate
sqlite3 prisma/dev.db < prisma/init.sql
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment

Copy `.env.example` to `.env.local` and `.env`.

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
FILE_STORAGE_PATH="./storage"
```

If `OPENAI_API_KEY` is empty, the app returns a local placeholder output so the full product loop can still be tested.

## MVP Scope

The current version intentionally focuses on one workflow:

```text
Upload transcript
-> Create R1 route run
-> Generate structured notes
-> Edit output
-> Export Markdown
-> Record Failure Card
```

Deferred:

- Audio transcription
- PDF parsing
- R2 Earnings Workflow
- R3 Research Desk
- Multi-workspace permissions
- pgvector retrieval
- Production deployment
