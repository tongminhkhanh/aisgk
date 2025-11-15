
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedProductFeedback, GeneratedQuestionLevel, QuestionCounts, GeneratedTextQuestionResponse } from '../types';

// FIX: Per coding guidelines, the API key must be sourced directly and exclusively from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateProductFeedback = async (
    studentName: string,
    productType: string,
    description: string,
    file: File
): Promise<GeneratedProductFeedback> => {
    try {
        const imagePart = await fileToGenerativePart(file);
        
        const prompt = `Bạn là một trợ lý giáo viên tiểu học ở Việt Nam. Hãy đưa ra nhận xét cho sản phẩm của học sinh với thông tin sau:
- Tên học sinh: ${studentName}
- Loại sản phẩm: ${productType}
- Chủ đề/Mô tả: ${description}

Phân tích hình ảnh sản phẩm được đính kèm và đưa ra nhận xét chi tiết, mang tính xây dựng và khích lệ bằng tiếng Việt, phù hợp với văn phong sư phạm tiểu học. Cấu trúc nhận xét phải theo định dạng JSON.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [ {text: prompt}, imagePart ] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        general: { type: Type.STRING, description: 'Nhận xét chung về sản phẩm của học sinh.' },
                        strengths: { type: Type.STRING, description: 'Điểm mạnh nổi bật, những gì học sinh đã làm tốt.' },
                        suggestions: { type: Type.STRING, description: 'Góp ý cụ thể để cải thiện sản phẩm, có thể chia thành các mục nhỏ.' },
                        encouragement: { type: Type.STRING, description: 'Lời khích lệ, động viên học sinh.' },
                    },
                    required: ['general', 'strengths', 'suggestions', 'encouragement'],
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;

    } catch (error) {
        console.error("Error generating product feedback:", error);
        // Return a mock response on error for demonstration
        return {
            general: `Với sản phẩm ${productType} về chủ đề "${description}", Thầy/Cô thấy con đã rất cố gắng và sáng tạo. Bố cục và màu sắc hài hòa, cho thấy con đã đầu tư thời gian và tâm huyết.`,
            strengths: "Thầy/Cô khen con đã biết sử dụng công cụ để tạo hình chủ thể và viết tên mình vào bài rất rõ ràng. Chủ thể có hình dáng khá cân đối và dễ thương nữa.",
            suggestions: "1. Con nên vẽ các nét liền mạch và khép kín hơn, đặc biệt ở phần mái và đuôi, để khi tô màu sẽ không bị lem ra ngoài nha.\n2. Con hãy thử dụng công cụ tô màu (Fill with color) để tô màu cho chủ thể của mình thêm sinh động và đẹp mắt hơn nữa nhé!",
            encouragement: "Thầy tin rằng với sự chăm chỉ, con sẽ tạo ra nhiều bức tranh đẹp hơn nữa trong các buổi học tiếp theo. Cố gắng lên con nhé!",
        };
    }
};

export const generateQuestionsFromTextbook = async (
  subject: string,
  grade: string,
  topic: string,
  questionCounts: QuestionCounts,
  file: File | null
): Promise<GeneratedQuestionLevel[]> => {
    try {
        // FIX: The `Part` object for text must be `{text: string}` not a raw string.
        // The type of promptParts is updated to reflect the correct structure.
        const promptParts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [];

        const promptText = `Bạn là một giáo viên AI chuyên tạo câu hỏi cho học sinh tiểu học ở Việt Nam. Dựa vào thông tin sau:
- Môn học: ${subject}
- Lớp: ${grade}
- Chủ đề/Bài học: ${topic}
${file ? '- Nội dung tham khảo được cung cấp trong tệp đính kèm.' : ''}

Hãy tạo ra một bộ câu hỏi bằng tiếng Việt theo cấu trúc và số lượng sau:
- Mức 1 (Nhận biết): ${questionCounts.level1.mcq} câu trắc nghiệm và ${questionCounts.level1.essay} câu tự luận.
- Mức 2 (Kết nối, sắp xếp): ${questionCounts.level2.mcq} câu trắc nghiệm và ${questionCounts.level2.essay} câu tự luận.
- Mức 3 (Vận dụng): ${questionCounts.level3.mcq} câu trắc nghiệm và ${questionCounts.level3.essay} câu tự luận.

Câu hỏi trắc nghiệm phải có 4 lựa chọn và chỉ rõ đáp án đúng. Câu hỏi phải phù hợp với trình độ nhận thức của học sinh lớp ${grade}.
Vui lòng trả về kết quả dưới dạng JSON theo schema đã định sẵn.
`;
        // FIX: A text part for the Gemini API must be an object with a `text` property.
        promptParts.push({ text: promptText });

        if (file) {
            const imagePart = await fileToGenerativePart(file);
            promptParts.push(imagePart);
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: promptParts },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            levelName: { type: Type.STRING, description: 'Tên mức độ câu hỏi (ví dụ: "Mức 1: Nhận biết")' },
                            questions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        type: { type: Type.STRING, description: 'Loại câu hỏi: "multiple_choice" hoặc "essay"' },
                                        question: { type: Type.STRING, description: 'Nội dung câu hỏi' },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Các lựa chọn cho câu trắc nghiệm' },
                                        correctAnswer: { type: Type.STRING, description: 'Đáp án đúng cho câu trắc nghiệm' }
                                    },
                                    required: ['type', 'question']
                                }
                            }
                        },
                        required: ['levelName', 'questions']
                    }
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;

    } catch (error) {
        console.error("Error generating questions:", error);
        // Return a detailed mock response on error for demonstration
        return [
            {
                "levelName": "Mức 1: Nhận Biết",
                "questions": [
                    { "type": "multiple_choice", "question": "Ai là người được gọi là “tác giả” của một cuốn sách, bài viết, bức ảnh?", "options": ["Người đọc tác phẩm đó.", "Người mua tác phẩm đó.", "Người sáng tạo ra tác phẩm đó.", "Người cho thuê tác phẩm đó."], "correctAnswer": "Người sáng tạo ra tác phẩm đó." },
                    { "type": "multiple_choice", "question": "Quyền của tác giả đối với tác phẩm của mình được gọi là gì?", "options": ["Quyền sở hữu cá nhân.", "Quyền tác giả hay bản quyền.", "Quyền công bố thông tin.", "Quyền trao đổi."], "correctAnswer": "Quyền tác giả hay bản quyền." },
                    { "type": "essay", "question": "Em hãy kể tên ít nhất ba quyền của tác giả đối với tác phẩm của mình theo nội dung bài học." }
                ]
            },
            {
                "levelName": "Mức 2: Kết nối, sắp xếp",
                "questions": [
                    { "type": "multiple_choice", "question": "Hành động nào dưới đây được coi là vi phạm bản quyền?", "options": ["Đặt tên cho tác phẩm của mình.", "Đứng tên trên tác phẩm mình đã tạo ra.", "Sao chép một bài văn của người khác và nộp cho cô giáo mà không xin phép.", "Công bố tác phẩm của chính mình."], "correctAnswer": "Sao chép một bài văn của người khác và nộp cho cô giáo mà không xin phép." },
                    { "type": "multiple_choice", "question": "Thông tin nào sau đây được xem là thông tin riêng tư?", "options": ["Tên của trường học em đang học.", "Số điện thoại của bố mẹ.", "Tên của các bạn trong lớp.", "Địa chỉ của trường học."], "correctAnswer": "Số điện thoại của bố mẹ." },
                    { "type": "essay", "question": "Tại sao chúng ta không nên chia sẻ thông tin cá nhân của mình cho người lạ trên mạng?" }
                ]
            },
            {
                "levelName": "Mức 3: Vận dụng",
                "questions": [
                    { "type": "multiple_choice", "question": "Khi tìm thấy một hình ảnh đẹp trên mạng, em muốn sử dụng nó trong bài thuyết trình của mình. Em nên làm gì?", "options": ["Sử dụng ngay vì nó có sẵn trên mạng.", "Hỏi ý kiến bạn bè xem có được dùng không.", "Tìm thông tin về tác giả và xin phép hoặc ghi rõ nguồn.", "Chỉnh sửa lại một chút để nó thành của mình."], "correctAnswer": "Tìm thông tin về tác giả và xin phép hoặc ghi rõ nguồn." },
                    { "type": "essay", "question": "Nếu bạn của em đang tự ý sao chép bài của một bạn khác để nộp, em sẽ khuyên bạn điều gì?" }
                ]
            }
        ];
    }
};

export const suggestTopicFromFile = async (file: File): Promise<string[]> => {
    try {
        const filePart = await fileToGenerativePart(file);
        const prompt = "Dựa vào nội dung của tệp được đính kèm (có thể là hình ảnh hoặc văn bản), hãy phân tích và trích xuất tất cả các chủ đề hoặc tên bài học tiềm năng có trong tài liệu. Trả về kết quả dưới dạng một mảng JSON chứa các chuỗi văn bản tiếng Việt. Mỗi chuỗi là một chủ đề/bài học được đề xuất.";
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [ {text: prompt}, filePart ] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "Một chủ đề hoặc tên bài học được đề xuất từ nội dung tệp."
                    }
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        return Array.isArray(jsonResponse) ? jsonResponse : [];

    } catch (error) {
        console.error("Error suggesting topic from file:", error);
        return ["Gợi ý từ tệp: Vòng đời của bướm", "Bài học: Sự biến thái", "Phần 3: Các giai đoạn phát triển"];
    }
};

export const generateQuestionsFromText = async (
  text: string
): Promise<GeneratedTextQuestionResponse> => {
    try {
        const prompt = `Bạn là một trợ lý giáo viên AI. Dựa vào đoạn văn bản sau đây được cung cấp bởi người dùng:
---
${text}
---
Nhiệm vụ của bạn là:
1. Tóm tắt ngắn gọn nội dung chính của đoạn văn bản trên.
2. Dựa vào nội dung đã tóm tắt, tạo ra một bộ câu hỏi kiểm tra kiến thức gồm cả trắc nghiệm và tự luận.
   - Câu hỏi trắc nghiệm phải có 4 lựa chọn và chỉ rõ đáp án đúng.
   - Câu hỏi phải bám sát nội dung và mục tiêu học tập của đoạn văn bản.

Vui lòng trả về kết quả dưới dạng JSON theo schema đã định sẵn.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: 'Đoạn tóm tắt nội dung chính của văn bản.' },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, description: 'Loại câu hỏi: "multiple_choice" hoặc "essay"' },
                                    question: { type: Type.STRING, description: 'Nội dung câu hỏi' },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Các lựa chọn cho câu trắc nghiệm' },
                                    correctAnswer: { type: Type.STRING, description: 'Đáp án đúng cho câu trắc nghiệm' }
                                },
                                required: ['type', 'question']
                            }
                        }
                    },
                    required: ['summary', 'questions']
                }
            }
        });
        
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;

    } catch (error) {
        console.error("Error generating questions from text:", error);
        // Mock response
        return {
            summary: "Đoạn văn bản nói về Dế Mèn, một nhân vật có lòng nghĩa hiệp, đã ra tay bênh vực chị Nhà Trò yếu đuối khỏi sự ức hiếp của bọn nhện.",
            questions: [
                {
                    type: "multiple_choice",
                    question: "Dế Mèn đã làm gì khi thấy chị Nhà Trò bị ức hiếp?",
                    options: ["Bỏ đi", "Mắng chị Nhà Trò", "Bênh vực và giúp đỡ chị", "Sợ hãi và trốn đi"],
                    correctAnswer: "Bênh vực và giúp đỡ chị"
                },
                {
                    type: "essay",
                    question: "Qua hành động của Dế Mèn, em học được đức tính tốt nào?"
                }
            ]
        };
    }
};
