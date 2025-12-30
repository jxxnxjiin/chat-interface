// lib/schemas.ts
import { SchemaType } from "@google/generative-ai";

/**
 * 1단계 기획 단계 채팅 API 응답 스키마
 * - reply: 사용자에게 보여줄 대화 답변
 * - report: 실시간 기획안에 반영할 데이터 (배경, 목표, 계획, 자원)
 */
export const initiationChatSchema = {
  type: SchemaType.OBJECT as const,
  properties: {
    reply: {
      type: SchemaType.STRING as const,
      description: "사용자에게 보여줄 대화 답변",
    },
    report: {
      type: SchemaType.OBJECT as const,
      description: "실시간 기획안에 반영할 데이터",
      properties: {
        reason: { type: SchemaType.STRING as const, description: "기획 배경" },
        goal: { type: SchemaType.STRING as const, description: "목표" },
        detailedPlan: { type: SchemaType.STRING as const, description: "상세 계획" },
        resources: { type: SchemaType.STRING as const, description: "필요 자원" },
      },
      required: ["reason", "goal", "detailedPlan", "resources"],
    },
  },
  required: ["reply"],
};

/**
 * 도구 검색 채팅 API 응답 스키마
 * - reply: 사용자에게 보여줄 대화 답변
 * - tools: 추천할 도구 목록 (선택적)
 */
export const toolRecommendationSchema = {
  type: SchemaType.OBJECT as const,
  properties: {
    reply: {
      type: SchemaType.STRING as const,
      description: "사용자에게 보여줄 대화 답변",
    },
    tools: {
      type: SchemaType.ARRAY as const,
      description: "추천할 도구 목록 (선택적, 한 번에 여러 도구 추천 가능)",
      items: {
        type: SchemaType.OBJECT as const,
        properties: {
          tool_name: { type: SchemaType.STRING as const, description: "도구 이름" },
          description: { type: SchemaType.STRING as const, description: "도구에 대한 1-2문장 설명" },
          url: { type: SchemaType.STRING as const, description: "도구의 공식 웹사이트 URL만 입력 (설명 제외, 모를 경우 빈 문자열)" },
        },
        required: ["tool_name", "description"],
      },
    },
  },
  required: ["reply"],
};

/**
 * 맞춤 도구 추천 API 응답 스키마
 * - tools: 프로젝트에 맞춤화된 도구 목록 (카테고리 포함)
 */
export const customToolRecommendationSchema = {
  type: SchemaType.OBJECT as const,
  properties: {
    tools: {
      type: SchemaType.ARRAY as const,
      description: "프로젝트에 필요한 도구 목록",
      items: {
        type: SchemaType.OBJECT as const,
        properties: {
          tool_name: { type: SchemaType.STRING as const, description: "도구 이름" },
          description: { type: SchemaType.STRING as const, description: "도구에 대한 1-2문장 설명" },
          url: { type: SchemaType.STRING as const, description: "도구의 공식 웹사이트 URL만 입력 (설명 제외, 모를 경우 빈 문자열)" },
          category: { type: SchemaType.STRING as const, description: "도구 카테고리 (예: 프로젝트 관리, 디자인, 개발, 협업 등)" },
        },
        required: ["tool_name", "description", "category"],
      },
    },
  },
  required: ["tools"],
};
