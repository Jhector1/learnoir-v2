type CloudinaryImageOpts = {
  w?: number;
  h?: number;
  crop?: "fill" | "fit" | "scale" | "crop";
  gravity?: "auto" | "center" | "faces";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
  dpr?: "auto" | number;
};

function encPublicId(publicId: string) {
  // keep folder slashes, but encode other chars safely
  return encodeURIComponent(publicId).replace(/%2F/g, "/");
}

export function cloudinaryImageUrl(publicId: string, opts: CloudinaryImageOpts = {}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // If env isn't set, return empty and let caller fallback.
  if (!cloudName) return "";

  const {
    w = 1200,
    h = 320,
    crop = "fill",
    gravity = "auto",
    quality = "auto",
    format = "auto",
    dpr = "auto",
  } = opts;

  const tr = [
    `f_${format}`,
    `q_${quality}`,
    `c_${crop}`,
    `g_${gravity}`,
    `w_${w}`,
    `h_${h}`,
    `dpr_${dpr}`,
  ].join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${tr}/${encPublicId(publicId)}`;
}
