"use client";

import {
  Anchor,
  Button,
  Fieldset,
  Group,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core";
import { useState } from "react";

import { updateRestaurant } from "@/app/actions";
import { SpecialDayFields } from "@/components/SpecialDayFields";
import { SpecialTimeFields } from "@/components/SpecialTimeFields";
import type { Restaurant } from "@/lib/types";

type RequiredField = "name" | "website" | "specialTitle" | "specialDescription";
type FieldErrors = Partial<Record<RequiredField, string>>;

function getRequiredFieldErrors(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!formData.get("name")?.toString().trim()) {
    errors.name = "Restaurant name is required.";
  }

  if (!formData.get("website")?.toString().trim()) {
    errors.website = "Website is required.";
  }

  if (!formData.get("specialTitle")?.toString().trim()) {
    errors.specialTitle = "Special title is required.";
  }

  if (!formData.get("specialDescription")?.toString().trim()) {
    errors.specialDescription = "Special details are required.";
  }

  return errors;
}

export function RestaurantEditForm({ restaurant }: { restaurant: Restaurant }) {
  const primarySpecial = restaurant.specials[0];
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmitCapture(event: React.FormEvent<HTMLFormElement>) {
    const nextFieldErrors = getRequiredFieldErrors(
      new FormData(event.currentTarget),
    );

    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      event.preventDefault();
    }
  }

  async function handleUpdateRestaurant(formData: FormData) {
    const nextFieldErrors = getRequiredFieldErrors(formData);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setAddressError(null);
    setIsSubmitting(true);

    try {
      const result = await updateRestaurant(formData);
      if (!result.ok) {
        if (result.field === "address") {
          setAddressError(result.message);
          window.alert(result.message);
          return;
        }

        window.alert(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(field: RequiredField) {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  return (
    <form action={handleUpdateRestaurant} onSubmitCapture={handleSubmitCapture}>
      <Stack gap="md" mt="md">
        <input name="restaurantId" type="hidden" value={restaurant.id} />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Restaurant name"
            name="name"
            defaultValue={restaurant.name}
            error={fieldErrors.name}
            onChange={() => clearFieldError("name")}
          />

          <TextInput
            label="Website"
            name="website"
            inputMode="url"
            defaultValue={restaurant.website}
            error={fieldErrors.website}
            onChange={() => clearFieldError("website")}
          />
        </SimpleGrid>

        <TextInput
          label="Address"
          name="address"
          defaultValue={restaurant.address}
          description="Only St. Johns County, FL locations are supported."
          error={addressError}
          onChange={() => setAddressError(null)}
        />

        <TextInput
          label="Logo URL override"
          name="logoUrl"
          type="url"
          placeholder="Leave blank to use website favicon"
        />

        <Fieldset legend="Happy hour special" radius="lg">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label="Special title"
                name="specialTitle"
                defaultValue={primarySpecial?.title ?? ""}
                error={fieldErrors.specialTitle}
                onChange={() => clearFieldError("specialTitle")}
              />

              <TextInput
                label="Details"
                name="specialDescription"
                defaultValue={primarySpecial?.description ?? ""}
                error={fieldErrors.specialDescription}
                onChange={() => clearFieldError("specialDescription")}
              />
            </SimpleGrid>

            <SpecialTimeFields
              defaultAllDay={primarySpecial?.allDay ?? false}
              defaultStartTime={primarySpecial?.startTime}
              defaultEndTime={primarySpecial?.endTime}
            />
            <SpecialDayFields defaultDays={primarySpecial?.days} />
          </Stack>
        </Fieldset>

        <Group justify="flex-end">
          <Anchor href={restaurant.website} target="_blank">
            Preview website
          </Anchor>
          <Button type="submit" color="dark" loading={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
