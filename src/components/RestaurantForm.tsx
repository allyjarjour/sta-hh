"use client";

import {
  Button,
  Fieldset,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { createRestaurant } from "@/app/actions";
import { SpecialDayFields } from "@/components/SpecialDayFields";
import { SpecialTimeFields } from "@/components/SpecialTimeFields";

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

export function RestaurantForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [resetKey, setResetKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmitCapture(event: React.FormEvent<HTMLFormElement>) {
    const nextFieldErrors = getRequiredFieldErrors(
      new FormData(event.currentTarget),
    );

    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      event.preventDefault();
    }
  }

  async function handleCreateRestaurant(formData: FormData) {
    const nextFieldErrors = getRequiredFieldErrors(formData);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    await createRestaurant(formData);
    formRef.current?.reset();
    setResetKey((currentKey) => currentKey + 1);
    router.refresh();
  }

  function clearFieldError(field: RequiredField) {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  return (
    <Paper p="xl" radius="xl" shadow="md" withBorder>
      <form
        ref={formRef}
        action={handleCreateRestaurant}
        onSubmitCapture={handleSubmitCapture}
      >
        <Stack gap="md">
          <div>
            <Text c="orange" fw={700} size="sm" tt="uppercase" lts={2}>
              Add a spot
            </Text>
            <Title order={2} mt={4}>
              List a participating restaurant
            </Title>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="Restaurant name"
              name="name"
              placeholder="The Corner Bistro"
              error={fieldErrors.name}
              onChange={() => clearFieldError("name")}
            />

            <TextInput
              label="Website"
              name="website"
              inputMode="url"
              placeholder="www.example.com"
              error={fieldErrors.website}
              onChange={() => clearFieldError("website")}
            />
          </SimpleGrid>

          <TextInput name="address" label="Address" placeholder="Optional" />

          <TextInput
            name="logoUrl"
            type="url"
            label="Logo URL override"
            placeholder="Optional"
          />

          <Fieldset legend="Happy hour special" radius="xl">
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label="Special title"
                  name="specialTitle"
                  placeholder="$6 margaritas"
                  error={fieldErrors.specialTitle}
                  onChange={() => clearFieldError("specialTitle")}
                />

                <TextInput
                  label="Details"
                  name="specialDescription"
                  placeholder="Tacos, margaritas, and draft beers at the bar"
                  error={fieldErrors.specialDescription}
                  onChange={() => clearFieldError("specialDescription")}
                />
              </SimpleGrid>

              <SpecialTimeFields key={`time-${resetKey}`} />

              <SpecialDayFields key={`day-${resetKey}`} />
            </Stack>
          </Fieldset>

          <Button type="submit" size="md" color="dark">
            Add happy hour
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
