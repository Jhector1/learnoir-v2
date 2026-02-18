// src/components/review/module/topics/python/module0/py_variables_types.topics.ts
// (adjust path/name to match your topics folder)

export const PY_VARIABLES_TYPES_TOPICS =
    {
        id: "variables_types_intro",
        label: "Variables + Data Types: Boxes That Hold Real Values",
        minutes: 12,
        summary:
            "Learn variables as labeled boxes, the core Python data types (int/float/str/bool/None), and how to convert types safely.",
        cards: [
            {
                type: "sketch",
                id: "variables_types_s0",
                title: "Variables: Labeled Boxes for Your Data",
                sketchId: "py.vars.boxes",
                height: 540,
            },
            {
                type: "sketch",
                id: "variables_types_s1",
                title: "Data Types: What’s Inside the Box?",
                sketchId: "py.types.basic",
                height: 560,
            },
            {
                type: "sketch",
                id: "variables_types_s2",
                title: "Type Conversion: Turning Strings into Numbers",
                sketchId: "py.types.convert",
                height: 560,
            },
            {
                type: "sketch",
                id: "variables_types_s3",
                title: "Common Errors: NameError, TypeError, and Debug Tricks",
                sketchId: "py.types.errors",
                height: 560,
            },
        ],
    } as const;
