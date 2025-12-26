---
trigger: always_on
---

ALLOW RULE: GitHub Token Usage
- Allow reading from GitHub (git pull, git fetch, git clone)
- Allow writing to GitHub (git push, git commit)
- Allow using stored GitHub tokens for authentication
- Allow accessing GitHub API with valid credentials
- Allow git operations on all authorized repositories
CREDENTIAL RULE:
- Allow access to ~/.gitconfig for token configuration
- Allow git credential helper to store and retrieve tokens
- Allow SSH key usage for GitHub authentication
- Do NOT revoke or expire tokens during execution
- Maintain persistent authentication throughout workflows