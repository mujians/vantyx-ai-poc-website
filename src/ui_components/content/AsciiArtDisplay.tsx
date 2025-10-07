import React, { useEffect, useState } from 'react';
import figlet from 'figlet';

interface AsciiArtDisplayProps {
  text?: string;
  art?: string;
  font?: string;
  className?: string;
  preset?: keyof typeof PRESET_ASCII_ART;
}

// Set di ASCII art predefinite
const PRESET_ASCII_ART = {
  logo: `
 __      __         _
 \\ \\    / /        | |
  \\ \\  / /_ _ _ __ | |_ _   ___  __
   \\ \\/ / _\` | '_ \\| __| | | \\ \\/ /
    \\  / (_| | | | | |_| |_| |>  <
     \\/ \\__,_|_| |_|\\__|\\__, /_/\\_\\
                         __/ |
                        |___/
  `,
  ai: `
     _    ___
    / \\  |_ _|
   / _ \\  | |
  / ___ \\ | |
 /_/   \\_\\___|
  `,
  rocket: `
       /\\
      /  \\
     |    |
    /|VTX|\\
   / |    | \\
  /__|    |__\\
     |    |
    /|    |\\
   / |    | \\
  /  |____|  \\
 /____________\\
  `,
  cloud: `
        .-~~~-.
.- ~ ~-(       )_ _
/                     ~ -.
|                           \\
 \\                         .'
   ~- . _____________ . -~
  `,
  innovation: `
   ___                       _   _
  |_ _|_ __  _ __   _____   __ _| |_(_) ___ _ __
   | || '_ \\| '_ \\ / _ \\ \\ / / _\` | __| |/ _ \\ '_ \\
   | || | | | | | | (_) \\ V / (_| | |_| | (_) | | |
  |___|_| |_|_| |_|\\___/ \\_/ \\__,_|\\__|_|\\___/|_| |
  `,
  arrow: `
         ^
        / \\
       /   \\
      /     \\
     /       \\
    /---------\\
   /           \\
  /             \\
 /               \\
------------------->
  `
} as const;

export const AsciiArtDisplay: React.FC<AsciiArtDisplayProps> = ({
  text,
  art,
  font = 'Standard',
  className = '',
  preset
}) => {
  const [generatedArt, setGeneratedArt] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (text) {
      try {
        figlet.text(text, { font: font as any }, (err, data) => {
          if (err) {
            setError('Error generating ASCII art');
            console.error(err);
            return;
          }
          setGeneratedArt(data || '');
        });
      } catch (err) {
        setError('Error generating ASCII art');
        console.error(err);
      }
    }
  }, [text, font]);

  // Determina quale ASCII art visualizzare in ordine di priorità
  const displayArt = preset
    ? PRESET_ASCII_ART[preset]
    : text
    ? generatedArt
    : art;

  if (error) {
    return (
      <div className={`text-red-500 ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <pre className={`font-mono whitespace-pre overflow-x-auto ${className}`}>
      {displayArt}
    </pre>
  );
};
