import $ from 'jquery';
import {parseCode,start} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector=$('#inputVector').val();
        let inpvec=parseCode(inputVector);
        let parsedCode = parseCode(codeToParse);
        let lines =start(parsedCode,inpvec);
        //$('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        write(lines);
    });
});

function write(lines) {
    let str='';
    //let strcolor=''
    for (let i = 0; i <lines.length ; i++) {
        if(lines[i]!='~'){
            str=str+forGreenRed(lines[i])+'</br>';

        }
    }
    $('#parsedCode').html(str);
}


function forGreenRed(line) {
    if(line.indexOf('@')==0&&!line.includes('while')){
        line=''+line.substring(1);
        line=line.split('<').join(' < ');
        return '<a style="background-color:green;">'+line.split(' ').join('&nbsp ')+'</a>';
    }
    else if(line.indexOf('!')==0&&!line.includes('while')){
        line=''+line.substring(1);
        line=line.split('<').join(' < ');
        return '<a style="background-color:red;">'+line.split(' ').join('&nbsp ')+'</a>';
    }
    else {
        return forGreenRed2(line);
    }
}

function forGreenRed2(line) {
    if(line.includes('while')){
        line=''+line.substring(1);
        line=line.split('<').join(' < ');
        return '<a>'+line.split(' ').join('&nbsp ')+'</a>';
    }
    else{
        return '<a>'+line.split(' ').join('&nbsp ')+'</a>';
    }
}