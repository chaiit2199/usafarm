"use server";

import { revalidatePath } from "next/cache";

import {
  createDepartmentSchema,
  departmentIdSchema,
  rejectDepartmentSchema,
  updateDepartmentSchema,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
} from "@/lib/validate/departments";
import { runServerAction } from "@/lib/server-actions";
import { client, HttpError } from "@/lib/http/client";
import type { DepartmentsResponse } from "@/lib/api/types";

export type FilterDepartmentsParams = {
  search?: string;
  status?: number | "ALL";
  page?: number;
  page_size?: number;
};

export type { CreateDepartmentInput, UpdateDepartmentInput };

export async function createDepartment(payload: CreateDepartmentInput) {
  return runServerAction(createDepartmentSchema, payload, "Không thể tạo phòng ban", async (input) => {
    await client.post("/api/v1/departments", input);
    revalidatePath("/departments");
    return { ok: true as const };
  });
}

export async function updateDepartment(payload: UpdateDepartmentInput) {
  return runServerAction(updateDepartmentSchema, payload, "Không thể cập nhật phòng ban", async (input) => {
    const { id, ...body } = input;
    await client.patch(`/api/v1/departments/${id}`, body);
    revalidatePath("/departments");
    return { ok: true as const };
  });
}

export async function approveDepartment(payload: { id: number }) {
  return runServerAction(departmentIdSchema, payload, "Không thể duyệt phòng ban", async ({ id }) => {
    await client.post(`/api/v1/departments/${id}/approve`);
    revalidatePath("/departments");
    return { ok: true as const };
  });
}

export async function rejectDepartment(payload: { id: number; reason: string }) {
  return runServerAction(rejectDepartmentSchema, payload, "Không thể từ chối phòng ban", async ({ id, reason }) => {
    await client.post(`/api/v1/departments/${id}/reject`, { reason });
    revalidatePath("/departments");
    return { ok: true as const };
  });
}

export async function filterDepartments(params: FilterDepartmentsParams = {}) {
  try {
    const response = await client.get<DepartmentsResponse>("/api/v1/departments", { params });
    return { ok: true as const, data: response.data, meta: response.meta };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof HttpError ? error.message : "Không thể tải phòng ban",
    };
  }
}
