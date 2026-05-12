"use client";

export function DeleteRestaurantButton({ name }: { name: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
      className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
    >
      Delete
    </button>
  );
}
