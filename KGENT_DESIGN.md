# Kgent: Multi-Agent AI Orchestration Protocol — Design Document (Beta 0.10)

## 1. Overall Architecture
Kgent is designed as a distributed, scalable orchestration platform rather than a monolithic chatbot wrapper. The architecture consists of several core components:
- **Core Orchestrator Engine (The Runtime):** Manages the lifecycle of workspaces, sessions, and agents. It handles the initial request, breaks it down, and assigns a Leader Agent.
- **Provider Abstraction Layer (Adapter System):** A uniform API layer that normalizes requests to OpenAI, Anthropic, Gemini, DeepSeek, Ollama, and other local open-source models.
- **Agent Mesh Network:** The interconnected web of active agents working within a session. This includes the Leader Agent and Specialized Agents.
- **Multi-Layer Memory Engine:** The hierarchical data storage system (Personal, Link, Group, Global).
- **Tool Execution Sandbox:** An isolated, secure environment where agents execute tools (web search, CLI, code execution).
- **Client Interfaces:** The CLI and Web UI that connect to the Core Engine via WebSocket and REST APIs.

## 2. Protocol Design
The Kgent Protocol defines how agents structure their interactions and execution:
- **Capability Handshake Protocol:** Upon joining a cluster, models broadcast a standardized JSON payload detailing their strengths, context windows, cost parameters, and latency profiles.
- **Task Delegation Protocol (TDP):** The standard for how the Leader breaks down objectives into DAGs (Directed Acyclic Graphs) of sub-tasks and assigns them.
- **Inter-Agent Messaging Protocol (IAMP):** Defines the structured format for peer-to-peer agent communication, including fields for `sender_role`, `target_role`, `intent` (e.g., critique, query, debug), and `payload`.
- **Escalation Protocol:** A predefined mechanism for specialized agents to pause execution and request human or Leader intervention when confidence drops below a defined threshold.

## 3. Memory Engine Structure
A multi-layered vector and relational memory database ensures context preservation:
- **Personal Memory:** A private vector index isolated per agent instance. Used for storing intermediate reasoning and self-reflections.
- **Link Memory:** Shared sub-graphs in a graph database or shared scoped vector spaces connecting 2-3 specific agents. Enables deep, specialized context without polluting the overall session.
- **Group Memory:** A workspace-wide memory store combining vector embeddings of project documents and a relational database of active task states.
- **Global Memory:** Organization-wide persistent storage storing refined knowledge, learned templates, and rules (RAG-based).

## 4. Agent Communication System
Agents do not just append to a single massive context window. They communicate via a pub/sub event bus:
- **Channels:** Topics for specific domains (e.g., `#frontend`, `#security-review`).
- **Direct Messaging:** For Link Memory collaborators.
- **Debate Mode:** A specialized communication mode where two agents (e.g., Engineer and Reviewer) iteratively critique code until consensus is reached, monitored by the Leader.

## 5. Role Orchestration Logic
- **Dynamic Profiling:** At the start of a workspace, the orchestrator queries all attached API keys/models.
- **Single Model Fallback:** If only one model is connected to the workspace, Kgent automatically degrades gracefully into a standard, single AI agent assistant, avoiding unnecessary orchestration overhead.
- **Assignment:** The Leader evaluates the Objective DAG. It maps required skills (e.g., "needs strong Python skills + large context window") to available models.
- **Auto-Balancing:** If one agent is blocked or rate-limited, the Leader can dynamically reassign a replica of that role to another model.

## 6. Tool Execution Framework
- **Modular Tool Registry:** Tools are registered as stateless functions with strictly typed JSON schemas for input/output.
- **Provider Independence:** Kgent maps its native tool schema to the specific function-calling format of OpenAI, Anthropic, etc.
- **Isolated Sandbox:** Code execution and shell commands are routed through a secure, containerized environment (e.g., Docker or WebAssembly/Firecracker microVMs) to prevent host compromise.

## 7. Workspace/Session System
- **Workspaces:** High-level logical boundaries for teams or organizations. Contain global configurations, API keys, and Global Memory.
- **Sessions:** Individual project executions (e.g., "Build a full-stack auth app"). Sessions are fully resumable, serialized states capturing the exact position of the Task DAG and current Memory states.
- **Snapshots:** The system can checkpoint a session, allowing users to "rewind" to a previous point if the agents go down the wrong path.

## 8. Security Architecture
- **Credential Vault:** API keys and tokens are encrypted at rest using AES-256 and injected into the runtime only at execution time.
- **RBAC (Role-Based Access Control):** Granular permissions for human users and agents (e.g., Agent X is restricted to read-only file access).
- **Tool Sandboxing:** Terminal and code execution run in isolated containers with limited network egress and strict timeouts.
- **Local-First Configurations:** User credentials remain on their local machine unless explicitly synced to a trusted self-hosted server.

## 9. Scalability Strategy
- **Asynchronous Event-Driven Core:** The backend must handle thousands of concurrent LLM API calls without blocking.
- **Stateless Agent Instances:** Agents retrieve their state from the Memory Engine per execution step, allowing them to be scaled horizontally across worker nodes.
- **Memory Tiering:** Cold data (Global Memory) is stored in cost-effective vector databases, while hot data (Personal/Link Memory) is kept in in-memory datastores (like Redis).

## 10. CLI + Web UI Structure
- **CLI (`kgent`):** Built with Node.js/Go. Handles local scaffolding, secure credential generation, starting the daemon (`kgent start`), and local file-watching.
- **Web UI:** A React/Next.js dashboard. Connects via WebSocket to the Kgent daemon. Features an infinite canvas for execution graphs, chat windows for observing agent interactions, memory inspectors, and tool configuration panels.

