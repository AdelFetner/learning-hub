# Mission: HTTP Status-Code Classes

## Why
Bruno debugs services and APIs at work. When a request fails, the status code is the first signal — knowing its class at a glance says whose side the failure is on (client vs server) and what to check next, before reading a single log line.

## Success looks like
- Given any status code, instantly name its class and whose side the failure is on.
- Triage a failing request in logs or dev tools: 4xx → inspect the request; 5xx → inspect the server or its upstream.
- Distinguish the commonly-confused pairs: 401 vs 403, 502 vs 504, 301 vs 302.

## Constraints
- Mini-lessons only — minutes per session, not hours.
- Spaced repetition is delegated to Anki (cards proposed at lesson end).

## Out of scope
- Memorising the full registry of every status code.
- HTTP semantics beyond status codes (headers, caching, content negotiation).
