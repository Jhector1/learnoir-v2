import type { Lang } from "@/lib/code/runCode";

export const DEFAULT_LANGS: Lang[] = ["python", "java", "javascript", "c", "cpp"];

export const DEFAULT_CODE: Record<Lang, string> = {
    python: `print("Hello from Python!")\n`,
    java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}\n`,
    javascript: `console.log("Hello from JavaScript!");\n`,
    c: `#include <stdio.h>\n\nint main() {\n  printf("Hello from C!\\n");\n  return 0;\n}\n`,
    cpp: `#include <iostream>\n\nint main() {\n  std::cout << "Hello from C++!" << std::endl;\n  return 0;\n}\n`,
};
