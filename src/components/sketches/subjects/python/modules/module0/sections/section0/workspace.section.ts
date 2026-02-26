// import type { SketchEntry } from "../../../../.";

import {SketchEntry} from "@/components/sketches/subjects";

/**
 * Python — Workspace topics (image + instructions)
 */
export const PY_WORKSPACE_SECTION: Record<string, SketchEntry> = {
    "py.workspace.intro": {
        kind: "archetype",
        spec: {
            archetype: "image",
            specVersion: 1,
            title: "Your Workspace: Where You’ll Write and Run Code",
            src: "/assets/editor.png",
            alt: "{appName} code workspace showing the module sidebar, code editor, run button, and terminal output.",
            aspectRatio: 16 / 9,

            caption: String.raw`
**Quick tour**

- **Left:** Module sidebar (navigate sections/topics)
- **Center:** Code editor (where you write Python)
- **Top-right:** **Run** button (executes your code)
- **Bottom:** Terminal / console (shows output + errors)
      `.trim(),

            markers: [
                { id: "sidebar", x: 0.12, y: 0.2, label: "Module sidebar" },
                { id: "editor", x: 0.55, y: 0.38, label: "Code editor" },
                { id: "run", x: 0.92, y: 0.1, label: "Run" },
                { id: "terminal", x: 0.55, y: 0.88, label: "Terminal output" },
            ],

            initialZoom: 1,
            minZoom: 1,
            maxZoom: 4,
            zoomStep: 0.15,
            allowPan: true,
            allowWheelZoom: true,
            allowDoubleClickReset: true,
            showControls: true,
        },
    },

    "py.workspace.instructions.intro": {
        kind: "archetype",
        spec: {
            archetype: "paragraph",
            specVersion: 1,
            title: "Input, Processing, Output (Using Your Workspace)",
            bodyMarkdown: String.raw`
Before we go further, I want to take some time to make you familiar with your workspace.

Let’s start on the **left side**: there is your **module sidebar**. You can navigate between sections there by selecting one of the tiles.

On the **right**, you have your **code editor**. Some people call this an IDE(Integrated Development Environment), but I prefer calling this web version a **code editor** because it’s not a full IDE—still, it’s enough to help you learn Python with all the necessary tools you need.

Now take a look at the layout. Click the **Run** button on the **top right corner** of your screen and confirm the text within the quotes is printed on the terminal.

Congratulations — you just learned how to execute your code and display the output on the terminal.

Now copy this code, erase the current one, and run it again:

~~~python
print("I am learning Python")
~~~

Verify that it also displays on the terminal.

When you finish, you can move on to the next topic, and make sure you mark everything as read.
      `.trim(),
        },
    },
};
