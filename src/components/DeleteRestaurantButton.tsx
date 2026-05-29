"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteRestaurant } from "@/app/actions";

export function DeleteRestaurantButton({
  restaurantId,
  name,
}: {
  restaurantId: string;
  name: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const formData = new FormData();
      formData.set("restaurantId", restaurantId);
      const result = await deleteRestaurant(formData);

      if (!result.ok) {
        window.alert(result.message);
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      color="red"
      size="xs"
      variant="light"
      loading={isDeleting}
      onClick={handleDelete}
    >
      Delete
    </Button>
  );
}
