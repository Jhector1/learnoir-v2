import { defineTopic } from "@/lib/practice/generator/engines/utils";
import { LA_TOPIC_MOD0 } from "@/lib/practice/catalog/subjects/linear_algebra/slugs";

import {
    makeLAStaticSingleChoiceHandler,
    type Handler,
    type TopicBundle,
} from "@/lib/practice/generator/engines/linear_algebra/_shared";

export const M0_NUMPY_POOL = [
    { key: "la_numpy_shapes_basic", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_numpy_column_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_numpy_transpose_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_numpy_broadcast_shape", w: 1, kind: "single_choice", purpose: "quiz" },
    { key: "la_numpy_list_vs_array", w: 1, kind: "single_choice", purpose: "quiz" },
] as const;

export type M0NumpyKey = (typeof M0_NUMPY_POOL)[number]["key"];

export const M0_NUMPY_HANDLERS: Record<M0NumpyKey, Handler> = {
    la_numpy_shapes_basic: makeLAStaticSingleChoiceHandler(
        "la_numpy_shapes_basic",
        "a",
        ["a", "b", "c", "d"],
        () => ({
            prompt: String.raw`
In NumPy:

~~~python
asArray = np.array([1, 2, 3])
rowVec  = np.array([[1, 2, 3]])
colVec  = np.array([[1], [2], [3]])
~~~

Which set of shapes is correct?
`.trim(),
        }),
    ),

    la_numpy_column_shape: makeLAStaticSingleChoiceHandler(
        "la_numpy_column_shape",
        "c",
        ["a", "b", "c", "d"],
    ),

    la_numpy_transpose_shape: makeLAStaticSingleChoiceHandler(
        "la_numpy_transpose_shape",
        "b",
        ["a", "b", "c", "d"],
    ),

    la_numpy_broadcast_shape: makeLAStaticSingleChoiceHandler(
        "la_numpy_broadcast_shape",
        "c",
        ["a", "b", "c", "d"],
    ),

    la_numpy_list_vs_array: makeLAStaticSingleChoiceHandler(
        "la_numpy_list_vs_array",
        "b",
        ["a", "b", "c", "d"],
    ),
};

export const LA_NUMPY_TOPIC: TopicBundle = defineTopic(
    LA_TOPIC_MOD0.numpy,
    M0_NUMPY_POOL as any,
    M0_NUMPY_HANDLERS as any,
);