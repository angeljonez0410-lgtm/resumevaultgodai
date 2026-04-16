import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Check, FileDown, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';

export default function OutputCard({ title, content, icon: Icon, filename = 'document' }) {
  const [copied, setCopied] = useState(false);

  const extractSection1 = (text) => {
    const section1Match = text.match(/SECTION 1: ATS OPTIMIZED RESUME\n([\s\S]+?)(?=\n\nSECTION 2:|$)/i);
    return section1Match ? section1Match[1].trim() : text;
  };

  const handleCopy = () => {
    const section1Only = extractSection1(content);
    navigator.clipboard.writeText(section1Only);
    setCopied(true);
    toast.success("Copied resume to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDFDownload = () => {
    const section1Only = extractSection1(content);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 18;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    const addPage = () => { doc.addPage(); y = margin; };

    const lines = section1Only.split('\n');
    lines.forEach(line => {
      if (y > 275) addPage();

      if (line.startsWith('# ')) {
        doc.setFontSize(17); doc.setFont('helvetica', 'bold');
        const t = doc.splitTextToSize(line.slice(2), pageWidth);
        doc.text(t, margin, y); y += t.length * 8 + 3;
      } else if (line.startsWith('## ')) {
        doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        const t = doc.splitTextToSize(line.slice(3), pageWidth);
        // draw underline
        doc.text(t, margin, y);
        doc.setLineWidth(0.3);
        doc.line(margin, y + 1, margin + pageWidth, y + 1);
        y += t.length * 6.5 + 3;
      } else if (line.startsWith('### ')) {
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        const t = doc.splitTextToSize(line.slice(4), pageWidth);
        doc.text(t, margin, y); y += t.length * 6 + 2;
      } else if (line.match(/^[-*] /)) {
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        const clean = line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
        const t = doc.splitTextToSize('• ' + clean, pageWidth - 5);
        if (y + t.length * 5.5 > 275) addPage();
        doc.text(t, margin + 4, y); y += t.length * 5.5;
      } else if (line.trim() === '') {
        y += 2.5;
      } else {
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        const clean = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
        const t = doc.splitTextToSize(clean, pageWidth);
        if (y + t.length * 5.5 > 275) addPage();
        doc.text(t, margin, y); y += t.length * 5.5;
      }
    });

    doc.save(`${filename}.pdf`);
    toast.success("Downloaded as PDF");
  };

  const handleWordDownload = () => {
    const section1Only = extractSection1(content);
    const htmlLines = section1Only.split('\n').map(line => {
      const bold = (s) => s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
      if (line.startsWith('# ')) return `<h1>${bold(line.slice(2))}</h1>`;
      if (line.startsWith('## ')) return `<h2>${bold(line.slice(3))}</h2>`;
      if (line.startsWith('### ')) return `<h3>${bold(line.slice(4))}</h3>`;
      if (line.match(/^[-*] /)) return `<li>${bold(line.slice(2))}</li>`;
      if (line.trim() === '') return '<br/>';
      return `<p>${bold(line)}</p>`;
    }).join('\n');

    const wordDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 1in; line-height: 1.4; }
        h1 { font-size: 20pt; font-weight: bold; margin-bottom: 4pt; }
        h2 { font-size: 14pt; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 2pt; margin-top: 12pt; }
        h3 { font-size: 11pt; font-weight: bold; margin-top: 8pt; }
        p { margin: 3pt 0; }
        li { margin: 2pt 0; }
        ul { margin: 4pt 0; padding-left: 18pt; }
      </style></head><body>${htmlLines}</body></html>`;

    const blob = new Blob(['\ufeff', wordDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as Word document");
  };

  if (!content) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-amber-600" />}
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-slate-500 hover:text-slate-800 text-xs gap-1.5">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePDFDownload} className="text-slate-600 hover:text-red-600 hover:border-red-300 text-xs gap-1.5">
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleWordDownload} className="text-slate-600 hover:text-blue-600 hover:border-blue-300 text-xs gap-1.5">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Word</span>
          </Button>
        </div>
      </div>
      <div className="p-6 prose prose-sm prose-slate max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold text-slate-800 mt-4 mb-2 border-b border-slate-200 pb-1">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold text-slate-700 mt-3 mb-1">{children}</h3>,
            p: ({ children }) => <p className="text-slate-600 leading-relaxed my-2">{children}</p>,
            ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 my-2">{children}</ul>,
            li: ({ children }) => <li className="text-slate-600">{children}</li>,
            strong: ({ children }) => <strong className="text-slate-800 font-semibold">{children}</strong>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}