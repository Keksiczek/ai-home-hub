# AI Home Hub – API Contract

Base URL: `http://<host>:8000/api`

Interactive docs (Swagger UI): `http://<host>:8000/docs`

---

## POST /api/upload

Upload a file to the hub.

**Content-Type:** `multipart/form-data`

### Request

| Field | Type   | Description            |
|-------|--------|------------------------|
| file  | binary | Binary content of the file to upload |

### Response 200

```json
{
  "id": "string",
  "filename": "string"
}
```

| Field    | Type   | Description                        |
|----------|--------|------------------------------------|
| id       | string | UUID4 assigned to the uploaded file |
| filename | string | Original filename                  |

### Notes

- Files are stored in `backend/data/uploads/<id>__<original_filename>`.
- The directory is created automatically if it does not exist.
- No database – pure filesystem storage at this stage.

---

## POST /api/chat

Send a message to the LLM with optional file context.

**Content-Type:** `application/json`

### Request body

```json
{
  "message": "string",
  "mode": "general",
  "context_file_ids": ["optional-id-1", "optional-id-2"]
}
```

| Field            | Type         | Default   | Description                                    |
|------------------|--------------|-----------|------------------------------------------------|
| message          | string       | required  | User's question or prompt                      |
| mode             | string       | `general` | Prompt profile (`general`, `powerbi`, `lean`)  |
| context_file_ids | list[string] | `[]`      | IDs of previously uploaded files for context  |

### Response 200

```json
{
  "reply": "string",
  "meta": {
    "mode": "general",
    "provider": "stub",
    "latency_ms": 0
  }
}
```

| Field           | Type    | Description                          |
|-----------------|---------|--------------------------------------|
| reply           | string  | LLM response (stub for now)          |
| meta.mode       | string  | Mode used for this request           |
| meta.provider   | string  | LLM provider identifier (`stub`)     |
| meta.latency_ms | integer | Processing time in milliseconds      |

### Notes

- Currently a stub: reply is `MODE=<mode>, CONTEXT_FILES=<n>, MESSAGE=<message>`.
- Replace `LLMService.generate()` in `services/llm_service.py` to add a real LLM.

---

## POST /api/actions/openclaw

Trigger a predefined OpenClaw action.

**Content-Type:** `application/json`

### Request body

```json
{
  "action": "string",
  "params": {
    "key": "value"
  }
}
```

| Field  | Type   | Default  | Description                             |
|--------|--------|----------|-----------------------------------------|
| action | string | required | Action name (see known actions below)   |
| params | object | `{}`     | Arbitrary parameters for the action     |

**Known actions (stub only, not yet implemented):**

- `start_whatsapp_agent`
- `restart_telegram_agent`
- `run_workflow`

### Response 200

```json
{
  "status": "ok|error|not_implemented",
  "detail": "optional human-readable detail",
  "data": {}
}
```

| Field  | Type   | Description                                       |
|--------|--------|---------------------------------------------------|
| status | string | `ok`, `error`, or `not_implemented`               |
| detail | string | Human-readable explanation (optional)             |
| data   | object | Additional response payload (empty for now)       |

### Notes

- Unknown action → `status="error"`, `detail="Unknown action"`.
- Known action → `status="not_implemented"`, `detail="Action defined but not yet implemented"`.
- Replace `OpenClawService.run_action()` in `services/openclaw_service.py` to wire up real calls.
