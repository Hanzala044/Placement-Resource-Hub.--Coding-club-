"use client";

import { button } from "@/lib/ui";
import { DownloadIcon } from "lucide-react";

interface PdfExportButtonProps {
  title: string;
  rounds: string;
  content: string;
  author: string;
}

export function PdfExportButton({ title, rounds, content, author }: PdfExportButtonProps) {
  async function handleDownload() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    
    // Title
    const titleLines = doc.splitTextToSize(title, 170);
    doc.text(titleLines, 20, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`By: ${author || "Anonymous"}`, 20, 20 + (titleLines.length * 10));

    let y = 30 + (titleLines.length * 10);

    // Rounds
    doc.setFont("helvetica", "bold");
    doc.text("Rounds Summary:", 20, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    // Parse rounds if JSON
    let parsedRounds = "";
    try {
      if (rounds && rounds.startsWith("{")) {
        const p = JSON.parse(rounds);
        parsedRounds = `Round 1 (OA): ${p.round1}\n\nRound 2 (Tech): ${p.round2}\n\nRound 3 (HR): ${p.round3}`;
      } else {
        parsedRounds = rounds;
      }
    } catch {
      parsedRounds = rounds;
    }

    const roundLines = doc.splitTextToSize(parsedRounds || "No rounds provided", 170);
    doc.text(roundLines, 20, y);
    
    y += (roundLines.length * 7) + 10;

    // Full Content
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text("Full Experience:", 20, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const contentLines = doc.splitTextToSize(content || "", 170);
    
    contentLines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });

    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  }

  return (
    <button onClick={handleDownload} className={button.secondary + " w-full flex justify-center items-center gap-2"}>
      <DownloadIcon width={16} height={16} />
      Export to PDF
    </button>
  );
}
