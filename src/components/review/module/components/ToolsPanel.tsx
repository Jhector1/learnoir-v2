export * from "@/components/tools/ToolsPanel";


// "use client";
//
// import React from "react";
// import type { Lang } from "@/lib/code/runCode";
// import CodeRunner from "@/components/code/runner/CodeRunner";
// import {ListIcon} from "lucide-react";
//
// export default function ToolsPanel({
//                                        onCollapse,
//                                        onUnbind,
//                                        boundId,
//
//                                        rightBodyRef,
//                                        codeRunnerRegionH,
//
//                                        toolLang,
//                                        toolCode,
//                                        toolStdin,
//
//                                        onChangeLang,
//                                        onChangeCode,
//                                        onChangeStdin,
//                                    }: {
//     onCollapse: () => void;
//     onUnbind?: () => void;
//     boundId?: string | null;
//
//     rightBodyRef: React.RefObject<HTMLDivElement | null>;
//     codeRunnerRegionH: number;
//
//     toolLang: Lang;
//     toolCode: string;
//     toolStdin: string;
//
//     onChangeLang: (l: Lang) => void;
//     onChangeCode: (c: string) => void;
//     onChangeStdin: (s: string) => void;
// }) {
//     return (
//         <div className="h-full ui-card overflow-hidden flex flex-col">
//             <div className="shrink-0 p-3 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/30">
//                 <div className="flex items-center justify-between gap-2">
//                     <div className="min-w-0">
//                         <div className="text-sm font-black text-neutral-800 dark:text-white/80">
//                             Tools
//                         </div>
//
//                         {boundId ? (
//                             <div className="mt-1 text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
//                                 Bound to: <span className="font-black">{boundId}</span>
//                                 {onUnbind ? (
//                                     <button
//                                         type="button"
//                                         onClick={onUnbind}
//                                         className="ml-2 underline underline-offset-2"
//                                     >
//                                         Unbind
//                                     </button>
//                                 ) : null}
//                             </div>
//                         ) : (
//                             <div className="mt-1 text-[11px] font-extrabold text-neutral-600 dark:text-white/60">
//                                 Not bound
//                             </div>
//                         )}
//                     </div>
//
//                     <button
//                         type="button"
//                         className="ui-btn disabled:opacity-60 disabled:cursor-not-allowed ui-btn-secondary px-3 py-2 text-[11px] font-extrabold"
//                         // onClick={onCollapse}
//                         title="Collapse tools"
//                         disabled={true}
//                     >
//                         <ListIcon/>
//                     </button>
//                 </div>
//             </div>
//
//             <div ref={rightBodyRef} className="flex-1 min-h-0 overflow-hidden p-3">
//                 <CodeRunner
//                     frame="plain"
//                     title="Run code"
//                     showHint={false}
//                     height={codeRunnerRegionH}
//                     showTerminalDockToggle
//                     showEditorThemeToggle
//
//                     fixedLanguage={toolLang}
//                     showLanguagePicker={false}
//
//                     code={toolCode}
//                     onChangeCode={onChangeCode}
//
//                     stdin={toolStdin}
//                     onChangeStdin={onChangeStdin}
//                 />
//
//             </div>
//         </div>
//     );
// }
