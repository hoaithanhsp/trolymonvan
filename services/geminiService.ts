import { GoogleGenAI, Type } from "@google/genai";
import { ExamConfig, ExamData } from "../types";

// Removed global initialization to support dynamic API keys
// constant removed: const ai = ...

// KNOWLEDGE BASE CONTENT (INTEGRATED)
const KB_PRIMARY = `
- Cấu trúc: 3 Phần.
  + I. Đọc hiểu (4-5đ): Văn bản 50-300 từ (Cổ tích, Thơ thiếu nhi, Truyện giáo dục). Trắc nghiệm + Tự luận ngắn.
  + II. Kiến thức ngôn ngữ (2đ): Từ loại, câu, chính tả, biện pháp tu từ đơn giản.
  + III. Viết (3-4đ): Viết đoạn văn/bài văn ngắn (Tả, Kể).
- Yêu cầu: Ngôn ngữ đơn giản, trong sáng. Có hình ảnh minh họa (placeholder).
- Văn bản ưu tiên: Sọ Dừa, Tấm Cám, Thạch Sanh, Thơ Trần Đăng Khoa, Xuân Quỳnh.
`;

const KB_MIDDLE = `
- Cấu trúc: 2 Phần.
  + I. Đọc hiểu (3-4đ): Văn bản 300-500 từ (Ngoài SGK). Nhận biết -> Vận dụng.
  + II. Làm văn (6-7đ): 
    * Câu 1 (2đ): Nghị luận xã hội (200 chữ).
    * Câu 2 (4-5đ): Nghị luận văn học (hoặc Tự sự/Biểu cảm lớp 6-7).
- Văn bản trọng tâm: Đồng chí, Bài thơ về tiểu đội xe không kính, Sang thu, Viếng lăng Bác, Làng, Lặng lẽ Sa Pa, Chiếc lược ngà, Những ngôi sao xa xôi.
`;

const KB_HIGH = `
- Cấu trúc: 2 Phần (Chuẩn Thi TN THPT).
  + I. Đọc hiểu (3đ): Văn bản 400-600 từ (Chính luận/Nghệ thuật). 4 câu hỏi.
  + II. Làm văn (7đ):
    * Câu 1 (2đ): Nghị luận xã hội (200 chữ).
    * Câu 2 (5đ): Nghị luận văn học (Phân tích/Bình luận).
- Văn bản trọng tâm: Tây Tiến, Việt Bắc, Đất Nước, Sóng, Người lái đò Sông Đà, Vợ nhặt, Vợ chồng A Phủ, Hồn Trương Ba da hàng thịt.
`;

