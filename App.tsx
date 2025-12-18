import React, { useState, useEffect } from 'react';
import { Layout, Printer, Download, RefreshCw, ChevronLeft, PenTool, FileDown, Settings, Key } from 'lucide-react';
import ExamForm from './components/ExamForm';
import ExamViewer from './components/ExamViewer';
import RubricViewer from './components/RubricViewer';
import { generateExam } from './services/geminiService';
import { ExamConfig, ExamData, AppView } from './types';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  Table,
  TableRow,
  TableCell,
  VerticalAlign,
  TabStopType,
  TabStopPosition,
  Tab
} from "docx";

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.INPUT);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rubric' | 'matrix'>('rubric');
  const [isExporting, setIsExporting] = useState(false);

  // API Key State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  useEffect(() => {
    // Load existing key to input if available
    const key = localStorage.getItem("GEMINI_API_KEY");
    if (key) setApiKeyInput(key);
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      alert("Vui lòng nhập API Key.");
      return;
    }
    localStorage.setItem("GEMINI_API_KEY", apiKeyInput.trim());
    setShowApiKeyModal(false);
    setError(null);
    alert("Đã lưu API Key thành công!");
  };

  const handleGenerate = async (config: ExamConfig) => {
    setView(AppView.LOADING);
    setError(null);
    try {
      const result = await generateExam(config);
      setExamData(result);
      setView(AppView.RESULT);
    } catch (err: any) {
      if (err.message === "MISSING_API_KEY") {
        setShowApiKeyModal(true);
        setView(AppView.INPUT);
        // Don't show generic error, the modal is enough prompt
        return;
      }
      setError(err.message || "Đã xảy ra lỗi khi sinh đề. Vui lòng thử lại.");
      setView(AppView.INPUT);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    if (!examData) return;
    setIsExporting(true);

    try {
      const children: any[] = [];
      const fontNormal = "Times New Roman";
      const sizeNormal = 26; // 13pt
      const sizeHeader = 28; // 14pt

      // Helper to format rubric text for export
      const formatRubricForExport = (text: string) => {
        if (!text) return "";
        return text
          // Add newline before major sections if missing
          .replace(/([.:;])\s*(Mở bài|Thân bài|Kết bài|Mở đoạn|Thân đoạn|Kết đoạn|Yêu cầu chung|Yêu cầu cụ thể)/gi, '$1\n$2')
          // Add newline before list items
          .replace(/([.:;])\s*([a-d]\.|[1-4]\.)\s/gi, '$1\n$2 ')
          // Add newline before bullets
          .replace(/([.:;])\s*(-|\+)\s/g, '$1\n$2 ');
      };

      // 1. Header Table (2 columns)
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "PHÒNG GD&ĐT ....................", bold: true, font: fontNormal, size: 24 }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "TRƯỜNG THCS ....................", bold: true, font: fontNormal, size: 24 }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "__________________", bold: true, font: fontNormal })]
                    })
                  ],
                }),
                new TableCell({
                  width: { size: 60, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: examData.examTitle.toUpperCase(), bold: true, font: fontNormal, size: sizeHeader }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "Môn: Ngữ Văn", italics: true, font: fontNormal, size: sizeNormal }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: `Thời gian: ${examData.duration}`, italics: true, font: fontNormal, size: sizeNormal }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: "", spacing: { after: 300 } }) // Spacer
      );

      // 2. Content Sections - NO TABLE Layout
      examData.content.forEach((section) => {
        // Section Title
        children.push(
          new Paragraph({
            children: [new TextRun({ text: section.section, bold: true, font: fontNormal, size: sizeHeader })],
            spacing: { before: 200, after: 100 },
          })
        );

        // Reading Passage
        if (section.text) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: "Đọc đoạn trích sau và thực hiện các yêu cầu:", italics: true, underline: {}, font: fontNormal, size: sizeNormal })],
              spacing: { after: 100 }
            })
          );

          const textContent = section.text || "";
          const lines = textContent.split('\n');
          const isPoetry = lines.length > 1;

          lines.forEach(line => {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: line, italics: isPoetry, font: fontNormal, size: sizeNormal })],
                indent: isPoetry ? { left: 720 } : { firstLine: 720 }, // Indent poetry vs Prose
                spacing: { line: 360 }, // 1.5 line height
              })
            );
          });

          if (section.source) {
            children.push(
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `(${section.source})`, italics: true, bold: true, font: fontNormal, size: sizeNormal })],
                spacing: { before: 100, after: 300 }
              })
            );
          }
        }

        // Questions - Paragraph Layout with Tabs (No Table)
        section.questions.forEach((q) => {
          // Question Header: "Câu 1.    (1.0 điểm)"
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${q.id}. `, bold: true, font: fontNormal, size: sizeNormal }),
                new TextRun({ text: `(${q.points.toFixed(1)} điểm)`, bold: true, font: fontNormal, size: sizeNormal }),
              ],
              spacing: { before: 100 },
            })
          );

          // Question Text
          children.push(
            new Paragraph({
              children: [new TextRun({ text: q.text, font: fontNormal, size: sizeNormal })],
              alignment: AlignmentType.JUSTIFIED,
            })
          );

          // Sub Questions
          if (q.parts && q.parts.length > 0) {
            q.parts.forEach(p => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `${p.label} `, bold: true, font: fontNormal, size: sizeNormal }),
                    new TextRun({ text: p.content, font: fontNormal, size: sizeNormal }),
                    // Optional point display for sub-question
                    p.points ? new TextRun({ text: ` (${p.points})`, italics: true, font: fontNormal, size: 22 }) : new TextRun(""),
                  ],
                  indent: { left: 720 }, // Indent sub-questions
                  spacing: { before: 50 },
                  alignment: AlignmentType.JUSTIFIED,
                })
              );
            });
          }

          children.push(new Paragraph({ text: "", spacing: { after: 150 } }));
        });
      });

      children.push(new Paragraph({ text: "--- HẾT ---", alignment: AlignmentType.CENTER, spacing: { before: 300 }, font: fontNormal, size: sizeNormal, italics: true }));

      // Page Break for Rubric
      children.push(new Paragraph({ children: [], pageBreakBefore: true }));
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM", bold: true, font: fontNormal, size: sizeHeader })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        })
      );

      // Rubric - NO TABLE Layout
      examData.answers.forEach(ans => {
        // Heading: Câu X  .......... Điểm
        children.push(
          new Paragraph({
            tabStops: [
              { type: TabStopType.RIGHT, position: 9000 } // Align points to right
            ],
            children: [
              new TextRun({ text: ans.questionId, bold: true, font: fontNormal, size: sizeNormal }),
              new TextRun({ children: [new Tab(), `${ans.pointsDetail}`], bold: true, color: "000000", font: fontNormal, size: sizeNormal }),
            ],
            spacing: { before: 150, after: 100 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" } }
          })
        );

        // Answer Content - Format text to force line breaks
        const rawAnswer = ans.answer || "";
        const formattedAnswer = formatRubricForExport(rawAnswer);
        const lines = formattedAnswer.split('\n');

        lines.forEach(line => {
          if (line.trim()) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: line.trim(), font: fontNormal, size: sizeNormal })],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 50 }
              })
            );
          }
        });

        // Spacer
        children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      });

      // Generate Blob
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1133, // ~2cm
                right: 1133,
                bottom: 1133,
                left: 1133,
              }
            }
          }, children: children
        }],
      });

      const blob = await Packer.toBlob(doc);

      // Download Logic
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `De_Thi_Ngu_Van_VanMauAI_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Export error", e);
      alert("Lỗi khi xuất file Word. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn tạo đề mới? Dữ liệu hiện tại sẽ mất.")) {
      setView(AppView.INPUT);
      setExamData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.INPUT)}>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
                <PenTool size={20} />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">TRỢ LÝ MÔN VĂN <span className="text-blue-600">PRO</span></span>
            </div>

            <div className="flex items-center gap-2">
              {/* API Key Settings Button */}
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                title="Cấu hình API Key"
              >
                <Settings size={20} />
              </button>

              {view === AppView.RESULT && (
                <div className="flex items-center gap-3 ml-2">
                  <button
                    onClick={handleReset}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
                    title="Tạo lại"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition shadow-sm text-sm font-medium"
                  >
                    <Printer size={16} /> Print/PDF
                  </button>
                  <button
                    onClick={handleExportWord}
                    disabled={isExporting}
                    className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium ${isExporting ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {isExporting ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <FileDown size={16} />
                    )}
                    Tải về Word (.docx)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-center justify-between animate-fade-in">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 font-bold">&times;</button>
          </div>
        )}

        {view === AppView.INPUT && (
          <ExamForm onSubmit={handleGenerate} isGenerating={false} />
        )}

        {view === AppView.LOADING && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <PenTool className="text-blue-600 w-8 h-8" />
              </div>
            </div>
            <h2 className="mt-8 text-xl font-bold text-slate-700">Đang biên soạn đề thi...</h2>
            <p className="text-slate-500 mt-2">AI đang phân tích ma trận và chọn ngữ liệu phù hợp.</p>
            <div className="mt-6 flex flex-col gap-2 w-64">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse w-2/3"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Phân tích</span>
                <span>Sinh câu hỏi</span>
                <span>Tạo đáp án</span>
              </div>
            </div>
          </div>
        )}

        {view === AppView.RESULT && examData && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Exam Paper Preview */}
            <div className="lg:w-7/12 w-full print-full-width">
              <div className="mb-4 flex items-center justify-between no-print">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Layout className="w-5 h-5" /> Đề Thi
                </h3>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Preview Mode</span>
              </div>
              <ExamViewer data={examData} className="exam-paper" />
            </div>

            {/* Right: Rubric & Controls */}
            <div className="lg:w-5/12 w-full no-print">
              <div className="sticky top-24 space-y-4">
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('rubric')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${activeTab === 'rubric' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Hướng Dẫn Chấm
                  </button>
                  {/* Future tab for Matrix Visualization */}
                  <button
                    onClick={() => alert("Tính năng hiển thị ma trận chi tiết đang cập nhật.")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition opacity-50 cursor-not-allowed`}
                  >
                    Ma Trận Chi Tiết
                  </button>
                </div>

                {activeTab === 'rubric' && <RubricViewer data={examData} />}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Promotion */}
      <footer className="bg-slate-800 text-slate-300 py-8 px-4 mt-auto border-t border-slate-700 no-print">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
            <p className="font-bold text-lg md:text-xl text-blue-200 mb-3 leading-relaxed">
              ĐĂNG KÝ KHOÁ HỌC THỰC CHIẾN VIẾT SKKN, TẠO APP DẠY HỌC, TẠO MÔ PHỎNG TRỰC QUAN <br className="hidden md:block" />
              <span className="text-yellow-400">CHỈ VỚI 1 CÂU LỆNH</span>
            </p>
            <a
              href="https://tinyurl.com/khoahocAI2025"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/50"
            >
              ĐĂNG KÝ NGAY
            </a>
          </div>

          <div className="space-y-2 text-sm md:text-base">
            <p className="font-medium text-slate-400">Mọi thông tin vui lòng liên hệ:</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
              <a
                href="https://www.facebook.com/tranhoaithanhvicko/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
              >
                <span className="font-bold">Facebook:</span> tranhoaithanhvicko
              </a>
              <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600"></div>
              <span className="hover:text-emerald-400 transition-colors duration-200 cursor-default flex items-center gap-2">
                <span className="font-bold">Zalo:</span> 0348296773
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <div className="flex items-center gap-3 mb-6 text-blue-600">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Cấu hình Gemini API</h3>
            </div>

            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Để sử dụng ứng dụng, vui lòng nhập <strong>Gemini API Key</strong> của bạn. Key sẽ được lưu an toàn trong trình duyệt (LocalStorage).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Chưa có key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Lấy key miễn phí tại đây</a>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
