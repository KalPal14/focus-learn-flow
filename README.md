# Contents

- [Introduction](#introduction)
- [Local Setup and Application Launch](#local-setup-and-application-launch)
- [Non-Technical Application Overview](#non-technical-application-overview)
  - [highlight-extension](#highlight-extension)
  - [freq-words](#freq-words)
  - [iam](#iam-identity-and-access-management)
- [Architecture and Technical Decisions](#architecture-and-technical-decisions)
  - [Rationale for Combining npm Workspaces + Nx](#rationale-for-combining-npm-workspaces--nx)
  - [Layered Architecture Implementation](#layered-architecture-implementation)
  - [Three-Layer Architecture Implementation](#three-layer-architecture-implementation)
  - [Hexagonal Architecture Implementation](#hexagonal-architecture-implementation)
  - [Feature-Sliced Design Implementation](#feature-sliced-design-implementation)

# Introduction

This project is a monorepository containing multiple services and a client application, designed to showcase my skills in both backend and frontend development. It includes two Express services, a NestJS service, a browser extension for Chrome and Firefox built with React. Functionality that is independent of the business logic of a specific application and is used or can be used across multiple applications has been extracted into libraries.

#### Key Technologies:

- Backend: NestJS, Express.js, Prisma, TypeORM
- Frontend: React
- Project Management: Nx, Docker
- Testing: Jest, Supertest

# Local Setup and Application Launch

### 1. Clone the Repository from GitHub

```
git clone https://github.com/KalPal14/focus-learn-flow.git

cd focus-learn-flow/
```

### 2. Install Node.js v20.16.0 and npm v10.8.1

I recommend using nvm (Node Version Manager) to manage Node.js versions.

Install nvm:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
```

or

```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
```

Load nvm:

```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

> [!CAUTION]
> If issues arise, refer to the [nvm installation guide](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).

Install Node.js and npm:

```
nvm install 20.16.0
```

Verify Node.js version (should output v20.16.0):

```
node -v
```

If incorrect, activate the version:

```
nvm use 20.16.0
```

Verify npm version (should output 10.8.1):

```
npm -v
```

### 3. Create .env.dev and .env.test Files

Create two files in the project root (focus-learn-flow folder):

.env.dev:

```
SALT = 9
JWT_KEY = 'jwt_secret_key'
COOCKIE_KEY = 'COOCKIE_SECRET_KEY'
GROQ_API_KEY = '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'

# freq-words
FREQ_WORDS_PORT = 8002
FREQ_WORDS_HOST = 'localhost'
FREQ_WORDS_URL = 'http://localhost:8002'
FREQ_WORDS_DB_PORT = 5430
FREQ_WORDS_DB_USERNAME = 'postgres'

FREQ_WORDS_DB_PASSWORD = 'postgres'
FREQ_WORDS_DB_NAME = 'freq-words-dev'

# highlight-extension
H_EXT_PORT = 8001
H_EXT_HOST = 'localhost'
H_EXT_URL = 'http://localhost:8001'
H_EXT_DB_PORT = 5433
H_EXT_DB_USERNAME = 'postgres'
H_EXT_DB_PASSWORD = 'postgres'
H_EXT_DB_NAME = 'highlight-extension-dev'
H_EXT_DB_URL = 'postgresql://postgres:postgres@localhost:5433/highlight-extension-dev'

# highlight-extension-fe
H_EXT_FE_URLS = 'chrome-extension://kjcnjieddkcmfoebehajbipdkoicpbmi, moz-extension://65bf4d9c-6d43-47c2-88a4-5296b7a802f5'

# iam
IAM_PORT = 8000
IAM_HOST = 'localhost'
IAM_URL = 'http://localhost:8000'
IAM_DB_PORT = 5435
IAM_DB_USERNAME = 'postgres'
IAM_DB_PASSWORD = 'postgres'
IAM_DB_NAME = 'iam-dev'
IAM_DB_URL = 'postgresql://postgres:postgres@localhost:5435/iam-dev'
```

.env.test:

```
SALT = 9
JWT_KEY = 'jwt_secret_key'
COOCKIE_KEY = 'COOCKIE_SECRET_KEY'
GROQ_API_KEY = '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'

# freq-words
FREQ_WORDS_URL = ''
FREQ_WORDS_DB_PORT = 5431
FREQ_WORDS_DB_USERNAME = 'postgres'
FREQ_WORDS_DB_PASSWORD = 'postgres'
FREQ_WORDS_DB_NAME = 'freq-words-test'

# highlight-extension
H_EXT_PORT = 0
H_EXT_URL = ''
H_EXT_DB_PORT = 5434
H_EXT_DB_USERNAME = 'postgres'
H_EXT_DB_PASSWORD = 'postgres'
H_EXT_DB_NAME = 'highlight-extension-test'
H_EXT_DB_URL = 'postgresql://postgres:postgres@localhost:5434/highlight-extension-test'

# highlight-extension-fe
H_EXT_FE_URLS = 'chrome-extension://kjcnjieddkcmfoebehajbipdkoicpbmi, moz-extension://65bf4d9c-6d43-47c2-88a4-5296b7a802f5'

# iam
IAM_PORT = 0
IAM_URL = ''
IAM_DB_PORT = 5436
IAM_DB_USERNAME = 'postgres'
IAM_DB_PASSWORD = 'postgres'
IAM_DB_NAME = 'iam-test'
IAM_DB_URL = 'postgresql://postgres:postgres@localhost:5436/iam-test'
```

### 4. Install npm Packages

```
npm i
```

### 5. Install Docker

Follow the [official Docker installation guide](https://docs.docker.com/compose/install/)

Then run:

```
sudo snap install docker
sudo docker compose up -d
```

### 6. Global Installation of nx (Optional)

> [!NOTE]
> If skipped, prepend npx to all nx commands (e.g., npx nx {command}).

Install nx globally:

```
npm add --global nx@19.8.0
```

### 7. Database Setup

> [!IMPORTANT]
> Prerequisite: Complete [Docker installation](#5-install-docker).

Generate Prisma Types:

```
nx run-many --target=prisma:generate
```

Apply Migrations:

```
nx run iam:migration:dev
nx run highlight-extension:migration:dev
```

Seed Databases:

```
nx run iam:seed:test
nx run highlight-extension:seed:test
nx run freq-words:seed
```

### 8. Launch Applications

**If you want to start all Services**:

```
nx run-many --target=start:dev
```

**If you want to start a single Service**:

```
nx run {app_name}:start:dev
```

Replace `{app_name}` with: iam, highlight-extension, highlight-extension-fe, or freq-words.

#### 9. Load the Browser Extension

**For Chrome:**

1. Ensure `iam`, `highlight-extension`, and `highlight-extension-fe` services are running.

2. Open `Chrome` and navigate to `chrome://extensions/`.

3. Enable Developer mode (toggle in the top-right corner).

4. Click `Load unpacked` and select the folder: `dist/apps/highlight-extension-fe`.

**For Firefox:**

1. Ensure `iam`, `highlight-extension`, and `highlight-extension-fe` services are running.

2. Open `Firefox` and navigate to `about:debugging#/runtime/this-firefox`.

3. Click `Load Temporary Add-on…` btn and select: `dist/apps/highlight-extension-fe/manifest.json`.

### 10. E2E Test Setup and Execution

#### Configure Test Databases

> [!IMPORTANT]
> Prerequisite: Complete [Docker installation](#5-install-docker).

Generate Prisma Types (skip if already done during [dev DB setup](#7-database-setup)):

```
nx run-many --target=prisma:generate
```

Apply Test Migrations:

```
nx run iam:migration:test
nx run highlight-extension:migration:test
```

Seed Test Databases:

```
nx run iam:seed:test
nx run highlight-extension:seed:test
NODE_ENV=test nx run freq-words:seed
```

#### Run E2E Tests

For running All E2E Tests:

```
nx run-many --target=test:e2e
```

For running E2E Tests for a Specific Service:

```
nx run {app_name}-e2e:test:e2e
```

Replace `{app_name}` with: iam, highlight-extension, or freq-words.

# Non-Technical Application Overview

## highlight-extension

A browser extension designed to streamline and enhance online research and content engagement.

Key Features:

- Highlighting: Create color-coded highlights directly on web pages.
- Annotations: Add comments to highlighted text for context.
- Summary Panel: A sidebar displays all highlights and notes for the active page, with click-to-navigate functionality to jump directly to specific highlights.
- Customization: Organize, reorder, or delete highlights; customize colors; toggle the extension on/off.
- Cross-URL Management: Merge highlights/notes from different pages and update URLs to preserve data if page addresses change.
- Unified Library: View all saved highlights and notes across pages.

## freq-words

An AI-powered translator and dictionary with advanced bookmarking capabilities. Currently, only the backend is implemented.

**Core Functionality**:

- Translator:
  - Words/Phrases: Returns detailed results (synonyms, multiple translations, usage examples).
  - Sentences/Text: Provides direct translations.
- Advanced Bookmarking:
  - Automatically categorizes bookmarked words by their lemma[^1] and word form[^2].
  - Groups word forms under their shared lemma (e.g., "dare," "durst," "dared" under "dare").
  - Tracks how frequently each word form is bookmarked.

> [!IMPORTANT]
> This approach allows to display bookmarks in the following way:
>
> All variations of "dare" - 4\
> dare - 1\
> durst - 2\
> dared - 1
>
> All variations of "keep" - 2\
> keep - 0\
> kept - 2

**This provides two key benefits**:

1. Identify Weaknesses: Visualize frequently encountered but poorly memorized words[^3].
2. Contextual Learning: Link grammatical variants of the same word to improve retention.

[^1]: Lemma: The base form of a word (e.g., "run" for "ran," "running").

[^2]: Word Form: A grammatical variant of a lemma (e.g., "ran" is a past-tense form of "run").

[^3]: Word: A collection of all word forms sharing a common lemma and meaning.

## iam (Identity and Access Management)

Centralized authentication and user management system for all applications.

Features:

- Serves as the single sign-on (SSO) authority for integrated services.
- User registration, login, and password recovery.
- Profile management (update email, username, password).

# Architecture and Technical Decisions

The project is organized as a monorepo of loosely coupled applications. All applications reside in the `/apps` directory, while shared code—independent of any single application’s business logic is centralized in the `/libs` directory. This structure promotes code reuse, modularity, and separation of concerns across services.

## Rationale for Combining npm Workspaces + Nx

There are several approaches to structuring a monorepo, which can be categorized into three types:

1.  **Outsourced**\
    Relies heavily on third-party tools like `Nx` or `Lerna` to handle monorepo configuration, application/library setup, and dependency management.

    **Pros**: Rapid setup, minimal developer expertise required, access to built-in features (e.g., caching, dependency graphs, cyclic dependency detection).

    **Cons**: Limited flexibility, constrained by the tool’s conventions.

2.  **Fully Custom**\
    Developers manually configure applications, libraries, and their interdependencies using native `workspace` tools (`npm/yarn/pnpm workspaces`).

    **Pros**: Maximum flexibility, full control over tooling and workflows.

    **Cons**: Time-intensive setup, no built-in optimizations (e.g., caching), requires deep expertise in monorepo management.

3.  **Hybrid**\
    Combines `npm/yarn/pnpm workspaces` for low-level configuration with `Nx` or `Lerna` layered on top for advanced features.

    **Pros**: Retains flexibility while gaining critical optimizations (e.g., task caching, dependency visualization).

    **Cons**: Requires moderate effort to integrate tools.

### Why I Chose the Hybrid Approach

1. **Project Evolution:** The monorepo grew organically from a single Express.js application (`highlight-extension`), which initially used a `non-Nx` configuration. Migrating to a fully outsourced tool (e.g., `Nx’s` strict templates) would have required significant refactoring. The hybrid approach allowed incremental adoption without disrupting existing workflows.

2. **Future Scalability:** The long-term vision for this monorepo includes adding more applications, experimenting with diverse technologies (e.g., new languages, frameworks), and maintaining flexibility. A fully custom setup would lack critical productivity features, while a fully outsourced approach might restrict unconventional use cases.

3. **Educational Goals:** As a learning project, the priority was to deepen understanding of monorepo architecture and workspace tooling. The hybrid approach provided hands-on experience with both low-level configuration (`npm workspaces`) and high-level optimizations (`Nx`), balancing practical skills with efficiency.

## Layered Architecture Implementation

When examining the structure of highlight-extension and iam in isolation, a clear `Layered Architecture` pattern emerges:

1. **Presentation Layer**: Implemented via **controllers** to handle HTTP requests/responses.
2. **Application Layer**: Managed by **services** that orchestrate business logic.
3. **Domain Layer**: Contains **domain entities and their factories**, organized in the `/domain` directory.
4. **Data Access Layer**: Encapsulates database interactions through repositories.

Each layer adheres to strict boundaries, aligning with the theoretical responsibilities defined by `Layered Architecture`.

**This architecture suits these projects for several reasons**. First, within the monorepo, all external concerns with moderate to high replacement risks that should not tightly couple to core business logic are extracted into shared libraries. For details on this approach, refer to the [using approaches from Hexagonal Architecture](#hexagonal-architecture-implementation). In essence, each application operates as an isolated, self-contained project where there is no need to further isolate components from the core business logic, as it remains the dominant element with minimal extraneous dependencies.

Under these conditions, this architecture proves effective. By enforcing strict separation of concerns, it achieves maintainability, reusability, and security. At the same time, the relative simplicity of this approach ensures the codebase remains concise, easy to comprehend, and free from excessive boilerplate.

### Three-Layer Architecture Implementation

> [!IMPORTANT]
> Before reading this section, review the [Layered Architecture Implementation](#layered-architecture-implementation)

**Three-Layer Architecture** simplifies the traditional **four-layer approach** by omitting the dedicated **Domain Layer**. Instead, domain logic (if present) remains within the **Application Layer**.

In `freq-words`, this pattern is evident:

- **Presentation Layer**: Handles HTTP requests via **controllers**.
- **Application Layer**: Orchestrates business logic through **services**.
- **Data Access Layer**: Manages database interactions using **repositories**.

Each layer adheres to strict boundaries, fulfilling its designated theoretical role.

### Why This Approach Was Chosen

To begin with, I started implementing the `freq-words` application after completing the `iam` and `highlight-extension` projects. I had **doubts about the necessity of extracting the Domain as a separate layer**.

On one hand, the **Domain Layer** offloads the **services** implementing the **Application Layer** and helps avoid the well-known **Anemic Domain Model** problem.

On the other hand, if the application’s logic is not highly complex, the **Domain Layer may provide little value**, becoming boilerplate code without meaningful responsibilities. This is precisely why the simplified Three-Layer Architecture exists.

In the context of `iam` and `highlight-extension`, the **practical utility of the Domain Layer could roughly be described as 50/50**. At times, it fulfilled its intended functions, while in other cases, it became redundant boilerplate.

Since `freq-words`, in terms of scale and complexity during planning, **appeared only marginally more complex** than the first two applications, I decided to experiment for research purposes. By going to the opposite extreme, I **implemented it entirely without a Domain Layer** to compare the two approaches and draw conclusions. Ultimately, even if not viewed as an experiment, I can state that in very small projects, a Domain Layer may indeed be unnecessary. However, **even for a moderately sized application like `freq-words`, its presence would be preferable**.

**Moving forward, I think a hybrid approach is advisable**: introducing a **Domain Layer** not by default, but only where the complexity of the logic justifies its use.

## Hexagonal Architecture Implementation

The use of approaches from `Hexagonal Architecture` is particularly evident at the monorepo level. In this monorepo, almost all external dependencies are not directly tied to the business logic of specific applications. Consequently, they have been extracted into libraries.

To illustrate the core principle of `Hexagonal Architecture`—isolating `business logic` from `external concerns`—let’s take the example of `AiService` in the `common` library[^4].

[^4]: full path to ai-service `libs/common/src/services/ai-service`

### Folder Structure

- /ai-service

  - /infrastracture
    - /groq
      - groq.service.ts
  - /port
    - ai.service.ts

- `/port`: Defines the interfaces that serve as entry points into the application.
  - This layer establishes the boundaries of the application by defining rules and interfaces for interacting with external modules.
  - In this case, the abstract class `AiService` plays this role.
- `/infrastructure`: Contains concrete implementations of external dependencies.
  - These implementations must strictly conform to the interfaces in `/port` (either by extending abstract classes or implementing interfaces).
  - Currently, the only implementation here is `GroqService`, but additional implementations can be added in the future.

### Key Architectural Principle: Dependency Inversion

A crucial aspect of this approach is the **Dependency Inversion Principle (DIP)**:

- **Higher-level modules (business logic)** should not depend on **lower-level modules (external services)**.
- Instead, both should depend on **abstractions**.

In our example:

- Higher-level modules → The business logic of our applications.
- Lower-level modules → `GroqService` (a specific AI implementation).
- Abstraction → The abstract class `AiService`.

**How This Works in Practice**

Within the business logic of our applications, we never use `GroqService` directly.
Instead, we:

- Inject `GroqService` via the `AiService` interface.
- Use **Dependency Injection** to bind the concrete implementation (`GroqService`) in one place.

### Benefits of This Approach

By decoupling business logic from external dependencies, we gain:

- **Flexibility:** External modules can be replaced if they introduce limitations or if a better alternative is found.
- **Scalability:** We can introduce multiple implementations and swap them dynamically without modifying business logic.
- **Maintainability:** The system is easier to test and extend, as business logic remains independent of specific services.

### Other Implementations Using This Approach

In addition to `ai-service`, several other services in the monorepo follow a similar architecture.

One notable example is `browserAdapter` in the `client-core` library.

Thanks to this abstraction layer, my browser extension currently works in both **Chrome** and **Firefox**.
In the future, support for other browsers can be easily added without modifying (or with minimal changes to) the business logic of the extension.

## Feature-Sliced Design Implementation

The `highlight-extension-fe` application follows **Feature-Sliced Design (FSD)** architecture with one intentional deviation from its standard principles. Below, I explain what this deviation is and why I made this choice.

### Layer Structure

I have structured the project into five layers, listed from top to bottom:

- `app`
- `pages`
- `widgets`
- `entities`
- `shared`

The purpose of each layer is described in the [official FSD documentation](https://feature-sliced.design/lander).

According to **FSD** best practices:

- `app` and `shared` layers are **not divided into slices**.
- All other layers (`pages`, `widgets`, `entities`) are **divided into slices**.

Each **slice** follows a strict internal structure with well-defined **segments**. In my case, I **use only standard segments**:

- `ui`
- `model`
- `config`
- `lib`

The `lib` segment is implemented via `index.ts`.

- In `app` and `shared` in **segments level**.
- In other layers, it exists at the **slice level**.

This structure allows for reorganizing segments and slices without changing imports throughout the application.

### The Deviation from Standard FSD Rules

One of the core FSD rules states that **slices within the same layer should not import anything from other slices in that layer or from layers above**.

Why Does This Rule Exist?

1. **It prevents excessive coupling**, keeping code more modular.
2. **It enforces a clear architecture**, ensuring that reusable components are placed in widgets or features instead of being directly referenced across pages.
3. **It reduces unexpected dependencies**, making the project more maintainable and scalable.

This is a very good rule, especially for the `ui` **segment**. After all, **what happens when one component imports another?** The **imported component becomes part of the component that imports it**. Accordingly, it sounds very bad when a widget includes a widget from another **slice**, or even worse, a component from `pages`. Such dependencies **increase complexity and reduce reusability**.

Let's now look at the `model` layer. For example, custom hooks. **What happens when one hook imports another?** Does it mean that one hook now includes the other? Logically, no. One hook may call a method or request data from another during execution. Logically, this can be described as communication. **One hook requests certain data from another to continue its work or delegates a task where its responsibility ends, and another hook's responsibility begins**.

In this case, a question arises: **Is it acceptable for a hook from a lower level, such as from entities, to delegate something to a hook from a higher level, such as from pages?** I think not. A hook in `pages` has a very specific role—it operates business logic tied to a particular page. Meanwhile, a hook in `entities` has a more abstract role, handling business logic related to an entity that may be used in multiple widgets and features. If such a hook needs to delegate something to a more specialized hook from a higher level, this is a clear architectural mistake. **Conclusion: The above FSD rule is valid, at least for imports from slices located on a higher level**.

**What About Cases Where One Hook Needs to Delegate to Another Hook in the Same Layer but a Different Slice?**

For the first example, let's consider hooks in `widgets`. A hook at this level is necessarily tied to the specific `ui` of a widget. The level of abstraction in such code is too low to allow it to delegate logic to another `ui`. These cases can only occur if two `ui` components from different widgets interact on a page. In such situations, it is better to manage the business logic of the interaction at the page level, keeping each widget’s logic independent. This improves scalability and allows for better reusability. If two ui components interact multiple times in the same way, they should be merged into a single widget, or kept separate, moving each part down a level while maintaining autonomy.
If this approach applies to `widgets`, then it also applies to all higher layers, as abstraction decreases even further at the upper levels. **Conclusion: The FSD rule holds true for `widgets` and all layers above**.

**Now Let's Look at Hooks for `entities`**

Entities and their hooks are more abstract. Sometimes, an `entity` slice may contain a `ui` segment, such as a `Card` or `Comment` component. However, **more often, an entity slice has a model segment containing business logic for managing the entity, without a `ui` segment**.

For example, **in both frontend and backend, my domain entities are quite similar, as they are based on the same business domains** (`workspace`, `highlight`, `page`, etc.). No matter which entity we consider, **the same set of actions is required in different cases** and scenarios when interacting with different ui components. These include **CRUD operations, filtering, and so on**.

Naturally, it makes sense to keep such logic in one place so it can be used in UI components and higher-level business logic from a single, well-organized, and logically structured location.

**Since, in real-world business logic, these entities are inherently connected, they cannot avoid interaction at any level of a software product—whether it's frontend entities, backend business entities, or database entities**.

At the same time, placing them in shared would not be appropriate since:

- shared contains even more abstract hooks that are often unrelated to the business logic of a specific application.
- Placing entity logic in shared would make it overly complex, while leaving the entities layer nearly empty.

### Conclusion

Since entity logic is independent of specific UI components and delegation between entities is inevitable. Thus, I conclude that importing one entity inside another is necessary and beneficial under the described conditions. Yes, this deviates from the strict rules of FSD, but in my opinion, it is justified and well-reasoned. This can be considered an exception to a very useful rule, and as we learned in school—"exceptions only confirm the rule."
