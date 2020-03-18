"ale
"Αν ενεργοποιηθεί έχει πρόβλημα το completion.
"let g:ale_linters = {
"      \   'javascript': ['eslint']
"\}
"let g:ale_fixers = {
"      \   'javascript': ['eslint']
"\}
"let g:ale_open_list = 0 "Να μην ανοίγει λίστα για σφάλματα
"let g:ale_list_window_size = 5
"let g:ale_lint_on_text_changed = 'never'
"let g:ale_lint_on_enter = 0
"let g:ale_lint_on_insert_leave = 0
"let g:ale_lint_on_save = 1 "default 1
"let g:ale_sign_column_always = 1
"let g:ale_sign_error = 'x'
"let g:ale_sign_warning = '!'
"let g:ale_set_highlights = 0 "να μην διαλέγει κείμενο στα σφάλματα
"highlight ALEErrorSign ctermbg=NONE ctermfg=red
"highlight ALEWarningSign ctermbg=NONE ctermfg=yellow
"nmap <silent> <C-k> <Plug>(ale_previous_wrap)
"nmap <silent> <C-j> <Plug>(ale_next_wrap)
"let g:ale_completion_enabled = 1 "Απαιτείται typescript nmp install
"
