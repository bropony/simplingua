import { z, ZodError } from "zod";
import { NextResponse } from "next/server";

// Helper to format zod errors into the project's standard error response
export function formatZodError(error: ZodError): NextResponse {
  const firstIssue = error.issues[0];
  const field = firstIssue.path.join(".");
  const message = firstIssue.message;

  let code = "VALIDATION_ERROR";

  // Missing/undefined fields → MISSING_FIELDS
  if (firstIssue.code === "invalid_type") {
    code = "MISSING_FIELDS";
  }
  // Field-specific mapping for validation failures
  else if (field === "username") {
    code = "INVALID_USERNAME";
  } else if (field === "email") {
    code = "INVALID_EMAIL";
  } else if (field === "password" || field === "newPassword" || field === "currentPassword") {
    code = "INVALID_PASSWORD";
  } else if (field === "title") {
    code = "INVALID_TITLE";
  } else if (field === "content") {
    code = "INVALID_CONTENT";
  } else if (field === "tags") {
    code = "INVALID_TAGS";
  } else if (field === "targetType") {
    code = "INVALID_TYPE";
  } else if (field === "targetId") {
    code = "MISSING_FIELDS";
  }
  // Fallback: empty string on a required field → MISSING_FIELDS
  else if (firstIssue.code === "too_small" && "minimum" in firstIssue && firstIssue.minimum === 1) {
    code = "MISSING_FIELDS";
  }

  return NextResponse.json(
    { success: false, error: { code, message } },
    { status: 400 }
  );
}

// Reusable field schemas
const username = z.string().min(3, "用户名长度须为3-30个字符").max(30, "用户名长度须为3-30个字符");
const email = z.string().email("邮箱格式不正确");
const password = z.string().min(8, "密码长度至少8个字符");

// ── Auth schemas ──

export const registerSchema = z.object({
  username,
  email,
  password,
});

export const loginSchema = z.object({
  account: z.string().min(1, "账号和密码为必填项"),
  password: z.string().min(1, "账号和密码为必填项"),
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "当前密码和新密码为必填项"),
  newPassword: password,
});

// ── Vocabulary schemas ──

export const createVocabularySchema = z.object({
  word: z.string().min(1, "词汇和词性为必填项"),
  partOfSpeech: z.string().min(1, "词汇和词性为必填项"),
  letter: z.string().optional(),
  definitions: z.array(z.unknown()).optional(),
  pronunciation: z.string().optional(),
  genderForms: z.unknown().optional(),
  relatedWords: z.array(z.unknown()).optional(),
});

export const importVocabularySchema = z.object({
  data: z.array(z.record(z.string(), z.unknown()))
    .min(1, "数据必须为数组格式"),
});

// ── Grammar schemas ──

export const createGrammarSchema = z.object({
  chapterTitle: z.string().min(1, "章节标题和排序为必填项"),
  order: z.number("章节标题和排序为必填项"),
  chapterTitleSimp: z.string().optional(),
  sections: z.array(z.unknown()).optional(),
});

export const importGrammarSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown()))
    .min(1, "数据必须为数组格式"),
});

// ── Discussion schemas ──

export const createDiscussionSchema = z.object({
  title: z.string().trim().min(2, "标题长度需在2-200个字符之间").max(200, "标题长度需在2-200个字符之间"),
  content: z.string().trim().min(1, "内容不能为空").max(50000, "内容不能超过50000个字符"),
  tags: z.array(z.string()).max(10, "标签数量不能超过10个").optional(),
});

export const updateDiscussionSchema = z.object({
  title: z.string().trim().min(2, "标题长度需在2-200个字符之间").max(200, "标题长度需在2-200个字符之间").optional(),
  content: z.string().trim().min(1, "内容不能为空").max(50000, "内容不能超过50000个字符").optional(),
  tags: z.array(z.string()).max(10, "标签数量不能超过10个").optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

// ── Comment schemas ──

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "评论内容不能为空").max(10000, "评论内容不能超过10000个字符"),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, "评论内容不能为空").max(10000, "评论内容不能超过10000个字符"),
});

// ── Like schema ──

export const likeSchema = z.object({
  targetType: z.enum(["discussion", "comment"], "无效的目标类型"),
  targetId: z.string().min(1, "缺少必要参数"),
});
