/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeminiModelInfo {
  id: string;
  name: string;
  description: string;
  badge: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: GeminiModelInfo[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    description: 'Tốc độ siêu nhanh, tối ưu hạn ngạch quota, phù hợp cho học tập & giảng dạy thời gian thực.',
    badge: 'Khuyên dùng (Default)',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    description: 'Khả năng suy luận toán học chuyên sâu, xử lý các bài toán hình học và đại số phức tạp.',
    badge: 'Tư duy chuyên sâu',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Mô hình dự phòng ổn định, phản hồi tức thì khi các mô hình preview bị nghẽn.',
    badge: 'Dự phòng ổn định',
  },
];

// Fallback chain definition
export const FALLBACK_CHAIN = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const SELECTED_MODEL_STORAGE_KEY = 'gemini_selected_model';

export const getStoredApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
};

export const setStoredApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  }
};

export const getStoredModel = (): string => {
  if (typeof window === 'undefined') return 'gemini-3-flash-preview';
  return localStorage.getItem(SELECTED_MODEL_STORAGE_KEY) || 'gemini-3-flash-preview';
};

export const setStoredModel = (model: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, model);
  }
};

export interface StepExecutionResult {
  success: boolean;
  content: string;
  modelUsed?: string;
  error?: string;
}

/**
 * Call Gemini API directly via Google AI Studio REST Endpoint with model fallback
 */
async function callGeminiEndpoint(
  modelId: string,
  apiKey: string,
  systemInstruction: string,
  prompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Lỗi ${response.status}: ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.error?.message) {
        message = `${parsed.error.message} (Mã lỗi: ${parsed.error.code || response.status})`;
      }
    } catch {
      message = `${message} - ${errorBody}`;
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Không nhận được nội dung phản hồi từ mô hình.');
  }
  return text;
}

/**
 * Executes a step with automatic multi-model fallback chain
 */
