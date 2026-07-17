# Database & JavaScript Engineering Studio

A multi-page browser-based engineering workspace for learning SQL, database design, query execution, object-oriented programming, JavaScript runtime behavior, closures, memory, analytics, and backend architecture through interactive visualizations.

## Live Links

- GitHub Repository: [fazal305/database-javascript-engineering-studio](https://github.com/fazal305/database-javascript-engineering-studio)
- Live Demo: [fazal305.github.io/database-javascript-engineering-studio](https://fazal305.github.io/database-javascript-engineering-studio/)

## Overview

Database & JavaScript Engineering Studio joins database and runtime concepts into one learning progression. Instead of isolated demos, every module uses the same navigation, visual language, local workspace, configuration system, export utilities, and activity history.

The application runs directly in a browser with no build step or backend. Interactive parsers and state machines make invisible engineering processes visible while staying safely inside an educational, local simulation boundary.

## Modules

- MySQL Workbench
- Visual Database Designer
- SQL Query Visualizer
- OOP Playground
- JavaScript Execution Visualizer
- Closure Explorer
- `this` Keyword Playground
- JavaScript Memory Explorer
- SQL Analytics Studio
- Backend Architecture Simulator
- Settings

## Features

- Learning-focused SQL tokenizer, parser, formatter, explainer, and simulator
- Schema browser, saved queries, history, file import, and export
- Draggable ER tables, typed columns, relationships, zoom, and SQL/JSON exchange
- Step-driven SQL execution plans with intermediate row previews
- Class, inheritance, instance, prototype-chain, and method-resolution models
- Call-stack, Web API, microtask, callback-queue, and event-loop timelines
- Independent closure environments and retained-state visualization
- `this` binding decision paths across seven invocation forms
- Stack roots, heap nodes, references, tracing, and garbage candidates
- CSV/JSON analytics with inferred fields, aggregates, tables, and Chart.js charts
- Success and failure request flows through a layered backend architecture
- Dynamic theme and layout settings, workspace import/export, and reduced motion
- Data-driven navigation, dashboard cards, activity history, and demo content

## Technologies Used

- HTML5
- CSS3 custom properties
- Bootstrap 5
- jQuery
- Vanilla JavaScript
- Chart.js
- SVG
- LocalStorage
- FileReader and Blob APIs
- Clipboard API

## Learning Outcomes

- Translate SQL text into tokens, a simplified AST, execution steps, and result rows.
- Model relational keys, data types, and cardinality in an ER diagram.
- Explain inheritance, prototype lookup, closures, `this`, and runtime scheduling.
- Reason about object reachability and tracing garbage collection.
- Convert datasets into grouped analytics and charts.
- Follow a request across middleware, controllers, services, repositories, and failures.

## Architecture Notes

The app uses a multi-page architecture: each module has one HTML, CSS, and JavaScript file. `js/shared.js` owns the configuration, workspace schema, persistence, seeding, formatting, export tools, shell rendering, dynamic theme, and transition system. `styles.css` holds fallback tokens and shared components; page files only use tokens.

LocalStorage is the source of truth. Settings are converted to CSS custom properties at runtime. Navigation and dashboard cards come from the same module configuration array. Internal links use a full-screen overlay with a delayed loader fallback, while reduced-motion preferences bypass animation delays.

The SQL parser supports a deliberately small learning subset and does not claim MySQL compatibility. JavaScript visualizers use deterministic state machines; they are conceptual models, not a JavaScript engine. No arbitrary code or SQL is executed.

## Folder Structure

```text
database-javascript-engineering-studio/
├── index.html
├── mysql-workbench.html
├── database-designer.html
├── sql-query-visualizer.html
├── oop-playground.html
├── javascript-execution-visualizer.html
├── closure-explorer.html
├── this-playground.html
├── memory-explorer.html
├── sql-analytics.html
├── backend-architecture.html
├── settings.html
├── styles.css
├── css/                 # One stylesheet per page
├── js/                  # Shared engine plus one script per page
├── assets/icons/
└── assets/screenshots/
```

## How To Run Locally

```powershell
git clone https://github.com/fazal305/database-javascript-engineering-studio.git
cd database-javascript-engineering-studio
start index.html
```

Internet access is needed for the Bootstrap, jQuery, and Chart.js CDNs.

## Module Workflows

1. Write a supported SQL query, format it, inspect its explanation, and simulate it against demo rows.
2. Design a schema by creating and dragging tables, adding columns, connecting relationships, and exporting SQL.
3. Build a visual query plan and move through each relational operation.
4. Load an OOP demo, add classes or instances, and trace method resolution.
5. Step through synchronous work, Web APIs, microtasks, and callback tasks.
6. Create multiple closures and invoke them independently to compare retained state.
7. Compare `this` binding modes and follow each binding decision path.
8. Remove a root reference and calculate reachable and collectible heap objects.
9. Import or select a dataset, choose group and value fields, aggregate, chart, and export.
10. Run success and failure requests through the backend architecture simulator.

## Educational Scope

The SQL parser recognizes a useful learning subset rather than a complete dialect. The JavaScript runtime and memory pages illustrate conceptual behavior and do not execute user code. SQL mutations are described and simulated only. No database connection is required, and imported files are size-limited and validated.

## Screenshots

- `assets/screenshots/dashboard.png`
- `assets/screenshots/database-designer.png`
- `assets/screenshots/sql-query-visualizer.png`
- `assets/screenshots/event-loop-visualizer.png`
- `assets/screenshots/backend-architecture.png`

## Demo Video

Add a 60–90 second `assets/screenshots/walkthrough.gif` showing the dashboard, one SQL simulation, an ER edit, the event loop, and a backend failure flow.

## Agentic Engineering Process

The project was approached specification-first: shared constraints and state boundaries were defined before module views. Work was split by foundation, interactive engines, persistence, and documentation. Verification gates check file structure, script syntax, prohibited execution APIs, per-page dependencies, shared tokens, and expected exported functions. The browser-only sandbox keeps user data local and simulation boundaries explicit.

## Lessons Learned

- A shared state model is essential for making many educational tools feel like one product.
- Deterministic state machines make execution concepts easier to explain and test.
- CSS tokens provide a reliable contract between global settings and page-specific visuals.
- Honest simulation boundaries are as important as visual polish in engineering education.

## Future Improvements

- Real SQL engine integration through WebAssembly
- More complete SQL grammar and query optimization/index visualizers
- Transaction, isolation, and deadlock simulators
- TypeScript playground and AST explorer
- Worker-based parsing and IndexedDB persistence
- PWA offline mode
- Export diagrams as SVG/PNG
- Automated browser tests

## Fazal Labs Ecosystem

This project belongs in **🛠 DevKit Studio** and can later anchor a dedicated **Database Engineering Suite**.

## License

MIT License. See [LICENSE](LICENSE).
