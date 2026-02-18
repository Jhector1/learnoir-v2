// src/lib/review/modules/linear_algebra/analyticGeometryModule.ts
import type { ReviewModule } from "@/lib/subjects/types";
import {
    LA_SECTION_MOD4,
    LA_TOPIC_MOD4,
} from "@/lib/practice/catalog/subjects/linear_algebra/slugs";
import {
    LA_SUBJECT_SLUG,
    LA_MOD4,
} from "../../../../../prisma/seed/data/subjects/linear-algebra/constants";

const T4 = LA_TOPIC_MOD4 as Record<string, string>;

export const analyticGeometryModule: ReviewModule = {
    id: LA_MOD4,
    title: "Analytic Geometry",
    subtitle:
        "Lengths, distances, angles, inner products, orthogonality, projections, Gram–Schmidt, and rotations",

    startPracticeHref: (topicSlug) =>
        `/practice?section=${LA_SECTION_MOD4}&difficulty=easy&topic=${encodeURIComponent(
            topicSlug,
        )}`,

    topics: [
        // ------------------------------------------------------------
        // 1) Vector norms (matches seed id: vec_norms)
        // ------------------------------------------------------------
        {
            id: "vec_norms",
            label: "Vector norms: what “length” means (ℓ1 vs ℓ2)",
            minutes: 14,
            summary:
                "A norm turns a vector into a length. ℓ1 makes diamonds, ℓ2 makes circles. The triangle inequality is the key rule.",
            cards: [
                {
                    type: "text",
                    id: "ag_n_t1",
                    title: "A norm = a length function",
                    markdown: String.raw`
A **norm** is a rule that assigns a **length** to every vector:

$$
\|x\|\in \mathbb{R}
$$

It must satisfy (for any vectors $x,y$ and scalar $\lambda$):

1) **Positive:** $\|x\|\ge 0$, and $\|x\|=0 \iff x=0$  
2) **Scaling:** $\|\lambda x\| = |\lambda|\,\|x\|$  
3) **Triangle inequality:** $\|x+y\|\le \|x\|+\|y\|$

**Intuition:** “Going straight is never longer than detouring.”
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_n_t2",
                    title: "Two famous norms",
                    markdown: String.raw`
### Manhattan / $\ell_1$
$$
\|x\|_1 = \sum_{i=1}^n |x_i|
$$

### Euclidean / $\ell_2$
$$
\|x\|_2 = \sqrt{\sum_{i=1}^n x_i^2} = \sqrt{x^\top x}
$$

**Concrete example:** for $x=\begin{bmatrix}3\\-4\end{bmatrix}$
- $\|x\|_1 = |3|+|{-4}| = 7$
- $\|x\|_2 = \sqrt{3^2+(-4)^2} = 5$
`.trim(),
                },
                {
                    type: "sketch",
                    id: "ag_n_s1",
                    title: "Unit balls: ℓ1 (diamond) vs ℓ2 (circle)",
                    sketchId: "geo.norm_unitballs",
                    height: 420,
                },
                {
                    type: "quiz",
                    id: "ag_n_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["vec_norms"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },
        // ------------------------------------------------------------
// 1b) Lengths + distances (matches seed id: lengths_distances)
// ------------------------------------------------------------
        {
            id: "lengths_distances",
            label: "Lengths + distances (‖x−y‖)",
            minutes: 12,
            summary:
                "Distance between two points is the norm of their difference. Squared distance is often used to avoid square roots.",
            cards: [
                {
                    type: "text",
                    id: "ag_ld_t1",
                    title: "Distance = norm of a difference",
                    markdown: String.raw`
Given two points (vectors) $x,y\in\mathbb{R}^2$:

$$
d(x,y)=\|x-y\|_2
$$

Write $\Delta = x-y$:
$$
\Delta=\begin{bmatrix}x_1-y_1\\x_2-y_2\end{bmatrix}
$$

Then:
$$
d(x,y)=\sqrt{(x_1-y_1)^2+(x_2-y_2)^2}
$$

**Squared distance** (common in optimization):
$$
d(x,y)^2=(x_1-y_1)^2+(x_2-y_2)^2
$$
`.trim(),
                },
                {
                    type: "sketch",
                    id: "ag_ld_s1",
                    title: "Distance between two points (drag x/y)",
                    sketchId: "geo.distance",
                    height: 420,
                },
                {
                    type: "quiz",
                    id: "ag_ld_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["lengths_distances"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },


        // ------------------------------------------------------------
        // 2) Inner product (matches seed id: inner_product)
        // ------------------------------------------------------------
        {
            id: "inner_product",
            label: "Inner products: similarity + weighted dot products",
            minutes: 18,
            summary:
                "⟨x,y⟩ is a generalized dot product. With ⟨x,y⟩ = xᵀAy, the matrix A defines the geometry.",
            cards: [
                {
                    type: "text",
                    id: "ag_ip_t1",
                    title: "⟨x,y⟩ is an inner product",
                    markdown: String.raw`
An **inner product** is a function that takes two vectors and returns a number:

$$
\langle x, y\rangle \in \mathbb{R}
$$

Think: **alignment / similarity score**.

Most common in $\mathbb{R}^n$ is the **dot product**:
$$
\langle x,y\rangle = x^\top y = \sum_{i=1}^n x_i y_i
$$

**Concrete:** $x=\begin{bmatrix}1\\2\end{bmatrix}$, $y=\begin{bmatrix}3\\4\end{bmatrix}$
$$
x^\top y = 1\cdot3 + 2\cdot4 = 11
$$
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_ip_t2",
                    title: "General inner product: ⟨x,y⟩ = xᵀAy (a new geometry)",
                    markdown: String.raw`
A very common general form is:

$$
\langle x, y\rangle = x^\top A y
$$

where $A$ is **symmetric positive definite (SPD)**.

### Concrete computation (step-by-step)
Let

$$
x=\begin{bmatrix}1\\2\end{bmatrix},\quad
y=\begin{bmatrix}3\\4\end{bmatrix},\quad
A=\begin{bmatrix}2&1\\1&2\end{bmatrix}
$$

1) Compute $Ay$:

$$
Ay=\begin{bmatrix}2&1\\1&2\end{bmatrix}\begin{bmatrix}3\\4\end{bmatrix}
=\begin{bmatrix}10\\11\end{bmatrix}
$$

2) Then $x^\top(Ay)$:

$$
x^\top Ay = \begin{bmatrix}1&2\end{bmatrix}\begin{bmatrix}10\\11\end{bmatrix}
=10+22=32
$$

So **⟨x,y⟩ = 32** (different from the normal dot product 11).
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_ip_t3",
                    title: "Functions can have inner products too",
                    markdown: String.raw`
For functions $u(x)$ and $v(x)$, a common inner product is:

$$
\langle u,v\rangle = \int_a^b u(x)\,v(x)\,dx
$$

Same idea:
- norm: $\|u\|=\sqrt{\langle u,u\rangle}$
- orthogonal: $\langle u,v\rangle=0$
`.trim(),
                },
                {
                    type: "sketch",
                    id: "ag_ip_s1",
                    title: "Same vectors, different inner product (A changes angle/length)",
                    sketchId: "geo.inner_product_geometry",
                    height: 440,
                },
                {
                    type: "quiz",
                    id: "ag_ip_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["inner_product"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 3) Orthogonality (matches seed id: orthogonality)
        // ------------------------------------------------------------
        {
            id: "orthogonality",
            label: "Angles + orthogonality (when ⟨x,y⟩ = 0)",
            minutes: 18,
            summary:
                "Angles come from cos(ω)=⟨x,y⟩/(‖x‖‖y‖). Orthogonal means ⟨x,y⟩=0. Orthonormal means orthogonal + length 1.",
            cards: [
                {
                    type: "text",
                    id: "ag_ang_t1",
                    title: "Angle formula (from inner product)",
                    markdown: String.raw`
For nonzero vectors $x,y$:

$$
\cos(\omega)=\frac{\langle x,y\rangle}{\|x\|\|y\|}
$$

**Concrete (dot product):**  
Let $x=\begin{bmatrix}1\\1\end{bmatrix}$ and $y=\begin{bmatrix}1\\2\end{bmatrix}$.

$$
x^\top y=3,\quad \|x\|=\sqrt2,\quad \|y\|=\sqrt5
$$

So:

$$
\cos\omega = \frac{3}{\sqrt{10}}\approx 0.9487
$$
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_ang_t2",
                    title: "Orthogonal vs orthonormal",
                    markdown: String.raw`
- **Orthogonal:** $x\perp y \iff \langle x,y\rangle=0$
- **Orthonormal:** orthogonal **and** $\|x\|=\|y\|=1$

**Concrete:**  
Let $x=\begin{bmatrix}1\\0\end{bmatrix}$ and $y=\begin{bmatrix}0\\5\end{bmatrix}$.

$$
x^\top y = 0
$$

Normalize $y$:

$$
\hat y = \frac{1}{\|y\|}y=\frac{1}{5}\begin{bmatrix}0\\5\end{bmatrix}
=\begin{bmatrix}0\\1\end{bmatrix}
$$
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_oc_t1",
                    title: "Orthogonal complement U⊥ (everything perpendicular to U)",
                    markdown: String.raw`
Given a subspace $U\subseteq V$, the **orthogonal complement** is:

$$
U^\perp = \{v\in V:\ \langle v,u\rangle=0 \text{ for all } u\in U\}
$$

**3D intuition:**  
If $U$ is a plane through the origin, then $U^\perp$ is the **line** along the plane’s **normal direction**.
`.trim(),
                },
                {
                    type: "sketch",
                    id: "ag_ang_s1",
                    title: "Angle + orthogonality explorer (drag vectors)",
                    sketchId: "geo.angle_orthogonality",
                    height: 460,
                },
                {
                    type: "quiz",
                    id: "ag_ang_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["orthogonality"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 4) Projection onto a line (matches seed id: projection_line)
        // ------------------------------------------------------------
        {
            id: "projection_line",
            label: "Orthogonal projection onto a line (closest point)",
            minutes: 18,
            summary:
                "Project x onto span(b) using π(x) = (bᵀx / bᵀb) b. The error x−π(x) is perpendicular to b.",
            cards: [
                {
                    type: "text",
                    id: "ag_pl_t1",
                    title: "Projection onto a line: one clean formula",
                    markdown: String.raw`
Let the line be $U=\text{span}(b)$.

The orthogonal projection of $x$ onto $U$ is:

$$
\pi_U(x)=\frac{\langle x,b\rangle}{\langle b,b\rangle}b
$$

With dot product:

$$
\pi_U(x)=\frac{b^\top x}{b^\top b}b
$$

**Key geometry:** the error $x-\pi_U(x)$ is perpendicular to $b$.
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_pl_t2",
                    title: "Concrete example (numbers)",
                    markdown: String.raw`
Let:

$$
b=\begin{bmatrix}1\\2\end{bmatrix},\quad
x=\begin{bmatrix}3\\1\end{bmatrix}
$$

Compute:

$$
b^\top x = 5,\quad b^\top b = 5
$$

So:

$$
\pi_U(x)=\frac{5}{5}b=b=\begin{bmatrix}1\\2\end{bmatrix}
$$
`.trim(),
                },
                {
                    type: "sketch",
                    id: "ag_pl_s1",
                    title: "Drop the perpendicular: projection onto a line",
                    sketchId: "geo.projection_line",
                    height: 460,
                },
                {
                    type: "quiz",
                    id: "ag_pl_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["projection_line"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 5) Projection matrix (matches seed id: projection_matrix)
        // ------------------------------------------------------------
        {
            id: "projection_matrix",
            label: "Projection matrix P (onto a subspace) + least squares intuition",
            minutes: 22,
            summary:
                "Project onto col(B) with P = B(BᵀB)⁻¹Bᵀ. P is symmetric and idempotent (P²=P). This is least squares geometry.",
            cards: [
                {
                    type: "text",
                    id: "ag_pm_t1",
                    title: "Projection onto a subspace (columns of B)",
                    markdown: String.raw`
Let $U=\text{col}(B)$ where $B\in\mathbb{R}^{n\times m}$ has full column rank.

Projection:

$$
\pi_U(x)=B(B^\top B)^{-1}B^\top x
$$

Projection matrix:

$$
P = B(B^\top B)^{-1}B^\top
$$

Two key facts:

$$
P^2=P,\qquad P^\top=P
$$
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_pm_t2",
                    title: "Why normal equations appear (least squares)",
                    markdown: String.raw`
Write the projection as $B\lambda$ and force the error to be orthogonal to every column of $B$:

$$
B^\top(x-B\lambda)=0
$$

So:

$$
B^\top B\,\lambda = B^\top x
$$

That is the **normal equation**.
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_pm_t3",
                    title: "Affine projection (shift → project → shift back)",
                    markdown: String.raw`
An affine subspace looks like:

$$
L = x_0 + U
$$

To project $x$ onto $L$:

$$
\pi_L(x)=x_0+\pi_U(x-x_0)
$$

Mnemonic: **shift → project → unshift**.
`.trim(),
                },
                {
                    type: "sketch",
                    id: "ag_ps_s1",
                    title: "Project a cloud of points onto a line/plane (PCA intuition)",
                    sketchId: "geo.projection_dataset",
                    height: 460,
                },
                {
                    type: "quiz",
                    id: "ag_pm_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["projection_matrix"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 6) ONB coordinates (matches seed id: onb_coordinates)
        // ------------------------------------------------------------
        {
            id: "onb_coordinates",
            label: "Orthonormal bases: the cleanest coordinates",
            minutes: 14,
            summary:
                "In an ONB, coordinates are easy: λ = Bᵀx. Projections simplify and computations get faster/cleaner.",
            cards: [
                {
                    type: "text",
                    id: "ag_onb_t1",
                    title: "What an ONB is",
                    markdown: String.raw`
A basis $\{b_1,\dots,b_n\}$ is **orthonormal** if:

- $\langle b_i,b_j\rangle=0$ for $i\ne j$
- $\langle b_i,b_i\rangle=1$

If $B=[b_1\ \cdots\ b_n]$, then:

$$
B^\top B = I
$$
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_onb_t2",
                    title: "Best trick: coordinates are just dot products",
                    markdown: String.raw`
If the columns of $B$ form an ONB, then the coordinates of $x$ in that basis are:

$$
\lambda = B^\top x
$$

No solving systems. No inverse.

**Mini example:**

$$
b_1=\frac{1}{\sqrt2}\begin{bmatrix}1\\1\end{bmatrix},\quad
b_2=\frac{1}{\sqrt2}\begin{bmatrix}1\\-1\end{bmatrix}
$$

Then $B=[b_1\ b_2]$ is orthonormal, and $\lambda=B^\top x$.
`.trim(),
                },
                {
                    type: "quiz",
                    id: "ag_onb_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["onb_coordinates"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 7) Orthogonal matrices (matches seed id: orthogonal_matrices)
        // ------------------------------------------------------------
        {
            id: "orthogonal_matrices",
            label: "Orthogonal matrices: preserve lengths + angles (rotations/reflections)",
            minutes: 16,
            summary:
                "Q is orthogonal if QᵀQ=I. Then Q⁻¹=Qᵀ and it preserves distances/angles (rotations + reflections).",
            cards: [
                {
                    type: "text",
                    id: "ag_om_t1",
                    title: "Definition + the best consequence",
                    markdown: String.raw`
A square matrix $Q$ is **orthogonal** if:

$$
Q^\top Q = I
$$

Big win:

$$
Q^{-1}=Q^\top
$$
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_om_t2",
                    title: "Why orthogonal matrices are special",
                    markdown: String.raw`
With the dot product:

$$
\|Qx\|^2 = (Qx)^\top(Qx)=x^\top Q^\top Q x = x^\top x=\|x\|^2
$$

So orthogonal transforms **preserve lengths**.

Also:

$$
\|Qx-Qy\|=\|x-y\|
$$
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_rot_t1",
                    title: "2D rotation matrix (a classic orthogonal matrix)",
                    markdown: String.raw`
Rotate by angle $\theta$ (counterclockwise):

$$
R(\theta)=
\begin{bmatrix}
\cos\theta & -\sin\theta\\
\sin\theta & \cos\theta
\end{bmatrix}
$$
`.trim(),
                },
                {
                    type: "sketch",
                    id: "ag_rot_s1",
                    title: "Rotation pad (2D) + plane rotation demo",
                    sketchId: "geo.rotations_givens",
                    height: 460,
                },
                {
                    type: "quiz",
                    id: "ag_om_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["orthogonal_matrices"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 8) Gram–Schmidt (matches seed id: gram_schmidt)
        // ------------------------------------------------------------
        {
            id: "gram_schmidt",
            label: "Gram–Schmidt: turn any basis into an orthonormal basis",
            minutes: 18,
            summary:
                "Build perpendicular vectors by subtracting projections. Then normalize. This is the engine behind many stable algorithms.",
            cards: [
                {
                    type: "text",
                    id: "ag_gs_t1",
                    title: "Algorithm (in plain language)",
                    markdown: String.raw`
Given a basis $b_1,\dots,b_n$:

- keep $u_1=b_1$
- make $b_2$ perpendicular to $u_1$ by removing its projection
- make $b_3$ perpendicular to span$(u_1,u_2)$ by removing that projection
- etc.

Formally:

$$
u_1=b_1
$$

$$
u_k=b_k - \pi_{\text{span}(u_1,\dots,u_{k-1})}(b_k)
$$

Then normalize:

$$
\hat u_k = \frac{u_k}{\|u_k\|}
$$
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_gs_t2",
                    title: "Concrete 2D example",
                    markdown: String.raw`
Let:

$$
b_1=\begin{bmatrix}2\\0\end{bmatrix},\quad
b_2=\begin{bmatrix}1\\1\end{bmatrix}
$$

1) $u_1=b_1$

2) Project $b_2$ onto $u_1$:

$$
\pi(b_2)=\frac{u_1^\top b_2}{u_1^\top u_1}u_1
=\frac{2}{4}\begin{bmatrix}2\\0\end{bmatrix}
=\begin{bmatrix}1\\0\end{bmatrix}
$$

3) Subtract:

$$
u_2=b_2-\pi(b_2)=\begin{bmatrix}0\\1\end{bmatrix}
$$
`.trim(),
                },
                {
                    type: "sketch",
                    id: "ag_gs_s1",
                    title: "Gram–Schmidt builder (watch projections get subtracted)",
                    sketchId: "mod4.gs",
                    height: 460,
                },
                {
                    type: "quiz",
                    id: "ag_gs_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["gram_schmidt"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 9) Weighted inner product (matches seed id: weighted_inner_product)
        // ------------------------------------------------------------
        {
            id: "weighted_inner_product",
            label: "Weighted inner product ⟨x,y⟩ = xᵀAy",
            minutes: 14,
            summary:
                "A weighted inner product uses a matrix A to define geometry. If A is SPD, it behaves like a real inner product.",
            cards: [
                {
                    type: "text",
                    id: "ag_wip_t1",
                    title: "Definition + why A must be special",
                    markdown: String.raw`
A common weighted inner product is:

$$
\langle x,y\rangle_A = x^\top A y
$$

To behave like a real inner product, $A$ is typically **symmetric positive definite (SPD)**.
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_wip_t2",
                    title: "Concrete computation",
                    markdown: String.raw`
Let

$$
x=\begin{bmatrix}1\\2\end{bmatrix},\quad
y=\begin{bmatrix}3\\4\end{bmatrix},\quad
A=\begin{bmatrix}2&1\\1&2\end{bmatrix}
$$

Then:

$$
Ay=\begin{bmatrix}10\\11\end{bmatrix}
$$

and

$$
x^\top Ay = \begin{bmatrix}1&2\end{bmatrix}\begin{bmatrix}10\\11\end{bmatrix}=32
$$
`.trim(),
                },
                {
                    type: "quiz",
                    id: "ag_wip_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["weighted_inner_product"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 10) SPD (matches seed id: spd)
        // ------------------------------------------------------------
        {
            id: "spd",
            label: "SPD matrices: the ones that define valid inner products",
            minutes: 14,
            summary:
                "A is SPD if it’s symmetric and xᵀAx > 0 for all nonzero x. SPD matrices are everywhere in ML and optimization.",
            cards: [
                {
                    type: "text",
                    id: "ag_spd_t1",
                    title: "What ‘SPD’ means",
                    markdown: String.raw`
A matrix $A$ is **symmetric positive definite (SPD)** if:

1) **Symmetric:**
$$
A^\top = A
$$

2) **Positive definite:** for every nonzero $x$,
$$
x^\top A x > 0
$$

If it’s only $\ge 0$, it’s **positive semidefinite (PSD)**.
`.trim(),
                },
                {
                    type: "text",
                    id: "ag_spd_t2",
                    title: "Concrete: one SPD and one not SPD",
                    markdown: String.raw`
Let:

$$
A_1=\begin{bmatrix}2&0\\0&1\end{bmatrix},
\qquad
A_2=\begin{bmatrix}1&2\\2&1\end{bmatrix}
$$

- $A_1$ is SPD because for any $x\ne 0$,
$$
x^\top A_1 x = 2x_1^2 + x_2^2 > 0
$$

- $A_2$ is symmetric, but **not** SPD. Take
$$
x=\begin{bmatrix}1\\-1\end{bmatrix}
$$
Then
$$
\begin{aligned}
x^\top A_2 x
  &= \begin{bmatrix}1&-1\end{bmatrix}
     \begin{bmatrix}1&2\\2&1\end{bmatrix}
     \begin{bmatrix}1\\-1\end{bmatrix} \\
  &= \begin{bmatrix}1&-1\end{bmatrix}
     \begin{bmatrix}-1\\1\end{bmatrix} \\
  &= -2 < 0
\end{aligned}
$$

So it fails positive definiteness.
`.trim(),
                },
                {
                    type: "quiz",
                    id: "ag_spd_q1",
                    title: "Quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["spd"],
                        difficulty: "easy",
                        n: 4,
                        allowReveal: true,
                    },
                },
            ],
        },

        // ------------------------------------------------------------
        // 11) Mixed (matches seed id: mod4_mix)
        // ------------------------------------------------------------
        {
            id: "mod4_mix",
            label: "Inner Products — Mixed",
            minutes: 10,
            summary:
                "Mixed practice across norms, inner products, orthogonality, projections, ONB, Gram–Schmidt, and SPD.",
            cards: [
                {
                    type: "quiz",
                    id: "ag_mix_q1",
                    title: "Mixed quick check",
                    spec: {
                        subject: LA_SUBJECT_SLUG,
                        module: LA_MOD4,
                        section: LA_SECTION_MOD4,
                        topic: T4["mod4_mix"],
                        difficulty: "easy",
                        n: 6,
                        allowReveal: true,
                    },
                },
            ],
        },
    ],
};
