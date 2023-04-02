if exists('g:loaded_ddu_source_vim_variable')
    finish
endif

let g:loaded_ddu_source_vim_variable = 1

function ddu#source#vim_variable#_execute(arg) abort
    return execute(a:arg)
endfunction
