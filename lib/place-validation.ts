const categories = [
  "Nature",
  "Mountains",
  "Heritage",
  "Family",
  "Farms",
  "Adventure",
  "Parks",
  "Waterfalls",
  "Dams",
  "Scenic Views",
  "Activities",
];
export function validatePlace(input: Record<string, unknown>) {
  const text = (key: string, max: number, required = false) => {
    const value = input[key];
    if (
      typeof value !== "string" ||
      value.trim().length > max ||
      (required && !value.trim())
    )
      throw new Error(`Check ${key}.`);
    return value.trim();
  };
  const name = text("name", 120, true),
    description = text("description", 5000, true),
    shortDescription = text("shortDescription", 240, true),
    location = text("location", 150),
    category = text("category", 40, true),
    image = text("image", 250, true);
  if (!categories.includes(category)) throw new Error("Choose a category.");
  if (
    !/^\/(?:media\/[a-f0-9-]+\.(?:jpg|png|webp)|images\/destinations\/[a-z0-9-]+\.webp)$/.test(
      image,
    )
  )
    throw new Error("Upload a photo.");
  const price = input.price;
  if (
    price !== null &&
    (typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 1000000 ||
      Math.abs(price * 100 - Math.round(price * 100)) > 0.0001)
  )
    throw new Error("Enter a valid price with up to two decimal places.");
  const unit = text("unit", 60, true);
  if (!["per person", "per family", "per group", "per package"].includes(unit))
    throw new Error("Choose what the price applies to.");
  const revision = input.revision;
  if (!Number.isSafeInteger(revision) || Number(revision) < 0)
    throw new Error("Reload the place before saving.");
  return {
    name,
    description,
    shortDescription,
    location,
    category,
    image,
    price: price as number | null,
    unit,
    revision: Number(revision),
  };
}
