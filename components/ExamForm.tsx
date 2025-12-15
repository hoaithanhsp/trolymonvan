import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Sparkles, BookOpen, Clock, GraduationCap, FileUp, Flame, School, Paperclip } from 'lucide-react';
import { ExamConfig } from '../types';

interface ExamFormProps {
  onSubmit: (config: ExamConfig) => void;
  isGenerating: boolean;
}

const LEVELS = {
  PRIMARY: 'Tiểu học',
  MIDDLE: 'THCS',
  HIGH: 'THPT'
};

const DATA = {
  [LEVELS.PRIMARY]: {
    grades: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
    times: ['40 phút', '50 phút', '60 phút'],
    trends: ['Gia đình & Nhà trường', 'Thế giới động vật', 'Thiên nhiên quanh em', 'Bài học đạo đức', 'Lễ hội quê hương', 'Tình bạn']
  },
  [LEVELS.MIDDLE]: {
    grades: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Tuyển sinh vào 10'],
    times: ['45 phút (1 tiết)', '90 phút (Học kỳ)', '120 phút (Vào 10)'],
    trends: ['Tự động (AI chọn)', 'Môi trường & Biến đổi khí hậu', 'AI, Công nghệ & Cuộc sống số', 'Giá trị Gia đình', 'Áp lực đồng trang lứa', 'Thần tượng & Giới trẻ']
  },
  [LEVELS.HIGH]: {
    grades: ['Lớp 10', 'Lớp 11', 'Lớp 12', 'Thi THPT Quốc Gia'],
    times: ['90 phút', '120 phút', '180 phút'],
    trends: ['Tự động (AI chọn)', 'Bản sắc văn hóa & Hội nhập', 'Khát vọng cống hiến', 'Thực thực & Sống ảo', 'Trí tuệ nhân tạo & Con người', 'Tư duy phản biện']
  }
};

