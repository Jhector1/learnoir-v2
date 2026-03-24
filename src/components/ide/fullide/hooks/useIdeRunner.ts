"use client";

import { useCallback } from "react";

import { runViaApi } from "@/lib/code/runClient";
import type { RunResult } from "@/lib/code/types";
import type { SqlDialect } from "@/lib/practice/types";

import { exportProjectFiles, pathOf } from "../../fsTree";

type Args = {
  nodes: any[];
  activeFile: any | null;
  entryFile: any | null;
  activeFileId: string | null;
  entryFileId: string | null;
  sqlDialect: SqlDialect;
  canUseMultiFile: boolean;
};

export function useIdeRunner({
  nodes,
  activeFile,
  entryFile,
  activeFileId,
  entryFileId,
  sqlDialect,
  canUseMultiFile,
}: Args) {
  const onRunProject = useCallback(
    async (args: any): Promise<RunResult> => {
      if (args.language === "sql") {
        const files = exportProjectFiles(nodes);

        const schemaFile = files.find((f) =>
          f.path.toLowerCase().endsWith("schema.sql"),
        );
        const seedFile = files.find((f) =>
          f.path.toLowerCase().endsWith("seed.sql"),
        );

        const activeQuery =
          activeFile?.content ??
          files.find((f) => f.path.toLowerCase().endsWith("query.sql"))?.content ??
          args.code ??
          "";

        return runViaApi(
          {
            kind: "sql",
            language: "sql",
            dialect: args.sqlDialect ?? sqlDialect,
            code: activeQuery,
            schemaSql: canUseMultiFile ? (schemaFile?.content ?? "") : "",
            seedSql: canUseMultiFile ? (seedFile?.content ?? "") : "",
          },
          args.signal,
        );
      }

      const files = exportProjectFiles(nodes);
      const shouldUseMultiFile = canUseMultiFile && files.length > 1;

      if (!shouldUseMultiFile) {
        const singleSource = activeFile?.content ?? entryFile?.content ?? args.code ?? "";

        return runViaApi(
          {
            kind: "code",
            language: args.language,
            code: singleSource,
            stdin: args.stdin,
          },
          args.signal,
        );
      }

        const entryId = entryFileId ?? activeFileId;

        if (!entryId) {
            const singleSource =
                activeFile?.content ?? entryFile?.content ?? args.code ?? "";

            return runViaApi(
                {
                    kind: "code",
                    language: args.language,
                    code: singleSource,
                    stdin: args.stdin,
                },
                args.signal,
            );
        }

        const entry = pathOf(nodes, entryId);

        return runViaApi(
            {
                kind: "code",
                language: args.language,
                entry,
                files,
                stdin: args.stdin,
            },
            args.signal,
        );
    },
    [nodes, activeFile, entryFile, entryFileId, activeFileId, sqlDialect, canUseMultiFile],
  );

  return { onRunProject };
}
