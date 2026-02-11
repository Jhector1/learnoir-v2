import type { Lang } from "@/lib/code/runCode";

export function defaultExt(lang: Lang) {
    switch (lang) {
        case "python": return ".py";
        case "java": return ".java";
        case "javascript": return ".js";
        case "c": return ".c";
        case "cpp": return ".cpp";
    }
}

export function defaultMainFile(lang: Lang) {
    switch (lang) {
        case "python": return "main.py";
        case "java": return "Main.java";
        case "javascript": return "main.js";
        case "c": return "main.c";
        case "cpp": return "main.cpp";
    }
}

export function defaultMainCode(lang: Lang) {
    switch (lang) {
        case "python":
            return `print("Hello from Python!")\n`;
        case "java":
            return `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}\n`;
        case "javascript":
            return `console.log("Hello from JavaScript!");\n`;
        case "c":
            return `#include <stdio.h>\n\nint main() {\n  printf("Hello from C!\\n");\n  return 0;\n}\n`;
        case "cpp":
            return `#include <iostream>\n\nint main() {\n  std::cout << "Hello from C++!" << std::endl;\n  return 0;\n}\n`;
    }
}
