"Puggins
call plug#begin('~/.vim/plugged')
Plug 'liuchengxu/space-vim-theme'
Plug'easymotion/vim-easymotion' "jump to word
Plug 'sirver/ultisnips'
Plug 'honza/vim-snippets'
Plug 'junegunn/fzf', { 'do': './install --bin' }
Plug 'junegunn/fzf.vim'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'mcchrish/nnn.vim'
Plug 'jiangmiao/auto-pairs'
Plug 'liuchengxu/vim-which-key'
Plug 'voldikss/vim-floaterm'
call plug#end()

"leader key: space.
let mapleader=" "

"Εμφάνιση.
set t_Co=256
syntax on
" Theme
" Μου αρέσει γιατί χρωματίζει σωστά το vim-which-key.
" Είναι και ο δημιουργός του vim-which-key.
colorscheme space_vim_theme
set background=dark

" wrap type
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

" Register which key map
call which_key#register('<Space>', "g:which_key_map")

" Map leader to which_key
nnoremap <silent> <leader> :<c-u>WhichKey '<Space>'<CR>
vnoremap <silent> <leader> :<c-u>WhichKeyVisual '<Space>'<CR>

set timeoutlen=500

" Create map to add keys to
let g:which_key_map =  {}

"vim
let g:which_key_map.v = {
      \ 'name' : '+vim' ,
      \ 'n' : [':set number!'     , 'toggle Number'],
      \ 'r' : [':set relativenumber!'     , 'toggle Relative number'],
      \ 's' : [':source ~/.vimrc'     , 'source .vimrc'],
      \ 'u' : [':PlugUpdate'     , 'update plugins'],
      \ 'w' : [':set wrap!'     , 'wrap lines'],
      \ 't' : [':Colors'       , 'themes'],
      \ 'd' : [':set background=dark'     , 'dark theme'],
      \ 'l' : [':set background=light'     , 'light theme'],
      \ 'g' : [':PlugUpgrade'     , 'upGrade plugin manager']
      \ }

" coc
let g:coc_global_extensions = [ 'coc-eslint', 'coc-prettier', 'coc-tsserver', 'coc-css', 'coc-json', 'coc-html', 'coc-snippets', 'coc-sh']
"'coc-eslint': Πάντα εγκατάσταση local σε κάθε project
let g:which_key_map.c = {
      \ 'name' : '+coc' ,
      \ 'e' : [':CocEnable'     , 'enable'],
      \ 'd' : [':CocDisable'     , 'disable']
      \ }

"nnn
"Disable default mappings. Για να δηλώσω το key mapping από το which key
let g:nnn#set_default_mappings = 0
let g:nnn#command = 'nnn -H'
"let g:nnn#replace_netrw = 1 "Αντκατάσταση του default netrw"
let g:which_key_map['n'] = [':NnnPicker %:p:h', 'nnn'] " %:p:h -> file's directory 

"buffers
set hidden "Για να φεύγω από unsaved buffer.:
nnoremap <Tab> :bnext<CR>
nnoremap <S-Tab> :bprevious<CR>
nnoremap <C-X> :bdelete<CR>
let g:which_key_map.b = {
      \ 'name' : '+buffers' ,
      \ 'l' : [':Buffers'     , 'list'],
      \ 's' : [':Lines'       , 'search'],
      \ 'n' : [':bnext'       , 'next'],
      \ 'p' : [':bprevious'       , 'previous'],
      \ 'o' : [':Files!'       , 'open'],
      \ 'x' : [':bdelete'       , 'eXit']
      \ }

" fzf: για να δείχνει κρυφά αρχεία και να αγνοεί .git και node_modules.
let $FZF_DEFAULT_COMMAND = 'ag --hidden --ignore node_modules --ignore .git --ignore *.swp -g ""'
let g:fzf_preview_window = 'up:70%'
"let g:fzf_layout = {'up':'~90%', 'window': { 'width': 0.8, 'height': 0.8,'yoffset':0.5,'xoffset': 0.5, 'highlight': 'Todo', 'border': 'sharp' } }
let g:fzf_layout = { 'window': { 'width': 1, 'height': 1} }
let g:which_key_map.f = {
      \ 'name' : '+fzf' ,
      \ 'f' : [':Files!'     , 'files'],
      \ 'w' : [':Windows'     , 'windows'],
      \ 'b' : [':Buffers'     , 'buffers'],
      \ 'l' : [':BLines'       , 'lines of buffer'],
      \ 'L' : [':Lines'       , 'lines of buffers'],
      \ 's' : [':Snippets'       , 'snippets'],
      \ 't' : [':Colors'       , 'themes'],
      \ 'h' : [':History'       , 'history']
      \ }