const ExamForm: React.FC<ExamFormProps> = ({ onSubmit, isGenerating }) => {
  const [level, setLevel] = useState<string>(LEVELS.MIDDLE);
  const [gradeLevel, setGradeLevel] = useState(DATA[LEVELS.MIDDLE].grades[3]); // Default Lớp 9
  const [examType, setExamType] = useState(DATA[LEVELS.MIDDLE].times[1]);
  const [topic, setTopic] = useState('');
  const [trendingTopic, setTrendingTopic] = useState(DATA[LEVELS.MIDDLE].trends[0]);

  const [matrixContent, setMatrixContent] = useState('');
  const [specificationContent, setSpecificationContent] = useState('');
  const [uploadedTopicContent, setUploadedTopicContent] = useState(''); // Content from uploaded topic file

  const [specFileName, setSpecFileName] = useState<string | null>(null);
  const [matrixFileName, setMatrixFileName] = useState<string | null>(null);
  const [topicFileName, setTopicFileName] = useState<string | null>(null);

  const specFileInputRef = useRef<HTMLInputElement>(null);
  const matrixFileInputRef = useRef<HTMLInputElement>(null);
  const topicFileInputRef = useRef<HTMLInputElement>(null);

  // Update options when level changes
  useEffect(() => {
    const data = DATA[level];
    setGradeLevel(data.grades[0]);
    setExamType(data.times[Math.min(1, data.times.length - 1)]);
    setTrendingTopic(data.trends[0]);
  }, [level]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      level,
      gradeLevel,
      examType,
      topic,
      trendingTopic,
      matrixContent,
      specificationContent,
      uploadedTopicContent // Pass the uploaded content
    });
  };

  const handleSpecFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSpecFileName(file.name);
      setSpecificationContent(prev => prev || `[Đã đính kèm file đặc tả: ${file.name}]. Hệ thống sẽ ưu tiên sử dụng nội dung bạn dán vào ô văn bản để đảm bảo chính xác.`);
    }
  };

  const handleMatrixFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMatrixFileName(file.name);
      setMatrixContent(prev => prev || `[Đã đính kèm file ma trận: ${file.name}]. Hệ thống sẽ ưu tiên sử dụng nội dung bạn dán vào ô văn bản để đảm bảo chính xác.`);
    }
  };

  const handleTopicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTopicFileName(file.name);
      // Logic giả lập đọc file để đưa vào ngữ cảnh AI
      // Trong thực tế cần server-side parsing hoặc thư viện js pdf
      if (file.type === "application/pdf") {
        setUploadedTopicContent(`[NGỮ LIỆU ĐƯỢC CUNG CẤP TỪ FILE PDF: ${file.name}]. Hãy coi đây là văn bản chính để ra đề.`);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setUploadedTopicContent(`[NGỮ LIỆU TỪ FILE USER UPLOAD]:\n${text}`);
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">TRỢ LÝ MÔN VĂN PRO</h1>
        <p className="text-slate-600">Phát triển bởi Trần Hoài Thanh</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Level Selection Tabs */}
        <div className="flex border-b border-gray-200">
          {Object.values(LEVELS).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => !isGenerating && setLevel(lvl)}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${level === lvl
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Cấu hình chính */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <School className="w-4 h-4" /> Khối Lớp
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50"
              >
                {DATA[level].grades.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Clock className="w-4 h-4" /> Thời gian
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50"
              >
                {DATA[level].times.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Flame className="w-4 h-4 text-orange-500" /> {level === LEVELS.PRIMARY ? 'Chủ đề bài học' : 'Xu hướng / Chủ đề nóng'}
              </label>
              <select
                value={trendingTopic}
                onChange={(e) => setTrendingTopic(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-orange-50 text-orange-900 font-medium"
              >
                {DATA[level].trends.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Ghi chú thêm & Upload ngữ liệu */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <BookOpen className="w-4 h-4" /> Ghi chú thêm / Ngữ liệu cụ thể
              </label>
              <button
                type="button"
                onClick={() => topicFileInputRef.current?.click()}
                className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100 transition border border-indigo-200 font-medium"
              >
                <Paperclip className="w-3 h-3" /> {topicFileName ? 'Đổi ngữ liệu' : 'Tải ngữ liệu (PDF/Doc)'}
              </button>
              <input
                type="file"
                ref={topicFileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleTopicFileUpload}
              />
            </div>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={topicFileName ? `Đã chọn file: ${topicFileName}. Nhập thêm ghi chú nếu cần...` : "VD: Muốn đề tập trung vào tác phẩm cụ thể, hoặc yêu cầu đặc biệt..."}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition ${topicFileName ? 'border-indigo-300 bg-indigo-50 focus:ring-indigo-500' : 'border-slate-300 focus:ring-blue-500'}`}
              />
              {topicFileName && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-indigo-600 bg-white px-2 py-1 rounded border border-indigo-100 shadow-sm">
                  <FileText className="w-3 h-3" /> {topicFileName}
                </div>
              )}
            </div>
            {topicFileName && (
              <p className="text-xs text-indigo-600 italic">
                * Hệ thống sẽ ưu tiên sử dụng nội dung từ file <strong>{topicFileName}</strong> làm ngữ liệu ra đề.
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cột 1: Ma trận */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText className="w-4 h-4 text-blue-600" /> 1. Nội dung Ma trận
                </label>
                <button
                  type="button"
                  onClick={() => matrixFileInputRef.current?.click()}
                  className="text-xs flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition border border-blue-200 font-medium"
                >
                  <Upload className="w-3 h-3" /> {matrixFileName ? 'Đổi file' : 'Tải lên PDF'}
                </button>
                <input
                  type="file"
                  ref={matrixFileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleMatrixFileUpload}
                />
              </div>
              <div className="relative">
                <textarea
                  value={matrixContent}
                  onChange={(e) => setMatrixContent(e.target.value)}
                  rows={8}
                  placeholder={`Dán nội dung ma trận vào đây nếu có.\nNếu để trống, AI sẽ sử dụng Ma trận chuẩn của Bộ GD&ĐT cho cấp ${level}.`}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm font-mono bg-slate-50"
                />
              </div>
            </div>

            {/* Cột 2: Đặc tả */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileUp className="w-4 h-4 text-orange-600" /> 2. Bảng đặc tả kỹ thuật
                </label>
                <button
                  type="button"
                  onClick={() => specFileInputRef.current?.click()}
                  className="text-xs flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded hover:bg-orange-100 transition border border-orange-200 font-medium"
                >
                  <Upload className="w-3 h-3" /> {specFileName ? 'Đổi file' : 'Tải lên PDF'}
                </button>
                <input
                  type="file"
                  ref={specFileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleSpecFileUpload}
                />
              </div>

              <div className="relative">
                <textarea
                  value={specificationContent}
                  onChange={(e) => setSpecificationContent(e.target.value)}
                  rows={8}
                  placeholder={`Dán bảng đặc tả vào đây.\nAI sẽ phân tích để ra câu hỏi đúng mức độ nhận thức (NB/TH/VD/VDC).`}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-none text-sm font-mono bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${isGenerating
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'
                }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang Sinh Đề {level}...
                </span>
              ) : (
                "TẠO ĐỀ THI NGAY"
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              * Hệ thống sử dụng Knowledge Base {level} chuẩn 2024 để đảm bảo chất lượng.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamForm;
