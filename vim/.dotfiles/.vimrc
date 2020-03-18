"Puggins
call plug#begin('~/.vim/plugged')
Plug'easymotion/vim-easymotion' "jump to word
Plug 'dikiaap/minimalist' "theme
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

" Εμφανίζει όλες τις επιλογές όταν κάνουμε χρήση το TAB.
set wildmenu

"Mouse scroll
set mouse=a

" Shortcut το esc.
inoremap jk <esc>
inoremap kj <esc>

"coc: fork of vscode
let g:coc_global_extensions = [ 'coc-eslint', 'coc-prettier', 'coc-tsserver', 'coc-css', 'coc-json', 'coc-html', 'coc-snippets']
"'coc-eslint': Πάντα εγκατάσταση local σε κάθε project

"nnn
let g:nnn#command = 'nnn -H'
let g:nnn#replace_netrw = 1 "Αντκατάσταση του default netrw"

"Buffers
set hidden "Για να φεύγω από unsaved buffer.:
nnoremap <Tab> :bnext<CR>
nnoremap <S-Tab> :bprevious<CR>
nnoremap <C-X> :bdelete<CR>

"fzf
"!: fullscreen
nmap <Leader>f :Files!<CR> 
nmap <Leader>b :Buffers<CR> 
"ctrl-x: horizontal split
"ctrl-v: vertical split
"ctrl-t: tab split
nmap <Leader>l :BLines<CR>
nmap <Leader>L :Lines<CR>
nmap <Leader>h :History<CR>
"nmap <Leader>t :BTags<CR>
nmap <Leader>m :Marks<CR>
nmap <Leader>s :Snippets<CR>
"nnn (default):<Leader>n 

"fzf: για να δείχνει κρυφά αρχεία και να αγνοεί .git και node_modules.
let $FZF_DEFAULT_COMMAND = 'ag --hidden --ignore node_modules --ignore .git --ignore *.swp -g ""'
let g:fzf_preview_window = 'right:60%'
