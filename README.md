KoreanTranscription
===================

A simple PHP page for transcribing Korean (in Hangul) to Cyrillic and Latin script.

Visit http://koreantranscription.ru/ to see it in work.

VirtualKeyboard
---------------

Last time I worked on this I was building a jQuery plugin which lets you input hangul syllables
on a virtual keyboard floating next to the input field.

Todo list:
- [ ] Bug: floating div for input in 'name' mode covers most of 'Go' button and makes it unclickable.
- [ ] Track `onKeyDown` events for input fields.
- [ ] Preserve virtual keyboard state (shown, hidden) after posting.
- [ ] Add enter button for multiline inputs (textarea).

Future objective:
- [ ]  Full client-side transcription. Current server-side transcription will be
  preserved in order to support agents with poor or absent javascript implementation.
