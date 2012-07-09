KoreanTranscription
===================

A simple PHP page for transcribing Korean (in Hangul) to Cyrillic and Latin script.

Visit http://ob-ivan.ru/korean/ to see it in work.

VirtualKeyboard
---------------

I am currently building a jQuery plugin which lets you input hangul syllables
on a virtual keyboard floating next to the input field.

Todo list:
- Track `onKeyDown` events for input fields.
- Depress shift button if it had been pressed with a click, not keydown event.
- Preserve virtual keyboard state (shown, hidden) after posting.

Future objective:
- Full client-side transcription. Current server-side transcription will be
  preserved in order to support agents with poor or absent javascript implementation.
