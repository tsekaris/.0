"Puggins
call plug#begin('~/.vim/plugged')
Plug'easymotion/vim-easymotion' "jump to word
Plug 'dikiaap/minimalist' "theme
"Plug 'scrooloose/nerdtree'
"Plug 'w0rp/ale'
Plug 'sirver/ultisnips'
Plug 'honza/vim-snippets'
Plug 'junegunn/fzf', { 'do': './install --bin' }
Plug 'junegunn/fzf.vim'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'mcchrish/nnn.vim'
Plug 'jiangmiao/auto-pairs'
call plug#end()

"leader key: space.
let mapleader=" "

"Αρίθμηση
set number
set relativenumber

"Copy to system clipboard
set clipboard=unnamedplus

"Εμφάνιση.
set t_Co=256
syntax on
colorscheme minimalist

"wrap lines
set lbr!

"Tab: 2 spaces.
set tabstop=2
set shiftwidth=2
set expandtab

"Ελληνικά με control-6.
"set keymap=greek_utf-8
"set iminsert=0
"set imsearch=-1

"Search down into subfolders
"Provides tab-completion for all file-related tasks
"Fuzzy search χωρίς plugin. :find και tab
set path+=**

" Εμφανίζει όλες τις επιλογές όταν κάνουμε χρήση το TAB.
set wildmenu

"Mouse scroll
set mouse=a

" Shortcut το esc.
inoremap jk <esc>
inoremap kj <esc>

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
let g:coc_global_extensions = [ 'coc-eslint', 'coc-prettier', 'coc-tsserver', 'coc-css', 'coc-json', 'coc-html', 'coc-snippets']

let g:nnn#command = 'nnn -H'
let g:nnn#replace_netrw = 1

"Buffers
set hidden "Για να φεύγω από unsaved buffer.:
nnoremap <Tab> :bnext<CR>
nnoremap <S-Tab> :bprevious<CR>
nnoremap <C-X> :bdelete<CR>

"fzf
nmap <Leader>f :Files<CR>
nmap <Leader>b :Buffers<CR>
nmap <Leader>l :BLines<CR>
nmap <Leader>L :Lines<CR>
"nmap <Leader>h :History<CR>
"nmap <Leader>t :BTags<CR>
"nmap <Leader>' :Marks<CR>
nmap <Leader>s :Snippets<CR>
"nnn (default):<Leader>n 

"fzf: για να δείχνει κρυφά αρχεία και να αγνοεί .git και node_modules.
let $FZF_DEFAULT_COMMAND = 'ag --hidden --ignore node_modules --ignore .git --ignore *.swp -g ""'
let g:fzf_preview_window = 'right:60%'
