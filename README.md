# nextjs-codebase
Code Base Nextjs

flowchart TD
  A[Đọc session cookie] --> B{Có access_token?}
  B -->|Không| Z[Xóa session → /login]
  B -->|Có| C[GET /api/current_user]
  C -->|OK| D[setBearerToken → next]
  C -->|Lỗi khác 401| E[Throw lỗi]
  C -->|401 Unauthorized| F{Có refresh_token?}
  F -->|Không| Z
  F -->|Có| G[POST /api/refresh_token]
  G -->|Fail| Z
  G -->|OK| H[GET /api/current_user lại]
  H -->|OK| I[Lưu token mới vào session → next]
  H -->|Fail| Z
