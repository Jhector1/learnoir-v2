// prisma/seed/data/subjects/linear-algebra/topics.ts
import {LA_MOD0, LA_MOD1, LA_MOD2, LA_MOD3, LA_MOD4} from "./constants";
import type { TopicDef, TopicDefCompat } from "../_types";

export const LA_TOPICS = {
  [LA_MOD0]: [
    {
      id: "dot",
      meta: {
        label: "Dot product",
        minutes: 0,
        pool: [
          { key: "dot_basic_compute", w: 5, kind: "numeric" },
          { key: "dot_sign_and_magnitude", w: 3, kind: "single_choice" },
          { key: "dot_orthogonal_zero", w: 4, kind: "single_choice" },
          { key: "dot_distributive", w: 2, kind: "single_choice" },
          { key: "dot_scalar_pullout", w: 2, kind: "single_choice" },
          // if you have interactive ones later:
          // { key: "dot_drag_vector", w: 2, kind: "vector_drag_dot" },
        ],
      },
    },

    {
      id: "vectors",
      meta: {
        label: "Vectors (overview)",
        minutes: 0,
        pool: [
          { key: "vec_components_read", w: 4, kind: "single_choice" },
          { key: "vec_addition_basic", w: 4, kind: "vector_drag_target" }, // example
          { key: "vec_subtraction_basic", w: 3, kind: "vector_drag_target" }, // example
          { key: "vec_scalar_multiply", w: 4, kind: "single_choice" },
          { key: "vec_linear_combination", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "angle",
      meta: {
        label: "Angle between vectors",
        minutes: 0,
        pool: [
          { key: "angle_from_dot_formula", w: 5, kind: "numeric" },
          { key: "angle_orthogonal_case", w: 4, kind: "single_choice" },
          { key: "angle_parallel_case", w: 3, kind: "single_choice" },
          { key: "angle_unit_vectors", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "projection",
      meta: {
        label: "Vector projection",
        minutes: 0,
        pool: [
          { key: "proj_compute_onto_vector", w: 5, kind: "numeric" },
          { key: "proj_scalar_component", w: 3, kind: "single_choice" },
          { key: "proj_orthogonal_component", w: 3, kind: "single_choice" },
          { key: "proj_geometry_interpret", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "vectors_part1",
      meta: {
        label: "Vectors — Part 1",
        minutes: 0,
        pool: [
          { key: "vec_components_read", w: 3, kind: "single_choice" },
          { key: "vec_addition_basic", w: 3, kind: "vector_drag_target" }, // example
          { key: "vec_scalar_multiply", w: 3, kind: "single_choice" },
          { key: "dot_basic_compute", w: 3, kind: "numeric" },
          { key: "angle_from_dot_formula", w: 2, kind: "numeric" },
        ],
      },
    },

    {
      id: "vectors_part2",
      meta: {
        label: "Vectors — Part 2",
        minutes: 0,
        pool: [
          { key: "proj_compute_onto_vector", w: 4, kind: "numeric" },
          { key: "proj_orthogonal_component", w: 3, kind: "single_choice" },
          { key: "dot_orthogonal_zero", w: 3, kind: "single_choice" },
          { key: "angle_from_dot_formula", w: 2, kind: "numeric" },
        ],
      },
    },
  ],

  [LA_MOD1]: [
    {
      id: "linear_systems",
      meta: {
        label: "Linear systems",
        minutes: 0,
        pool: [
          { key: "sys_equations_to_matrix", w: 4, kind: "single_choice" },
          { key: "sys_count_unknowns_equations", w: 3, kind: "single_choice" },
          { key: "sys_solution_check", w: 4, kind: "single_choice" },
          { key: "sys_classify_solution_count", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "augmented",
      meta: {
        label: "Augmented matrices",
        minutes: 0,
        pool: [
          { key: "aug_build_from_system", w: 4, kind: "matrix_input" }, // example
          { key: "aug_read_back_to_system", w: 3, kind: "single_choice" },
          {
            key: "aug_identify_coeff_vs_constants",
            w: 4,
            kind: "single_choice",
          },
        ],
      },
    },

    {
      id: "rref",
      meta: {
        label: "RREF",
        minutes: 0,
        pool: [
          { key: "rref_identify_pivots", w: 4, kind: "single_choice" },
          { key: "rref_one_step_operation", w: 3, kind: "single_choice" },
          { key: "rref_final_form_recognize", w: 3, kind: "single_choice" },
          { key: "rref_solve_from_rref", w: 4, kind: "matrix_input" }, // example
        ],
      },
    },

    {
      id: "solution_types",
      meta: {
        label: "Solution types",
        minutes: 0,
        pool: [
          { key: "sol_unique_vs_infinite", w: 4, kind: "single_choice" },
          { key: "sol_inconsistent_row_detect", w: 4, kind: "single_choice" },
          { key: "sol_free_variable_detect", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "parametric",
      meta: {
        label: "Parametric solutions",
        minutes: 0,
        pool: [
          {
            key: "param_write_solution_vector_form",
            w: 4,
            kind: "single_choice",
          },
          { key: "param_choose_free_vars", w: 3, kind: "single_choice" },
          {
            key: "param_extract_direction_vectors",
            w: 3,
            kind: "single_choice",
          },
        ],
      },
    },
  ],

  [LA_MOD2]: [
    {
      id: "matrix_ops",
      meta: {
        label: "Matrix operations (core)",
        minutes: 0,
        pool: [
          { key: "mat_add_sub_basic", w: 4, kind: "matrix_input" }, // example
          { key: "mat_scalar_multiply_basic", w: 4, kind: "matrix_input" }, // example
          { key: "mat_entrywise_ops", w: 3, kind: "single_choice" },
          {
            key: "mat_check_same_shape_requirement",
            w: 3,
            kind: "single_choice",
          },
        ],
      },
    },

    {
      id: "matrix_inverse",
      meta: {
        label: "Matrix inverse",
        minutes: 0,
        pool: [
          { key: "inv_2x2_compute", w: 5, kind: "matrix_input" }, // example
          {
            key: "inv_check_by_multiplying_identity",
            w: 3,
            kind: "single_choice",
          },
          { key: "inv_exists_det_nonzero_2x2", w: 3, kind: "single_choice" },
          { key: "inv_solve_axb_using_inverse", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "matrix_properties",
      meta: {
        label: "Matrix properties",
        minutes: 0,
        pool: [
          { key: "prop_identity_multiplication", w: 4, kind: "single_choice" },
          {
            key: "prop_noncommutative_counterexample",
            w: 3,
            kind: "single_choice",
          },
          { key: "prop_associative_grouping", w: 3, kind: "single_choice" },
          { key: "prop_distributive_expand", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "matrices_intro",
      meta: {
        label: "Matrices: intro",
        minutes: 0,
        pool: [
          { key: "intro_read_shape_mxn", w: 4, kind: "single_choice" },
          { key: "intro_count_entries", w: 3, kind: "single_choice" },
          { key: "intro_row_vs_column_interpret", w: 3, kind: "single_choice" },
          { key: "intro_column_vectors_view", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "index_slice",
      meta: {
        label: "Indexing + slicing",
        minutes: 0,
        pool: [
          { key: "index_get_entry_aij", w: 5, kind: "single_choice" },
          {
            key: "index_convert_math_to_zero_based",
            w: 3,
            kind: "single_choice",
          },
          { key: "slice_row_column_extract", w: 3, kind: "single_choice" },
          { key: "slice_predict_result_shape", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "special",
      meta: {
        label: "Special matrices",
        minutes: 0,
        pool: [
          { key: "special_identity_recognize", w: 4, kind: "single_choice" },
          { key: "special_diagonal_recognize", w: 4, kind: "single_choice" },
          { key: "special_zero_matrix", w: 3, kind: "single_choice" },
          { key: "special_symmetric_check", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "elementwise_shift",
      meta: {
        label: "Elementwise ops + shifting",
        minutes: 0,
        pool: [
          { key: "elemwise_add_sub", w: 4, kind: "matrix_input" }, // example
          { key: "elemwise_multiply_hadamard", w: 3, kind: "matrix_input" }, // example
          {
            key: "shift_add_scalar_to_all_entries",
            w: 3,
            kind: "single_choice",
          },
          { key: "shift_add_scalar_to_diagonal", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "matmul",
      meta: {
        label: "Matrix multiplication (matmul)",
        minutes: 0,
        pool: [
          { key: "matmul_is_defined_shape_check", w: 4, kind: "single_choice" },
          { key: "matmul_compute_entry_rowcol", w: 5, kind: "matrix_input" }, // example
          { key: "matmul_compute_small_2x2", w: 4, kind: "matrix_input" }, // example
          { key: "matmul_result_shape", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "matvec",
      meta: {
        label: "Matrix–vector multiplication",
        minutes: 0,
        pool: [
          { key: "matvec_compute_numeric", w: 5, kind: "numeric" },
          {
            key: "matvec_linear_combo_of_columns",
            w: 4,
            kind: "single_choice",
          },
          { key: "matvec_shape_check", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "transpose_liveevil",
      meta: {
        label: "Transpose (live/evil intuition)",
        minutes: 0,
        pool: [
          { key: "transpose_compute", w: 4, kind: "matrix_input" }, // example
          { key: "transpose_shape_rule", w: 3, kind: "single_choice" },
          { key: "transpose_of_product_rule", w: 4, kind: "single_choice" },
          { key: "transpose_of_sum_rule", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "symmetric",
      meta: {
        label: "Symmetric matrices",
        minutes: 0,
        pool: [
          { key: "sym_check_a_equals_at", w: 5, kind: "single_choice" },
          { key: "sym_fill_missing_entry", w: 3, kind: "matrix_input" }, // example
          { key: "sym_properties_true_false", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "matrices_part1_mix",
      variant: null, // ✅ mixed
      meta: {
        label: "Matrices — Part 1 (mixed)",
        minutes: 0,
        // pool intentionally omitted (generator falls back to SAFE_MIXED_POOL for that genKey)
      },
    },
  ],

  [LA_MOD3]: [
    {
      id: "norms",
      meta: {
        label: "Norms",
        minutes: 0,
        pool: [
          { key: "norm_compute_l2", w: 5, kind: "numeric" },
          { key: "norm_compare_vectors", w: 3, kind: "single_choice" },
          { key: "norm_unit_vector", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "colspace",
      meta: {
        label: "Column space",
        minutes: 0,
        pool: [
          { key: "colspace_span_columns", w: 4, kind: "single_choice" },
          { key: "colspace_membership_check", w: 4, kind: "single_choice" },
          {
            key: "colspace_pivot_columns_from_rref",
            w: 3,
            kind: "single_choice",
          },
        ],
      },
    },

    {
      id: "nullspace",
      meta: {
        label: "Null space",
        minutes: 0,
        pool: [
          { key: "nullspace_solve_ax0", w: 5, kind: "matrix_input" }, // example
          { key: "nullspace_basis_from_rref", w: 4, kind: "matrix_input" }, // example
          { key: "nullspace_membership_check", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "rank",
      meta: {
        label: "Rank",
        minutes: 0,
        pool: [
          { key: "rank_from_rref_pivots", w: 5, kind: "single_choice" },
          { key: "rank_full_rank_check", w: 3, kind: "single_choice" },
          { key: "rank_vs_nullity_relation", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "det",
      meta: {
        label: "Determinant",
        minutes: 0,
        pool: [
          { key: "det_2x2_compute", w: 5, kind: "numeric" },
          { key: "det_invertible_iff_nonzero", w: 4, kind: "single_choice" },
          { key: "det_effect_row_swap_scale", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "charpoly",
      meta: {
        label: "Characteristic polynomial",
        minutes: 0,
        pool: [
          {
            key: "charpoly_2x2_setup_lambdaI_minus_A",
            w: 4,
            kind: "single_choice",
          },
          { key: "charpoly_2x2_expand", w: 4, kind: "single_choice" },
          {
            key: "charpoly_eigenvalue_roots_relation",
            w: 2,
            kind: "single_choice",
          },
        ],
      },
    },

    {
      id: "matrices_part2_mix",
      variant: null, // ✅ mixed
      meta: {
        label: "Matrices — Part 2 (mixed)",
        minutes: 0,
        // pool intentionally omitted
      },
    },
  ],

  // ============================================================
  // ✅ Module 4 — Inner Products & Orthogonality
  // ============================================================
  // ============================================================
// ✅ Module 4 — Inner Products & Orthogonality
// ============================================================
  [LA_MOD4]: [
    {
      id: "norms2",
      meta: {
        label: "Vector norms (length)",
        minutes: 0,
        pool: [
          { key: "norm_l2_compute", w: 5, kind: "numeric" },
          { key: "norm_l1_compute", w: 3, kind: "numeric" },
          { key: "norm_compare_two_vectors", w: 3, kind: "single_choice" },
          { key: "norm_unit_vector_concept", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "inner_products",
      meta: {
        label: "Inner product (dot product) meaning",
        minutes: 0,
        pool: [
          { key: "inner_basic_compute", w: 5, kind: "numeric" },
          { key: "inner_sign_angle_relation", w: 4, kind: "single_choice" },
          { key: "inner_bilinear_distribute", w: 2, kind: "single_choice" },
          { key: "inner_symmetry_property", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "angles_orthogonality",
      meta: {
        label: "Angles + orthogonality",
        minutes: 0,
        pool: [
          { key: "ortho_test_dot_zero", w: 5, kind: "single_choice" },
          { key: "ortho_find_missing_value_make_zero", w: 4, kind: "numeric" },
          { key: "ortho_angle_special_case_90", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "projection_line",
      meta: {
        label: "Projection onto a line (onto span(b))",
        minutes: 0,
        pool: [
          { key: "proj_scalar_component_compute", w: 4, kind: "numeric" },
          { key: "proj_vector_compute_2d", w: 5, kind: "matrix_input" },
          { key: "proj_residual_is_orthogonal", w: 3, kind: "single_choice" },
          { key: "proj_geometry_interpret", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "projection_matrix",
      meta: {
        label: "Projection matrix P (onto span(b))",
        minutes: 0,
        pool: [
          { key: "projmat_build_from_b", w: 5, kind: "matrix_input" },
          { key: "projmat_apply_to_vector", w: 4, kind: "matrix_input" },
          { key: "projmat_idempotent_p2_equals_p", w: 3, kind: "single_choice" },
          { key: "projmat_symmetric_pt_equals_p", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "onb",
      meta: {
        label: "Orthonormal basis coordinates",
        minutes: 0,
        pool: [
          { key: "onb_coords_equal_bt_x", w: 5, kind: "matrix_input" },
          { key: "onb_reconstruct_x_from_coords", w: 4, kind: "matrix_input" },
          { key: "onb_why_bt_b_equals_i", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "orthogonal_matrices",
      meta: {
        label: "Orthogonal matrices (QᵀQ = I)",
        minutes: 0,
        pool: [
          { key: "orthmat_check_qtq_identity", w: 5, kind: "single_choice" },
          { key: "orthmat_preserves_norm", w: 4, kind: "single_choice" },
          { key: "orthmat_preserves_dot_product", w: 3, kind: "single_choice" },
        ],
      },
    },

    {
      id: "gram_schmidt",
      meta: {
        label: "Gram–Schmidt (2 vectors)",
        minutes: 0,
        pool: [
          { key: "gs_compute_u2_remove_projection", w: 5, kind: "matrix_input" },
          { key: "gs_normalize_to_get_e1_e2", w: 4, kind: "matrix_input" },
          { key: "gs_why_result_is_orthogonal", w: 2, kind: "single_choice" },
        ],
      },
    },

    {
      id: "weighted_inner_product",
      meta: {
        label: "Weighted inner product ⟨x,y⟩ = xᵀAy",
        minutes: 0,
        pool: [
          { key: "wip_compute_xT_A_y", w: 5, kind: "numeric" },
          { key: "wip_symmetry_requirement", w: 4, kind: "single_choice" },
          { key: "wip_positive_definite_requirement", w: 4, kind: "single_choice" },
        ],
      },
    },

    {
      id: "spd",
      meta: {
        label: "SPD matrices (when xᵀAy is a real inner product)",
        minutes: 0,
        pool: [
          { key: "spd_2x2_check_conditions", w: 5, kind: "single_choice" },
          { key: "spd_2x2_det_and_a11_test", w: 4, kind: "single_choice" },
          { key: "spd_shift_by_alphaI_makes_spd", w: 3, kind: "single_choice" },
        ],
      },
    },

    // ------------------------------------------------------------
    // ✅ Review-only topics (no dedicated pool yet)
    // Put them in the section so they won't throw "not part of section".
    // Generator will fall back to SAFE_MIXED_POOL if pool is empty.
    // ------------------------------------------------------------
    {
      id: "lengths_distances",
      meta: {
        label: "Lengths + distances (‖x−y‖)",
        minutes: 0,
        pool: [
          { key: "dist_l2_compute_2d", w: 5, kind: "numeric" },
          { key: "dist_l2_compute_3d", w: 4, kind: "numeric" },
          { key: "dist_is_norm_of_difference", w: 4, kind: "single_choice" },
          { key: "dist_squared_distance", w: 3, kind: "numeric" },
          { key: "dist_translation_invariant", w: 2, kind: "single_choice" },
        ],
      },
    },
    { id: "orthogonal_complement", variant: null, meta: { label: "Orthogonal complement", minutes: 0 } },
    { id: "inner_product_functions", variant: null, meta: { label: "Inner products of functions", minutes: 0 } },
    { id: "projection_subspace", variant: null, meta: { label: "Projection onto a subspace", minutes: 0 } },
    { id: "projection_affine", variant: null, meta: { label: "Projection onto affine spaces", minutes: 0 } },
    { id: "rotations", variant: null, meta: { label: "Rotations", minutes: 0 } },

    // Keep your mixed topic too if you want it explicitly selectable
    {
      id: "mod4_mix",
      variant: null,
      meta: {
        label: "Inner Products — Mixed",
        minutes: 0,
        // pool intentionally omitted
      },
    },
  ],

} satisfies Record<string, TopicDefCompat[]>;
