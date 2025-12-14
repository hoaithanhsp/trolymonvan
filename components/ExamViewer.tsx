import React from 'react';
import { ExamData } from '../types';

interface ExamViewerProps {
  data: ExamData;
  className?: string;
}

const ExamViewer: React.FC<ExamViewerProps> = ({ data, className }) => {
  return (
    <div className={`bg-white shadow-none print:shadow-none p-8 min-h-[800px] border border-gray-200 print:border-none font-serif text-black leading-relaxed ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-gray-300 pb-4">
        <div className="text-center w-5/12">
          <p className="uppercase font-bold text-[13px]">PHÒNG GD&ĐT ....................</p>
          <p className="font-bold text-[13px]">TRƯỜNG THCS ....................</p>
          <div className="w-20 h-[1px] bg-black mx-auto my-1"></div>
        </div>
        <div className="text-center flex-1">
          <h2 className="uppercase font-bold text-[15px] mb-1">{data.examTitle}</h2>
          <p className="italic text-[13px]">Môn: Ngữ Văn</p>
          <p className="italic text-[13px]">Thời gian làm bài: {data.duration} (không kể thời gian giao đề)</p>
        </div>
      </div>

      {/* Content using DIV layout (no tables) */}
      <div className="space-y-6">
        {data.content.map((section, idx) => (
          <div key={idx} className="exam-section">
            <h3 className="exam-section-title">{section.section}</h3>
            
            {/* Reading Passage */}
            {section.text && (
              <div className="mb-6">
                <div className="italic mb-2 text-[14px]">Đọc đoạn trích sau và thực hiện các yêu cầu:</div>
                
                {/* Passage Box */}
                <div className="text-[14px] leading-relaxed mx-4 my-3">
                   <div 
                      className={`whitespace-pre-wrap ${section.text.includes('\n') ? '' : 'text-justify indent-8'}`} 
                    >
                      {section.text}
                    </div>
                </div>
                
                {section.source && (
                  <div className="text-right mr-8 italic text-[13px] font-semibold">
                    ({section.source})
                  </div>
                )}
              </div>
            )}

            {/* Questions using Div Layout */}
            <div className="space-y-2">
              {section.questions.map((q) => (
                <div key={q.id} className="exam-question text-[14px]">
                  {/* Header: Label + Point */}
                  <div className="exam-question-header">
                    <div className="flex items-baseline">
                      <span className="question-label">{q.id}</span>
                      <span className="question-points">({q.points.toFixed(1)} điểm)</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="question-content">
                    {q.text}
                    
                    {/* Sub-questions (a, b, c) */}
                    {q.parts && q.parts.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {q.parts.map((part, pIdx) => (
                          <div key={pIdx} className="sub-question flex items-start">
                             <span className="font-bold mr-2">{part.label}</span>
                             <div className="flex-1 text-justify">
                               {part.content}
                               {part.points && <span className="italic ml-1 font-semibold text-xs text-gray-600">({part.points} điểm)</span>}
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 text-[13px] italic text-gray-500">
        --- HẾT ---
        <br />
        Cán bộ coi thi không giải thích gì thêm.
      </div>
    </div>
  );
};

export default ExamViewer;