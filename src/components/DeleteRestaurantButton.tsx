"use client";

import { Button } from "@mantine/core";

export function DeleteRestaurantButton({ name }: { name: string }) {
  return (
    <Button
      type="submit"
      color="red"
      size="xs"
      variant="light"
      onClick={(event) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      Delete
    </Button>
  );
}
