"use server";

import { revalidatePath } from "next/cache";

import {
  createPackagingSchema,
  updatePackagingSchema,
  type CreatePackagingInput,
  type UpdatePackagingInput,
} from "@/lib/validate/packaging";
import { runServerAction } from "@/lib/server-actions";
import { client, HttpError } from "@/lib/http/client";
import type {
  PackagingGroupsResponse,
  PackagingResponse,
  PackagingsResponse,
} from "@/lib/api/types";

const PACKAGING_PATH = "/products/packaging";

export type FilterPackagingsParams = {
  search?: string;
  status?: number | "ALL";
  page?: number;
  page_size?: number;
};

export type { CreatePackagingInput, UpdatePackagingInput };

export async function filterPackagings(params: FilterPackagingsParams = {}) {
  try {
    const response = await client.get<PackagingsResponse>("/api/v1/packagings", { params });
    return { ok: true as const, data: response.data, meta: response.meta };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof HttpError ? error.message : "Không thể tải bao bì",
    };
  }
}

export async function fetchPackagingGroups() {
  try {
    const response = await client.get<PackagingGroupsResponse>("/api/v1/packaging-groups");
    return { ok: true as const, data: response.data ?? [] };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof HttpError ? error.message : "Không thể tải nhóm bao bì",
    };
  }
}

export async function getPackaging(id: number) {
  try {
    const response = await client.get<PackagingResponse>(`/api/v1/packagings/${id}`);
    return { ok: true as const, data: response.data };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof HttpError ? error.message : "Không thể tải chi tiết bao bì",
    };
  }
}

export async function createPackaging(payload: CreatePackagingInput) {
  return runServerAction(createPackagingSchema, payload, "Không thể tạo bao bì", async (input) => {
    await client.post("/api/v1/packagings", input);
    revalidatePath(PACKAGING_PATH);
    return { ok: true as const };
  });
}

export async function updatePackaging(payload: UpdatePackagingInput) {
  return runServerAction(updatePackagingSchema, payload, "Không thể cập nhật bao bì", async (input) => {
    const { id, ...body } = input;
    await client.put(`/api/v1/packagings/${id}`, body);
    revalidatePath(PACKAGING_PATH);
    return { ok: true as const };
  });
}