export const generateExam = async (config: ExamConfig, apiKey?: string): Promise<ExamData> => {
  // 1. Resolve API Key
  const key = apiKey || localStorage.getItem("GEMINI_API_KEY") || process.env.API_KEY;

  if (!key) {
    throw new Error("MISSING_API_KEY");
  }

  // 2. Initialize Client
  const ai = new GoogleGenAI({ apiKey: key });
  const modelId = "gemini-2.5-flash"; 
  
  // Determine which KB to use based on level
  let selectedKB = KB_MIDDLE;
  if (config.level === 'Tiểu học') selectedKB = KB_PRIMARY;
  if (config.level === 'THPT') selectedKB = KB_HIGH;

  // Xây dựng hướng dẫn chọn ngữ liệu
  let sourceInstruction = "";
  if (config.uploadedTopicContent) {
    sourceInstruction = `
    ĐẶC BIỆT CHÚ Ý: Người dùng ĐÃ TẢI LÊN NGỮ LIỆU CỤ THỂ.
    Nội dung ngữ liệu: ${config.uploadedTopicContent}
    
    YÊU CẦU QUAN TRỌNG: 
    1. BẠN PHẢI SỬ DỤNG ngữ liệu được cung cấp ở trên để ra đề phần ĐỌC HIỂU (hoặc Nghị luận văn học nếu phù hợp).
    2. Nếu ngữ liệu quá dài, hãy trích dẫn đoạn tiêu biểu nhất.
    3. Nếu ngữ liệu là file PDF (chỉ có tên file), hãy cố gắng tìm nội dung tương ứng trong kiến thức của bạn hoặc giả lập một đoạn trích phù hợp với tên tác phẩm đó.
    `;
  } else {
    sourceInstruction = `
    1. Chọn ngữ liệu:
       - Nếu là "Tiểu học": Chọn truyện cổ tích, thơ thiếu nhi vui tươi, giáo dục.
       - Nếu là "THCS/THPT": Chọn ngữ liệu có giá trị văn học, ưu tiên các tác phẩm trong danh sách trọng tâm HOẶC văn bản mới (nếu Trending Topic yêu cầu).
       - Nếu Trending Topic là "Môi trường", "AI", "Gen Z"... hãy chọn ngữ liệu đọc hiểu liên quan.
    `;
  }

  const prompt = `
Role: Bạn là chuyên gia soạn thảo đề thi Ngữ văn (${config.level}) hàng đầu, am hiểu chương trình GDPT 2018.

INPUT DỮ LIỆU:
- Cấp học: ${config.level}
- Khối lớp: ${config.gradeLevel}
- Thời gian: ${config.examType}
- Chủ đề/Xu hướng: ${config.trendingTopic}
- Ghi chú thêm: ${config.topic || "Không có"}
- Ma trận (User): ${config.matrixContent || "Sử dụng ma trận chuẩn bên dưới"}
- Đặc tả (User): ${config.specificationContent || "Sử dụng đặc tả chuẩn bên dưới"}

KNOWLEDGE BASE (CẤU TRÚC CHUẨN - BẮT BUỘC TUÂN THỦ):
${selectedKB}

HƯỚNG DẪN CHI TIẾT VỀ NGỮ LIỆU VÀ CÂU HỎI:
${sourceInstruction}

2. Soạn câu hỏi:
   - Đảm bảo tỷ lệ câu hỏi Nhận biết/Thông hiểu/Vận dụng phù hợp với cấp học.
   - "Tiểu học": Câu hỏi ngắn, dễ hiểu. Có thể thêm [Hình ảnh minh họa: mô tả hình] vào đề.
   - "THPT": Câu hỏi đọc hiểu phải có chiều sâu, nghị luận xã hội phải sắc sảo.

3. Hướng dẫn chấm (Answer Key) - QUAN TRỌNG:
   - BẮT BUỘC dùng ký tự xuống dòng (\\n) để ngắt dòng giữa các ý (Mở bài, Thân bài, Kết bài, a., b., c.).
   - KHÔNG viết thành khối văn bản dính liền.

Output Format: JSON only.
`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examTitle: { type: Type.STRING, description: "Tiêu đề in hoa, VD: ĐỀ KIỂM TRA..." },
            duration: { type: Type.STRING },
            content: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING, description: "VD: I. ĐỌC HIỂU" },
                  text: { type: Type.STRING, description: "Ngữ liệu. Dùng \\n để xuống dòng thơ." },
                  source: { type: Type.STRING },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: "VD: Câu 1" },
                        text: { type: Type.STRING, description: "Nội dung câu hỏi" },
                        points: { type: Type.NUMBER, description: "Điểm số" },
                        parts: {
                          type: Type.ARRAY,
                          description: "Các ý nhỏ (nếu có)",
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              label: { type: Type.STRING, description: "a., b." },
                              content: { type: Type.STRING, description: "Nội dung ý nhỏ" },
                              points: { type: Type.STRING, description: "Điểm thành phần" }
                            }
                          }
                        }
                      },
                      required: ["id", "text", "points"]
                    }
                  }
                },
                required: ["section", "questions"]
              }
            },
            answers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  pointsDetail: { type: Type.STRING }
                },
                required: ["questionId", "answer", "pointsDetail"]
              }
            },
            matrixMapping: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["examTitle", "duration", "content", "answers"]
        }
      }
    });

    if (!response.text) throw new Error("Không nhận được dữ liệu từ AI.");

    return JSON.parse(response.text) as ExamData;

  } catch (error: any) {
    console.error("Gemini API Error", error);
    
    // Detailed Error Handling as requested
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
       throw new Error("Lỗi 429: Quá giới hạn request (Quota exceeded). Vui lòng thử lại sau hoặc đổi API Key khác.");
    }
    if (error.status === 403 || (error.message && error.message.includes('403'))) {
       throw new Error("Lỗi 403: Quyền truy cập bị từ chối hoặc API Key không hợp lệ.");
    }
    if (error.status === 400 || (error.message && error.message.includes('400'))) {
       throw new Error("Lỗi 400: Yêu cầu không hợp lệ (Bad Request). Kiểm tra lại dữ liệu đầu vào.");
    }
    if (error.status === 401 || (error.message && error.message.includes('401'))) {
       throw new Error("Lỗi 401: API Key không đúng hoặc hết hạn. Vui lòng kiểm tra lại cấu hình.");
    }

    // JSON Parse Error or other
    if (error instanceof SyntaxError) {
        throw new Error("Lỗi định dạng dữ liệu từ AI (JSON Parse Error).");
    }

    throw error; // Re-throw generic error
  }
};