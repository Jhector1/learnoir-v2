// src/components/code/runner/utils/input/input.python.ts
// Extract prompts from Python input("...") and input('...') in SOURCE code.
// Important: we decode Python string literal escapes correctly.

export function extractInputPromptsPython(src: string) {
    const s = String(src ?? "");
    const out: string[] = [];

    const re = /\binput\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1\s*\)/g;

    for (const m of s.matchAll(re)) {
        out.push(unescapePyStringContent(m[2] ?? ""));
    }
    return out;
}

function unescapePyStringContent(x: string) {
    const s = String(x ?? "");
    let out = "";
    for (let i = 0; i < s.length; ) {
        const ch = s[i];
        if (ch !== "\\") {
            out += ch;
            i++;
            continue;
        }
        // backslash escape
        const nxt = s[i + 1];
        if (nxt == null) {
            out += "\\";
            i++;
            continue;
        }

        switch (nxt) {
            case "\\":
                out += "\\";
                i += 2;
                break;
            case "n":
                out += "\n";
                i += 2;
                break;
            case "r":
                out += "\r";
                i += 2;
                break;
            case "t":
                out += "\t";
                i += 2;
                break;
            case '"':
                out += '"';
                i += 2;
                break;
            case "'":
                out += "'";
                i += 2;
                break;
            default:
                // unknown escape: keep the escaped char
                out += nxt;
                i += 2;
                break;
        }
    }
    return out;
}

export function countPythonInputs(src: string) {
    const s = String(src ?? "");
    const m = s.match(/\binput\s*\(/g);
    return m ? m.length : 0;
}
