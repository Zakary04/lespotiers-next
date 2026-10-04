import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  text: string | null | undefined;
  className?: string;
  containerClassName?: string;
}

// Rend un texte saisi dans l'admin en respectant ses paragraphes :
// une ligne vide sépare deux <p>, un retour à la ligne simple est conservé.
export default function FormattedText({ text, className, containerClassName = 'space-y-4' }: Props) {
  if (!text || !text.trim()) return null;

  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className={containerClassName}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={cn('whitespace-pre-line', className)}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