## 11. Plugin/Provider Adapter System
- **Unified Interface:** Every model provider implements an `IModelProvider` interface handling `generate()`, `stream()`, and `callTool()`.
- **Plugin Marketplace:** A registry where users can install custom tools (e.g., "AWS Deployment Tool") or custom model adapters without altering the core Kgent code.

## 12. Recommended Tech Stack
- **Backend/Core Engine:** Rust or Go (for high concurrency, low latency, and efficient memory management). Node.js/TypeScript is an alternative for rapid iteration.
- **Database (Memory Engine):**
  - To maintain absolute privacy and avoid connectivity issues, the system relies on fully offline, local databases.
  - Vector: Local Qdrant or ChromaDB.
  - Relational/State: SQLite or local PostgreSQL.
  - Caching/PubSub: Local Redis instance.
- **Frontend (Web UI):** Next.js (React), Tailwind CSS, React Flow (for DAG/graph visualization).
- **Sandboxing:** Firecracker microVMs or Docker Engine API.

## 13. MVP Roadmap
- **Phase 1: Core Runtime & CLI:** Single-user local setup. Hardcode 2-3 providers. Implement basic Task DAG and Group Memory.
- **Phase 2: Multi-Agent Communication:** Implement Leader + Worker dynamics. Add Tool Execution Framework (Search, File Read/Write).
- **Phase 3: Multi-Layer Memory:** Introduce Personal, Link, and Global memory systems.
- **Phase 4: Web UI & Workspaces:** Launch the visual dashboard, WebSocket streams, and persistent workspaces.
- **Phase 5: Extensibility:** Open the Plugin/Adapter API for community contributions.

## 14. Long-Term Research Direction
- **Swarm Intelligence:** Moving from a strict hierarchy (Leader/Worker) to decentralized, self-organizing agent swarms.
- **Continuous Learning:** Agents that update their weights or fine-tune themselves locally based on Global Memory successes.
- **Cross-Workspace Collaboration:** Enabling Agent clusters in different companies/organizations to securely negotiate and collaborate via the Kgent Protocol.

## 15. Performance Optimization Strategy
- **Semantic Caching:** Cache identical or highly similar LLM queries to reduce API costs and latency.
- **Dynamic Context Pruning:** Before injecting memory into the context window, use a fast, local embedding model to score and prune irrelevant tokens.
- **Routing:** Route simpler tasks to cheaper/faster models (e.g., Haiku or local Llama 3) and complex reasoning to expensive models (e.g., GPT-4o or Claude 3.5 Sonnet).

---

## Risk Analysis & System Challenges

### Major Engineering Challenges
- **State Synchronization:** Keeping the DAG, memory databases, and active agent contexts perfectly synced in a highly asynchronous environment.
- **Context Window Management:** Multi-agent discussions generate massive amounts of text. Managing what gets passed to the LLM without exceeding token limits or losing critical details is highly complex.

### Bottlenecks
- **API Rate Limits:** The system can easily hit provider rate limits when spawning multiple agents simultaneously.
- **Database Latency:** Excessive read/writes to the vector database for every minor agent action will cause significant slowdowns.

### Security Risks
- **Prompt Injection via Web Tools:** If an agent scrapes a malicious webpage, the payload could hijack the agent to execute dangerous shell commands.
- **Privilege Escalation:** A specialized agent tricking the Leader agent into granting it access to restricted tools.

### Scaling Risks
- **Cost Explosion:** An unsupervised debate between two high-tier models (e.g., GPT-4o and Claude 3.5 Sonnet) can drain API credits rapidly.
- **Compute Overhead:** Running heavy local models alongside the orchestration engine and Docker sandboxes will require substantial hardware.

### Token & Memory Optimization Problems
- **Context Dilution:** If Group Memory is continuously injected into prompts, agents may "forget" their specific instructions (the "lost in the middle" phenomenon).
- *Solution:* Strict summarization routines and aggressive relevance scoring before prompt construction.

### Coordination Failure Scenarios
- **Infinite Loops:** Agents debating a piece of code indefinitely without resolution.
- **Hallucinated Consensus:** Agents agreeing on a completely incorrect solution due to shared bias rather than factual correctness.
- *Solution:* Implement strict "Timeout" and "Human-in-the-Loop" escalation triggers.

### Cost Optimization Strategies
- **Smart Context System:** If multiple messages from different parts of the system need to go to the same AI model, Kgent batches them using a structured JSON context payload. This drastically reduces redundant token generation and API calls.
- **Hierarchical Routing:** Leader models (expensive) only do planning and reviewing. Execution is handled by cheaper models.
- **Local Fallback:** Use local open-source models (like Ollama) for summarizing memory or formatting data to save API tokens.
- **Aggressive Caching:** Store common architectural patterns or repeated tool outputs.

### Making Kgent Fundamentally Better Than Current Frameworks (AutoGPT, CrewAI, etc.)
- **True Multi-Layer Memory:** Most frameworks use a single vector DB or just append to the context window. Kgent's isolated Personal and Link memories prevent context pollution.
- **Dynamic Capability Discovery:** Instead of hard-coding "Agent 1 is a Coder," Kgent profiles models in real-time, adapting to whatever APIs the user has provided.
- **Sandboxed and Typed Tools:** Moving away from fragile string parsing to strict JSON-schema tool definitions running in secure microVMs.
- **Professional Runtime:** Treating the system as a resumable, stateful distributed application rather than a simple command-line script.
