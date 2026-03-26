# Clean Code Guidelines
 
This document turns Clean Code principles into working rules for this project.
 
## Core rule 
Code must be easy to read, easy to change, and hard to misunderstand.
 
## Naming 
- Use clear business names, not vague short names. 
- Prefer names that explain intent, not implementation trivia. 
- Avoid misleading abbreviations unless they are standard in the domain.
 
## Functions and components 
- Keep functions and React components focused on one responsibility. 
- Prefer small units with obvious inputs and outputs. 
- Extract repeated logic only when the extraction improves clarity.
 
## Structure 
- Keep feature logic close to the screen or module that owns it. 
- Avoid giant files when they mix unrelated responsibilities. 
- Prefer explicit flows over clever abstractions.
 
## Comments 
- Comments should explain why, not restate what the code already says. 
- If better naming can replace a comment, improve the code first.
 
## Error handling 
- Handle failures explicitly and avoid hidden silent behavior. 
- Make risky operations visible in code and easy to audit.
 
## Frontend-specific rules 
- Keep React state local unless there is a real shared-state need. 
- Do not create global abstractions too early. 
- Keep route-level composition understandable. 
- Prefer UI consistency and predictable data flow over over-engineered patterns.
 
## Project expectation 
Every future code change should be reviewed against readability, separation of concerns, naming quality, and maintainability before it is considered done.