export async function executeWithFallback(
  systemInstruction: string,
  prompt: string,
  onModelAttempt?: (modelId: string, attemptIndex: number) => void
): Promise<StepExecutionResult> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return {
      success: false,
      content: '',
      error: 'Vui lòng nhập API Key để sử dụng tính năng AI.',
    };
  }

  const preferredModel = getStoredModel();
  // Build fallback order starting with preferred model
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_CHAIN.filter((m) => m !== preferredModel),
  ];

  let lastError = '';

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    if (onModelAttempt) onModelAttempt(model, i);

    try {
      const result = await callGeminiEndpoint(model, apiKey, systemInstruction, prompt);
      return {
        success: true,
        content: result,
        modelUsed: model,
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini Fallback] Mô hình ${model} gặp lỗi: ${lastError}. Đang chuyển tiếp sang mô hình tiếp theo...`);
      // Continue to next model in chain
    }
  }

  // All models failed
  return {
    success: false,
    content: '',
    error: lastError || 'Toàn bộ các mô hình AI dự phòng đều không thể xử lý yêu cầu.',
  };
}

/**
 * 3-Step Mathematical Pedagogical Solver
 */
export interface MathProblemSolution {
  step1: StepExecutionResult; // Phân tích đề & Hướng giải
  step2: StepExecutionResult; // Lời giải chi tiết KaTeX
  step3: StepExecutionResult; // Kết luận & Bẫy sai lầm
  completed: boolean;
}

export async function solveMathProblemPedagogy(
  problemText: string,
  onStepProgress: (stepNumber: 1 | 2 | 3, status: 'loading' | 'success' | 'error', data?: StepExecutionResult) => void
): Promise<MathProblemSolution> {
  const result: MathProblemSolution = {
    step1: { success: false, content: '' },
    step2: { success: false, content: '' },
    step3: { success: false, content: '' },
    completed: false,
  };

  // STEP 1: Phân tích đề bài
  onStepProgress(1, 'loading');
  const step1Sys = 'Bạn là chuyên gia sư phạm Toán học cao cấp. Hãy phân tích đề bài toán học: xác định giả thiết, kết luận, dạng toán trọng tâm và định hướng tư duy từng bước cho học sinh. Trình bày súc tích, sư phạm, chuẩn mực.';
  const step1Prompt = `ĐỀ BÀI TOÁN HỌC:\n"""\n${problemText}\n"""\n\nHãy phân tích rõ:\n1. Giả thiết & Kết luận cốt lõi\n2. Dạng toán và phương pháp tiếp cận tối ưu\n3. Sơ đồ tư duy giải quyết`;

  result.step1 = await executeWithFallback(step1Sys, step1Prompt);
  if (!result.step1.success) {
    onStepProgress(1, 'error', result.step1);
    return result;
  }
  onStepProgress(1, 'success', result.step1);

  // STEP 2: Lời giải chi tiết KaTeX
  onStepProgress(2, 'loading');
  const step2Sys = 'Bạn là giáo viên dạy Toán xuất sắc. Hãy trình bày lời giải chi tiết, rõ ràng từng bước. Sử dụng cú pháp LaTeX ($...$ hoặc $$...$$) chuẩn xác cho mọi biểu thức, công thức toán học và ký hiệu để hiển thị hoàn hảo trên KaTeX.';
  const step2Prompt = `Dựa trên đề bài:\n"""\n${problemText}\n"""\nvà định hướng phân tích:\n"""\n${result.step1.content}\n"""\n\nHãy viết lời giải chi tiết, chuẩn mực từng dòng, công thức toán viết dạng LaTeX KaTeX. Đảm bảo tính sư phạm dễ hiểu cho học sinh THPT/THCS.`;

  result.step2 = await executeWithFallback(step2Sys, step2Prompt);
  if (!result.step2.success) {
    onStepProgress(2, 'error', result.step2);
    return result;
  }
  onStepProgress(2, 'success', result.step2);

  // STEP 3: Kết luận & Bẫy sai lầm
  onStepProgress(3, 'loading');
  const step3Sys = 'Bạn là chuyên viên luyện thi Toán học. Hãy tóm lược đáp số/kết luận cuối cùng, chỉ ra các "bẫy" sai lầm kinh điển mà học sinh rất dễ mất điểm khi làm trắc nghiệm/tự luận, và gợi ý mẹo nhớ nhanh.';
  const step3Prompt = `Dựa trên đề bài và lời giải:\n"""\n${result.step2.content}\n"""\n\nHãy tổng kết:\n1. Đáp án/Kết luận chính xác nhất\n2. 2-3 Sai lầm và "bẫy" học sinh thường mắc phải nhất ở dạng này\n3. Lời khuyên tư duy nhanh khi gặp bài tương tự`;

  result.step3 = await executeWithFallback(step3Sys, step3Prompt);
  if (!result.step3.success) {
    onStepProgress(3, 'error', result.step3);
    return result;
  }
  onStepProgress(3, 'success', result.step3);
  result.completed = true;

  return result;
}

/**
 * Generate 3 Similar Practice Problems (Nhận biết/Thông hiểu - Vận dụng - Vận dụng cao)
 */
export async function generateSimilarProblems(
  sourceProblem: string
): Promise<StepExecutionResult> {
  const sys = 'Bạn là chuyên gia soạn thảo đề thi môn Toán chuẩn ma trận năng lực. Hãy sinh 3 bài toán tương tự cùng chủ đề với 3 mức độ phân hóa học sinh.';
  const prompt = `Từ bài toán gốc:\n"""\n${sourceProblem}\n"""\n\nHãy tạo 3 bài toán tương tự để học sinh rèn luyện trên lớp:\n- Bài 1 (Mức độ Nhận biết / Thông hiểu - Cơ bản rèn luyện công thức)\n- Bài 2 (Mức độ Vận dụng - Có kết hợp biến đổi)\n- Bài 3 (Mức độ Vận dụng cao - Đòi hỏi tư duy sâu)\nMỗi bài đều ghi rõ Đề bài, Đáp số ngắn gọn và Lời giải vắn tắt với LaTeX.`;

  return await executeWithFallback(sys, prompt);
}
