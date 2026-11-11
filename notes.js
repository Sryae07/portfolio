/* Keyword filter for the notes list.
   No storage, no server, no dependencies: the notes are already in the page,
   this only decides which ones are visible. */

(function () {
  'use strict';

  function init() {
    var input = document.getElementById('filter-input');
    var form = document.getElementById('filter-form');
    var list = document.getElementById('note-list');
    var out = document.getElementById('filter-out');

    if (!input || !list || !out) {
      return;
    }

    var notes = Array.prototype.slice.call(list.querySelectorAll('.note'));
    var total = notes.length;

    /* Search the visible text and the hidden keyword list together, so a note can
       be found by a word it does not literally use on screen. */
    function haystack(note) {
      var text = (note.textContent || '').toLowerCase();
      var keys = (note.getAttribute('data-keywords') || '').toLowerCase();
      return text + ' ' + keys;
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var words = query.split(/\s+/).filter(Boolean);
      var shown = 0;

      notes.forEach(function (note) {
        var text = haystack(note);
        var match = words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
        note.classList.toggle('is-hidden', !match);
        if (match) {
          shown += 1;
        }
      });

      if (shown === total) {
        out.textContent = 'Showing all ' + total + ' notes.';
      } else if (shown === 0) {
        out.textContent = 'No notes match "' + input.value.trim() + '". Try a broader word.';
      } else {
        out.textContent = 'Showing ' + shown + ' of ' + total + ' notes.';
      }
    }

    input.addEventListener('input', apply);

    if (form) {
      form.addEventListener('reset', function () {
        /* Reset fires before the field is cleared, so wait one frame. */
        window.setTimeout(apply, 0);
      });
    }

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
